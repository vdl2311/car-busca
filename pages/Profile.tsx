
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

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate(AppRoute.WELCOME);
    };

    const handleDeleteReport = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Deseja realmente excluir este laudo do seu histórico?")) return;
        
        try {
            const { error } = await supabase.from('reports').delete().eq('id', id);
            if (!error) {
                setHistory(prev => prev.filter(item => item.id !== id));
            } else {
                alert("Erro ao excluir laudo.");
            }
        } catch (err) {
            console.error(err);
        }
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
                <section className="flex flex-col md:flex-row items-center gap-8 bg-surface-dark/40 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <div className="size-28 md:size-40 rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center text-white shadow-2xl shadow-primary/20">
                        <span className="material-symbols-outlined text-6xl md:text-8xl font-black">person</span>
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-2xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                            {user?.email?.split('@')[0] || 'CONSULTOR'}
                        </h1>
                        <p className="text-sm md:text-xl font-black text-primary uppercase tracking-[0.4em]">MEMBRO GOLD #{(Math.random()*1000).toFixed(0)}</p>
                    </div>
                </section>

                <section className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h3 className="text-2xl md:text-4xl font-black text-white flex items-center gap-4 tracking-tighter uppercase italic">
                            <span className="material-symbols-outlined text-primary text-4xl md:text-5xl">folder_managed</span>
                            Arquivo de Consultas
                        </h3>
                        
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
                                <p className="font-black text-slate-500 uppercase tracking-widest text-sm">Sincronizando...</p>
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
                                    className="bg-white/5 p-6 md:p-10 rounded-[2rem] border border-white/5 flex flex-col md:row items-center gap-8 cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all group shadow-xl relative"
                                >
                                    <div className={`shrink-0 size-20 md:size-24 rounded-2xl flex flex-col items-center justify-center font-black ${item.score >= 7 ? 'bg-accent-green text-white' : item.score >= 5 ? 'bg-accent-yellow text-background-dark' : 'bg-accent-red text-white'}`}>
                                        <span className="text-2xl md:text-4xl italic">{item.score}</span>
                                    </div>

                                    <div className="flex-1 min-w-0 text-center md:text-left">
                                        <h4 className="text-xl md:text-2xl font-black text-white group-hover:text-primary transition-colors uppercase italic truncate">{item.brand} {item.model}</h4>
                                        <div className="flex justify-center md:justify-start items-center gap-3 mt-2">
                                            <span className="text-xs font-bold text-slate-500">{item.year}</span>
                                            <span className="text-xs font-black text-primary">{item.km ? `${parseInt(item.km).toLocaleString()} KM` : 'KM N/D'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                                        <span className="text-[10px] font-black text-slate-600 uppercase">{formatDate(item.created_at)}</span>
                                        <button 
                                            onClick={(e) => handleDeleteReport(e, item.id)}
                                            className="p-2 text-slate-600 hover:text-accent-red transition-colors"
                                            title="Excluir Laudo"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] opacity-30">
                                    <span className="material-symbols-outlined text-7xl mb-6">inventory_2</span>
                                    <p className="font-black text-xl uppercase tracking-widest">Sem laudos arquivados</p>
                                </div>
                            )
                        ) : (
                            <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] opacity-30">
                                <span className="material-symbols-outlined text-7xl mb-6">forum</span>
                                <p className="font-black text-xl uppercase tracking-widest">Em breve: Histórico de Chats</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Profile;
