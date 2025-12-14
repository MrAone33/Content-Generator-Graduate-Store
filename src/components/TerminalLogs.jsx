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
        <div className="bg-[#1a1f36] rounded-lg border border-[#2d3555] overflow-hidden text-gray-400 text-xs font-mono">
            <div className="px-4 py-2 bg-[#151929] border-b border-[#2d3555] flex justify-between items-center">
                <span className="text-gray-500 uppercase tracking-wider text-[10px]">Terminal</span>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/60"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/60"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/60"></div>
                </div>
            </div>
            <div
                ref={logsContainerRef}
                className="p-4 h-44 overflow-y-auto space-y-2 custom-scrollbar"
            >
                {errorMsg && (
                    <div className="flex items-start gap-2 text-red-400 bg-red-500/10 p-2 rounded">
                        <AlertCircle className="w-3 h-3 mt-0.5" />
                        <span>ERREUR : {errorMsg}</span>
                    </div>
                )}
                {logs.length === 0 && !errorMsg && (
                    <span className="text-gray-600 italic">En attente d'instructions...</span>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                        {log.status === 'loading' && <Loader2 className="w-3 h-3 mt-0.5 animate-spin text-[--color-primary]" />}
                        {log.status === 'success' && <CheckCircle2 className="w-3 h-3 mt-0.5 text-[--color-success]" />}
                        {log.status === 'error' && <AlertCircle className="w-3 h-3 mt-0.5 text-[--color-error]" />}
                        <span className={`${log.status === 'loading' ? 'text-purple-300' : log.status === 'success' ? 'text-green-300' : log.status === 'error' ? 'text-red-300' : 'text-gray-400'}`}>
                            <span className="opacity-50 mr-1">[{log.step.toUpperCase()}]</span> {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
