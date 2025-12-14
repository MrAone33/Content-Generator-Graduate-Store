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
            imageFormat
        } = body;

        // Input validation
        if (!keyword || typeof keyword !== 'string') {
            return NextResponse.json({ error: 'Mot-clé manquant ou invalide' }, { status: 400 });
        }
        if (keyword.length > 200) {
            return NextResponse.json({ error: 'Mot-clé trop long (max 200 caractères)' }, { status: 400 });
        }
        if (url && typeof url === 'string' && url.length > 0) {
            try {
                new URL(url);
            } catch {
                return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
            }
        }

        // 1️⃣ Fetch SERP context
        log(`[API] Récupération du SERP pour le mot‑clé: ${keyword}`);
        const context = await fetchSerpResults(keyword, config.valueSerpApiKey);
        log('[API] Étape 1 – Analyse du contenu du scrap');

        // Handle "Image Only" Generation
        if (generationType === 'image') {
            if (!config.seedreamApiKey) {
                return NextResponse.json({ error: 'API Key Seedream manquante.' }, { status: 500 });
            }

            try {
                console.log('[API] Generating image prompt with instructions...');
                const prompt = await generateImagePrompt(keyword, context, config.anthropicApiKey, imagePrompt);

                console.log(`[API] Generating image (${imageFormat})...`);
                const generatedImageUrl = await generateImage(prompt, config.seedreamApiKey, imageFormat);

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
