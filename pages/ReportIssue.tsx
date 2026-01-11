
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { AppRoute } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Message { 
    id: string; 
    role: 'user' | 'model'; 
    text: string; 
    image?: string; 
    timestamp: string;
}

const TypingIndicator = () => (
    <div className="flex gap-2 items-center p-4 bg-surface-dark/50 rounded-2xl w-fit border border-white/5 animate-pulse">
        <div className="flex gap-1">
            <div className="size-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="size-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="size-1.5 bg-orange-500 rounded-full animate-bounce"></div>
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Mecânico Analisando...</span>
    </div>
);

const ReportIssue: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    // Captura o chat enviado via navegação (Histórico)
    const savedChat = location.state?.savedChat;

    const [messages, setMessages] = useState<Message[]>(savedChat?.messages || []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string, preview: string } | null>(null);
    const [chatId, setChatId] = useState<string | null>(savedChat?.id || null);
    const [dbError, setDbError] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatRef = useRef<any>(null);

    useEffect(() => {
        const initChat = async () => {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: { 
                    systemInstruction: "Você é o 'Mecânico Virtual' veterano da AutoIntel. Use termos práticos de oficina. Seja extremamente direto, use bullet points para passos técnicos e ajude o mecânico a resolver problemas complexos na bancada. Se ver uma imagem, descreva o estado técnico da peça. Se houver histórico anterior, considere-o no contexto." 
                }
            });
        };
        initChat();
    }, []);

    const formatTime = () => {
        return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleFileClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            setSelectedImage({ data: base64Data, mimeType: file.type, preview: reader.result as string });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const saveChatToSupabase = async (updatedMessages: Message[]) => {
        if (!user) return;
        try {
            const title = updatedMessages.find(m => m.role === 'user')?.text?.substring(0, 50) || "Consulta Técnica";
            if (chatId) {
                const { error } = await supabase.from('chat_history').update({
                    messages: updatedMessages,
                    last_updated: new Date().toISOString()
                }).eq('id', chatId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('chat_history').insert([{
                    user_id: user.id,
                    title,
                    messages: updatedMessages
                }]).select();
                if (error) throw error;
                if (data?.[0]) setChatId(data[0].id);
            }
        } catch (err: any) { 
            console.error("Erro ao salvar chat:", err);
            if (err.message?.includes("cache") || err.message?.includes("not found")) {
                setDbError("Aviso: Histórico desativado localmente. Configure o banco via SQL.");
            }
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return;
        
        const userText = input.trim();
        const currentImage = selectedImage;
        const timestamp = formatTime();
        
        const newMessages: Message[] = [...messages, { 
            id: Date.now().toString(), 
            role: 'user', 
            text: userText, 
            image: currentImage?.preview,
            timestamp
        }];
        
        setMessages(newMessages);
        setInput('');
        setSelectedImage(null);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let responseText = '';
            
            if (currentImage) {
                const result = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: { parts: [{ text: userText || "Analise tecnicamente." }, { inlineData: { data: currentImage.data, mimeType: currentImage.mimeType } }] }
                });
                responseText = result.text || "Sem análise disponível.";
            } else {
                const result = await chatRef.current.sendMessage({ message: userText });
                responseText = result.text || "Sem resposta do sistema.";
            }

            const finalMessages: Message[] = [...newMessages, { 
                id: (Date.now() + 1).toString(), 
                role: 'model', 
                text: responseText,
                timestamp: formatTime()
            }];
            setMessages(finalMessages);
            saveChatToSupabase(finalMessages);
            
        } catch (e) { 
            console.error(e);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: "Erro técnico. Verifique a conexão com a central.",
                timestamp: formatTime()
            }]);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="flex flex-col h-full bg-background-dark text-white relative safe-top overflow-hidden">
            <header className="sticky top-0 z-40 glass p-4 md:px-12 flex items-center justify-between border-b border-white/5 backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="md:hidden size-10 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="size-10 md:size-12 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
                        <span className="material-symbols-outlined text-2xl md:text-3xl font-bold">smart_toy</span>
                    </div>
                    <div>
                        <h2 className="text-sm md:text-xl font-black tracking-tight uppercase italic leading-none">Mecânico Virtual</h2>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                {savedChat ? "Histórico em exibição" : "Consultoria Ativa"}
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        setMessages([]); 
                        setChatId(null);
                        setDbError(null);
                        navigate(AppRoute.REPORT_ISSUE, { state: {}, replace: true });
                    }} 
                    className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-orange-500 transition-colors"
                    title="Nova Consulta"
                >
                    <span className="material-symbols-outlined">edit_note</span>
                </button>
            </header>

            {dbError && (
                <div className="bg-orange-600/10 border-b border-orange-600/20 px-4 py-2 text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">database</span>
                    {dbError}
                </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8 pb-72 md:pb-48">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10">
                            <div className="size-24 rounded-4xl bg-white/5 flex items-center justify-center border border-white/10">
                                <span className="material-symbols-outlined text-5xl text-orange-500">forum</span>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight">Bancada Digital</h3>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tire dúvidas técnicas em tempo real</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                                {[
                                    { t: 'Torques de Motor', s: 'Linha GM Ecotec' },
                                    { t: 'Esquema Elétrico', s: 'Injeção VW TSI' },
                                    { t: 'Análise de Peça', s: 'Foto de Pastilha' },
                                    { t: 'P0300 Intermitente', s: 'Diagnóstico Passo a Passo' }
                                ].map((item, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setInput(`${item.t} ${item.s}`)} 
                                        className="group p-4 rounded-2xl bg-surface-dark/40 border border-white/5 hover:border-orange-500/30 transition-all text-left flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">{item.t}</p>
                                            <p className="text-xs font-bold text-slate-300">{item.s}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-700 group-hover:text-orange-500 transition-colors">send</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`size-8 md:size-10 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-orange-600/20 text-orange-500' : 'bg-white/10 text-white'}`}>
                                    <span className="material-symbols-outlined text-lg md:text-xl">
                                        {msg.role === 'user' ? 'person' : 'smart_toy'}
                                    </span>
                                </div>
                                <div className={`flex flex-col space-y-2 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`relative rounded-3xl p-4 md:p-6 shadow-2xl ${
                                        msg.role === 'user' 
                                        ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-tr-none' 
                                        : 'bg-surface-dark/80 backdrop-blur-xl text-slate-100 border border-white/5 rounded-tl-none'
                                    }`}>
                                        {msg.image && (
                                            <div className="mb-4 rounded-2xl overflow-hidden">
                                                <img src={msg.image} className="w-full h-auto object-cover max-h-80" alt="Anexo" />
                                            </div>
                                        )}
                                        <div className="text-lg md:text-xl font-bold whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">{msg.timestamp}</span>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="size-8 md:size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-700">
                                <span className="material-symbols-outlined text-xl">smart_toy</span>
                            </div>
                            <TypingIndicator />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-40">
                <div className="max-w-4xl mx-auto">
                    {selectedImage && (
                        <div className="mb-4 p-3 bg-surface-dark border border-orange-500/50 rounded-2xl w-fit flex gap-4 items-center animate-in slide-in-from-bottom-2">
                            <img src={selectedImage.preview} className="size-16 rounded-xl object-cover" alt="Preview" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Anexo Carregado</span>
                                <button onClick={() => setSelectedImage(null)} className="text-xs font-bold text-slate-500 hover:text-white transition-colors text-left uppercase">Remover</button>
                            </div>
                        </div>
                    )}
                    <div className="relative flex items-center gap-3 bg-surface-dark/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 md:p-4 shadow-3xl">
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        <button 
                            onClick={handleFileClick} 
                            className="size-10 md:size-12 rounded-full flex items-center justify-center text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all"
                        >
                            <span className="material-symbols-outlined text-2xl md:text-3xl">photo_camera</span>
                        </button>
                        <textarea 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Peça torques, óleos ou descreva o problema..." 
                            className="flex-1 bg-transparent py-3 px-2 text-lg md:text-xl text-white outline-none resize-none max-h-32 font-bold placeholder:text-slate-700" 
                            rows={1} 
                        />
                        <button 
                            onClick={handleSend} 
                            disabled={isLoading || (!input.trim() && !selectedImage)} 
                            className={`size-10 md:size-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                input.trim() || selectedImage 
                                ? 'bg-orange-600 text-white shadow-orange-600/30' 
                                : 'bg-white/5 text-slate-800'
                            }`}
                        >
                            <span className="material-symbols-outlined font-black">
                                {isLoading ? 'hourglass' : 'send'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;
