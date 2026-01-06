
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: 'search', label: 'Análise de Veículo', path: AppRoute.HOME },
        { icon: 'robot_2', label: 'Mecânico Virtual', path: AppRoute.REPORT_ISSUE },
        { icon: 'person', label: 'Perfil', path: AppRoute.PROFILE },
    ];

    return (
        <aside className="hidden md:flex flex-col w-80 bg-background-dark border-r border-white/5 h-screen sticky top-0 p-8 z-50">
             <div className="flex items-center gap-4 mb-14 px-2 cursor-pointer group" onClick={() => navigate(AppRoute.HOME)}>
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white shadow-[0_0_20px_rgba(19,91,236,0.3)] group-hover:scale-110 transition-all duration-300">
                    <span className="material-symbols-outlined text-[30px] font-bold">network_intelligence</span>
                </div>
                <div>
                    <h1 className="text-white font-black text-2xl tracking-tighter">AutoIntel AI</h1>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] leading-none mt-1">Intelligence Pro</p>
                </div>
            </div>

            <nav className="flex-1 space-y-3">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 group ${
                            isActive(item.path) 
                            ? 'bg-primary text-white shadow-[0_10px_25px_rgba(19,91,236,0.25)]' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[24px] ${isActive(item.path) ? 'fill-current' : ''}`}>
                            {item.icon}
                        </span>
                        <span className="font-bold text-base tracking-tight">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto">
                <div className="bg-gradient-to-br from-white/[0.03] to-transparent rounded-[2rem] p-6 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-primary text-xl font-bold">verified_user</span>
                        <span className="font-black text-xs text-white uppercase tracking-widest">AutoIntel Guard</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-4 font-bold leading-relaxed">Sua decisão baseada em dados reais e inteligência avançada.</p>
                    <button className="w-full py-3 rounded-xl bg-white/5 text-xs font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest">Upgrade Prime</button>
                </div>
            </div>
        </aside>
    );
};
export default Sidebar;
