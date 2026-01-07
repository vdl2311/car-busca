
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface FipeItem {
    codigo: string | number;
    nome: string;
}

const FIPE_API_BASE = 'https://parallelum.com.br/fipe/api/v1/carros';

const VehicleInput: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
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

    const [loading, setLoading] = useState({ brands: false, models: false, years: false });
    const [mileage, setMileage] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<any[]>([]);

    const brandRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchBrands = async () => {
            setLoading(prev => ({ ...prev, brands: true }));
            try {
                const res = await fetch(`${FIPE_API_BASE}/marcas`);
                const data = await res.json();
                setBrands(data);
            } catch (err) { console.error(err); } 
            finally { setLoading(prev => ({ ...prev, brands: false })); }
        };
        fetchBrands();

        const fetchHistory = async () => {
            if (!user) return;
            const { data } = await supabase.from('search_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4);
            if (data) setRecentSearches(data);
        };
        fetchHistory();

        const handleClickOutside = (event: MouseEvent) => {
            if (brandRef.current && !brandRef.current.contains(event.target as Node)) setShowBrands(false);
            if (modelRef.current && !modelRef.current.contains(event.target as Node)) setShowModels(false);
            if (yearRef.current && !yearRef.current.contains(event.target as Node)) setShowYears(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [user]);

    useEffect(() => {
        if (!selectedBrand) { setModels([]); return; }
        const fetchModels = async () => {
            setLoading(prev => ({ ...prev, models: true }));
            try {
                const res = await fetch(`${FIPE_API_BASE}/marcas/${selectedBrand.codigo}/modelos`);
                const data = await res.json();
                setModels(data.modelos || []);
            } catch (e) { console.error(e); }
            finally { setLoading(prev => ({ ...prev, models: false })); }
        };
        fetchModels();
    }, [selectedBrand]);

    useEffect(() => {
        if (!selectedModel || !selectedBrand) { setYears([]); return; }
        const fetchYears = async () => {
            setLoading(prev => ({ ...prev, years: true }));
            try {
                const res = await fetch(`${FIPE_API_BASE}/marcas/${selectedBrand.codigo}/modelos/${selectedModel.codigo}/anos`);
                const data = await res.json();
                setYears(data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(prev => ({ ...prev, years: false })); }
        };
        fetchYears();
    }, [selectedModel, selectedBrand]);

    const handleSearch = async () => {
        const brand = selectedBrand ? selectedBrand.nome : brandQuery;
        const model = selectedModel ? selectedModel.nome : modelQuery;
        const year = selectedYear ? selectedYear.nome : yearQuery;

        if (!brand || !model || !year) return;
        
        setIsSearching(true);
        if (user) {
            await supabase.from('search_history').insert({
                user_id: user.id, brand, model, year, km: mileage || null
            });
        }
        await new Promise(r => setTimeout(r, 1500));
        setIsSearching(false);
        navigate(AppRoute.REPORT_RESULT, { state: { brand, model, year, km: mileage } });
    };

    const filterItems = (items: FipeItem[], query: string) => {
        if (!query) return items;
        return items.filter(item => item.nome.toLowerCase().includes(query.toLowerCase()));
    };

    const canSearch = (brandQuery || selectedBrand) && (modelQuery || selectedModel) && (yearQuery || selectedYear);

    return (
        <div className="flex flex-col min-h-full bg-background-dark p-4 sm:p-6 md:p-12 max-w-7xl mx-auto page-transition overflow-x-hidden">
            <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-14 gap-6">
                <div className="animate-fade-in space-y-2">
                    <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-none italic">AutoIntel <span className="text-primary not-italic">AI</span></h1>
                    <div className="space-y-1">
                        <p className="text-[10px] md:text-lg text-slate-500 font-bold opacity-80 uppercase tracking-widest">Diagnóstico de Alta Precisão</p>
                        <p className="text-sm md:text-xl text-slate-400 font-semibold tracking-tight">Configure as especificações do veículo abaixo para iniciar seu diagnóstico de alta fidelidade.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                <div className="lg:col-span-8">
                    <div className="bg-surface-dark/50 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 space-y-8 md:space-y-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                            
                            {/* 01. MARCA */}
                            <div className="space-y-2 relative" ref={brandRef}>
                                <label className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary ml-1">01. MARCA</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={brandQuery}
                                        onFocus={() => setShowBrands(true)}
                                        onChange={(e) => {
                                            setBrandQuery(e.target.value.toUpperCase());
                                            setSelectedBrand(null);
                                            setSelectedModel(null);
                                            setSelectedYear(null);
                                            setModelQuery('');
                                            setYearQuery('');
                                        }}
                                        placeholder="DIGITE OU SELECIONE"
                                        className="w-full h-12 md:h-16 bg-background-dark border-2 border-white/10 rounded-xl px-4 text-sm md:text-lg font-black text-white focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-800"
                                    />
                                    {showBrands && (
                                        <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-surface-dark border border-white/10 rounded-xl z-[60] glass no-scrollbar shadow-2xl">
                                            {filterItems(brands, brandQuery).length > 0 ? (
                                                filterItems(brands, brandQuery).map(b => (
                                                    <div 
                                                        key={b.codigo} 
                                                        onClick={() => {
                                                            setSelectedBrand(b);
                                                            setBrandQuery(b.nome.toUpperCase());
                                                            setShowBrands(false);
                                                        }}
                                                        className="px-4 py-3 hover:bg-primary hover:text-white cursor-pointer font-bold text-sm md:text-base border-b border-white/5 last:border-0 transition-colors"
                                                    >
                                                        {b.nome.toUpperCase()}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-slate-500 text-xs font-black italic">PROSSEGUIR COM "{brandQuery}"</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 02. MODELO */}
                            <div className="space-y-2 relative" ref={modelRef}>
                                <label className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary ml-1">02. MODELO</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={modelQuery}
                                        onFocus={() => setShowModels(true)}
                                        disabled={!brandQuery && !selectedBrand}
                                        onChange={(e) => {
                                            setModelQuery(e.target.value.toUpperCase());
                                            setSelectedModel(null);
                                            setSelectedYear(null);
                                            setYearQuery('');
                                        }}
                                        placeholder="DIGITE OU SELECIONE"
                                        className="w-full h-12 md:h-16 bg-background-dark border-2 border-white/10 rounded-xl px-4 text-sm md:text-lg font-black text-white focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-800 disabled:opacity-20"
                                    />
                                    {showModels && (modelQuery || models.length > 0) && (
                                        <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-surface-dark border border-white/10 rounded-xl z-[60] glass no-scrollbar shadow-2xl">
                                            {filterItems(models, modelQuery).length > 0 ? (
                                                filterItems(models, modelQuery).map(m => (
                                                    <div 
                                                        key={m.codigo} 
                                                        onClick={() => {
                                                            setSelectedModel(m);
                                                            setModelQuery(m.nome.toUpperCase());
                                                            setShowModels(false);
                                                        }}
                                                        className="px-4 py-3 hover:bg-primary hover:text-white cursor-pointer font-bold text-sm md:text-base border-b border-white/5 last:border-0 transition-colors"
                                                    >
                                                        {m.nome.toUpperCase()}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-slate-500 text-xs font-black italic">PROSSEGUIR COM "{modelQuery}"</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 03. VERSÃO / ANO */}
                            <div className="space-y-2 sm:col-span-2 relative" ref={yearRef}>
                                <label className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary ml-1">03. VERSÃO E ANO</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={yearQuery}
                                        onFocus={() => setShowYears(true)}
                                        disabled={!modelQuery && !selectedModel}
                                        onChange={(e) => {
                                            setYearQuery(e.target.value.toUpperCase());
                                            setSelectedYear(null);
                                        }}
                                        placeholder="EX: TOPO DE LINHA 2024"
                                        className="w-full h-12 md:h-16 bg-background-dark border-2 border-white/10 rounded-xl px-4 text-sm md:text-lg font-black text-white focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-800 disabled:opacity-20"
                                    />
                                    {showYears && (yearQuery || years.length > 0) && (
                                        <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-surface-dark border border-white/10 rounded-xl z-[60] glass no-scrollbar shadow-2xl">
                                            {filterItems(years, yearQuery).length > 0 ? (
                                                filterItems(years, yearQuery).map(y => (
                                                    <div 
                                                        key={y.codigo} 
                                                        onClick={() => {
                                                            setSelectedYear(y);
                                                            setYearQuery(y.nome.toUpperCase());
                                                            setShowYears(false);
                                                        }}
                                                        className="px-4 py-3 hover:bg-primary hover:text-white cursor-pointer font-bold text-sm md:text-base border-b border-white/5 last:border-0 transition-colors"
                                                    >
                                                        {y.nome.toUpperCase()}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-slate-500 text-xs font-black italic">PROSSEGUIR COM "{yearQuery}"</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 04. QUILOMETRAGEM */}
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary ml-1">04. QUILOMETRAGEM ATUAL</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        value={mileage}
                                        onChange={(e) => setMileage(e.target.value)}
                                        placeholder="EX: 50.000"
                                        className="w-full h-12 md:h-16 bg-background-dark border-2 border-white/10 rounded-xl px-4 text-sm md:text-xl font-black text-white focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-800"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-primary text-[10px] md:text-sm tracking-tighter uppercase">KM</div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSearch}
                            disabled={!canSearch || isSearching}
                            className={`w-full h-14 md:h-20 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center gap-4 text-sm md:text-lg font-black text-white shadow-xl shadow-primary/30 hover:bg-blue-600 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-20 ${canSearch && !isSearching ? 'animate-pulse' : ''}`}
                        >
                            <span className="material-symbols-outlined text-2xl md:text-4xl font-black">{isSearching ? 'settings_backup_restore' : 'analytics'}</span>
                            {isSearching ? 'PROCESSANDO DADOS...' : 'GERAR LAUDO TÉCNICO'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <h3 className="text-lg md:text-2xl font-black text-white flex items-center gap-3 px-2">
                        <span className="material-symbols-outlined text-primary text-3xl">history</span>
                        HISTÓRICO
                    </h3>
                    <div className="flex flex-col gap-4">
                        {recentSearches.length > 0 ? (
                            recentSearches.map((item: any) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => navigate(AppRoute.REPORT_RESULT, { state: { brand: item.brand, model: item.model, year: item.year, km: item.km } })}
                                    className="bg-white/5 p-4 md:p-6 rounded-[1.5rem] border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer group"
                                >
                                    <div className="size-12 md:size-16 rounded-xl bg-background-dark flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                        <span className="material-symbols-outlined text-2xl md:text-4xl">verified</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm md:text-lg font-black text-white leading-tight uppercase truncate">{item.brand} {item.model}</h4>
                                        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{item.year}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 opacity-30">
                                <p className="text-xs font-black uppercase tracking-widest">Sem buscas recentes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleInput;
