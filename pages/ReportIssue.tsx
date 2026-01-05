
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppRoute } from '../types';

interface Message { id: string; role: 'user' | 'model'; text: string; }

const ReportIssue: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<any>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: { systemInstruction: "Você é o Mecânico Virtual Expert do AutoIntel AI. Forneça diagnósticos técnicos de alta precisão. Seja direto, técnico e utilize negrito para peças críticas. Comece sempre saudando o cliente como membro AutoIntel Pro." }
        });
    }, []);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async (textOverride?: string) => {
        const userText = textOverride || input.trim();
        if (!userText || !chatRef.current) return;
        
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
        setIsLoading(true);
        try {
            const aiMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '' }]);
            const result = await chatRef.current.sendMessageStream({ message: userText });
            let fullText = '';
            for await (const chunk of result) {
                const c = chunk as GenerateContentResponse;
                if (c.text) {
                    fullText += c.text;
                    setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: fullText } : msg));
                }
            }
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('A busca por voz não é suportada neste navegador.');
            return;
        }

        if (isRecording) {
            setIsRecording(false);
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };
        recognition.onerror = () => setIsRecording(false);

        recognition.start();
    };

    return (
        <div className="flex flex-col h-full bg-background-dark text-white relative page-transition overflow-hidden">
            <header className="sticky top-0 z-40 glass p-4 md:px-12 flex items-center justify-between no-print shadow-2xl">
                <div className="flex items-center gap-3 md:gap-6">
                    <button onClick={() => navigate(-1)} className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                        <span className="material-symbols-outlined text-[24px] md:text-[30px] font-bold">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="size-10 md:size-14 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                            <span className="material-symbols-outlined text-[24px] md:text-[32px] font-bold">smart_toy</span>
                        </div>
                        <div>
                            <h2 className="text-lg md:text-2xl font-black tracking-tight leading-tight">Mecânico Virtual</h2>
                            <p className="text-[8px] md:text-[10px] text-accent-green font-black uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1.5"><span className="size-1.5 bg-accent-green rounded-full animate-pulse"></span> Sistema Ativo</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-6 md:space-y-10 pb-48 no-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-60 mt-10 md:mt-20 px-6">
                        <div className="size-24 md:size-32 rounded-3xl md:rounded-[3rem] bg-surface-dark flex items-center justify-center mb-6 md:mb-10 ring-8 ring-primary/5 border border-white/5 shadow-2xl">
                            <span className="material-symbols-outlined text-[48px] md:text-[72px] text-primary">engineering</span>
                        </div>
                        <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-2 md:mb-4 text-white">Central de Diagnóstico</h3>
                        <p className="text-base md:text-xl text-slate-500 font-bold max-w-md mx-auto leading-relaxed">Fale o sintoma do seu carro ou digite sua dúvida mecânica.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[95%] sm:max-w-[85%] md:max-w-[70%] rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 shadow-2xl border ${msg.role === 'user' ? 'bg-primary text-white border-primary/20 rounded-tr-none' : 'bg-surface-dark text-slate-100 border-white/5 rounded-tl-none'}`}>
                                {msg.role === 'model' && (
                                    <div className="flex gap-2 items-center mb-4 md:mb-6">
                                        <span className="material-symbols-outlined text-primary text-[18px] md:text-[24px] font-black">build</span>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Parecer Técnico</span>
                                    </div>
                                )}
                                <div className="text-base md:text-2xl leading-relaxed whitespace-pre-wrap font-bold">
                                    {msg.text || (isLoading && <div className="flex gap-1.5 h-6 items-center px-1"><div className="size-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="size-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="size-2 bg-slate-500 rounded-full animate-bounce"></div></div>)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 p-4 md:p-12 glass z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="max-w-5xl mx-auto flex items-end gap-3 md:gap-6">
                    <div className="relative flex-1">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder="Descreva o sintoma..."
                            className="w-full rounded-2xl md:rounded-[2.5rem] border-2 border-white/5 bg-background-dark py-4 md:py-7 pl-6 md:pl-10 pr-12 md:pr-20 text-base md:text-2xl text-white placeholder-slate-700 focus:border-primary focus:ring-8 md:focus:ring-12 focus:ring-primary/10 outline-none resize-none max-h-32 md:max-h-48 min-h-[56px] md:min-h-[90px] transition-all font-bold"
                            rows={1}
                        />
                        <button 
                            onClick={toggleVoiceInput}
                            className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 size-10 md:size-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-accent-red animate-pulse text-white shadow-[0_0_20px_#EF4444]' : 'text-primary hover:bg-primary/10'}`}
                        >
                            <span className="material-symbols-outlined text-[24px] md:text-[32px] font-black">
                                {isRecording ? 'graphic_eq' : 'mic'}
                            </span>
                        </button>
                    </div>
                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="size-14 md:size-24 rounded-2xl md:rounded-[2.5rem] bg-primary text-white shadow-xl hover:scale-110 active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center group shrink-0"
                    >
                        <span className="material-symbols-outlined text-[28px] md:text-[42px] font-black group-hover:rotate-12 transition-transform">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;
