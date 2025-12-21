import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    isTyping?: boolean;
}

const ReportIssue: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    // Check for saved state to restore
    const savedMessages = location.state?.savedMessages as Message[] | undefined;

    const [messages, setMessages] = useState<Message[]>(savedMessages || []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Chat reference to maintain context
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Gemini Chat
    useEffect(() => {
        const initChat = async () => {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                console.error("API Key not found");
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            
            // Start a new chat session
            chatRef.current = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: `
                        Você é um mecânico automotivo sênior e consultor técnico com décadas de experiência chamado "AutoIntel Mechanic".
                        
                        Sua função é ouvir os sintomas descritos pelo usuário e fornecer:
                        1. Um diagnóstico preliminar provável.
                        2. Causas possíveis (da mais comum para a menos comum).
                        3. Estimativa de gravidade (Baixa, Média, Alta/Perigosa).
                        4. Passos simples que o usuário pode verificar visualmente (se seguro).
                        
                        Diretrizes de Tom:
                        - Seja empático, técnico mas didático.
                        - Fale sempre em Português do Brasil.
                        - Use formatação Markdown (negrito, listas) para facilitar a leitura.
                        
                        AVISO OBRIGATÓRIO:
                        Sempre termine suas análises técnicas com uma nota curta lembrando que este é um diagnóstico via IA e não substitui uma inspeção presencial por um profissional.
                    `,
                },
            });

            // If we are restoring history, we need to populate the chat history for the model context
            if (savedMessages && savedMessages.length > 0) {
               // Context restored manually via UI logic
            }
        };

        initChat();
    }, [savedMessages]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chatRef.current) return;

        const userText = input.trim();
        setInput('');
        setIsLoading(true);

        // Add User Message
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
        setMessages(prev => [...prev, userMsg]);

        try {
            // Add Placeholder for AI Response
            const aiMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '', isTyping: true }]);

            // Stream response
            const result = await chatRef.current.sendMessageStream({ message: userText });
            
            let fullText = '';
            
            for await (const chunk of result) {
                const c = chunk as GenerateContentResponse;
                if (c.text) {
                    fullText += c.text;
                    setMessages(prev => prev.map(msg => 
                        msg.id === aiMsgId 
                        ? { ...msg, text: fullText, isTyping: false } 
                        : msg
                    ));
                }
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: 'Desculpe, tive um problema ao processar sua solicitação. Verifique sua conexão ou tente novamente.' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveChat = async () => {
        if (messages.length === 0) return;
        if (!user) {
            alert("Você precisa estar logado para salvar o histórico no perfil.");
            return;
        }

        setIsSaving(true);
        try {
            // Extract a title from the first user message or use default
            const firstUserMsg = messages.find(m => m.role === 'user');
            const summary = firstUserMsg ? firstUserMsg.text.substring(0, 30) + '...' : 'Consultoria Geral';

            const { error } = await supabase
                .from('reports')
                .insert({
                    user_id: user.id,
                    brand: 'Consultoria', // Special marker
                    model: 'Mecânico AI',  // Special marker
                    year: new Date().getFullYear().toString(),
                    km: '0', 
                    score: 0, // 0 indicates chat/consultation
                    report_data: {
                        type: 'chat',
                        summary: summary,
                        messages: messages.map(m => ({ ...m, isTyping: false })) // Clean typing state
                    }
                });

            if (error) {
                console.error("Supabase error:", error);
                throw error;
            }
            alert("Conversa salva no seu perfil!");
        } catch (error: any) {
            console.error("Error saving chat:", error);
            alert(`Erro ao salvar conversa: ${error.message || 'Tente novamente.'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrintPdf = () => {
        window.print();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestions = [
        "Carro fazendo barulho ao frear",
        "Luz de injeção acesa",
        "Motor falhando na partida",
        "Ar condicionado não gela"
    ];

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative print:bg-white print:h-auto print:block">
            {/* Header (Hidden on Print) */}
            <div className="flex items-center bg-white dark:bg-surface-dark p-4 justify-between border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 sticky top-0 print:hidden">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white md:hidden">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl text-primary">
                            <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Mecânico Virtual</h2>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                <span className="block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Online • IA Ativa
                            </p>
                        </div>
                    </div>
                </div>
                {/* Actions */}
                {messages.length > 0 && (
                    <div className="flex gap-2">
                         <button 
                            onClick={handlePrintPdf}
                            className="flex items-center justify-center size-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-slate-700 dark:text-white transition-colors"
                            title="Baixar PDF"
                        >
                            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                        </button>
                        <button 
                            onClick={handleSaveChat}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                        >
                            {isSaving ? (
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[18px]">save</span>
                            )}
                            <span className="hidden sm:inline">Salvar</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block p-8 border-b border-gray-300 mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-4xl text-black">smart_toy</span>
                    <h1 className="text-3xl font-bold text-black">AutoIntel - Mecânico Virtual</h1>
                </div>
                <p className="text-gray-600">Relatório de Consultoria Técnica</p>
                <p className="text-xs text-gray-500 mt-2">Gerado em {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
                    Aviso: As informações abaixo são geradas por Inteligência Artificial e servem como orientação preliminar. Não substituem a avaliação presencial de um profissional.
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 md:p-6 print:overflow-visible print:h-auto print:pb-0">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-80 mt-10 print:hidden">
                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">support_agent</span>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Como posso ajudar hoje?</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
                            Descreva os sintomas do seu veículo. Posso ajudar a identificar problemas mecânicos, elétricos ou dúvidas de manutenção.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                            {suggestions.map((suggestion, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => {
                                        setInput(suggestion);
                                        // Optional: Auto send
                                    }}
                                    className="text-sm text-left p-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:border-primary text-slate-700 dark:text-gray-300 transition-colors shadow-sm"
                                >
                                    "{suggestion}"
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} print:block print:mb-4`}
                        >
                            <div className={`
                                max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm relative
                                ${msg.role === 'user' 
                                    ? 'bg-primary text-white rounded-tr-none print:bg-white print:text-black print:border print:border-gray-300 print:w-full print:max-w-full print:text-right' 
                                    : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none print:bg-white print:text-black print:border-gray-300 print:w-full print:max-w-full print:text-left'
                                }
                            `}>
                                {msg.role === 'model' && (
                                    <div className="absolute -top-6 left-0 text-xs text-slate-500 dark:text-gray-400 font-medium flex items-center gap-1 print:static print:mb-1 print:text-primary print:font-bold">
                                        <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                                        AutoIntel AI
                                    </div>
                                )}
                                {msg.role === 'user' && (
                                     <div className="hidden print:block text-xs font-bold text-gray-600 mb-1">Usuário</div>
                                )}

                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.isTyping && !msg.text ? (
                                        <div className="flex gap-1 items-center h-5 px-1 print:hidden">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                        </div>
                                    ) : (
                                        // Simple markdown-like rendering for bold
                                        msg.text.split(/(\*\*.*?\*\*)/).map((part, i) => 
                                            part.startsWith('**') && part.endsWith('**') 
                                                ? <strong key={i}>{part.slice(2, -2)}</strong> 
                                                : part
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} className="print:hidden" />
            </div>

            {/* Input Area (Hidden on Print) */}
            <div className="p-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 sticky bottom-0 md:relative z-20 pb-safe md:pb-4 print:hidden">
                <div className="max-w-4xl mx-auto relative flex items-end gap-2">
                    <div className="relative flex-1">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Descreva o problema (ex: barulho ao virar o volante...)"
                            className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-background-dark py-3 pl-4 pr-10 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none max-h-32 min-h-[50px] scrollbar-thin"
                            rows={1}
                        />
                    </div>
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="flex items-center justify-center size-12 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
                    >
                        {isLoading ? (
                            <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[24px]">send</span>
                        )}
                    </button>
                </div>
                <p className="text-center text-[10px] text-slate-400 dark:text-gray-500 mt-2">
                    A IA pode cometer erros. Considere verificar informações importantes.
                </p>
            </div>
        </div>
    );
};

export default ReportIssue;