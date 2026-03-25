import React, { useState } from 'react';
import { UserProfile, Ad, Review, ServicePortfolio } from '../types';
import { Star, MapPin, Calendar, Package, CheckCircle, Video, Play, Camera, Plus, Share2, MessageSquare, Phone, ShieldCheck, Info, Award, Instagram, MessageCircle, ExternalLink, Heart, Settings, Edit3, Trash2, Eye, EyeOff, Lightbulb, ArrowRight } from 'lucide-react';
import { AdCard } from './AdCard';
import { PortfolioDetail } from './PortfolioDetail';
import { CameraCapture } from './CameraCapture';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../lib/utils';

interface UserProfileViewProps {
  user: UserProfile;
  currentUser: UserProfile;
  ads: Ad[];
  reviews: Review[];
  onAdClick: (ad: Ad) => void;
  onMessageClick: (user: UserProfile) => void;
  onUpdateAdStatus?: (adId: string, status: 'active' | 'completed') => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  currentUser,
  ads,
  reviews,
  onAdClick,
  onMessageClick,
  onUpdateAdStatus,
  onUpdateProfile,
}) => {
  const isOwnProfile = user.uid === currentUser.uid;
  const [selectedService, setSelectedService] = useState<ServicePortfolio | null>(null);
  const [activeTab, setActiveTab] = useState<'ads' | 'portfolio' | 'delivery' | 'reviews' | 'manage'>(isOwnProfile ? 'manage' : 'ads');
  const [showCamera, setShowCamera] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [deliveries, setDeliveries] = useState([
    {
      id: 'd1',
      title: 'Finalização de Pintura - Apto 402',
      description: 'Entrega final do serviço de pintura e acabamento.',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&h=600&auto=format&fit=crop' }
      ]
    }
  ]);

  const activeAds = ads.filter(ad => ad.status === 'active' && !user.blockedAdIds?.includes(ad.id));
  const completedAds = ads.filter(ad => ad.status === 'completed' && !user.blockedAdIds?.includes(ad.id));
  const filteredPortfolio = user.portfolio?.filter(p => !user.blockedPhotoIds?.includes(p.id)) || [];
  const filteredReviews = reviews.filter(r => !user.blockedReviewIds?.includes(r.id));

  const handleDeliveryCapture = (data: string, type: 'image' | 'video') => {
    const newDelivery = {
      id: Date.now().toString(),
      title: `Entrega de Serviço - ${format(new Date(), 'dd/MM/yyyy')}`,
      description: type === 'image' ? 'Serviço concluído e registrado em tempo real.' : 'Vídeo da entrega do serviço em tempo real.',
      media: [{ type, url: data }]
    };
    setDeliveries([newDelivery, ...deliveries]);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${user.displayName} no Busca Pro`,
        text: user.description,
        url: window.location.href,
      }).catch(() => {
        // Fallback if share fails or is cancelled
        copyToClipboard();
      });
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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <AnimatePresence>
        {showCamera && (
          <CameraCapture 
            onCapture={handleDeliveryCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>

      {/* Profile Header Card */}
      <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-purple-500/5 overflow-hidden">
        {/* Cover Image Placeholder */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "p-2 backdrop-blur-md rounded-full transition-all shadow-lg",
                isLiked 
                  ? "bg-red-500 text-white" 
                  : "bg-white/20 hover:bg-white/30 text-white"
              )}
              title={isLiked ? "Descurtir Perfil" : "Curtir Perfil"}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full text-white transition-all shadow-lg"
              title="Compartilhar Perfil"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          
          <AnimatePresence>
            {showShareToast && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl z-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Link copiado para o perfil!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 pb-8 -mt-16 sm:-mt-20 relative">
          <div className="flex flex-col md:flex-row gap-6 items-end md:items-center">
            <div className="relative shrink-0">
              <img
                src={user.photoURL || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop`}
                alt={user.displayName}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] object-cover border-8 border-white shadow-2xl"
                referrerPolicy="no-referrer"
              />
              {user.role === 'professional' && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-white shadow-lg" title="Profissional Verificado">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center md:text-left pt-4 md:pt-12">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">{user.displayName}</h1>
                {user.plan === 'premium' && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest self-center md:self-auto">
                    <Award className="w-3 h-3" /> Premium
                  </span>
                )}
              </div>
              
              {user.role === 'professional' && user.category && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200">
                    {user.category}
                  </span>
                  {user.category === 'Ajudante' && user.helperSpecialty && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">
                      {user.helperSpecialty}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-zinc-500 font-medium">
                <span className="text-purple-600 font-bold">@{user.username}</span>
                <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold text-sm">
                  <Star className="w-4 h-4 fill-purple-700" />
                  <span>{user.rating.toFixed(1)}</span>
                  <span className="text-purple-400 font-normal ml-1">({user.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Membro desde {format(user.createdAt, 'MMMM yyyy', { locale: ptBR })}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto pt-4 md:pt-12">
              <button 
                onClick={() => onMessageClick(user)}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95"
              >
                <MessageSquare className="w-5 h-5" />
                Chat Pro
              </button>
              
              {user.whatsapp && (
                <a 
                  href={`https://wa.me/${user.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              )}

              {user.phone && (
                <a 
                  href={`tel:${user.phone.replace(/\D/g, '')}`}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-white border-2 border-zinc-100 text-zinc-900 px-6 py-3 rounded-2xl font-black text-sm hover:bg-zinc-50 transition-all active:scale-95"
                >
                  <Phone className="w-5 h-5" />
                  Ligar
                </a>
              )}

              {user.instagram && (
                <a 
                  href={`https://instagram.com/${user.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-orange-100"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-8 p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> Sobre o Profissional
            </h3>
            <p className="text-zinc-700 leading-relaxed font-medium">
              {user.description || 'Este usuário ainda não adicionou uma descrição detalhada sobre seus serviços.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Stats */}
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Estatísticas</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-zinc-600">Anúncios</span>
                </div>
                <span className="text-lg font-black text-zinc-900">{activeAds.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-zinc-600">Concluídos</span>
                </div>
                <span className="text-lg font-black text-zinc-900">{completedAds.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-zinc-600">Avaliações</span>
                </div>
                <span className="text-lg font-black text-zinc-900">{user.reviewCount}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100 space-y-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[10px] font-bold text-amber-800 leading-tight">
                  Seja mais uma profissional com qualificação validada 5 estrelas e tenha mais valor para seu cliente.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Disponível para novos serviços
              </div>
              {user.role === 'professional' && (
                <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Identidade Verificada</p>
                    <p className="text-[9px] text-emerald-600 leading-tight">Documentos validados pelo Busca Pro para sua segurança.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
            <div className="flex items-center px-2 pt-2 border-b border-zinc-100 overflow-x-auto no-scrollbar">
              <TabButton 
                active={activeTab === 'ads'} 
                onClick={() => setActiveTab('ads')} 
                label="Anúncios" 
                count={activeAds.length}
              />
              {isOwnProfile && (
                <TabButton 
                  active={activeTab === 'manage'} 
                  onClick={() => setActiveTab('manage')} 
                  label="Gerenciar" 
                  count={ads.filter(a => a.sellerId === user.uid).length}
                />
              )}
              {user.portfolio && user.portfolio.length > 0 && (
                <TabButton 
                  active={activeTab === 'portfolio'} 
                  onClick={() => setActiveTab('portfolio')} 
                  label="Portfólio" 
                  count={user.portfolio.length}
                />
              )}
              {user.role === 'professional' && (
                <TabButton 
                  active={activeTab === 'delivery'} 
                  onClick={() => setActiveTab('delivery')} 
                  label="Entregas" 
                  count={deliveries.length}
                />
              )}
              <TabButton 
                active={activeTab === 'reviews'} 
                onClick={() => setActiveTab('reviews')} 
                label="Avaliações" 
                count={reviews.length}
              />
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'manage' && isOwnProfile && (
                  <motion.div
                    key="manage"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {/* Category Specific Tips */}
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-purple-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
                      <div className="relative flex items-start gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                          <Lightbulb className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-black uppercase tracking-tight">Dica para {user.category}</h3>
                          <p className="text-sm font-medium opacity-90 leading-relaxed">
                            {getCategoryTip(user.category || 'Outros')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ad Management List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Meus Anúncios</h3>
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Total: {ads.filter(a => a.sellerId === user.uid).length}</span>
                      </div>
                      
                      <div className="grid gap-4">
                        {ads.filter(a => a.sellerId === user.uid).map(ad => (
                          <div key={ad.id} className="bg-zinc-50 p-4 rounded-3xl border border-zinc-200 flex flex-col sm:flex-row items-center gap-4 group hover:bg-white hover:shadow-lg transition-all">
                            <img src={ad.imageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                            <div className="flex-1 min-w-0 text-center sm:text-left">
                              <h4 className="font-black text-zinc-900 truncate">{ad.title}</h4>
                              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-1">
                                <span className={cn(
                                  "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                                  ad.status === 'active' ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-zinc-200 text-zinc-600 border-zinc-300"
                                )}>
                                  {ad.status === 'active' ? 'Ativo' : 'Concluído'}
                                </span>
                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                                  {ad.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => onUpdateAdStatus?.(ad.id, ad.status === 'active' ? 'completed' : 'active')}
                                className="p-2 hover:bg-purple-50 rounded-xl text-purple-600 transition-colors"
                                title={ad.status === 'active' ? "Marcar como Concluído" : "Reativar Anúncio"}
                              >
                                {ad.status === 'active' ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                              <button className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-600 transition-colors">
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Profile Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button className="flex items-center justify-between p-6 bg-white border-2 border-zinc-100 rounded-[2rem] hover:border-purple-600 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <Settings className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">Editar Perfil</p>
                            <p className="text-[10px] font-bold text-zinc-400">Bio, fotos e contatos</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-purple-600 transition-all" />
                      </button>

                      <button className="flex items-center justify-between p-6 bg-white border-2 border-zinc-100 rounded-[2rem] hover:border-blue-600 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Award className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">Plano Premium</p>
                            <p className="text-[10px] font-bold text-zinc-400">Destaque seus anúncios</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-blue-600 transition-all" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ads' && (
                  <motion.div
                    key="ads"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    {activeAds.map(ad => (
                      <AdCard key={ad.id} ad={ad} onClick={onAdClick} />
                    ))}
                    {activeAds.length === 0 && (
                      <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="w-10 h-10 text-zinc-300" />
                        </div>
                        <p className="text-zinc-400 font-bold">Nenhum anúncio ativo no momento.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'portfolio' && (
                  <motion.div
                    key="portfolio"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    {filteredPortfolio.map((service) => (
                      <div 
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className="bg-zinc-50 rounded-3xl border border-zinc-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={service.images[0]} 
                            alt={service.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            {service.images.length} fotos
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="font-black text-zinc-900 text-lg line-clamp-1">{service.title}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-purple-600 text-sm font-black">
                              <Star className="w-4 h-4 fill-purple-600" />
                              <span>{service.rating}</span>
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ver Detalhes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'delivery' && (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <button 
                      onClick={() => setShowCamera(true)}
                      className="w-full py-6 bg-purple-50 border-2 border-dashed border-purple-200 rounded-[2rem] text-purple-600 font-black flex flex-col items-center justify-center gap-3 hover:bg-purple-100 transition-all group"
                    >
                      <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg">Registrar Nova Entrega</p>
                        <p className="text-xs font-bold opacity-60">Gere confiança com fotos em tempo real</p>
                      </div>
                    </button>

                    {deliveries.map(delivery => (
                      <div key={delivery.id} className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-black text-zinc-900 text-lg">{delivery.title}</h3>
                            <p className="text-sm text-zinc-500 font-medium">{delivery.description}</p>
                          </div>
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200">
                            Concluído
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {delivery.media.map((m, i) => (
                            <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer shadow-md">
                              <img 
                                src={m.url} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                alt="" 
                                referrerPolicy="no-referrer"
                              />
                              {m.type === 'video' && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                    <Play className="w-6 h-6 text-white fill-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {filteredReviews.map(review => (
                      <div key={review.id} className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-zinc-100 flex items-center justify-center font-black text-purple-600 shadow-sm">
                              {review.reviewerName[0]}
                            </div>
                            <div>
                              <p className="font-black text-zinc-900">{review.reviewerName}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={cn(
                                      "w-3.5 h-3.5",
                                      i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"
                                    )} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            {format(review.createdAt, 'dd MMM yyyy', { locale: ptBR })}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-2 top-0 text-4xl text-purple-200 font-serif opacity-50">"</div>
                          <p className="text-zinc-700 font-medium italic pl-4 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="w-10 h-10 text-zinc-300" />
                        </div>
                        <p className="text-zinc-400 font-bold">Ainda não há avaliações para este usuário.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <PortfolioDetail 
            service={selectedService} 
            onClose={() => setSelectedService(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label, count }) => (
  <button 
    onClick={onClick}
    className={cn(
      "px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative flex items-center gap-2 shrink-0",
      active ? "text-purple-600" : "text-zinc-400 hover:text-zinc-600"
    )}
  >
    {label}
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-black",
      active ? "bg-purple-100 text-purple-700" : "bg-zinc-100 text-zinc-500"
    )}>
      {count}
    </span>
    {active && (
      <motion.div 
        layoutId="activeTab" 
        className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-full" 
      />
    )}
  </button>
);

const getCategoryTip = (category: string): string => {
  const tips: Record<string, string> = {
    'Alvenaria e Estrutura': 'Destaque sua experiência com fundações e tipos de tijolos. Mencione se possui equipe própria.',
    'Elétrica': 'Sempre mencione certificações como NR10. Detalhe se faz desde pequenos reparos até quadros complexos.',
    'Pintura e Acabamento': 'Fale sobre os tipos de tintas que domina (epóxi, látex) e se faz efeitos decorativos como cimento queimado.',
    'Hidráulica': 'Mencione se possui equipamento de caça-vazamentos. Isso é um grande diferencial para clientes finais.',
    'Gesso e Drywall': 'Destaque fotos de sancas iluminadas. Clientes de gesso buscam muito pelo apelo visual do acabamento.',
    'Marcenaria': 'Detalhe os tipos de MDF e ferragens que utiliza. Mencione o prazo médio de entrega de projetos planejados.',
    'Arquitetura': 'Fale sobre seu estilo de design e se oferece acompanhamento de obra (RRT).',
    'Engenharia': 'Destaque sua especialidade (estrutural, elétrica, etc) e agilidade na emissão de ARTs.',
    'Ajudante': 'Mencione sua disposição física e se possui ferramentas básicas próprias (pá, picareta, etc).',
  };
  return tips[category] || 'Mantenha seu perfil atualizado com fotos reais de seus serviços para atrair mais clientes.';
};

