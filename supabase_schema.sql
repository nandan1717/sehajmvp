-- ====================================================================
-- SEHAJ LUXURY AI STUDIO - SUPABASE DATABASE MIGRATION SCHEMA
-- ====================================================================
-- This schema initializes persistent cloud storage for Virtual Try-On
-- reference photos and saved gallery looks with strict Row Level Security (RLS).
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

-- 5. Drop old permissive or guest policies (safe to run multiple times)
DROP POLICY IF EXISTS "Allow public read access to tryon_photos" ON public.tryon_photos;
DROP POLICY IF EXISTS "Allow insert to tryon_photos" ON public.tryon_photos;
DROP POLICY IF EXISTS "Allow update to tryon_photos" ON public.tryon_photos;
DROP POLICY IF EXISTS "Allow delete from tryon_photos" ON public.tryon_photos;
DROP POLICY IF EXISTS "Users can read own photos" ON public.tryon_photos;
DROP POLICY IF EXISTS "Users can insert own photos" ON public.tryon_photos;
DROP POLICY IF EXISTS "Users can update own photos" ON public.tryon_photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON public.tryon_photos;

DROP POLICY IF EXISTS "Allow public read access to tryon_gallery" ON public.tryon_gallery;
DROP POLICY IF EXISTS "Allow insert to tryon_gallery" ON public.tryon_gallery;
DROP POLICY IF EXISTS "Allow update to tryon_gallery" ON public.tryon_gallery;
DROP POLICY IF EXISTS "Allow delete from tryon_gallery" ON public.tryon_gallery;
DROP POLICY IF EXISTS "Users can read own gallery" ON public.tryon_gallery;
DROP POLICY IF EXISTS "Users can insert own gallery" ON public.tryon_gallery;
DROP POLICY IF EXISTS "Users can update own gallery" ON public.tryon_gallery;
DROP POLICY IF EXISTS "Users can delete own gallery" ON public.tryon_gallery;

-- 6. Create STRICT RLS Policies for tryon_photos
-- STRICT ISOLATION: User A can only read, insert, update, or delete User A's data.
-- User B cannot access User A's data. Anonymous requests (coalesce = NULL) are blocked.

CREATE POLICY "Users can read own photos"
    ON public.tryon_photos
    FOR SELECT
    USING (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );

CREATE POLICY "Users can insert own photos"
    ON public.tryon_photos
    FOR INSERT
    WITH CHECK (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );

CREATE POLICY "Users can update own photos"
    ON public.tryon_photos
    FOR UPDATE
    USING (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );

CREATE POLICY "Users can delete own photos"
    ON public.tryon_photos
    FOR DELETE
    USING (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );

-- 7. Create STRICT RLS Policies for tryon_gallery

CREATE POLICY "Users can read own gallery"
    ON public.tryon_gallery
    FOR SELECT
    USING (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );

CREATE POLICY "Users can insert own gallery"
    ON public.tryon_gallery
    FOR INSERT
    WITH CHECK (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );

CREATE POLICY "Users can update own gallery"
    ON public.tryon_gallery
    FOR UPDATE
    USING (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );

CREATE POLICY "Users can delete own gallery"
    ON public.tryon_gallery
    FOR DELETE
    USING (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );

-- 8. Create table for storing user consents
CREATE TABLE IF NOT EXISTS public.user_consents (
    user_id TEXT PRIMARY KEY,
    consent_given BOOLEAN DEFAULT true,
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for user_consents
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow public read access to user_consents" ON public.user_consents;
DROP POLICY IF EXISTS "Allow insert to user_consents" ON public.user_consents;
DROP POLICY IF EXISTS "Allow update to user_consents" ON public.user_consents;
DROP POLICY IF EXISTS "Allow delete from user_consents" ON public.user_consents;
DROP POLICY IF EXISTS "Users can read own consent" ON public.user_consents;
DROP POLICY IF EXISTS "Users can insert own consent" ON public.user_consents;
DROP POLICY IF EXISTS "Users can update own consent" ON public.user_consents;
DROP POLICY IF EXISTS "Users can delete own consent" ON public.user_consents;

-- Strict policies for user_consents
CREATE POLICY "Users can read own consent"
    ON public.user_consents
    FOR SELECT
    USING (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );

CREATE POLICY "Users can insert own consent"
    ON public.user_consents
    FOR INSERT
    WITH CHECK (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );

CREATE POLICY "Users can update own consent"
    ON public.user_consents
    FOR UPDATE
    USING (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );

CREATE POLICY "Users can delete own consent"
    ON public.user_consents
    FOR DELETE
    USING (
        user_id = coalesce(
            (current_setting('request.headers', true)::jsonb ->> 'x-user-id'),
            current_setting('request.header.x-user-id', true),
            (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )
    );
