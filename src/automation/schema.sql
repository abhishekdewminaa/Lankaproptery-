-- Create workflows table
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    edges JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT false,
    trigger_type TEXT,
    last_run_at TIMESTAMPTZ,
    run_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workflow_logs table
CREATE TABLE IF NOT EXISTS public.workflow_logs (
    id TEXT PRIMARY KEY,
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    triggered_by TEXT,
    status TEXT NOT NULL, -- 'success', 'failed', 'running'
    duration_ms INTEGER,
    ran_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (Admin portal typically uses service role or authenticated admin)
CREATE POLICY "Allow authenticated read workflows" ON public.workflows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert workflows" ON public.workflows FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update workflows" ON public.workflows FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete workflows" ON public.workflows FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read workflow_logs" ON public.workflow_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert workflow_logs" ON public.workflow_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update workflow_logs" ON public.workflow_logs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete workflow_logs" ON public.workflow_logs FOR DELETE TO authenticated USING (true);

-- Allow public read for logs just in case (optional, depends on security model)
-- For this prototype, if the app uses anonymous key, we should let anon access it
CREATE POLICY "Allow anon all workflows" ON public.workflows FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all workflow_logs" ON public.workflow_logs FOR ALL TO anon USING (true) WITH CHECK (true);
