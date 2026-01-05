
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) navigate(AppRoute.HOME);
    }, [user, loading, navigate]);

    return (
        <div className="flex flex-col h-screen bg-background-dark text-white overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-[-5%] left-[-10%] w-[100%] h-[40%] md:w-[70%] md:h-[50%] bg-primary/10 blur-[80px] md:blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-5%] right-[-10%] w-[100%] h-[40%] md:w-[70%] md:h-[50%] bg-blue-600/10 blur-[80px] md:blur-[120px] rounded-full"></div>

            <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-8 z-10">
                <div className="max-w-2xl w-full text-center space-y-8 md:space-y-12">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center gap-4 md:gap-6 animate-fade-in">
                        <div className="size-16 md:size-20 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-[0_0_40px_rgba(19,91,236,0.4)] ring-4 ring-primary/20">
                            <span className="material-symbols-outlined text-[32px] md:text-[44px] text-white font-bold">network_intelligence</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white leading-none">
                            AutoIntel <span className="text-primary">AI</span>
                        </h1>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4 md:space-y-6">
                        <h2 className="text-2xl md:text-4xl font-extrabold leading-tight text-white/90 px-2 md:px-4">
                            O padrão ouro em <br className="hidden sm:block"/> <span className="italic">análise automotiva.</span>
                        </h2>
                        <p className="text-[15px] md:text-xl text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
                            Detecte fraudes, preveja manutenções e tome decisões de compra baseadas em dados reais de engenharia.
                        </p>
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-col gap-4 pt-4 md:pt-8 max-w-sm mx-auto w-full">
                        <button 
                            onClick={() => navigate(AppRoute.LOGIN)}
                            className="group relative flex items-center justify-center h-16 md:h-20 bg-primary rounded-xl md:rounded-[2rem] text-[18px] md:text-2xl font-black tracking-tight shadow-lg shadow-primary/30 hover:bg-blue-600 active:scale-[0.97] transition-all overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <span className="relative z-10 flex items-center gap-2">
                                Iniciar Consultoria
                                <span className="material-symbols-outlined font-bold text-2xl">arrow_forward</span>
                            </span>
                        </button>
                        <p className="text-slate-500 font-bold text-xs md:text-base tracking-wide">
                            Primeira análise técnica 100% gratuita.
                        </p>
                    </div>
                </div>
            </main>

            {/* Status Footer */}
            <footer className="p-6 md:p-10 text-center z-10">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <span className="size-1.5 bg-accent-green rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></span>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/50">AutoIntel Neural Cloud</span>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;
