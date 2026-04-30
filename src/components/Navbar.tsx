import React, { useState, useEffect } from 'react';
import { Search, User, Map as MapIcon, List, Shield, X, ArrowRight, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  appName: string;
  onSearch: (query: string) => void;
  onViewToggle: () => void;
  viewMode: 'list' | 'map';
  onProfileClick: () => void;
  onPostClick: () => void;
  onAdminClick: () => void;
  onOnboardingClick: () => void;
  isLoggedIn: boolean;
  liveCounter?: number;
  supabaseStatus?: 'connecting' | 'connected' | 'error';
}

export const Navbar: React.FC<NavbarProps> = ({
  appName,
  onSearch,
  onViewToggle,
  viewMode,
  onProfileClick,
  onPostClick,
  onAdminClick,
  onOnboardingClick,
  isLoggedIn,
  liveCounter,
  supabaseStatus,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-3 sm:px-6 py-2 sm:py-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 sm:gap-6 w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="relative w-8 h-8 sm:w-16 sm:h-16 overflow-hidden rounded-lg sm:rounded-[1.5rem] shadow-2xl transition-transform group-hover:scale-110 border-2 border-purple-200">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=200&auto=format&fit=crop" 
                alt="BuscaPro Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent" />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-baseline gap-0.5">
                <span className="text-sm sm:text-4xl font-black tracking-tighter text-zinc-900 uppercase italic leading-none">
                  Busca
                </span>
                <span className="text-sm sm:text-4xl font-black tracking-tighter text-purple-600 uppercase italic leading-none">
                  Pro
                </span>
              </div>
              <span 
                className="text-[5px] sm:text-[11px] font-black tracking-[0.1em] sm:tracking-[0.4em] uppercase text-zinc-500 mt-0.5 sm:mt-1 whitespace-nowrap"
              >
                Alto Padrão
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar - Responsive width */}
        <div className={cn(
          "flex-1 max-w-[60px] xs:max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-md relative group transition-all duration-300",
          isFocused ? "scale-[1.02] max-w-none sm:max-w-md z-[60] fixed inset-x-2 top-2 bg-white rounded-2xl p-1 shadow-2xl sm:relative sm:inset-auto sm:p-0 sm:shadow-none" : ""
        )}>
          <div className={cn(
            "flex items-center bg-zinc-100 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 overflow-hidden h-9 sm:h-12",
            isFocused ? "border-purple-500 bg-white shadow-lg ring-4 ring-purple-500/10" : "border-transparent"
          )}>
            <div className="pl-2 sm:pl-4">
              <Search className={cn(
                "w-3.5 h-3.5 sm:w-5 h-5 transition-colors duration-300",
                isFocused ? "text-purple-500" : "text-zinc-400"
              )} />
            </div>
            <input
              type="text"
              value={searchValue}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Procurar..."
              className="flex-1 pl-1.5 sm:pl-3 pr-2 sm:pr-4 py-1 sm:py-2.5 bg-transparent border-none outline-none text-[9px] sm:text-sm text-zinc-800 font-medium placeholder:text-zinc-400 min-w-0"
              onChange={handleChange}
            />
            {searchValue && (
              <button 
                onClick={handleClear}
                className="p-1 sm:p-2 mr-1 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3 h-3 sm:w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Actions - Desktop & Mobile Toggle */}
        <div className="flex items-center gap-1 sm:gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={onViewToggle}
              className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-600"
              title={viewMode === 'list' ? 'Ver no Mapa' : 'Ver em Lista'}
            >
              {viewMode === 'list' ? <MapIcon className="w-5 h-5" /> : <List className="w-5 h-5" />}
            </button>
            
            {/* Post button removed per user request */}

            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onProfileClick}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 px-3 py-2"
                >
                  Entrar
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openRegistration'))}
                  className="bg-zinc-900 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
                >
                  Cadastrar
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onAdminClick}
                  className="p-2 hover:bg-purple-50 rounded-xl transition-colors text-purple-600"
                  title="Painel de Manutenção"
                >
                  <Shield className="w-5 h-5" />
                </button>

                <button
                  onClick={onProfileClick}
                  className="flex items-center gap-2 p-2 hover:bg-zinc-100 rounded-xl transition-all active:scale-95 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center relative">
                    <User className="w-5 h-5 text-zinc-600 group-hover:text-purple-600 transition-colors" />
                    {supabaseStatus === 'connected' && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-sm" title="Supabase Conectado" />
                    )}
                    {supabaseStatus === 'connecting' && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white animate-bounce" title="Conectando ao Supabase..." />
                    )}
                    {supabaseStatus === 'error' && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" title="Erro na conexão Supabase" />
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                    Meu Perfil
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Medium screen actions (Tablets) */}
          <div className="hidden sm:flex lg:hidden items-center gap-2">
            <button
              onClick={onProfileClick}
              className="p-2 bg-zinc-100 text-zinc-600 rounded-xl relative group"
            >
              <User className="w-5 h-5 group-hover:text-purple-600 transition-colors" />
              {supabaseStatus === 'connected' && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              )}
              {supabaseStatus === 'connecting' && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white animate-bounce" />
              )}
              {supabaseStatus === 'error' && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 sm:p-2 hover:bg-zinc-100 rounded-lg text-zinc-600"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 h-6" /> : <Menu className="w-5 h-5 sm:w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden bg-white border-t border-zinc-100 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <button
                onClick={() => {
                  onViewToggle();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 bg-zinc-50 rounded-xl font-bold text-zinc-700"
              >
                {viewMode === 'list' ? <MapIcon className="w-5 h-5" /> : <List className="w-5 h-5" />}
                {viewMode === 'list' ? 'Ver no Mapa' : 'Ver em Lista'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                {!isLoggedIn ? (
                  <>
                    <button
                      onClick={() => {
                        onProfileClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 bg-zinc-100 text-zinc-600 rounded-xl font-black text-[10px] uppercase tracking-widest"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('openRegistration'));
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 bg-zinc-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
                    >
                      Cadastrar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onAdminClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 bg-purple-50 text-purple-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </button>
                    <button
                      onClick={() => {
                        onProfileClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 bg-zinc-100 text-zinc-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 relative"
                    >
                      <User className="w-4 h-4" />
                      Meu Perfil
                      {supabaseStatus === 'connected' && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                      )}
                      {supabaseStatus === 'connecting' && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full border-2 border-white animate-bounce" />
                      )}
                      {supabaseStatus === 'error' && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
