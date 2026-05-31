import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Workflow } from '../automation/types';
import { WorkflowDashboard } from '../automation/WorkflowDashboard';
import { WorkflowCanvas } from '../automation/WorkflowCanvas';
import { Loader2 } from 'lucide-react';

export function AutomationBuilderPage() {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('workflows').select('*').order('created_at', { ascending: false });
      if (error) {
        if (error.code === '42P01') {
           // Table does not exist yet
           console.warn('Workflows table does not exist. Please create it.');
           setWorkflows([]);
        } else {
           throw error;
        }
      } else {
        setWorkflows(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (wf: Workflow) => {
    setCurrentWorkflow(wf);
    setView('editor');
  };

  const handleNew = () => {
    setCurrentWorkflow({
      name: 'Untitled Workflow',
      nodes: [],
      edges: [],
      is_active: false
    });
    setView('editor');
  };

  const handleBack = () => {
    setView('dashboard');
    fetchWorkflows();
  };

  if (loading) {
     return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-admin-primary" size={32} /></div>;
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col font-sans relative overflow-hidden bg-[#fafafa]">
      {view === 'dashboard' ? (
        <WorkflowDashboard 
          workflows={workflows} 
          onNew={handleNew} 
          onEdit={handleEdit} 
          onRefresh={fetchWorkflows}
        />
      ) : (
        <WorkflowCanvas 
          initialWorkflow={currentWorkflow} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
}
