
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';

const Subscription: React.FC = () => {
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Laudo Único',
            price: 'R$ 14,90',
            period: 'por carro',
            description: 'Ideal para quem está avaliando um carro específico agora.',
            features: [
                'Laudo Técnico Completo',
                'Análise de Defeitos Crônicos',
                'Veredito do Mecânico IA',
                'Acesso por 48 horas',
                'Exportação PDF Premium'
            ],
            isPopular: false,
            button: 'Comprar 1 Crédito',
            tier: 'SINGLE',
            highlight: 'bg-white/5 border-white/10'
        },
        {
            name: 'Plano Pro Mensal',
            price: 'R$ 49,90',
            period: '/mês',
            description: 'Para consultores, lojistas e apaixonados por carros.',
            features: [
                'Consultas ILIMITADAS',
                'Análise de Imagens (IA Vision)',
                'Histórico Eterno na Nuvem',
                'Suporte Prioritário',
                'Selo de Especialista no Perfil'
            ],
            isPopular: true,
            button: 'Assinar Plano Pro',
            tier: 'PRO',
            highlight: 'bg-primary/10 border-primary shadow-[0_0_50px_rgba(19,91,236,0.2)]'
        },
        {
            name: 'Pacote 10 Laudos',
            price: 'R$ 89,90',
            period: 'pagamento único',
            description: 'Melhor custo-benefício para quem vai visitar várias lojas.',
            features: [
                '10 Créditos de Laudo',
                'Créditos não expiram',
                'Economia de 40%',
                'Ideal para comparar modelos',
                'Relatórios Comparativos'
            ],
            isPopular: false,
            button: 'Comprar Pacote',
            tier: 'BUNDLE',
            highlight: 'bg-white/5 border-white/10'
        }
    ];

    return (
        <div className="min-h-full bg-background-dark p-6 md:p-12 page-transition">
            <header className="text-center mb-16 space-y-6">
                <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-none">
                    Invista pouco, <br/> <span className="text-primary">economize milhares.</span>
                </h1>
                <p className="text-slate-400 font-bold max-w-2xl mx-auto text-sm md:text-xl">
                    Um erro na compra de um usado pode custar R$ 5.000 em oficina. <br className="hidden md:block"/> Nossos laudos custam menos que um café com pão de queijo.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {plans.map((plan, i) => (
                    <div 
                        key={i} 
                        className={`relative p-8 md:p-10 rounded-[3rem] border-2 flex flex-col transition-all hover:scale-[1.02] ${plan.highlight}`}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">Recomendado</div>
                        )}
                        
                        <div className="mb-8">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 italic">{plan.name}</h3>
                            <p className="text-slate-500 text-xs font-bold leading-relaxed">{plan.description}</p>
                        </div>

                        <div className="flex items-baseline gap-2 mb-10">
                            <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                            <span className="text-slate-500 font-black text-xs uppercase tracking-widest">{plan.period}</span>
                        </div>

                        <ul className="space-y-5 mb-12 flex-1">
                            {plan.features.map((f, j) => (
                                <li key={j} className="flex items-start gap-4 text-sm font-bold text-slate-300">
                                    <span className="material-symbols-outlined text-primary text-xl shrink-0">check_circle</span>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button 
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl ${plan.isPopular ? 'bg-primary text-white hover:bg-blue-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {plan.button}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-20 flex flex-col items-center gap-8">
                <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale">
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs"><span className="material-symbols-outlined">credit_card</span> Visa / Master</div>
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs"><span className="material-symbols-outlined">pix</span> Pix Instantâneo</div>
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs"><span className="material-symbols-outlined">security</span> SSL Secure</div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">AutoIntel Billing System v2.0</p>
            </div>
        </div>
    );
};

export default Subscription;
