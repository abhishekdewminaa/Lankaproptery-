-- Create visitor_sessions table
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  session_id UUID PRIMARY KEY,
  current_page TEXT NOT NULL,
  location TEXT,
  device_type TEXT,
  referrer TEXT,
  time_on_site TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Enable Realtime
alter publication supabase_realtime add table visitor_sessions;

-- Set up Row Level Security (RLS)
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert/update their own session
CREATE POLICY "Anyone can upsert their session" 
ON visitor_sessions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update their session" 
ON visitor_sessions FOR UPDATE 
USING (true);

-- Only admins can read all sessions
CREATE POLICY "Admins can view all sessions" 
ON visitor_sessions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
  OR
  (auth.jwt() ->> 'email' IN ('abhishekdewminaa@gmail.com', 'ceo.lankaland@gmail.com'))
);
