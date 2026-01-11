
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface SavedReport {
    id: string;
    created_at: string;
    brand: string;
    model: string;
    year: string;
    km: string;
    score: number;
    report_data: any;
}

interface SavedChat {
    id: string;
    created_at: string;
    title: string;
    messages: any[];
}

interface ProfileProps {
    isDark?: boolean;
    toggleTheme?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ isDark, toggleTheme }) => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [history, setHistory] = useState<SavedReport[]>([]);
    const [chats, setChats] = useState<SavedChat[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'reports' | 'chats'>('reports');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [canInstall, setCanInstall] = useState(false);

    // Verifica se o prompt nativo está disponível
    useEffect(() => {
        const checkInstall = () => {
            if ((window as any).deferredPrompt) {
                setCanInstall(true);
            }
        };
        checkInstall();
        const timer = setInterval(checkInstall, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleNativeInstall = async () => {
        const promptEvent = (window as any).deferredPrompt;
        if (!promptEvent) {
            alert("Use o menu do navegador e selecione 'Adicionar à tela de início'.");
            return;
        }
        
        // Dispara o prompt oficial do navegador/sistema
        promptEvent.prompt();
        
        const { outcome } = await promptEvent.userChoice;
        console.log(`[AutoIntel] Decisão do usuário: ${outcome}`);
        
        if (outcome === 'accepted') {
            (window as any).deferredPrompt = null;
            setCanInstall(false);
        }
    };

    const fetchData = useCallback(async (isManual = false) => {
        if (!user) return;
        if (isManual) setRefreshing(true);
        else setLoading(true);
        setErrorMessage(null);

        try {
            const [reportsRes, chatsRes] = await Promise.all([
                supabase.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
                supabase.from('chat_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
            ]);

            if (reportsRes.error) console.error("Erro Reports:", reportsRes.error);
            if (chatsRes.data) setChats(chatsRes.data);
            if (reportsRes.data) setHistory(reportsRes.data);
        } catch (e: any) { 
            console.error("Erro inesperado:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = async () => {
        await signOut();
        navigate(AppRoute.WELCOME);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
    };

    return (
        <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark page-transition">
            <header className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-white/10 px-6 py-6 md:px-12 flex items-center justify-between">
                <h2 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic leading-none">
                    Histórico{" "}<span className="text-orange-500 not-italic">PRO</span>
                </h2>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => fetchData(true)} 
                        disabled={refreshing}
                        className={`size-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all ${refreshing ? 'animate-spin' : 'active:scale-90'}`}
                    >
                        <span className="material-symbols-outlined text-xl">refresh</span>
                    </button>
                    <button onClick={handleLogout} className="px-6 py-3 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-500/10 transition-colors">Sair</button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto w-full p-6 md:p-12 space-y-10 pb-40">
                {/* PROMPT NATIVO - EXATAMENTE COMO SOLICITADO */}
                {canInstall && (
                    <section onClick={handleNativeInstall} className="bg-orange-600 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer shadow-2xl shadow-orange-600/30 animate-bounce-subtle">
                        <div className="flex items-center gap-6">
                            <div className="size-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-4xl">download_for_offline</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Deseja instalar o APP?</h3>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1">Clique para abrir a opção oficial do seu celular</p>
                            </div>
                        </div>
                        <button className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Instalar Agora</button>
                    </section>
                )}

                <section className="bg-surface-light dark:bg-surface-dark/40 p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-2xl flex flex-col md:flex-row items-center gap-10">
                    <div className="size-32 rounded-[2.5rem] bg-orange-600 flex items-center justify-center text-white font-black text-5xl uppercase shadow-2xl shadow-orange-600/20">
                        {user?.email?.[0]}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white truncate max-w-sm">{user?.email}</h1>
                        <p className="text-orange-500 font-black uppercase tracking-widest text-[10px] italic mt-2">Especialista de Bancada Ativo</p>
                    </div>
                </section>

                <div className="flex bg-slate-100 dark:bg-surface-dark p-1.5 rounded-[2rem] border border-slate-200 dark:border-white/5">
                    <button onClick={() => setActiveTab('reports')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'reports' ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-400 dark:text-slate-500'}`}>Laudos ({history.length})</button>
                    <button onClick={() => setActiveTab('chats')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'chats' ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-400 dark:text-slate-500'}`}>Chats ({chats.length})</button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="py-20 text-center animate-pulse">
                            <p className="text-slate-500 font-black uppercase text-xs tracking-widest">Sincronizando nuvem...</p>
                        </div>
                    ) : activeTab === 'reports' ? (
                        history.length > 0 ? history.map((item) => (
                            <div key={item.id} onClick={() => navigate(AppRoute.REPORT_RESULT, { state: { brand: item.brand, model: item.model, year: item.year, km: item.km, savedReportData: item.report_data } })} className="bg-surface-light dark:bg-surface-dark/60 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex items-center gap-8 cursor-pointer hover:border-orange-500/30 transition-all shadow-sm dark:shadow-none">
                                <div className="size-16 rounded-2xl bg-orange-600 flex flex-col items-center justify-center text-white shrink-0">
                                    <span className="text-xl font-black">{item.score || 0}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase italic truncate">{item.brand}{" "}{item.model}</h4>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">{item.year} • {item.km} KM • {formatDate(item.created_at)}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700">chevron_right</span>
                            </div>
                        )) : <div className="py-20 text-center opacity-20"><p className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest">Nenhum laudo salvo</p></div>
                    ) : (
                        chats.length > 0 ? chats.map((chat) => (
                            <div key={chat.id} onClick={() => navigate(AppRoute.REPORT_ISSUE, { state: { savedChat: chat } })} className="bg-surface-light dark:bg-surface-dark/60 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex items-center gap-8 hover:border-orange-500/30 transition-all cursor-pointer shadow-sm dark:shadow-none">
                                <div className="size-16 rounded-2xl bg-orange-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-white text-2xl">forum</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase italic truncate">{chat.title || "Consulta"}</h4>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">{chat.messages?.length || 0} MENSAGENS • {formatDate(chat.created_at)}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700">chevron_right</span>
                            </div>
                        )) : <div className="py-20 text-center opacity-20"><p className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest">Nenhum chat salvo</p></div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;
