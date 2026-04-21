"use client";

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CostOverview from '../components/CostOverview';
import SettingsPanel from '../components/SettingsPanel';
import TerminalLogs from '../components/TerminalLogs';
import ResultView from '../components/ResultView';
import { useGenerator } from '../hooks/useGenerator';

export default function SeoGeneratorApp() {
    const [activeTab, setActiveTab] = useState('text');

    const {
        formData, setFormData,
        settings, setSettings,
        isGenerating,
        generatedContent,
        generatedImageUrl,
        logs,
        errorMsg,
        handleGenerate,
        handleStop,
        handleLogout
    } = useGenerator();

    return (
        <div className="h-screen overflow-hidden bg-white flex">
            {/* Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Header activeTab={activeTab} handleLogout={handleLogout} />

                {/* Content */}
                <main className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#F5F5F5]">
                    {activeTab === 'text' && (
                        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
                            {/* LEFT COLUMN: Input Form */}
                            <div className="lg:col-span-4 space-y-6">
                                <SettingsPanel
                                    formData={formData}
                                    setFormData={setFormData}
                                    settings={settings}
                                    isGenerating={isGenerating}
                                    handleGenerate={() => handleGenerate('text')}
                                    handleStop={handleStop}
                                />
                                <TerminalLogs logs={logs} errorMsg={errorMsg} />
                            </div>

                            {/* RIGHT COLUMN: Output */}
                            <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
                                <ResultView
                                    generatedContent={generatedContent}
                                    generatedImageUrl={generatedImageUrl}
                                    keyword={formData.keyword}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'image' && (
                        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
                            {/* LEFT COLUMN: Input Form */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white p-6 border border-[#E5E5E5] space-y-6 rounded">
                                    <h3 className="text-lg font-semibold text-black uppercase tracking-wide">Paramètres Image</h3>

                                    {/* Keyword Input */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1">
                                            Sujet / Mot-clé
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.keyword}
                                            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                                            className="w-full px-4 py-2 border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all rounded-sm"
                                            placeholder="Ex: Un café à Paris..."
                                        />
                                    </div>

                                    {/* Supplemental Prompt */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1">
                                            Complément de prompt (Optionnel)
                                        </label>
                                        <p className="text-xs text-[#767676] mb-2">Utilisez <code className="font-mono bg-[#F5F5F5] px-1">{`{keyword}`}</code> pour insérer le sujet dynamiquement.</p>
                                        <textarea
                                            value={formData.imagePrompt}
                                            onChange={(e) => setFormData({ ...formData, imagePrompt: e.target.value })}
                                            className="w-full px-4 py-2 border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all h-32 resize-none rounded-sm"
                                            placeholder="Ex: Style cyberpunk, {keyword} sous la pluie..."
                                        />
                                    </div>

                                    {/* Format Selection */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-2">
                                            Format
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'landscape', label: 'Paysage', icon: '▭' },
                                                { id: 'portrait', label: 'Portrait', icon: '▯' },
                                                { id: 'square', label: 'Carré', icon: '□' },
                                            ].map((format) => (
                                                <button
                                                    key={format.id}
                                                    onClick={() => setFormData({ ...formData, imageFormat: format.id })}
                                                    className={`px-3 py-2 border text-sm font-medium transition-all rounded-sm ${formData.imageFormat === format.id
                                                        ? 'bg-black border-black text-white'
                                                        : 'bg-white border-[#E5E5E5] text-[#767676] hover:bg-[#F5F5F5]'
                                                        }`}
                                                >
                                                    <span className="block text-lg mb-1">{format.icon}</span>
                                                    {format.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Generate Button */}
                                    <button
                                        onClick={() => handleGenerate('image')}
                                        disabled={isGenerating || !formData.keyword}
                                        className={`w-full py-3 font-semibold text-white transition-all uppercase tracking-wider rounded-sm ${isGenerating || !formData.keyword
                                            ? 'bg-[#E5E5E5] text-[#999] cursor-not-allowed'
                                            : 'bg-black hover:bg-[#333]'
                                            }`}
                                    >
                                        {isGenerating ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Génération...
                                            </span>
                                        ) : (
                                            'Générer l\'image'
                                        )}
                                    </button>
                                </div>
                                <TerminalLogs logs={logs} errorMsg={errorMsg} />
                            </div>

                            {/* RIGHT COLUMN: Output */}
                            <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
                                {generatedImageUrl ? (
                                    <div className="bg-white border border-[#E5E5E5] overflow-hidden h-fit rounded">
                                        <div className="p-4 border-b border-[#E5E5E5] flex justify-between items-center bg-[#F5F5F5]">
                                            <h3 className="font-semibold text-black uppercase tracking-wide">Résultat</h3>
                                            <a
                                                href={generatedImageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-black hover:text-[#333] font-semibold underline underline-offset-2"
                                            >
                                                Télécharger Original
                                            </a>
                                        </div>
                                        <div className="p-6 flex items-center justify-center bg-[#F5F5F5] min-h-[400px]">
                                            <img
                                                src={generatedImageUrl}
                                                alt="Generated"
                                                className="max-w-full h-auto object-contain max-h-[700px]"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 bg-white border border-dashed border-[#E5E5E5] flex items-center justify-center text-[#767676] rounded">
                                        <div className="text-center">
                                            <span className="text-4xl block mb-2 opacity-30">&#9634;</span>
                                            <p className="text-sm">L'image générée apparaîtra ici</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'costs' && (
                        <div className="max-w-[900px] mx-auto pb-10">
                            <CostOverview />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
