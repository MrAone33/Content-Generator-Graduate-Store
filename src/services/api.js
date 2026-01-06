const TIMEOUT_ERROR_MSG = "Le serveur n'a pas répondu à temps (Timeout).";

async function callApi(endpoint, settings, payload, signal) {
    if (!settings.apiToken) throw new Error("Token API manquant.");

    // Adapt payload for specific processing if needed
    // ...

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiToken}`
        },
        body: JSON.stringify(payload),
        signal: signal
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error("Authentification refusée : Token invalide.");
    }

    if (!response.ok) {
        let errorDetails = response.statusText;
        try {
            const errorData = await response.json();
            if (errorData.error) errorDetails = errorData.error;
        } catch (e) { }
        throw new Error(`Erreur serveur (${response.status}): ${errorDetails}`);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
}

export async function generateDraft(settings, formData, signal) {
    return callApi('/api/generate/draft', settings, formData, signal);
}

export async function generateRewrite(settings, draftContent, formDataOrLength, signal) {
    // Defensive coding: check if 3rd arg is object or length string
    let fullPayload = {};
    if (typeof formDataOrLength === 'object') {
        console.log("[DEBUG API SERVICE] generateRewrite received OBJECT:", JSON.stringify(formDataOrLength));
        fullPayload = Object.assign({}, formDataOrLength, { draftContent });
    } else {
        console.warn("[DEBUG API SERVICE] generateRewrite received LEGACY ARG (length string):", formDataOrLength);
        fullPayload = { draftContent, length: formDataOrLength };
    }

    return callApi('/api/generate/rewrite', settings, fullPayload, signal);
}

export async function generateImage(settings, formData, signal) {
    return callApi('/api/generate/image', settings, formData, signal);
}

// Deprecated: Monolithic call (kept if we need fallback)
export async function generateContent(settings, formData, signal) {
    return callApi('/api/generate', settings, formData, signal);
}
