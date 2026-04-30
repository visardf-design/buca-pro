import { supabase } from '../supabase';
import { UserProfile, Ad, Review, Category } from '../types';

const REVIEW_COMMENTS = [
  'Excelente profissional, muito detalhista e educado.',
  'Trabalho de altíssima qualidade, entregou antes do prazo.',
  'Muito pontual e organizado. Recomendo fortemente.',
  'Preço justo e serviço impecável. Com certeza chamarei novamente.',
  'Resolveu meu problema rapidamente, muito técnico e atencioso.',
  'Melhor custo-benefício que já encontrei na plataforma.',
  'Profissional honesto e transparente em todas as etapas da obra.',
  'Limpeza nota 10 após o serviço, nem parece que teve obra aqui.',
  'Pessoa muito prestativa, deu excelentes sugestões para o meu projeto.'
];

const NAMES = [
  'Ricardo', 'Ana', 'Carlos', 'Juliana', 'José', 'Maria', 'Sérgio', 'Fernanda', 'Paulo', 'Roberto',
  'Claudia', 'Antônio', 'Marcos', 'Luiz', 'Bruna', 'Felipe', 'Marcelo', 'Julio', 'Sandro', 'Fabiano'
];

const SURNAMES = [
  'Silva', 'Oliveira', 'Santos', 'Mendes', 'Nunes', 'Rocha', 'Ferraz', 'Alves', 'Pereira', 'Souza',
  'Lima', 'Costa', 'Martins', 'Gustavo', 'Albuquerque', 'Macedo', 'Teixeira', 'Cardoso'
];

// Helper to get professional photo based on category
const getPhoto = (category: string, type: 'user' | 'ad', index: number) => {
  const keywords: Record<string, string> = {
    'Arquitetura': 'luxury-modern-house-architecture',
    'Engenharia': 'construction-engineer-civil',
    'Técnico de Edificação': 'building-technical-plan',
    'Alvenaria e Estrutura': 'bricklayer-working-construction',
    'Armador': 'rebar-structural-steel',
    'Elétrica': 'electrician-panel-wiring',
    'Hidráulica': 'plumbing-pipes-tools',
    'Telhados e Calhas': 'roof-installation-house',
    'Gesso e Drywall': 'interior-plaster-drywall',
    'Pisos e Revestimentos': 'ceramic-tile-installation',
    'Pintura e Acabamento': 'professional-painter-wall',
    'Marcenaria': 'carpentry-furniture-workshop',
    'Serralheria': 'welding-metal-structure',
    'Ajudante': 'site-worker-helping',
    'Limpeza Pós-Obra': 'cleaning-service-janitor',
    'Outros': 'home-repair-maintenance'
  };

  const kw = keywords[category] || 'construction';
  const width = type === 'user' ? 400 : 1200;
  const height = type === 'user' ? 400 : 800;
  // Use source.unsplash.com for easier keyword-based realistic images
  return `https://source.unsplash.com/featured/${width}x${height}/?${encodeURIComponent(kw)}&sig=${index}`;
};

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export const seedDatabase = async (force: boolean = false) => {
  try {
    if (!force) {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (!error && count && count > 0) {
        console.log('Database already has users, skipping seed.');
        return;
      }
    }

    console.log('Starting seed process (3 pros per category)...');

    const categories: Category[] = [
      'Arquitetura', 'Engenharia', 'Técnico de Edificação', 'Alvenaria e Estrutura',
      'Armador', 'Elétrica', 'Hidráulica', 'Telhados e Calhas', 'Gesso e Drywall',
      'Pisos e Revestimentos', 'Pintura e Acabamento', 'Marcenaria', 'Serralheria',
      'Ajudante', 'Limpeza Pós-Obra', 'Outros'
    ];

    for (const category of categories) {
      // Create 3 professionals per category
      for (let i = 1; i <= 3; i++) {
        const idSuffix = `${category.toLowerCase().replace(/\s+/g, '-')}-${i}`;
        const userId = `seed-user-${idSuffix}`;
        const adId = `seed-ad-${idSuffix}`;
        
        const firstName = getRandom(NAMES);
        const lastName = getRandom(SURNAMES);
        const fullName = `${firstName} ${lastName} ${i > 1 ? lastName : ''}`.trim();
        const userPhoto = `https://i.pravatar.cc/150?u=${userId}`; // Consistent avatars

        const user: UserProfile = {
          uid: userId,
          username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`,
          displayName: fullName,
          role: 'professional',
          category: category,
          photoURL: userPhoto,
          description: `Profissional especializado em ${category.toLowerCase()} com foco em qualidade, pontualidade e satisfação do cliente. Mais de ${5 + i} anos de experiência no mercado de construção civil de São Paulo.`,
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: 5 + Math.floor(Math.random() * 45),
          createdAt: Date.now() - (Math.random() * 10000000000),
          plan: Math.random() > 0.5 ? 'premium' : 'free',
          status: 'approved',
          phone: '(11) 9' + Math.floor(10000000 + Math.random() * 90000000),
          location: 'São Paulo, SP',
          skills: [category, 'Construção Civil', 'Reforma', 'Acabamento'],
          portfolio: []
        };

        const ad: Ad = {
          id: adId,
          title: `Serviços Profissionais de ${category}`,
          description: `Ofereço as melhores soluções em ${category.toLowerCase()} para sua obra ou reforma. Atendimento personalizado, orçamento sem compromisso e garantia de execução técnica conforme as normas brasileiras.`,
          price: 100 + Math.floor(Math.random() * 1000),
          category: category,
          imageUrl: getPhoto(category, 'ad', i),
          sellerId: userId,
          sellerName: fullName,
          sellerPhoto: userPhoto,
          location: {
            lat: -23.5505 + (Math.random() - 0.5) * 0.2,
            lng: -46.6333 + (Math.random() - 0.5) * 0.2,
            address: 'São Paulo, SP'
          },
          status: 'active',
          createdAt: Date.now() - (Math.random() * 5000000000)
        };

        // Supabase uses 'id' instead of 'uid' for auth mapping, but for seed we can use what we have
        // In a real app, you can't just insert into 'auth.users' easily, we'd seed 'profiles'
        await supabase.from('profiles').upsert({
          id: userId,
          username: user.username,
          display_name: user.displayName,
          role: user.role,
          photo_url: user.photoURL,
          description: user.description,
          rating: user.rating,
          review_count: user.reviewCount,
          plan: user.plan,
          phone: user.phone,
          location: user.location,
          category: user.category,
          created_at: new Date(user.createdAt).toISOString()
        });

        await supabase.from('ads').upsert({
          id: adId,
          title: ad.title,
          description: ad.description,
          price: ad.price,
          category: ad.category,
          image_url: ad.imageUrl,
          seller_id: userId,
          seller_name: ad.sellerName,
          seller_photo: ad.sellerPhoto,
          status: ad.status,
          created_at: new Date(ad.createdAt).toISOString()
        });

        // Add 3-5 random reviews per user
        const reviewNum = 3 + Math.floor(Math.random() * 3);
        for (let r = 0; r < reviewNum; r++) {
          const reviewId = `seed-review-${userId}-${r}`;
          const review: Review = {
            id: reviewId,
            adId: adId,
            reviewerId: `system-reviewer-${r}`,
            reviewerName: `${getRandom(NAMES)} ${getRandom(SURNAMES)}`,
            targetUserId: userId,
            rating: 4 + Math.round(Math.random()), // 4 or 5 stars
            comment: getRandom(REVIEW_COMMENTS),
            createdAt: Date.now() - (Math.random() * 5000000000)
          };
          
          await supabase.from('reviews').upsert({
            id: reviewId,
            ad_id: adId,
            reviewer_id: review.reviewerId,
            reviewer_name: review.reviewerName,
            target_user_id: userId,
            rating: review.rating,
            comment: review.comment,
            created_at: new Date(review.createdAt).toISOString()
          });
        }
      }
    }

    console.log('Seed process completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
