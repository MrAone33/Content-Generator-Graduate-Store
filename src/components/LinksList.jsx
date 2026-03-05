import React from 'react';
import { Plus, Trash2, PenTool, Link as LinkIcon } from 'lucide-react';

export default function LinksList({ links, setLinks }) {

    const handleAddLink = () => {
        setLinks([...links, { anchor: '', url: '' }]);
    };

    const handleRemoveLink = (index) => {
        if (links.length > 1) {
            setLinks(links.filter((_, i) => i !== index));
        }
    };

    const handleLinkChange = (index, field, value) => {
        const newLinks = [...links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setLinks(newLinks);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#767676] uppercase tracking-wider ml-1">Liens à intégrer</label>
                <button
                    onClick={handleAddLink}
                    className="text-xs flex items-center gap-1 text-black hover:text-[#333] font-semibold transition-colors bg-[#F5F5F5] px-2 py-0.5 hover:bg-[#E5E5E5] uppercase tracking-wide"
                >
                    <Plus className="w-3 h-3" /> Ajouter
                </button>
            </div>

            <div className="space-y-3">
                {links.map((link, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 p-3 bg-[#F5F5F5] border border-[#E5E5E5] relative group">
                        {links.length > 1 && (
                            <button
                                onClick={() => handleRemoveLink(index)}
                                className="absolute right-2 top-2 p-1 text-[#767676] hover:text-[#FF0000] hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                title="Supprimer ce lien"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                        <div className="space-y-1">
                            <label className="text-[10px] text-[#767676] uppercase font-semibold ml-1">Ancre #{index + 1}</label>
                            <div className="relative">
                                <PenTool className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#767676]" />
                                <input
                                    type="text"
                                    value={link.anchor}
                                    onChange={(e) => handleLinkChange(index, 'anchor', e.target.value)}
                                    className="w-full pl-8 pr-4 py-2 bg-white border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-[#999] text-xs text-black"
                                    placeholder="Ex: meilleur outil"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-[#767676] uppercase font-semibold ml-1">URL cible</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#767676]" />
                                <input
                                    type="text"
                                    value={link.url}
                                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                    className="w-full pl-8 pr-4 py-2 bg-white border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-[#999] text-xs text-black"
                                    placeholder="Ex: https://..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
