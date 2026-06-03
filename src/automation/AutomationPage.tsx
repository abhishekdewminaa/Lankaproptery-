import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Zap, PackageOpen, LayoutDashboard, Link2 } from 'lucide-react';
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

  const handleTemplateInstall = async (template: any) => {
    try {
      // Mock nodes for a template based on its 'nodes' text description
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

  return (
    <div className="min-h-screen flex flex-col font-sans bg-transparent">
      {/* Header Tabs */}
      {activeTab !== 'canvas' && (
        <div className="flex items-center gap-6 px-8 py-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-black flex items-center gap-2 text-gray-900">
            <Zap className="text-[#1B5E20]" />
             Social Media Automation
          </h1>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'dashboard' ? 'bg-[#1B5E20]/10 text-[#1B5E20]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <LayoutDashboard size={16} /> Workflows
          </button>
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'marketplace' ? 'bg-[#1B5E20]/10 text-[#1B5E20]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <PackageOpen size={16} /> Templates
          </button>
          <button 
            onClick={() => setActiveTab('agents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'agents' ? 'bg-[#1B5E20]/10 text-[#1B5E20]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <Bot size={16} /> AI Agents
          </button>
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'accounts' ? 'bg-[#1B5E20]/10 text-[#1B5E20]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <Link2 size={16} /> 🔗 Connected Accounts
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative border-t border-gray-200">
        {activeTab === 'dashboard' && <WorkflowDashboard onNew={handleNew} onEdit={handleEdit} highlightId={highlightId} />}
        {activeTab === 'canvas' && <WorkflowCanvas initialWorkflow={currentWorkflow} onBack={handleBack} />}
        {activeTab === 'marketplace' && <WorkflowMarketplace onInstall={handleTemplateInstall} />}
        {activeTab === 'agents' && <AIAgentBuilder />}
        {activeTab === 'accounts' && <ConnectedAccounts />}
      </div>
    </div>
  );
}
