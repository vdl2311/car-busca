
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: 'construction', label: 'Diagnóstico Master', path: AppRoute.HOME },
        { icon: 'smart_toy', label: 'Mecânico Virtual', path: AppRoute.REPORT_ISSUE },
        { icon: 'history', label: 'Histórico Técnico', path: AppRoute.PROFILE },
    ];

    return (
        <aside className="hidden md:flex flex-col w-80 bg-background-dark border-r border-white/5 h-screen sticky top-0 p-8 z-50">
             <div className="flex items-center gap-4 mb-14 px-2 cursor-pointer group" onClick={() => navigate(AppRoute.HOME)}>
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-600 text-white shadow-xl shadow-orange-600/20 group-hover:scale-110 transition-all">
                    <span className="material-symbols-outlined text-[30px] font-bold">engineering</span>
                </div>
                <div>
                    <h1 className="text-white font-black text-2xl tracking-tighter uppercase italic leading-none">AutoIntel <span className="text-orange-500">Pro</span></h1>
                    <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em] leading-none mt-1">Especialista de Bancada</p>
                </div>
            </div>

            <nav className="flex-1 space-y-3">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-4 w-full p-5 rounded-[2rem] transition-all duration-300 group ${
                            isActive(item.path) 
                            ? 'bg-orange-600 text-white shadow-xl' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[24px]`}>
                            {item.icon}
                        </span>
                        <span className="font-bold text-base tracking-tight">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto">
                <div className="bg-gradient-to-br from-white/[0.03] to-transparent rounded-[2rem] p-6 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                        Sistema focado em alta performance mecânica. <br/> Versão 4.5 Specialist.
                    </p>
                </div>
            </div>
        </aside>
    );
};
export default Sidebar;
