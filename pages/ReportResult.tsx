
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface DefectItem { id: string; title: string; description: string; severity: string; }
interface Alternative { model: string; reason: string; }
interface Verdict { status: string; summary: string; }
interface UserComment { name: string; role: string; text: string; source: string; }
interface ReportData { 
    score: number; 
    verdict: Verdict; 
    defects: DefectItem[]; 
    alternatives: Alternative[]; 
    comments: UserComment[]; 
}

const ReportResult: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { brand, model, version, year, km, savedReportData } = location.state || {};
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const fetchReport = async () => {
        if (savedReportData) { 
            setReportData(savedReportData); 
            setLoading(false); 
            setIsSaved(true);
            return; 
        }

        if (!brand || !model) {
            setError("Dados do veículo não encontrados. Por favor, reinicie a busca.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                throw new Error("Chave de API não configurada no ambiente.");
            }

            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Gere um laudo técnico para o veículo: ${brand} ${model} ${version} ${year}. Quilometragem: ${km}. 
            Retorne um JSON com:
            1. Score (0-10)
            2. Veredito (status e sumário)
            3. 3 Defeitos crônicos reais
            4. 2 Alternativas de compra
            5. 3 Comentários curtos e relevantes (1 de mecânico especialista e 2 de proprietários reais). 
            IMPORTANTE: Para cada comentário, especifique a FONTE/ORIGEM da informação (ex: Fórum CarrosBR, Oficina Autorizada, Portal AutoEsporte, etc).`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    systemInstruction: "Você é o Engenheiro Chefe da AutoIntel AI. Forneça diagnósticos técnicos de alta fidelidade em JSON. Use espaçamento de palavras natural (tracking-normal).",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            verdict: { type: Type.OBJECT, properties: { status: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ["status", "summary"] },
                            defects: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING }, severity: { type: Type.STRING } } } },
                            alternatives: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { model: { type: Type.STRING }, reason: { type: Type.STRING } } } },
                            comments: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        name: { type: Type.STRING }, 
                                        role: { type: Type.STRING }, 
                                        text: { type: Type.STRING },
                                        source: { type: Type.STRING, description: "A fonte/procedência do depoimento (ex: Fórum, Oficina, Portal)" }
                                    },
                                    required: ["name", "role", "text", "source"]
                                } 
                            }
                        },
                        required: ["score", "verdict", "defects", "alternatives", "comments"]
                    }
                }
            });
            
            if (response.text) {
                const data = JSON.parse(response.text);
                setReportData(data);
            } else {
                throw new Error("A IA não retornou dados válidos.");
            }
        } catch (e: any) { 
            console.error("Erro ao gerar laudo:", e);
            setError("Ocorreu um erro ao gerar o laudo técnico. Verifique sua conexão ou a configuração da API_KEY no Vercel.");
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchReport(); }, [brand, model, version, year, km]);

    const handleSaveReport = async () => {
        if (!user || !reportData || isSaved) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('reports').insert({
                user_id: user.id,
                brand,
                model,
                year,
                km,
                score: reportData.score,
                report_data: reportData
            });
            if (!error) {
                setIsSaved(true);
                alert('Relatório salvo com sucesso!');
            } else {
                throw error;
            }
        } catch (e) {
            console.error(e);
            alert('Falha ao salvar relatório.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col h-screen items-center justify-center bg-background-dark text-white p-10">
            <div className="size-24 border-8 border-primary border-t-transparent rounded-full animate-spin mb-10"></div>
            <h2 className="text-3xl font-black uppercase tracking-normal italic text-center">Analisando Componentes...</h2>
        </div>
    );

    if (error) return (
        <div className="flex flex-col h-screen items-center justify-center bg-background-dark text-white p-10 text-center">
            <span className="material-symbols-outlined text-accent-red text-7xl mb-6">error</span>
            <h2 className="text-2xl font-black uppercase mb-4 max-w-md">{error}</h2>
            <button onClick={() => navigate(AppRoute.HOME)} className="bg-primary px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                Voltar ao Início
            </button>
        </div>
    );

    if (!reportData) return null;

    return (
        <div className="flex flex-col min-h-full bg-background-dark text-white pb-10">
            <header className="sticky top-0 z-50 glass px-6 md:px-12 py-6 border-b border-white/10 flex items-center justify-between backdrop-blur-2xl">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                        <span className="material-symbols-outlined text-3xl font-bold">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black uppercase tracking-normal leading-none italic">
                            {brand} {model}
                        </h1>
                        <p className="text-[10px] md:text-sm text-primary font-black uppercase tracking-[0.4em] mt-2">ID_LAUDO: #{(Math.random()*9999).toFixed(0)}</p>
                    </div>
                </div>
                {!isSaved && (
                    <button 
                        onClick={handleSaveReport}
                        disabled={isSaving}
                        className="flex items-center gap-3 bg-primary px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-xl">{isSaving ? 'sync' : 'save'}</span>
                        <span className="hidden md:inline">{isSaving ? 'Salvando...' : 'Salvar Relatório'}</span>
                    </button>
                )}
            </header>

            <main className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-16 md:space-y-24">
                
                <section className="bg-surface-dark/50 rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-20 border border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-12 md:gap-20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150"></div>
                            <div className="relative text-center flex flex-col items-center">
                                <span className={`text-[110px] md:text-[200px] leading-none font-black tracking-normal italic drop-shadow-[0_20px_50px_rgba(19,91,236,0.4)] ${reportData.score >= 7 ? 'text-accent-green' : reportData.score >= 5 ? 'text-accent-yellow' : 'text-accent-red'}`}>
                                    {reportData.score}
                                </span>
                                <div className="text-lg md:text-3xl font-black opacity-30 uppercase tracking-[0.6em] mt-20">SCORE FINAL</div>
                            </div>
                        </div>

                        <div className={`flex-1 p-8 md:p-14 rounded-[2rem] md:rounded-[3rem] border-2 shadow-2xl ${reportData.score >= 7 ? 'border-accent-green/30 bg-accent-green/5' : 'border-accent-red/30 bg-accent-red/5'}`}>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-normal mb-6 italic">{reportData.verdict.status}</h2>
                            <p className="text-xl md:text-3xl font-bold text-slate-300 leading-snug">{reportData.verdict.summary}</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-10">
                    <div className="flex items-center gap-6 px-4">
                        <span className="material-symbols-outlined text-accent-red text-5xl md:text-6xl">warning</span>
                        <h3 className="text-2xl md:text-5xl font-black tracking-normal uppercase italic">Análise de Falhas Crônicas</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8">
                        {reportData.defects.map((defect, i) => (
                            <div key={i} className="bg-surface-dark p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 hover:border-primary/40 transition-all group relative overflow-hidden shadow-xl">
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className="size-14 md:size-20 rounded-2xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red">
                                            <span className="material-symbols-outlined text-3xl md:text-5xl font-black">construction</span>
                                        </div>
                                        <h4 className="text-2xl md:text-4xl font-black uppercase tracking-normal">{defect.title}</h4>
                                    </div>
                                    <p className="text-lg md:text-2xl text-slate-400 font-bold leading-relaxed max-w-5xl">{defect.description}</p>
                                    <div className="inline-flex px-6 py-2 rounded-lg bg-accent-red/20 text-accent-red text-xs md:text-lg font-black uppercase tracking-widest italic">NÍVEL DE GRAVIDADE: {defect.severity}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-10">
                    <div className="flex items-center gap-6 px-4">
                        <span className="material-symbols-outlined text-accent-yellow text-5xl md:text-6xl">groups</span>
                        <h3 className="text-2xl md:text-5xl font-black tracking-normal uppercase italic">Voz da Comunidade & Especialistas</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {reportData.comments.map((comment, i) => (
                            <div key={i} className="bg-surface-dark/30 p-8 rounded-[2rem] border border-white/5 flex flex-col gap-4 shadow-lg hover:bg-surface-dark/50 transition-all relative overflow-hidden group">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">{comment.name}</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${comment.role.toLowerCase().includes('mecânico') ? 'bg-primary/20 text-primary' : 'bg-white/10 text-slate-400'}`}>
                                        {comment.role}
                                    </span>
                                </div>
                                <p className="text-sm md:text-lg text-slate-300 font-bold italic leading-relaxed">"{comment.text}"</p>
                                
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs text-slate-500">source</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Procedência: {comment.source}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-primary/5 border border-primary/20 rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-20 space-y-12">
                    <div className="flex items-center gap-6">
                        <span className="material-symbols-outlined text-primary text-5xl md:text-6xl font-black">recommend</span>
                        <h3 className="text-2xl md:text-5xl font-black tracking-normal uppercase italic">Recomendações Elite</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {reportData.alternatives.map((alt, i) => (
                            <div key={i} className="bg-background-dark/80 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 hover:border-primary transition-all">
                                <h4 className="text-2xl md:text-4xl font-black uppercase tracking-normal mb-6 italic text-primary">{alt.model}</h4>
                                <p className="text-base md:text-xl text-slate-400 font-bold leading-relaxed">{alt.reason}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {!isSaved && (
                    <div className="flex justify-center pt-4">
                        <button 
                            onClick={handleSaveReport}
                            disabled={isSaving}
                            className="w-full md:w-auto bg-primary px-10 py-5 rounded-xl font-black uppercase tracking-widest text-sm md:text-base hover:bg-blue-600 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95"
                        >
                            <span className="material-symbols-outlined text-2xl">{isSaving ? 'sync' : 'cloud_upload'}</span>
                            {isSaving ? 'Processando...' : 'Salvar no meu Histórico'}
                        </button>
                    </div>
                )}

                <footer className="text-center py-6 opacity-20 border-t border-white/5">
                    <p className="text-[10px] md:text-lg font-black uppercase tracking-[0.6em]">AUTOREPORT ENGINE v9.0 PRO</p>
                </footer>
            </main>
        </div>
    );
};

export default ReportResult;
