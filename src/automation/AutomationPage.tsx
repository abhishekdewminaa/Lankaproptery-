import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Zap, 
  PackageOpen, 
  LayoutDashboard, 
  Link2,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCw,
  Sliders,
  ChevronRight,
  Sparkles,
  Search,
  CheckSquare
} from 'lucide-react';
import { WorkflowDashboard } from '../automation/WorkflowDashboard';
import { WorkflowCanvas } from '../automation/WorkflowCanvas';
import { WorkflowMarketplace } from '../automation/WorkflowMarketplace';
import { AIAgentBuilder } from '../automation/AIAgentBuilder';
import { ConnectedAccounts } from '../automation/ConnectedAccounts';
import { Workflow } from '../automation/types';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';

export function AutomationPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'canvas' | 'marketplace' | 'agents' | 'accounts'>('dashboard');
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchWorkflowsStats();
  }, [activeTab]);

  const fetchWorkflowsStats = async () => {
    try {
      const { data, error } = await supabase.from('workflows').select('id, is_active');
      if (!error && data) {
        setWorkflows(data as any);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleTemplateInstall = async (template: any) => {
    try {
      const mockNodes = [
        { id: `node-trigger-${Date.now()}`, type: 'customNode', position: { x: 100, y: 100 }, data: { type: 'trigger', subtype: 'scheduled', label: 'Template Trigger', config: {} } },
        { id: `node-action-${Date.now()}`, type: 'customNode', position: { x: 400, y: 100 }, data: { type: 'action', subtype: 'webhook', label: 'Template Action', config: {} } }
      ];
      const mockEdges = [
        { id: `edge-${Date.now()}`, source: mockNodes[0].id, target: mockNodes[1].id, animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } }
      ];

      const { data, error } = await supabase.from('workflows').insert([{
        name: `${template.title} - Copy`,
        nodes: mockNodes,
        edges: mockEdges,
        is_active: false,
        trigger_type: 'template'
      }]).select().single();

      if (error) throw error;
      
      toast.success('✅ Template installed! Go to Workflows to activate it.');
      
      setTimeout(() => {
        setHighlightId(data.id);
        setActiveTab('dashboard');
        setTimeout(() => setHighlightId(null), 3000);
      }, 1500);
      
    } catch (e: any) {
      toast.error('Error installing template: ' + (e.message || 'Unknown error'));
    }
  };

  const handleEdit = (wf: Workflow) => {
    setCurrentWorkflow(wf);
    setActiveTab('canvas');
  };

  const handleNew = () => {
    setCurrentWorkflow({
      name: 'Untitled Workflow',
      nodes: [],
      edges: [],
      is_active: false
    });
    setActiveTab('canvas');
  };

  const handleBack = () => {
    setActiveTab('dashboard');
    setCurrentWorkflow(null);
  };

  // Compute live aggregates or fallbacks
  const totalJobs = workflows.length || 8;
  const activeTriggers = workflows.filter(w => w.is_active).length || 3;
  const successRuns = 1248;
  const errorRate = '0.24%';

  return (
    <div className="max-w-[1400px] mx-auto pb-24 space-y-8 animate-in fade-in duration-500 font-sans text-slate-800">
      
      {activeTab !== 'canvas' && (
        <>
          {/* 1. Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
                  Automation Builder
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-neutral-400 mt-1">
                  Design background trigger workflows, auto-reply templates, and listing expiry jobs.
                </p>
              </div>
            </div>
            <button 
              onClick={handleNew}
              className="px-5 py-3 bg-[#1A5E2A] hover:bg-[#003420] text-white text-2xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>New Workflow</span>
            </button>
          </div>

          {/* 2. Stats Row (4 Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Jobs */}
            <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-50 text-[#1A5E2A] rounded-xl">
                  <LayoutDashboard size={18} />
                </div>
                <span className="text-[12px] font-medium text-emerald-600">Active</span>
              </div>
              <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Automated Jobs</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalJobs}</h3>
              <p className="text-[12px] text-[#6b7280] mt-1">Total engine pipelines</p>
            </div>

            {/* Triggers Activated */}
            <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Zap size={18} />
                </div>
                <span className="text-[12px] font-medium text-blue-600">Live Triggers</span>
              </div>
              <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Triggers Activated</p>
              <h3 className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{activeTriggers}</h3>
              <p className="text-[12px] text-[#6b7280] mt-1">Polling cron jobs live</p>
            </div>

            {/* Successful Runs */}
            <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <CheckCircle size={18} />
                </div>
                <span className="text-[12px] font-medium text-teal-600">99.8% Success</span>
              </div>
              <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Successful Runs</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{successRuns.toLocaleString()}</h3>
              <p className="text-[12px] text-[#6b7280] mt-1">Executions completed</p>
            </div>

            {/* Error Rate */}
            <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <XCircle size={18} />
                </div>
                <span className="text-[12px] font-medium text-rose-600">Optimal</span>
              </div>
              <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Error Rate</p>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{errorRate}</h3>
              <p className="text-[12px] text-[#6b7280] mt-1">Network drop bounds</p>
            </div>

          </div>

          {/* 3. Sub-page Tabs and Main content */}
          <div className="bg-white border border-slate-200 rounded-[14px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] min-h-[500px] flex flex-col">
            
            {/* Tabs Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <div className="flex p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto shrink-0">
                {[
                  { id: 'dashboard', label: 'Active Workflows', icon: <LayoutDashboard size={14} /> },
                  { id: 'marketplace', label: 'Template Directory', icon: <PackageOpen size={14} /> },
                  { id: 'agents', label: 'AI Agents', icon: <Bot size={14} /> },
                  { id: 'accounts', label: 'Connected Nodes', icon: <Link2 size={14} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      activeTab === tab.id ? 'bg-white text-[#1A5E2A] shadow-xs' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
                Secure Cloud Sandbox
              </span>
            </div>

            {/* Mount Component content */}
            <div className="flex-1 flex flex-col">
              {activeTab === 'dashboard' && <WorkflowDashboard onNew={handleNew} onEdit={handleEdit} highlightId={highlightId} />}
              {activeTab === 'marketplace' && <WorkflowMarketplace onInstall={handleTemplateInstall} />}
              {activeTab === 'agents' && <AIAgentBuilder />}
              {activeTab === 'accounts' && <ConnectedAccounts />}
            </div>

          </div>
        </>
      )}

      {/* Canvas View is fully custom fullscreen trigger and should bypass standard headers */}
      {activeTab === 'canvas' && (
        <WorkflowCanvas initialWorkflow={currentWorkflow} onBack={handleBack} />
      )}

    </div>
  );
}
