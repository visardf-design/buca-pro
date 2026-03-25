import React from 'react';
import { Ad } from '../types';
import { MapPin, Clock, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';

interface AdCardProps {
  ad: Ad;
  onClick: (ad: Ad) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(ad)}
      className="bg-white rounded-2xl border border-zinc-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-zinc-100">
        <img
          src={ad.imageUrl || `https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=400&h=300&auto=format&fit=crop`}
          alt={ad.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-zinc-900 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
            {ad.category}
          </span>
        </div>
        {ad.status === 'completed' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-zinc-900 font-bold px-4 py-2 rounded-xl shadow-lg transform -rotate-12">
              VENDIDO
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-zinc-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
            {ad.title}
          </h3>
        </div>
        
        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-3">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.price)}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{ad.location.address}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-medium tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDistanceToNow(ad.createdAt, { addSuffix: true, locale: ptBR })}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
