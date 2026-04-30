export type Category = 
  | 'Arquitetura' 
  | 'Engenharia' 
  | 'Técnico de Edificação' 
  | 'Alvenaria e Estrutura' 
  | 'Armador' 
  | 'Elétrica' 
  | 'Hidráulica' 
  | 'Telhados e Calhas' 
  | 'Gesso e Drywall' 
  | 'Pisos e Revestimentos' 
  | 'Pintura e Acabamento' 
  | 'Marcenaria' 
  | 'Serralheria' 
  | 'Ajudante' 
  | 'Limpeza Pós-Obra' 
  | 'Outros';

export type HelperSpecialty =
  | 'ajudante de eletricista'
  | 'ajudante de pedreiro'
  | 'ajudante de gesseiro'
  | 'ajudante de serralheiro'
  | 'ajudante de Bombeiro Hidraulico'
  | 'ajudante carpinteiro'
  | 'ajudante de pintor'
  | 'ajudante de marceneiro'
  | 'ajudante de pos obra';

export type UserRole = 'professional' | 'client' | 'admin';
export type ClientType = 'architect' | 'engineer' | 'final_client' | 'real_estate' | 'construction_company' | 'condo' | 'commercial' | 'industrial';
export type UserFeature = 'ads' | 'chat' | 'photos' | 'profile' | 'reviews';

export interface ServiceDelivery {
  id: string;
  adId: string;
  clientId: string;
  providerId: string;
  description: string;
  media: { url: string; type: 'image' | 'video' }[];
  createdAt: number;
}

export interface ServicePortfolio {
  id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  createdAt: number;
}

export interface PortfolioItem {
  url: string;
  description?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  password?: string;
  role: UserRole;
  clientType?: ClientType;
  photoURL?: string;
  description?: string;
  rating: number;
  reviewCount: number;
  createdAt: number;
  portfolio?: ServicePortfolio[];
  portfolioPhotos?: PortfolioItem[]; // Para até 6 fotos com descrição
  blockedFeatures?: UserFeature[];
  blockedCategories?: Category[];
  blockedAdIds?: string[];
  blockedChatIds?: string[];
  blockedPhotoIds?: string[];
  blockedReviewIds?: string[];
  plan?: 'free' | 'premium';
  status: 'pending' | 'approved' | 'rejected';
  phone?: string;
  phone2?: string;
  whatsapp?: string;
  whatsapp2?: string;
  instagram?: string;
  location?: string;
  skills?: string[];
  category?: Category;
  helperSpecialty?: HelperSpecialty;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  imageUrl?: string;
  keywords?: string[];
  sellerId: string;
  sellerName: string;
  sellerPhoto?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'active' | 'completed';
  createdAt: number;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  image?: string;
}

export interface AppSettings {
  appName: string;
  appDescription: string;
  adminPassword?: string;
  maintenanceMode: boolean;
  contactEmail: string;
  primaryColor: string;
  accentColor: string;
  globalAlert: string;
  showLiveCounter: boolean;
  liveCounterValue: number;
  onboardingSteps: OnboardingStep[];
}

export interface Review {
  id: string;
  adId: string;
  reviewerId: string;
  reviewerName: string;
  targetUserId: string;
  rating: number;
  comment: string;
  createdAt: number;
}
