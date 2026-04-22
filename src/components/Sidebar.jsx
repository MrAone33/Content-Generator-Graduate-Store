import React from 'react';
import { FileText, Image, DollarSign, Settings, History } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'text', label: 'Génération de textes', icon: FileText },
        { id: 'image', label: 'Génération d\'image', icon: Image },
        { id: 'history', label: 'Historique', icon: History },
        { id: 'costs', label: 'Coûts & Projections', icon: DollarSign },
    ];

    return (
        <aside className="w-72 bg-white h-screen flex flex-col text-black flex-shrink-0 font-sans sticky top-0 border-r border-[#E5E5E5]">
            {/* Logo area */}
            <div className="px-6 h-20 flex items-center border-b border-[#E5E5E5] flex-shrink-0">
                <span className="font-bold text-lg tracking-[0.15em] text-black uppercase">GRADUATE</span>
            </div>

            {/* Main Navigation */}
            <div className="px-4 py-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                    <div>
                        <h3 className="px-4 text-[11px] font-semibold text-[#767676] uppercase tracking-widest mb-2">
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
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-all ${isActive
                                                ? 'text-black bg-[#F5F5F5] border-l-2 border-black'
                                                : 'text-[#767676] hover:text-black hover:bg-[#F5F5F5]'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#767676]'}`} />
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
            <div className="mt-auto p-4 border-t border-[#E5E5E5] bg-[#F5F5F5]/50 flex-shrink-0">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#767676] hover:text-black transition-all">
                    <Settings className="w-4 h-4" />
                    Paramètres
                </button>
                <div className="mt-4 px-4 text-[10px] text-[#999] font-medium tracking-wide uppercase">
                    Edited by Arthur Comets<br />v1.0.0
                </div>
            </div>
        </aside>
    );
}
