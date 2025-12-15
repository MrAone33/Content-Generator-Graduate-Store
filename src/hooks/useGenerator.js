import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// import { generateMockContent } from '../utils/simulation'; // Mock no longer used
import { generateContent } from '../services/api';

export function useGenerator() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        keyword: '',
        length: '800 mots',
        links: [{ anchor: '', url: '' }],
        tone: 'expert',
        brief: '',
        generateImage: true,
        includeAuthorityLink: false, // Default false
        imagePrompt: '', // Supplemental prompt for image
        imageFormat: 'landscape' // 'landscape', 'portrait', 'square'
    });

    const [settings, setSettings] = useState({
        mode: 'production', // Always production
        workerUrl: 'http://localhost:8787',
        apiToken: ''
    });
    // const [showSettings, setShowSettings] = useState(false); // No longer needed

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
    const [logs, setLogs] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);

    const abortControllerRef = useRef(null);

    // Authentication Check
    useEffect(() => {
        // Check if we are client side
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('api_token');
            if (!token) {
                router.push('/login');
            } else {
                setSettings(prev => ({ ...prev, apiToken: token }));
            }

            // URL from Environment or default
            const envUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787';
            setSettings(prev => ({ ...prev, workerUrl: envUrl }));
        }
    }, [router]);


    const addLog = (message, step, status) => {
        setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), message, step, status }]);
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsGenerating(false);
        addLog("Opération annulée par l'utilisateur.", 'generate', 'error');
        setErrorMsg("Génération stoppée manuellement.");
    };

    const handleLogout = () => {
        localStorage.removeItem('api_token');
        router.push('/login');
    };

    const handleGenerate = async (activeTab = 'text') => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsGenerating(true);
        // Only reset content if we are regenerating that specific type, but for simplicity reset all for now or handle per-tab logic.
        // If image tab, maybe we want to keep text content? Let's keep it simple and reset.
        if (activeTab === 'text') {
            setGeneratedContent(null);
            setGeneratedImageUrl(null);
        } else {
            setGeneratedImageUrl(null);
        }

        setErrorMsg(null);
        setLogs([]);

        try {
            // ALWAYS PRODUCTION MODE LOGIC
            // addLog("Connexion à l'API sécurisée...", 'scrape', 'loading'); // Removing verbose Logs
            if (activeTab === 'text') {
                addLog("Authentification et analyse SERP en cours...", 'scrape', 'loading');
            } else {
                addLog("Préparation de la génération d'image...", 'scrape', 'loading');
            }

            const payload = {
                ...formData,
                generationType: activeTab // 'text' or 'image'
            };

            try {
                const data = await generateContent(settings, payload, signal);

                if (activeTab === 'text') {
                    addLog("Analyse terminée. Rédaction Claude en cours...", 'scrape', 'success');
                } else {
                    addLog("Prompt généré. Création de l'image (Seedream)...", 'scrape', 'success');
                }
                addLog("Données reçues. Génération Claude en cours...", 'generate', 'loading');

                setGeneratedContent(data.content);
                if (data.imageUrl) setGeneratedImageUrl(data.imageUrl);
                if (data.imageError) addLog("Info: " + data.imageError, 'generate', 'error');

                addLog("Contenu généré et reçu avec succès.", 'generate', 'success');
                addLog("Formatage terminé.", 'format', 'success');
            } catch (apiError) {
                if (apiError.message.includes("401") || apiError.message.includes("403")) {
                    // Clean token if invalid
                    localStorage.removeItem('api_token');
                    router.push('/login');
                    throw new Error("Session expirée, veuillez vous reconnecter.");
                }
                throw apiError;
            }

        } catch (err) {
            if (err.name === 'AbortError') {
                console.log("Fetch aborted");
            } else {
                console.error(err);
                setErrorMsg(err.message || "Une erreur inconnue est survenue");
                addLog(`Erreur: ${err.message} `, 'generate', 'error');
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setIsGenerating(false);
            }
        }
    };

    return {
        formData, setFormData,
        settings, setSettings,
        // showSettings, setShowSettings, // Removed
        isGenerating,
        generatedContent, setGeneratedContent,
        generatedImageUrl, setGeneratedImageUrl,
        logs, setLogs,
        errorMsg,
        handleGenerate,
        handleStop,
        handleLogout // Added
    };
}
