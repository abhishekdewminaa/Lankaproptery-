import React, { useState } from 'react';
import { ArrowLeft, Play, Copy, Trash2, Settings, List, Terminal, Activity } from 'lucide-react';
import { AutomationsNode } from './types';

export function NodeConfigPanel({ node, onClose, onUpdate, onDelete }: { node: AutomationsNode, onClose: () => void, onUpdate: (id: string, data: any) => void, onDelete: (id: string) => void }) {
  const [tab, setTab] = useState<'settings' | 'input' | 'output' | 'logs'>('settings');

  const updateConfig = (key: string, value: any) => {
    onUpdate(node.id, {
      ...node.data,
      config: {
        ...(node.data.config || {}),
        [key]: value
      }
    });
  };

  return (
    <div className="w-96 bg-[#1e293b] border-l border-gray-800 flex flex-col h-full flex-shrink-0 animate-in slide-in-from-right-8 duration-200">
      <div className="p-4 border-b border-gray-800">
         <div className="flex justify-between items-center mb-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
               <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
               <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 hidden">
                  <Play size={12} fill="currentColor" /> Test Node
               </button>
               <button className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <Copy size={16} />
               </button>
               <button onClick={() => onDelete(node.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
               </button>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="text-2xl">{node.data.icon}</div>
            <div>
               <div className="text-xs font-black text-gray-500 uppercase tracking-widest">{node.data.category}</div>
               <div className="text-lg font-black text-white">{node.data.label}</div>
            </div>
         </div>
      </div>
      
      <div className="flex border-b border-gray-800 text-xs font-black uppercase tracking-widest">
         <button onClick={() => setTab('settings')} className={`flex-1 py-3 border-b-2 flex justify-center items-center gap-2 transition-colors ${tab === 'settings' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}><Settings size={14}/> Settings</button>
         <button onClick={() => setTab('input')} className={`flex-1 py-3 border-b-2 flex justify-center items-center gap-2 transition-colors ${tab === 'input' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}><List size={14}/> Input</button>
         <button onClick={() => setTab('output')} className={`flex-1 py-3 border-b-2 flex justify-center items-center gap-2 transition-colors ${tab === 'output' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}><Terminal size={14}/> Output</button>
         <button onClick={() => setTab('logs')} className={`flex-1 py-3 border-b-2 flex justify-center items-center gap-2 transition-colors ${tab === 'logs' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}><Activity size={14}/> Logs</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
         {tab === 'settings' && (
            <div className="space-y-4">
              {node.data.subtype === 'scheduled' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Frequency</label>
                    <select className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2 text-sm">
                      <option>Every 15 minutes</option>
                      <option>Every hour</option>
                      <option>Every day</option>
                      <option>Every week</option>
                      <option>Custom cron expression</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Timezone</label>
                    <select className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2 text-sm">
                      <option>Asia/Colombo</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </>
              )}

              {node.data.subtype === 'generate_ai_caption' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Platform</label>
                    <select className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2 text-sm">
                      <option>Facebook</option>
                      <option>Instagram</option>
                      <option>Twitter</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tone</label>
                      <select className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2 text-sm">
                        <option>Professional</option>
                        <option>Friendly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Language</label>
                      <select className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2 text-sm">
                        <option>English</option>
                        <option>Sinhala</option>
                        <option>Tamil</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" defaultChecked className="rounded border-gray-700 bg-[#0f172a]" /> Include hashtags</label>
                    <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" defaultChecked className="rounded border-gray-700 bg-[#0f172a]" /> Include price</label>
                    <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" defaultChecked className="rounded border-gray-700 bg-[#0f172a]" /> Include location</label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Instructions</label>
                    <textarea placeholder="e.g. Always mention sea view" className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2 text-sm h-24"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Output Variable</label>
                    <div className="w-full bg-[#0f172a] border border-gray-700 text-gray-400 font-mono rounded-xl px-4 py-2 text-sm">{'{'}{'{'}ai_caption{'}'}{'}'}</div>
                  </div>
                </>
              )}

              {node.data.subtype === 'if_else' && (
                <>
                  <div className="bg-[#0f172a] border border-gray-700 rounded-xl p-3 space-y-3">
                    <input type="text" defaultValue="{{property.price_lkr}}" className="w-full bg-[#1e293b] border border-gray-600 text-white font-mono rounded-lg px-3 py-1.5 text-sm" />
                    <select className="w-full bg-[#1e293b] border border-gray-600 text-white rounded-lg px-3 py-1.5 text-sm">
                      <option>greater than</option>
                      <option>less than</option>
                      <option>equals</option>
                      <option>contains</option>
                    </select>
                    <input type="text" defaultValue="10000000" className="w-full bg-[#1e293b] border border-gray-600 text-white font-mono rounded-lg px-3 py-1.5 text-sm" />
                    <button className="w-full py-1.5 border border-dashed border-gray-600 text-gray-400 rounded-lg text-sm font-bold hover:text-white transition-colors">+ Add Condition</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <label className="block text-xs font-bold text-green-500 uppercase tracking-widest mb-1">True Path</label>
                      <input type="text" defaultValue="Premium" className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-red-500 uppercase tracking-widest mb-1">False Path</label>
                      <input type="text" defaultValue="Standard" className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                  </div>
                </>
              )}

              {node.data.subtype === 'delay' && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Wait Duration</label>
                  <div className="flex gap-2">
                    <input type="number" defaultValue={24} className="flex-1 bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2 text-sm" />
                    <select className="flex-[2] bg-[#0f172a] border border-gray-700 text-white rounded-xl px-4 py-2 text-sm">
                      <option>Hours</option>
                      <option>Minutes</option>
                      <option>Days</option>
                      <option>Weeks</option>
                    </select>
                  </div>
                </div>
              )}
              
              {!['scheduled', 'generate_ai_caption', 'if_else', 'delay'].includes(node.data.subtype as string) && (
                <div className="text-gray-500 text-sm text-center py-8">
                  Settings for {node.data.label} (Not implemented in UI stub)
                </div>
              )}
            </div>
         )}
         
         {tab === 'output' && (
           <div className="space-y-3">
             <p className="text-sm text-gray-400">Copy these variables to use in subsequent nodes:</p>
             {['{{property.id}}', '{{property.listing_title}}', '{{property.price_lkr}}', '{{ai_caption}}'].map(v => (
               <div key={v} className="flex justify-between items-center bg-[#0f172a] border border-gray-700 p-3 rounded-lg group cursor-pointer hover:border-gray-500 transition-colors">
                  <span className="font-mono text-xs text-blue-300">{v}</span>
                  <button className="text-gray-500 group-hover:text-white"><Copy size={14}/></button>
               </div>
             ))}
           </div>
         )}

         {tab === 'logs' && (
           <div className="space-y-3">
             <div className="p-3 bg-[#0f172a] border border-gray-800 rounded-lg flex justify-between items-center">
                <span className="flex items-center gap-2 text-xs font-bold text-green-500"><span className="w-2 h-2 rounded-full bg-green-500"></span> Success</span>
                <span className="text-xs text-gray-500">2 hrs ago • 0.3s</span>
             </div>
             <div className="p-3 bg-[#0f172a] border border-gray-800 rounded-lg flex justify-between items-center">
                <span className="flex items-center gap-2 text-xs font-bold text-green-500"><span className="w-2 h-2 rounded-full bg-green-500"></span> Success</span>
                <span className="text-xs text-gray-500">5 hrs ago • 0.2s</span>
             </div>
             <div className="p-3 bg-[#0f172a] border border-gray-800 rounded-lg flex justify-between items-center">
                <span className="flex items-center gap-2 text-xs font-bold text-red-500"><span className="w-2 h-2 rounded-full bg-red-500"></span> Failed</span>
                <span className="text-xs text-gray-500">Yesterday • Timeout</span>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
