
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, OSStatus } from '../types';

interface OSItem {
    id: string;
    plate: string;
    model: string;
    customer: string;
    status: OSStatus;
    entryDate: string;
    priority: 'Alta' | 'Média' | 'Baixa';
}

const ServiceOrders: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<OSStatus | 'TODAS'>('TODAS');

    const orders: OSItem[] = [
        { id: '101', plate: 'BRA2E19', model: 'VW GOLF GTI', customer: 'Ricardo Silva', status: 'EXECUCAO', entryDate: '22/05 09:00', priority: 'Alta' },
        { id: '102', plate: 'KRT-4412', model: 'TOYOTA HILUX', customer: 'Fazenda Santa Fé', status: 'AGUARDANDO_PECA', entryDate: '21/05 14:30', priority: 'Média' },
        { id: '103', plate: 'ABC-1234', model: 'HONDA CIVIC G10', customer: 'Mariana Oliveira', status: 'DIAGNOSTICO', entryDate: '23/05 08:15', priority: 'Alta' },
        { id: '104', plate: 'OFF-9900', model: 'FIAT TORO', customer: 'Carlos Magno', status: 'FINALIZADO', entryDate: '20/05 11:00', priority: 'Baixa' },
        { id: '105', plate: 'XPZ-0011', model: 'CHEVROLET ONIX', customer: 'Pedro Neto', status: 'ENTRADA', entryDate: '23/05 10:45', priority: 'Média' },
    ];

    const filteredOrders = filter === 'TODAS' ? orders : orders.filter(o => o.status === filter);

    const getStatusStyle = (status: OSStatus) => {
        switch (status) {
            case 'EXECUCAO': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'AGUARDANDO_PECA': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'DIAGNOSTICO': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'FINALIZADO': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="flex flex-col min-h-full bg-background-dark p-6 md:p-12 max-w-7xl mx-auto page-transition safe-top space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
                        Quadro de <span className="text-orange-500">Trabalho</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Gerenciamento de Ordens de Serviço</p>
                </div>
                
                <button 
                    onClick={() => navigate(AppRoute.HOME)}
                    className="flex items-center gap-3 px-6 py-4 bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-orange-600/20"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nova OS
                </button>
            </header>

            {/* FILTROS DE STATUS */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {['TODAS', 'ENTRADA', 'DIAGNOSTICO', 'AGUARDANDO_PECA', 'EXECUCAO', 'FINALIZADO'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s as any)}
                        className={`px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                            filter === s 
                            ? 'bg-white text-background-dark border-white shadow-lg' 
                            : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                        }`}
                    >
                        {s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* LISTA DE OS */}
            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length > 0 ? filteredOrders.map((os) => (
                    <div 
                        key={os.id}
                        className="bg-surface-dark border border-white/5 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-orange-500/30 transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-6">
                            <div className="bg-white px-4 py-2 rounded-lg text-background-dark font-black text-lg tracking-tight border-2 border-slate-300 shadow-sm shrink-0">
                                {os.plate}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter group-hover:text-orange-500 transition-colors">{os.model}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    OS #{os.id} • {os.customer}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                            <div className="flex flex-col items-end hidden md:flex">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Entrada</p>
                                <p className="text-sm font-bold text-slate-300">{os.entryDate}</p>
                            </div>
                            
                            <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(os.status)}`}>
                                {os.status.replace('_', ' ')}
                            </div>

                            <button className="size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-white transition-all">
                                <span className="material-symbols-outlined">open_in_new</span>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center opacity-20">
                        <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                        <p className="font-black uppercase tracking-widest">Nenhuma OS encontrada neste status</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceOrders;
