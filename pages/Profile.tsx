
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

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            let combined: SavedReport[] = [];

            // 1. Fetch from Supabase
            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching history from Supabase:", error);
                } else if (data) {
                    combined = [...data];
                }
            } catch (err) {
                console.error(err);
            }

            // 2. Fetch from LocalStorage
            try {
                const localDataString = localStorage.getItem('local_reports');
                if (localDataString) {
                    const localData = JSON.parse(localDataString);
                    // Filter for current user to avoid showing other users' data on shared device
                    const userLocalData = localData.filter((item: any) => item.user_id === user.id);
                    // Merge avoiding duplicates (optional, based on ID if we sync later)
                    combined = [...combined, ...userLocalData];
                }
            } catch (e) { 
                console.error("Error reading from localStorage:", e); 
            }

            // Sort combined history by date (newest first)
            combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setHistory(combined);
            setLoadingHistory(false);
        };

        fetchHistory();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate(AppRoute.WELCOME);
    };

    const handleOpenHistoryItem = (item: SavedReport) => {
        // Check if it is a Chat session or a standard Report
        if (item.report_data?.type === 'chat') {
             navigate(AppRoute.REPORT_ISSUE, {
                state: {
                    savedMessages: item.report_data.messages
                }
            });
        } else {
            // Standard Vehicle Report
            navigate(AppRoute.REPORT_RESULT, {
                state: {
                    brand: item.brand,
                    model: item.model,
                    year: item.year,
                    km: item.km,
                    savedReportData: item.report_data
                }
            });
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
        } catch (e) {
            return 'Data inválida';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Top App Bar */}
            <div className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 justify-between border-b border-gray-200 dark:border-gray-800">
                <div onClick={() => navigate(-1)} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontSize: '24px' }}>arrow_back</span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Meu Perfil</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-6">
                <div className="flex p-4 flex-col items-center gap-6 mt-2">
                    <div className="relative group">
                        <div className="flex items-center justify-center h-28 w-28 rounded-full bg-primary/20 text-primary ring-4 ring-primary/20">
                            <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>person</span>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-4 border-background-light dark:border-background-dark flex items-center justify-center">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                        <h1 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">
                            {user?.email?.split('@')[0] || 'Usuário'}
                        </h1>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>workspace_premium</span>
                            <p className="text-primary text-sm font-semibold">Membro</p>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 px-4 py-2">
                    <div className="flex flex-col gap-1 items-center justify-center rounded-xl p-3 bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-transparent">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{history.length}</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-gray-400 text-center">Avaliações</span>
                    </div>
                    <div className="flex flex-col gap-1 items-center justify-center rounded-xl p-3 bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-transparent relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-1 opacity-10 text-primary">
                            <span className="material-symbols-outlined">auto_awesome</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">100%</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-gray-400 text-center flex items-center gap-1">
                            Precisão IA
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 items-center justify-center rounded-xl p-3 bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-transparent">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">0</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-gray-400 text-center">Contribuições</span>
                    </div>
                </div>

                {/* Report History */}
                <div className="mt-8 px-4">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined">history</span>
                        Histórico de Análises
                    </h3>
                    
                    {loadingHistory ? (
                         <div className="flex justify-center py-6">
                            <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                        </div>
                    ) : history.length > 0 ? (
                        <div className="space-y-3">
                            {history.map((item) => {
                                const isChat = item.report_data?.type === 'chat';
                                const isLocal = item.id.startsWith('local-');
                                return (
                                    <div 
                                        key={item.id} 
                                        onClick={() => handleOpenHistoryItem(item)}
                                        className="bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm border border-gray-100 dark:border-transparent flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-surface-highlight transition-colors group"
                                    >
                                        {/* Icon/Score Box */}
                                        <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-lg relative ${
                                            isChat 
                                                ? 'bg-blue-500' 
                                                : item.score >= 7 ? 'bg-green-500' : item.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}>
                                            {isChat ? (
                                                <span className="material-symbols-outlined">smart_toy</span>
                                            ) : (
                                                item.score
                                            )}
                                            {isLocal && (
                                                <div className="absolute -bottom-1 -right-1 bg-gray-500 rounded-full w-4 h-4 flex items-center justify-center border border-white dark:border-surface-dark" title="Salvo localmente">
                                                    <span className="material-symbols-outlined text-[10px]">cloud_off</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Text Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                {isChat 
                                                    ? `Consultoria Mecânica` 
                                                    : `${item.brand} ${item.model}`}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                                                {isChat 
                                                    ? (item.report_data.summary || 'Bate-papo com IA')
                                                    : `${formatDate(item.created_at)}`}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-surface-dark/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">find_in_page</span>
                            <p className="text-slate-500 dark:text-gray-400 text-sm">Nenhum relatório salvo ainda.</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-8 px-4 mb-24">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Sair da Conta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
