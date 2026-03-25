import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { UserProfile, Ad, Review, Category } from '../types';

const CATEGORY_DATA: Record<string, { 
  name: string; 
  description: string; 
  userPhoto: string; 
  adTitle: string; 
  adDescription: string; 
  adPhoto: string;
  portfolioPhotos: string[];
}> = {
  'Arquitetura': {
    name: 'Ana Luiza Arquitetura & Design',
    description: 'Arquiteta especializada em projetos residenciais de alto padrão, focada em luxo, funcionalidade e design contemporâneo.',
    userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Projetos Arquitetônicos de Luxo',
    adDescription: 'Desenvolvemos o projeto dos seus sonhos com acompanhamento completo da obra e consultoria de interiores.',
    adPhoto: 'https://images.unsplash.com/photo-1600607687960-4a2147d2c7c6?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1600607687960-4a2147d2c7c6?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Engenharia': {
    name: 'Eng. Paulo Mendes Estruturas',
    description: 'Engenheiro Civil com vasta experiência em cálculo estrutural, gerenciamento de obras complexas e laudos técnicos.',
    userPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Cálculo Estrutural e Gestão de Obras',
    adDescription: 'Segurança e economia para sua construção. Projetos estruturais otimizados e fiscalização rigorosa.',
    adPhoto: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Técnico de Edificação': {
    name: 'Carlos Planejamento Pro',
    description: 'Técnico em Edificações focado em orçamentos detalhados, cronogramas de obra e supervisão de equipes de campo.',
    userPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Supervisão Técnica e Orçamentos',
    adDescription: 'Controle total da sua obra. Evite desperdícios com um planejamento técnico eficiente e detalhado.',
    adPhoto: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1589939705384-5185138a04b9?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Alvenaria e Estrutura': {
    name: 'Antônio Mestre de Obras',
    description: 'Especialista em alvenaria estrutural, fundações e estruturas de concreto armado para residências de alto padrão.',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Construção Civil de Alto Padrão',
    adDescription: 'Execução de obras residenciais com foco em qualidade estrutural e acabamento impecável desde a base.',
    adPhoto: 'https://images.unsplash.com/photo-1590069230002-70cc2145593f?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590069230002-70cc2145593f?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Armador': {
    name: 'Ricardo Ferragens Master',
    description: 'Armador profissional especializado em leitura de projetos estruturais e montagem de ferragens complexas.',
    userPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Montagem de Armaduras de Aço',
    adDescription: 'Corte, dobra e amarração de ferragens para vigas, colunas e lajes com precisão milimétrica.',
    adPhoto: 'https://images.unsplash.com/photo-1516216628859-9bccecab13ca?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1516216628859-9bccecab13ca?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Elétrica': {
    name: 'Ricardo Elétrica Pro',
    description: 'Especialista em instalações elétricas de alto padrão, automação residencial e projetos de iluminação técnica.',
    userPhoto: 'https://images.unsplash.com/photo-1590650046871-92c887180603?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Instalações Elétricas e Automação',
    adDescription: 'Serviços elétricos completos com foco em segurança, eficiência energética e tecnologia de ponta.',
    adPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1558402529-d2638a7023e9?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1454165833767-027ff33027ef?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Hidráulica': {
    name: 'Marcos Hidráulica Master',
    description: 'Soluções avançadas em hidráulica. Instalação de metais de luxo, aquecimento solar e detecção de vazamentos.',
    userPhoto: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Projetos e Reparos Hidráulicos',
    adDescription: 'Instalação completa de sistemas de água e esgoto com materiais de alta durabilidade e acabamento fino.',
    adPhoto: 'https://images.unsplash.com/photo-1585704032915-c3400ca1f963?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585704032915-c3400ca1f963?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Telhados e Calhas': {
    name: 'Fernando Telhados Finos',
    description: 'Mestre telhadista especializado em coberturas de alto padrão, telhas cerâmicas, metálicas e sistemas de calhas.',
    userPhoto: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Construção de Telhados e Coberturas',
    adDescription: 'Execução de telhados com madeiramento tratado, isolamento térmico e acabamento estético superior.',
    adPhoto: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1632759145351-1d592919f522?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Gesso e Drywall': {
    name: 'Felipe Gesso & Design',
    description: 'Especialista em forros de gesso acartonado, sancas iluminadas e divisórias drywall com acabamento de luxo.',
    userPhoto: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Gesso Decorativo e Drywall',
    adDescription: 'Transforme seus ambientes com designs exclusivos em gesso e a praticidade do drywall de alta performance.',
    adPhoto: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Pisos e Revestimentos': {
    name: 'Marcelo Revestimentos Nobres',
    description: 'Azulejista especializado em porcelanatos de grandes formatos, mármores e pedras naturais para áreas de luxo.',
    userPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Assentamento de Pisos de Alto Padrão',
    adDescription: 'Acabamento impecável com nivelamento a laser para porcelanatos, pastilhas e revestimentos especiais.',
    adPhoto: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Pintura e Acabamento': {
    name: 'Sandro Pinturas Artísticas',
    description: 'Pintor de alto acabamento. Especialista em texturas decorativas, laqueação de portas e pinturas mecanizadas.',
    userPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Pintura Residencial Premium',
    adDescription: 'Pintura interna e externa com foco em detalhes, limpeza e utilização de materiais de primeira linha.',
    adPhoto: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Marcenaria': {
    name: 'Julio Móveis Planejados',
    description: 'Designer de móveis e marceneiro focado em peças exclusivas sob medida com madeiras nobres e ferragens premium.',
    userPhoto: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Móveis Sob Medida e Design',
    adDescription: 'Cozinhas gourmet, closets e home offices planejados para unir beleza e máxima funcionalidade.',
    adPhoto: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1538688598167-6b89a3e33259?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Serralheria': {
    name: 'Luiz Serralheria Artística',
    description: 'Serralheiro especializado em estruturas metálicas leves, portões de design e detalhes em aço inox.',
    userPhoto: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Serralheria Fina e Estruturas',
    adDescription: 'Fabricação de portões, grades e estruturas metálicas com acabamento superior e durabilidade.',
    adPhoto: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516216628859-9bccecab13ca?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Ajudante': {
    name: 'Bruno Auxiliar Pro',
    description: 'Ajudante especializado em suporte técnico para diversas áreas da construção, focado em organização e agilidade.',
    userPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Auxiliar Técnico de Obra',
    adDescription: 'Suporte eficiente em todas as etapas da construção, garantindo canteiro limpo e materiais prontos.',
    adPhoto: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Limpeza Pós-Obra': {
    name: 'CleanPro Serviços Master',
    description: 'Especialista em limpeza técnica profunda para imóveis recém-construídos ou reformados de alto padrão.',
    userPhoto: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Limpeza Pós-Obra Especializada',
    adDescription: 'Remoção técnica de resíduos de obra com produtos específicos que não danificam seus revestimentos nobres.',
    adPhoto: 'https://images.unsplash.com/photo-1581578731522-5b17b8827dea?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581578731522-5b17b8827dea?q=80&w=400&auto=format&fit=crop'
    ]
  },
  'Outros': {
    name: 'Carlos Serviços Gerais',
    description: 'Manutenção residencial completa e reparos rápidos com foco em qualidade e atendimento personalizado.',
    userPhoto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=200&auto=format&fit=crop',
    adTitle: 'Manutenção e Reparos Residenciais',
    adDescription: 'Soluções práticas para o dia a dia da sua casa. Atendimento ágil para pequenos reparos e instalações.',
    adPhoto: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=800&auto=format&fit=crop',
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop'
    ]
  }
};

export const seedDatabase = async () => {
  try {
    const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
    if (!usersSnap.empty) {
      console.log('Database already has users, skipping seed.');
      return;
    }

    console.log('Starting seed process...');

    const reviewComments = [
      'Excelente profissional! Super recomendo, trabalho de altíssima qualidade.',
      'Muito pontual e organizado. O resultado final superou minhas expectativas.',
      'Serviço impecável e preço justo. Com certeza contratarei novamente.',
      'Profissional muito educado e atencioso. Resolveu meu problema rapidamente.',
      'Trabalho de mestre! Nota 10 em todos os quesitos.'
    ];

    for (const [category, data] of Object.entries(CATEGORY_DATA)) {
      const userId = `seed-user-${category.toLowerCase().replace(/\s+/g, '-')}`;
      const adId = `seed-ad-${category.toLowerCase().replace(/\s+/g, '-')}`;
      
      const user: UserProfile = {
        uid: userId,
        username: data.name.toLowerCase().replace(/\s+/g, '_'),
        displayName: data.name,
        role: 'professional',
        category: category as Category,
        photoURL: data.userPhoto,
        description: data.description,
        rating: 4.8 + Math.random() * 0.2,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        createdAt: Date.now(),
        plan: 'premium',
        status: 'approved',
        phone: '(11) 9' + Math.floor(10000000 + Math.random() * 90000000),
        location: 'São Paulo, SP',
        skills: [category, 'Construção Civil', 'Reforma'],
        portfolio: data.portfolioPhotos.map((photo, i) => ({
          id: `seed-portfolio-${userId}-${i}`,
          userId: userId,
          title: `Trabalho Realizado ${i + 1}`,
          description: 'Execução de serviço com alto padrão de qualidade e acabamento.',
          images: [photo],
          rating: 5,
          reviewCount: 1,
          createdAt: Date.now()
        }))
      };

      const ad: Ad = {
        id: adId,
        title: data.adTitle,
        description: data.adDescription,
        price: 150 + Math.floor(Math.random() * 500),
        category: category as Category,
        imageUrl: data.adPhoto,
        sellerId: userId,
        sellerName: data.name,
        sellerPhoto: data.userPhoto,
        location: {
          lat: -23.5505 + (Math.random() - 0.5) * 0.1,
          lng: -46.6333 + (Math.random() - 0.5) * 0.1,
          address: 'São Paulo, SP'
        },
        status: 'active',
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'users', userId), user);
      await setDoc(doc(db, 'ads', adId), ad);

      // Add multiple reviews
      for (let i = 0; i < 3; i++) {
        const reviewId = `seed-review-${userId}-${i}`;
        const review: Review = {
          id: reviewId,
          adId: adId,
          reviewerId: `system-reviewer-${i}`,
          reviewerName: ['João Silva', 'Maria Santos', 'Pedro Oliveira'][i],
          targetUserId: userId,
          rating: 5,
          comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
          createdAt: Date.now() - (i * 86400000) // Different days
        };
        await setDoc(doc(db, 'reviews', reviewId), review);
      }
    }

    console.log('Seed process completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
