
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    
    useEffect(() => {
        if (!loading && user) navigate(AppRoute.HOME);
    }, [user, loading, navigate]);

    return (
        <div className="flex flex-col h-screen bg-[#0B0F1A] text-white overflow-hidden relative">
            <main className="flex-1 flex flex-col items-center justify-center px-8 z-10">
                <div className="max-w-3xl w-full text-center space-y-12">
                    <Logo variant="full" size="xl" />

                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-5xl font-black leading-tight text-white tracking-tight uppercase">
                            Diagnóstico preciso <br/> <span className="text-orange-500">em tempo real.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
                            A plataforma de inteligência técnica definitiva para mecânicos que buscam alta performance e resultados.
                        </p>
                    </div>

                    <div className="pt-8 max-w-sm mx-auto w-full">
                        <button 
                            onClick={() => navigate(AppRoute.LOGIN)}
                            className="w-full flex items-center justify-center h-16 bg-orange-600 rounded-2xl text-lg font-black uppercase tracking-widest text-white shadow-xl shadow-orange-600/20 hover:bg-orange-700 active:scale-[0.98] transition-all"
                        >
                            Acessar Sistema
                        </button>
                    </div>
                </div>
            </main>

            <footer className="p-8 text-center opacity-30">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">AutoIntel Pro — Technical Intelligence 2025</p>
            </footer>
        </div>
    );
};

export default Welcome;
