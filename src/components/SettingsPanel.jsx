import React from 'react';
import { Search, ChevronRight, Loader2, XCircle, ChevronDown, Check, Settings } from 'lucide-react';
import LinksList from './LinksList';

export default function SettingsPanel({
    formData,
    setFormData,
    settings,
    isGenerating,
    handleGenerate,
    handleStop
}) {
    return (
        <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-[#E5E5E5] flex items-center gap-2 bg-[#F5F5F5]">
                <Settings className="w-4 h-4 text-black" />
                <h2 className="font-semibold text-black text-sm uppercase tracking-wide">Paramètres</h2>
            </div>

            <div className="p-5 space-y-4">
                {/* Language */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide">
                        Langue
                    </label>
                    <div className="flex bg-[#F5F5F5] border border-[#E5E5E5] rounded-sm overflow-hidden">
                        <button
                            onClick={() => setFormData({ ...formData, language: 'fr' })}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all ${formData.language === 'fr' ? 'bg-black text-white' : 'text-[#767676] hover:bg-[#E5E5E5]'}`}
                        >
                            <span className="text-sm">🇫🇷</span> Français
                        </button>
                        <button
                            onClick={() => setFormData({ ...formData, language: 'en' })}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all ${formData.language === 'en' ? 'bg-black text-white' : 'text-[#767676] hover:bg-[#E5E5E5]'}`}
                        >
                            <span className="text-sm">🇬🇧</span> English
                        </button>
                    </div>
                </div>

                {/* Content Type */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide">
                        Type de contenu
                    </label>
                    <div className="relative">
                        <select
                            value={formData.contentType}
                            onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none text-sm appearance-none cursor-pointer rounded-sm"
                        >
                            <option value="cocon">Article Cocon</option>
                            <option value="categorie">Catégorie Ecom</option>
                            <option value="marque">Marque Ecom</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-[#767676] pointer-events-none" />
                    </div>
                </div>

                {/* Keyword */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide">
                        Mot-clé principal
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#999]" />
                        <input
                            type="text"
                            value={formData.keyword}
                            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none text-sm rounded-sm"
                            placeholder="Ex: formation seo"
                        />
                    </div>
                </div>

                {/* Links */}
                <LinksList
                    links={formData.links}
                    setLinks={(newLinks) => setFormData({ ...formData, links: newLinks })}
                />

                <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            id="includeAuthorityLink"
                            checked={formData.includeAuthorityLink}
                            onChange={(e) => setFormData({ ...formData, includeAuthorityLink: e.target.checked })}
                            className="peer h-4 w-4 cursor-pointer appearance-none border border-[#E5E5E5] bg-white checked:bg-black checked:border-black transition-all rounded-[3px]"
                        />
                        <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" />
                    </div>
                    <label htmlFor="includeAuthorityLink" className="text-xs text-[#767676] cursor-pointer">
                        Ajouter un lien de référence (Auto)
                    </label>
                </div>

                {/* Tone & Length */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide">Ton</label>
                        <div className="relative">
                            <select
                                value={formData.tone}
                                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none text-sm appearance-none cursor-pointer rounded-sm"
                            >
                                <option value="graduate">Graduate (Auto)</option>
                                <option value="expert">Expert</option>
                                <option value="pedagogique">Pédagogique</option>
                                <option value="journalistique">Journalistique</option>
                                <option value="commercial">Commercial</option>
                                <option value="neutre">Neutre</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-[#767676] pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide">Longueur</label>
                        <div className="relative">
                            <select
                                value={formData.length}
                                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none text-sm appearance-none cursor-pointer rounded-sm"
                            >
                                <option>150 mots (Fiche produit)</option>
                                <option>500 mots</option>
                                <option>800 mots</option>
                                <option>1200 mots</option>
                                <option>2000+ mots</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-[#767676] pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Brief */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wide">Brief éditorial</label>
                    <textarea
                        value={formData.brief}
                        onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none min-h-[80px] text-sm resize-none rounded-sm"
                        placeholder="Ex: Texte destiné aux RH..."
                    />
                </div>

                {/* Image checkbox */}
                <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            id="genImage"
                            checked={formData.generateImage}
                            onChange={(e) => setFormData({ ...formData, generateImage: e.target.checked })}
                            className="peer h-4 w-4 cursor-pointer appearance-none border border-[#E5E5E5] bg-white checked:bg-black checked:border-black transition-all rounded-[3px]"
                        />
                        <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" />
                    </div>
                    <label htmlFor="genImage" className="text-xs text-[#767676] cursor-pointer">
                        Générer une image d'illustration
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`w-full py-2.5 px-4 flex items-center justify-center gap-2 font-semibold text-sm transition-all uppercase tracking-wider ${isGenerating
                            ? 'bg-[#F5F5F5] text-[#999] cursor-not-allowed'
                            : 'btn-primary'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Génération en cours...
                            </>
                        ) : (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                Générer le contenu
                            </>
                        )}
                    </button>

                    {isGenerating && (
                        <button
                            onClick={handleStop}
                            className="w-full py-2 px-4 flex items-center justify-center gap-2 font-medium text-xs text-[#FF0000] bg-red-50 border border-red-100 hover:bg-red-100 transition-colors rounded-sm"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Arrêter
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
