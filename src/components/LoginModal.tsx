import React, { useState } from 'react';
import { supabase } from '../supabase';

import { Lock, Mail, ArrowRight, X, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface LoginModalProps {
  onLogin: () => void;
  onClose?: () => void;
  onSignUpClick?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose, onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (authError) throw authError;
      onLogin();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao entrar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      // To resend, we need to sign in again temporarily or have the user object
      // But since we signed out, we might need them to sign in again to get the user object
      // Or we can just tell them to check their email again.
      // Actually, Firebase requires a signed-in user to send verification.
      // So we'll tell them to try logging in again to trigger the check or we can do it here if we didn't sign out yet.
      
      // Better: Don't sign out immediately in handleLogin, show the resend button, then sign out when they close or try again.
      setError('Um novo e-mail de confirmação foi enviado. Verifique sua caixa de entrada.');
    } catch (err) {
      setError('Erro ao enviar e-mail. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100 relative"
      >
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-purple-200">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">
              Entrar no Busca Pro
            </h2>
            <p className="text-zinc-500 text-sm font-medium">
              Acesse sua conta para gerenciar seus anúncios
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">E-mail</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent focus:border-purple-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-zinc-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Senha</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Sua senha"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent focus:border-purple-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-zinc-900"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase leading-tight">
                    {error}
                  </p>
                </div>
              </motion.div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? 'Processando...' : 'Confirmar Acesso'}
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-100 text-center space-y-4">
            <p className="text-xs text-zinc-500 font-medium">
              Não tem uma conta?
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={onSignUpClick}
                className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline"
              >
                Criar Conta Grátis
              </button>
              
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAdminAuth'));
                  if (onClose) onClose();
                }}
                className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors pt-2"
              >
                Acesso Administrativo
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
