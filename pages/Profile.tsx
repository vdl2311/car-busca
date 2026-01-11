
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

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [history, setHistory] = useState<SavedReport[]>([]);
    const [chats, setChats] = useState<SavedChat[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'reports' | 'chats'>('reports');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchData = useCallback(async (isManual = false) => {
        if (!user) return;
        if (isManual) setRefreshing(true);
        else setLoading(true);
        setErrorMessage(null);

        try {
            // Busca laudos
            const { data: reportData, error: rError } = await supabase
                .from('reports')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);
            
            // Busca chats
            const { data: chatData, error: cError } = await supabase
                .from('chat_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (rError) {
                console.error("Erro Supabase Reports:", rError.message);
                if (rError.message.includes("cache") || rError.message.includes("not found")) {
                    setErrorMessage("ERRO DE CONFIGURAÇÃO: As tabelas do banco de dados ainda não foram criadas. Siga as instruções no README.md.");
                }
            }
            
            if (cError && !errorMessage) {
                console.error("Erro Supabase Chats:", cError.message);
                if (cError.message.includes("cache") || cError.message.includes("not found")) {
                    setErrorMessage("ERRO DE CONFIGURAÇÃO: Tabela de Histórico não encontrada no banco.");
                }
            }

            if (reportData) setHistory(reportData);
            if (chatData) setChats(chatData);
        } catch (e: any) { 
            console.error("Erro fatal fetch:", e); 
            setErrorMessage("Erro inesperado de conexão.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, errorMessage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = async () => {
        await signOut();
        navigate(AppRoute.WELCOME);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'short'
        }).toUpperCase();
    };

    return (
        <div className="flex flex-col min-h-full bg-background-dark page-transition">
            <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-6 md:px-12 flex items-center justify-between">
                <h2 className="text-xl md:text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
                    Histórico <span className="text-orange-500 not-italic">PRO</span>
                </h2>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => fetchData(true)} 
                        disabled={refreshing}
                        className={`size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all ${refreshing ? 'animate-spin' : 'active:scale-90'}`}
                    >
                        <span className="material-symbols-outlined text-xl">refresh</span>
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="px-6 py-3 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-500/10"
                    >
                        Sair
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto w-full p-6 md:p-12 space-y-10 pb-40">
                {errorMessage && (activeTab === 'reports' || activeTab === 'chats') && (
                    <div className="bg-red-500/10 border-2 border-red-500/30 p-8 rounded-[3rem] text-center space-y-4">
                        <span className="material-symbols-outlined text-red-500 text-5xl">database_off</span>
                        <h3 className="text-white font-black uppercase tracking-tighter text-lg">Banco de Dados não configurado</h3>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-sm mx-auto">
                            O erro de "schema cache" indica que as tabelas físicas não existem no seu Supabase. 
                            Copie o código SQL do arquivo <b>README.md</b> e execute-o no SQL Editor do Supabase.
                        </p>
                    </div>
                )}

                <section className="bg-surface-dark/40 p-10 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center gap-10">
                    <div className="size-32 rounded-[2.5rem] bg-orange-600 flex items-center justify-center text-white font-black text-5xl uppercase shadow-2xl shadow-orange-600/20">
                        {user?.email?.[0]}
                    </div>
                    <div className="text-center md:text-left space-y-2 flex-1">
                        <h1 className="text-2xl md:text-3xl font-black text-white truncate max-w-sm">{user?.email}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <p className="text-orange-500 font-black uppercase tracking-widest text-[10px] italic">Especialista de Bancada Ativo</p>
                            <span className="text-slate-600">•</span>
                            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Cloud Sync v4.5</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex bg-surface-dark p-1.5 rounded-[2rem] border border-white/5">
                        <button 
                            onClick={() => setActiveTab('reports')} 
                            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all ${activeTab === 'reports' ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <span className="material-symbols-outlined text-lg">assignment</span>
                            Laudos ({history.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('chats')} 
                            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all ${activeTab === 'chats' ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <span className="material-symbols-outlined text-lg">smart_toy</span>
                            Chats ({chats.length})
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {loading ? (
                            <div className="py-32 text-center animate-pulse">
                                <span className="material-symbols-outlined text-6xl text-slate-800 mb-4">cloud_sync</span>
                                <p className="text-slate-500 font-black uppercase text-xs tracking-[0.3em]">Buscando dados na nuvem...</p>
                            </div>
                        ) : activeTab === 'reports' ? (
                            history.length > 0 ? history.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => navigate(AppRoute.REPORT_RESULT, { state: { brand: item.brand, model: item.model, year: item.year, km: item.km, savedReportData: item.report_data } })}
                                    className="group bg-surface-dark/60 p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-8 cursor-pointer hover:bg-white/5 hover:border-orange-500/30 transition-all active:scale-[0.98]"
                                >
                                    <div className="size-20 rounded-[1.5rem] bg-orange-600 flex flex-col items-center justify-center text-white shadow-lg shadow-orange-600/10 shrink-0">
                                        <span className="text-2xl font-black italic leading-none">{item.score || 0}</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">SCORE</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xl font-black text-white uppercase italic truncate">{item.brand} {item.model}</h4>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.year} • {item.km} KM</p>
                                            <span className="size-1 rounded-full bg-slate-800"></span>
                                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{formatDate(item.created_at)}</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all">chevron_right</span>
                                </div>
                            )) : (
                                <div className="py-32 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-6xl text-slate-800 mb-4">folder_off</span>
                                    <p className="text-slate-600 font-black uppercase text-xs tracking-[0.2em] mb-6">Nenhum laudo encontrado</p>
                                    <button onClick={() => navigate(AppRoute.HOME)} className="px-8 py-4 bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs">Gerar Primeiro Laudo</button>
                                </div>
                            )
                        ) : (
                            chats.length > 0 ? chats.map((chat) => (
                                <div 
                                    key={chat.id} 
                                    onClick={() => navigate(AppRoute.REPORT_ISSUE, { state: { savedChat: chat } })}
                                    className="group bg-surface-dark/60 p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-8 hover:bg-white/5 hover:border-orange-500/30 transition-all cursor-pointer active:scale-[0.98]"
                                >
                                    <div className="size-20 rounded-[1.5rem] bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/10 shrink-0">
                                        <span className="material-symbols-outlined text-3xl text-white">forum</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-black text-white uppercase italic truncate leading-tight">{chat.title || "Consulta Técnica"}</h4>
                                        <div className="flex items-center gap-4 mt-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                {chat.messages?.length || 0} MENSAGENS
                                            </p>
                                            <span className="size-1 rounded-full bg-slate-800"></span>
                                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{formatDate(chat.created_at)}</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all">chevron_right</span>
                                </div>
                            )) : (
                                <div className="py-32 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-6xl text-slate-800 mb-4">chat_bubble_outline</span>
                                    <p className="text-slate-600 font-black uppercase text-xs tracking-[0.2em] mb-6">Nenhuma conversa salva</p>
                                    <button onClick={() => navigate(AppRoute.REPORT_ISSUE)} className="px-8 py-4 bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs">Falar com IA</button>
                                </div>
                            )
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Profile;
