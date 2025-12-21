import React from 'react';
import { Post } from '../types';

const Community: React.FC = () => {
    const posts: Post[] = [
        {
            id: '1',
            user: { name: 'Carlos Silva', avatar: '', car: 'Ford Ka 2019' },
            timeAgo: '2h atrás',
            title: 'Ruído estranho ao ligar o ar condicionado',
            content: 'Alguém já teve esse problema? Faz um barulho de "tec tec" quando ligo o AC no nível 2. Parece vir do porta-luvas.',
            likes: 12,
            comments: 5,
            hasAudio: true
        },
        {
            id: '2',
            user: { name: 'Marina Costa', avatar: '', car: 'BMW 320i 2021' },
            timeAgo: '5h atrás',
            title: 'Luz de injeção acesa e perda de potência',
            content: 'Fiz o scan com o app e a IA detectou falha na bobina do cilindro 3. Troquei a peça e o carro voltou ao normal!',
            likes: 45,
            comments: 18,
            resolved: true,
            aiInsight: {
                diagnosis: 'Falha de Ignição - Cilindro 3',
                confidence: 98,
                description: 'Recomendação: Verificar velas de ignição e bobinas. Substituição recomendada.'
            }
        }
    ];

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    return (
        <div className="flex flex-col h-full md:px-6">
            <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 md:rounded-b-2xl md:border-x md:top-4 md:mb-4">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="flex items-center justify-center rounded-full size-9 bg-primary/20 text-primary ring-2 ring-primary/20">
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_circle</span>
                                </div>
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background-dark"></span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Comunidade</h1>
                        </div>
                        <button className="flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-surface-highlight transition-colors text-gray-600 dark:text-gray-300">
                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>notifications</span>
                        </button>
                    </div>
                    {/* Search */}
                    <div className="px-4 pb-2">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
                            </div>
                            <input className="block w-full p-2.5 pl-10 text-sm rounded-xl bg-gray-100 dark:bg-surface-dark border-transparent focus:border-primary focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 transition-all shadow-sm" placeholder="Buscar problemas, códigos de erro, modelos..." type="text" />
                        </div>
                    </div>
                    {/* Filter Chips */}
                    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
                        <button className="flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold shadow-md shadow-primary/20">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>tune</span>
                            <span>Filtrar</span>
                        </button>
                        {['Toyota', 'Honda', 'Motor', 'Elétrica'].map(tag => (
                            <button key={tag} className="shrink-0 px-3 py-1.5 rounded-full bg-gray-200 dark:bg-surface-dark hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors">
                                {tag}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Feed */}
                <main className="flex-1 px-4 py-4 space-y-4 md:px-0">
                    {posts.map(post => (
                        <article key={post.id} className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:scale-[1.01] duration-200">
                            {/* Post Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-3">
                                    <div className="flex items-center justify-center rounded-full size-10 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm">
                                        {getInitials(post.user.name)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{post.user.name}</h3>
                                            <span className="text-xs text-gray-500">• {post.timeAgo}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                            <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">{post.user.car}</span>
                                            {post.resolved && (
                                                <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20 gap-1">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                                                    Resolvido
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-white">
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_horiz</span>
                                </button>
                            </div>
                            {/* Content */}
                            <div className="mb-3">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{post.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{post.content}</p>
                            </div>
                            {/* Audio Mock */}
                            {post.hasAudio && (
                                <div className="flex items-center gap-3 bg-gray-100 dark:bg-background-dark rounded-lg p-2 mb-3 border border-gray-200 dark:border-gray-700">
                                    <button className="flex items-center justify-center size-8 rounded-full bg-primary text-white shrink-0">
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_arrow</span>
                                    </button>
                                    <div className="h-8 flex-1 flex items-center gap-0.5 opacity-50 px-2">
                                        <div className="w-full h-1 bg-gray-400 rounded-full"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">0:14</span>
                                </div>
                            )}
                            {/* AI Insight Card */}
                            {post.aiInsight && (
                                <div className="mb-3 rounded-lg overflow-hidden border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/10">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-900/50">
                                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400" style={{ fontSize: '18px' }}>smart_toy</span>
                                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Análise IA AutoScan</span>
                                    </div>
                                    <div className="p-3 flex gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Diagnóstico Provável</span>
                                                <span className="text-xs font-bold text-green-600 dark:text-green-400">{post.aiInsight.confidence}% Confiança</span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{post.aiInsight.diagnosis}</p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.aiInsight.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
                                <div className="flex gap-4">
                                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors group">
                                        <span className="material-symbols-outlined group-hover:text-primary" style={{ fontSize: '20px' }}>thumb_up</span>
                                        <span className="text-xs font-medium">{post.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 transition-colors group">
                                        <span className="material-symbols-outlined group-hover:text-blue-400" style={{ fontSize: '20px' }}>chat_bubble</span>
                                        <span className="text-xs font-medium">{post.comments}</span>
                                    </button>
                                </div>
                                <button className="text-gray-400 hover:text-white">
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>share</span>
                                </button>
                            </div>
                        </article>
                    ))}
                    <div className="flex justify-center py-4">
                        <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '24px' }}>progress_activity</span>
                    </div>
                </main>
                {/* FAB */}
                <button className="fixed bottom-20 right-4 z-50 flex items-center justify-center size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:bg-blue-600 transition-transform active:scale-95 md:absolute md:bottom-8 md:right-0 md:translate-x-12 lg:translate-x-20">
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add</span>
                </button>
            </div>
        </div>
    );
};

export default Community;