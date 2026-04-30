-- SQL Schema for Supabase Migration

-- Users Table (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('professional', 'client')),
  client_type TEXT,
  photo_url TEXT,
  description TEXT,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  plan TEXT DEFAULT 'free',
  phone TEXT,
  whatsapp TEXT,
  instagram TEXT,
  location TEXT,
  category TEXT,
  helper_specialty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads Table
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC,
  category TEXT NOT NULL,
  image_url TEXT,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_name TEXT NOT NULL,
  seller_photo TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_name TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- App Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  app_name TEXT NOT NULL,
  app_description TEXT,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  contact_email TEXT,
  primary_color TEXT,
  accent_color TEXT,
  global_alert TEXT,
  show_live_counter BOOLEAN DEFAULT FALSE,
  live_counter_value INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public ads are viewable by everyone" ON public.ads
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ads" ON public.ads
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own ads" ON public.ads
  FOR UPDATE USING (auth.uid() = seller_id);
