import React from 'react';
import { FileText, Image, Settings, Sparkles, LayoutDashboard } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'text', label: 'Génération de textes', icon: FileText },
        { id: 'image', label: 'Génération d\'image', icon: Image },
    ];

    return (
        <aside className="w-72 bg-[var(--color-sidebar)] h-screen flex flex-col text-[#111827] flex-shrink-0 font-sans sticky top-0 border-r border-gray-200">
            {/* Logo area */}
            <div className="px-6 h-20 flex items-center border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--color-primary)] p-1.5 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-base tracking-tight text-[#111827]">Content Generator</span>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="px-4 py-6 flex-1 overflow-y-auto custom-scrollbar">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-[#111827] mb-8 transition-colors text-left group">
                    <LayoutDashboard className="w-4 h-4 text-gray-400 group-hover:text-[#111827] transition-colors" />
                    Tableau de bord
                </button>

                <div className="space-y-6">
                    <div>
                        <h3 className="px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                            TOOLS
                        </h3>
                        <ul className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${isActive
                                                ? 'text-[--color-secondary]'
                                                : 'text-gray-500 hover:text-[#111827]'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-[--color-secondary]' : 'text-gray-400'}`} />
                                            {item.label}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom section */}
            <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium text-gray-500 hover:text-[#111827] transition-all">
                    <Settings className="w-4 h-4" />
                    Paramètres
                </button>
                <div className="mt-4 px-4 text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                    Edited by Arthur Comets<br />v1.0.2
                </div>
            </div>
        </aside>
    );
}
