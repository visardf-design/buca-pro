import React, { useState } from 'react';
import { UserRole, ClientType, Category, HelperSpecialty, UserProfile } from '../types';
import { X, Search, Check, Loader2, Mail, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../constants';
import { supabase } from '../supabase';
import { supabaseService } from '../services/supabaseService';

interface RegistrationFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onClose, onSubmit }) => {
  const [role, setRole] = useState<UserRole>('client');
  const [clientType, setClientType] = useState<ClientType>('final_client');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [helperSpecialty, setHelperSpecialty] = useState<HelperSpecialty | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFinalize = async () => {
    if (!email || !password || !displayName) {
      setError('Preencha os campos obrigatórios (E-mail, Senha e Nome)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: email === 'VISARDF@gmail.com' ? 'admin' : role
          }
        }
      });

      if (authError) throw authError;
      if (data.user) {
        const newUser: UserProfile = {
          uid: data.user.id,
          username: displayName.toLowerCase().replace(/\s+/g, '_'),
          displayName: displayName,
          role: email === 'VISARDF@gmail.com' ? 'admin' : role,
          clientType: role === 'client' ? clientType : undefined,
          category: role === 'professional' ? (selectedCategory as Category) : undefined,
          helperSpecialty: (role === 'professional' && selectedCategory === 'Ajudante') ? (helperSpecialty as HelperSpecialty) : undefined,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
          createdAt: Date.now(),
          rating: 5.0,
          reviewCount: 0,
          plan: 'free',
          status: email === 'VISARDF@gmail.com' ? 'approved' : 'pending',
          phone: '(11) 99999-9999',
          location: 'São Paulo, SP',
        };

        await supabaseService.updateProfile(newUser);
        setIsSuccess(true);
        if (email !== 'VISARDF@gmail.com') {
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <h2 className="text-xl font-black">Cadastro Busca &gt; Pro</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Cadastro Realizado!</h3>
                <p className="text-zinc-500 font-medium">
                  Sua conta foi criada com sucesso. Agora, nossa equipe de administração irá analisar seu perfil. 
                  Você receberá acesso total assim que seu cadastro for aprovado e publicado.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all"
              >
                Entendido
              </button>
            </div>
          ) : (
            <>
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Tipo de Perfil</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setRole('client')}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold ${role === 'client' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-zinc-100 text-zinc-500'}`}
                  >
                    Sou Cliente
                  </button>
                  <button 
                    onClick={() => setRole('professional')}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold ${role === 'professional' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-zinc-100 text-zinc-500'}`}
                  >
                    Sou Profissional
                  </button>
                </div>
              </div>

              {role === 'client' && (
                <div className="space-y-3">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Você é:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'final_client', label: 'Cliente Final' },
                      { id: 'architect', label: 'Arquiteto' },
                      { id: 'engineer', label: 'Engenheiro' },
                      { id: 'real_estate', label: 'Imobiliária' },
                      { id: 'construction_company', label: 'Construtora' },
                      { id: 'condo', label: 'Condomínio' },
                      { id: 'commercial', label: 'Comércio' },
                      { id: 'industrial', label: 'Indústria' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setClientType(type.id as ClientType)}
                        className={`p-3 rounded-xl border text-sm font-bold transition-all ${clientType === type.id ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-500'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {role === 'professional' && (
                <div className="space-y-3">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Sua Categoria Principal:</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Category)}
                    className="w-full p-4 bg-zinc-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 outline-none font-bold text-sm"
                  >
                    <option value="">Selecione uma categoria</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.label} value={cat.label}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Email & Password */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-4">Dados de Acesso</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Seu melhor e-mail"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent focus:border-purple-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crie uma senha forte"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent focus:border-purple-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-zinc-900"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-4">Nome Completo / Razão Social</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Como você quer ser chamado?"
                  className="w-full p-4 bg-zinc-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                />
              </div>

              {error && (
                <p className="text-red-500 text-[10px] font-black uppercase text-center animate-bounce">
                  {error}
                </p>
              )}

              <button 
                onClick={handleFinalize}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-100 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Finalizar Cadastro'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
