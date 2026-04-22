import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// import { generateMockContent } from '../utils/simulation'; // Mock no longer used
import { generateDraft, generateRewrite, generateImage } from '../services/api';
import * as apiService from '../services/api'; // Use namespace for easier mocking/calling

export function useGenerator() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        keyword: '',
        language: 'fr',
        contentType: 'cocon',
        length: '800 mots',
        links: [{ anchor: '', url: '' }],
        tone: 'graduate',
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
        setErrorMsg(null);
        setLogs([]);

        // Reset content based on tab
        if (activeTab === 'text') {
            setGeneratedContent(null);
            setGeneratedImageUrl(null);
        } else {
            setGeneratedImageUrl(null);
        }

        try {
            // -- PREPARE PAYLOAD --
            const payload = {
                ...formData,
                generationType: activeTab,
                // Add anchor/url compat
                anchor: formData.links[0]?.anchor || "",
                url: formData.links[0]?.url || ""
            };

            // -- NEW SEQUENTIAL FLOW --

            let finalContent = null;
            let finalImageUrl = null;

            // 1. DRAFT (Text Only)
            if (activeTab === 'text') {
                addLog("Phase 1/3 : Analyse du sujet et structuration...", 'scrape', 'loading');

                const draftData = await apiService.generateDraft(settings, payload, signal);
                addLog("Structure établie. Démarrage de la rédaction...", 'scrape', 'success');

                // 2. REWRITE (Text Only)
                addLog("Phase 2/3 : Rédaction et optimisation sémantique...", 'generate', 'loading');
                console.log("[DEBUG CLIENT] Payload sent to Rewrite:", payload); // DEBUG
                const rewriteData = await apiService.generateRewrite(settings, draftData.content, payload, signal);
                setGeneratedContent(rewriteData.content);
                finalContent = rewriteData.content;
                addLog("Contenu finalisé et optimisé.", 'generate', 'success');

                // 3. IMAGE (Optional)
                if (payload.generateImage) {
                    addLog("Phase 3/3 : Création du visuel d'illustration...", 'format', 'loading');
                    try {
                        const imageData = await apiService.generateImage(settings, payload, signal);
                        if (imageData.imageUrl) {
                            setGeneratedImageUrl(imageData.imageUrl);
                            finalImageUrl = imageData.imageUrl;
                            addLog("Visuel généré avec succès.", 'format', 'success');
                        }
                    } catch (imgErr) {
                        addLog("Info : Image non générée (" + imgErr.message + ")", 'format', 'error');
                    }
                }

                addLog("Génération terminée !", 'format', 'success');

            } else {
                // IMAGE ONLY MODE
                addLog("Analyse de la demande visuelle...", 'scrape', 'loading');
                const imageData = await apiService.generateImage(settings, payload, signal);
                setGeneratedImageUrl(imageData.imageUrl);
                finalImageUrl = imageData.imageUrl;
                addLog("Visuel créé.", 'scrape', 'success');
            }

            if (finalContent || finalImageUrl) {
                try {
                    await apiService.saveHistoryEntry(settings, {
                        type: activeTab,
                        keyword: payload.keyword,
                        content: finalContent,
                        imageUrl: finalImageUrl,
                        formData: payload,
                    });
                } catch (saveErr) {
                    console.warn("Impossible de sauvegarder l'historique :", saveErr.message);
                }
            }

        } catch (err) {
            if (err.name === 'AbortError') {
                console.log("Fetch aborted");
                addLog("Annulé par l'utilisateur.", 'generate', 'error');
            } else {
                console.error("Erreur hook:", err);
                let userMessage = err.message;
                if (userMessage === 'Failed to fetch') {
                    userMessage = "Problème de connexion (possible timeout).";
                }
                setErrorMsg(userMessage);
                addLog(`Erreur: ${userMessage}`, 'generate', 'error');
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
