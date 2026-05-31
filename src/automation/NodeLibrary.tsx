import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const nodeCategories = [
  {
    category: "trigger",
    name: "TRIGGERS",
    color: "bg-blue-600/20 text-blue-500",
    nodes: [
      { subtype: "new_property", icon: "🏠", label: "New Property Published", description: "Triggers when a property is added" },
      { subtype: "property_updated", icon: "✏️", label: "Property Updated", description: "Triggers when listing changes" },
      { subtype: "new_lead", icon: "📩", label: "New Lead Submitted", description: "Triggers on new inquiry" },
      { subtype: "scheduled", icon: "⏰", label: "Scheduled Time", description: "Triggers on cron schedule" },
      { subtype: "webhook", icon: "🔗", label: "Webhook Trigger", description: "Triggers from external HTTP" },
      { subtype: "price_changed", icon: "💰", label: "Price Changed", description: "Triggers on amount change" }
    ]
  },
  {
    category: "action",
    name: "ACTIONS",
    color: "bg-green-600/20 text-green-500",
    nodes: [
      { subtype: "post_facebook", icon: "📘", label: "Post to Facebook", description: "Create a page post" },
      { subtype: "post_instagram", icon: "📸", label: "Post to Instagram", description: "Publish photo & caption" },
      { subtype: "send_whatsapp", icon: "💬", label: "Send WhatsApp", description: "Message a lead directly" },
      { subtype: "send_email", icon: "📧", label: "Send Email", description: "Using EmailJS template" },
      { subtype: "generate_ai_caption", icon: "✨", label: "Generate AI Caption", description: "Create social media copy" },
      { subtype: "update_supabase", icon: "🗄️", label: "Update Record", description: "Modify database row" }
    ]
  },
  {
    category: "condition",
    name: "CONDITIONS",
    color: "bg-yellow-600/20 text-yellow-500",
    nodes: [
      { subtype: "if_else", icon: "↔️", label: "If / Else Branch", description: "Logic branching" },
      { subtype: "delay", icon: "⏳", label: "Delay", description: "Wait X time before next" },
      { subtype: "loop", icon: "🔁", label: "Loop Elements", description: "Iterate an array" }
    ]
  },
  {
    category: "agent",
    name: "AI AGENTS",
    color: "bg-purple-600/20 text-purple-500",
    nodes: [
      { subtype: "agent_real_estate", icon: "🏠", label: "Real Estate Agent", description: "Advises on properties" },
      { subtype: "agent_qualifier", icon: "🎯", label: "Lead Qualifier", description: "Auto-qualifies buyers" }
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
    event.dataTransfer.setData('application/reactflow/subtype', nodeData.subtype);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search nodes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 transition-colors" 
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {nodeCategories.map(category => (
          <div key={category.name}>
            <div className={`text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${category.color.split(' ')[1]}`}>
               ▼ {category.name} ({category.nodes.length})
            </div>
            <div className="space-y-2">
              {category.nodes.filter(n => n.label.toLowerCase().includes(search.toLowerCase())).map(node => (
                <div 
                  key={node.subtype} 
                  className="bg-gray-50 hover:bg-gray-100 p-3 rounded-xl border border-gray-200 hover:border-gray-300 cursor-grab active:cursor-grabbing transition-colors flex items-center gap-3 group shadow-sm"
                  draggable
                  onDragStart={(e) => onDragStart(e, node, category.category)}
                  title={node.description}
                >
                  <div className="text-xl">{node.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-700 group-hover:text-gray-900 truncate transition-colors">{node.label}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider truncate shrink-0">{node.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
