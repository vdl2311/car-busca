
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppRoute } from './types';
import { AuthProvider } from './contexts/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import VehicleInput from './pages/VehicleInput';
import ReportResult from './pages/ReportResult';
import DefectDetail from './pages/DefectDetail';
import Profile from './pages/Profile';
import ReportIssue from './pages/ReportIssue';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';

const InstallBanner: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Pequeno delay para não assustar o usuário logo no carregamento
            setTimeout(() => setIsVisible(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        setIsVisible(false);
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Usuário escolheu: ${outcome}`);
        setDeferredPrompt(null);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 left-4 right-4 z-[100] md:hidden animate-in slide-in-from-top duration-500">
            <div className="bg-orange-600 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between border border-white/20">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">download_for_offline</span>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-tight">Instalar AutoIntel?</h4>
                        <p className="text-[10px] font-bold opacity-80 uppercase">Acesse como um aplicativo nativo</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsVisible(false)} className="px-3 py-2 text-[10px] font-black uppercase opacity-60">Agora não</button>
                    <button onClick={handleInstall} className="bg-white text-orange-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-90 transition-transform">Instalar</button>
                </div>
            </div>
        </div>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isAuthPage = [AppRoute.WELCOME, AppRoute.LOGIN].includes(location.pathname as AppRoute);
    
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    if (isAuthPage) {
        return (
            <div className="min-h-screen w-full bg-background-light dark:bg-background-dark">
                <InstallBanner />
                {children}
            </div>
        );
    }

    const showBottomNav = [
        AppRoute.HOME,
        AppRoute.PROFILE,
        AppRoute.REPORT_RESULT,
        AppRoute.REPORT_ISSUE
    ].includes(location.pathname as AppRoute);

    return (
        <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300">
            <InstallBanner />
            <Sidebar isDark={isDark} onToggleTheme={toggleTheme} />
            <div className="flex-1 flex flex-col relative w-full overflow-x-hidden">
                <main className={`flex-1 w-full max-w-7xl mx-auto ${showBottomNav ? 'pb-20 md:pb-6' : 'pb-6'}`}>
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child as React.ReactElement<any>, { isDark, toggleTheme });
                        }
                        return child;
                    })}
                </main>
                {showBottomNav && <BottomNav />}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <HashRouter>
                <Layout>
                    <Routes>
                        <Route path={AppRoute.WELCOME} element={<Welcome />} />
                        <Route path={AppRoute.LOGIN} element={<Login />} />
                        <Route path={AppRoute.HOME} element={<VehicleInput />} />
                        <Route path={AppRoute.REPORT_RESULT} element={<ReportResult />} />
                        <Route path={AppRoute.DEFECT_DETAIL} element={<DefectDetail />} />
                        <Route path={AppRoute.PROFILE} element={<Profile />} />
                        <Route path={AppRoute.REPORT_ISSUE} element={<ReportIssue />} />
                    </Routes>
                </Layout>
            </HashRouter>
        </AuthProvider>
    );
};

export default App;
