
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'full', size = 'md' }) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-24',
    xl: 'h-32'
  };

  const Símbolo = () => (
    <svg viewBox="0 0 100 100" className={`${sizes[size]} w-auto drop-shadow-sm`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Escudo Hexagonal */}
      <path 
        d="M50 5L89 27.5V72.5L50 95L11 72.5V27.5L50 5Z" 
        fill="#f97316"
      />
      {/* Parafuso/Letra A Estilizada */}
      <path 
        d="M50 25L70 65H60L55 55H45L40 65H30L50 25ZM50 38L47 48H53L50 38Z" 
        fill="white"
      />
    </svg>
  );

  if (variant === 'icon') return <Símbolo />;

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Símbolo />
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-white font-black text-2xl tracking-tight uppercase leading-none">
            AutoIntel{" "}<span className="text-orange-500">Pro</span>
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-none mt-1.5">Inteligência Automotiva</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <Símbolo />
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase leading-none">
          AutoIntel{" "}<span className="text-orange-500">Pro</span>
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-bold uppercase tracking-[0.4em] mt-4 text-center">Inteligência que move sua oficina</p>
      </div>
    </div>
  );
};

export default Logo;
