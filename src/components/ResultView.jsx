'use client';

import React, { useState, useMemo } from 'react';
import { Globe, Code, FileText, ImageIcon, Copy, Download, Check } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

export default function ResultView({ generatedContent, generatedImageUrl, keyword }) {
    const [activeTab, setActiveTab] = useState('preview');
    const [copied, setCopied] = useState(false);

    // Sanitize HTML to prevent XSS attacks
    const sanitizedContent = useMemo(() => {
        if (!generatedContent) return '';
        return DOMPurify.sanitize(generatedContent, {
            ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'br', 'span', 'div', 'figure', 'figcaption', 'img'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id'],
            ALLOW_DATA_ATTR: false,
        });
    }, [generatedContent]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!generatedContent) {
        return (
            <div className="card flex-grow flex items-center justify-center text-[#767676]">
                <div className="text-center">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Le contenu généré apparaîtra ici</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card flex flex-col flex-grow overflow-hidden">
            {/* Toolbar */}
            <div className="border-b border-[#E5E5E5] px-4 py-2 bg-[#F5F5F5] flex flex-wrap items-center justify-between gap-2">
                <div className="flex bg-white border border-[#E5E5E5] p-0.5 rounded-sm">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 uppercase tracking-wide rounded-sm ${activeTab === 'preview' ? 'bg-black text-white' : 'text-[#767676] hover:bg-[#F5F5F5]'}`}
                    >
                        <Globe className="w-3.5 h-3.5" /> Visuel
                    </button>
                    <button
                        onClick={() => setActiveTab('wp')}
                        className={`px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 uppercase tracking-wide rounded-sm ${activeTab === 'wp' ? 'bg-black text-white' : 'text-[#767676] hover:bg-[#F5F5F5]'}`}
                    >
                        <FileText className="w-3.5 h-3.5" /> WordPress
                    </button>
                    <button
                        onClick={() => setActiveTab('html')}
                        className={`px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 uppercase tracking-wide rounded-sm ${activeTab === 'html' ? 'bg-black text-white' : 'text-[#767676] hover:bg-[#F5F5F5]'}`}
                    >
                        <Code className="w-3.5 h-3.5" /> HTML
                    </button>

                    {generatedImageUrl && (
                        <button
                            onClick={() => {
                                const filename = keyword
                                    ? keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.png'
                                    : 'image-generee.png';

                                fetch(generatedImageUrl)
                                    .then(response => {
                                        if (!response.ok) throw new Error('Network response was not ok');
                                        return response.blob();
                                    })
                                    .then(blob => {
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.style.display = 'none';
                                        a.href = url;
                                        a.download = filename;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                    })
                                    .catch(err => {
                                        console.error('Erreur téléchargement image:', err);
                                        window.open(generatedImageUrl, '_blank');
                                    });
                            }}
                            className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 text-[#767676] hover:bg-[#F5F5F5] uppercase tracking-wide"
                        >
                            <ImageIcon className="w-3.5 h-3.5" /> Image
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => copyToClipboard(generatedContent)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#767676] text-xs font-medium transition-colors rounded-sm"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copié!' : 'Copier'}
                    </button>
                    <button
                        onClick={() => {
                            const filename = keyword
                                ? keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.html'
                                : 'article-genere.html';

                            const blob = new Blob([generatedContent], { type: 'text/html' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.style.display = 'none';
                            a.href = url;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-semibold uppercase tracking-wide hover:bg-[#333] transition-colors rounded-sm"
                    >
                        <Download className="w-3.5 h-3.5" /> Exporter
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-auto custom-scrollbar bg-white">
                {activeTab === 'preview' && (
                    <div className="max-w-3xl mx-auto p-10 bg-white min-h-full
                        [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-black [&_h1]:mb-6 [&_h1]:uppercase [&_h1]:tracking-tight
                        [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-black [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[#E5E5E5]
                        [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-black [&_h3]:mt-6 [&_h3]:mb-3
                        [&_p]:text-[#767676] [&_p]:leading-7 [&_p]:mb-4
                        [&_a]:text-black [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2
                        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1.5 [&_li]:text-[#767676]
                        [&_strong]:font-semibold [&_strong]:text-black
                    ">
                        {generatedImageUrl && (
                            <figure className="mb-6">
                                <img
                                    src={generatedImageUrl}
                                    alt="Illustration générée"
                                    className="w-full h-auto"
                                />
                                <figcaption className="text-center text-[#767676] text-sm mt-2">
                                    Illustration : {keyword}
                                </figcaption>
                            </figure>
                        )}
                        {/* SECURITY: Using sanitized HTML to prevent XSS */}
                        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                    </div>
                )}
                {activeTab === 'wp' && (
                    <div className="h-full flex flex-col bg-[#1a1a1a]">
                        <div className="bg-[#111] px-4 py-2 text-xs text-[#767676] border-b border-[#333] flex items-center gap-2 font-mono">
                            <FileText className="w-3 h-3" />
                            WordPress Code
                        </div>
                        <textarea
                            readOnly
                            className="w-full h-full p-4 font-mono text-sm text-gray-300 bg-[#1a1a1a] resize-none outline-none leading-relaxed"
                            value={generatedContent}
                        />
                    </div>
                )}
                {activeTab === 'html' && (
                    <div className="h-full flex flex-col bg-[#0a0a0a]">
                        <div className="bg-[#111] px-4 py-2 text-xs text-[#767676] border-b border-[#333] flex items-center gap-2 font-mono">
                            <Code className="w-3 h-3" />
                            HTML Source
                        </div>
                        <textarea
                            readOnly
                            className="w-full h-full p-4 font-mono text-sm text-gray-300 bg-[#0a0a0a] resize-none outline-none leading-relaxed"
                            value={generatedContent}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
