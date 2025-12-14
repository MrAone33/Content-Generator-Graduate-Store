import { NextResponse } from 'next/server';
import { verifyToken } from '../../../utils/auth';
import { fetchSerpResults } from '../../../services/serp';
import { generateImagePrompt, generateImage, generateArticle, rewriteContent } from '../../../services/ai';

/**
 * POST /api/generate
 * Handles content generation: SERP fetch, optional image generation, article generation, and article rewrite.
 */
export async function POST(request) {
    // Collect logs for front‑end visibility
    const logs = [];
    const log = (msg) => { logs.push(msg); console.log(msg); };
    try {
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
        } = body;
        if (!keyword) {
            return NextResponse.json({ error: 'Mot-clé manquant' }, { status: 400 });
        }

        // 1️⃣ Fetch SERP context
        log(`[API] Récupération du SERP pour le mot‑clé: ${keyword}`);
        const context = await fetchSerpResults(keyword, config.valueSerpApiKey);
        log('[API] Étape 1 – Analyse du contenu du scrap');
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
