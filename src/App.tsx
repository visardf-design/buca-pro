/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { AdCard } from './components/AdCard';
import { MapView } from './components/MapView';
import { AdDetail } from './components/AdDetail';
import { UserProfileView } from './components/UserProfileView';
import { AdForm } from './components/AdForm';
import { ReviewForm } from './components/ReviewForm';
import { RegistrationForm } from './components/RegistrationForm';
import { ChatView } from './components/ChatView';
import { AdminDashboard } from './components/AdminDashboard';
import { GoogleAdSense } from './components/GoogleAdSense';
import { SimulatedAd } from './components/SimulatedAd';
import { OnboardingView } from './components/OnboardingView';
import { LoginModal } from './components/LoginModal';
import { Ad, Category, UserProfile, Review, AppSettings, UserFeature } from './types';
import { CATEGORIES, INITIAL_APP_SETTINGS } from './constants';
import { matchesSearch } from './services/searchService';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Star, Shield, MapPin, X, ArrowRight, RefreshCw } from 'lucide-react';
import { auth, db } from './firebase';
import { supabase } from './supabase';
import { supabaseService } from './services/supabaseService';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, query, orderBy, getDoc, getDocFromServer, deleteDoc } from 'firebase/firestore';
import { seedDatabase } from './services/seedService';

const USE_SUPABASE = !!import.meta.env.VITE_SUPABASE_URL;

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeChat, setActiveChat] = useState<UserProfile | null>(null);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(INITIAL_APP_SETTINGS);
  const [categories, setCategories] = useState<{ label: Category; icon: any }[]>(CATEGORIES);
  const [isReviewing, setIsReviewing] = useState<{ adTitle: string; sellerName: string; adId: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState(false);

  // Firestore Error Handling
  const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
      },
      operationType,
      path
    };
    console.error('Firestore Error:', JSON.stringify(errInfo, null, 2));
  };

  // Test connection to Firestore (only if not using Supabase)
  useEffect(() => {
    if (USE_SUPABASE) return;
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Sync Logic (Firebase or Supabase)
  useEffect(() => {
    if (USE_SUPABASE) {
      // Supabase Auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await supabaseService.getProfile(session.user.id);
          if (profile) {
            setCurrentUser(profile);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            setCurrentUser(null);
          }
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
        setIsAuthReady(true);
      });

      // Supabase Real-time (Simplified initial fetch)
      const fetchInitialData = async () => {
        const [initialAds, initialSettings, initialUsers] = await Promise.all([
          supabaseService.getAds(),
          supabaseService.getSettings(),
          supabaseService.getProfiles()
        ]);
        setAds(initialAds);
        setUsers(initialUsers);
        if (initialSettings) setAppSettings(initialSettings);
      };
      
      fetchInitialData();

      // Realtime listener for ads and profiles
      const adsSubscription = supabase
        .channel('public:ads')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, payload => {
          fetchInitialData();
        })
        .subscribe();
      
      const profilesSubscription = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
          fetchInitialData();
        })
        .subscribe();

      return () => {
        adsSubscription.unsubscribe();
        profilesSubscription.unsubscribe();
      };
    } else {
      // Firebase Auth Listener
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as UserProfile);
            setIsLoggedIn(true);
          } else if (user.email === 'VISARDF@gmail.com') {
            const bootstrapAdmin: UserProfile = {
              uid: user.uid,
              username: 'admin',
              displayName: 'Administrador',
              role: 'admin',
              createdAt: Date.now(),
              status: 'approved',
              plan: 'premium',
              rating: 5.0,
              reviewCount: 0
            };
            setCurrentUser(bootstrapAdmin);
            setIsLoggedIn(true);
            setDoc(doc(db, 'users', user.uid), bootstrapAdmin).catch(err => 
              handleFirestoreError(err, 'write', 'users/' + user.uid)
            );
          } else {
            setIsLoggedIn(false);
            setCurrentUser(null);
          }
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
        setIsAuthReady(true);
      });

      // Firebase Firestore Listeners
      const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
        if (snapshot.exists()) {
          setAppSettings(snapshot.data() as AppSettings);
        } else if (isLoggedIn && currentUser?.role === 'admin') {
          setDoc(doc(db, 'settings', 'global'), INITIAL_APP_SETTINGS).catch(err => 
            handleFirestoreError(err, 'write', 'settings/global')
          );
        }
      });

      const qAds = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
      const unsubscribeAds = onSnapshot(qAds, (snapshot) => {
        setAds(snapshot.docs.map(doc => doc.data() as Ad));
      });

      const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
      });

      return () => {
        unsubscribeAuth();
        unsubscribeSettings();
        unsubscribeAds();
        unsubscribeUsers();
      };
    }
  }, [isLoggedIn, currentUser]);

  // Seed Database
  useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'admin') {
      seedDatabase();
    }
  }, [isLoggedIn, currentUser]);

  const isFeatureBlocked = (feature: UserFeature) => {
    return currentUser?.blockedFeatures?.includes(feature);
  };

  const isCategoryBlocked = (category: Category) => {
    return currentUser?.blockedCategories?.includes(category);
  };

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      if (!isLoggedIn) {
        setIsLoginModalOpen(true);
        return;
      }
      const recipient = e.detail as UserProfile;
      if (isFeatureBlocked('chat')) {
        alert('Seu acesso ao chat está bloqueado.');
        return;
      }
      // Check for granular chat block (simulated check using recipient UID or a mock chat ID)
      if (currentUser?.blockedChatIds?.includes(recipient.uid)) {
        alert('Esta conversa específica foi bloqueada pela administração.');
        return;
      }
      setActiveChat(recipient);
    };

    const handleOpenRegistration = () => {
      setIsRegistering(true);
    };

    const handleOpenAdminAuth = () => {
      handleOnAdminClick();
    };

    window.addEventListener('openChat', handleOpenChat);
    window.addEventListener('openRegistration', handleOpenRegistration);
    window.addEventListener('openAdminAuth', handleOpenAdminAuth);
    return () => {
      window.removeEventListener('openChat', handleOpenChat);
      window.removeEventListener('openRegistration', handleOpenRegistration);
      window.removeEventListener('openAdminAuth', handleOpenAdminAuth);
    };
  }, [currentUser?.blockedFeatures, isLoggedIn, currentUser?.blockedChatIds]);

  // Filtered Data
  const filteredAds = useMemo(() => {
    const lQuery = locationQuery.toLowerCase().trim();
    
    return ads.filter(ad => {
      const seller = users.find(u => u.uid === ad.sellerId);
      
      // Admin sees everything, others only see approved sellers
      if (currentUser?.role !== 'admin' && seller?.status !== 'approved') return false;
      
      // Blocking logic
      if (seller?.blockedFeatures?.includes('ads')) return false;
      if (seller?.blockedAdIds?.includes(ad.id)) return false;
      if (seller?.blockedCategories?.includes(ad.category)) return false;

      // Search & Filters
      const isSearchMatch = matchesSearch(searchQuery, ad);
      const matchesLocation = !lQuery || ad.location.address.toLowerCase().includes(lQuery);
      const matchesCategory = !selectedCategory || ad.category === selectedCategory;
      
      return isSearchMatch && matchesLocation && matchesCategory;
    });
  }, [ads, users, selectedCategory, searchQuery, locationQuery, currentUser]);

  const filteredUsers = useMemo(() => {
    if (currentUser?.role === 'admin') return users;
    return users.filter(u => u.status === 'approved');
  }, [users, currentUser]);

  const handleSellerClick = (sellerId: string) => {
    const seller = filteredUsers.find(p => p.uid === sellerId);
    if (seller) {
      setViewingProfile(seller);
      setSelectedAd(null);
    }
  };

  useEffect(() => {
    // Simulate live counter fluctuation
    const interval = setInterval(() => {
      setAppSettings(prev => ({
        ...prev,
        liveCounterValue: Math.max(50, prev.liveCounterValue + (Math.random() > 0.5 ? 1 : -1))
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Apply dynamic colors
    document.documentElement.style.setProperty('--primary-color', appSettings.primaryColor);
    document.documentElement.style.setProperty('--accent-color', appSettings.accentColor);
  }, [appSettings.primaryColor, appSettings.accentColor]);

  const handlePostAd = async (newAdData: Partial<Ad>) => {
    if (!currentUser) {
      alert('Você precisa estar logado para postar anúncios.');
      return;
    }
    if (isFeatureBlocked('ads')) {
      alert('Você está bloqueado de postar novos anúncios.');
      return;
    }
    if (currentUser.status === 'pending') {
      alert('Seu perfil está aguardando aprovação administrativa. Você poderá postar anúncios assim que for aprovado.');
      return;
    }
    if (currentUser.status === 'rejected') {
      alert('Seu perfil foi rejeitado. Entre em contato com o suporte para mais informações.');
      return;
    }
    if (currentUser.status === 'pending') {
      alert('Seu perfil está aguardando aprovação administrativa. Você poderá postar anúncios assim que for aprovado.');
      return;
    }
    if (currentUser.status === 'rejected') {
      alert('Seu perfil foi rejeitado. Entre em contato com o suporte para mais informações.');
      return;
    }
    if (newAdData.category && isCategoryBlocked(newAdData.category)) {
      alert(`Você está bloqueado de postar na categoria ${newAdData.category}.`);
      return;
    }
    const adId = `ad-${Date.now()}`;
    const newAd: Ad = {
      id: adId,
      title: newAdData.title || 'Sem título',
      description: newAdData.description || '',
      price: newAdData.price || 0,
      category: newAdData.category || 'Outros',
      sellerId: currentUser.uid,
      sellerName: currentUser.displayName,
      location: newAdData.location || { lat: -23.5505, lng: -46.6333, address: 'São Paulo, SP' },
      status: 'active',
      createdAt: Date.now(),
      imageUrl: `https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&h=600&auto=format&fit=crop`,
    };
    
    try {
      if (USE_SUPABASE) {
        await supabaseService.createAd(newAd);
      } else {
        await setDoc(doc(db, 'ads', adId), newAd);
      }
      setIsPosting(false);
    } catch (error) {
      console.error("Error posting ad:", error);
      alert("Erro ao postar anúncio. Verifique sua conexão.");
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!isReviewing || !currentUser) return;
    if (isFeatureBlocked('reviews')) {
      alert('Seu acesso a avaliações está temporariamente bloqueado.');
      return;
    }
    
    const reviewId = `rev-${Date.now()}`;
    const newReview: Review = {
      id: reviewId,
      adId: isReviewing.adId,
      reviewerId: currentUser.uid,
      reviewerName: currentUser.displayName,
      targetUserId: ads.find(a => a.id === isReviewing.adId)?.sellerId || '',
      rating,
      comment,
      createdAt: Date.now(),
    };

    try {
      if (USE_SUPABASE) {
        await supabase.from('reviews').insert({
          id: reviewId,
          ad_id: newReview.adId,
          reviewer_id: newReview.reviewerId,
          reviewer_name: newReview.reviewerName,
          target_user_id: newReview.targetUserId,
          rating: newReview.rating,
          comment: newReview.comment,
          created_at: new Date(newReview.createdAt).toISOString()
        });
      } else {
        await setDoc(doc(db, 'reviews', reviewId), newReview);
      }
      setIsReviewing(null);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleRegistration = async (data: any) => {
    // This is handled by the RegistrationForm which now uses Firebase Auth
    console.log('Registration data received:', data);
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      // In a real app, you'd also delete from Auth via Admin SDK or Cloud Function
      // For now, we just delete from Firestore
      // await deleteDoc(doc(db, 'users', uid));
      // We'll implement this in AdminDashboard
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleOnAdminClick = () => {
    setIsAdminPasswordModalOpen(true);
    setAdminPasswordInput('');
    setAdminPasswordError(false);
  };

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin19843001') {
      setIsAdminPasswordModalOpen(false);
      setIsAdminDashboardOpen(true);
    } else {
      setAdminPasswordError(true);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <AnimatePresence>
        {isAdminPasswordModalOpen && (
          <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white w-full md:max-w-md h-[80vh] md:h-auto rounded-t-[3rem] md:rounded-[3rem] shadow-2xl p-8 md:p-12 space-y-8 flex flex-col justify-center"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-xl rotate-3">
                  <Shield className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900">Acesso Restrito</h2>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">Configurações de Elite</p>
                </div>
              </div>

              <form onSubmit={handleAdminPasswordSubmit} className="space-y-6">
                <div className="space-y-3">
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAdminPasswordError(false);
                    }}
                    autoFocus
                    placeholder="SENHA DE ACESSO"
                    className={`w-full p-5 bg-zinc-100 border-2 rounded-[2rem] outline-none transition-all font-black text-center text-lg placeholder:text-zinc-400 ${adminPasswordError ? 'border-red-500 animate-shake' : 'border-transparent focus:border-zinc-900 focus:bg-white'}`}
                  />
                  {adminPasswordError && (
                    <p className="text-red-600 text-[10px] font-black uppercase text-center tracking-widest">
                      Credenciais Inválidas
                    </p>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdminPasswordModalOpen(false)}
                    className="flex-1 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all"
                  >
                    Retroceder
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-zinc-900 text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-2xl shadow-zinc-300 active:scale-95"
                  >
                    Desbloquear
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isLoginModalOpen && !isLoggedIn && (
          <LoginModal 
            onLogin={() => {
              setIsLoggedIn(true);
              setIsLoginModalOpen(false);
            }} 
            onClose={() => setIsLoginModalOpen(false)}
            onSignUpClick={() => {
              setIsLoginModalOpen(false);
              setIsRegistering(true);
            }}
          />
        )}
      </AnimatePresence>

      <Navbar
        appName={appSettings.appName}
        viewMode={viewMode}
        onSearch={setSearchQuery}
        liveCounter={appSettings.showLiveCounter ? appSettings.liveCounterValue : undefined}
        onViewToggle={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
        isLoggedIn={isLoggedIn}
        onProfileClick={() => {
          if (!isLoggedIn) {
            setIsLoginModalOpen(true);
            return;
          }
          if (isFeatureBlocked('profile')) {
            alert('Seu acesso ao perfil está temporariamente bloqueado.');
            return;
          }
          setViewingProfile(currentUser);
        }}
        onPostClick={() => {
          if (!isLoggedIn) {
            setIsLoginModalOpen(true);
            return;
          }
          if (isFeatureBlocked('ads')) {
            alert('Você está bloqueado de postar novos anúncios.');
            return;
          }
          setIsPosting(true);
        }}
        onAdminClick={handleOnAdminClick}
        onOnboardingClick={() => setShowOnboarding(true)}
      />

      {isLoggedIn && currentUser?.status === 'pending' && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h4 className="font-black text-amber-900 text-sm tracking-tight uppercase">Perfil em Análise</h4>
              <p className="text-amber-700 text-xs font-medium">Seu cadastro foi recebido e está aguardando aprovação administrativa. Você poderá postar anúncios em breve!</p>
            </div>
          </div>
        </div>
      )}

      {/* Professional Call to Action Banner */}
      <div className="bg-white border-b border-zinc-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex flex-row items-center justify-center gap-3 sm:gap-8">
          {/* Banner Verificado - Reduced width */}
          <div className="w-fit bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-1.5 border border-purple-100 relative group">
            <div className="relative flex items-center gap-2">
              <div className="inline-flex items-center gap-1 bg-purple-600 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0">
                <Shield className="w-2.5 h-2.5" /> Verificado
              </div>
              <button 
                onClick={() => setIsRegistering(true)}
                className="bg-zinc-900 text-white px-2 py-1 rounded-md font-black text-[8px] hover:bg-zinc-800 transition-all active:scale-95 shrink-0"
              >
                Validar
              </button>
            </div>
          </div>

          {/* Como Funciona - Reduced width */}
          <div className="w-fit">
            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-all active:scale-95 group shadow-sm"
            >
              <span className="text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 via-purple-600 via-pink-500 via-red-500 via-yellow-500 via-green-500 to-blue-600 bg-clip-text text-transparent animate-rainbow bg-[length:200%_auto] animate-blink leading-none">
                Como Funciona
              </span>
              <ArrowRight className="w-2.5 h-2.5 text-purple-600" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto pb-20">
        <AnimatePresence mode="wait">
          {showOnboarding ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="pt-8 px-4">
                <button 
                  onClick={() => setShowOnboarding(false)}
                  className="mb-6 text-purple-600 font-bold flex items-center gap-2 hover:underline"
                >
                  ← Voltar para o Marketplace
                </button>
                <OnboardingView 
                  appName={appSettings.appName} 
                  onStart={() => setShowOnboarding(false)} 
                  steps={appSettings.onboardingSteps}
                />
              </div>
            </motion.div>
          ) : viewingProfile ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pt-8"
            >
              <button 
                onClick={() => setViewingProfile(null)}
                className="mb-6 ml-4 text-emerald-600 font-bold flex items-center gap-2 hover:underline"
              >
                ← Voltar para busca
              </button>
              <UserProfileView
                user={viewingProfile}
                currentUser={currentUser || undefined}
                ads={ads}
                reviews={reviews.filter(r => r.targetUserId === viewingProfile.uid)}
                onAdClick={setSelectedAd}
                onMessageClick={setActiveChat}
                onUpdateAdStatus={async (adId, status) => {
                  try {
                    await setDoc(doc(db, 'ads', adId), { status }, { merge: true });
                  } catch (error) {
                    console.error("Error updating ad status:", error);
                  }
                }}
                onUpdateProfile={async (updates) => {
                  if (!currentUser) return;
                  try {
                    await setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true });
                  } catch (error) {
                    console.error("Error updating profile:", error);
                  }
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CategoryBar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* Location Search Bar */}
              <div className="bg-white border-b border-zinc-100 p-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="relative flex-1 max-w-lg group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="Em qual cidade ou bairro?"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white transition-all outline-none text-zinc-800 font-medium"
                    />
                    {locationQuery && (
                      <button 
                        onClick={() => setLocationQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {(searchQuery || locationQuery || selectedCategory) && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setLocationQuery('');
                        setSelectedCategory(null);
                      }}
                      className="text-zinc-500 hover:text-purple-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-purple-50 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Limpar Filtros
                    </button>
                  )}
                </div>
              </div>

              {/* Live Stats Section */}
              <div className="max-w-7xl mx-auto px-4 pt-2">
                <div className="bg-zinc-900 rounded-full py-1.5 px-6 relative overflow-hidden shadow-md border border-white/5">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 blur-[40px] rounded-full -mr-12 -mt-12" />
                  
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[10px] font-black text-white tracking-tight uppercase">
                        Comunidade <span className="text-purple-400">Ativa</span>
                      </h2>
                    </div>

                    <div className="flex gap-4 sm:gap-6">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-black text-white tabular-nums">
                          {appSettings.liveCounterValue}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[6px] font-black text-emerald-400 uppercase tracking-widest">Online</span>
                        </div>
                      </div>
                      
                      <div className="w-[1px] h-3 bg-white/10 self-center" />

                      <div className="flex items-center gap-2">
                        <div className="text-xs font-black text-white tabular-nums">
                          {filteredAds.length}+
                        </div>
                        <div className="text-[6px] font-black text-zinc-500 uppercase tracking-widest">Anúncios</div>
                      </div>

                      <div className="w-[1px] h-3 bg-white/10 self-center" />

                      <div className="flex items-center gap-2">
                        <div className="text-xs font-black text-white tabular-nums">
                          {filteredUsers.length}+
                        </div>
                        <div className="text-[6px] font-black text-zinc-500 uppercase tracking-widest">Projetos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {viewMode === 'list' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAds.map(ad => (
                      <AdCard key={ad.id} ad={ad} onClick={setSelectedAd} />
                    ))}
                    {filteredAds.length === 0 && (
                      <div className="col-span-full py-20 text-center">
                        <p className="text-zinc-400 font-medium">Nenhum anúncio encontrado para sua busca.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <MapView ads={filteredAds} onAdClick={setSelectedAd} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedAd && (
          <AdDetail
            ad={selectedAd}
            onClose={() => setSelectedAd(null)}
            onSellerClick={handleSellerClick}
          />
        )}
        {isPosting && (
          <AdForm
            categories={categories}
            onClose={() => setIsPosting(false)}
            onSubmit={handlePostAd}
            isPhotosBlocked={isFeatureBlocked('photos')}
          />
        )}
        {isReviewing && (
          <ReviewForm
            adTitle={isReviewing.adTitle}
            sellerName={isReviewing.sellerName}
            onClose={() => setIsReviewing(null)}
            onSubmit={handleReviewSubmit}
          />
        )}
        {isRegistering && (
          <RegistrationForm
            onClose={() => setIsRegistering(false)}
            onSubmit={handleRegistration}
          />
        )}
        {activeChat && (
          <ChatView
            recipient={activeChat}
            onClose={() => setActiveChat(null)}
          />
        )}

        {isAdminDashboardOpen && (
          <AdminDashboard
            settings={appSettings}
            onUpdateSettings={async (updates) => {
              try {
                if (USE_SUPABASE) {
                  await supabaseService.updateSettings(updates);
                } else {
                  await setDoc(doc(db, 'settings', 'global'), updates, { merge: true });
                }
              } catch (error) {
                console.error("Error updating settings:", error);
              }
            }}
            categories={categories}
            onUpdateCategories={async (newCategories) => {
              try {
                if (USE_SUPABASE) {
                  await supabase.from('settings').upsert({ id: 'categories', data: JSON.stringify(newCategories) });
                } else {
                  await setDoc(doc(db, 'settings', 'categories'), { list: newCategories });
                }
                setCategories(newCategories);
              } catch (error) {
                console.error("Error updating categories:", error);
              }
            }}
            users={users}
            onUpdateUsers={async (updatedUsers) => {
              try {
                if (USE_SUPABASE) {
                  for (const user of updatedUsers) {
                    await supabaseService.updateProfile(user);
                  }
                } else {
                  for (const user of updatedUsers) {
                    await setDoc(doc(db, 'users', user.uid), user);
                  }
                }
              } catch (error) {
                console.error("Error updating users:", error);
              }
            }}
            onDeleteUser={async (uid) => {
              try {
                if (USE_SUPABASE) {
                  await supabase.from('profiles').delete().eq('id', uid);
                } else {
                  await deleteDoc(doc(db, 'users', uid));
                  const userAds = ads.filter(ad => ad.sellerId === uid);
                  for (const ad of userAds) {
                    await deleteDoc(doc(db, 'ads', ad.id));
                  }
                  const userReviews = reviews.filter(rev => rev.reviewerId === uid || rev.targetUserId === uid);
                  for (const rev of userReviews) {
                    await deleteDoc(doc(db, 'reviews', rev.id));
                  }
                }
              } catch (error) {
                console.error("Error deleting user and related data:", error);
              }
            }}
            ads={ads}
            reviews={reviews}
            onClose={() => setIsAdminDashboardOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button for Reviews (Demo purposes) */}
      {selectedAd && !isReviewing && currentUser && (
        <button
          onClick={() => setIsReviewing({ adTitle: selectedAd.title, sellerName: selectedAd.sellerName, adId: selectedAd.id })}
          className="fixed bottom-24 right-6 z-[110] bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full font-black shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Star className="w-5 h-5 fill-white" />
          Avaliar Vendedor
        </button>
      )}

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-3 flex justify-around items-center sm:hidden z-40">
        <button onClick={() => { setViewingProfile(null); setSelectedCategory(null); }} className="p-2 text-purple-600"><Search className="w-6 h-6" /></button>
        <button onClick={handleOnAdminClick} className="p-2 text-zinc-400"><Shield className="w-6 h-6" /></button>
        <button onClick={() => setViewingProfile(currentUser || null)} className="p-2 text-zinc-400"><User className="w-6 h-6" /></button>
      </div>
    </div>
  );
}


