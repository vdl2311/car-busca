
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute, ReportData } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const ReportResult: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const reportRef = useRef<HTMLDivElement>(null);
    
    const { 
        brand, model, year, km, 
        plate, engine, symptoms,
        savedReportData 
    } = location.state || {};

    const [reportData, setReportData] = useState<ReportData | null>(savedReportData || null);
    const [loading, setLoading] = useState(!savedReportData);
    const [isSaving, setIsSaving] = useState(false);
    const [isSynced, setIsSynced] = useState(!!savedReportData);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (!brand && !savedReportData) {
            navigate(AppRoute.HOME);
            return;
        }

        if (savedReportData) {
            setLoading(false);
            return;
        }

        const fetchAndSaveReport = async () => {
            setLoading(true);
            setSaveError(null);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                const prompt = `Gere um laudo técnico completo para um ${brand} ${model} ${year} (${engine}) com ${km} KM. Sintomas relatados: ${symptoms || 'Nenhum sintoma específico'}.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: {
                        systemInstruction: `Você é um Mecânico Master veterano. Analise os dados e retorne APENAS o JSON estruturado para visualização em uma oficina.`,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.NUMBER },
                                technicalSpecs: {
                                    type: Type.OBJECT,
                                    properties: {
                                        oilType: { type: Type.STRING },
                                        oilCapacity: { type: Type.STRING },
                                        coolantType: { type: Type.STRING },
                                        tire_pressure: { type: Type.STRING },
                                        wheelTorque: { type: Type.STRING }
                                    }
                                },
                                verdict: { 
                                    type: Type.OBJECT, 
                                    properties: { status: { type: Type.STRING }, summary: { type: Type.STRING }, technicalWarning: { type: Type.STRING } }
                                },
                                defects: { 
                                    type: Type.ARRAY, 
                                    items: { 
                                        type: Type.OBJECT, 
                                        properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, severity: { type: Type.STRING }, repairProcedure: { type: Type.STRING } } 
                                    } 
                                },
                                maintenanceRoadmap: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: { km: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } }, estimatedLaborTime: { type: Type.STRING } }
                                    }
                                }
                            }
                        }
                    }
                });
                
                if (response.text) {
                    const parsedData = JSON.parse(response.text);
                    setReportData(parsedData);
                    
                    if (user?.id) {
                        setIsSaving(true);
                        const { error: supabaseError } = await supabase.from('reports').insert([{
                            user_id: user.id,
                            brand,
                            model,
                            year,
                            km,
                            score: parsedData.score || 0,
                            report_data: parsedData
                        }]);
                        
                        if (supabaseError) {
                            console.error("Erro Supabase Insert:", supabaseError);
                            if (supabaseError.message.includes("cache") || supabaseError.message.includes("not found")) {
                                setSaveError("Erro de Banco: Tabela 'reports' não existe. Execute o SQL no README.");
                            } else {
                                setSaveError(`Falha na Nuvem: ${supabaseError.message}`);
                            }
                        } else {
                            setIsSynced(true);
                        }
                        setIsSaving(false);
                    }
                }
            } catch (e: any) { 
                console.error("Erro Geral ReportResult:", e); 
                setSaveError("Erro ao processar inteligência do laudo.");
            } finally { 
                setLoading(false); 
            }
        };
        fetchAndSaveReport();
    }, [brand, model, year, km, engine, symptoms, user, savedReportData, navigate]);

    if (loading) return (
        <div className="flex flex-col h-screen items-center justify-center bg-background-dark text-white p-12 text-center">
            <div className="relative size-48 mb-12">
                <div className="absolute inset-0 border-[10px] border-orange-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-[10px] border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-orange-500 animate-pulse">engineering</span>
                </div>
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-orange-500 animate-pulse">Sincronizando Diagnóstico</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4">Consultando base de dados AutoIntel...</p>
        </div>
    );

    if (!reportData) return (
        <div className="flex flex-col h-screen items-center justify-center bg-background-dark p-12 text-center">
            <span className="material-symbols-outlined text-red-500 text-6xl mb-6">error_outline</span>
            <h2 className="text-2xl font-black uppercase text-white mb-4">Falha ao Gerar Laudo</h2>
            <p className="text-slate-500 font-bold mb-8 uppercase text-xs">Não foi possível processar as informações técnicas deste veículo.</p>
            <button onClick={() => navigate(-1)} className="px-12 py-4 bg-white/5 rounded-2xl font-black uppercase tracking-widest text-xs text-white border border-white/10">Voltar para Início</button>
        </div>
    );

    return (
        <div className="flex flex-col min-h-full bg-background-dark text-white pb-40 safe-top">
            <header className="sticky top-0 z-50 glass px-6 md:px-16 py-6 border-b border-white/5 flex items-center justify-between backdrop-blur-3xl no-print">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10">
                        <span className="material-symbols-outlined font-black">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter leading-none">{brand} {model}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{year} • {km} KM</p>
                            {isSynced ? (
                                <span className="flex items-center gap-1 text-[9px] font-black text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                                    <span className="material-symbols-outlined text-[12px]">cloud_done</span> Salvo no Histórico
                                </span>
                            ) : saveError ? (
                                <span className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                                    <span className="material-symbols-outlined text-[12px]">cloud_off</span> {saveError}
                                </span>
                            ) : isSaving ? (
                                <span className="text-[9px] font-black text-slate-500 uppercase animate-pulse">Salvando...</span>
                            ) : null}
                        </div>
                    </div>
                </div>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-4 bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/20 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                    <span className="hidden md:inline">Relatório PDF</span>
                </button>
            </header>

            <main ref={reportRef} className="p-6 md:p-12 max-w-[1400px] mx-auto w-full space-y-12">
                <section className="bg-surface-dark p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20 text-[10px] font-black uppercase tracking-widest">
                            Análise Especialista Master
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-tight">
                            {reportData.verdict.status}
                        </h2>
                        <p className="text-xl text-slate-400 font-bold leading-relaxed">{reportData.verdict.summary}</p>
                    </div>
                </section>

                <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: 'Óleo Motor', val: reportData.technicalSpecs.oilType, icon: 'oil_barrel' },
                        { label: 'Capacidade', val: reportData.technicalSpecs.oilCapacity, icon: 'format_color_fill' },
                        { label: 'Radiador', val: reportData.technicalSpecs.coolantType, icon: 'ac_unit' },
                        { label: 'Torque Roda', val: reportData.technicalSpecs.wheelTorque, icon: 'dynamic_form' },
                        { label: 'Pressão Pneu', val: reportData.technicalSpecs.tire_pressure || 'Consulte Manual', icon: 'tire_repair' }
                    ].map((st, i) => (
                        <div key={i} className="bg-surface-dark/50 p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-2 group hover:border-orange-500/30 transition-all">
                            <span className="material-symbols-outlined text-2xl text-orange-500">{st.icon}</span>
                            <div className="text-sm font-black text-white">{st.val}</div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{st.label}</p>
                        </div>
                    ))}
                </section>
                
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                            <span className="material-symbols-outlined text-orange-500">warning</span> Pontos Críticos
                        </h3>
                        {reportData.defects.map((d, i) => (
                            <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:bg-white/[0.08] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-lg font-black uppercase text-white">{d.title}</h4>
                                    <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-[9px] font-black uppercase">{d.severity}</span>
                                </div>
                                <p className="text-slate-400 text-sm font-bold leading-relaxed">{d.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                            <span className="material-symbols-outlined text-orange-500">calendar_month</span> Manutenção Preventiva
                        </h3>
                        {reportData.maintenanceRoadmap.map((m, i) => (
                            <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/5 border-l-4 border-l-orange-500">
                                <h4 className="text-lg font-black text-white italic mb-4">Plano {m.km}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {m.items.map((item, j) => (
                                        <span key={j} className="px-3 py-1.5 bg-background-dark rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5">{item}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ReportResult;
