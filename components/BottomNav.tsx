
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: 'home', label: 'Início', path: AppRoute.HOME },
        { icon: 'smart_toy', label: 'Mecânico Virtual', path: AppRoute.REPORT_ISSUE },
        { icon: 'folder_open', label: 'Histórico', path: AppRoute.PROFILE },
    ];

    return (
        <nav className="fixed bottom-0 z-50 w-full glass border-t border-white/5 pb-safe md:hidden">
            <div className="flex justify-around items-center h-22 px-4">
                {navItems.map((item, index) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative ${active ? 'text-orange-500' : 'text-slate-600'}`}
                        >
                            {active && <div className="absolute top-0 w-12 h-1 bg-orange-500 rounded-full shadow-[0_0_15px_#f97316]"></div>}
                            <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                                {item.icon}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-tighter mt-1.5 text-center px-1 whitespace-nowrap">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
