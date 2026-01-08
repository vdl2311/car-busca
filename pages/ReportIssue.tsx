
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppRoute } from '../types';

interface Message { id: string; role: 'user' | 'model'; text: string; image?: string; }

const ReportIssue: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string } | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<any>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const initChat = async () => {
            try {
                const apiKey = process.env.API_KEY;
                if (!apiKey || apiKey === 'undefined' || apiKey === '') {
                    setError("Chave de API não configurada. Verifique as variáveis de ambiente.");
                    return;
                }

                const ai = new GoogleGenAI({ apiKey });
                chatRef.current = ai.chats.create({
                    model: 'gemini-3-flash-preview',
                    config: { 
                        systemInstruction: "Você é o Mecânico Virtual Expert do AutoIntel AI. Forneça diagnósticos técnicos de alta precisão de forma que um leigo entenda. Analise imagens detalhadamente caso o usuário envie. Seja direto, utilize negrito para peças e termos importantes. Comece saudando o cliente e peça Marca/Modelo/Ano se ele não informar." 
                    }
                });
            } catch (err) {
                console.error("Erro ao inicializar chat:", err);
                setError("Falha ao conectar com o motor neural.");
            }
        };

        initChat();

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    useEffect(() => { 
        if (messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
        }
    }, [messages]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            setSelectedImage({
                data: base64Data,
                mimeType: file.type
            });
        };
        reader.readAsDataURL(file);
    };

    const handleSend = async (textOverride?: string) => {
        const userText = textOverride || input.trim();
        if (!userText && !selectedImage) return;
        
        const currentImage = selectedImage;
        const userMsgId = Date.now().toString();
        
        setMessages(prev => [...prev, { 
            id: userMsgId, 
            role: 'user', 
            text: userText,
            image: currentImage ? `data:${currentImage.mimeType};base64,${currentImage.data}` : undefined
        }]);

        setInput('');
        setSelectedImage(null);
        setIsLoading(true);

        try {
            const aiMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '' }]);

            let fullText = '';
            
            if (currentImage) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const result = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: {
                        parts: [
                            { text: userText || "Analise esta imagem do meu veículo." },
                            { inlineData: { data: currentImage.data, mimeType: currentImage.mimeType } }
                        ]
                    },
                    config: {
                        systemInstruction: "Você é o Mecânico Virtual Expert do AutoIntel AI. Explique o diagnóstico da imagem de forma simples para o dono do carro."
                    }
                });
                
                fullText = result.text || "Desculpe, não consegui analisar esta imagem.";
                setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: fullText } : msg));
            } else {
                const result = await chatRef.current.sendMessageStream({ message: userText });
                for await (const chunk of result) {
                    const c = chunk as GenerateContentResponse;
                    if (c.text) {
                        fullText += c.text;
                        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: fullText } : msg));
                    }
                }
            }
        } catch (e) { 
            console.error(e);
            setError("Erro ao processar sua solicitação.");
        } finally { 
            setIsLoading(false); 
        }
    };

    const toggleVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('O reconhecimento de voz não é suportado neste navegador.');
            return;
        }
        if (isRecording) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsRecording(false);
            return;
        }
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'pt-BR';
        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
    };

    const handleDownloadPDF = async () => {
        if (messages.length === 0 || !reportRef.current) return;
        setIsGeneratingPdf(true);
        try {
            const element = reportRef.current;
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `AutoIntel_Diagnostico_Chat_${new Date().getTime()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0B0F1A' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            // @ts-ignore
            await html2pdf().set(opt).from(element).save();
        } catch (error) { console.error(error); } finally { setIsGeneratingPdf(false); }
    };

    if (error) return (
        <div className="flex flex-col h-screen items-center justify-center bg-background-dark text-white p-10 text-center">
            <span className="material-symbols-outlined text-accent-red text-7xl mb-6">api_off</span>
            <h2 className="text-2xl font-black uppercase mb-4 max-w-md">{error}</h2>
            <button onClick={() => window.location.reload()} className="bg-primary px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs">Recarregar</button>
        </div>
    );

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
                {messages.length > 0 && (
                    <button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">
                        <span className="material-symbols-outlined text-[20px]">{isGeneratingPdf ? 'progress_activity' : 'picture_as_pdf'}</span>
                        <span className="hidden md:inline">Exportar PDF</span>
                    </button>
                )}
            </header>

            <div ref={reportRef} className="flex-1 overflow-y-auto p-4 md:p-12 space-y-6 md:space-y-10 pb-96 no-scrollbar" style={{ backgroundColor: '#0B0F1A' }}>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-start min-h-full py-6 md:py-12 animate-fade-in px-4">
                        <div className="max-w-4xl w-full">
                            
                            {/* Card Único de Protocolo Simplificado */}
                            <div className="bg-surface-dark/60 border-2 border-primary/30 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_0_60px_rgba(19,91,236,0.15)]">
                                
                                {/* Header do Card */}
                                <div className="bg-primary/10 p-8 md:p-12 border-b border-primary/20 flex items-center gap-6">
                                    <div className="size-16 md:size-24 rounded-3xl bg-primary flex items-center justify-center text-white shadow-lg">
                                        <span className="material-symbols-outlined text-4xl md:text-6xl font-bold">assignment_turned_in</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl md:text-5xl font-black uppercase italic tracking-tighter">Protocolo de Diagnóstico</h3>
                                        <p className="text-sm md:text-2xl text-primary font-bold uppercase tracking-widest mt-1">Como ter o melhor laudo</p>
                                    </div>
                                </div>

                                {/* Conteúdo do Card em Lista Simplificada */}
                                <div className="p-8 md:p-14 space-y-8 md:space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                        
                                        <div className="flex gap-5 md:gap-7 items-start">
                                            <span className="material-symbols-outlined text-primary text-3xl md:text-5xl shrink-0">directions_car</span>
                                            <div className="space-y-1">
                                                <h4 className="text-lg md:text-3xl font-black text-white uppercase tracking-tight">01. Dados do Carro</h4>
                                                <p className="text-sm md:text-2xl text-slate-400 font-bold leading-snug">Diga a **marca, modelo e o ano** do seu veículo.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-5 md:gap-7 items-start">
                                            <span className="material-symbols-outlined text-accent-yellow text-3xl md:text-5xl shrink-0">photo_camera</span>
                                            <div className="space-y-1">
                                                <h4 className="text-lg md:text-3xl font-black text-white uppercase tracking-tight">02. Mande Fotos</h4>
                                                <p className="text-sm md:text-2xl text-slate-400 font-bold leading-snug">Envie fotos de **vazamentos** ou de **luzes acesas no painel**.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-5 md:gap-7 items-start">
                                            <span className="material-symbols-outlined text-accent-green text-3xl md:text-5xl shrink-0">qr_code_scanner</span>
                                            <div className="space-y-1">
                                                <h4 className="text-lg md:text-3xl font-black text-white uppercase tracking-tight">03. Códigos de Erro</h4>
                                                <p className="text-sm md:text-2xl text-slate-400 font-bold leading-snug">Se passou por scanner, informe o código (Ex: **P0300**).</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-5 md:gap-7 items-start">
                                            <span className="material-symbols-outlined text-accent-red text-3xl md:text-5xl shrink-0">noise_aware</span>
                                            <div className="space-y-1">
                                                <h4 className="text-lg md:text-3xl font-black text-white uppercase tracking-tight">04. Barulhos ou Falhas</h4>
                                                <p className="text-sm md:text-2xl text-slate-400 font-bold leading-snug">Conte o que está sentindo ao dirigir ou barulhos estranhos.</p>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Footer do Card - Dica Simplificada */}
                                    <div className="pt-8 md:pt-12 border-t border-white/5 flex flex-col md:flex-row items-center gap-4 md:gap-8 opacity-80">
                                        <div className="px-4 py-1.5 bg-primary/20 text-primary rounded-full text-[10px] md:text-lg font-black uppercase tracking-[0.2em] italic shrink-0">Dica Útil</div>
                                        <p className="text-xs md:text-2xl text-slate-300 font-bold text-center md:text-left leading-relaxed">
                                            Saber a data da **última revisão** ajuda muito a IA a descobrir o problema.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Indicador de Ação Abaixo */}
                            <div className="mt-12 flex flex-col items-center gap-4 animate-bounce opacity-40">
                                <p className="text-[10px] md:text-xl font-black uppercase tracking-[0.5em] text-primary">Escreva sua dúvida abaixo</p>
                                <span className="material-symbols-outlined text-3xl md:text-5xl">keyboard_double_arrow_down</span>
                            </div>

                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[95%] sm:max-w-[85%] md:max-w-[75%] rounded-2xl md:rounded-[3rem] p-6 md:p-12 shadow-2xl border ${msg.role === 'user' ? 'bg-primary text-white border-primary/20 rounded-tr-none' : 'bg-surface-dark text-slate-100 border-white/5 rounded-tl-none'}`}>
                                {msg.image && (
                                    <div className="mb-6 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg">
                                        <img src={msg.image} alt="Upload" className="w-full max-h-[600px] object-cover" />
                                    </div>
                                )}
                                {msg.role === 'model' && (
                                    <div className="flex gap-3 items-center mb-6">
                                        <span className="material-symbols-outlined text-primary text-[24px] md:text-[32px] font-black">build</span>
                                        <span className="text-[12px] md:text-[14px] font-black text-primary uppercase tracking-[0.4em]">Parecer do Mecânico</span>
                                    </div>
                                )}
                                <div className="text-base md:text-3xl leading-relaxed whitespace-pre-wrap font-bold">
                                    {msg.text || (isLoading && !msg.image && <div className="flex gap-2 h-8 items-center"><div className="size-3 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="size-3 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="size-3 bg-slate-500 rounded-full animate-bounce"></div></div>)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} className="no-print" />
            </div>

            <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 p-4 md:p-12 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent z-50 no-print">
                <div className="max-w-6xl mx-auto space-y-4">
                    
                    <div className="flex items-center gap-3 px-2 md:px-4 animate-fade-in">
                        <span className="size-2 md:size-3 bg-primary rounded-full animate-pulse"></span>
                        <h4 className="text-xs md:text-xl font-black uppercase tracking-[0.3em] text-primary">Converse com o Mecânico Virtual</h4>
                    </div>

                    {selectedImage && (
                        <div className="flex items-center gap-4 bg-primary/10 p-4 rounded-[2rem] border-2 border-primary/30 animate-fade-in shadow-[0_0_30px_rgba(19,91,236,0.1)]">
                            <div className="relative size-20 md:size-32 rounded-2xl overflow-hidden border-2 border-primary shadow-2xl">
                                <img src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} className="w-full h-full object-cover" alt="Preview" />
                                <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 bg-accent-red text-white rounded-full size-8 flex items-center justify-center hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs md:text-xl font-black text-primary uppercase tracking-widest leading-none">Arquivo Técnico Pronto</p>
                                <p className="text-[10px] md:text-sm text-slate-500 font-bold mt-1">Análise visual neural aguardando comando.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-end gap-3 md:gap-8 bg-surface-dark/80 p-3 md:p-6 rounded-[2.5rem] md:rounded-[4rem] border-2 border-white/10 shadow-2xl backdrop-blur-3xl group-focus-within:border-primary/40 transition-all">
                        <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="size-14 md:size-28 rounded-2xl md:rounded-[3rem] bg-background-dark text-slate-500 border-2 border-white/5 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center shrink-0 shadow-2xl group">
                            <span className="material-symbols-outlined text-[28px] md:text-[52px] font-black group-hover:scale-110 transition-transform">photo_camera</span>
                        </button>

                        <div className="relative flex-1">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder="Diga o carro e o que está acontecendo..."
                                className="w-full rounded-2xl md:rounded-[3rem] border-2 border-white/5 bg-background-dark/50 py-4 md:py-9 pl-6 md:pl-14 pr-16 md:pr-28 text-base md:text-3xl text-white placeholder-slate-700 focus:border-primary focus:ring-[15px] focus:ring-primary/10 outline-none resize-none max-h-32 md:max-h-60 min-h-[56px] md:min-h-[110px] transition-all font-bold"
                                rows={1}
                            />
                            <button onClick={toggleVoiceInput} className={`absolute right-3 md:right-10 top-1/2 -translate-y-1/2 size-10 md:size-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-accent-red animate-pulse text-white shadow-[0_0_30px_#EF4444]' : 'text-primary hover:bg-primary/10'}`}>
                                <span className="material-symbols-outlined text-[20px] md:text-[42px] font-black">{isRecording ? 'graphic_eq' : 'mic'}</span>
                            </button>
                        </div>

                        <button 
                            onClick={() => handleSend()}
                            disabled={(!input.trim() && !selectedImage) || isLoading}
                            className="size-14 md:size-28 rounded-2xl md:rounded-[3rem] bg-primary text-white shadow-[0_10px_40px_rgba(19,91,236,0.4)] hover:scale-110 active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center group shrink-0"
                        >
                            <span className="material-symbols-outlined text-[28px] md:text-[52px] font-black group-hover:rotate-12 transition-transform">{isLoading ? 'sync' : 'send'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;
