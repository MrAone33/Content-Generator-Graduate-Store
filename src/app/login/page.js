"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, ChevronRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Redirect if already authenticated
        const storedToken = localStorage.getItem('api_token');
        if (storedToken) {
            router.push('/');
        }
    }, [router]);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate validation delay (or real validation if we had an endpoint for it)
        setTimeout(() => {
            localStorage.setItem('api_token', token);
            router.push('/');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[120px] pointer-events-none" />

            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-8 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-xl shadow-lg shadow-purple-500/20 mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Content Generator</h1>
                    <p className="text-slate-500 text-sm mt-2">Accès sécurisé à l'espace de génération</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Clé d'accès (Secret Token)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="••••••••••••••••••••••••••"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-slate-300 text-slate-800"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Accéder à l'outil <ChevronRight className="w-5 h-5" /></>}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">by Arthur Comets</span>
                </div>
            </div>
        </div>
    );
}
