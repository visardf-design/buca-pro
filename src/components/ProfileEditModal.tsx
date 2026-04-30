import React, { useState } from 'react';
import { UserProfile, PortfolioItem } from '../types';
import { X, Camera, Phone, MessageCircle, Instagram, Image as ImageIcon, Trash2, Plus, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ProfileEditModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: user.displayName,
    description: user.description || '',
    phone: user.phone || '',
    phone2: user.phone2 || '',
    whatsapp: user.whatsapp || '',
    whatsapp2: user.whatsapp2 || '',
    instagram: user.instagram || '',
    photoURL: user.photoURL || '',
    portfolioPhotos: user.portfolioPhotos || [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const handleAddPhoto = () => {
    if ((formData.portfolioPhotos?.length || 0) < 6) {
      const newPhotos = [...(formData.portfolioPhotos || []), { url: '', description: '' }];
      setFormData({ ...formData, portfolioPhotos: newPhotos });
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...(formData.portfolioPhotos || [])];
    newPhotos.splice(index, 1);
    setFormData({ ...formData, portfolioPhotos: newPhotos });
  };

  const handlePhotoChange = (index: number, field: keyof PortfolioItem, value: string) => {
    const newPhotos = [...(formData.portfolioPhotos || [])];
    newPhotos[index] = { ...newPhotos[index], [field]: value };
    setFormData({ ...formData, portfolioPhotos: newPhotos });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Editar Perfil</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Personalize sua presença Pro</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-200 rounded-lg transition-colors"
                disabled={isSaving}
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <img 
                    src={formData.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop'} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-[2rem] object-cover border-4 border-white shadow-xl group-hover:opacity-75 transition-all"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                    <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="w-full max-w-xs space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">URL da Foto de Perfil</label>
                  <input 
                    type="text"
                    value={formData.photoURL}
                    onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
                    placeholder="https://exemplo.com/suafoto.jpg"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-xs font-medium"
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nome de Exibição</label>
                  <input 
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Instagram (@usuario)</label>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => setFormData({...formData, instagram: e.target.value.replace('@', '')})}
                      placeholder="seu.insta"
                      className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Descrição Profissional</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium text-sm"
                  placeholder="Conte um pouco sobre sua experiência e especialidades..."
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">Contatos Reais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Telefone Principal</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="(00) 00000-0000"
                          className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Telefone Secundário</label>
                      <div className="relative text-zinc-400">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                        <input 
                          type="text"
                          value={formData.phone2}
                          onChange={(e) => setFormData({...formData, phone2: e.target.value})}
                          placeholder="(00) 00000-0000"
                          className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">WhatsApp Principal</label>
                      <div className="relative">
                        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        <input 
                          type="text"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                          placeholder="5511999999999"
                          className="w-full pl-11 pr-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">WhatsApp Secundário</label>
                      <div className="relative">
                        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 opacity-50" />
                        <input 
                          type="text"
                          value={formData.whatsapp2}
                          onChange={(e) => setFormData({...formData, whatsapp2: e.target.value})}
                          placeholder="5511999999999"
                          className="w-full pl-11 pr-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Portfolio (Máx 6 Fotos)</h4>
                  <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{formData.portfolioPhotos?.length || 0}/6</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.portfolioPhotos?.map((item, index) => (
                    <div key={index} className="relative group aspect-square">
                      {item.url ? (
                        <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-zinc-100 shadow-sm">
                          <img src={item.url} alt={`Portfolio ${index}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all">
                            <p className="text-[9px] text-white font-medium truncate">{item.description || 'Sem descrição'}</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-95 z-20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setActivePhotoIndex(index)}
                            className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-all z-10"
                            title="Editar descrição"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActivePhotoIndex(index)}
                          className="w-full h-full border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 hover:border-purple-300 transition-all group"
                        >
                          <div className="p-2 bg-zinc-100 rounded-xl group-hover:bg-purple-100 transition-colors">
                            <ImageIcon className="w-5 h-5 text-zinc-400 group-hover:text-purple-600" />
                          </div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase group-hover:text-purple-600">Adicionar</span>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {(formData.portfolioPhotos?.length || 0) < 6 && (
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      className="aspect-square border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 hover:border-purple-300 transition-all group"
                    >
                      <Plus className="w-6 h-6 text-zinc-300 group-hover:text-purple-600 transition-all" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-purple-600">Nova Foto</span>
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-white border border-zinc-200 rounded-2xl font-black text-xs uppercase tracking-widest text-zinc-600 hover:bg-zinc-100 transition-all active:scale-[0.98]"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-200 flex items-center justify-center gap-2 hover:bg-purple-700 transition-all active:scale-[0.98]"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Photo Manager Sub-Modal */}
      <AnimatePresence>
        {activePhotoIndex !== null && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl space-y-6"
            >
              <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900">Editar Foto do Portfolio</h4>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">URL da Imagem</label>
                  <input 
                    type="text"
                    value={formData.portfolioPhotos?.[activePhotoIndex]?.url || ''}
                    onChange={(e) => handlePhotoChange(activePhotoIndex, 'url', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-purple-500 transition-all text-xs"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Descrição Opcional</label>
                  <input 
                    type="text"
                    value={formData.portfolioPhotos?.[activePhotoIndex]?.description || ''}
                    onChange={(e) => handlePhotoChange(activePhotoIndex, 'description', e.target.value)}
                    placeholder="Ex: Reforma de telhado concluída na Z. Leste"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-purple-500 transition-all text-xs"
                  />
                </div>
              </div>

              <button 
                onClick={() => setActivePhotoIndex(null)}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all"
              >
                Concluido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
