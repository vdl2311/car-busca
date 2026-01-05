
import React, { useState, useEffect } from 'react';
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
    const [selectedBrand, setSelectedBrand] = useState<{id: string, name: string} | null>(null);
    const [selectedModel, setSelectedModel] = useState<{id: string, name: string} | null>(null);
    const [selectedYear, setSelectedYear] = useState<{id: string, name: string} | null>(null);
    const [loading, setLoading] = useState({ brands: false, models: false, years: false });
    const [mileage, setMileage] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<any[]>([]);

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
    }, [user]);

    useEffect(() => {
        if (!selectedBrand) { setModels([]); return; }
        const fetchModels = async () => {
            setLoading(prev => ({ ...prev, models: true }));
            const res = await fetch(`${FIPE_API_BASE}/marcas/${selectedBrand.id}/modelos`);
            const data = await res.json();
            setModels(data.modelos || []);
            setLoading(prev => ({ ...prev, models: false }));
        };
        fetchModels();
    }, [selectedBrand]);

    useEffect(() => {
        if (!selectedModel || !selectedBrand) { setYears([]); return; }
        const fetchYears = async () => {
            setLoading(prev => ({ ...prev, years: true }));
            const res = await fetch(`${FIPE_API_BASE}/marcas/${selectedBrand.id}/modelos/${selectedModel.id}/anos`);
            const data = await res.json();
            setYears(data || []);
            setLoading(prev => ({ ...prev, years: false }));
        };
        fetchYears();
    }, [selectedModel, selectedBrand]);

    const handleSearch = async () => {
        if (!selectedBrand || !selectedModel || !selectedYear) return;
        setIsSearching(true);
        if (user) {
            await supabase.from('search_history').insert({
                user_id: user.id, brand: selectedBrand.name, model: selectedModel.name, year: selectedYear.name, km: mileage || null
            });
        }
        await new Promise(r => setTimeout(r, 1500));
        setIsSearching(false);
        navigate(AppRoute.REPORT_RESULT, { state: { brand: selectedBrand.name, model: selectedModel.name, year: selectedYear.name, km: mileage } });
    };

    return (
        <div className="flex flex-col min-h-full bg-background-dark p-4 sm:p-6 md:p-12 max-w-7xl mx-auto page-transition overflow-x-hidden">
            <header className="flex items-center justify-between mb-10 md:mb-20">
                <div className="animate-fade-in">
                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none italic">AutoIntel <span className="text-primary not-italic">AI</span></h1>
                    <p className="text-sm md:text-2xl text-slate-500 font-bold mt-3 opacity-80 uppercase tracking-widest">Diagnóstico de Alta Precisão</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">
                <div className="lg:col-span-8">
                    <div className="bg-surface-dark/50 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 space-y-10 md:space-y-16 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-14">
                            {/* 01. MARCA */}
                            <div className="space-y-3">
                                <label className="text-[11px] md:text-sm font-black uppercase tracking-[0.3em] text-primary ml-1">01. MARCA</label>
                                <div className="relative">
                                    <select 
                                        value={selectedBrand?.id || ''} 
                                        onChange={(e) => {
                                            const b = brands.find(x => String(x.codigo) === e.target.value);
                                            setSelectedBrand(b ? { id: String(b.codigo), name: b.nome } : null);
                                            setSelectedModel(null);
                                            setSelectedYear(null);
                                        }}
                                        className="w-full h-16 md:h-20 bg-background-dark border-2 border-white/10 rounded-2xl px-6 text-lg md:text-2xl font-black text-white appearance-none focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="">SELECIONAR MARCA</option>
                                        {brands.map(b => <option key={b.codigo} value={b.codigo}>{b.nome.toUpperCase()}</option>)}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-3xl">expand_more</span>
                                </div>
                            </div>

                            {/* 02. MODELO */}
                            <div className="space-y-3">
                                <label className="text-[11px] md:text-sm font-black uppercase tracking-[0.3em] text-primary ml-1">02. MODELO</label>
                                <div className="relative">
                                    <select 
                                        value={selectedModel?.id || ''} 
                                        onChange={(e) => {
                                            const m = models.find(x => String(x.codigo) === e.target.value);
                                            setSelectedModel(m ? { id: String(m.codigo), name: m.nome } : null);
                                            setSelectedYear(null);
                                        }}
                                        disabled={!selectedBrand}
                                        className="w-full h-16 md:h-20 bg-background-dark border-2 border-white/10 rounded-2xl px-6 text-lg md:text-2xl font-black text-white appearance-none focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all disabled:opacity-20 cursor-pointer"
                                    >
                                        <option value="">SELECIONAR MODELO</option>
                                        {models.map(m => <option key={m.codigo} value={m.codigo}>{m.nome.toUpperCase()}</option>)}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-3xl">expand_more</span>
                                </div>
                            </div>

                            {/* 03. VERSÃO / ANO */}
                            <div className="space-y-3 sm:col-span-2">
                                <label className="text-[11px] md:text-sm font-black uppercase tracking-[0.3em] text-primary ml-1">03. VERSÃO E ANO</label>
                                <div className="relative">
                                    <select 
                                        value={selectedYear?.id || ''} 
                                        onChange={(e) => {
                                            const y = years.find(x => String(x.codigo) === e.target.value);
                                            setSelectedYear(y ? { id: String(y.codigo), name: y.nome } : null);
                                        }}
                                        disabled={!selectedModel}
                                        className="w-full h-16 md:h-20 bg-background-dark border-2 border-white/10 rounded-2xl px-6 text-lg md:text-2xl font-black text-white appearance-none focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all disabled:opacity-20 cursor-pointer"
                                    >
                                        <option value="">SELECIONAR VERSÃO / ANO</option>
                                        {years.map(y => <option key={y.codigo} value={y.codigo}>{y.nome.toUpperCase()}</option>)}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-3xl">expand_more</span>
                                </div>
                            </div>

                            {/* 04. QUILOMETRAGEM */}
                            <div className="space-y-3 sm:col-span-2">
                                <label className="text-[11px] md:text-sm font-black uppercase tracking-[0.3em] text-primary ml-1">04. QUILOMETRAGEM ATUAL</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        value={mileage}
                                        onChange={(e) => setMileage(e.target.value)}
                                        placeholder="EX: 50.000"
                                        className="w-full h-16 md:h-20 bg-background-dark border-2 border-white/10 rounded-2xl px-6 text-xl md:text-3xl font-black text-white focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-800"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-primary text-sm md:text-xl tracking-tighter uppercase">KM</div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSearch}
                            disabled={!selectedYear || isSearching}
                            className="w-full h-20 md:h-28 bg-primary rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center gap-6 text-xl md:text-3xl font-black text-white shadow-2xl shadow-primary/40 hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20"
                        >
                            <span className="material-symbols-outlined text-3xl md:text-5xl font-black">{isSearching ? 'settings_backup_restore' : 'analytics'}</span>
                            {isSearching ? 'PROCESSANDO DADOS...' : 'GERAR LAUDO TÉCNICO'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <h3 className="text-xl md:text-3xl font-black text-white flex items-center gap-4 px-2">
                        <span className="material-symbols-outlined text-primary text-4xl">history</span>
                        HISTÓRICO
                    </h3>
                    <div className="flex flex-col gap-5">
                        {recentSearches.map((item: any) => (
                            <div key={item.id} className="bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/5 flex items-center gap-6 hover:bg-white/10 transition-all cursor-pointer group">
                                <div className="size-14 md:size-20 rounded-2xl bg-background-dark flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl md:text-5xl">verified</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg md:text-2xl font-black text-white leading-tight uppercase truncate">{item.brand} {item.model}</h4>
                                    <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">{item.year}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleInput;
