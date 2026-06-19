-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT DEFAULT 'Property News',
  tags TEXT,
  author TEXT DEFAULT 'LankaProperty.lk Team',
  featured_image TEXT,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','published','scheduled')),
  publish_date TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog access" ON blog_posts FOR ALL USING (true);


-- Create property views tracking table
CREATE TABLE IF NOT EXISTS property_views (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  property_id BIGINT REFERENCES properties(id),
  property_type TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  device_type TEXT DEFAULT 'desktop',
  referrer TEXT
);
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Views access" ON property_views FOR ALL USING (true);
