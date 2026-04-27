import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Grid, 
  X, 
  RefreshCw,
  Save, 
  Plus, 
  Trash2, 
  Shield, 
  AlertCircle,
  Activity,
  AppWindow,
  Mail,
  Star,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  Palette,
  Terminal,
  Database,
  Cloud,
  Trash,
  BarChart,
  Zap as ZapIcon,
  Bell,
  ArrowRight,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  Info,
  Image as ImageIcon,
  Type,
  Menu,
  User,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Category, AppSettings, UserProfile, UserFeature, Ad, Review, OnboardingStep } from '../types';
import { CATEGORIES, INITIAL_APP_SETTINGS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AdminDashboardProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  categories: { label: Category; icon: any }[];
  onUpdateCategories: (categories: { label: Category; icon: any }[]) => void;
  users: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
  onDeleteUser: (uid: string) => void;
  ads: Ad[];
  reviews: Review[];
  onClose: () => void;
}

type Tab = 'approvals' | 'general' | 'categories' | 'users' | 'messaging' | 'commands' | 'logs' | 'security' | 'database' | 'cloud' | 'stats' | 'onboarding';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  settings, 
  onUpdateSettings, 
  categories,
  onUpdateCategories,
  users,
  onUpdateUsers,
  onDeleteUser,
  ads,
  reviews,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('approvals');
  const [isGeralExpanded, setIsGeralExpanded] = useState(true);
  const [isActionsExpanded, setIsActionsExpanded] = useState(true);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [newCategory, setNewCategory] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<string | null>(null);
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [granularFeature, setGranularFeature] = useState<UserFeature | null>(null);
  const [targetCategory, setTargetCategory] = useState<Category | 'all'>('all');
  const [targetMinRating, setTargetMinRating] = useState<number>(0);
  const [targetPlan, setTargetPlan] = useState<'all' | 'free' | 'premium'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [messagingSearchQuery, setMessagingSearchQuery] = useState('');

  const [isValidating, setIsValidating] = useState(false);

  const filteredTargetUsers = users.filter(user => {
    const matchesCategory = targetCategory === 'all' || 
      (user.role === 'professional' && ads.some(ad => ad.sellerId === user.uid && ad.category === targetCategory));
    const matchesRating = user.rating >= targetMinRating;
    const matchesPlan = targetPlan === 'all' || user.plan === targetPlan;
    const matchesSearch = !messagingSearchQuery || 
      user.displayName.toLowerCase().includes(messagingSearchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(messagingSearchQuery.toLowerCase());
    return matchesCategory && matchesRating && matchesPlan && matchesSearch;
  });

  const [isSeeding, setIsSeeding] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    alert('Configurações salvas com sucesso!');
  };

  const handleValidateSystem = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      alert('Sistema validado! Todas as configurações de manutenção estão ativas e estáveis.');
    }, 1500);
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    setIsSendingBroadcast(true);
    setTimeout(() => {
      // In a real app, this would send to filteredTargetUsers
      onUpdateSettings({ ...localSettings, globalAlert: broadcastMessage });
      setIsSendingBroadcast(false);
      setBroadcastMessage('');
      alert(`Mensagem enviada para ${filteredTargetUsers.length} usuários filtrados!`);
    }, 1500);
  };

  const handleClearAlert = () => {
    onUpdateSettings({ ...localSettings, globalAlert: '' });
    alert('Alerta global removido.');
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.some(c => c.label === newCategory)) {
      onUpdateCategories([...categories, { label: newCategory as Category, icon: Grid }]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (catLabel: Category) => {
    onUpdateCategories(categories.filter(c => c.label !== catLabel));
  };

  const handleDeleteUser = (uid: string) => {
    // Using a simple confirmation for now as per common admin patterns
    if (confirm('Tem certeza que deseja excluir este usuário? Todos os dados associados (anúncios, chats, avaliações) serão removidos.')) {
      onDeleteUser(uid);
    }
  };

  const handleBulkDelete = () => {
    if (selectedUids.length === 0) return;
    if (confirm(`Tem certeza que deseja excluir os ${selectedUids.length} usuários selecionados? Esta ação é irreversível.`)) {
      selectedUids.forEach(uid => onDeleteUser(uid));
      setSelectedUids([]);
    }
  };

  const handleBulkToggleRole = () => {
    if (selectedUids.length === 0) return;
    onUpdateUsers(users.map(u => {
      if (selectedUids.includes(u.uid)) {
        return { ...u, role: u.role === 'professional' ? 'client' : 'professional' };
      }
      return u;
    }));
    setSelectedUids([]);
  };

  const toggleUserRole = (uid: string) => {
    onUpdateUsers(users.map(u => {
      if (u.uid === uid) {
        return { ...u, role: u.role === 'professional' ? 'client' : 'professional' };
      }
      return u;
    }));
  };

  const toggleFeature = (uid: string, feature: UserFeature) => {
    onUpdateUsers(users.map(u => {
      if (u.uid === uid) {
        const blocked = u.blockedFeatures || [];
        const isBlocked = blocked.includes(feature);
        const newBlocked = isBlocked
          ? blocked.filter(f => f !== feature)
          : [...blocked, feature];
        
        // If blocking all, clear granular blocks for this feature
        const updates: Partial<UserProfile> = { blockedFeatures: newBlocked };
        if (!isBlocked) {
          if (feature === 'ads') updates.blockedAdIds = [];
          if (feature === 'chat') updates.blockedChatIds = [];
          if (feature === 'photos') updates.blockedPhotoIds = [];
          if (feature === 'reviews') updates.blockedReviewIds = [];
        }
        
        return { ...u, ...updates };
      }
      return u;
    }));
  };

  const toggleGranularBlock = (uid: string, feature: UserFeature, id: string) => {
    onUpdateUsers(users.map(u => {
      if (u.uid === uid) {
        let field: keyof UserProfile;
        switch (feature) {
          case 'ads': field = 'blockedAdIds'; break;
          case 'chat': field = 'blockedChatIds'; break;
          case 'photos': field = 'blockedPhotoIds'; break;
          case 'reviews': field = 'blockedReviewIds'; break;
          default: return u;
        }

        const current = (u[field] as string[]) || [];
        const next = current.includes(id)
          ? current.filter(i => i !== id)
          : [...current, id];
        
        return { ...u, [field]: next };
      }
      return u;
    }));
  };

  const toggleBlockedCategory = (uid: string, category: Category) => {
    onUpdateUsers(users.map(u => {
      if (u.uid === uid) {
        const blocked = u.blockedCategories || [];
        const newBlocked = blocked.includes(category)
          ? blocked.filter(c => c !== category)
          : [...blocked, category];
        return { ...u, blockedCategories: newBlocked };
      }
      return u;
    }));
  };

  const handleApproveUser = (uid: string) => {
    onUpdateUsers(users.map(u => u.uid === uid ? { ...u, status: 'approved' } : u));
  };

  const handleRejectUser = (uid: string) => {
    if (confirm('Tem certeza que deseja rejeitar este perfil? O usuário não poderá acessar a plataforma.')) {
      onUpdateUsers(users.map(u => u.uid === uid ? { ...u, status: 'rejected' } : u));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-0 md:p-8"
    >
      <div className="bg-white w-full max-w-7xl h-full md:h-[90vh] rounded-none md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-zinc-200">
        
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-zinc-100 relative z-50">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-black text-xs uppercase tracking-tight">Painel Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={cn(
          "bg-zinc-50 border-r border-zinc-200 flex flex-col transition-all duration-300 z-[60]",
          "fixed inset-0 md:relative md:inset-auto w-full md:w-72",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <div className="p-6 border-b border-zinc-200 bg-white md:bg-zinc-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-zinc-900 tracking-tight">Painel Admin</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">v2.4.0 (Stable)</p>
              </div>
            </div>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6 text-zinc-400" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {/* Ações Group */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setIsActionsExpanded(!isActionsExpanded)}
                className="flex items-center justify-between px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-zinc-400 hover:bg-zinc-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ZapIcon className="w-4 h-4" />
                  Ações
                </div>
                {isActionsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {isActionsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col gap-1 pl-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-4 gap-1 mb-2">
                      <button 
                        onClick={handleSaveSettings}
                        className="flex items-center justify-center p-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
                        title="Salvar Alterações"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={onClose}
                        className="flex items-center justify-center p-1.5 bg-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-300 transition-all active:scale-95 shadow-sm"
                        title="Voltar"
                      >
                        <RefreshCw className="w-3.5 h-3.5 rotate-180" />
                      </button>
                      <button 
                        onClick={handleValidateSystem}
                        disabled={isValidating}
                        className="flex items-center justify-center p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                        title="Validar Sistema"
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5", isValidating && "animate-spin")} />
                      </button>
                      <button 
                        onClick={() => window.open('/', '_blank')}
                        className="flex items-center justify-center p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                        title="Ir para o Site"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button 
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-1 py-2 bg-red-600 text-white rounded-lg font-black text-[9px] shadow-sm hover:bg-red-700 transition-all active:scale-95 uppercase tracking-widest"
                    >
                      <X className="w-2.5 h-2.5" />
                      Sair do Painel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Geral Group */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setIsGeralExpanded(!isGeralExpanded)}
                className="flex items-center justify-between px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-zinc-400 hover:bg-zinc-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  Geral
                </div>
                {isGeralExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {isGeralExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col gap-1 pl-4 overflow-hidden"
                  >
                    <button 
                      onClick={() => setActiveTab('approvals')}
                      className={cn(
                        "flex items-center justify-between px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'approvals' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'approvals' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <Check className="w-4 h-4" />
                        Aprovações
                      </div>
                      {users.filter(u => u.status === 'pending').length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                          {users.filter(u => u.status === 'pending').length}
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={() => setActiveTab('general')}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'general' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'general' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <Settings className="w-4 h-4" />
                      Configurações
                    </button>
                    <button 
                      onClick={() => setActiveTab('onboarding')}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'onboarding' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'onboarding' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <Info className="w-4 h-4" />
                      Como Funciona
                    </button>
                    <button 
                      onClick={() => setActiveTab('categories')}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'categories' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'categories' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <Grid className="w-4 h-4" />
                      Categorias
                    </button>
                    <button 
                      onClick={() => setActiveTab('users')}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'users' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'users' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <Users className="w-4 h-4" />
                      Usuários
                    </button>
                    <button 
                      onClick={() => setActiveTab('messaging')}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'messaging' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'messaging' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Mensagens
                    </button>
                    <button 
                      onClick={() => setActiveTab('commands')}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'commands' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'commands' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <Terminal className="w-4 h-4" />
                      Comandos
                    </button>
                    <button 
                      onClick={() => setActiveTab('logs')}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'logs' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'logs' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <Activity className="w-4 h-4" />
                      Logs de Sistema
                    </button>
                    <button 
                      onClick={() => setActiveTab('security')}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'security' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'security' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <Shield className="w-4 h-4" />
                      Segurança
                    </button>
                    <button 
                      onClick={() => setActiveTab('database')}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'database' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'database' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <Database className="w-4 h-4" />
                      Banco de Dados
                    </button>
                    <button 
                      onClick={() => setActiveTab('cloud')}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'cloud' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'cloud' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <Cloud className="w-4 h-4" />
                      Nuvem
                    </button>
                    <button 
                      onClick={() => setActiveTab('stats')}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === 'stats' ? "bg-white shadow-sm border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                      style={activeTab === 'stats' ? { color: 'var(--primary-color)' } : {}}
                    >
                      <BarChart className="w-4 h-4" />
                      Estatísticas
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
          <div className="p-4 border-t border-zinc-200 bg-white md:bg-zinc-50">
            <div className="p-3 bg-zinc-50 md:bg-white rounded-2xl border border-zinc-200 md:border-zinc-100 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-zinc-900 truncate uppercase tracking-tighter">Sessão Admin</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest truncate">Acesso Permitido</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar bg-white">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'approvals' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-3xl font-black text-zinc-900 tracking-tight">Aprovações Pendentes</h3>
                    <p className="text-zinc-500 text-sm font-medium">Analise e aprove novos perfis de profissionais.</p>
                  </div>
                  <div className="bg-zinc-100 px-6 py-3 rounded-2xl border border-zinc-200 flex items-center gap-3">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Pendente</span>
                    <span className="text-lg font-black text-purple-600">{users.filter(u => u.status === 'pending').length}</span>
                  </div>
                </header>

                <div className="space-y-4">
                  {users.filter(u => u.status === 'pending').length === 0 ? (
                    <div className="py-20 text-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-zinc-100">
                        <Check className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h4 className="font-black text-zinc-900 tracking-tight">Tudo em ordem!</h4>
                      <p className="text-zinc-500 text-sm">Não há perfis aguardando aprovação no momento.</p>
                    </div>
                  ) : (
                    users.filter(u => u.status === 'pending').map(user => (
                      <div key={user.uid} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex gap-4">
                            <div className="relative">
                              <img 
                                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                                alt={user.displayName}
                                className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-100"
                              />
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-white">
                                <Star className="w-3 h-3 fill-current" />
                              </div>
                            </div>
                            <div>
                              <h4 className="font-black text-zinc-900 text-lg leading-none mb-1">{user.displayName}</h4>
                              <p className="text-zinc-500 text-sm font-medium mb-2">{user.email}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-100">
                                  {user.role}
                                </span>
                                {user.category && (
                                  <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-zinc-200">
                                    {user.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleRejectUser(user.uid)}
                              className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all active:scale-95 border border-red-100"
                              title="Rejeitar Perfil"
                            >
                              <X className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleApproveUser(user.uid)}
                              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200"
                            >
                              <Check className="w-4 h-4" />
                              Aprovar
                            </button>
                          </div>
                        </div>
                        
                        {user.bio && (
                          <div className="mt-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <p className="text-zinc-600 text-sm italic">"{user.bio}"</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Configurações Gerais</h3>
                  <p className="text-zinc-500 text-sm">Ajuste as informações básicas da sua plataforma.</p>
                </header>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <AppWindow className="w-3 h-3" /> Nome do Aplicativo
                    </label>
                    <input 
                      type="text" 
                      value={localSettings.appName}
                      onChange={(e) => setLocalSettings({...localSettings, appName: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> E-mail de Contato
                    </label>
                    <input 
                      type="email" 
                      value={localSettings.contactEmail}
                      onChange={(e) => setLocalSettings({...localSettings, contactEmail: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Descrição da Plataforma</label>
                    <textarea 
                      rows={4}
                      value={localSettings.appDescription}
                      onChange={(e) => setLocalSettings({...localSettings, appDescription: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                    <div>
                      <h4 className="font-bold text-zinc-900">Modo de Manutenção</h4>
                      <p className="text-xs text-zinc-500">Bloqueia o acesso de usuários comuns à plataforma.</p>
                    </div>
                    <button 
                      onClick={() => setLocalSettings({...localSettings, maintenanceMode: !localSettings.maintenanceMode})}
                      className="text-purple-600"
                    >
                      {localSettings.maintenanceMode ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-zinc-300" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm border border-emerald-200">
                        <span className="text-lg font-black text-emerald-600 leading-none">{localSettings.liveCounterValue}</span>
                        <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-tighter">Online</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900">Contador de Acessos</h4>
                        <p className="text-xs text-emerald-700">Torne público para gerar mais engajamento e autoridade.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setLocalSettings({...localSettings, showLiveCounter: !localSettings.showLiveCounter})}
                      className="text-emerald-600"
                    >
                      {localSettings.showLiveCounter ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-zinc-300" />}
                    </button>
                  </div>

                  <div className="space-y-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                    <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Personalização de Cores
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cor Primária</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={localSettings.primaryColor}
                            onChange={(e) => setLocalSettings({...localSettings, primaryColor: e.target.value})}
                            className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                          />
                          <input 
                            type="text" 
                            value={localSettings.primaryColor}
                            onChange={(e) => setLocalSettings({...localSettings, primaryColor: e.target.value})}
                            className="flex-1 bg-white border border-zinc-200 rounded-lg px-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cor de Destaque</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={localSettings.accentColor}
                            onChange={(e) => setLocalSettings({...localSettings, accentColor: e.target.value})}
                            className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                          />
                          <input 
                            type="text" 
                            value={localSettings.accentColor}
                            onChange={(e) => setLocalSettings({...localSettings, accentColor: e.target.value})}
                            className="flex-1 bg-white border border-zinc-200 rounded-lg px-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'onboarding' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Gerenciar "Como Funciona"</h3>
                  <p className="text-zinc-500 text-sm">Personalize os banners e passos informativos da plataforma.</p>
                </header>

                <div className="space-y-6">
                  {localSettings.onboardingSteps.map((step, index) => (
                    <div key={step.id} className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-200 space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <span className="text-4xl font-black text-zinc-200">0{index + 1}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                              <Type className="w-3 h-3" /> Título do Banner
                            </label>
                            <input 
                              type="text" 
                              value={step.title}
                              onChange={(e) => {
                                const newSteps = [...localSettings.onboardingSteps];
                                newSteps[index].title = e.target.value;
                                setLocalSettings({...localSettings, onboardingSteps: newSteps});
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                              <MessageSquare className="w-3 h-3" /> Descrição
                            </label>
                            <textarea 
                              rows={3}
                              value={step.description}
                              onChange={(e) => {
                                const newSteps = [...localSettings.onboardingSteps];
                                newSteps[index].description = e.target.value;
                                setLocalSettings({...localSettings, onboardingSteps: newSteps});
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <Palette className="w-3 h-3" /> Cor do Tema
                              </label>
                              <div className="flex gap-2">
                                <input 
                                  type="color" 
                                  value={step.color}
                                  onChange={(e) => {
                                    const newSteps = [...localSettings.onboardingSteps];
                                    newSteps[index].color = e.target.value;
                                    setLocalSettings({...localSettings, onboardingSteps: newSteps});
                                  }}
                                  className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <input 
                                  type="text" 
                                  value={step.color}
                                  onChange={(e) => {
                                    const newSteps = [...localSettings.onboardingSteps];
                                    newSteps[index].color = e.target.value;
                                    setLocalSettings({...localSettings, onboardingSteps: newSteps});
                                  }}
                                  className="flex-1 bg-white border border-zinc-200 rounded-lg px-2 text-xs font-mono"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="w-3 h-3" /> Ícone (Lucide)
                                </div>
                                <span className="text-[8px] normal-case opacity-60">Ex: Search, Shield, Zap, Star...</span>
                              </label>
                              <input 
                                type="text" 
                                value={step.icon}
                                onChange={(e) => {
                                  const newSteps = [...localSettings.onboardingSteps];
                                  newSteps[index].icon = e.target.value;
                                  setLocalSettings({...localSettings, onboardingSteps: newSteps});
                                }}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                              <ImageIcon className="w-3 h-3" /> URL da Imagem
                            </label>
                            <input 
                              type="text" 
                              value={step.image}
                              onChange={(e) => {
                                const newSteps = [...localSettings.onboardingSteps];
                                newSteps[index].image = e.target.value;
                                setLocalSettings({...localSettings, onboardingSteps: newSteps});
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preview Section */}
                      <div className="mt-4 p-4 bg-white rounded-2xl border border-zinc-100 flex items-center gap-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-300 vertical-text py-2 border-r border-zinc-100 pr-4">Preview</div>
                        <div className="flex-1 flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${step.color}15`, color: step.color }}
                          >
                            <Info className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-black text-sm text-zinc-900 truncate uppercase tracking-tight">{step.title || 'Sem título'}</h5>
                            <p className="text-[10px] text-zinc-500 truncate font-medium">{step.description || 'Sem descrição...'}</p>
                          </div>
                        </div>
                        {step.image && (
                          <div className="w-16 h-10 rounded-lg overflow-hidden border border-zinc-100 shrink-0">
                            <img src={step.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
                        <button 
                          onClick={() => {
                            if (index === 0) return;
                            const newSteps = [...localSettings.onboardingSteps];
                            [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
                            setLocalSettings({...localSettings, onboardingSteps: newSteps});
                          }}
                          disabled={index === 0}
                          className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-lg transition-all disabled:opacity-30"
                          title="Mover para Cima"
                        >
                          <ChevronDown className="w-5 h-5 rotate-180" />
                        </button>
                        <button 
                          onClick={() => {
                            if (index === localSettings.onboardingSteps.length - 1) return;
                            const newSteps = [...localSettings.onboardingSteps];
                            [newSteps[index + 1], newSteps[index]] = [newSteps[index], newSteps[index + 1]];
                            setLocalSettings({...localSettings, onboardingSteps: newSteps});
                          }}
                          disabled={index === localSettings.onboardingSteps.length - 1}
                          className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-lg transition-all disabled:opacity-30"
                          title="Mover para Baixo"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => {
                            const newSteps = localSettings.onboardingSteps.filter((_, i) => i !== index);
                            setLocalSettings({...localSettings, onboardingSteps: newSteps});
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remover Passo"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => {
                      const newStep: OnboardingStep = {
                        id: `step-${Date.now()}`,
                        title: 'Novo Passo',
                        description: 'Descrição do novo passo...',
                        icon: 'Info',
                        color: '#9333ea',
                        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop'
                      };
                      setLocalSettings({...localSettings, onboardingSteps: [...localSettings.onboardingSteps, newStep]});
                    }}
                    className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-[2rem] text-zinc-400 font-black uppercase tracking-widest hover:border-purple-500 hover:text-purple-500 transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Adicionar Novo Passo
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Gestão de Categorias</h3>
                  <p className="text-zinc-500 text-sm">Adicione ou remova categorias de serviços da plataforma.</p>
                </header>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nova categoria..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                  <button 
                    onClick={handleAddCategory}
                    className="bg-purple-600 text-white px-6 rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <div key={cat.label} className="group flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                      <div className="flex items-center gap-3">
                        <cat.icon className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-zinc-700">{cat.label}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveCategory(cat.label)}
                        className="p-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messaging' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Comunicação Direta</h3>
                  <p className="text-zinc-500 text-sm">Envie alertas globais ou mensagens para usuários específicos.</p>
                </header>

                <div className="space-y-6">
                  <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 space-y-6">
                    <h4 className="font-bold text-purple-900 flex items-center gap-2">
                      <Bell className="w-5 h-5" /> Alerta Global (Broadcast)
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Pesquisar Usuário</label>
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-300 w-3 h-3" />
                          <input 
                            type="text"
                            placeholder="Nome ou @user..."
                            value={messagingSearchQuery}
                            onChange={(e) => setMessagingSearchQuery(e.target.value)}
                            className="w-full bg-white border border-purple-200 rounded-xl pl-7 pr-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Filtrar Categoria</label>
                        <select 
                          value={targetCategory}
                          onChange={(e) => setTargetCategory(e.target.value as Category | 'all')}
                          className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="all">Todas as Categorias</option>
                          {categories.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Avaliação Mínima</label>
                        <select 
                          value={targetMinRating}
                          onChange={(e) => setTargetMinRating(Number(e.target.value))}
                          className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value={0}>Qualquer Avaliação</option>
                          <option value={3}>3+ Estrelas</option>
                          <option value={4}>4+ Estrelas</option>
                          <option value={4.5}>4.5+ Estrelas</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Tipo de Plano</label>
                        <select 
                          value={targetPlan}
                          onChange={(e) => setTargetPlan(e.target.value as any)}
                          className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="all">Todos os Planos</option>
                          <option value="free">Gratuito (Free)</option>
                          <option value="premium">Pagante (Premium)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Mensagem</label>
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                          Alcançará {filteredTargetUsers.length} usuários
                        </span>
                      </div>
                      <textarea 
                        rows={3}
                        placeholder="Digite o alerta aqui..."
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        className="w-full bg-white border border-purple-200 rounded-2xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={handleSendBroadcast}
                        disabled={isSendingBroadcast || !broadcastMessage.trim() || filteredTargetUsers.length === 0}
                        className="flex-1 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                      >
                        {isSendingBroadcast ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ZapIcon className="w-4 h-4" />}
                        Enviar para {filteredTargetUsers.length} Usuários
                      </button>
                      <button 
                        onClick={handleClearAlert}
                        className="px-6 bg-white text-purple-600 border border-purple-200 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all"
                      >
                        Limpar Alerta
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-zinc-900">Mensagens Recentes</h4>
                    <div className="space-y-2">
                      {users.slice(0, 3).map(user => (
                        <div key={user.uid} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                          <div className="flex items-center gap-3">
                            <img src={user.photoURL} className="w-8 h-8 rounded-full" />
                            <span className="font-bold text-sm text-zinc-700">{user.displayName}</span>
                          </div>
                          <button className="text-xs font-bold text-purple-600 hover:underline">Conversar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'commands' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Centro de Comando</h3>
                  <p className="text-zinc-500 text-sm">Ferramentas avançadas de administração e manutenção.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-6 bg-zinc-50 rounded-3xl border border-zinc-200 hover:border-purple-500 hover:shadow-lg transition-all text-left group">
                    <Database className="w-8 h-8 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-black text-zinc-900">Limpar Cache</h4>
                    <p className="text-xs text-zinc-500">Remove dados temporários e força recarregamento.</p>
                  </button>
                  <button className="p-6 bg-zinc-50 rounded-3xl border border-zinc-200 hover:border-emerald-500 hover:shadow-lg transition-all text-left group">
                    <Cloud className="w-8 h-8 text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-black text-zinc-900">Backup Completo</h4>
                    <p className="text-xs text-zinc-500">Gera um arquivo JSON com todos os dados atuais.</p>
                  </button>
                  <button className="p-6 bg-zinc-50 rounded-3xl border border-zinc-200 hover:border-blue-500 hover:shadow-lg transition-all text-left group">
                    <Users className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-black text-zinc-900">Reindexar Usuários</h4>
                    <p className="text-xs text-zinc-500">Atualiza os índices de busca e perfis.</p>
                  </button>
                  <button className="p-6 bg-zinc-50 rounded-3xl border border-zinc-200 hover:border-red-500 hover:shadow-lg transition-all text-left group">
                    <Trash className="w-8 h-8 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-black text-zinc-900">Resetar Estatísticas</h4>
                    <p className="text-xs text-zinc-500">Zera contadores de visualizações e cliques.</p>
                  </button>
                </div>

                <div className="p-6 bg-zinc-900 rounded-3xl text-white space-y-4">
                  <h4 className="font-black flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-400" /> Console de Comandos
                  </h4>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Digite um comando (ex: /maintenance on)..."
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 font-mono text-xs outline-none focus:border-emerald-500"
                    />
                    <button className="bg-emerald-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all">Executar</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Controle de Usuários</h3>
                    <p className="text-zinc-500 text-sm">Gerencie permissões e visualize perfis cadastrados.</p>
                  </div>
                  <div className="flex items-center gap-3 flex-1 max-w-md">
                    <button 
                      onClick={() => {
                        const filtered = users.filter(u => 
                          u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                          u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
                        );
                        if (selectedUids.length === filtered.length) {
                          setSelectedUids([]);
                        } else {
                          setSelectedUids(filtered.map(u => u.uid));
                        }
                      }}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
                    >
                      {selectedUids.length > 0 && selectedUids.length === users.filter(u => u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.username.toLowerCase().includes(userSearchQuery.toLowerCase())).length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </button>
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <input 
                        type="text" 
                        placeholder="Pesquisar usuário..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </header>

                {/* Bulk Actions Bar */}
                {selectedUids.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-purple-600 rounded-2xl text-white animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black">{selectedUids.length} selecionados</p>
                        <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Ações em massa</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleBulkToggleRole}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-all"
                        title="Alternar Cargo"
                      >
                        <Settings className="w-4 h-4" />
                        Cargo
                      </button>
                      <button 
                        onClick={() => {
                          if (selectedUids.length === 1) {
                            setEditingPermissions(editingPermissions === selectedUids[0] ? null : selectedUids[0]);
                          } else {
                            alert('Selecione apenas um usuário para gerenciar permissões detalhadas.');
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                          selectedUids.length === 1 && editingPermissions === selectedUids[0] ? "bg-white text-purple-600" : "bg-white/10 hover:bg-white/20"
                        )}
                        title="Gerenciar Permissões"
                      >
                        <Shield className="w-4 h-4" />
                        Permissões
                      </button>
                      <button 
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-black transition-all shadow-lg shadow-red-900/20"
                        title="Excluir Selecionados"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                      <button 
                        onClick={() => setSelectedUids([])}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {users
                    .filter(u => 
                      u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                      u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
                    )
                    .map((user) => (
                    <div key={user.uid} className="flex flex-col gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => {
                            setSelectedUids(prev => 
                              prev.includes(user.uid) ? prev.filter(id => id !== user.uid) : [...prev, user.uid]
                            );
                          }}
                          className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                            selectedUids.includes(user.uid) 
                              ? "bg-purple-600 border-purple-600 text-white" 
                              : "border-zinc-200 hover:border-purple-400"
                          )}
                        >
                          {selectedUids.includes(user.uid) && <Check className="w-4 h-4" />}
                        </button>
                        <img 
                          src={user.photoURL || 'https://via.placeholder.com/150'} 
                          alt={user.displayName}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-zinc-900">{user.displayName}</h4>
                          <p className="text-xs text-zinc-500">@{user.username}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                            user.role === 'professional' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {user.role}
                          </span>
                          <button 
                            onClick={() => handleDeleteUser(user.uid)}
                            className="p-2 text-zinc-300 hover:text-red-500 transition-all"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {editingPermissions === user.uid && (
                        <div className="mt-2 p-4 bg-white rounded-xl border border-zinc-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Funcionalidades</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                              {(['ads', 'chat', 'photos', 'profile', 'reviews'] as UserFeature[]).map(feature => {
                                const isBlocked = user.blockedFeatures?.includes(feature);
                                const isGranular = granularFeature === feature;
                                
                                return (
                                  <div key={feature} className="flex flex-col gap-1">
                                    <button
                                      onClick={() => toggleFeature(user.uid, feature)}
                                      className={cn(
                                        "flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-bold uppercase tracking-tighter transition-all w-full",
                                        isBlocked 
                                          ? "bg-red-50 border-red-200 text-red-600" 
                                          : "bg-emerald-50 border-emerald-200 text-emerald-600"
                                      )}
                                    >
                                      {isBlocked ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                                      {feature === 'ads' ? 'Anúncios' : 
                                       feature === 'chat' ? 'Chat' : 
                                       feature === 'photos' ? 'Fotos' : 
                                       feature === 'profile' ? 'Perfil' : 'Avaliações'}
                                    </button>
                                    
                                    {feature !== 'profile' && (
                                      <button 
                                        onClick={() => setGranularFeature(isGranular ? null : feature)}
                                        className={cn(
                                          "text-[8px] font-black uppercase tracking-widest py-1 rounded-md transition-all",
                                          isGranular ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                                        )}
                                      >
                                        {isGranular ? 'Fechar' : 'Específico'}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Granular Blocking UI */}
                            {granularFeature && (
                              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3 animate-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    Bloqueio Específico: {
                                      granularFeature === 'ads' ? 'Anúncios' : 
                                      granularFeature === 'chat' ? 'Conversas' : 
                                      granularFeature === 'photos' ? 'Fotos/Portfólio' : 'Avaliações'
                                    }
                                  </h5>
                                  <button onClick={() => setGranularFeature(null)}>
                                    <X className="w-3 h-3 text-zinc-400" />
                                  </button>
                                </div>

                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                  {granularFeature === 'ads' && (
                                    ads.filter(ad => ad.sellerId === user.uid).map(ad => (
                                      <div key={ad.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-100">
                                        <span className="text-[10px] font-bold text-zinc-600 truncate flex-1 mr-2">{ad.title}</span>
                                        <button 
                                          onClick={() => toggleGranularBlock(user.uid, 'ads', ad.id)}
                                          className={cn(
                                            "px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all",
                                            user.blockedAdIds?.includes(ad.id) ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-400"
                                          )}
                                        >
                                          {user.blockedAdIds?.includes(ad.id) ? 'Bloqueado' : 'Bloquear'}
                                        </button>
                                      </div>
                                    ))
                                  )}

                                  {granularFeature === 'photos' && (
                                    user.portfolio?.map(item => (
                                      <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-100">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <img src={item.images[0]} className="w-6 h-6 rounded object-cover" />
                                          <span className="text-[10px] font-bold text-zinc-600 truncate">{item.title}</span>
                                        </div>
                                        <button 
                                          onClick={() => toggleGranularBlock(user.uid, 'photos', item.id)}
                                          className={cn(
                                            "px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all",
                                            user.blockedPhotoIds?.includes(item.id) ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-400"
                                          )}
                                        >
                                          {user.blockedPhotoIds?.includes(item.id) ? 'Bloqueado' : 'Bloquear'}
                                        </button>
                                      </div>
                                    ))
                                  )}

                                  {granularFeature === 'reviews' && (
                                    reviews.filter(r => r.targetUserId === user.uid).map(review => (
                                      <div key={review.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-100">
                                        <div className="flex-1 min-w-0 mr-2">
                                          <div className="flex items-center gap-1">
                                            <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                                            <span className="text-[10px] font-black text-zinc-900">{review.rating}</span>
                                          </div>
                                          <p className="text-[9px] text-zinc-500 truncate italic">"{review.comment}"</p>
                                        </div>
                                        <button 
                                          onClick={() => toggleGranularBlock(user.uid, 'reviews', review.id)}
                                          className={cn(
                                            "px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all",
                                            user.blockedReviewIds?.includes(review.id) ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-400"
                                          )}
                                        >
                                          {user.blockedReviewIds?.includes(review.id) ? 'Bloqueado' : 'Bloquear'}
                                        </button>
                                      </div>
                                    ))
                                  )}

                                  {granularFeature === 'chat' && (
                                    // Mocking some conversations since we don't have a chat history state
                                    ['Chat com João', 'Chat com Maria', 'Chat com Suporte'].map((chatName, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-100">
                                        <span className="text-[10px] font-bold text-zinc-600 truncate flex-1 mr-2">{chatName}</span>
                                        <button 
                                          onClick={() => toggleGranularBlock(user.uid, 'chat', `chat_${idx}`)}
                                          className={cn(
                                            "px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all",
                                            user.blockedChatIds?.includes(`chat_${idx}`) ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-400"
                                          )}
                                        >
                                          {user.blockedChatIds?.includes(`chat_${idx}`) ? 'Bloqueado' : 'Bloquear'}
                                        </button>
                                      </div>
                                    ))
                                  )}

                                  {((granularFeature === 'ads' && ads.filter(ad => ad.sellerId === user.uid).length === 0) ||
                                    (granularFeature === 'photos' && (!user.portfolio || user.portfolio.length === 0)) ||
                                    (granularFeature === 'reviews' && reviews.filter(r => r.targetUserId === user.uid).length === 0)) && (
                                    <p className="text-[10px] text-zinc-400 text-center py-4 italic">Nenhum item encontrado.</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bloquear Categorias</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {categories.map(cat => {
                                const isBlocked = user.blockedCategories?.includes(cat.label);
                                return (
                                  <button
                                    key={cat.label}
                                    onClick={() => toggleBlockedCategory(user.uid, cat.label)}
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all",
                                      isBlocked 
                                        ? "bg-red-50 border-red-200 text-red-600" 
                                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-purple-200"
                                    )}
                                  >
                                    <cat.icon className="w-3 h-3" />
                                    {cat.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Logs de Atividade</h3>
                  <p className="text-zinc-500 text-sm">Monitoramento em tempo real das ações do sistema.</p>
                </header>

                <div className="bg-zinc-950 rounded-2xl p-6 font-mono text-xs text-emerald-500 space-y-2 overflow-hidden border border-zinc-800 shadow-2xl">
                  <div className="flex gap-4 opacity-50">
                    <span>[07:55:21]</span>
                    <span className="text-white">SYS:</span>
                    <span>Backup diário concluído com sucesso.</span>
                  </div>
                  <div className="flex gap-4">
                    <span>[07:56:44]</span>
                    <span className="text-purple-400">AUTH:</span>
                    <span>Novo usuário registrado: @tec_edificacao</span>
                  </div>
                  <div className="flex gap-4">
                    <span>[07:57:12]</span>
                    <span className="text-blue-400">AD:</span>
                    <span>Anúncio "Cálculo Estrutural" publicado por Bruno E.</span>
                  </div>
                  <div className="flex gap-4">
                    <span>[07:58:01]</span>
                    <span className="text-yellow-400">WARN:</span>
                    <span>Tentativa de login inválida detectada (IP: 192.168.1.45)</span>
                  </div>
                  <div className="flex gap-4 animate-pulse">
                    <span>[07:58:30]</span>
                    <span className="text-white">SYS:</span>
                    <span>Painel de Manutenção acessado por Admin.</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Uptime</p>
                    <p className="text-xl font-black text-zinc-900">99.9%</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Usuários</p>
                    <p className="text-xl font-black text-zinc-900">{users.length}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Erros</p>
                    <p className="text-xl font-black text-red-500">0</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Segurança</h3>
                  <p className="text-zinc-500 text-sm">Gerencie as políticas de segurança e acesso.</p>
                </header>
                <div className="p-12 bg-zinc-50 rounded-[2rem] border border-zinc-200 border-dashed text-center">
                  <Shield className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                  <p className="text-zinc-400 font-bold italic">Módulo de segurança em desenvolvimento.</p>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Banco de Dados</h3>
                  <p className="text-zinc-500 text-sm">Gerenciamento e otimização de dados da plataforma.</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-zinc-100 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-md transition-all">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                      <RefreshCw className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Popular Banco de Dados</h4>
                      <p className="text-zinc-500 text-sm mt-1">
                        Cria automaticamente 3 usuários profissionais para cada categoria, com anúncios e avaliações realistas.
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Deseja popular o banco de dados agora? Isso criará novos usuários em todas as categorias.')) {
                          setIsSeeding(true);
                          try {
                            const { seedDatabase } = await import('../services/seedService');
                            await seedDatabase(true); // force seed
                            alert('Banco de dados populado com sucesso! Recarregue a página se necessário.');
                          } catch (err) {
                            console.error(err);
                            alert('Erro ao semear dados.');
                          } finally {
                            setIsSeeding(false);
                          }
                        }
                      }}
                      disabled={isSeeding}
                      className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSeeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                      {isSeeding ? 'Semeando...' : 'Semear Dados (Seed)'}
                    </button>
                  </div>

                  <div className="bg-zinc-50 border-2 border-zinc-100 rounded-3xl p-8 space-y-6 opacity-60">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zinc-400">
                      <Trash className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Limpar Dados</h4>
                      <p className="text-zinc-500 text-sm mt-1">Remover todos os usuários e anúncios de teste (Não implementado).</p>
                    </div>
                    <button
                      disabled
                      className="w-full bg-zinc-200 text-zinc-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed"
                    >
                      Limpeza Total
                    </button>
                    <p className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-widest">Disponível em breve</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cloud' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Nuvem</h3>
                  <p className="text-zinc-500 text-sm">Configurações de infraestrutura em nuvem.</p>
                </header>
                <div className="p-12 bg-zinc-50 rounded-[2rem] border border-zinc-200 border-dashed text-center">
                  <Cloud className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                  <p className="text-zinc-400 font-bold italic">Módulo de nuvem em desenvolvimento.</p>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Estatísticas do Sistema</h3>
                  <p className="text-zinc-500 text-sm">Análise detalhada de crescimento e engajamento.</p>
                </header>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Crescimento Mensal</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-zinc-900">+24%</span>
                      <span className="text-[10px] font-bold text-emerald-500 mb-1">↑ 12%</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Taxa de Conversão</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-zinc-900">3.8%</span>
                      <span className="text-[10px] font-bold text-emerald-500 mb-1">↑ 0.5%</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Usuários Ativos</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-zinc-900">1.2k</span>
                      <span className="text-[10px] font-bold text-blue-500 mb-1">Estável</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Receita Estimada</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-zinc-900">R$ 12k</span>
                      <span className="text-[10px] font-bold text-emerald-500 mb-1">↑ 8%</span>
                    </div>
                  </div>
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Growth Chart */}
                  <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-zinc-900 text-sm uppercase tracking-tight">Crescimento de Usuários</h4>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="text-[10px] font-bold text-zinc-400">Profissionais</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-[10px] font-bold text-zinc-400">Clientes</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { name: 'Jan', prof: 400, client: 240 },
                            { name: 'Fev', prof: 300, client: 139 },
                            { name: 'Mar', prof: 200, client: 980 },
                            { name: 'Abr', prof: 278, client: 390 },
                            { name: 'Mai', prof: 189, client: 480 },
                            { name: 'Jun', prof: 239, client: 380 },
                            { name: 'Jul', prof: 349, client: 430 },
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorClient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#18181b', 
                              border: 'none', 
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="prof" stroke="#9333ea" fillOpacity={1} fill="url(#colorProf)" strokeWidth={3} />
                          <Area type="monotone" dataKey="client" stroke="#2563eb" fillOpacity={1} fill="url(#colorClient)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Distribution */}
                  <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm space-y-4">
                    <h4 className="font-black text-zinc-900 text-sm uppercase tracking-tight">Distribuição por Categoria</h4>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart
                          data={[
                            { name: 'Elétrica', value: 45 },
                            { name: 'Pintura', value: 32 },
                            { name: 'Limpeza', value: 28 },
                            { name: 'Pedreiro', value: 24 },
                            { name: 'Outros', value: 15 },
                          ]}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f4f4f5' }}
                            contentStyle={{ 
                              backgroundColor: '#18181b', 
                              border: 'none', 
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: '#fff'
                            }}
                          />
                          <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                            {
                              [0, 1, 2, 3, 4].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#9333ea' : '#2563eb'} />
                              ))
                            }
                          </Bar>
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-zinc-100">
                    <h4 className="font-black text-zinc-900 text-sm uppercase tracking-tight">Top Profissionais</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-100">
                          <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Profissional</th>
                          <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Serviços</th>
                          <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Avaliação</th>
                          <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {users.filter(u => u.role === 'professional').slice(0, 5).map((user, i) => (
                          <tr key={user.uid} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={user.photoURL} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                <div>
                                  <p className="text-sm font-bold text-zinc-900">{user.displayName}</p>
                                  <p className="text-[10px] text-zinc-400">@{user.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-black text-zinc-900">{Math.floor(Math.random() * 50) + 10}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-sm font-bold">{user.rating.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded-full uppercase tracking-widest">
                                Ativo
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </motion.div>
  );
};
