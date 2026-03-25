import { Category } from './types';
import { 
  Hammer, 
  Zap, 
  Paintbrush, 
  Layers, 
  Home, 
  Grid, 
  Wrench, 
  PenTool, 
  Trash2, 
  MoreHorizontal,
  Layout,
  ClipboardCheck,
  HardHat,
  Construction,
  Users,
  Droplets
} from 'lucide-react';

export const CATEGORIES: { label: Category; icon: any }[] = [
  { label: 'Arquitetura', icon: PenTool },
  { label: 'Engenharia', icon: HardHat },
  { label: 'Técnico de Edificação', icon: ClipboardCheck },
  { label: 'Alvenaria e Estrutura', icon: Hammer },
  { label: 'Armador', icon: Construction },
  { label: 'Elétrica', icon: Zap },
  { label: 'Hidráulica', icon: Droplets },
  { label: 'Telhados e Calhas', icon: Home },
  { label: 'Gesso e Drywall', icon: Layers },
  { label: 'Pisos e Revestimentos', icon: Grid },
  { label: 'Pintura e Acabamento', icon: Paintbrush },
  { label: 'Marcenaria', icon: Layout },
  { label: 'Serralheria', icon: Wrench },
  { label: 'Ajudante', icon: Users },
  { label: 'Limpeza Pós-Obra', icon: Trash2 },
  { label: 'Outros', icon: MoreHorizontal },
];

export const INITIAL_APP_SETTINGS = {
  appName: 'BuscaPro',
  appDescription: 'A maior plataforma de profissionais da construção civil.',
  adminPassword: '12345678',
  maintenanceMode: false,
  contactEmail: 'suporte@buscapro.com.br',
  primaryColor: '#9333ea', // purple-600
  accentColor: '#2563eb',  // blue-600
  globalAlert: '',
  showLiveCounter: false,
  liveCounterValue: 124,
  onboardingSteps: [
    {
      id: 'step-1',
      title: 'Encontre Profissionais',
      description: 'Milhares de profissionais qualificados prontos para atender sua obra.',
      icon: 'Search',
      color: '#9333ea',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'step-2',
      title: 'Solicite Orçamentos',
      description: 'Converse diretamente com os profissionais e receba orçamentos detalhados.',
      icon: 'MessageSquare',
      color: '#2563eb',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'step-3',
      title: 'Contrate com Segurança',
      description: 'Veja avaliações de outros clientes e contrate o melhor profissional para você.',
      icon: 'ShieldCheck',
      color: '#059669',
      image: 'https://images.unsplash.com/photo-1589939705384-5185138a04b9?q=80&w=800&auto=format&fit=crop'
    }
  ]
};
