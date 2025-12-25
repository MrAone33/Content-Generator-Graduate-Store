import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../utils/auth';
import { fetchSerpResults } from '../../../../services/serp';
import { generateImagePrompt, generateImage } from '../../../../services/ai';

// Configure longer timeout for Vercel
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const config = {
            accessToken: process.env.ACCESS_TOKEN,
            valueSerpApiKey: process.env.VALUESERP_API_KEY,
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
            seedreamApiKey: process.env.SEEDREAM_API_KEY,
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
        const {
            keyword,
            imagePrompt,
            imageFormat,
            // Mockup params
            isMockup,
            mockupLocation,
            mockupSize,
            mockupAlignment,
            mockupBaseImageUrl,
            mockupLogoImageUrl
        } = body;

        if (!config.seedreamApiKey) {
            return NextResponse.json({ error: 'Clé API Seedream manquante' }, { status: 500 });
        }

        let prompt = "";
        let context = ""; // Context needed for image prompt generation?
        // Usually yes, if we want the image to match the article context.
        // But scraping again takes time.
        // OPTION: Pass context from client if available (we don't persist it there easily unless we returned it in draft).
        // OR: Just fetch SERP again? No, waste of time/credits.
        // OR: Just use keyword + user instructions.

        // Let's see existing logic: `generateImagePrompt(keyword, context, ...)`
        // If we don't have context, we pass empty string. It should be fine.
        // Actually, for image generation, SERP context is useful but maybe not critical if we have the keyword.
        // Let's try to fetch a lightweight context or skip it to save time in this "Image" endpoint to avoid it timing out too.
        // IF this is "Image Only" mode, we might want to fetch context. 
        // IF this is "Article + Image", we might have context from previous step?
        // To keep it simple and robust: Skip SERP context for image generation in this new flow unless explicitly needed. 
        // Existing code: `if (generationType !== 'image') ... fetchSerpResults`.
        // If it was standard generation, we used the SAME context.

        // DECISION: To avoid complexity, we will NOT pass context for now. The prompt engineer (Claude) is good enough with just the keyword usually. 
        // OR we can pass the "brief" or "draftContent" as context if we wanted.

        let imageInputUrls = [];

        if (isMockup) {
            console.log('\n🔹 [STEP 3/3 : IMAGE] Génération PROMPT MOCKUP...');
            prompt = `#Rôle
Tu es un ingénieur en prompt spécialisé dans la création de briefs de génération d’images documentaires de style smartphone.

#Instructions
Utilise Image 1 comme photo de base (verrouille tout : personnes, visage, cheveux, tenue, couleurs, arrière-plan, cadrage, netteté, grain, lumière — aucune altération). Utilise Image 2 comme logo maître et respecte-le à 100% pixel-perfect : mêmes proportions, formes, couleurs, contours, aucun redraw/interprétation/simplification, aucune recoloration, aucune retouche, aucune perte de détails. Seul traitement autorisé : détourage alpha propre si nécessaire, sans modifier le graphisme. Applique le logo sur le vêtement à ${mockupLocation || 'Cœur'} avec ${mockupSize || 'taille standard'}/${mockupAlignment || 'alignement naturel'}. Rendu sérigraphie ultra réaliste : le logo imprimé doit se caler précisément sur les plis et s’y adapter sans aucun décalage (warp 3D continu et exact qui suit chaque pli/creux/bosse, avec alignement stable sur la surface du tissu ; pas de glissement, pas d’offset entre le logo et les plis). Utilise une carte de déformation du tissu : le logo doit épouser la tension, les coutures et la perspective, avec occlusion légère dans les creux si nécessaire. Intégration physique : micro-texture fibres, légère irrégularité d’encre, opacité réaliste, ombres/reflets identiques à la scène. Zéro halo, zéro bord blanc, zéro effet sticker. Sortie : 1 image finale STRICTEMENT identique à Image 1 en format, ratio et dimensions pixels, sans redimensionnement, sans recadrage, sans marges, sans texte/watermark, et propre à 200% zoom.

#Informations Précises
Qualité d’appareil photo numérique avec ses imperfections naturelles. Esthétique brute et non retouchée de photographie, grain naturel, conditions d’éclairage authentiques. profondeur de champ réaliste d’un appareil numérique. Aucun éclairage ni composition professionnelle, style purement documentaire comme pris par quelqu’un avec son téléphone. Décor totalement spontané et réaliste. Le moment doit paraître totalement authentique et non scénarisé. La texture de la peau doit etre ultra naturelle et ne pas faire poupée de cire`;

            if (mockupBaseImageUrl) imageInputUrls.push(mockupBaseImageUrl);
            if (mockupLogoImageUrl) imageInputUrls.push(mockupLogoImageUrl);

            if (imageInputUrls.length < 2) {
                return NextResponse.json({ error: 'Mockup nécessite 2 images' }, { status: 400 });
            }
        } else {
            console.log('\n🔹 [STEP 3/3 : IMAGE] Génération Prompt Standard...');
            // We pass empty string for context here to save time
            prompt = await generateImagePrompt(keyword, "", config.anthropicApiKey, imagePrompt);
        }

        console.log(`✅ [STEP 3/3 : IMAGE] Prompt généré. Envoi Seedream...`);
        console.time('seedream-gen');
        const generatedImageUrl = await generateImage(prompt, config.seedreamApiKey, imageFormat, imageInputUrls);
        console.timeEnd('seedream-gen');
        console.log(`✅ [STEP 3/3 : IMAGE] Image URL: ${generatedImageUrl}`);

        return NextResponse.json({
            imageUrl: generatedImageUrl
        });

    } catch (error) {
        console.error('❌ [API IMAGE ERROR]:', error);
        return NextResponse.json({ error: error.message || 'Erreur génération image' }, { status: 500 });
    }
}
