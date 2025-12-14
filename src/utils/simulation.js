export const generateMockContent = (data) => {
    const { keyword, links, tone, brief, generateImage, length } = data;
    const simKeyword = keyword || "Sujet de démonstration";

    const validLinks = links.filter(l => l.anchor && l.url);

    const linksHtml = validLinks.length > 0
        ? validLinks
            .map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.anchor}</a>`)
            .join(' et ')
        : "des outils adaptés";

    const toneMap = {
        expert: "Dans une analyse technique approfondie,",
        pedagogique: "Pour bien comprendre ce concept,",
        journalistique: "Selon les dernières tendances observées,",
        commercial: "La meilleure solution sur le marché est sans doute,",
        neutre: "Il convient d'examiner les faits suivants :"
    };

    let content = "";

    if (length.includes("150")) {
        content = `
<h1>${simKeyword} : L'essentiel</h1>
<p class="lead">Découvrez pourquoi <strong>${simKeyword}</strong> est la solution incontournable du moment. ${toneMap[tone]} c'est une opportunité à saisir immédiatement.</p>

<h2>Points clés</h2>
<ul>
  <li>Performance optimale pour vos besoins quotidiens.</li>
  <li>Intégration fluide avec ${linksHtml}.</li>
  <li>Rapport qualité/prix exceptionnel sur le marché.</li>
</ul>

<h2>Description rapide</h2>
<p>Conçu pour l'efficacité, ce produit répond aux exigences modernes. Sa simplicité d'utilisation en fait un choix privilégié pour les professionnels comme pour les débutants. ${brief ? `Comme demandé : ${brief}` : ''}</p>
<p>En résumé, opter pour ${simKeyword}, c'est faire le choix de la fiabilité.</p>
    `;
    } else if (length.includes("1200") || length.includes("2000")) {
        content = `
<h1>Dossier Complet : Tout savoir sur ${simKeyword}</h1>
<p>Dans un monde en constante évolution, la thématique de <strong>${simKeyword}</strong> prend une ampleur considérable. ${toneMap[tone]} il est temps d'analyser ce sujet sous toutes ses coutures. Ce dossier a pour vocation de devenir votre référence absolue.</p>

<h2>1. Contexte et définitions</h2>
<p>Pour bien appréhender le sujet, il faut revenir aux fondamentaux. ${simKeyword} n'est pas un concept nouveau, mais ses applications récentes ont bouleversé la donne. Les experts s'accordent à dire que la maîtrise de cet aspect est devenue critique pour la compétitivité.</p>
<p>Nous observons une transition majeure vers des modèles plus robustes, où l'intégration de ${linksHtml} joue un rôle central dans la chaîne de valeur.</p>

<h2>2. Analyse approfondie des tendances</h2>
<h3>L'évolution technologique</h3>
<p>Les avancées récentes permettent d'aller beaucoup plus loin. Là où nous étions limités par la puissance de calcul ou les ressources, nous avons désormais accès à des possibilités infinies. C'est une révolution silencieuse mais puissante.</p>
<h3>Les impacts sociétaux</h3>
<p>Au-delà de la technique, l'impact humain est réel. Adopter ${simKeyword}, c'est aussi repenser notre manière de travailler et d'interagir. ${brief ? `Rappel du brief éditorial : ${brief}.` : ''}</p>

<h2>3. Stratégies avancées et mise en œuvre</h2>
<p>Comment passer de la théorie à la pratique ? C'est souvent là que le bât blesse. Une stratégie efficace repose sur trois piliers : la vision, les outils, et l'exécution.</p>
<p>Il ne suffit pas de vouloir, il faut pouvoir. Et pour cela, s'appuyer sur des références solides comme ${linksHtml} est un prérequis indispensable pour éviter les écueils classiques.</p>

<h2>4. Études de cas et retours d'expérience</h2>
<p>Prenons l'exemple des leaders du marché. Ils n'ont pas attendu pour investir dans ${simKeyword}. Les résultats parlent d'eux-mêmes : une augmentation significative de la productivité et une meilleure satisfaction client.</p>
<p>Ce n'est pas de la magie, c'est de la méthode. Une rigueur implacable associée à une curiosité constante.</p>

<h2>Conclusion et perspectives d'avenir</h2>
<p>En définitive, ${simKeyword} est là pour durer. Les signaux faibles sont devenus des tendances lourdes. Pour rester dans la course, l'adaptation est la seule option viable.</p>
<p>Nous vous recommandons de commencer dès aujourd'hui à implémenter ces changements. L'avenir appartient à ceux qui maîtrisent ces nouveaux paradigmes.</p>
    `;
    } else {
        content = `
<h1>Guide complet sur : ${simKeyword}</h1>
<h2>Comprendre les enjeux</h2>
<p>Dans le paysage numérique actuel, la thématique <strong>${simKeyword}</strong> suscite un intérêt grandissant. ${toneMap[tone]} il est crucial d'aborder ce sujet avec précision. Que vous soyez un professionnel ou un amateur éclairé, les implications sont nombreuses et méritent une attention particulière.</p>
<p>Nous avons analysé les meilleures ressources disponibles pour vous offrir une synthèse complète. L'objectif est de vous fournir des clés de compréhension actionnables.</p>

<h2>Les piliers fondamentaux</h2>
<p>L'analyse des résultats de recherche montre une convergence vers trois axes principaux. Premièrement, l'efficacité des méthodes employées. Deuxièmement, la durabilité des stratégies mises en place. Et enfin, l'accessibilité des outils.</p>

<h3>1. L'importance de la stratégie</h3>
<p>Une approche structurée est indispensable. Comme le soulignent les experts du domaine, l'improvisation a rarement sa place lorsqu'on traite de ${simKeyword}. C'est ici qu'intervient la nécessité d'utiliser ${linksHtml} pour maximiser vos résultats.</p>
<p>En effet, l'intégration de solutions adaptées permet non seulement de gagner du temps, mais aussi d'assurer une cohérence globale dans votre démarche.</p>

<h3>2. Les erreurs à éviter</h3>
<p>Beaucoup tombent dans le piège de la simplicité apparente. ${brief ? `Comme mentionné dans le brief : ${brief}.` : ''} Il ne faut pas sous-estimer la complexité sous-jacente.</p>

<h2>Conclusion : Vers une maîtrise de ${simKeyword}</h2>
<p>En somme, maîtriser ${simKeyword} demande de la rigueur et les bons outils. En suivant les recommandations énoncées et en vous appuyant sur des ressources fiables comme ${linksHtml}, vous serez en mesure d'atteindre vos objectifs.</p>
    `;
    }

    return {
        content,
        imageUrl: generateImage ? "https://images.unsplash.com/photo-1620912189865-1e8a33f07085?q=80&w=1000&auto=format&fit=crop" : ""
    };
};
