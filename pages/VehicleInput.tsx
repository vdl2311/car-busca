import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const carData: Record<string, string[]> = {
  "Toyota": ["Corolla", "Corolla Cross", "Hilux", "SW4", "Yaris Hatch", "Yaris Sedan", "Etios Hatch", "Etios Sedan", "RAV4", "Camry", "Prius", "Supra", "GR Corolla", "Fielder"],
  "Honda": ["Civic", "City Hatch", "City Sedan", "HR-V", "ZR-V", "CR-V", "Accord", "WR-V", "Fit", "Civic Si", "Civic Type R", "CR-X"],
  "Volkswagen": ["Polo", "Virtus", "Nivus", "T-Cross", "Taos", "Tiguan Allspace", "Jetta", "Jetta GLI", "Gol", "Voyage", "Saveiro", "Amarok", "Fox", "SpaceFox", "CrossFox", "Up!", "Golf", "Golf GTI", "Passat", "Fusca", "Kombi", "ID.4", "ID.Buzz"],
  "Chevrolet": ["Onix", "Onix Plus", "Tracker", "Montana", "Spin", "S10", "Trailblazer", "Equinox", "Cruze", "Cruze Sport6", "Camaro", "Bolt EUV", "Silverado", "Cobalt", "Prisma", "Celta", "Classic", "Agile", "Captiva", "Malibu", "Omega", "Vectra", "Astra", "Blazer"],
  "Fiat": ["Strada", "Toro", "Mobi", "Argo", "Cronos", "Pulse", "Fastback", "Titano", "Fiorino", "Ducato", "Scudo", "500e", "Uno", "Palio", "Siena", "Grand Siena", "Doblo", "Weekend", "Idea", "Punto", "Linea", "Bravo", "Stilo", "Marea"],
  "Hyundai": ["HB20", "HB20S", "HB20X", "Creta", "Tucson", "Santa Fe", "Palisade", "Ioniq 5", "Kona", "Azera", "Elantra", "ix35", "HR", "Veloster", "Sonata", "i30", "i30 CW", "Vera Cruz"],
  "Ford": ["Ranger", "Maverick", "F-150", "Mustang", "Mustang Mach-E", "Bronco Sport", "Territory", "Transit", "Ka", "Ka Sedan", "EcoSport", "Edge", "Fusion", "Focus", "Fiesta", "Courier", "New Fiesta"],
  "Jeep": ["Renegade", "Compass", "Commander", "Grand Cherokee", "Wrangler", "Gladiator", "Cherokee"],
  "Renault": ["Kwid", "Stepway", "Logan", "Sandero", "Duster", "Oroch", "Captur", "Kardian", "Megane E-Tech", "Kwid E-Tech", "Master", "Kangoo", "Zoe", "Clio", "Fluence", "Symbol"],
  "Nissan": ["Kicks", "Versa", "Sentra", "Frontier", "Leaf", "March", "Tiida", "Livina", "Grand Livina"],
  "Peugeot": ["208", "e-208", "2008", "e-2008", "3008", "5008", "Expert", "Partner Rapid", "Partner", "207", "206", "308", "408", "RCZ", "Hoggar"],
  "Citroën": ["C3", "C3 Aircross", "C4 Cactus", "Jumpy", "C4 Lounge", "C3 Picasso", "Aircross", "C4 Pallas", "DS3", "DS4", "DS5", "Xsara Picasso"],
  "Mitsubishi": ["L200 Triton", "Pajero Sport", "Eclipse Cross", "ASX", "Outlander", "Outlander Sport", "Pajero Full", "Pajero TR4", "Pajero Dakar", "Lancer", "Lancer Evo"],
  "BMW": ["Série 1", "Série 2", "Série 3", "Série 4", "Série 5", "Série 7", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "iX", "iX1", "iX3", "i4", "i5", "i7", "Z4", "M2", "M3", "M4", "M5"],
  "Mercedes-Benz": ["Classe A", "Classe C", "Classe E", "Classe S", "CLA", "GLA", "GLB", "GLC", "GLE", "GLS", "Classe G", "EQA", "EQB", "EQC", "EQE", "EQS", "Sprinter", "Vito"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "Q3", "Q5", "Q7", "Q8", "e-tron", "e-tron GT", "RS Q3", "RS Q8", "RS6", "RS5", "RS4", "RS3", "TT"],
  "Kia": ["Sportage", "Niro", "Stonic", "Carnival", "Cerato", "Bongo", "Sorento", "Picanto", "Soul", "Mohave", "Optima", "Cadenza"],
  "Chery": ["Tiggo 2", "Tiggo 3x", "Tiggo 5x", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6", "iCar", "QQ", "Celer", "Face"],
  "BYD": ["Dolphin", "Dolphin Mini", "Seal", "Song Plus", "Yuan Plus", "Tan", "Han", "King"],
  "GWM": ["Haval H6", "Haval H6 GT", "Ora 03"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar", "Freelander 2"],
  "Volvo": ["XC40", "XC60", "XC90", "C40", "EX30", "EX90", "S60", "S90", "V40", "V60"],
  "Porsche": ["911", "718 Boxster", "718 Cayman", "Cayenne", "Macan", "Panamera", "Taycan"],
  "Ram": ["Rampage", "1500", "2500", "3500", "Classic"],
  "Suzuki": ["Jimny", "Jimny Sierra", "Vitara", "Grand Vitara", "S-Cross", "Swift"],
  "Subaru": ["Forester", "XV", "Outback", "Impreza", "WRX"],
  "JAC": ["J2", "J3", "J5", "J6", "T40", "T50", "T60", "T80", "E-JS1", "E-JS4", "iEV40"]
};

interface SearchHistoryItem {
    id: string;
    brand: string;
    model: string;
    year: string;
    km?: string;
    created_at: string;
}

const VehicleInput: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [mileage, setMileage] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);

    // Fetch Recent Searches from Supabase
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            
            const { data, error } = await supabase
                .from('search_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error && data) {
                setRecentSearches(data);
            }
        };

        fetchHistory();
    }, [user]);

    const brands = useMemo(() => Object.keys(carData).sort(), []);

    const models = useMemo(() => {
        if (!selectedBrand || !carData[selectedBrand]) return [];
        // Create a copy before sorting to avoid mutating the original array
        return [...carData[selectedBrand]].sort();
    }, [selectedBrand]);

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear() + 1;
        const yearsList = [];
        for (let i = currentYear; i >= 1980; i--) {
            yearsList.push(i.toString());
        }
        return yearsList;
    }, []);

    const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBrand(e.target.value);
        setSelectedModel(''); // Reset model when brand changes
    };

    const handleSearch = async () => {
        if (!selectedBrand || !selectedModel || !selectedYear) return;

        setIsSearching(true);

        const saveHistoryPromise = async () => {
            // Save search to history if user is logged in
            if (user) {
                try {
                    await supabase.from('search_history').insert({
                        user_id: user.id,
                        brand: selectedBrand,
                        model: selectedModel,
                        year: selectedYear,
                        km: mileage || null
                    });
                } catch (err) {
                    console.error("Error saving search history:", err);
                }
            }
        };

        const processingDelayPromise = new Promise(resolve => setTimeout(resolve, 1500));

        // Execute both save and delay concurrently
        await Promise.all([saveHistoryPromise(), processingDelayPromise]);

        setIsSearching(false);
        navigate(AppRoute.REPORT_RESULT, {
            state: {
                brand: selectedBrand,
                model: selectedModel,
                year: selectedYear,
                km: mileage
            }
        });
    };

    const handleSelectHistory = (item: SearchHistoryItem) => {
        setSelectedBrand(item.brand);
        setSelectedModel(item.model);
        setSelectedYear(item.year);
        if (item.km) setMileage(item.km);
    };

    return (
        <div className="flex flex-col h-full md:p-6 md:max-w-4xl md:mx-auto">
            {/* Top App Bar */}
            <div className="flex items-center bg-surface-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 md:hidden">
                <button onClick={() => navigate(AppRoute.WELCOME)} className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Avaliação Veicular</h2>
                <div className="flex w-12 items-center justify-end">
                    <button onClick={() => navigate(AppRoute.PROFILE)} className="flex size-12 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors">
                        <span className="material-symbols-outlined text-[24px]">account_circle</span>
                    </button>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Avaliação Veicular</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Identifique o veículo para iniciar a análise</p>
                </div>
            </div>

            {/* Page Indicators (Mobile) */}
            <div className="flex w-full flex-row items-center justify-center gap-3 py-4 md:hidden">
                <div className="h-1.5 w-6 rounded-full bg-primary"></div>
                <div className="h-1.5 w-2 rounded-full bg-slate-300 dark:bg-surface-dark"></div>
                <div className="h-1.5 w-2 rounded-full bg-slate-300 dark:bg-surface-dark"></div>
            </div>

            <div className="md:grid md:grid-cols-12 md:gap-10">
                <div className="md:col-span-7 lg:col-span-8">
                    {/* Headline */}
                    <div className="px-5 pt-2 md:px-0 md:pt-0 md:mb-6">
                        <h2 className="text-slate-900 dark:text-white tracking-tight text-[28px] md:text-2xl font-bold leading-tight text-left pb-2">Identifique o Veículo</h2>
                        <p className="text-slate-500 dark:text-gray-400 text-base font-normal leading-normal pb-6 md:pb-0">Preencha os dados abaixo para iniciar a análise detalhada com IA.</p>
                    </div>

                    {/* Form Fields */}
                    <div className="flex flex-col gap-5 px-5 md:px-0 md:grid md:grid-cols-2 md:gap-6">
                        {/* Marca */}
                        <label className="flex flex-col w-full md:col-span-1">
                            <span className="text-slate-900 dark:text-white text-sm font-semibold leading-normal pb-2 uppercase tracking-wide opacity-80">Marca</span>
                            <div className="relative">
                                <select 
                                    value={selectedBrand}
                                    onChange={handleBrandChange}
                                    className="appearance-none w-full cursor-pointer rounded-xl border border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary h-14 pl-4 pr-10 text-base font-normal leading-normal transition-all shadow-sm"
                                >
                                    <option className="text-gray-400" disabled value="">Selecione a marca</option>
                                    {brands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </label>

                        {/* Modelo */}
                        <label className="flex flex-col w-full md:col-span-1">
                            <span className="text-slate-900 dark:text-white text-sm font-semibold leading-normal pb-2 uppercase tracking-wide opacity-80">Modelo</span>
                            <div className="relative">
                                <select 
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    disabled={!selectedBrand}
                                    className="appearance-none w-full cursor-pointer rounded-xl border border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary h-14 pl-4 pr-10 text-base font-normal leading-normal transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option className="text-gray-400" disabled value="">Selecione o modelo</option>
                                    {models.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </label>

                        {/* Ano */}
                        <label className="flex flex-col w-full md:col-span-1">
                            <span className="text-slate-900 dark:text-white text-sm font-semibold leading-normal pb-2 uppercase tracking-wide opacity-80">Ano</span>
                            <div className="relative">
                                <select 
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="appearance-none w-full cursor-pointer rounded-xl border border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary h-14 pl-4 pr-10 text-base font-normal leading-normal transition-all shadow-sm"
                                >
                                    <option className="text-gray-400" disabled value="">Ano de fabricação</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </label>

                        {/* Quilometragem */}
                        <label className="flex flex-col w-full md:col-span-1">
                            <div className="flex justify-between items-baseline pb-2">
                                <span className="text-slate-900 dark:text-white text-sm font-semibold uppercase tracking-wide opacity-80">Quilometragem</span>
                                <span className="text-xs text-slate-400 font-medium">(Opcional)</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="number"
                                    value={mileage}
                                    onChange={(e) => setMileage(e.target.value)}
                                    placeholder="Ex: 85000"
                                    className="w-full rounded-xl border border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary h-14 pl-4 pr-10 text-base font-normal leading-normal transition-all shadow-sm placeholder:text-gray-400"
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <span className="text-sm font-medium">km</span>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Primary Action Button */}
                    <div className="px-5 pt-8 md:px-0">
                        <button 
                            onClick={handleSearch}
                            disabled={!selectedBrand || !selectedModel || !selectedYear || isSearching}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary h-14 text-white text-base font-bold tracking-wide shadow-lg shadow-primary/25 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isSearching ? (
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined">network_intelligence</span>
                            )}
                            {isSearching ? 'Analisando Dados Sociais...' : 'Analisar com IA'}
                        </button>
                        <p className="text-center text-xs text-slate-500 dark:text-gray-400 mt-3">IA analisa mecânicos, fóruns e donos reais</p>
                    </div>
                </div>

                {/* Recent Searches Section - Sidebar style on desktop */}
                {recentSearches.length > 0 && (
                    <div className="mt-8 mb-24 md:mt-0 md:col-span-5 lg:col-span-4 md:mb-0">
                        <div className="flex items-center justify-between px-5 mb-4 md:px-0">
                            <h3 className="text-slate-900 dark:text-white text-lg font-bold">Buscas Recentes</h3>
                        </div>
                        <div className="flex overflow-x-auto px-5 pb-4 gap-4 no-scrollbar md:flex-col md:px-0 md:overflow-visible">
                            {recentSearches.map((item) => (
                                <div key={item.id} onClick={() => handleSelectHistory(item)} className="flex min-w-[150px] flex-col overflow-hidden rounded-xl bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-transparent md:flex-row md:items-center md:h-auto md:p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="h-24 w-full bg-slate-200 dark:bg-gray-800 relative flex items-center justify-center md:w-20 md:h-16 md:rounded-lg">
                                        <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-600 md:text-2xl">history</span>
                                    </div>
                                    <div className="p-3 md:flex-1">
                                        <p className="text-slate-900 dark:text-white text-sm font-bold truncate">{item.brand} {item.model}</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-slate-500 dark:text-gray-400 text-xs truncate">{item.year}</p>
                                            {item.km && <p className="text-slate-400 dark:text-gray-500 text-xs">• {item.km} km</p>}
                                        </div>
                                    </div>
                                    <div className="hidden md:flex pr-2 text-slate-400">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleInput;