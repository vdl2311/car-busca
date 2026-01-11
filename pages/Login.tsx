
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            navigate(AppRoute.HOME);
        }
    }, [user, navigate]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (authMode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate(AppRoute.HOME);
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Conta criada! Verifique seu email ou faça login.');
                setAuthMode('login');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao autenticar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 md:bg-gray-50 md:dark:bg-[#0B1019] page-transition">
            <div className="w-full max-w-md bg-background-light dark:bg-background-dark md:bg-white md:dark:bg-surface-dark md:shadow-2xl md:rounded-3xl md:border md:border-gray-100 md:dark:border-gray-800 md:p-8 overflow-hidden flex flex-col">
                
                {/* Header Branding Section */}
                <div className="flex flex-col items-center pt-8 pb-8 px-6 cursor-pointer" onClick={() => navigate(AppRoute.WELCOME)}>
                    <Logo variant="horizontal" size="md" />
                </div>

                {/* Segmented Control (Tabs) */}
                <div className="px-6 mb-8">
                    <div className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-200 dark:bg-surface-dark md:dark:bg-background-dark p-1">
                        <label className="group flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-orange-600 has-[:checked]:shadow-sm transition-all duration-200">
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-has-[:checked]:text-slate-900 dark:group-has-[:checked]:text-white truncate uppercase tracking-widest text-[10px]">Entrar</span>
                            <input 
                                className="hidden" 
                                name="auth-mode" 
                                type="radio" 
                                value="login"
                                checked={authMode === 'login'}
                                onChange={() => setAuthMode('login')}
                            />
                        </label>
                        <label className="group flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-orange-600 has-[:checked]:shadow-sm transition-all duration-200">
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-has-[:checked]:text-slate-900 dark:group-has-[:checked]:text-white truncate uppercase tracking-widest text-[10px]">Cadastrar</span>
                            <input 
                                className="hidden" 
                                name="auth-mode" 
                                type="radio" 
                                value="register"
                                checked={authMode === 'register'}
                                onChange={() => setAuthMode('register')}
                            />
                        </label>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleAuth} className="flex flex-col gap-4 px-6 pb-6">
                    {error && (
                        <div className="bg-red-500/10 text-red-500 text-[10px] p-3 rounded-lg border border-red-500/20 font-black uppercase tracking-tight leading-normal">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">E-mail Técnico</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 material-symbols-outlined text-[20px]">mail</span>
                            <input 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-background-dark py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-500 transition-all font-bold" 
                                placeholder="oficina@exemplo.com" 
                                type="email" 
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Senha de Acesso</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 material-symbols-outlined text-[20px]">lock</span>
                            <input 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-background-dark py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-500 transition-all font-bold" 
                                placeholder="••••••••" 
                                type="password"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="mt-6 w-full rounded-xl bg-orange-600 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? 'Sincronizando...' : authMode === 'login' ? 'Entrar no Sistema' : 'Criar Registro'}
                    </button>
                </form>

                <div className="px-6 pb-8 text-center mt-auto">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-40 italic">Protegido por AutoIntel Guard Protocol v4.5</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
