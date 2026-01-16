-- =====================================================
-- CONTENT MANAGEMENT SYSTEM & ORGANIZATIONAL STRUCTURE
-- =====================================================

-- 1. Site Content Table (للمحتوى القابل للتعديل)
CREATE TABLE public.site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_key TEXT NOT NULL UNIQUE, -- مثل: 'vision_ar', 'mission_en', 'goal_1_ar', 'stat_members', etc.
    content_value TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'number', 'list'
    language TEXT NOT NULL DEFAULT 'ar', -- 'ar', 'en'
    section TEXT NOT NULL, -- 'about', 'statistics', 'activities', 'hero'
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public can view all content
CREATE POLICY "Public can view site content"
ON public.site_content
FOR SELECT
USING (true);

-- Only admins can modify content
CREATE POLICY "Admins can manage site content"
ON public.site_content
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Organizational Structure Roles Enum
CREATE TYPE public.structure_role AS ENUM (
    'president',        -- رئيس الكيان
    'coordinator',      -- منسق
    'committee_head',   -- رئيس لجنة
    'committee_deputy'  -- نائب رئيس لجنة
);

-- 3. Organizational Structure Table
CREATE TABLE public.organizational_structure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name_ar TEXT NOT NULL,
    full_name_en TEXT,
    role structure_role NOT NULL,
    committee_id UUID REFERENCES public.committees(id) NULL, -- NULL for president/coordinators
    position_title_ar TEXT, -- مثل: "رئيس الكيان"
    position_title_en TEXT,
    bio_ar TEXT,
    bio_en TEXT,
    photo_url TEXT,
    email TEXT,
    phone TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.organizational_structure ENABLE ROW LEVEL SECURITY;

-- Public can view active structure
CREATE POLICY "Public can view organizational structure"
ON public.organizational_structure
FOR SELECT
USING (is_active = true);

-- Admins can manage structure
CREATE POLICY "Admins can manage organizational structure"
ON public.organizational_structure
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Events Table (للفعاليات البارزة)
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar TEXT NOT NULL,
    title_en TEXT,
    description_ar TEXT,
    description_en TEXT,
    event_date DATE,
    is_featured BOOLEAN NOT NULL DEFAULT false, -- للفعاليات البارزة (مثل فعاليات 2025)
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can view events
CREATE POLICY "Public can view events"
ON public.events
FOR SELECT
USING (true);

-- Admins can manage events
CREATE POLICY "Admins can manage events"
ON public.events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create indexes for faster queries
CREATE INDEX idx_site_content_key ON public.site_content(content_key);
CREATE INDEX idx_site_content_section ON public.site_content(section);
CREATE INDEX idx_organizational_structure_role ON public.organizational_structure(role);
CREATE INDEX idx_organizational_structure_active ON public.organizational_structure(is_active);
CREATE INDEX idx_events_featured ON public.events(is_featured);

-- Updated_at trigger for new tables
CREATE TRIGGER update_site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizational_structure_updated_at
    BEFORE UPDATE ON public.organizational_structure
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
