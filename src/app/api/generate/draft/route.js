import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../utils/auth';
import { fetchSerpResults } from '../../../../services/serp';
import { generateArticle } from '../../../../services/ai';

// Configure longer timeout for Vercel
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request) {
    const logs = [];
    const log = (msg) => { logs.push(msg); console.log(msg); };

    try {
        // Rate limiting (basic check, could be improved)
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
        // Note: We skip rate limit check here for simplicity in this refactor, 
        // or we should move rate limiter to a shared util if needed efficiently across endpoints.
        // For now, let's assume the main entry protection or client responsibility. 
        // Actually, let's keep it simple and trust the auth token primarily.

        // Load configuration
        const config = {
            accessToken: process.env.ACCESS_TOKEN,
            valueSerpApiKey: process.env.VALUESERP_API_KEY,
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
            diffbotApiKey: process.env.DIFFBOT_API_KEY,
        };

        // Authenticate
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Accès refusé : Token manquant' }, { status: 401 });
        }
        const userToken = authHeader.split(' ')[1];
        if (!verifyToken(userToken, config.accessToken)) {
            return NextResponse.json({ error: 'Accès interdit : Identifiants invalides' }, { status: 403 });
        }

        const body = await request.json();
        const { keyword, anchor, url, tone, brief, length, includeAuthorityLink } = body;

        if (!keyword) {
            return NextResponse.json({ error: 'Mot-clé manquant' }, { status: 400 });
        }

        // 1️⃣ Fetch SERP context
        let context = "";
        console.log(`\n🔹 [STEP 1/3 : DRAFT] Récupération du SERP pour : "${keyword}"...`);
        console.time('serp-fetch');
        try {
            context = await fetchSerpResults(keyword, config.valueSerpApiKey, config.diffbotApiKey);
        } catch (e) {
            console.error("Erreur SERP (non bloquant):", e);
            console.log("⚠️ [STEP 1/3 : DRAFT] Erreur SERP, continu sans contexte.");
        }
        console.timeEnd('serp-fetch');
        console.log(`✅ [STEP 1/3 : DRAFT] SERP récupéré (Taille: ${context.length} chars)`);

        // 2️⃣ Generate First Draft
        console.log('\n🔹 [STEP 1/3 : DRAFT] Rédaction du brouillon (Claude)...');
        console.time('text-gen-1');
        const draftHtml = await generateArticle(
            { keyword, tone, brief, url, anchor, context, length, includeAuthorityLink },
            config.anthropicApiKey
        );
        console.timeEnd('text-gen-1');
        console.log(`✅ [STEP 1/3 : DRAFT] Brouillon généré (${draftHtml.length} chars).`);

        return NextResponse.json({
            content: draftHtml,
            context: context // Ensure we might not need to pass context back if rewrite doesn't need it? 
            // Rewrite usually just takes the content. But let's check prompts. 
            // Rewrite prompt usually takes "initial content". So we don't need context.
        });

    } catch (error) {
        console.error('❌ [API DRAFT ERROR]:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne serveur' }, { status: 500 });
    }
}
