import React, { useState } from 'react';
import { Star, X, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

interface ReviewFormProps {
  adTitle: string;
  sellerName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  adTitle,
  sellerName,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="text-xl font-black text-zinc-900">Avaliar Vendedor</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-zinc-500 text-sm">Como foi sua experiência com</p>
            <p className="text-lg font-black text-zinc-900">{sellerName}</p>
            <p className="text-xs text-zinc-400">Referente ao anúncio: <span className="italic">{adTitle}</span></p>
          </div>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform active:scale-90"
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-colors",
                    (hoveredRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-zinc-200"
                  )}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Comentário
            </label>
            <textarea
              rows={3}
              placeholder="Conte como foi a negociação..."
              className="w-full px-4 py-3 bg-zinc-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button
            disabled={rating === 0}
            onClick={() => onSubmit(rating, comment)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-purple-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Enviar Avaliação
          </button>
        </div>
      </div>
    </div>
  );
};
