import React, { useState } from 'react';
import { Globe, Code, FileText, ImageIcon, Copy, Download, Check } from 'lucide-react';

export default function ResultView({ generatedContent, generatedImageUrl, keyword }) {
    const [activeTab, setActiveTab] = useState('preview');
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!generatedContent) {
        return (
            <div className="card flex-grow flex items-center justify-center text-[--color-text-muted]">
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
            <div className="border-b border-[--color-border] px-4 py-2 bg-[--color-surface] flex flex-wrap items-center justify-between gap-2">
                <div className="flex bg-white border border-[--color-border] p-0.5 rounded-md">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'preview' ? 'bg-[--color-primary] text-white' : 'text-[--color-text-secondary] hover:bg-gray-50'}`}
                    >
                        <Globe className="w-3.5 h-3.5" /> Visuel
                    </button>
                    <button
                        onClick={() => setActiveTab('wp')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'wp' ? 'bg-[--color-primary] text-white' : 'text-[--color-text-secondary] hover:bg-gray-50'}`}
                    >
                        <FileText className="w-3.5 h-3.5" /> WordPress
                    </button>
                    <button
                        onClick={() => setActiveTab('html')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'html' ? 'bg-[--color-primary] text-white' : 'text-[--color-text-secondary] hover:bg-gray-50'}`}
                    >
                        <Code className="w-3.5 h-3.5" /> HTML
                    </button>

                    {generatedImageUrl && (
                        <a
                            href={generatedImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 text-[--color-text-secondary] hover:bg-gray-50"
                        >
                            <ImageIcon className="w-3.5 h-3.5" /> Image
                        </a>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => copyToClipboard(generatedContent)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[--color-border] hover:bg-gray-50 text-[--color-text-secondary] rounded-md text-xs font-medium transition-colors"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-[--color-success]" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copié!' : 'Copier'}
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 btn-primary text-xs">
                        <Download className="w-3.5 h-3.5" /> Exporter
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-auto custom-scrollbar bg-[--color-surface]">
                {activeTab === 'preview' && (
                    <div className="max-w-3xl mx-auto p-10 bg-white min-h-full
                        [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[--color-text-primary] [&_h1]:mb-6
                        [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[--color-text-primary] [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[--color-border]
                        [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-[--color-text-primary] [&_h3]:mt-6 [&_h3]:mb-3
                        [&_p]:text-[--color-text-secondary] [&_p]:leading-7 [&_p]:mb-4
                        [&_a]:text-[--color-primary] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2
                        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1.5 [&_li]:text-[--color-text-secondary]
                        [&_strong]:font-semibold [&_strong]:text-[--color-text-primary]
                    ">
                        {generatedImageUrl && (
                            <figure className="mb-6">
                                <img
                                    src={generatedImageUrl}
                                    alt="Illustration générée"
                                    className="w-full h-auto rounded-lg"
                                />
                                <figcaption className="text-center text-[--color-text-muted] text-sm mt-2">
                                    Illustration : {keyword}
                                </figcaption>
                            </figure>
                        )}
                        <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
                    </div>
                )}
                {activeTab === 'wp' && (
                    <div className="h-full flex flex-col bg-[#1e1e1e]">
                        <div className="bg-[#252526] px-4 py-2 text-xs text-gray-400 border-b border-black/20 flex items-center gap-2 font-mono">
                            <FileText className="w-3 h-3" />
                            WordPress Code
                        </div>
                        <textarea
                            readOnly
                            className="w-full h-full p-4 font-mono text-sm text-gray-300 bg-[#1e1e1e] resize-none outline-none leading-relaxed"
                            value={generatedContent}
                        />
                    </div>
                )}
                {activeTab === 'html' && (
                    <div className="h-full flex flex-col bg-[#0d1117]">
                        <div className="bg-[#161b22] px-4 py-2 text-xs text-gray-400 border-b border-[#30363d] flex items-center gap-2 font-mono">
                            <Code className="w-3 h-3" />
                            HTML Source
                        </div>
                        <textarea
                            readOnly
                            className="w-full h-full p-4 font-mono text-sm text-gray-300 bg-[#0d1117] resize-none outline-none leading-relaxed"
                            value={generatedContent}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
