import React, { useState } from 'react';
import { PackageOpen, Download, Star, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function WorkflowMarketplace({ onInstall }: { onInstall: (template: any) => void }) {
  const [installingId, setInstallingId] = useState<number | null>(null);
  const [installedId, setInstalledId] = useState<number | null>(null);

  const handleInstallClick = async (template: any) => {
    setInstallingId(template.id);
    await onInstall(template);
    setInstalledId(template.id);
    setInstallingId(null);
  };

  const templates = [
    { id: 1, title: 'New Listing → Full Social Media Push', pop: true, nodes: 'Trigger → AI Caption → Facebook → Instagram → Twitter → Email', desc: '1 Click Install', used: 245 },
    { id: 2, title: 'Lead → WhatsApp + Email Follow-Up', pop: false, nodes: 'Trigger → WhatsApp → Wait → Email', desc: 'Convert more leads', used: 180 },
    { id: 3, title: 'Price Drop → Buyer Alerts', pop: false, nodes: 'Trigger → Extract Leads → SMS → Email', desc: 'Notify interested buyers', used: 154 },
    { id: 4, title: 'Listing Expiry → Renewal Campaign', pop: false, nodes: 'Trigger → Warning Email → Wait → Follow-up', desc: 'Avoid losing listings', used: 98 },
    { id: 5, title: 'Weekly Agent Performance Report', pop: false, nodes: 'Trigger → Compile Data → PDF → Email Admin', desc: 'Automated reporting', used: 85 },
    { id: 6, title: 'New Agent Registration Welcome', pop: false, nodes: 'Trigger → Invite Link → Email', desc: 'Onboard smoothly', used: 76 },
    { id: 7, title: 'Property Sold → Social Celebration Post', pop: false, nodes: 'Trigger → AI Caption → Facebook + Instagram', desc: 'Showcase success', used: 132 },
    { id: 8, title: 'Daily Featured Properties Rotation', pop: false, nodes: 'Trigger → Select Properties → Update Tag', desc: 'Automate homepage', used: 64 },
    { id: 9, title: 'AI Quality Check + Auto Approval', pop: true, nodes: 'Trigger → Gemini AI → Approver → Email', desc: 'Save moderation time', used: 210 },
    { id: 10, title: 'Monthly Market Report Email', pop: false, nodes: 'Trigger → Gather Stats → Email Subscribers', desc: 'Engage audience', used: 45 },
    { id: 11, title: 'New Lead → CRM + WhatsApp Alert', pop: false, nodes: 'Trigger → Update Google Sheets → WhatsApp', desc: 'Instant notify', used: 150 },
    { id: 12, title: 'Top Agent of Month Award', pop: false, nodes: 'Trigger → Calculate Stats → Social Post → Email', desc: 'Gamafication', used: 30 }
  ];

  return (
    <div className="p-8 h-full overflow-y-auto bg-white text-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 pt-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-6">
              <PackageOpen size={32} />
           </div>
           <h2 className="text-4xl font-black mb-4">⚡ Workflow Templates</h2>
           <p className="text-xl text-gray-500 font-medium">One-click install automation templates for LankaProperty.lk</p>
        </div>

        <div className="flex justify-center gap-4 mb-12 flex-wrap">
           {['All', 'Marketing', 'Leads', 'Social', 'Email', 'WhatsApp', 'AI', 'Reporting'].map(tag => (
             <button key={tag} className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-colors ${tag === 'All' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
               {tag}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tpl => (
             <div key={tpl.id} className="bg-white rounded-3xl p-6 border border-gray-200 hover:border-gray-300 transition-colors flex flex-col h-full relative group shadow-sm hover:shadow-md">
                {tpl.pop && (
                  <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-md shadow-red-500/30">
                    🔥 Popular
                  </div>
                )}
                <h3 className="text-lg font-black leading-tight mb-4 pr-12 text-gray-900">{tpl.title}</h3>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6 flex-1 text-sm text-gray-600 font-mono leading-relaxed border border-gray-200">
                   Nodes: <span className="text-blue-600">{tpl.nodes}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                   <div className="flex gap-1 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                   </div>
                   <span className="text-gray-500 text-xs font-bold uppercase">Used by {tpl.used} users</span>
                </div>

                <div className="flex gap-3">
                   <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest transition-colors border border-gray-200">Preview</button>
                   <button 
                     onClick={() => handleInstallClick(tpl)} 
                     disabled={installingId === tpl.id || installedId === tpl.id}
                     className={`flex-[2] py-3 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm ${
                       installedId === tpl.id 
                         ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                         : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                     } disabled:opacity-80`}
                   >
                     {installedId === tpl.id ? (
                       <><CheckCircle2 size={14} /> Installed</>
                     ) : installingId === tpl.id ? (
                       <><Download size={14} className="animate-bounce" /> Installing...</>
                     ) : (
                       <><Download size={14} /> Install in 1 Click</>
                     )}
                   </button>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
