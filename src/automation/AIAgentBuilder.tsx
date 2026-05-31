import React, { useState } from 'react';
import { Bot, MessageSquare, Play, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export function AIAgentBuilder() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'Real Estate Assistant', role: 'Customer Support', rating: 4.8, chats: 48, active: true },
  ]);

  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="p-8 h-full overflow-y-auto w-full bg-[#0f172a]">
      {isCreating ? (
        <div className="max-w-4xl mx-auto flex gap-6">
          <div className="flex-1 bg-[#1e293b] rounded-2xl p-6 border border-gray-800">
             <h2 className="text-xl font-black text-white mb-6">Create AI Agent</h2>
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Agent Name</label>
                   <input type="text" className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2" placeholder="e.g. Real Estate Assistant" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Role</label>
                      <select className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2">
                         <option>Real Estate Advisor</option>
                         <option>Customer Support</option>
                         <option>Lead Qualifier</option>
                         <option>Social Media Manager</option>
                         <option>Content Writer</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Personality</label>
                      <select className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2">
                         <option>Professional</option>
                         <option>Friendly</option>
                         <option>Formal</option>
                      </select>
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Knowledge Base</label>
                   <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" defaultChecked className="rounded border-gray-700 bg-[#0f172a]" /> All active properties</label>
                      <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" defaultChecked className="rounded border-gray-700 bg-[#0f172a]" /> Property descriptions</label>
                      <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" defaultChecked className="rounded border-gray-700 bg-[#0f172a]" /> Price information</label>
                      <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" defaultChecked className="rounded border-gray-700 bg-[#0f172a]" /> District/location data</label>
                      <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" className="rounded border-gray-700 bg-[#0f172a]" /> Agent contact details</label>
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Instructions</label>
                   <textarea className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2 h-24 text-sm" defaultValue="You are a helpful real estate assistant for LankaProperty.lk. Always respond in English. When asked about properties, search the database first..."></textarea>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Greeting message</label>
                   <input type="text" className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2" defaultValue="Hi! I'm your LankaProperty assistant. How can I help you find your perfect home today?" />
                </div>
                <div className="flex gap-4 pt-4 border-t border-gray-800">
                   <button onClick={() => { toast.success('Agent saved'); setIsCreating(false); }} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Save Agent</button>
                   <button onClick={() => setIsCreating(false)} className="px-6 py-2 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700">Cancel</button>
                </div>
             </div>
          </div>
          <div className="w-80 bg-[#1e293b] rounded-2xl flex flex-col border border-gray-800 relative">
             <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center"><Bot /></div>
                <div>
                   <div className="font-bold text-white text-sm">Test Chat</div>
                   <div className="text-xs text-green-400">Online</div>
                </div>
             </div>
             <div className="flex-1 p-4 space-y-4">
                <div className="flex gap-2">
                   <div className="p-3 bg-gray-800 text-sm text-white rounded-2xl rounded-tl-sm max-w-[85%]">Hi! I'm your LankaProperty assistant. How can I help you find your perfect home today?</div>
                </div>
             </div>
             <div className="p-4 border-t border-gray-800">
                <input type="text" className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2 text-sm" placeholder="Type a message..." />
             </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
               <h2 className="text-3xl font-black text-white">AI Agents</h2>
               <p className="text-gray-400 font-medium">Create specialized AI assistants for different tasks.</p>
            </div>
            <button onClick={() => setIsCreating(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-900/20">
              Create Agent
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
               <div key={agent.id} className="bg-[#1e293b] rounded-2xl p-6 border border-gray-800 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-500 flex items-center justify-center mb-4 relative">
                     <Bot size={32} />
                     {agent.active && <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1e293b]"></div>}
                  </div>
                  <h3 className="text-lg font-black text-white">{agent.name}</h3>
                  <p className="text-gray-400 text-sm font-medium mt-2 leading-relaxed">Answers buyer questions about properties using your database</p>
                  
                  <div className="flex gap-4 mt-6 text-xs font-bold text-gray-500 uppercase tracking-widest w-full justify-center">
                     <span className="bg-gray-800 px-3 py-1.5 rounded-lg">💬 {agent.chats} Chats</span>
                     <span className="bg-gray-800 px-3 py-1.5 rounded-lg">⭐ {agent.rating} Rating</span>
                  </div>
                  
                  <div className="flex gap-2 mt-6 w-full">
                     <button className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold uppercase transition-colors">Configure</button>
                     <button className="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-xs font-bold uppercase transition-colors">Test Chat</button>
                  </div>
               </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
