import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface ExpertTip {
    title: string;
    content: string;
    priority: 'Alta' | 'Média' | 'Baixa';
}

interface OwnerReview {
    userLabel: string;
    quote: string;
    sentiment: 'negative' | 'neutral' | 'positive';
}

interface DefectItem {
    id: string;
    title: string;
    description: string;
    severity: 'Alta' | 'Média' | 'Baixa';
    frequency: 'Muito Comum' | 'Ocasional' | 'Raro';
    icon: string;
}

interface ReportData {
    score: number;
    reliabilityTitle: string;
    reliabilityDescription: string;
    defects: DefectItem[];
    ownerReviews: OwnerReview[];
    expertTips: ExpertTip[];
    sources: string[];
}

const ReportResult: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const { brand, model, year, km, savedReportData } = location.state || { brand: 'Veículo', model: 'Demo', year: '2024', km: '' };
    const vehicleTitle = `${brand} ${model} ${year}`;
    const hasKm = km && km.toString().trim() !== '' && km !== '0';
    
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            if (savedReportData) {
                setReportData(savedReportData);
                setLoading(false);
                return;
            }

            try {
                const apiKey = process.env.API_KEY;
                if (!apiKey) throw new Error("API Key not found");

                const ai = new GoogleGenAI({ apiKey });
                const prompt = `Gere um relatório técnico detalhado em PORTUGUÊS DO BRASIL sobre o veículo: ${brand} ${model} ano ${year}. ${hasKm ? `Quilometragem: ${km} km.` : ''} Liste 3-5 defeitos crônicos, avaliações de donos e dicas de especialistas.`;

                const responseSchema: Schema = {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        reliabilityTitle: { type: Type.STRING },
                        reliabilityDescription: { type: Type.STRING },
                        defects: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    severity: { type: Type.STRING },
                                    frequency: { type: Type.STRING },
                                    icon: { type: Type.STRING }
                                },
                                required: ["id", "title", "description", "severity", "frequency", "icon"]
                            }
                        },
                        ownerReviews: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    userLabel: { type: Type.STRING },
                                    quote: { type: Type.STRING },
                                    sentiment: { type: Type.STRING }
                                },
                                required: ["userLabel", "quote", "sentiment"]
                            }
                        },
                        expertTips: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    content: { type: Type.STRING },
                                    priority: { type: Type.STRING }
                                },
                                required: ["title", "content", "priority"]
                            }
                        },
                        sources: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["score", "reliabilityTitle", "reliabilityDescription", "defects", "ownerReviews", "expertTips", "sources"]
                };

                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: {
                        systemInstruction: "Especialista automotivo. Responda apenas JSON.",
                        responseMimeType: "application/json",
                        responseSchema: responseSchema
                    }
                });

                if (response.text) {
                    setReportData(JSON.parse(response.text));
                }
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [brand, model, year, km, savedReportData]);

    const handlePrint = () => window.print();

    const handleSave = async () => {
        if (!reportData || isSaving || !user) return;
        setIsSaving(true);
        try {
            await supabase.from('reports').insert({
                user_id: user.id, brand, model, year, km, score: reportData.score, report_data: reportData
            });
            alert("Salvo com sucesso!");
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        const s = severity?.toLowerCase() || '';
        if (s.includes('alta')) return 'bg-red-500/10 text-red-600 border-red-200';
        if (s.includes('média') || s.includes('media')) return 'bg-orange-500/10 text-orange-600 border-orange-200';
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
    };

    if (loading) return (
        <div className="flex flex-col h-screen items-center justify-center p-6 bg-background-light dark:bg-background-dark">
            <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
            <p className="mt-4 font-bold">Gerando análise técnica...</p>
        </div>
    );

    if (error || !reportData) return <div className="p-10 text-center">Erro ao gerar relatório.</div>;

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark print:bg-white">
            {/* Header Area - Compact */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 md:px-8 print:hidden">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none">{vehicleTitle}</h1>
                            <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">
                                {hasKm ? `${km} KM Rodados` : 'Análise Geral'} • Consultoria IA
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={handlePrint} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-surface-dark font-bold text-sm">
                            <span className="material-symbols-outlined text-[20px]">print</span>
                            PDF
                        </button>
                        <button onClick={handleSave} disabled={isSaving || !!savedReportData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50">
                            <span className="material-symbols-outlined text-[20px]">save</span>
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Dashboard */}
            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full print:p-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
                    
                    {/* Column 1: Score & Summary (3/12) */}
                    <aside className="lg:col-span-4 flex flex-col gap-6 print:mb-8">
                        {/* Score Card - More dense */}
                        <div className="bg-slate-900 dark:bg-surface-dark rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-6xl">verified</span>
                            </div>
                            <div className="relative z-10 text-center">
                                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Confiabilidade</span>
                                <div className="flex items-center justify-center gap-1 my-2">
                                    <span className={`text-7xl font-black tracking-tighter ${reportData.score >= 7 ? 'text-green-400' : reportData.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {reportData.score}
                                    </span>
                                    <span className="text-2xl opacity-40 font-bold mt-6">/10</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{reportData.reliabilityTitle}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed px-4">{reportData.reliabilityDescription}</p>
                            </div>
                        </div>

                        {/* Owner Reviews - Grid on desktop instead of scroll */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 px-2">
                                <span className="material-symbols-outlined text-primary">forum</span>
                                Feedback de Donos
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {reportData.ownerReviews.slice(0, 3).map((review, i) => (
                                    <div key={i} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold uppercase">
                                                {review.userLabel.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-slate-500">{review.userLabel}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-snug">"{review.quote}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Column 2: Defects & Tips (8/12) */}
                    <div className="lg:col-span-8 flex flex-col gap-8 print:block">
                        
                        {/* Section: Chronic Defects */}
                        <section>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">dangerous</span>
                                    Problemas Crônicos
                                </h3>
                                <span className="text-xs font-bold text-slate-400 uppercase">3-5 Ocorrências Comuns</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reportData.defects.map((defect) => (
                                    <div key={defect.id} className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-5 hover:border-primary/50 transition-colors group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-slate-700 dark:text-white group-hover:bg-primary group-hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-[28px]">{defect.icon}</span>
                                            </div>
                                            <div className={`px-2 py-1 rounded-lg border text-[10px] font-black uppercase ${getSeverityColor(defect.severity)}`}>
                                                Risco {defect.severity}
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold mb-1">{defect.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">{defect.description}</p>
                                        <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Frequência:</span>
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{defect.frequency}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section: Expert Tips - More Compact Grid */}
                        <section className="bg-white dark:bg-surface-dark rounded-[2.5rem] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="bg-slate-50 dark:bg-gray-800/50 p-6 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">verified_user</span>
                                    Plano de Manutenção Preventiva
                                </h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reportData.expertTips.map((tip, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className={`mt-1 size-8 shrink-0 rounded-full flex items-center justify-center border-2 ${tip.priority === 'Alta' ? 'border-red-500 text-red-500' : 'border-primary text-primary'}`}>
                                            <span className="material-symbols-outlined text-[18px]">build</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm mb-1">{tip.title}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">{tip.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-gray-800/30 text-center border-t border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    Fontes: {reportData.sources.join(' • ')}
                                </p>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            {/* Print Footer */}
            <footer className="hidden print:block p-8 border-t mt-10 text-center text-xs text-gray-400">
                Este relatório foi gerado automaticamente pela AutoIntel AI e possui caráter meramente informativo.
            </footer>
        </div>
    );
};

export default ReportResult;