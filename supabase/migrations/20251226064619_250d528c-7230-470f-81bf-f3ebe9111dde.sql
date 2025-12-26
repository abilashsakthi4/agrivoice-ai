-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'ta',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create detections table for plant disease history
CREATE TABLE public.detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_hash TEXT NOT NULL,
  is_healthy BOOLEAN NOT NULL DEFAULT false,
  disease_name_ta TEXT,
  disease_name_en TEXT,
  confidence INTEGER DEFAULT 100,
  cause_ta TEXT,
  cause_en TEXT,
  remedy_organic_ta TEXT,
  remedy_organic_en TEXT,
  remedy_chemical_ta TEXT,
  remedy_chemical_en TEXT,
  remedy_traditional_ta TEXT,
  remedy_traditional_en TEXT,
  plant_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create image_cache table for instant results on duplicate images
CREATE TABLE public.image_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_hash TEXT NOT NULL UNIQUE,
  detection_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_cache ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles RLS policies
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Detections RLS policies
CREATE POLICY "Users can view their own detections"
  ON public.detections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own detections"
  ON public.detections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own detections"
  ON public.detections FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all detections"
  ON public.detections FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Image cache RLS policies (public read for caching, authenticated insert)
CREATE POLICY "Anyone can read image cache"
  ON public.image_cache FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert to cache"
  ON public.image_cache FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for plant images
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-images', 'plant-images', true);

-- Storage policies for plant images
CREATE POLICY "Anyone can view plant images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'plant-images');

CREATE POLICY "Authenticated users can upload plant images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'plant-images');

CREATE POLICY "Users can delete their own plant images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'plant-images' AND auth.uid()::text = (storage.foldername(name))[1]);