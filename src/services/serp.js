
export async function fetchSerpResults(keyword, valueSerpApiKey, diffbotApiKey) {
    // 1. Recherche GOOGLE (Récupération des URLs)
    const params = new URLSearchParams({
        api_key: valueSerpApiKey, // Corrected variable name
        q: keyword,
        location: "France",
        google_domain: "google.fr",
        gl: "fr",
        hl: "fr",
        num: "5",
        output: "json"
    });

    try {
        const response = await fetch(`https://api.valueserp.com/search?${params}`, {
            signal: AbortSignal.timeout(15000) // 15s max pour la recherche initiale
        });

        if (!response.ok) throw new Error("Erreur ValueSERP Search: " + response.statusText);

        const data = await response.json();

        if (!data.organic_results) {
            throw new Error("Aucun résultat organique trouvé.");
        }

        const topResults = data.organic_results.slice(0, 5);
        const urlsToScrape = topResults.map(r => r.link).filter(l => l);

        console.log(`[DIFFBOT]Extraction de ${urlsToScrape.length} articles...`);

        // 2. EXTRACTION PARALLÈLE VIA DIFFBOT
        // On utilise la clé Diffbot passée en paramètre
        if (!diffbotApiKey) {
            console.warn("⚠️ Pas de clé DIFFBOT_API_KEY. Fallback sur snippets uniquement.");
            return formatSnippetsOnly(topResults);
        }

        const scrapePromises = urlsToScrape.map(url => scrapeWithDiffbot(url, diffbotApiKey));

        // On attend tout, en tolérant les erreurs individuelles
        const scrapedPages = await Promise.all(scrapePromises);

        // 3. AGGRÉGATION DU CONTENU
        return topResults.map((r, i) => {
            const pageData = scrapedPages[i];

            // Si Diffbot a réussi et retourné du texte
            if (pageData && pageData.text && pageData.text.length > 200) {
                return `[Source ${i + 1}] Titre: ${pageData.title || r.title}\nURL: ${r.link}\nCONTENU COMPLET (Diffbot):\n${pageData.text.slice(0, 15000)}`;
            } else {
                return `[Source ${i + 1}] Titre: ${r.title}\nURL: ${r.link}\nRÉSUMÉ (Fallback): ${r.snippet} (Extraction impossible)`;
            }
        }).join("\n\n--------------------\n\n");

    } catch (error) {
        console.error("Erreur FetchSerp:", error);
        throw error;
    }
}

function formatSnippetsOnly(results) {
    return results
        .map((r, index) => `[Source ${index + 1}] Titre: ${r.title}\nRésumé: ${r.snippet}\nURL: ${r.link}`)
        .join("\n\n");
}

async function scrapeWithDiffbot(url, token) {
    try {
        // Diffbot Article API
        const params = new URLSearchParams({
            token: token,
            url: url,
            timeout: 15000 // 15s timeout server-side chez Diffbot
        });

        const response = await fetch(`https://api.diffbot.com/v3/article?${params}`, {
            signal: AbortSignal.timeout(20000) // 20s timeout de notre fetch
        });

        if (!response.ok) return null;

        const data = await response.json();

        // Diffbot retourne 'objects' array
        if (data.objects && data.objects.length > 0) {
            return data.objects[0]; // { title, text, html, ... }
        }
        return null;

    } catch (e) {
        console.error(`Erreur Diffbot ${url}:`, e.message);
        return null;
    }
}
