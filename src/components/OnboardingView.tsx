import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  Users, 
  MapPin, 
  Star, 
  ArrowRight,
  Zap,
  Lock,
  Smartphone,
  Globe,
  Info,
  Check,
  Bell,
  Settings,
  Grid,
  Activity,
  ShieldCheck,
  HelpCircle,
  PlayCircle,
  Heart,
  Award,
  TrendingUp,
  Target,
  Rocket
} from 'lucide-react';
import { OnboardingStep } from '../types';

interface OnboardingViewProps {
  onStart: () => void;
  appName: string;
  steps?: OnboardingStep[];
}

const IconMap: Record<string, React.ReactNode> = {
  Search: <Search className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
  MessageSquare: <MessageSquare className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  MapPin: <MapPin className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
  Lock: <Lock className="w-6 h-6" />,
  Smartphone: <Smartphone className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  Info: <Info className="w-6 h-6" />,
  Check: <Check className="w-6 h-6" />,
  Bell: <Bell className="w-6 h-6" />,
  Settings: <Settings className="w-6 h-6" />,
  Grid: <Grid className="w-6 h-6" />,
  Activity: <Activity className="w-6 h-6" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6" />,
  HelpCircle: <HelpCircle className="w-6 h-6" />,
  PlayCircle: <PlayCircle className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  Rocket: <Rocket className="w-6 h-6" />,
};

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onStart, appName, steps: propSteps }) => {
  const defaultSteps = [
    {
      id: '1',
      icon: 'Search',
      color: '#9333ea',
      title: "Encontre o que precisa",
      description: "Navegue por categorias ou use nossa busca inteligente para encontrar profissionais qualificados ou materiais de construção próximos a você."
    },
    {
      id: '2',
      icon: 'Shield',
      color: '#2563eb',
      title: "Profissionais Verificados",
      description: "Trabalhamos com um sistema de verificação rigoroso para garantir que você contrate apenas os melhores e mais confiáveis profissionais do mercado."
    },
    {
      id: '3',
      icon: 'MessageSquare',
      color: '#10b981',
      title: "Negocie Direto",
      description: "Use nosso chat integrado para tirar dúvidas, solicitar orçamentos e fechar negócios sem intermediários e sem taxas ocultas."
    }
  ];

  const steps = propSteps || defaultSteps;

  const features = [
    { icon: <Zap className="w-5 h-5" />, text: "Rápido e Intuitivo" },
    { icon: <Lock className="w-5 h-5" />, text: "Seguro e Confiável" },
    { icon: <Smartphone className="w-5 h-5" />, text: "Acesse de qualquer lugar" },
    { icon: <Globe className="w-5 h-5" />, text: "Cobertura Nacional" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/50 blur-[120px] rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/50 blur-[120px] rounded-full -ml-48 -mb-48" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
            >
              <Zap className="w-3 h-3 text-yellow-400" /> O Futuro da Construção Civil
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter leading-[0.9]"
            >
              CONECTANDO <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">TALENTOS</span> <br />
              E OBRAS EM TODO O BRASIL
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-zinc-600 font-medium max-w-2xl mx-auto"
            >
              A {appName} é o marketplace definitivo para quem constrói ou reforma. 
              Encontre profissionais validados, compare preços e gerencie seus projetos em um só lugar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 pt-4"
            >
              <button
                onClick={onStart}
                className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all shadow-2xl shadow-zinc-300 active:scale-95 flex items-center gap-2"
              >
                Começar Agora <ArrowRight className="w-4 h-4" />
              </button>
              <button
                className="bg-white text-zinc-900 border-2 border-zinc-100 px-8 py-4 rounded-2xl font-black text-sm hover:bg-zinc-50 transition-all active:scale-95"
              >
                Saiba Mais
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100 space-y-4 hover:shadow-xl transition-all group"
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${step.color}15`, color: step.color }}
                >
                  {IconMap[step.icon as string] || <Info className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                  {step.title}
                </h3>
                <p className="text-zinc-500 font-medium leading-relaxed">
                  {step.description}
                </p>
                {step.image && (
                  <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-zinc-100">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-zinc-900 tracking-tight uppercase leading-none">
                  Por que escolher a <br />
                  <span className="text-purple-600">{appName}?</span>
                </h2>
                <p className="text-zinc-600 font-medium">
                  Nossa plataforma foi desenhada para eliminar as dores de cabeça comuns na construção civil, 
                  trazendo transparência e eficiência para cada etapa da sua obra.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="text-purple-600">{feature.icon}</div>
                    <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl text-white shadow-xl shadow-purple-200">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-tight">Segurança em Primeiro Lugar</h4>
                    <p className="text-xs opacity-80 font-medium">Todos os dados são criptografados e os profissionais são validados individualmente.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="aspect-square bg-zinc-100 rounded-[3rem] overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800" 
                  alt="Construction worker"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status da Plataforma</p>
                        <p className="text-sm font-black text-zinc-900">100% Operacional</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Usuários Ativos</p>
                      <p className="text-sm font-black text-purple-600">+15.000</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-zinc-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
            PRONTO PARA <br />
            <span className="text-purple-400">TRANSFORMAR</span> SUA OBRA?
          </h2>
          <p className="text-zinc-400 font-medium max-w-xl mx-auto">
            Junte-se a milhares de profissionais e clientes que já estão usando a {appName} para construir com mais inteligência.
          </p>
          <button
            onClick={onStart}
            className="bg-white text-zinc-900 px-12 py-5 rounded-2xl font-black text-sm hover:bg-zinc-100 transition-all active:scale-95 shadow-2xl"
          >
            Começar Gratuitamente
          </button>
          
          <div className="pt-12 flex flex-wrap justify-center gap-8 opacity-50">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-white" />
              <span className="text-[10px] font-black uppercase tracking-widest">4.9/5 Avaliação média</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">+50k Downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Presente em 26 estados</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
