
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface FipeItem {
    codigo: string | number;
    nome: string;
}

const FIPE_API_BASE = 'https://parallelum.com.br/fipe/api/v1/carros';

const VehicleInput: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [view, setView] = useState<'dashboard' | 'checkin'>('dashboard');
    
    // FIPE States
    const [brands, setBrands] = useState<FipeItem[]>([]);
    const [models, setModels] = useState<FipeItem[]>([]);
    const [years, setYears] = useState<FipeItem[]>([]);
    const [brandQuery, setBrandQuery] = useState('');
    const [modelQuery, setModelQuery] = useState('');
    const [yearQuery, setYearQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<FipeItem | null>(null);
    const [selectedModel, setSelectedModel] = useState<FipeItem | null>(null);
    const [selectedYear, setSelectedYear] = useState<FipeItem | null>(null);
    const [showBrands, setShowBrands] = useState(false);
    const [showModels, setShowModels] = useState(false);
    const [showYears, setShowYears] = useState(false);

    // Form Fields
    const [plate, setPlate] = useState('');
    const [engine, setEngine] = useState('');
    const [mileage, setMileage] = useState('');
    const [symptoms, setSymptoms] = useState('');

    const [isSearching, setIsSearching] = useState(false);

    const brandRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await fetch(`${FIPE_API_BASE}/marcas`);
                const data = await res.json();
                setBrands(data);
            } catch (err) { console.error(err); } 
        };
        fetchBrands();

        const handleClickOutside = (event: MouseEvent) => {
            if (brandRef.current && !brandRef.current.contains(event.target as Node)) setShowBrands(false);
            if (modelRef.current && !modelRef.current.contains(event.target as Node)) setShowModels(false);
            if (yearRef.current && !yearRef.current.contains(event.target as Node)) setShowYears(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!selectedBrand) { setModels([]); return; }
        const fetchModels = async () => {
            try {
                const res = await fetch(`${FIPE_API_BASE}/marcas/${selectedBrand.codigo}/modelos`);
                const data = await res.json();
                setModels(data.modelos || []);
            } catch (e) { console.error(e); }
        };
        fetchModels();
    }, [selectedBrand]);

    useEffect(() => {
        if (!selectedModel || !selectedBrand) { setYears([]); return; }
        const fetchYears = async () => {
            try {
                const res = await fetch(`${FIPE_API_BASE}/marcas/${selectedBrand.codigo}/modelos/${selectedModel.codigo}/anos`);
                const data = await res.json();
                setYears(data || []);
            } catch (e) { console.error(e); }
        };
        fetchYears();
    }, [selectedModel, selectedBrand]);

    const filterItems = (items: FipeItem[], query: string) => {
        if (!query) return items;
        return items.filter(item => item.nome.toLowerCase().includes(query.toLowerCase()));
    };

    const handleSearch = async () => {
        const brand = selectedBrand ? selectedBrand.nome : brandQuery;
        const model = selectedModel ? selectedModel.nome : modelQuery;
        const year = selectedYear ? selectedYear.nome : yearQuery;

        if (!brand || !model || !year) return;
        
        setIsSearching(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsSearching(false);
        
        navigate(AppRoute.REPORT_RESULT, { 
            state: { brand, model, year, km: mileage, plate, engine, symptoms } 
        });
    };

    if (view === 'dashboard') {
        return (
            <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark p-6 md:p-12 max-w-7xl mx-auto page-transition safe-top space-y-12">
                <header>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-orange-500 font-bold">verified</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">AutoIntel Specialist v4.5</p>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
                        Painel <span className="text-orange-500">Master</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* CARD: CHECK-IN */}
                    <button 
                        onClick={() => setView('checkin')}
                        className="group relative bg-surface-light dark:bg-surface-dark/40 border-2 border-slate-200 dark:border-white/5 p-10 md:p-16 rounded-[3.5rem] text-left hover:border-orange-500/50 hover:bg-orange-600/5 transition-all shadow-xl dark:shadow-2xl"
                    >
                        <div className="size-24 rounded-3xl bg-orange-600 flex items-center justify-center text-white mb-10 group-hover:scale-110 transition-transform shadow-xl shadow-orange-600/20">
                            <span className="material-symbols-outlined text-5xl font-black">assignment</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">Novo Check-in</h2>
                        <p className="text-slate-500 font-bold text-lg leading-relaxed mb-8">Consulte torques, capacidades de óleo, manuais e gere o diagnóstico especialista para o carro na rampa.</p>
                        <div className="flex items-center gap-3 text-orange-500 font-black uppercase tracking-widest text-sm">
                            Iniciar Agora <span className="material-symbols-outlined font-black">arrow_forward</span>
                        </div>
                    </button>

                    {/* CARD: MECÂNICO VIRTUAL */}
                    <button 
                        onClick={() => navigate(AppRoute.REPORT_ISSUE)}
                        className="group relative bg-surface-light dark:bg-surface-dark/40 border-2 border-slate-200 dark:border-white/5 p-10 md:p-16 rounded-[3.5rem] text-left hover:border-primary/50 hover:bg-primary/5 transition-all shadow-xl dark:shadow-2xl"
                    >
                        <div className="size-24 rounded-3xl bg-primary flex items-center justify-center text-white mb-10 group-hover:scale-110 transition-transform shadow-xl shadow-primary/20">
                            <span className="material-symbols-outlined text-5xl font-black">smart_toy</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">Mecânico Virtual</h2>
                        <p className="text-slate-500 font-bold text-lg leading-relaxed mb-8">Tire dúvidas de bancada, analise fotos de peças ou peça ajuda para resolver aquele "BO" cabeludo.</p>
                        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-sm">
                            Falar com a IA <span className="material-symbols-outlined font-black">arrow_forward</span>
                        </div>
                    </button>
                </div>

                {/* HISTÓRICO RÁPIDO */}
                <section className="bg-slate-200/30 dark:bg-white/[0.03] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <span className="material-symbols-outlined text-7xl mb-6 text-slate-400">history</span>
                    <h3 className="text-xl font-black uppercase italic tracking-widest text-slate-900 dark:text-white">Acesso Rápido</h3>
                    <p className="text-sm font-bold uppercase tracking-widest mt-2 text-slate-500">Nenhum laudo recente para exibir</p>
                </section>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark p-6 md:p-12 max-w-7xl mx-auto page-transition safe-top">
            <header className="mb-12 flex items-center gap-8">
                <button onClick={() => setView('dashboard')} className="size-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-3xl">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
                        Check-in <span className="text-orange-500">Técnico</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Dados do Veículo para Análise Especialista</p>
                </div>
            </header>

            <div className="space-y-8">
                {/* IDENTIFICAÇÃO */}
                <section className="bg-surface-light dark:bg-surface-dark/40 border border-slate-200 dark:border-white/5 rounded-4xl p-8 md:p-10 space-y-8 relative z-30 shadow-sm dark:shadow-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3 relative" ref={brandRef}>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Marca</label>
                            <input 
                                type="text"
                                value={brandQuery}
                                onFocus={() => setShowBrands(true)}
                                onChange={(e) => { setBrandQuery(e.target.value.toUpperCase()); setSelectedBrand(null); }}
                                placeholder="EX: VOLKSWAGEN"
                                className="w-full h-20 bg-slate-50 dark:bg-background-dark border-2 border-slate-200 dark:border-white/5 rounded-3xl px-6 text-xl font-black text-slate-900 dark:text-white focus:border-orange-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800"
                            />
                            {showBrands && (
                                <div className="absolute top-full left-0 right-0 mt-3 max-h-72 overflow-y-auto bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-3xl z-[100] glass shadow-3xl">
                                    {filterItems(brands, brandQuery).map(b => (
                                        <div key={b.codigo} onClick={() => { setSelectedBrand(b); setBrandQuery(b.nome.toUpperCase()); setShowBrands(false); }} className="px-8 py-5 hover:bg-orange-600 hover:text-white cursor-pointer font-black text-sm uppercase tracking-wide border-b border-slate-100 dark:border-white/5 last:border-0 text-slate-900 dark:text-white">
                                            {b.nome}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 relative" ref={modelRef}>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Modelo</label>
                            <input 
                                type="text"
                                value={modelQuery}
                                onFocus={() => setShowModels(true)}
                                disabled={!brandQuery && !selectedBrand}
                                onChange={(e) => { setModelQuery(e.target.value.toUpperCase()); setSelectedModel(null); }}
                                placeholder="EX: GOLF GTI"
                                className="w-full h-20 bg-slate-50 dark:bg-background-dark border-2 border-slate-200 dark:border-white/5 rounded-3xl px-6 text-xl font-black text-slate-900 dark:text-white focus:border-orange-500 transition-all disabled:opacity-20 placeholder:text-slate-300 dark:placeholder:text-slate-800"
                            />
                            {showModels && models.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-3 max-h-72 overflow-y-auto bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-3xl z-[100] glass shadow-3xl">
                                    {filterItems(models, modelQuery).map(m => (
                                        <div key={m.codigo} onClick={() => { setSelectedModel(m); setModelQuery(m.nome.toUpperCase()); setShowModels(false); }} className="px-8 py-5 hover:bg-orange-600 hover:text-white cursor-pointer font-black text-sm uppercase tracking-wide border-b border-slate-100 dark:border-white/5 last:border-0 text-slate-900 dark:text-white">
                                            {m.nome}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3 relative" ref={yearRef}>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Ano Modelo</label>
                            <input 
                                type="text"
                                value={yearQuery}
                                onFocus={() => setShowYears(true)}
                                disabled={!modelQuery && !selectedModel}
                                onChange={(e) => setYearQuery(e.target.value.toUpperCase())}
                                placeholder="2020"
                                className="w-full h-20 bg-slate-50 dark:bg-background-dark border-2 border-slate-200 dark:border-white/5 rounded-3xl px-6 text-xl font-black text-slate-900 dark:text-white focus:border-orange-500 transition-all disabled:opacity-20 placeholder:text-slate-300 dark:placeholder:text-slate-800"
                            />
                            {showYears && years.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-3 max-h-72 overflow-y-auto bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-3xl z-[100] glass shadow-3xl">
                                    {filterItems(years, yearQuery).map(y => (
                                        <div key={y.codigo} onClick={() => { setSelectedYear(y); setYearQuery(y.nome.toUpperCase()); setShowYears(false); }} className="px-8 py-5 hover:bg-orange-600 hover:text-white cursor-pointer font-black text-sm uppercase tracking-wide text-slate-900 dark:text-white">
                                            {y.nome}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Motorização</label>
                            <input type="text" value={engine} onChange={(e) => setEngine(e.target.value)} placeholder="1.0 TSI / 2.0 8V" className="w-full h-20 bg-slate-50 dark:bg-background-dark border-2 border-slate-200 dark:border-white/5 rounded-3xl px-6 text-xl font-black text-slate-900 dark:text-white focus:border-orange-500 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-800" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">KM Atual</label>
                            <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="85000" className="w-full h-20 bg-slate-50 dark:bg-background-dark border-2 border-slate-200 dark:border-white/5 rounded-3xl px-6 text-xl font-black text-slate-900 dark:text-white focus:border-orange-500 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-800" />
                        </div>
                    </div>
                </section>

                <section className="bg-surface-light dark:bg-surface-dark/40 border border-slate-200 dark:border-white/5 rounded-4xl p-8 md:p-10 relative z-10 shadow-sm dark:shadow-none">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">O que o carro está apresentando? (Sintomas)</label>
                        <textarea 
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="Ex: Barulho na suspensão ao passar em irregularidades, falhando em baixa rotação, luz do óleo piscando..."
                            className="w-full h-32 bg-slate-50 dark:bg-background-dark border-2 border-slate-200 dark:border-white/5 rounded-3xl px-6 py-5 text-lg font-bold text-slate-900 dark:text-white focus:border-orange-500 outline-none transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-slate-800"
                        />
                    </div>
                </section>

                <button 
                    onClick={handleSearch}
                    disabled={(!brandQuery && !selectedBrand) || (!modelQuery && !selectedModel) || isSearching}
                    className="w-full h-28 bg-orange-600 rounded-[2.5rem] flex items-center justify-center gap-6 text-2xl font-black text-white shadow-3xl shadow-orange-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-20"
                >
                    <span className="material-symbols-outlined text-5xl">manage_search</span>
                    {isSearching ? 'ANALISANDO...' : 'GERAR FICHA TÉCNICA'}
                </button>
            </div>
        </div>
    );
};

export default VehicleInput;
