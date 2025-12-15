import { NextResponse } from 'next/server';
import { verifyToken } from '../../../utils/auth';
import { fetchSerpResults } from '../../../services/serp';
import { generateImagePrompt, generateImage, generateArticle, rewriteContent } from '../../../services/ai';

// Simple in-memory rate limiting (for production, use @upstash/ratelimit with Redis)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip) {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (now > record.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return false;
    }

    record.count++;
    return true;
}

/**
 * POST /api/generate
 * Handles content generation: SERP fetch, optional image generation, article generation, and article rewrite.
 */
export async function POST(request) {
    // Collect logs for front‑end visibility
    const logs = [];
    const log = (msg) => { logs.push(msg); console.log(msg); };

    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Trop de requêtes. Veuillez patienter avant de réessayer.' },
                { status: 429 }
            );
        }

        // Load configuration from environment variables
        const config = {
            accessToken: process.env.ACCESS_TOKEN,
            valueSerpApiKey: process.env.VALUESERP_API_KEY,
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
            seedreamApiKey: process.env.SEEDREAM_API_KEY,
        };

        // Validate required env vars
        if (!config.accessToken || !config.valueSerpApiKey || !config.anthropicApiKey) {
            console.error('Missing required environment variables', {
                hasAccessToken: !!config.accessToken,
                hasSerpKey: !!config.valueSerpApiKey,
                hasAnthropicKey: !!config.anthropicApiKey,
            });
            return NextResponse.json(
                { error: "Configuration serveur incomplète (Variables d'environnement manquantes)." },
                { status: 500 }
            );
        }

        // Authenticate request
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Accès refusé : Token manquant' }, { status: 401 });
        }
        const userToken = authHeader.split(' ')[1];
        if (!verifyToken(userToken, config.accessToken)) {
            return NextResponse.json({ error: 'Accès interdit : Identifiants invalides' }, { status: 403 });
        }

        // Parse request body
        const body = await request.json();
        const {
            keyword,
            anchor,
            url,
            tone,
            brief,
            length,
            includeAuthorityLink,
            generateImage: shouldGenerateImage,
            // New parameters for Image Tab
            generationType, // 'text' (default) or 'image'
            imagePrompt,
            imageFormat,
            isMockup // Extract isMockup early for validation logic
        } = body;

        // Input validation
        // Skip keyword validation for Mockup Image Generation
        if (!(generationType === 'image' && isMockup)) {
            if (!keyword || typeof keyword !== 'string') {
                return NextResponse.json({ error: 'Mot-clé manquant ou invalide' }, { status: 400 });
            }
            if (keyword.length > 200) {
                return NextResponse.json({ error: 'Mot-clé trop long (max 200 caractères)' }, { status: 400 });
            }
        }
        if (url && typeof url === 'string' && url.length > 0) {
            try {
                new URL(url);
            } catch {
                return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
            }
        }

        // 1️⃣ Fetch SERP context (ONLY if not Image Only mode)
        let context = "";
        if (generationType !== 'image') {
            log(`[API] Récupération du SERP pour le mot‑clé: ${keyword}`);
            context = await fetchSerpResults(keyword, config.valueSerpApiKey);
            log('[API] Étape 1 – Analyse du contenu du scrap');
        } else {
            log(`[API] Mode Image : Pas de scrap SERP.`);
        }

        // Handle "Image Only" Generation
        if (generationType === 'image') {
            if (!config.seedreamApiKey) {
                return NextResponse.json({ error: 'API Key Seedream manquante.' }, { status: 500 });
            }

            try {
                let prompt = "";
                const {
                    isMockup,
                    mockupLocation,
                    mockupSize,
                    mockupAlignment,
                    mockupBaseImageUrl,
                    mockupLogoImageUrl
                } = body;

                let imageInputUrls = [];

                if (isMockup) {
                    // MOCKUP SPECIFIC PROMPT CONSTRUCTION
                    console.log('[API] Generating MOCKUP prompt...');
                    prompt = `Utilise Image 1 comme photo de base (verrouille tout : personnes, visage, cheveux, tenue, couleurs, arrière-plan, cadrage, netteté, grain, lumière — aucune altération). Utilise Image 2 comme logo maître et respecte-le à 100% pixel-perfect : mêmes proportions, formes, couleurs, contours, aucun redraw/interprétation/simplification, aucune recoloration, aucune retouche, aucune perte de détails. Seul traitement autorisé : détourage alpha propre si nécessaire, sans modifier le graphisme. Applique le logo sur le vêtement à ${mockupLocation || 'Cœur'} avec ${mockupSize || 'taille standard'}/${mockupAlignment || 'alignement naturel'}. Rendu sérigraphie ultra réaliste : le logo imprimé doit se caler précisément sur les plis et s’y adapter sans aucun décalage (warp 3D continu et exact qui suit chaque pli/creux/bosse, avec alignement stable sur la surface du tissu ; pas de glissement, pas d’offset entre le logo et les plis). Utilise une carte de déformation du tissu : le logo doit épouser la tension, les coutures et la perspective, avec occlusion légère dans les creux si nécessaire. Intégration physique : micro-texture fibres, légère irrégularité d’encre, opacité réaliste, ombres/reflets identiques à la scène. Zéro halo, zéro bord blanc, zéro effet sticker. Sortie : 1 image finale STRICTEMENT identique à Image 1 en format, ratio et dimensions pixels, sans redimensionnement, sans recadrage, sans marges, sans texte/watermark, et propre à 200% zoom.`;

                    if (mockupBaseImageUrl) imageInputUrls.push(mockupBaseImageUrl);
                    if (mockupLogoImageUrl) imageInputUrls.push(mockupLogoImageUrl);

                    if (imageInputUrls.length < 2) {
                        return NextResponse.json({ error: 'Pour un mockup, veuillez fournir l\'URL de l\'image de base ET celle du logo.' }, { status: 400 });
                    }
                } else {
                    // STANDARD GENERATION
                    console.log('[API] Generating standard image prompt with instructions...');
                    prompt = await generateImagePrompt(keyword, context, config.anthropicApiKey, imagePrompt);
                }

                console.log(`[API] Generating image (${imageFormat})...`);
                const generatedImageUrl = await generateImage(prompt, config.seedreamApiKey, imageFormat, imageInputUrls);

                return NextResponse.json({
                    imageUrl: generatedImageUrl,
                    content: null, // No text content
                    imageError: null
                });

            } catch (imgError) {
                console.error('Erreur génération image (mode unique):', imgError);
                return NextResponse.json({ error: imgError.message || 'Erreur génération image' }, { status: 500 });
            }
        }

        // --- Standard Article Generation Flow (Text + Optional Image) ---

        // 2️⃣ Optional image generation
        let generatedImageUrl = '';
        let imageGenerationError = null;
        if (config.seedreamApiKey && shouldGenerateImage) {
            try {
                console.log('[API] Generating image prompt...');
                const prompt = await generateImagePrompt(keyword, context, config.anthropicApiKey);
                console.log('[API] Generating image...');
                generatedImageUrl = await generateImage(prompt, config.seedreamApiKey);
            } catch (imgError) {
                console.error('Erreur génération image:', imgError);
                imageGenerationError = imgError.message;
            }
        }

        // 3️⃣ First article generation
        console.log('[API] Étape 2 – Génération du contenu...');
        const firstHtml = await generateArticle(
            { keyword, tone, brief, url, anchor, context, length, includeAuthorityLink },
            config.anthropicApiKey
        );

        // 4️⃣ Rewrite step (second pass)
        console.log('[API] Étape 3 – Réécriture du contenu...');
        let rewrittenHtml = '';
        let rewriteError = null;
        try {
            rewrittenHtml = await rewriteContent(firstHtml, length, config.anthropicApiKey);
        } catch (err) {
            console.error('Erreur lors de la réécriture de l\'article:', err);
            rewriteError = err.message;
            rewrittenHtml = firstHtml; // fallback to original content
        }

        // 5️⃣ Respond to client
        return NextResponse.json({
            content: rewrittenHtml,
            imageUrl: generatedImageUrl,
            imageError: imageGenerationError,
            rewriteError: rewriteError,
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne serveur' }, { status: 500 });
    }
}
