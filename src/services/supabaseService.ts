import { supabase } from '../supabase';
import { Ad, UserProfile, Review, AppSettings } from '../types';

export const supabaseService = {
  // Profiles
  async getProfile(uid: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as UserProfile;
  },

  async updateProfile(profile: UserProfile): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: profile.uid,
        username: profile.username,
        display_name: profile.displayName,
        role: profile.role,
        client_type: profile.clientType,
        photo_url: profile.photoURL,
        description: profile.description,
        rating: profile.rating,
        review_count: profile.reviewCount,
        plan: profile.plan,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        instagram: profile.instagram,
        location: profile.location ? JSON.stringify(profile.location) : null,
        category: profile.category,
        helper_specialty: profile.helperSpecialty,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  // Ads
  async getAds(): Promise<Ad[]> {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching ads:', error);
      return [];
    }
    return data.map(ad => ({
      ...ad,
      sellerId: ad.seller_id,
      sellerName: ad.seller_name,
      sellerPhoto: ad.seller_photo,
      imageUrl: ad.image_url,
      createdAt: new Date(ad.created_at).getTime()
    })) as unknown as Ad[];
  },

  async createAd(ad: Ad): Promise<void> {
    const { error } = await supabase
      .from('ads')
      .insert({
        title: ad.title,
        description: ad.description,
        price: ad.price,
        category: ad.category,
        image_url: ad.imageUrl,
        seller_id: ad.sellerId,
        seller_name: ad.sellerName,
        seller_photo: ad.sellerPhoto,
        status: ad.status
      });

    if (error) throw error;
  },

  // Settings
  async getSettings(): Promise<AppSettings | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'global')
      .single();
    
    if (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
    return data as unknown as AppSettings;
  },

  async updateSettings(settings: AppSettings): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .upsert({
        id: 'global',
        ...settings,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async getProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
    return data.map(p => ({
      ...p,
      uid: p.id,
      displayName: p.display_name,
      photoURL: p.photo_url,
      clientType: p.client_type,
      helperSpecialty: p.helper_specialty,
      createdAt: new Date(p.created_at).getTime()
    })) as unknown as UserProfile[];
  }
};
