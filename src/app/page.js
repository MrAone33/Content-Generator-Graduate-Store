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
        <div className="h-screen overflow-hidden bg-[--color-surface] flex">
            {/* Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Header activeTab={activeTab} handleLogout={handleLogout} />

                {/* Content */}
                <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {activeTab === 'text' && (
                        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
                            {/* LEFT COLUMN: Input Form */}
                            <div className="lg:col-span-4 space-y-6">
                                <SettingsPanel
                                    formData={formData}
                                    setFormData={setFormData}
                                    settings={settings}
                                    isGenerating={isGenerating}
                                    handleGenerate={handleGenerate}
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
                        <div className="max-w-2xl mx-auto mt-20">
                            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-3xl grayscale opacity-50">🎨</span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Génération d'image
                                </h2>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                    Le module de génération d'images via IA est en cours de développement. Disponible prochainement.
                                </p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100">
                                    Coming Soon
                                </span>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
