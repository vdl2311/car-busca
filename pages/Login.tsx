
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

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
                <div className="flex flex-col items-center pt-6 pb-6 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 mb-4 cursor-pointer" onClick={() => navigate(AppRoute.WELCOME)}>
                        <span className="material-symbols-outlined text-white text-4xl font-bold">network_intelligence</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-center">AutoIntel AI</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 text-center">Inteligência Automotiva Superior</p>
                </div>

                {/* Segmented Control (Tabs) */}
                <div className="px-6 mb-8">
                    <div className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-200 dark:bg-surface-dark md:dark:bg-background-dark p-1">
                        <label className="group flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-primary has-[:checked]:shadow-sm transition-all duration-200">
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-has-[:checked]:text-slate-900 dark:group-has-[:checked]:text-white truncate">Entrar</span>
                            <input 
                                className="hidden" 
                                name="auth-mode" 
                                type="radio" 
                                value="login"
                                checked={authMode === 'login'}
                                onChange={() => setAuthMode('login')}
                            />
                        </label>
                        <label className="group flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-primary has-[:checked]:shadow-sm transition-all duration-200">
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-has-[:checked]:text-slate-900 dark:group-has-[:checked]:text-white truncate">Cadastrar</span>
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
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] p-3 rounded-lg border border-red-100 dark:border-red-900/50 font-black uppercase tracking-tight leading-normal">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">E-mail</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 material-symbols-outlined text-[20px]">mail</span>
                            <input 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark py-3 pl-11 pr-4 text-sm outline-none focus:border-primary transition-all font-bold" 
                                placeholder="seu@email.com" 
                                type="email" 
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Senha</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 material-symbols-outlined text-[20px]">lock</span>
                            <input 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark py-3 pl-11 pr-4 text-sm outline-none focus:border-primary transition-all font-bold" 
                                placeholder="••••••••" 
                                type="password"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="mt-6 w-full rounded-xl bg-primary py-4 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : authMode === 'login' ? 'Acessar Conta' : 'Criar Registro'}
                    </button>
                </form>

                <div className="px-6 pb-8 text-center mt-auto">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Protegido por AutoIntel Guard Protocol</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
