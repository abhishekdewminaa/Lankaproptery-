-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT, 
  phone TEXT, 
  email TEXT, 
  message TEXT,
  property_id BIGINT, 
  property_title TEXT,
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new','contacted','viewing','negotiating','won','lost')),
  notes TEXT, 
  follow_up_date DATE,
  assigned_to TEXT, 
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leads access" ON leads FOR ALL USING (true);


-- Create newsletter tables
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  source TEXT DEFAULT 'Website Footer',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  subject TEXT,
  body TEXT,
  sent_to TEXT DEFAULT 'all',
  recipient_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Newsletter access auth" ON newsletter_subscribers FOR ALL USING (true);
CREATE POLICY "Campaigns access auth" ON newsletter_campaigns FOR ALL USING (true);
