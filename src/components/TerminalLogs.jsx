import React, { useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TerminalLogs({ logs, errorMsg }) {
    const logsContainerRef = useRef(null);

    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTo({
                top: logsContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [logs]);

    return (
        <div className="bg-[#0a0a0a] border border-[#222] overflow-hidden text-[#767676] text-xs font-mono rounded">
            <div className="px-4 py-2 bg-[#111] border-b border-[#222] flex justify-between items-center">
                <span className="text-[#767676] uppercase tracking-wider text-[10px] font-semibold">Terminal</span>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#FF0000]/60"></div>
                    <div className="w-2 h-2 rounded-full bg-[#767676]/60"></div>
                    <div className="w-2 h-2 rounded-full bg-white/60"></div>
                </div>
            </div>
            <div
                ref={logsContainerRef}
                className="p-4 h-44 overflow-y-auto space-y-2 custom-scrollbar"
            >
                {errorMsg && (
                    <div className="flex items-start gap-2 text-[#FF0000] bg-[#FF0000]/10 p-2 rounded-sm">
                        <AlertCircle className="w-3 h-3 mt-0.5" />
                        <span>ERREUR : {errorMsg}</span>
                    </div>
                )}
                {logs.length === 0 && !errorMsg && (
                    <span className="text-[#555] italic">En attente d'instructions...</span>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                        {log.status === 'loading' && <Loader2 className="w-3 h-3 mt-0.5 animate-spin text-white" />}
                        {log.status === 'success' && <CheckCircle2 className="w-3 h-3 mt-0.5 text-white" />}
                        {log.status === 'error' && <AlertCircle className="w-3 h-3 mt-0.5 text-[#FF0000]" />}
                        <span className={`${log.status === 'loading' ? 'text-white' : log.status === 'success' ? 'text-[#999]' : log.status === 'error' ? 'text-[#FF0000]' : 'text-[#767676]'}`}>
                            <span className="opacity-50 mr-1">[{log.step.toUpperCase()}]</span> {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
