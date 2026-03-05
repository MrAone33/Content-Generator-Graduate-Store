"use client";

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
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
                                <div className="bg-white p-6 border border-[#E5E5E5] space-y-6">
                                    <h3 className="text-lg font-semibold text-black uppercase tracking-wide">Paramètres Image</h3>

                                    {/* Keyword Input */}
                                    <div className={formData.isMockup ? 'opacity-50' : ''}>
                                        <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1">
                                            Sujet / Mot-clé
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.keyword}
                                            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                                            disabled={formData.isMockup}
                                            className={`w-full px-4 py-2 border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all ${formData.isMockup ? 'cursor-not-allowed bg-[#F5F5F5]' : ''}`}
                                            placeholder="Ex: Un café à Paris..."
                                        />
                                    </div>

                                    {/* Supplemental Prompt */}
                                    <div className={formData.isMockup ? 'opacity-50' : ''}>
                                        <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1">
                                            Complément de prompt (Optionnel)
                                        </label>
                                        <p className="text-xs text-[#767676] mb-2">Utilisez <code className="font-mono bg-[#F5F5F5] px-1">{`{keyword}`}</code> pour insérer le sujet dynamiquement.</p>
                                        <textarea
                                            value={formData.imagePrompt}
                                            onChange={(e) => setFormData({ ...formData, imagePrompt: e.target.value })}
                                            disabled={formData.isMockup}
                                            className={`w-full px-4 py-2 border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all h-32 resize-none ${formData.isMockup ? 'cursor-not-allowed bg-[#F5F5F5]' : ''}`}
                                            placeholder="Ex: Style cyberpunk, {keyword} sous la pluie..."
                                        />
                                    </div>

                                    {/* Format Selection */}
                                    <div className={formData.isMockup ? 'opacity-50' : ''}>
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
                                                    onClick={() => !formData.isMockup && setFormData({ ...formData, imageFormat: format.id })}
                                                    disabled={formData.isMockup}
                                                    className={`px-3 py-2 border text-sm font-medium transition-all ${formData.isMockup ? 'cursor-not-allowed' : ''} ${formData.imageFormat === format.id
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

                                    {/* Mockup Generation Option */}
                                    <div className="pt-4 border-t border-[#E5E5E5]">
                                        <div className="flex items-center gap-3 mb-4">
                                            <input
                                                type="checkbox"
                                                id="isMockup"
                                                checked={formData.isMockup}
                                                onChange={(e) => setFormData({ ...formData, isMockup: e.target.checked })}
                                                className="h-4 w-4 border-[#E5E5E5] text-black focus:ring-black cursor-pointer accent-black"
                                            />
                                            <label htmlFor="isMockup" className="text-sm font-medium text-black cursor-pointer select-none">
                                                Génération de Mockup
                                            </label>
                                        </div>

                                        {formData.isMockup && (
                                            <div className="space-y-4 pl-7">
                                                <div>
                                                    <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1">
                                                        Image de base (Vêtement/Objet)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setFormData(prev => ({ ...prev, mockupBaseImage: file }));
                                                            }
                                                        }}
                                                        className="block w-full text-xs text-[#767676]
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:border file:border-[#E5E5E5]
                                                            file:text-xs file:font-semibold
                                                            file:bg-[#F5F5F5] file:text-black
                                                            hover:file:bg-[#E5E5E5]
                                                        "
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1">
                                                        Logo à appliquer
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setFormData(prev => ({ ...prev, mockupLogoImage: file }));
                                                            }
                                                        }}
                                                        className="block w-full text-xs text-[#767676]
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:border file:border-[#E5E5E5]
                                                            file:text-xs file:font-semibold
                                                            file:bg-[#F5F5F5] file:text-black
                                                            hover:file:bg-[#E5E5E5]
                                                        "
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1">
                                                            Emplacement
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.mockupLocation}
                                                            onChange={(e) => setFormData({ ...formData, mockupLocation: e.target.value })}
                                                            placeholder="Ex: Cœur, Dos, Manche..."
                                                            className="w-full px-3 py-2 text-sm border border-[#E5E5E5] focus:ring-1 focus:ring-black outline-none"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1">
                                                                Taille
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.mockupSize}
                                                                onChange={(e) => setFormData({ ...formData, mockupSize: e.target.value })}
                                                                placeholder="Ex: 10cm, Large..."
                                                                className="w-full px-3 py-2 text-sm border border-[#E5E5E5] focus:ring-1 focus:ring-black outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide mb-1">
                                                                Alignement
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.mockupAlignment}
                                                                onChange={(e) => setFormData({ ...formData, mockupAlignment: e.target.value })}
                                                                placeholder="Ex: Centré, Haut..."
                                                                className="w-full px-3 py-2 text-sm border border-[#E5E5E5] focus:ring-1 focus:ring-black outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Generate Button */}
                                    <button
                                        onClick={() => handleGenerate('image')}
                                        disabled={isGenerating || (formData.isMockup ? (!formData.mockupBaseImage || !formData.mockupLogoImage) : !formData.keyword)}
                                        className={`w-full py-3 font-semibold text-white transition-all uppercase tracking-wider ${isGenerating || (formData.isMockup ? (!formData.mockupBaseImage || !formData.mockupLogoImage) : !formData.keyword)
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
                                    <div className="bg-white border border-[#E5E5E5] overflow-hidden h-fit">
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
                                    <div className="flex-1 bg-white border border-dashed border-[#E5E5E5] flex items-center justify-center text-[#767676]">
                                        <div className="text-center">
                                            <span className="text-4xl block mb-2 opacity-30">&#9634;</span>
                                            <p className="text-sm">L'image générée apparaîtra ici</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
