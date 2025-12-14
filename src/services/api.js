export async function generateContent(settings, formData, signal) {
    // if (!settings.workerUrl) throw new Error("URL du Worker manquante.");
    if (!settings.apiToken) throw new Error("Mot de passe API (Token) manquant.");
    if (!formData.keyword) throw new Error("Le mot-clé principal est obligatoire.");

    // Préparation du payload avec rétro-compatibilité
    const payload = {
        ...formData,
        // On envoie le premier lien comme anchor/url pour compatibilité avec l'ancien backend
        // Note: Le nouveau backend gère le payload complet, mais on garde ces champs au cas où
        anchor: formData.links[0]?.anchor || "",
        url: formData.links[0]?.url || ""
    };

    // URL interne (Next.js API Route)
    const apiUrl = '/api/generate';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiToken}`
        },
        body: JSON.stringify(payload),
        signal: signal
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error("Authentification refusée : Vérifiez votre mot de passe API.");
    }

    if (!response.ok) {
        let errorDetails = response.statusText;
        try {
            const errorData = await response.json();
            if (errorData.error) errorDetails = errorData.error;
        } catch (e) {
            // keep statusText
        }
        throw new Error(`Erreur serveur (${response.status}): ${errorDetails || 'Aucun détail disponible'}`);
    }

    const data = await response.json();

    if (data.error) throw new Error(data.error);

    return data;
}
