import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Key, Globe, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, key: string) => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose, onSave }) => {
  const [url, setUrl] = useState(localStorage.getItem('SUPABASE_LOCAL_URL') || '');
  const [key, setKey] = useState(localStorage.getItem('SUPABASE_LOCAL_KEY') || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!url || !key) return;
    localStorage.setItem('SUPABASE_LOCAL_URL', url);
    localStorage.setItem('SUPABASE_LOCAL_KEY', key);
    setIsSaved(true);
    onSave(url, key);
    
    setTimeout(() => {
      setIsSaved(false);
      window.location.reload(); // Recarregar para aplicar as novas credenciais
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-200"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Configurar Supabase</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Conexão com Banco de Dados</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-200 rounded-lg transition-colors"
                id="close-setup-modal"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2 text-sm text-zinc-600 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <div className="flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Insira as credenciais que você obteve no painel do <strong>Supabase</strong> (Project Settings → API).
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">URL do Projeto</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder="https://sua-url.supabase.co"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono text-xs"
                      id="supabase-url-input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Chave Anon Key</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="password"
                      placeholder="sua-chave-anon-publica"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono text-xs"
                      id="supabase-key-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-50 border-t border-zinc-100">
              <button
                onClick={handleSave}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg",
                  isSaved 
                    ? "bg-emerald-500 text-white shadow-emerald-200" 
                    : "bg-zinc-900 text-white shadow-zinc-200 hover:bg-zinc-800"
                )}
                id="save-supabase-config"
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Configuração Salva!
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Aplicar Configurações
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
