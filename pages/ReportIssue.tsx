
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
                        systemInstruction: "Você é o Mecânico Virtual Expert do AutoIntel AI. Forneça diagnósticos técnicos de alta precisão. Analise imagens detalhadamente caso o usuário envie. Seja direto, técnico e utilize negrito para peças críticas. Comece sempre saudando o cliente como membro AutoIntel Pro." 
                    }
                });
            } catch (err) {
                console.error("Erro ao inicializar chat:", err);
                setError("Falha ao conectar com o motor neural.");
            }
        };

        initChat();
    }, []);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
                            { text: userText || "Analise esta imagem técnica do meu veículo." },
                            { inlineData: { data: currentImage.data, mimeType: currentImage.mimeType } }
                        ]
                    },
                    config: {
                        systemInstruction: "Você é o Mecânico Virtual Expert do AutoIntel AI. Forneça diagnósticos técnicos de alta precisão com base na imagem enviada."
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
        if (!('webkitSpeechRecognition' in window)) {
            alert('A busca por voz não é suportada neste navegador.');
            return;
        }
        if (isRecording) { setIsRecording(false); return; }
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };
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
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    backgroundColor: '#0B0F1A',
                    logging: false,
                    letterRendering: true
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // @ts-ignore
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Erro ao gerar PDF do diagnóstico.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    if (error) return (
        <div className="flex flex-col h-screen items-center justify-center bg-background-dark text-white p-10 text-center">
            <span className="material-symbols-outlined text-accent-red text-7xl mb-6">api_off</span>
            <h2 className="text-2xl font-black uppercase mb-4 max-w-md leading-tight">{error}</h2>
            <button onClick={() => window.location.reload()} className="mt-4 bg-primary px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all text-xs">
                Tentar Novamente
            </button>
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
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPdf}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[20px]">{isGeneratingPdf ? 'progress_activity' : 'picture_as_pdf'}</span>
                        <span className="hidden md:inline">{isGeneratingPdf ? 'Gerando Laudo...' : 'Exportar PDF'}</span>
                    </button>
                )}
            </header>

            <div 
                ref={reportRef} 
                className="flex-1 overflow-y-auto p-4 md:p-12 space-y-6 md:space-y-10 pb-64 no-scrollbar"
                style={{ backgroundColor: '#0B0F1A' }}
            >
                {/* PDF Header - Visible only in PDF */}
                <div className="hidden print:block mb-10 pb-6 border-b border-white/10">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-white italic">AutoIntel <span className="text-primary not-italic">AI</span></h1>
                            <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mt-2">Laudo Técnico de Consulta Neural</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-500">Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Diagnóstico: #CH-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-60 mt-10 md:mt-20 px-6">
                        <div className="size-24 md:size-32 rounded-3xl md:rounded-[3rem] bg-surface-dark flex items-center justify-center mb-6 md:mb-10 ring-8 ring-primary/5 border border-white/5 shadow-2xl">
                            <span className="material-symbols-outlined text-[48px] md:text-[72px] text-primary">photo_camera</span>
                        </div>
                        <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-2 md:mb-4 text-white">Central de Diagnóstico</h3>
                        <p className="text-base md:text-xl text-slate-500 font-bold max-w-md mx-auto leading-relaxed">Envie uma foto da peça ou descreva o sintoma do seu carro.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[95%] sm:max-w-[85%] md:max-w-[70%] rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 shadow-2xl border ${msg.role === 'user' ? 'bg-primary text-white border-primary/20 rounded-tr-none' : 'bg-surface-dark text-slate-100 border-white/5 rounded-tl-none'}`}>
                                {msg.image && (
                                    <div className="mb-4 rounded-xl overflow-hidden border-2 border-white/10 shadow-lg">
                                        <img src={msg.image} alt="Upload do usuário" className="w-full max-h-60 md:max-h-96 object-cover" />
                                    </div>
                                )}
                                {msg.role === 'model' && (
                                    <div className="flex gap-2 items-center mb-4 md:mb-6">
                                        <span className="material-symbols-outlined text-primary text-[18px] md:text-[24px] font-black">build</span>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Parecer Técnico</span>
                                    </div>
                                )}
                                <div className="text-base md:text-2xl leading-relaxed whitespace-pre-wrap font-bold">
                                    {msg.text || (isLoading && !msg.image && <div className="flex gap-1.5 h-6 items-center px-1"><div className="size-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="size-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="size-2 bg-slate-500 rounded-full animate-bounce"></div></div>)}
                                    {isLoading && msg.role === 'model' && !msg.text && <div className="text-xs italic opacity-50">Analisando imagem e processando diagnóstico...</div>}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} className="no-print" />
            </div>

            <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 p-4 md:p-12 glass z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] no-print">
                {selectedImage && (
                    <div className="max-w-5xl mx-auto mb-4 flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 animate-fade-in">
                        <div className="relative size-16 md:size-24 rounded-lg overflow-hidden border border-white/20">
                            <img src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-1 right-1 bg-accent-red text-white rounded-full size-6 flex items-center justify-center hover:scale-110 transition-transform"
                            >
                                <span className="material-symbols-outlined text-xs">close</span>
                            </button>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] md:text-sm font-black text-primary uppercase tracking-widest">Imagem Pronta</p>
                            <p className="text-[8px] md:text-xs text-slate-500 font-bold">Clique em enviar para iniciar análise técnica visual.</p>
                        </div>
                    </div>
                )}

                <div className="max-w-5xl mx-auto flex items-end gap-3 md:gap-6">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageSelect} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="size-14 md:size-24 rounded-2xl md:rounded-[2.5rem] bg-surface-dark text-slate-400 border border-white/5 hover:bg-surface-highlight hover:text-primary transition-all flex items-center justify-center shrink-0 shadow-xl"
                    >
                        <span className="material-symbols-outlined text-[28px] md:text-[42px] font-black">photo_camera</span>
                    </button>

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
                        disabled={(!input.trim() && !selectedImage) || isLoading}
                        className="size-14 md:size-24 rounded-2xl md:rounded-[2.5rem] bg-primary text-white shadow-xl hover:scale-110 active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center group shrink-0"
                    >
                        <span className="material-symbols-outlined text-[28px] md:text-[42px] font-black group-hover:rotate-12 transition-transform">
                            {isLoading ? 'sync' : 'send'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;
