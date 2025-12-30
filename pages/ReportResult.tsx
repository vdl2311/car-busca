
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface ExpertTip {
    title: string;
    content: string;
    priority: 'Máxima' | 'Alta' | 'Média' | 'Baixa';
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
    
    const { brand, model, version, year, km, savedReportData } = location.state || { brand: 'Veículo', model: 'Demo', version: '', year: '2024', km: '' };
    const vehicleTitle = `${brand} ${model} ${version} ${year}`.trim();
    const hasKm = km && km.toString().trim() !== '' && km !== '0';
    
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const translateTerm = (term: string) => {
        if (!term) return '';
        const upper = term.toUpperCase().trim();
        const exactMap: Record<string, string> = {
            "ENGINE": "MOTOR", "BRAKES": "FREIOS", "SUSPENSION": "SUSPENSÃO", "TRANSMISSION": "CÂMBIO",
            "ELECTRICAL": "ELÉTRICA", "COOLING": "ARREFECIMENTO", "STEERING": "DIREÇÃO", "FUEL": "COMBUSTÍVEL"
        };
        if (exactMap[upper]) return exactMap[upper];
        let translated = term;
        const replacements: Record<string, string> = {
            "Engine": "Motor", "Brakes": "Freios", "Suspension": "Suspensão", "Transmission": "Câmbio",
            "Cooling": "Arrefecimento", "Steering": "Direção", "Electrical": "Elétrica"
        };
        Object.keys(replacements).forEach(eng => {
            translated = translated.replace(new RegExp(`\\b${eng}\\b`, 'gi'), replacements[eng]);
        });
        return translated.charAt(0).toUpperCase() + translated.slice(1);
    };

    const fetchReport = async () => {
        setLoading(true);
        setErrorMsg(null);
        if (savedReportData) { setReportData(savedReportData); setLoading(false); return; }

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error("API_KEY não configurada.");

            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Analise o veículo: ${brand} ${model} ${version} ano ${year}. ${hasKm ? `KM: ${km}.` : ''} 
            Foque nos problemas crônicos específicos desta versão e motorização. TRADUZA TUDO PARA PORTUGUÊS.`;

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
                    ownerReviews: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { userLabel: { type: Type.STRING }, quote: { type: Type.STRING }, sentiment: { type: Type.STRING } } } },
                    expertTips: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING }, priority: { type: Type.STRING } } } },
                    sources: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["score", "reliabilityTitle", "reliabilityDescription", "defects", "ownerReviews", "expertTips", "sources"]
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    systemInstruction: "Você é um Especialista Automotivo Sênior. Use Português do Brasil. Nas dicas de manutenção, atribua prioridade 'Máxima', 'Alta' ou 'Média'.",
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            });

            if (response.text) {
                setReportData(JSON.parse(response.text));
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Erro ao gerar relatório.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReport(); }, [brand, model, version, year, km, savedReportData]);

    const handleSave = async () => {
        if (!reportData || isSaving || !user) return;
        setIsSaving(true);
        try {
            await supabase.from('reports').insert({
                user_id: user.id, brand, model, version, year, km, score: reportData.score, report_data: reportData
            });
            alert("Relatório salvo no seu perfil!");
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const handleExportPDF = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex flex-col h-screen items-center justify-center p-6 bg-background-dark text-white">
            <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
            <p className="mt-6 text-xl font-bold">Gerando relatório técnico...</p>
        </div>
    );

    if (errorMsg || !reportData) return (
        <div className="flex flex-col h-screen items-center justify-center p-6 text-center bg-background-dark">
            <h2 className="text-2xl font-bold mb-4 text-white">Erro ao gerar relatório</h2>
            <p className="text-red-500 mb-6 text-lg">{errorMsg}</p>
            <button onClick={fetchReport} className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg">Tentar Novamente</button>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-background-dark text-white overflow-x-hidden">
            <style>
                {`
                @media print {
                    @page { margin: 1.5cm; }
                    /* Forçar reset de height para impressão */
                    html, body, #root, .flex-1, main { 
                        height: auto !important; 
                        overflow: visible !important; 
                        display: block !important;
                        position: static !important;
                    }
                    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; visibility: hidden !important; }
                    main { padding: 0 !important; width: 100% !important; max-width: none !important; margin: 0 !important; }
                    .bg-surface-dark { background: #fdfdfd !important; border: 1px solid #e2e8f0 !important; color: black !important; box-shadow: none !important; border-radius: 12px !important; }
                    .text-white { color: black !important; }
                    .text-slate-400, .text-slate-500, .text-slate-300 { color: #4a5568 !important; }
                    .border-gray-800, .border-white\/5 { border-color: #e2e8f0 !important; }
                    section { break-inside: avoid; margin-bottom: 2rem !important; }
                    .text-primary { color: #135bec !important; }
                    .bg-primary { background: #135bec !important; color: white !important; }
                }
                `}
            </style>

            <header className="sticky top-0 z-30 bg-background-dark/95 backdrop-blur-md border-b border-gray-800 p-5 md:px-10 no-print">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate(-1)} className="p-3 hover:bg-gray-800 rounded-full transition-colors text-white">
                            <span className="material-symbols-outlined text-[28px]">arrow_back</span>
                        </button>
                        <div className="hidden xs:block">
                            <h1 className="text-xl md:text-3xl font-bold text-white leading-tight truncate max-w-[200px] md:max-w-none">{vehicleTitle}</h1>
                            <p className="text-[10px] md:text-sm text-slate-400 mt-1 uppercase font-bold tracking-widest">
                                {hasKm ? `${km} KM` : 'Análise Geral'} • Consultoria IA
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <button 
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button onClick={handleSave} disabled={isSaving || !!savedReportData} className="px-4 sm:px-6 py-3 rounded-xl bg-primary text-white font-bold text-base disabled:opacity-50 transition-all shadow-lg shadow-primary/20 active:scale-95">
                            {isSaving ? '...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-10 max-w-2xl mx-auto w-full">
                <div className="flex flex-col gap-10">
                    
                    {/* Lateral Score and Info */}
                    <div className="bg-surface-dark rounded-[2.5rem] p-10 text-center shadow-2xl border border-white/5">
                        <span className="text-sm font-bold uppercase tracking-[0.2em] opacity-60">Nota Técnica</span>
                        <div className="flex items-center justify-center gap-1 my-4">
                            <span className={`text-8xl font-bold ${reportData.score >= 7 ? 'text-green-400' : reportData.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {reportData.score}
                            </span>
                            <span className="text-3xl opacity-40 font-bold mt-8">/10</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{reportData.reliabilityTitle}</h3>
                        <p className="text-base text-slate-400 leading-relaxed font-medium">{reportData.reliabilityDescription}</p>
                    </div>

                    {/* PREVENTIVE MAINTENANCE SECTION */}
                    <section className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3 px-2">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[28px] font-bold">verified_user</span>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Plano de Manutenção</h3>
                            </div>
                            <p className="text-base text-slate-500 font-medium">Orientações sugeridas por nossa inteligência técnica</p>
                        </div>
                        
                        <div className="flex flex-col gap-5">
                            {reportData.expertTips.map((tip, idx) => {
                                const isMaxPriority = tip.priority === 'Máxima';
                                const isHighPriority = tip.priority === 'Alta' || isMaxPriority;
                                
                                return (
                                    <div key={idx} className="bg-surface-dark rounded-[2rem] p-7 md:p-8 flex flex-col gap-6 shadow-xl border border-white/5">
                                        <div className="flex gap-5 items-start">
                                            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border-2 ${
                                                isMaxPriority 
                                                ? 'bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(19,91,236,0.1)]' 
                                                : isHighPriority
                                                ? 'bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                                : 'bg-slate-500/10 border-slate-500/40 text-slate-500'
                                            }`}>
                                                <span className="material-symbols-outlined text-[28px] font-bold">build</span>
                                            </div>
                                            
                                            <div className="flex flex-col gap-4 flex-1">
                                                <h4 className="text-2xl font-bold text-white leading-snug tracking-tight">
                                                    {tip.title}
                                                </h4>
                                                <p className="text-lg text-slate-400 leading-relaxed font-medium">
                                                    {tip.content}
                                                </p>
                                                
                                                <div className="mt-2">
                                                    <span className={`inline-flex px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.1em] shadow-lg ${
                                                        isMaxPriority
                                                        ? 'bg-primary text-white shadow-primary/30'
                                                        : isHighPriority
                                                        ? 'bg-red-600 text-white shadow-red-600/30'
                                                        : 'bg-slate-700 text-white'
                                                    }`}>
                                                        {tip.priority.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Problems Section */}
                    <section>
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-white mb-6 px-2">
                            <span className="material-symbols-outlined text-red-500 text-[32px]">dangerous</span>
                            Problemas Crônicos
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {reportData.defects.map((defect) => (
                                <div key={defect.id} className="bg-surface-dark border border-gray-800 rounded-3xl p-8 shadow-md hover:shadow-xl transition-all">
                                    <h4 className="text-xl font-bold mb-3 text-white uppercase tracking-tight">
                                        {translateTerm(defect.title)}
                                    </h4>
                                    <p className="text-lg text-slate-300 leading-relaxed font-medium">{defect.description}</p>
                                    <div className="mt-6 pt-5 border-t border-white/5">
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-4 py-1.5 rounded-lg border border-red-500/20">Frequência: {defect.frequency}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ReportResult;
