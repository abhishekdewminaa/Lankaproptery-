import React, { useState } from 'react';
import { Bot, Zap, PackageOpen, LayoutDashboard } from 'lucide-react';
import { WorkflowDashboard } from '../automation/WorkflowDashboard';
import { WorkflowCanvas } from '../automation/WorkflowCanvas';
import { WorkflowMarketplace } from '../automation/WorkflowMarketplace';
import { AIAgentBuilder } from '../automation/AIAgentBuilder';
import { Workflow } from '../automation/types';

export function AutomationPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'canvas' | 'marketplace' | 'agents'>('dashboard');
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);

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
    <div className="h-[calc(100vh-2rem)] flex flex-col font-sans bg-gray-50 text-gray-900">
      {/* Header Tabs */}
      {activeTab !== 'canvas' && (
        <div className="flex items-center gap-6 px-8 py-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-black flex items-center gap-2 text-gray-900">
            <Zap className="text-blue-500" /> Automations
          </h1>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <LayoutDashboard size={16} /> Workflows
          </button>
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'marketplace' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <PackageOpen size={16} /> Templates
          </button>
          <button 
            onClick={() => setActiveTab('agents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'agents' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <Bot size={16} /> AI Agents
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'dashboard' && <WorkflowDashboard onNew={handleNew} onEdit={handleEdit} />}
        {activeTab === 'canvas' && <WorkflowCanvas initialWorkflow={currentWorkflow} onBack={handleBack} />}
        {activeTab === 'marketplace' && <WorkflowMarketplace onInstall={handleNew} />}
        {activeTab === 'agents' && <AIAgentBuilder />}
      </div>
    </div>
  );
}
