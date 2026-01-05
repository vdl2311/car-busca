
import React, { useEffect, useState } from 'react';
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

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [history, setHistory] = useState<SavedReport[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [activeTab, setActiveTab] = useState<'reports' | 'chats'>('reports');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            setLoadingHistory(true);
            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                
                if (!error && data) {
                    setHistory(data);
                }
            } catch (e) { 
                console.error("Erro ao carregar histórico:", e); 
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate(AppRoute.WELCOME);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).toUpperCase();
    };

    return (
        <div className="flex flex-col min-h-full bg-background-dark page-transition">
            {/* Header Mobile / Desktop Unificado */}
            <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-6 md:px-12 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all md:hidden">
                        <span className="material-symbols-outlined font-black">arrow_back</span>
                    </button>
                    <h2 className="text-xl md:text-3xl font-black tracking-tighter text-white uppercase italic">Meus Dados <span className="text-primary not-italic">AutoIntel</span></h2>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-500 font-black text-xs md:text-sm uppercase tracking-widest hover:bg-red-500/10 transition-all"
                >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span className="hidden md:inline">Encerrar Sessão</span>
                </button>
            </header>

            <main className="max-w-5xl mx-auto w-full p-6 md:p-12 space-y-12 pb-40">
                {/* User Hero Section */}
                <section className="flex flex-col md:flex-row items-center gap-8 bg-surface-dark/40 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <div className="size-28 md:size-40 rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center text-white shadow-2xl shadow-primary/20">
                        <span className="material-symbols-outlined text-6xl md:text-8xl font-black">person</span>
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-2xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                            {user?.email?.split('@')[0] || 'CONSULTOR'}
                        </h1>
                        <p className="text-sm md:text-xl font-black text-primary uppercase tracking-[0.4em]">MEMBRO GOLD #{(Math.random()*1000).toFixed(0)}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                            <div className="bg-white/5 px-6 py-2 rounded-full border border-white/10 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">Verificado</div>
                            <div className="bg-accent-green/10 px-6 py-2 rounded-full border border-accent-green/20 text-[10px] md:text-xs font-black uppercase tracking-widest text-accent-green">Acesso Pro</div>
                        </div>
                    </div>
                </section>

                {/* Stats Grid - Impacto Senior */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-surface-dark p-8 rounded-[2rem] border border-white/5 text-center group hover:border-primary/50 transition-all shadow-xl">
                        <span className="block text-4xl md:text-6xl font-black text-white group-hover:text-primary transition-colors">{history.length}</span>
                        <span className="block text-xs md:text-sm font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Laudos Gerados</span>
                    </div>
                    <div className="bg-surface-dark p-8 rounded-[2rem] border border-white/5 text-center group hover:border-accent-green/50 transition-all shadow-xl">
                        <span className="block text-4xl md:text-6xl font-black text-accent-green">100%</span>
                        <span className="block text-xs md:text-sm font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Nível de Confiança</span>
                    </div>
                    <div className="bg-surface-dark p-8 rounded-[2rem] border border-white/5 text-center group hover:border-accent-yellow/50 transition-all shadow-xl">
                        <span className="block text-4xl md:text-6xl font-black text-white group-hover:text-accent-yellow transition-colors">0</span>
                        <span className="block text-xs md:text-sm font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Alertas de Fraude</span>
                    </div>
                </section>

                {/* Histórico Section com Tabs */}
                <section className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h3 className="text-2xl md:text-4xl font-black text-white flex items-center gap-4 tracking-tighter uppercase italic">
                            <span className="material-symbols-outlined text-primary text-4xl md:text-5xl">folder_managed</span>
                            Arquivo de Consultas
                        </h3>
                        
                        {/* Tab Switcher - Segmented UI */}
                        <div className="bg-surface-dark p-1.5 rounded-2xl flex border border-white/5 w-full md:w-auto">
                            <button 
                                onClick={() => setActiveTab('reports')}
                                className={`flex-1 md:px-8 py-3 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'reports' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                                Laudos
                            </button>
                            <button 
                                onClick={() => setActiveTab('chats')}
                                className={`flex-1 md:px-8 py-3 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'chats' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                                Chats IA
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {loadingHistory ? (
                            <div className="flex flex-col items-center py-20 gap-4">
                                <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
                                <p className="font-black text-slate-500 uppercase tracking-widest text-sm">Acessando Cloud...</p>
                            </div>
                        ) : activeTab === 'reports' ? (
                            history.length > 0 ? history.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => navigate(AppRoute.REPORT_RESULT, { 
                                        state: { 
                                            brand: item.brand, 
                                            model: item.model, 
                                            year: item.year, 
                                            km: item.km, 
                                            savedReportData: item.report_data 
                                        } 
                                    })}
                                    className="bg-white/5 p-6 md:p-10 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-8 cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all active:scale-[0.99] group shadow-xl"
                                >
                                    {/* Score Box - Grande e Legível */}
                                    <div className={`shrink-0 size-20 md:size-28 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center font-black transition-transform group-hover:scale-110 shadow-2xl ${item.score >= 7 ? 'bg-accent-green text-white' : item.score >= 5 ? 'bg-accent-yellow text-background-dark' : 'bg-accent-red text-white'}`}>
                                        <span className="text-3xl md:text-5xl leading-none italic">{item.score}</span>
                                        <span className="text-[8px] md:text-[10px] uppercase tracking-tighter opacity-80 mt-1">Pontos</span>
                                    </div>

                                    {/* Vehicle Info - Hierarquia Sênior */}
                                    <div className="flex-1 min-w-0 text-center md:text-left">
                                        <h4 className="text-xl md:text-3xl font-black text-white group-hover:text-primary transition-colors uppercase italic truncate">{item.brand} {item.model}</h4>
                                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-3">
                                            <span className="text-xs md:text-lg font-bold text-slate-500 uppercase tracking-widest">{item.year}</span>
                                            <span className="size-1.5 bg-slate-800 rounded-full"></span>
                                            <span className="text-xs md:text-lg font-black text-primary uppercase tracking-tighter">{item.km ? `${parseInt(item.km).toLocaleString()} KM` : 'KM N/D'}</span>
                                        </div>
                                    </div>

                                    {/* Date & Action */}
                                    <div className="flex flex-col items-center md:items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                                        <span className="text-[10px] md:text-sm font-black text-slate-600 uppercase tracking-widest">{formatDate(item.created_at)}</span>
                                        <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] md:text-xs tracking-widest">
                                            Acessar Laudo
                                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] opacity-30">
                                    <span className="material-symbols-outlined text-7xl mb-6">inventory_2</span>
                                    <p className="font-black text-xl uppercase tracking-widest">Nenhum laudo encontrado</p>
                                </div>
                            )
                        ) : (
                            /* Placeholder para Histórico de Chats */
                            <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] opacity-30">
                                <span className="material-symbols-outlined text-7xl mb-6">forum</span>
                                <p className="font-black text-xl uppercase tracking-widest">Consultas IA em breve</p>
                                <p className="text-sm font-bold mt-2">O histórico de conversas com o Mecânico Virtual está sendo processado.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Profile;
