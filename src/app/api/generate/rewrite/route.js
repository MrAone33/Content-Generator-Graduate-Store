import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../utils/auth';
import { rewriteContent } from '../../../../services/ai';

// Configure longer timeout for Vercel
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const config = {
            accessToken: process.env.ACCESS_TOKEN,
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        };

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Accès refusé : Token manquant' }, { status: 401 });
        }
        const userToken = authHeader.split(' ')[1];
        if (!verifyToken(userToken, config.accessToken)) {
            return NextResponse.json({ error: 'Accès interdit : Identifiants invalides' }, { status: 403 });
        }

        const body = await request.json();
        console.log("DEBUG REWRITE BODY KEYS:", Object.keys(body)); // Verify keys
        console.log("DEBUG REWRITE BODY ANCHOR:", body.anchor); // Verify specific value
        const { draftContent, length, keyword, tone, brief, url, anchor, includeAuthorityLink, contentType, language } = body;

        if (!draftContent) {
            return NextResponse.json({ error: 'Contenu brouillon manquant' }, { status: 400 });
        }

        console.log(`\n🔹 [STEP 2/3 : REWRITE] Optimisation du contenu (${draftContent.length} chars)...`);
        console.log(`DEBUG LIENS: Anchor="${anchor}", URL="${url}"`);
        console.time('text-rewrite');
        const finalContent = await rewriteContent(
            { draftContent, length, keyword, tone, brief, url, anchor, includeAuthorityLink, contentType, language },
            config.anthropicApiKey
        );
        console.timeEnd('text-rewrite');
        console.log(`✅ [STEP 2/3 : REWRITE] Contenu final généré (${finalContent.length} chars).`);

        return NextResponse.json({
            content: finalContent
        });

    } catch (error) {
        console.error('❌ [API REWRITE ERROR]:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne serveur' }, { status: 500 });
    }
}
