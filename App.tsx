
import React from 'react';
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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isAuthPage = [AppRoute.WELCOME, AppRoute.LOGIN].includes(location.pathname as AppRoute);
    
    if (isAuthPage) {
        return (
            <div className="min-h-screen w-full bg-background-dark">
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
        <div className="flex min-h-screen w-full bg-background-dark text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col relative w-full overflow-x-hidden">
                <main className={`flex-1 w-full max-w-7xl mx-auto ${showBottomNav ? 'pb-20 md:pb-6' : 'pb-6'}`}>
                    {children}
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
