
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';
import Logo from './Logo';

interface SidebarProps {
    isDark?: boolean;
    onToggleTheme?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isDark, onToggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
    };

    const navItems = [
        { icon: 'construction', label: 'Diagnóstico Master', path: AppRoute.HOME },
        { icon: 'smart_toy', label: 'Mecânico Virtual', path: AppRoute.REPORT_ISSUE },
        { icon: 'history', label: 'Histórico Técnico', path: AppRoute.PROFILE },
    ];

    return (
        <aside className="hidden md:flex flex-col w-80 bg-surface-light dark:bg-background-dark border-r border-slate-200 dark:border-white/5 h-screen sticky top-0 p-8 z-50 transition-colors">
             <div className="mb-14 px-2 cursor-pointer group" onClick={() => navigate(AppRoute.HOME)}>
                <Logo variant="horizontal" size="sm" />
            </div>

            <nav className="flex-1 space-y-3">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-4 w-full p-5 rounded-[2rem] transition-all duration-300 group ${
                            isActive(item.path) 
                            ? 'bg-orange-600 text-white shadow-xl' 
                            : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[24px]`}>
                            {item.icon}
                        </span>
                        <span className="font-bold text-base tracking-tight">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto space-y-4">
                {deferredPrompt && (
                    <button 
                        onClick={handleInstall}
                        className="w-full flex items-center gap-3 p-4 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500/20 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">install_mobile</span>
                        Instalar no Windows/Mac
                    </button>
                )}
                
                <div className="bg-gradient-to-br from-slate-100 to-transparent dark:from-white/[0.03] dark:to-transparent rounded-[2rem] p-6 border border-slate-200 dark:border-white/5">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed italic">
                        Sistema focado em alta performance mecânica. <br/> Versão 4.5.5 Specialist.
                    </p>
                </div>
            </div>
        </aside>
    );
};
export default Sidebar;
