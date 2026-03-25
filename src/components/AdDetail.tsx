import React, { useState } from 'react';
import { Ad, UserProfile } from '../types';
import { X, MapPin, Clock, User, MessageCircle, Share2, Heart, ShieldCheck, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../lib/utils';

interface AdDetailProps {
  ad: Ad;
  onClose: () => void;
  onSellerClick: (sellerId: string) => void;
}

export const AdDetail: React.FC<AdDetailProps> = ({ ad, onClose, onSellerClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = () => {
    const shareData = {
      title: ad.title,
      text: ad.description,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => copyToClipboard());
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-50 w-full max-w-5xl min-h-screen sm:min-h-0 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[110] bg-white/20 backdrop-blur-md p-2 rounded-full text-white sm:hidden"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-3/5 bg-black relative flex items-center justify-center">
          <img
            src={ad.imageUrl || `https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1200&h=900&auto=format&fit=crop`}
            alt={ad.title}
            className="w-full h-full object-contain max-h-[50vh] md:max-h-none"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 hidden sm:flex bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-2/5 p-6 md:p-10 space-y-8 overflow-y-auto bg-white">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-purple-50 text-purple-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {ad.category}
              </span>
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(ad.createdAt, { addSuffix: true, locale: ptBR })}
              </span>
            </div>
            <h1 className="text-3xl font-black text-zinc-900 leading-tight">{ad.title}</h1>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.price)}
            </p>
          </div>

          <div className="flex items-center gap-4 py-6 border-y border-zinc-100">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onSellerClick(ad.sellerId)}
            >
              <div className="w-12 h-12 bg-zinc-100 rounded-2xl overflow-hidden border-2 border-purple-50 group-hover:border-purple-500 transition-all">
                <img 
                  src={ad.sellerPhoto || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop`} 
                  alt={ad.sellerName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Vendedor</p>
                <p className="font-bold text-zinc-900 group-hover:text-purple-600 transition-colors">{ad.sellerName}</p>
              </div>
            </div>
            <div className="ml-auto flex gap-2 relative">
              <button 
                onClick={handleShare}
                className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl text-zinc-600 transition-all active:scale-95"
                title="Compartilhar Anúncio"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  "p-3 rounded-2xl transition-all active:scale-95 shadow-sm",
                  isLiked 
                    ? "bg-red-50 text-red-500" 
                    : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
                )}
                title={isLiked ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
              </button>

              <AnimatePresence>
                {showShareToast && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 10, x: '-50%' }}
                    className="absolute -top-12 left-1/2 bg-zinc-900 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl z-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    Link Copiado!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Descrição</h3>
            <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{ad.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Localização</h3>
            <div className="flex items-center gap-2 text-zinc-600 bg-zinc-50 p-4 rounded-2xl">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span className="font-medium">{ad.location.address}</span>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <button 
              onClick={() => {
                onClose();
                // We'll pass the seller info as a partial UserProfile
                const sellerInfo = {
                  uid: ad.sellerId,
                  displayName: ad.sellerName,
                  photoURL: ad.sellerPhoto
                };
                window.dispatchEvent(new CustomEvent('openChat', { detail: sellerInfo }));
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-6 h-6" />
              Chat com Vendedor
            </button>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              Compra Segura Busca &gt; Pro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
