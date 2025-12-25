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

export async function generateRewrite(settings, draftContent, formData, signal) {
    console.log("[DEBUG API SERVICE] generateRewrite formData:", formData);
    return callApi('/api/generate/rewrite', settings, { draftContent, ...formData }, signal);
}

export async function generateImage(settings, formData, signal) {
    return callApi('/api/generate/image', settings, formData, signal);
}

// Deprecated: Monolithic call (kept if we need fallback)
export async function generateContent(settings, formData, signal) {
    return callApi('/api/generate', settings, formData, signal);
}
