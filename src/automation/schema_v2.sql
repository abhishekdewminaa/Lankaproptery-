-- Add to workflows table:
ALTER TABLE public.workflows
ADD COLUMN IF NOT EXISTS folder TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS version_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS total_runs INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_runs INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_runs INTEGER DEFAULT 0;

-- AI Agents table
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  personality TEXT,
  instructions TEXT,
  greeting TEXT,
  knowledge_base JSONB,
  is_active BOOLEAN DEFAULT true,
  total_chats INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow versions
CREATE TABLE IF NOT EXISTS public.workflow_versions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  version INTEGER,
  nodes JSONB,
  edges JSONB,
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read ai_agents" ON public.ai_agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert ai_agents" ON public.ai_agents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update ai_agents" ON public.ai_agents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete ai_agents" ON public.ai_agents FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read workflow_versions" ON public.workflow_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert workflow_versions" ON public.workflow_versions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update workflow_versions" ON public.workflow_versions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete workflow_versions" ON public.workflow_versions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow anon all ai_agents" ON public.ai_agents FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all workflow_versions" ON public.workflow_versions FOR ALL TO anon USING (true) WITH CHECK (true);
