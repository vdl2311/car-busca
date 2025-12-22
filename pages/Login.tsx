
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Provider } from '@supabase/supabase-js';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
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

    const handleOAuthLogin = async (provider: Provider) => {
        setSocialLoading(provider);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || `Erro ao entrar com ${provider}`);
            setSocialLoading(null);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 md:bg-gray-50 md:dark:bg-[#0B1019]">
            <div className="w-full max-w-md bg-background-light dark:bg-background-dark md:bg-white md:dark:bg-surface-dark md:shadow-2xl md:rounded-3xl md:border md:border-gray-100 md:dark:border-gray-800 md:p-8 overflow-hidden flex flex-col">
                
                {/* Header Branding Section */}
                <div className="flex flex-col items-center pt-6 pb-6 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                        <span className="material-symbols-outlined text-white text-4xl">directions_car</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-center">AutoScan IA</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 text-center">Análise veicular inteligente e precisa</p>
                </div>

                {/* Segmented Control (Tabs) */}
                <div className="px-6 mb-6">
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

                {/* Dynamic Headline */}
                <div className="px-6 mb-2">
                    <h1 className="text-2xl font-bold leading-tight">
                        {authMode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {authMode === 'login' 
                            ? 'Insira suas credenciais para acessar a plataforma.'
                            : 'Preencha os dados para começar sua jornada.'
                        }
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleAuth} className="flex flex-col gap-5 px-6 py-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 material-symbols-outlined text-[20px]">mail</span>
                            <input 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-border-dark md:dark:border-gray-700 bg-white dark:bg-surface-dark md:dark:bg-background-dark py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                                placeholder="exemplo@empresa.com" 
                                type="email" 
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                            {authMode === 'login' && (
                                <button type="button" className="text-xs font-semibold text-primary hover:text-blue-400 transition-colors">Esqueceu sua senha?</button>
                            )}
                        </div>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 material-symbols-outlined text-[20px]">lock</span>
                            <input 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-border-dark md:dark:border-gray-700 bg-white dark:bg-surface-dark md:dark:bg-background-dark py-3.5 pl-11 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                                placeholder="••••••••" 
                                type="password"
                                required
                            />
                        </div>
                    </div>

                    {/* Primary Action Button */}
                    <button 
                        type="submit" 
                        disabled={loading || !!socialLoading}
                        className="mt-2 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[20px]">
                                    {authMode === 'login' ? 'login' : 'person_add'}
                                </span>
                                {authMode === 'login' ? 'Acessar Plataforma' : 'Criar Conta'}
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-200 dark:border-border-dark md:dark:border-gray-700"></div>
                        <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Ou continue com</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-border-dark md:dark:border-gray-700"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => handleOAuthLogin('google')}
                            disabled={loading || !!socialLoading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-border-dark md:dark:border-gray-700 bg-white dark:bg-surface-dark md:dark:bg-background-dark py-3 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" 
                            type="button"
                        >
                            {socialLoading === 'google' ? (
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            ) : (
                                <>
                                    <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500">G</span>
                                    <span>Google</span>
                                </>
                            )}
                        </button>
                        <button 
                            onClick={() => handleOAuthLogin('facebook')}
                            disabled={loading || !!socialLoading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-border-dark md:dark:border-gray-700 bg-white dark:bg-surface-dark md:dark:bg-background-dark py-3 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" 
                            type="button"
                        >
                            {socialLoading === 'facebook' ? (
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            ) : (
                                <>
                                    <span className="font-bold text-lg text-[#1877F2]">f</span>
                                    <span>Facebook</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer / Terms */}
                <div className="p-6 pt-0 mt-auto md:mt-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 opacity-60 mb-2">
                        <span className="material-symbols-outlined text-green-500 text-xs">verified_user</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Seus dados estão protegidos e criptografados.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
