import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: 'home', label: 'Início', path: AppRoute.HOME },
        { icon: 'directions_car', label: 'Garagem', path: AppRoute.HOME }, // Reusing home for demo
        { icon: 'forum', label: 'Comunidade', path: AppRoute.COMMUNITY, badge: true },
        { icon: 'smart_toy', label: 'Mecânico AI', path: AppRoute.REPORT_ISSUE },
        { icon: 'person', label: 'Perfil', path: AppRoute.PROFILE },
    ];

    return (
        <nav className="fixed bottom-0 z-50 w-full bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pb-safe md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item, index) => {
                    const active = isActive(item.path);
                    
                    return (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                                active ? 'text-primary' : 'text-gray-400 hover:text-slate-600 dark:hover:text-slate-200'
                            } relative`}
                        >
                            <span 
                                className="material-symbols-outlined" 
                                style={{ 
                                    fontSize: '24px', 
                                    fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" 
                                }}
                            >
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-medium mt-1">{item.label}</span>
                            {item.badge && !active && (
                                <span className="absolute top-3 right-5 sm:right-7 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-background-dark"></span>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;