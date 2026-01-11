
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    useEffect(() => {
        if (!loading && user) navigate(AppRoute.HOME);
    }, [user, loading, navigate]);

    useEffect(() => {
        const isBannerDismissed = localStorage.getItem('autointel_install_dismissed') === 'true';
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (!isStandalone && !isBannerDismissed) setShowInstallBanner(true);
        });
    }, []);

    return (
        <div className="flex flex-col h-screen bg-background-dark text-white overflow-hidden relative">
            <div className="absolute top-[-5%] left-[-10%] w-[100%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
            
            <main className="flex-1 flex flex-col items-center justify-center px-8 z-10">
                <div className="max-w-3xl w-full text-center space-y-12">
                    <div className="flex flex-col items-center gap-8 animate-fade-in">
                        <div className="size-24 rounded-3xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-2xl ring-8 ring-primary/10">
                            <span className="material-symbols-outlined text-[50px] text-white font-bold">handyman</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none">
                            AutoIntel <span className="text-primary italic">PRO</span>
                        </h1>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-white/90">
                            A ferramenta que fala a <br/> <span className="text-orange-500">língua da oficina.</span>
                        </h2>
                        <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
                            O pulo do gato pra torques, capacidades e diagnóstico especialista. Direto ao ponto, sem enrolação técnica.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 pt-10 max-w-sm mx-auto w-full">
                        <button 
                            onClick={() => navigate(AppRoute.LOGIN)}
                            className="group relative flex items-center justify-center h-20 bg-primary rounded-[2rem] text-xl font-black tracking-tight shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3 uppercase tracking-widest">
                                Abrir Painel da Oficina
                                <span className="material-symbols-outlined font-bold">arrow_forward</span>
                            </span>
                        </button>
                    </div>
                </div>
            </main>

            <footer className="p-12 text-center opacity-40">
                <p className="text-[11px] font-black uppercase tracking-[0.5em]">Feito de Mecânico para Mecânico • V4.5</p>
            </footer>
        </div>
    );
};

export default Welcome;
