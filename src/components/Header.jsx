import { Sparkles, LogOut } from 'lucide-react';

export default function Header({ activeTab, handleLogout }) {
    const title = activeTab === 'text' ? 'Génération de textes' : 'Génération d\'image';
    const subtitle = activeTab === 'text' ? 'Vue d\'ensemble du générateur' : 'Création d\'images via IA';

    return (
        <header className="bg-white sticky top-0 z-10">
            <div className="px-8 h-20 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-bold text-[--color-text-primary] tracking-tight">
                        {title}
                    </h1>
                    <span className="text-xs text-[--color-text-muted] font-medium">
                        {subtitle}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <span className="sr-only">Toggle view</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition-all shadow-sm shadow-purple-500/20"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
            </div>
        </header>
    );
}
