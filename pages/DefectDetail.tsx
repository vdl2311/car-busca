
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DefectDetail: React.FC = () => {
    const navigate = useNavigate();

    const handleDownloadPDF = () => {
        window.print();
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen relative pb-28">
            <style>
                {`
                @media print {
                    header, .bottom-actions, .nav-bar { display: none !important; }
                    main { padding: 0 !important; width: 100% !important; margin: 0 !important; }
                    body { background: white !important; color: black !important; }
                    .bg-surface-dark, .bg-white { background: transparent !important; border: 1px solid #eee !important; box-shadow: none !important; }
                    .text-white { color: black !important; }
                    .bg-primary { background: #135bec !important; color: white !important; -webkit-print-color-adjust: exact; }
                }
                `}
            </style>

            {/* Top Bar */}
            <div className="sticky top-0 z-40 flex items-center justify-between bg-background-light/90 dark:bg-background-dark/90 p-4 border-b border-gray-200 dark:border-gray-800/60 backdrop-blur-md no-print">
                <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-base md:text-lg font-bold leading-tight flex-1 text-center pr-10 tracking-tight">Detalhes do Defeito</h2>
            </div>

            <main className="flex flex-col gap-6 p-4">
                {/* Hero Card */}
                <div className="relative overflow-hidden rounded-xl bg-white dark:bg-surface-dark shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row gap-0 sm:gap-4">
                        <div className="w-full sm:w-1/3 h-48 sm:h-auto bg-slate-200 dark:bg-slate-700 relative flex items-center justify-center">
                            <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-500">build_circle</span>
                            <div className="absolute bottom-3 left-3 sm:hidden">
                                <span className="inline-flex items-center rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/20">
                                    Sistema de Emissões
                                </span>
                            </div>
                        </div>
                        <div className="p-5 flex flex-col gap-3 flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                                Falha no Sensor de O2 (Banco 1)
                            </h1>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <div className="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 pl-3 pr-3 border border-red-200 dark:border-red-500/20">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[18px]">error</span>
                                    <p className="text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wide">Crítico</p>
                                </div>
                                <div className="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 pl-3 pr-3 border border-orange-200 dark:border-orange-500/20">
                                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-[18px]">priority_high</span>
                                    <p className="text-orange-700 dark:text-orange-400 text-xs font-bold uppercase tracking-wide">Alta Prioridade</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cost Estimator */}
                <section>
                    <div className="rounded-xl bg-primary overflow-hidden relative shadow-lg shadow-primary/25">
                        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
                        <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-black/10 blur-xl pointer-events-none"></div>
                        <div className="p-6 relative z-10 text-white">
                            <div className="flex items-center gap-2 mb-1 opacity-90">
                                <span className="material-symbols-outlined text-[20px]">payments</span>
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Estimativa de Custo</h3>
                            </div>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-3xl font-bold tracking-tight">R$ 450 - R$ 800</span>
                            </div>
                            <div className="relative w-full h-3 bg-black/20 rounded-full mb-2">
                                <div className="absolute top-0 bottom-0 left-[25%] right-[35%] bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
                                <div className="absolute top-1/2 -translate-y-1/2 left-[40%] h-5 w-1.5 bg-white rounded-full shadow-sm ring-2 ring-primary"></div>
                            </div>
                            <div className="flex justify-between text-xs font-medium text-white/70 px-1">
                                <span>R$ 100 (Min)</span>
                                <span>R$ 1.500+ (Max)</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About */}
                <section className="flex flex-col gap-3">
                    <h3 className="text-lg font-bold px-1 flex items-center gap-2">
                        Sobre o Problema
                        <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                    </h3>
                    <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed px-1">
                        O sensor de oxigênio (Sonda Lambda) mede a quantidade de oxigênio não queimado no escapamento. Uma falha neste componente no Banco 1 pode fazer com que o motor opere com mistura rica ou pobre, reduzindo significativamente a eficiência do combustível e aumentando as emissões poluentes. Se ignorado, pode danificar o conversor catalítico.
                    </p>
                </section>

                {/* Sources */}
                <section className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold px-1 flex items-center justify-between">
                        Fontes de Dados
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400 px-2 py-1 rounded-md">IA Verificada</span>
                    </h3>
                    <div className="flex flex-col gap-3">
                        <div className="group flex flex-col gap-3 rounded-lg bg-white dark:bg-surface-dark p-4 border border-gray-200 dark:border-gray-800 border-l-4 border-l-primary transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-gray-200 uppercase tracking-wide">Manual do Proprietário</span>
                                </div>
                                <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                            </div>
                            <div className="bg-background-light dark:bg-background-dark/50 p-3 rounded-md">
                                <p className="text-xs sm:text-sm italic text-slate-600 dark:text-gray-400 leading-normal font-medium">
                                    "O sistema de controle de emissões deve ser inspecionado a cada 50.000km. A luz de verificação do motor acesa indica a necessidade de diagnóstico imediato."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 z-50 no-print">
                <div className="flex gap-3 max-w-2xl mx-auto w-full">
                    <button 
                        onClick={handleDownloadPDF}
                        className="flex-1 flex items-center justify-center gap-2 h-12 px-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-slate-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">save_alt</span>
                        <span className="whitespace-nowrap">Baixar Relatório PDF</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DefectDetail;
