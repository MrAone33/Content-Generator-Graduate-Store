import { buildImageSystemPrompt, buildArticlePrompt, buildRewritePrompt } from '../prompts.js';

export async function generateImagePrompt(keyword, context, apiKey, extraInstructions = '') {
    const promptSystem = buildImageSystemPrompt(keyword, context, extraInstructions);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            messages: [{ role: "user", content: promptSystem }],
        }),
        signal: AbortSignal.timeout(30000) // 30s timeout
    });

    const data = await response.json();
    if (!data.content || !data.content[0]) {
        throw new Error("Erreur génération prompt image (Claude): " + JSON.stringify(data));
    }
    return data.content[0].text;
}

export async function generateImage(prompt, apiKey, format = 'landscape', imageInputUrls = []) {
    // Map format to resolution
    let size = "4096x2730"; // Default landscape
    if (format === 'portrait') size = "2730x4096";
    else if (format === 'square') size = "2048x2048";

    const requestBody = {
        "model": "seedream-4-0-250828",
        "prompt": prompt,
        "sequential_image_generation": "disabled",
        "response_format": "url",
        "stream": false,
        "watermark": false
    };

    if (imageInputUrls && imageInputUrls.length > 0) {
        requestBody.image = imageInputUrls;
        // Don't set size here to respect input ratio
    } else {
        requestBody.size = size;
    }

    const response = await fetch("https://ark.ap-southeast.bytepluses.com/api/v3/images/generations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(60000) // 60s timeout
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erreur API Seedream (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
        return data.data[0].url;
    } else if (data.url) {
        return data.url;
    } else {
        throw new Error("Réponse Seedream reçue mais URL introuvable: " + JSON.stringify(data));
    }
}

export async function generateArticle({ keyword, tone, brief, url, anchor, context, length, includeAuthorityLink }, apiKey) {
    const userPrompt = buildArticlePrompt({ keyword, tone, brief, url, anchor, context, length, includeAuthorityLink });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4000,
            messages: [{ role: "user", content: userPrompt }],
        }),
        signal: AbortSignal.timeout(180000) // 3 mins timeout
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.content[0].text;
}
export async function rewriteContent(initialContent, length, apiKey) {
    const rewritePrompt = buildRewritePrompt(initialContent, length);
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4000,
            messages: [{ role: "user", content: rewritePrompt }],
        }),
        signal: AbortSignal.timeout(180000) // 3 mins timeout
    });
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.content[0].text;
}
