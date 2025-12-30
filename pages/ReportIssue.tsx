
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
    
    const savedMessages = location.state?.savedMessages as Message[] | undefined;
    const [messages, setMessages] = useState<Message[]>(savedMessages || []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = async () => {
            const apiKey = process.env.API_KEY;
            if (!apiKey) return;
            const ai = new GoogleGenAI({ apiKey });
            chatRef.current = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: `Você é o AutoIntel Mechanic, mecânico sênior especializado em diagnóstico preventivo e corretivo. Responda em Português do Brasil. Use Markdown. Se identificar um problema grave, use termos como "PRIORIDADE MÁXIMA" em negrito.`,
                },
            });
        };
        initChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chatRef.current) return;
        const userText = input.trim();
        setInput('');
        setIsLoading(true);
        setHasSaved(false);
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
        setMessages(prev => [...prev, userMsg]);

        try {
            const aiMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '', isTyping: true }]);
            const result = await chatRef.current.sendMessageStream({ message: userText });
            let fullText = '';
            for await (const chunk of result) {
                const c = chunk as GenerateContentResponse;
                if (c.text) {
                    fullText += c.text;
                    setMessages(prev => prev.map(msg => 
                        msg.id === aiMsgId ? { ...msg, text: fullText, isTyping: false } : msg
                    ));
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPDF = () => {
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleSaveChat = async () => {
        if (!user || messages.length === 0 || isSaving) return;
        
        setIsSaving(true);
        const firstUserMsg = messages.find(m => m.role === 'user')?.text || 'Conversa sem título';
        const summary = firstUserMsg.length > 50 ? firstUserMsg.substring(0, 47) + '...' : firstUserMsg;

        const reportDataPayload = {
            type: 'chat',
            messages: messages,
            summary: summary
        };

        // Dados preparados para inserção (compatível com DB e LocalStorage)
        const dbPayload = {
            user_id: user.id,
            brand: 'IA',
            model: 'Consultoria',
            version: 'Mecânico Virtual',
            year: new Date().getFullYear().toString(),
            km: '0',
            score: 10,
            report_data: reportDataPayload
        };

        try {
            // Tenta salvar no Supabase
            const { error } = await supabase.from('reports').insert(dbPayload);

            if (error) throw error;
            setHasSaved(true);
            alert("Histórico da conversa salvo em seu perfil!");
        } catch (err: any) {
            console.error("Erro ao salvar chat no Supabase, tentando localmente:", err);
            
            // Fallback: Salvar no LocalStorage se a tabela não existir ou houver erro
            try {
                const localReports = JSON.parse(localStorage.getItem('local_reports') || '[]');
                const newLocalReport = {
                    id: `local-${Date.now()}`,
                    created_at: new Date().toISOString(),
                    ...dbPayload
                };
                localReports.push(newLocalReport);
                localStorage.setItem('local_reports', JSON.stringify(localReports));
                
                setHasSaved(true);
                alert("Conversa salva localmente (Banco de dados indisponível/offline).");
            } catch (localErr) {
                console.error("Erro ao salvar localmente:", localErr);
                alert("Não foi possível salvar a conversa.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-dark text-white relative">
            <style>
                {`
                @media print {
                    @page { margin: 1cm; size: auto; }
                    html, body, #root, .flex-1, main { 
                        height: auto !important; 
                        overflow: visible !important; 
                        display: block !important; 
                    }
                    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; visibility: hidden !important; }
                    .print-only { display: block !important; position: static !important; width: 100% !important; visibility: visible !important; }
                    .message-box { 
                        border: 1px solid #e2e8f0 !important; 
                        margin-bottom: 1.5rem !important; 
                        break-inside: avoid; 
                        border-radius: 12px !important; 
                        padding: 1.5rem !important; 
                        background: #f8fafc !important; 
                    }
                    .user-msg { border-left: 6px solid #135bec !important; }
                    .model-msg { border-left: 6px solid #10b981 !important; }
                }
                .print-only { display: none; }
                `}
            </style>

            {/* Print Template Layout */}
            <div className="print-only text-black bg-white">
                <div className="flex justify-between items-center border-b-4 border-primary pb-6 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#135bec' }}>
                            <span className="material-symbols-outlined text-3xl">network_intelligence</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-primary uppercase tracking-tighter leading-none" style={{ color: '#135bec' }}>AutoIntel AI</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Laudo Técnico de Consultoria Mecânica</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Data de Emissão</p>
                        <p className="text-sm font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mb-8" style={{ backgroundColor: 'rgba(19,91,236,0.05)' }}>
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-2" style={{ color: '#135bec' }}>Análise IA AutoScan</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Este documento consolida o diagnóstico preliminar realizado via Inteligência Artificial. 
                        As recomendações aqui contidas baseiam-se em padrões técnicos e histórico de falhas de modelos similares.
                    </p>
                </div>

                <div className="space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-box ${msg.role === 'user' ? 'user-msg' : 'model-msg'}`}>
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2">
                                {msg.role === 'user' ? 'Solicitação do Cliente' : 'Parecer Técnico IA'}
                            </p>
                            <div className="text-[13px] leading-relaxed text-gray-800 whitespace-pre-wrap font-medium">
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-[9px] text-gray-400 uppercase font-bold">
                        Aviso: Este laudo é puramente informativo. Recomendamos a validação por um mecânico credenciado.
                    </p>
                </div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-30 bg-background-dark/95 backdrop-blur-md border-b border-gray-800 p-4 flex items-center justify-between no-print">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition-colors p-1">
                        <span className="material-symbols-outlined text-[28px]">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl text-primary border border-primary/20 hidden sm:flex">
                            <span className="material-symbols-outlined text-[24px] font-bold">smart_toy</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight leading-tight">Mecânico Virtual</h2>
                            <p className="text-[10px] text-green-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                                <span className="block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                IA Ativa
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleSaveChat}
                        disabled={messages.length === 0 || isSaving || hasSaved}
                        className={`flex items-center justify-center size-10 rounded-xl transition-all ${
                            hasSaved ? 'bg-green-500 text-white' : 'bg-surface-highlight text-white hover:bg-white/10'
                        } disabled:opacity-30`}
                    >
                        {isSaving ? (
                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[22px]">{hasSaved ? 'check' : 'cloud_upload'}</span>
                        )}
                    </button>
                    
                    <button 
                        onClick={handleExportPDF}
                        disabled={messages.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-30 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        <span className="hidden xs:inline">Salvar PDF</span>
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-32 no-print">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-60 mt-12">
                        <div className="size-24 rounded-full bg-surface-dark flex items-center justify-center mb-6 ring-4 ring-primary/5">
                            <span className="material-symbols-outlined text-5xl text-primary">engineering</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Consultoria Técnica</h3>
                        <p className="text-lg text-slate-400 max-w-xs mx-auto">
                            Descreva os sintomas do carro para iniciarmos o diagnóstico por IA.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[90%] md:max-w-[75%] rounded-[2rem] p-6 shadow-2xl relative border
                                ${msg.role === 'user' 
                                    ? 'bg-primary text-white border-primary/20 rounded-tr-none' 
                                    : 'bg-surface-dark text-slate-100 border-white/5 rounded-tl-none'
                                }
                            `}>
                                {msg.role === 'model' && (
                                    <div className="flex gap-4 items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30 text-primary">
                                            <span className="material-symbols-outlined text-[24px] font-bold">build</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-primary uppercase tracking-widest">Análise Técnica</span>
                                        </div>
                                    </div>
                                )}
                                <div className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium">
                                    {msg.isTyping && !msg.text ? (
                                        <div className="flex gap-1.5 items-center h-6 px-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        </div>
                                    ) : (
                                        msg.text.split(/(\*\*.*?\*\*)/).map((part, i) => 
                                            part.startsWith('**') && part.endsWith('**') 
                                                ? <span key={i} className="inline-block px-3 py-1 my-1 bg-red-600/20 text-red-500 text-xs font-black rounded-md border border-red-500/20">{part.slice(2, -2).toUpperCase()}</span> 
                                                : part
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-16 left-0 right-0 p-5 bg-background-dark/95 backdrop-blur-xl border-t border-gray-800 z-40 md:relative md:bottom-0 no-print">
                <div className="max-w-4xl mx-auto flex items-end gap-3">
                    <div className="relative flex-1">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder="Ex: Luz do óleo piscando..."
                            className="w-full rounded-2xl border-2 border-gray-800 bg-surface-dark py-4 pl-5 pr-12 text-lg text-white placeholder-slate-500 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none resize-none max-h-32 min-h-[60px]"
                            rows={1}
                        />
                    </div>
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="flex items-center justify-center size-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 hover:bg-blue-600 disabled:opacity-50 transition-all active:scale-95 shrink-0"
                    >
                        {isLoading ? (
                            <span className="material-symbols-outlined animate-spin text-[28px]">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[28px] font-bold">send</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;
