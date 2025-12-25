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


// Configure longer timeout for Vercel (default is 10s or 15s)
export const maxDuration = 60; // Set to 60s (max for Hobby/Pro default). 
export const dynamic = 'force-dynamic';

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
            log(`\n🔹 [ÉTAPE 1/5] Récupération du SERP pour : "${keyword}"...`);
            console.time('serp-fetch');
            context = await fetchSerpResults(keyword, config.valueSerpApiKey);
            console.timeEnd('serp-fetch');
            log(`✅ [ÉTAPE 1/5] SERP récupéré (Taille contexte: ${context.length} chars)`);
        } else {
            log(`⏩ [ÉTAPE 1/5] Mode Image : Pas de scrap SERP.`);
        }

        // Handle "Image Only" Generation
        if (generationType === 'image') {
            log(`\n🔹 [MODE IMAGE] Démarrage génération image seule...`);
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
                    log('[API] Génération du prompt MOCKUP...');
                    prompt = `#Rôle
Tu es un ingénieur en prompt spécialisé dans la création de briefs de génération d’images documentaires de style smartphone.

#Instructions
Utilise Image 1 comme photo de base (verrouille tout : personnes, visage, cheveux, tenue, couleurs, arrière-plan, cadrage, netteté, grain, lumière — aucune altération). Utilise Image 2 comme logo maître et respecte-le à 100% pixel-perfect : mêmes proportions, formes, couleurs, contours, aucun redraw/interprétation/simplification, aucune recoloration, aucune retouche, aucune perte de détails. Seul traitement autorisé : détourage alpha propre si nécessaire, sans modifier le graphisme. Applique le logo sur le vêtement à ${mockupLocation || 'Cœur'} avec ${mockupSize || 'taille standard'}/${mockupAlignment || 'alignement naturel'}. Rendu sérigraphie ultra réaliste : le logo imprimé doit se caler précisément sur les plis et s’y adapter sans aucun décalage (warp 3D continu et exact qui suit chaque pli/creux/bosse, avec alignement stable sur la surface du tissu ; pas de glissement, pas d’offset entre le logo et les plis). Utilise une carte de déformation du tissu : le logo doit épouser la tension, les coutures et la perspective, avec occlusion légère dans les creux si nécessaire. Intégration physique : micro-texture fibres, légère irrégularité d’encre, opacité réaliste, ombres/reflets identiques à la scène. Zéro halo, zéro bord blanc, zéro effet sticker. Sortie : 1 image finale STRICTEMENT identique à Image 1 en format, ratio et dimensions pixels, sans redimensionnement, sans recadrage, sans marges, sans texte/watermark, et propre à 200% zoom.

#Informations Précises
Qualité d’appareil photo numérique avec ses imperfections naturelles. Esthétique brute et non retouchée de photographie, grain naturel, conditions d’éclairage authentiques. profondeur de champ réaliste d’un appareil numérique. Aucun éclairage ni composition professionnelle, style purement documentaire comme pris par quelqu’un avec son téléphone. Décor totalement spontané et réaliste. Le moment doit paraître totalement authentique et non scénarisé. La texture de la peau doit etre ultra naturelle et ne pas faire poupée de cire`;

                    if (mockupBaseImageUrl) imageInputUrls.push(mockupBaseImageUrl);
                    if (mockupLogoImageUrl) imageInputUrls.push(mockupLogoImageUrl);

                    if (imageInputUrls.length < 2) {
                        return NextResponse.json({ error: 'Pour un mockup, veuillez fournir l\'URL de l\'image de base ET celle du logo.' }, { status: 400 });
                    }
                } else {
                    // STANDARD GENERATION
                    log('🎨 [IMAGE] Génération du prompt pour image standard...');
                    prompt = await generateImagePrompt(keyword, context, config.anthropicApiKey, imagePrompt);
                    log(`✅ [IMAGE] Prompt généré: ${prompt.substring(0, 50)}...`);
                }

                log(`🎨 [IMAGE] Envoi requête Seedream (${imageFormat})...`);
                console.time('seedream-gen');
                const generatedImageUrl = await generateImage(prompt, config.seedreamApiKey, imageFormat, imageInputUrls);
                console.timeEnd('seedream-gen');

                log(`✅ [IMAGE] Image générée avec succès : ${generatedImageUrl}`);

                return NextResponse.json({
                    imageUrl: generatedImageUrl,
                    content: null, // No text content
                    imageError: null
                });

            } catch (imgError) {
                console.error('❌ [ERREUR IMAGE]', imgError);
                return NextResponse.json({ error: imgError.message || 'Erreur génération image' }, { status: 500 });
            }
        }

        // --- Standard Article Generation Flow (Text + Optional Image) ---

        // 2️⃣ Optional image generation
        let generatedImageUrl = '';
        let imageGenerationError = null;
        if (config.seedreamApiKey && shouldGenerateImage) {
            try {
                log('\n🔹 [ÉTAPE 2/5] Préparation Image...');
                log('🎨 Génération du prompt image...');
                const prompt = await generateImagePrompt(keyword, context, config.anthropicApiKey);
                log('🎨 Génération de l\'image (Seedream)...');
                console.time('image-gen-std');
                generatedImageUrl = await generateImage(prompt, config.seedreamApiKey);
                console.timeEnd('image-gen-std');
                log(`✅ [ÉTAPE 2/5] Image OK : ${generatedImageUrl}`);
            } catch (imgError) {
                console.error('⚠️ Erreur génération image (non bloquant):', imgError);
                imageGenerationError = imgError.message;
            }
        } else {
            log('\n⏩ [ÉTAPE 2/5] Image sautée (non demandée ou clé manquante).');
        }

        // 3️⃣ First article generation
        log('\n🔹 [ÉTAPE 3/5] Rédaction du contenu (Claude)...');
        log(`📝 Paramètres: Tone=${tone}, Length=${length}`);
        console.time('text-gen-1');
        const firstHtml = await generateArticle(
            { keyword, tone, brief, url, anchor, context, length, includeAuthorityLink },
            config.anthropicApiKey
        );
        console.timeEnd('text-gen-1');
        log(`✅ [ÉTAPE 3/5] Premier brouillon généré (${firstHtml.length} chars).`);

        // 4️⃣ Rewrite step (second pass)
        log('\n🔹 [ÉTAPE 4/5] Optimisation & Réécriture...');
        let rewrittenHtml = '';
        let rewriteError = null;
        try {
            console.time('text-rewrite');
            rewrittenHtml = await rewriteContent(firstHtml, length, config.anthropicApiKey);
            console.timeEnd('text-rewrite');
            log(`✅ [ÉTAPE 4/5] Contenu final optimisé (${rewrittenHtml.length} chars).`);
        } catch (err) {
            console.error('❌ Erreur réécriture:', err);
            rewriteError = err.message;
            rewrittenHtml = firstHtml; // fallback to original content
            log('⚠️ Fallback sur le premier brouillon.');
        }

        // 5️⃣ Respond to client
        log('\n🎉 [ÉTAPE 5/5] Terminée ! Envoi de la réponse au client.');
        return NextResponse.json({
            content: rewrittenHtml,
            imageUrl: generatedImageUrl,
            imageError: imageGenerationError,
            rewriteError: rewriteError,
        });
    } catch (error) {
        console.error('❌ [API ERROR FATAL]:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne serveur' }, { status: 500 });
    }
}
