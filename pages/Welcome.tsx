
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            navigate(AppRoute.HOME);
        }
    }, [user, loading, navigate]);

    return (
        <div className="flex flex-col md:flex-row h-full min-h-screen">
            {/* Left Content / Mobile Top */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6 w-full md:max-w-xl mx-auto md:h-screen md:overflow-y-auto">
                <div className="w-full max-w-md mx-auto flex flex-col items-center">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 mb-8 animate-fade-in opacity-90 hover:opacity-100 transition-opacity cursor-default">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary">
                            <span className="material-symbols-outlined text-[24px]">network_intelligence</span>
                        </div>
                        <h1 className="text-slate-900 dark:text-white tracking-tight text-[26px] font-bold leading-tight">AutoIntel IA</h1>
                    </div>

                    {/* Hero Graphic (No Image) */}
                    <div className="w-full relative aspect-[4/3] mb-8 group">
                        <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full opacity-40 dark:opacity-20 scale-75 group-hover:scale-90 transition-transform duration-700"></div>
                        <div 
                            className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-surface-highlight dark:to-surface-dark rounded-2xl shadow-xl border border-white/10 relative overflow-hidden z-10 flex items-center justify-center" 
                        >
                            <span className="material-symbols-outlined text-9xl text-slate-300 dark:text-slate-600">directions_car</span>
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/20 via-transparent to-transparent"></div>
                            
                            {/* Floating Badge */}
                            <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                                    <span className="text-white/90 text-xs font-medium">Análise via IA Ativa</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex flex-col gap-3 text-center z-10 mb-8">
                        <h2 className="text-slate-900 dark:text-white text-[28px] md:text-[32px] font-bold leading-[1.15] tracking-[-0.015em]">
                            Desvende o Histórico do Seu Veículo
                        </h2>
                        <p className="text-slate-600 dark:text-gray-400 text-base font-normal leading-relaxed px-2">
                            Avaliação detalhada, verificação de procedência e análise de dados automotivos com inteligência artificial.
                        </p>
                    </div>

                    {/* Bottom Actions Section */}
                    <div className="w-full z-10">
                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={() => navigate(AppRoute.LOGIN)}
                                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all text-white text-[17px] font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/20"
                            >
                                <span className="mr-2">Começar</span>
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                            
                            <div className="flex justify-center items-center py-2">
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    Já tem uma conta? 
                                    <button onClick={() => navigate(AppRoute.LOGIN)} className="text-primary hover:text-primary/80 font-semibold ml-1 transition-colors">Entrar</button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Desktop Only Visual */}
            <div className="hidden md:flex flex-1 bg-surface-dark relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-background-dark to-background-dark opacity-50"></div>
                <div className="relative z-10 max-w-lg text-center">
                    <div className="grid grid-cols-2 gap-4 opacity-50 mb-8 rotate-12 scale-110">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="bg-surface-highlight rounded-2xl h-40 w-40 flex items-center justify-center border border-white/5">
                                <span className="material-symbols-outlined text-4xl text-white/20">analytics</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
