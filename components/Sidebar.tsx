
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: 'home', label: 'Início', path: AppRoute.HOME },
        { icon: 'smart_toy', label: 'Mecânico Virtual', path: AppRoute.REPORT_ISSUE },
        { icon: 'person', label: 'Perfil', path: AppRoute.PROFILE },
    ];

    return (
        <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 p-6 z-50">
             <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => navigate(AppRoute.HOME)}>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-[24px]">network_intelligence</span>
                </div>
                <h1 className="text-slate-900 dark:text-white font-bold text-2xl tracking-tight">AutoIntel IA</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-3.5 w-full p-4 rounded-2xl transition-all duration-200 font-medium text-base group ${
                            isActive(item.path) 
                            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "'FILL' 0" }}>
                            {item.icon}
                        </span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-primary">verified_user</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Plano Pro</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Acesso ilimitado à IA e relatórios detalhados.</p>
                    <button className="text-xs font-bold text-primary hover:underline">Fazer Upgrade</button>
                </div>
            </div>
        </aside>
    );
};
export default Sidebar;
