import React, { useState } from 'react';
import { ServicePortfolio } from '../types';
import { Star, ChevronLeft, ChevronRight, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PortfolioDetailProps {
  service: ServicePortfolio;
  onClose: () => void;
}

export const PortfolioDetail: React.FC<PortfolioDetailProps> = ({ service, onClose }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % service.images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + service.images.length) % service.images.length);

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-zinc-900">{service.title}</h3>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <Star className="w-3 h-3 fill-emerald-600" />
              <span>{service.rating} ({service.reviewCount} avaliações)</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        {/* Gallery */}
        <div className="relative flex-1 bg-zinc-900 flex items-center justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={service.images[currentImage]}
              alt={`${service.title} ${currentImage + 1}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-full max-h-[60vh] object-contain"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          {service.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-6 flex gap-2">
                {service.images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentImage ? 'bg-emerald-500 w-4' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="p-6 space-y-4 bg-zinc-50">
          <p className="text-zinc-600 text-sm leading-relaxed">
            {service.description}
          </p>
          <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-3">
            <MessageCircle className="w-6 h-6" />
            Solicitar Orçamento
          </button>
        </div>
      </div>
    </div>
  );
};
