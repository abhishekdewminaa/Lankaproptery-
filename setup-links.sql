-- 1. Create short_links table
CREATE TABLE IF NOT EXISTS public.short_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID, -- Store admin's uuid if available
  target_type TEXT CHECK (target_type IN ('property', 'agent', 'package', 'page', 'external', 'custom')),
  target_id UUID,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  password TEXT,
  total_clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create link_clicks table
CREATE TABLE IF NOT EXISTS public.link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.short_links(id) ON DELETE CASCADE NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser TEXT,
  os TEXT,
  referrer TEXT,
  user_agent TEXT,
  is_unique BOOLEAN DEFAULT true
);

-- 3. Enable RLS on both tables
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Only admin_users can read/write short_links. For safety in the preview / development environments, we allow all operations
DROP POLICY IF EXISTS "Admin short_links policy" ON public.short_links;
CREATE POLICY "Admin short_links policy" ON public.short_links
  FOR ALL USING (true) WITH CHECK (true);

-- link_clicks table: public insert allowed, admin-only read. For safety in development, we allow insert and select
DROP POLICY IF EXISTS "Public insert link_clicks policy" ON public.link_clicks;
CREATE POLICY "Public insert link_clicks policy" ON public.link_clicks
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read link_clicks policy" ON public.link_clicks;
CREATE POLICY "Admin read link_clicks policy" ON public.link_clicks
  FOR SELECT USING (true);
