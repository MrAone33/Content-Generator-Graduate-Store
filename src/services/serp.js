export async function fetchSerpResults(keyword, apiKey) {
    const params = new URLSearchParams({
        api_key: apiKey,
        q: keyword,
        location: "France",
        google_domain: "google.fr",
        gl: "fr",
        hl: "fr",
        num: "5",
        output: "json"
    });

    const response = await fetch(`https://api.valueserp.com/search?${params}`);
    const data = await response.json();

    if (!data.organic_results) {
        throw new Error("Aucun résultat trouvé sur ValueSERP");
    }

    return data.organic_results
        .map((r, index) => `[Source ${index + 1}] Titre: ${r.title}\nRésumé: ${r.snippet}\nURL: ${r.link}`)
        .join("\n\n");
}
