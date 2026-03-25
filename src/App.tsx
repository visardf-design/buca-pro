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
import { Search, PlusCircle, User, Star, Shield, MapPin, X, ArrowRight, RefreshCw } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, query, orderBy, getDoc, getDocFromServer, deleteDoc } from 'firebase/firestore';
import { seedDatabase } from './services/seedService';

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

  // Test connection to Firestore
  useEffect(() => {
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

  // Seed Database
  useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'admin') {
      seedDatabase();
    }
  }, [isLoggedIn, currentUser]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setCurrentUser(userData);
          setIsLoggedIn(true);
        } else if (user.email === 'VISARDF@gmail.com') {
          // Bootstrap admin case: user exists in Auth but not yet in Firestore
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
          // Optionally create the document now
          setDoc(doc(db, 'users', user.uid), bootstrapAdmin).catch(err => 
            handleFirestoreError(err, 'write', 'users/' + user.uid)
          );
        } else {
          // If user exists in Auth but not in Firestore, they might be new
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Sync: Settings
  useEffect(() => {
    const path = 'settings/global';
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setAppSettings(snapshot.data() as AppSettings);
      } else if (isLoggedIn && currentUser?.role === 'admin') {
        // Only initialize settings if they don't exist AND user is an admin
        setDoc(doc(db, 'settings', 'global'), INITIAL_APP_SETTINGS).catch(err => 
          handleFirestoreError(err, 'write', path)
        );
      }
    }, (error) => {
      handleFirestoreError(error, 'get', path);
    });
    return () => unsubscribe();
  }, [isLoggedIn, currentUser]);

  // Firestore Sync: Ads
  useEffect(() => {
    const path = 'ads';
    const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsData = snapshot.docs.map(doc => doc.data() as Ad);
      setAds(adsData);
    }, (error) => {
      handleFirestoreError(error, 'list', path);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Sync: Users
  useEffect(() => {
    const path = 'users';
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(usersData);
    }, (error) => {
      handleFirestoreError(error, 'list', path);
    });
    return () => unsubscribe();
  }, []);

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
      // For demo, we'll check if the recipient's UID is in the blockedChatIds (simulated)
      if (currentUser?.blockedChatIds?.includes(recipient.uid)) {
        alert('Esta conversa específica foi bloqueada pela administração.');
        return;
      }
      setActiveChat(recipient);
    };
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, [currentUser?.blockedFeatures, isLoggedIn]);

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
      await setDoc(doc(db, 'ads', adId), newAd);
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
      await setDoc(doc(db, 'reviews', reviewId), newReview);
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
          <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl mx-auto flex items-center justify-center text-white">
                  <Shield className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">Acesso Restrito</h2>
                <p className="text-zinc-500 text-sm font-medium">Digite a senha administrativa</p>
              </div>

              <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAdminPasswordError(false);
                    }}
                    autoFocus
                    placeholder="Senha de Acesso"
                    className={`w-full p-4 bg-zinc-50 border-2 rounded-2xl outline-none transition-all font-bold text-center ${adminPasswordError ? 'border-red-500' : 'border-transparent focus:border-zinc-900'}`}
                  />
                  {adminPasswordError && (
                    <p className="text-red-500 text-[10px] font-black uppercase text-center animate-bounce">
                      Senha Incorreta
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAdminPasswordModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                  >
                    Entrar
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

      {appSettings.globalAlert && (
        <div 
          className="text-white py-2 px-4 text-center text-sm font-bold animate-pulse"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          {appSettings.globalAlert}
        </div>
      )}
      
      {/* Registration & Ad Banner */}
      <div className="bg-zinc-900 text-white overflow-hidden relative border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-1.5 gap-4">
          <div className="flex items-center gap-4 flex-1 w-full overflow-hidden">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-purple-400 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Publicidade
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
                <SimulatedAd brand="casa-do-construtor" />
                <SimulatedAd brand="campeao-da-construcao" />
                <SimulatedAd brand="castelo-forte" />
                <SimulatedAd brand="casa-do-construtor" />
                <SimulatedAd brand="campeao-da-construcao" />
                <SimulatedAd brand="castelo-forte" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold shrink-0">
            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
            <span className="opacity-60">Novo por aqui?</span>
            <button 
              onClick={() => setIsRegistering(true)} 
              className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full hover:bg-purple-600/30 transition-all border border-purple-500/30"
            >
              Cadastre-se com CPF/CNPJ
            </button>
          </div>
        </div>
      </div>

      {/* Professional Call to Action Banner */}
      <div className="bg-white border-b border-zinc-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 flex flex-row items-center gap-2 sm:gap-4">
          {/* Banner Verificado (Metade do comprimento) */}
          <div className="w-1/2 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-1.5 sm:p-2 border border-purple-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1 sm:p-2 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Star className="w-4 h-4 sm:w-8 sm:h-8 text-purple-600 fill-purple-600" />
            </div>
            
            <div className="relative flex items-center justify-start gap-1.5 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-3">
                <div className="inline-flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm">
                  <Shield className="w-2.5 h-2.5" /> Verificado
                </div>
                <h2 className="text-[9px] sm:text-xs font-black text-zinc-900 tracking-tight leading-tight whitespace-nowrap">
                  Seja qualificada
                  <span className="hidden sm:inline-flex items-center gap-0.5 ml-1.5">
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </span>
                </h2>
              </div>

              <button 
                onClick={() => setIsRegistering(true)}
                className="bg-zinc-900 text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded-md font-black text-[7px] sm:text-[9px] hover:bg-zinc-800 transition-all shadow-sm active:scale-95 shrink-0"
              >
                Validar
              </button>
            </div>
          </div>

          {/* Como Funciona (Destaque colorido e piscando) */}
          <div className="w-1/2 flex items-center justify-center">
            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-all active:scale-95 group shadow-sm w-full justify-center"
            >
              <span className="text-[8px] sm:text-xs font-black uppercase tracking-tighter sm:tracking-widest bg-gradient-to-r from-blue-600 via-purple-600 via-pink-500 via-red-500 via-yellow-500 via-green-500 to-blue-600 bg-clip-text text-transparent animate-rainbow bg-[length:200%_auto] animate-blink">
                Como Funciona
              </span>
              <ArrowRight className="w-2 h-2 sm:w-3 sm:h-3 text-purple-600" />
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
                await setDoc(doc(db, 'settings', 'global'), updates, { merge: true });
              } catch (error) {
                console.error("Error updating settings:", error);
              }
            }}
            categories={categories}
            onUpdateCategories={async (newCategories) => {
              try {
                await setDoc(doc(db, 'settings', 'categories'), { list: newCategories });
                setCategories(newCategories);
              } catch (error) {
                console.error("Error updating categories:", error);
              }
            }}
            users={users}
            onUpdateUsers={async (updatedUsers) => {
              try {
                // For now we update each user document. In a larger app, use batch writes.
                for (const user of updatedUsers) {
                  await setDoc(doc(db, 'users', user.uid), user);
                }
              } catch (error) {
                console.error("Error updating users:", error);
              }
            }}
            onDeleteUser={async (uid) => {
              try {
                // Delete user document
                await deleteDoc(doc(db, 'users', uid));
                // Delete user's ads
                const userAds = ads.filter(ad => ad.sellerId === uid);
                for (const ad of userAds) {
                  await deleteDoc(doc(db, 'ads', ad.id));
                }
                // Delete user's reviews
                const userReviews = reviews.filter(rev => rev.reviewerId === uid || rev.targetUserId === uid);
                for (const rev of userReviews) {
                  await deleteDoc(doc(db, 'reviews', rev.id));
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
        <button onClick={() => setIsPosting(true)} className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg -mt-8 border-4 border-white"><PlusCircle className="w-6 h-6" /></button>
        <button onClick={() => setViewingProfile(currentUser || null)} className="p-2 text-zinc-400"><User className="w-6 h-6" /></button>
      </div>
    </div>
  );
}


