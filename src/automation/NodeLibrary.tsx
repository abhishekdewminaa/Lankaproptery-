import React, { useState } from 'react';
import { Search, Zap, MousePointer2, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';

const NODE_CATALOG = [
  {
    category: 'trigger',
    color: 'bg-blue-500',
    title: 'TRIGGERS',
    icon: <Zap size={14} />,
    nodes: [
      { id: 'trigger_prop_pub', label: 'New Property Published', description: 'When a property is published to Supabase', icon: '🏠' },
      { id: 'trigger_lead_sub', label: 'New Lead Submitted', description: 'When a new lead is captured', icon: '👤' },
      { id: 'trigger_prop_stat', label: 'Property Status Changed', description: 'When a property status updates', icon: '📝' },
      { id: 'trigger_agent_reg', label: 'New Agent Registered', description: 'When an agent registers', icon: '👔' },
      { id: 'trigger_cron', label: 'Scheduled Time (cron)', description: 'Runs on a schedule', icon: '⏰' },
      { id: 'trigger_manual', label: 'Manual Trigger', description: 'Manual button click', icon: '🖱️' },
    ]
  },
  {
    category: 'action',
    color: 'bg-green-600',
    title: 'ACTIONS',
    icon: <MousePointer2 size={14} />,
    nodes: [
      { id: 'act_facebook', label: 'Post to Facebook', description: 'Publish property to Page', icon: '📘' },
      { id: 'act_instagram', label: 'Post to Instagram', description: 'Copy + open Instagram', icon: '📸' },
      { id: 'act_twitter', label: 'Post to Twitter/X', description: 'Draft a new tweet', icon: '🐦' },
      { id: 'act_email', label: 'Send Email', description: 'via EmailJS', icon: '📧' },
      { id: 'act_whatsapp', label: 'Send WhatsApp Message', description: 'Open WhatsApp Web API', icon: '💬' },
      { id: 'act_supa_upd', label: 'Update Property in Supabase', description: 'Modify database entry', icon: '🗄️' },
      { id: 'act_supa_lead', label: 'Create Lead in Supabase', description: 'Insert new lead', icon: '👤' },
      { id: 'act_webhook', label: 'Send Webhook', description: 'HTTP POST to external url', icon: '🌐' },
      { id: 'act_gemini', label: 'Generate AI Caption (Gemini)', description: 'Create social copy', icon: '✨' },
    ]
  },
  {
    category: 'condition',
    color: 'bg-amber-500',
    title: 'CONDITIONS',
    icon: <CheckCircle size={14} />,
    nodes: [
      { id: 'cond_if', label: 'If/Else', description: 'Branch based on property field', icon: '🔀' },
      { id: 'cond_filter', label: 'Filter', description: 'By district, type, price', icon: '🔍' },
      { id: 'cond_delay', label: 'Delay', description: 'Wait X minutes/hours', icon: '⏳' },
      { id: 'cond_loop', label: 'Loop', description: 'For each property', icon: '🔁' },
    ]
  },
  {
    category: 'utility',
    color: 'bg-purple-500',
    title: 'UTILITIES',
    icon: <Cpu size={14} />,
    nodes: [
      { id: 'util_fmt_text', label: 'Format Text', description: 'Change string casing', icon: 'Aa' },
      { id: 'util_fmt_num', label: 'Format Number', description: 'Format to LKR currency', icon: '#️⃣' },
      { id: 'util_merge', label: 'Merge Data', description: 'Combine objects together', icon: '🧩' },
      { id: 'util_log', label: 'Log to Console', description: 'Print for debugging', icon: '📄' },
    ]
  }
];

export function NodeLibrary() {
  const [search, setSearch] = useState('');

  const onDragStart = (event: React.DragEvent, nodeData: any, category: string) => {
    event.dataTransfer.setData('application/reactflow/type', category);
    event.dataTransfer.setData('application/reactflow/label', nodeData.label);
    event.dataTransfer.setData('application/reactflow/category', category);
    event.dataTransfer.setData('application/reactflow/icon', nodeData.icon);
    event.dataTransfer.setData('application/reactflow/description', nodeData.description);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 mb-3 flex items-center gap-2">
           <Zap size={16} /> Nodes
        </h3>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search nodes..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]/20 transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
         {NODE_CATALOG.map(group => {
           const filtered = group.nodes.filter(n => n.label.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase()));
           if (filtered.length === 0) return null;
           
           return (
             <div key={group.category}>
               <div className="flex items-center gap-1.5 mb-3">
                 <span className={`flex items-center justify-center w-5 h-5 rounded-md text-white ${group.color}`}>
                   {group.icon}
                 </span>
                 <span className="text-[10px] font-black tracking-widest text-gray-400">{group.title}</span>
               </div>
               <div className="space-y-2">
                 {filtered.map(node => (
                   <div 
                     key={node.id} 
                     draggable
                     onDragStart={(e) => onDragStart(e, node, group.category)}
                     className="p-3 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all bg-white group/node"
                   >
                     <div className="flex items-center gap-2 mb-1">
                       <span className="text-sm">{node.icon}</span>
                       <span className="text-xs font-bold text-gray-800 group-hover/node:text-black">{node.label}</span>
                     </div>
                     <p className="text-[10px] text-gray-400 font-medium leading-tight pl-6">{node.description}</p>
                   </div>
                 ))}
               </div>
             </div>
           );
         })}
      </div>
    </div>
  );
}
