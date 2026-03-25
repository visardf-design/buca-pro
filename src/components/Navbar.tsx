import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, User, Map as MapIcon, List, Shield, X, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

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
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-2 sm:px-4 py-2 sm:py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 overflow-hidden rounded-2xl sm:rounded-[1.5rem] shadow-2xl transition-transform group-hover:scale-110 border-2 border-purple-200">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=200&auto=format&fit=crop" 
                alt="BuscaPro Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-1 left-1 right-1 flex justify-center">
                <div className="w-full h-0.5 bg-purple-400 rounded-full opacity-50" />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl sm:text-4xl font-black tracking-tighter text-zinc-900 uppercase italic leading-none">
                  Busca
                </span>
                <span className="text-xl sm:text-4xl font-black tracking-tighter text-purple-600 uppercase italic leading-none">
                  Pro
                </span>
              </div>
              <span 
                className="text-[7px] sm:text-[11px] font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase text-zinc-500 mt-1"
              >
                Construção de Alto Padrão
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={cn(
          "flex-1 max-w-[60px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-md relative group transition-all duration-300",
          isFocused ? "scale-[1.02] max-w-none sm:max-w-md" : ""
        )}>
          <div className={cn(
            "flex items-center bg-zinc-100 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
            isFocused ? "border-purple-500 bg-white shadow-lg ring-4 ring-purple-500/10" : "border-transparent"
          )}>
            <div className="pl-2 sm:pl-4 hidden sm:block">
              <Search className={cn(
                "w-5 h-5 transition-colors duration-300",
                isFocused ? "text-purple-500" : "text-zinc-400"
              )} />
            </div>
            <input
              type="text"
              value={searchValue}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="O que você está procurando?"
              className="flex-1 pl-2 sm:pl-3 pr-2 sm:pr-4 py-2 sm:py-2.5 bg-transparent border-none outline-none text-[10px] sm:text-sm text-zinc-800 font-medium placeholder:text-zinc-400"
              onChange={handleChange}
            />
            {searchValue && (
              <button 
                onClick={handleClear}
                className="p-2 mr-1 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button 
              className={cn(
                "px-1 sm:px-4 py-1.5 sm:py-2.5 font-black text-[7px] sm:text-xs uppercase tracking-tighter sm:tracking-widest transition-all duration-300 flex items-center gap-0 sm:gap-2 shrink-0",
                isFocused ? "bg-purple-600 text-white" : "bg-zinc-200 text-zinc-500"
              )}
            >
              <span className="font-black">Buscar</span>
              <ArrowRight className="w-1.5 h-1.5 sm:w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-4">
          <button
            onClick={onViewToggle}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-600"
            title={viewMode === 'list' ? 'Ver no Mapa' : 'Ver em Lista'}
          >
            {viewMode === 'list' ? <MapIcon className="w-6 h-6" /> : <List className="w-6 h-6" />}
          </button>
          
          <button
            onClick={onPostClick}
            className="flex items-center gap-1 sm:gap-2 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium hover:opacity-90 transition-all shadow-md active:scale-95"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <PlusCircle className="w-4 h-4 sm:w-5 h-5" />
            <span className="hidden md:block">Anunciar</span>
          </button>

          <button
            onClick={onAdminClick}
            className="p-2 hover:bg-purple-50 rounded-xl transition-colors text-purple-600 hidden sm:flex"
            title="Painel de Manutenção"
          >
            <Shield className="w-6 h-6" />
          </button>

          <button
            onClick={onProfileClick}
            className="flex flex-col items-center gap-1 p-2 hover:bg-zinc-100 rounded-xl transition-all active:scale-95 group"
          >
            <User className="w-6 h-6 text-zinc-600 group-hover:text-purple-600 transition-colors" />
            <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-tighter sm:tracking-widest bg-gradient-to-r from-blue-600 via-purple-600 via-pink-500 via-red-500 via-yellow-500 via-green-500 to-blue-600 bg-clip-text text-transparent animate-rainbow bg-[length:200%_auto]">
              {isLoggedIn ? 'Perfil' : 'Entrar'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
