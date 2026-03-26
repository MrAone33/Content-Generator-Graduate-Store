"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatPanel({ settings }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        const userMessage = { role: 'user', content: text };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiToken}`,
                },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erreur serveur');

            setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            setMessages([...newMessages, { role: 'assistant', content: `Erreur : ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-4">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-[#767676] text-sm">
                        Posez une question pour commencer la conversation.
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[75%] px-4 py-3 text-sm whitespace-pre-wrap rounded ${
                                msg.role === 'user'
                                    ? 'bg-black text-white'
                                    : 'bg-white border border-[#E5E5E5] text-black'
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-[#E5E5E5] px-4 py-3 text-sm text-[#767676] rounded">
                            <span className="animate-pulse">En train de reflechir...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#E5E5E5] pt-4 bg-[#F5F5F5]">
                <div className="flex gap-3">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ecrivez votre message..."
                        rows={2}
                        className="flex-1 px-4 py-3 border border-[#E5E5E5] focus:ring-1 focus:ring-black focus:border-black outline-none resize-none text-sm rounded-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`px-5 self-end py-3 font-semibold text-white transition-all rounded-sm ${
                            !input.trim() || isLoading
                                ? 'bg-[#E5E5E5] text-[#999] cursor-not-allowed'
                                : 'bg-black hover:bg-[#333]'
                        }`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
