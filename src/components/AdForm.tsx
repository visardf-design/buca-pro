import React, { useState, useRef } from 'react';
import { Ad, Category } from '../types';
import { CATEGORIES } from '../constants';
import { X, Camera, MapPin, DollarSign, Type, FileText, Check, Tag, Image as ImageIcon } from 'lucide-react';
import { CameraCapture } from './CameraCapture';
import { AnimatePresence } from 'motion/react';

interface AdFormProps {
  categories: { label: Category; icon: any }[];
  onClose: () => void;
  onSubmit: (ad: Partial<Ad>) => void;
  isPhotosBlocked?: boolean;
}

export const AdForm: React.FC<AdFormProps> = ({ categories, onClose, onSubmit, isPhotosBlocked }) => {
  const [formData, setFormData] = useState<Partial<Ad>>({
    title: '',
    description: '',
    price: 0,
    category: 'Outros',
    location: {
      lat: -23.5505,
      lng: -46.6333,
      address: '',
    },
    imageUrl: '',
    keywords: [],
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCapture = (data: string, type: 'image' | 'video') => {
    setFormData({ ...formData, imageUrl: data });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!formData.keywords?.includes(keywordInput.trim())) {
        setFormData({
          ...formData,
          keywords: [...(formData.keywords || []), keywordInput.trim()]
        });
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (tag: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords?.filter(k => k !== tag)
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <AnimatePresence>
        {showCamera && (
          <CameraCapture 
            onCapture={handleCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>

      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="text-xl font-black text-zinc-900">Criar Novo Anúncio</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Image Upload Area */}
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> Mídia do Anúncio
            </label>
            
            <div 
              className={`aspect-video bg-zinc-100 rounded-3xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center gap-4 group relative overflow-hidden transition-all ${isPhotosBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-500 hover:bg-zinc-50'}`}
            >
              {formData.imageUrl ? (
                <>
                  {formData.imageUrl.startsWith('blob:') || (formData.imageUrl.includes('video') && formData.imageUrl.startsWith('data:')) ? (
                    <video src={formData.imageUrl} autoPlay loop muted className="w-full h-full object-cover" />
                  ) : (
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3">
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="p-3 bg-white rounded-full text-zinc-900 hover:scale-110 transition-transform shadow-xl"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-white rounded-full text-zinc-900 hover:scale-110 transition-transform shadow-xl"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-white font-bold text-xs">Alterar Mídia</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                    <Check className="w-5 h-5" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-6 p-8 text-center">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPhotosBlocked) {
                          alert('Seu acesso a fotos está temporariamente bloqueado.');
                          return;
                        }
                        setShowCamera(true);
                      }}
                      className="flex flex-col items-center gap-2 group/btn"
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover/btn:scale-110 group-hover/btn:shadow-md transition-all border border-zinc-200">
                        <Camera className="w-8 h-8 text-purple-600" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Câmera</span>
                    </button>

                    <div className="w-[1px] h-16 bg-zinc-200 self-center" />

                    <button
                      type="button"
                      onClick={() => {
                        if (isPhotosBlocked) {
                          alert('Seu acesso a fotos está temporariamente bloqueado.');
                          return;
                        }
                        fileInputRef.current?.click();
                      }}
                      className="flex flex-col items-center gap-2 group/btn"
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover/btn:scale-110 group-hover/btn:shadow-md transition-all border border-zinc-200">
                        <ImageIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Galeria</span>
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-600">Adicione fotos ou vídeos do seu serviço</p>
                    <p className="text-[10px] text-zinc-400 font-medium max-w-[200px]">
                      Profissionais com fotos reais têm até <span className="text-emerald-500 font-bold">3x mais chances</span> de fechar negócio.
                    </p>
                  </div>
                </div>
              )}
              
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Type className="w-3.5 h-3.5" /> Título
              </label>
              <input
                required
                type="text"
                placeholder="Ex: iPhone 13 Pro Max"
                className="w-full px-4 py-3 bg-zinc-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Preço (R$)
              </label>
              <input
                required
                type="number"
                placeholder="0,00"
                className="w-full px-4 py-3 bg-zinc-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" /> Categoria
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(({ label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: label })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    formData.category === label
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-emerald-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Descrição
            </label>
            <textarea
              required
              rows={4}
              placeholder="Descreva seu produto ou serviço em detalhes..."
              className="w-full px-4 py-3 bg-zinc-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Localização
            </label>
            <input
              required
              type="text"
              placeholder="Cidade, Bairro ou Endereço"
              className="w-full px-4 py-3 bg-zinc-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={formData.location?.address}
              onChange={(e) => setFormData({ 
                ...formData, 
                location: { ...formData.location!, address: e.target.value } 
              })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" /> Palavras-chave (SEO)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.keywords?.map(tag => (
                <span key={tag} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => removeKeyword(tag)} className="hover:text-purple-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Pressione Enter para adicionar (ex: reforma, pintura)"
              className="w-full px-4 py-3 bg-zinc-100 rounded-xl border-none focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleAddKeyword}
            />
            <p className="text-[10px] text-zinc-400 font-medium">
              Adicione termos relacionados para que seu anúncio seja encontrado com mais facilidade.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-purple-100 active:scale-[0.98]"
            >
              Publicar Anúncio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
