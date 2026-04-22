import { LogOut } from 'lucide-react';

export default function Header({ activeTab, handleLogout }) {
    const titles = {
        text: ['Génération de textes', 'Vue d\'ensemble du générateur'],
        image: ['Génération d\'image', 'Création d\'images via IA'],
        history: ['Historique', 'Générations des 7 derniers jours'],
        costs: ['Coûts & Projections', 'Suivi de consommation'],
        chat: ['Chat', 'Discutez avec Claude'],
    };
    const [title, subtitle] = titles[activeTab] || titles.text;

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
