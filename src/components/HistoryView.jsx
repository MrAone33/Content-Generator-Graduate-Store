'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Image as ImageIcon, Trash2, RefreshCw, Clock, Eye } from 'lucide-react';
import { listHistory, getHistoryEntry, deleteHistoryEntry } from '../services/api';

function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function formatRelative(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days} j`;
}

export default function HistoryView({ settings, onLoadEntry }) {
    const [entries, setEntries] = useState([]);
    const [usage, setUsage] = useState({ count: 0, limit: 50 });
    const [enabled, setEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const refresh = async () => {
        if (!settings?.apiToken) return;
        setLoading(true);
        setError(null);
        try {
            const data = await listHistory(settings);
            setEntries(data.entries || []);
            setUsage(data.usage || { count: 0, limit: 50 });
            setEnabled(data.enabled !== false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [settings?.apiToken]);

    const handleLoad = async (id) => {
        if (!onLoadEntry) return;
        setBusyId(id);
        try {
            const data = await getHistoryEntry(settings, id);
            if (data?.entry) onLoadEntry(data.entry);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette entrée ?')) return;
        setBusyId(id);
        try {
            await deleteHistoryEntry(settings, id);
            setEntries(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const quotaPct = useMemo(() => {
        if (!usage.limit) return 0;
        return Math.min(100, Math.round((usage.count / usage.limit) * 100));
    }, [usage]);

    if (!enabled) {
        return (
            <div className="bg-white border border-[#E5E5E5] rounded p-8 text-center text-[#767676]">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Historique désactivé.</p>
                <p className="text-xs mt-2">Configurez <code className="font-mono bg-[#F5F5F5] px-1">UPSTASH_REDIS_REST_URL</code> et <code className="font-mono bg-[#F5F5F5] px-1">UPSTASH_REDIS_REST_TOKEN</code> pour activer.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border border-[#E5E5E5] rounded p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h3 className="text-lg font-semibold text-black uppercase tracking-wide">Historique</h3>
                        <p className="text-xs text-[#767676] mt-1">Les générations sont conservées 7 jours puis supprimées automatiquement.</p>
                    </div>
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#767676] text-xs font-medium transition-colors rounded-sm disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </button>
                </div>

                <div className="mt-5">
                    <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-[11px] font-semibold text-[#767676] uppercase tracking-wide">Quota du jour</span>
                        <span className="text-xs text-black font-medium">{usage.count} / {usage.limit}</span>
                    </div>
                    <div className="h-1.5 bg-[#F5F5F5] rounded-sm overflow-hidden">
                        <div
                            className={`h-full transition-all ${quotaPct >= 90 ? 'bg-red-500' : quotaPct >= 70 ? 'bg-orange-500' : 'bg-black'}`}
                            style={{ width: `${quotaPct}%` }}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {entries.length === 0 && !loading && !error ? (
                <div className="bg-white border border-dashed border-[#E5E5E5] rounded p-10 text-center text-[#767676]">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucune génération enregistrée pour le moment.</p>
                </div>
            ) : (
                <ul className="bg-white border border-[#E5E5E5] rounded divide-y divide-[#E5E5E5]">
                    {entries.map(entry => {
                        const Icon = entry.type === 'image' ? ImageIcon : FileText;
                        const isBusy = busyId === entry.id;
                        return (
                            <li key={entry.id} className="px-5 py-4 flex items-center gap-4 hover:bg-[#FAFAFA]">
                                <div className="w-9 h-9 flex items-center justify-center bg-[#F5F5F5] border border-[#E5E5E5] rounded-sm flex-shrink-0">
                                    <Icon className="w-4 h-4 text-black" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-black truncate">
                                            {entry.keyword || '(sans mot-clé)'}
                                        </span>
                                        {entry.hasImage && entry.type === 'text' && (
                                            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 bg-black text-white rounded-sm">+ image</span>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-[#767676] mt-0.5">
                                        {formatRelative(entry.createdAt)} · {formatDate(entry.createdAt)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleLoad(entry.id)}
                                        disabled={isBusy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-semibold uppercase tracking-wide hover:bg-[#333] transition-colors rounded-sm disabled:opacity-50"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Ouvrir
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        disabled={isBusy}
                                        className="flex items-center justify-center w-8 h-8 text-[#767676] hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-50"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
