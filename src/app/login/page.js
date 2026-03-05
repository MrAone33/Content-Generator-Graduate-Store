"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ChevronRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('api_token');
        if (storedToken) {
            router.push('/');
        }
    }, [router]);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            localStorage.setItem('api_token', token);
            router.push('/');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="bg-white border border-[#E5E5E5] p-8 w-full max-w-md relative z-10 rounded">
                <div className="flex flex-col items-center mb-8">
                    <span className="font-bold text-2xl tracking-[0.2em] text-black uppercase mb-2">GRADUATE</span>
                    <div className="w-12 h-[1px] bg-black mb-4"></div>
                    <p className="text-[#767676] text-sm">Accès sécurisé à l'espace de génération</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#767676] uppercase tracking-wider ml-1">Clé d'accès (Secret Token)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-[#767676]" />
                            <input
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="••••••••••••••••••••••••••"
                                className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-[#999] text-black rounded-sm"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 flex items-center justify-center gap-2 font-semibold text-sm transition-all bg-black text-white hover:bg-[#333] uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed rounded-sm"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Accéder <ChevronRight className="w-5 h-5" /></>}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <span className="text-[10px] text-[#999] font-medium tracking-widest uppercase">Graduate Store</span>
                </div>
            </div>
        </div>
    );
}
