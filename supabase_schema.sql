-- ====================================================================
-- RIVAAZ LUXURY AI STUDIO - SUPABASE DATABASE MIGRATION SCHEMA
-- ====================================================================
-- This schema initializes persistent cloud storage for Virtual Try-On
-- reference photos and saved gallery looks with Row Level Security (RLS).
-- ====================================================================

-- 1. Create table for storing user reference photos (up to 2 per user)
CREATE TABLE IF NOT EXISTS public.tryon_photos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    url TEXT,
    data_url TEXT,
    name TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for storing generated AI Try-On gallery looks
CREATE TABLE IF NOT EXISTS public.tryon_gallery (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tryon_image_url TEXT,
    photo_used_url TEXT,
    product_data JSONB DEFAULT '{}'::jsonb,
    stylist_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Indexes for fast querying by user_id and creation date
CREATE INDEX IF NOT EXISTS idx_tryon_photos_user_id ON public.tryon_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_tryon_gallery_user_id_created ON public.tryon_gallery(user_id, created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.tryon_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryon_gallery ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for tryon_photos
-- Note: Since Rivaaz authenticates users via Shopify Customer Accounts (and uses Shopify Customer IDs
-- or 'guest' as user_id), requests from the frontend client use the Supabase Anon Key without Supabase Auth.
-- Therefore, we allow anonymous read/write access filtered by user_id from the application layer.

CREATE POLICY "Allow public read access to tryon_photos"
    ON public.tryon_photos
    FOR SELECT
    USING (true);

CREATE POLICY "Allow insert to tryon_photos"
    ON public.tryon_photos
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update to tryon_photos"
    ON public.tryon_photos
    FOR UPDATE
    USING (true);

CREATE POLICY "Allow delete from tryon_photos"
    ON public.tryon_photos
    FOR DELETE
    USING (true);

-- 6. Create RLS Policies for tryon_gallery

CREATE POLICY "Allow public read access to tryon_gallery"
    ON public.tryon_gallery
    FOR SELECT
    USING (true);

CREATE POLICY "Allow insert to tryon_gallery"
    ON public.tryon_gallery
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update to tryon_gallery"
    ON public.tryon_gallery
    FOR UPDATE
    USING (true);

CREATE POLICY "Allow delete from tryon_gallery"
    ON public.tryon_gallery
    FOR DELETE
    USING (true);

-- 7. Create table for storing user consents
CREATE TABLE IF NOT EXISTS public.user_consents (
    user_id TEXT PRIMARY KEY,
    consent_given BOOLEAN DEFAULT true,
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for user_consents
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Policies for user_consents
CREATE POLICY "Allow public read access to user_consents"
    ON public.user_consents
    FOR SELECT
    USING (true);

CREATE POLICY "Allow insert to user_consents"
    ON public.user_consents
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update to user_consents"
    ON public.user_consents
    FOR UPDATE
    USING (true);

CREATE POLICY "Allow delete from user_consents"
    ON public.user_consents
    FOR DELETE
    USING (true);
