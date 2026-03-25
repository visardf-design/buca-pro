import React from 'react';
import { ExternalLink, ShoppingCart, Wrench } from 'lucide-react';

interface SimulatedAdProps {
  brand: 'casa-do-construtor' | 'campeao-da-construcao' | 'castelo-forte';
  className?: string;
}

export const SimulatedAd: React.FC<SimulatedAdProps> = ({ brand, className = "" }) => {
  const adData = {
    'casa-do-construtor': {
      name: 'Casa do Construtor',
      tagline: 'Aluguel de Equipamentos',
      promo: 'Betoneiras e Andaimes com 15% OFF',
      color: 'bg-[#FFD700]',
      textColor: 'text-[#003399]',
      icon: <Wrench className="w-4 h-4" />,
      logo: 'https://www.casadoconstrutor.com.br/assets/images/logo.png'
    },
    'campeao-da-construcao': {
      name: 'Campeão da Construção',
      tagline: 'O Preço que Você Procura',
      promo: 'Pisos e Revestimentos em Oferta!',
      color: 'bg-[#E30613]',
      textColor: 'text-white',
      icon: <ShoppingCart className="w-4 h-4" />,
      logo: 'https://campeaodaconstrucao.com.br/wp-content/uploads/2021/05/logo-campeao-da-construcao.png'
    },
    'castelo-forte': {
      name: 'Castelo Forte',
      tagline: 'Home Center Completo',
      promo: 'Tudo para sua Reforma em 10x s/ Juros',
      color: 'bg-[#005696]',
      textColor: 'text-white',
      icon: <ExternalLink className="w-4 h-4" />,
      logo: 'https://casteloforte.com.br/wp-content/uploads/2020/06/logo-castelo-forte.png'
    }
  };

  const data = adData[brand];

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${data.color} ${data.textColor} shadow-lg border border-white/10 hover:scale-105 transition-transform cursor-pointer group shrink-0 ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-[10px] uppercase tracking-tighter opacity-80">Patrocinado</span>
          <div className="w-1 h-1 rounded-full bg-current opacity-30" />
          <span className="font-bold text-[11px] whitespace-nowrap">{data.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-black tracking-tight whitespace-nowrap">{data.promo}</span>
          <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            {data.icon}
          </div>
        </div>
      </div>
    </div>
  );
};
