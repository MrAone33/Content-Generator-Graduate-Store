import { LogOut } from 'lucide-react';

export default function Header({ activeTab, handleLogout, language, setLanguage }) {
    const title = activeTab === 'text' ? 'Génération de textes' : 'Génération d\'image';
    const subtitle = activeTab === 'text' ? 'Vue d\'ensemble du générateur' : 'Création d\'images via IA';

    return (
        <header className="bg-white sticky top-0 z-10 border-b border-[#E5E5E5]">
            <div className="px-8 h-20 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-bold text-black tracking-tight uppercase">
                        {title}
                    </h1>
                    <span className="text-xs text-[#767676] font-medium">
                        {subtitle}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Toggle */}
                    <div className="flex items-center bg-[#F5F5F5] border border-[#E5E5E5] rounded-sm overflow-hidden">
                        <button
                            onClick={() => setLanguage('fr')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${language === 'fr' ? 'bg-black text-white' : 'text-[#767676] hover:bg-[#E5E5E5]'}`}
                        >
                            <span className="text-sm">🇫🇷</span> FR
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${language === 'en' ? 'bg-black text-white' : 'text-[#767676] hover:bg-[#E5E5E5]'}`}
                        >
                            <span className="text-sm">🇬🇧</span> EN
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-black text-white hover:bg-[#333] transition-all uppercase tracking-wider rounded-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
            </div>
        </header>
    );
}
