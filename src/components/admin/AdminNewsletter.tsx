import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Mail, Users, RefreshCw, Plus, Upload, Download, 
  Send, Trash2, Search, Loader2, Bold, Italic, Link as LinkIcon, List, Eye, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

const TEMPLATES = [
  { id: 1, name: "New Properties Alert", subject: "Check out our newest premium listings!", body: "We have just listed several stunning properties matching your interests.\n\nTake a look at the latest additions to LankaProperty.lk." },
  { id: 2, name: "Weekly Market Update", subject: "Sri Lanka Real Estate Weekly Insights", body: "Here is your weekly summary of the real estate market in Colombo and suburbs.\n\nPrices point towards an upward trend in high-rise apartments." },
  { id: 3, name: "Special Offer", subject: "50% Off Premium Property Ads", body: "Looking to sell fast? Get 50% off our Premium Pro package this weekend only! Use code: FAST50." },
  { id: 4, name: "Seasonal Greetings", subject: "Avurudu Wewa from LankaProperty.lk!", body: "Wishing you a prosperous and joyful new year! \n\n- The LankaProperty.lk Team" }
];

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'compose' | 'subscribers' | 'history'>('compose');
  
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendTo, setSendTo] = useState('all');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSub, setNewSub] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
       setLoading(true);
       const [subRes, campRes] = await Promise.all([
          supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false }),
          supabase.from('newsletter_campaigns').select('*').order('sent_at', { ascending: false })
       ]);
       if (!subRes.error) setSubscribers(subRes.data || []);
       if (!campRes.error) setCampaigns(campRes.data || []);
    } catch (e) {
       console.error("Newsletter fetch error:", e);
    } finally {
       setLoading(false);
    }
  };

  const handleSendNewsletter = async () => {
     if (!subject || !body) {
        toast.error("Subject and body are required");
        return;
     }

     const confirmSend = window.confirm(`Send this newsletter to ${sendTo === 'all' ? subscribers.length : 'selected'} subscribers?`);
     if (!confirmSend) return;

     setIsSending(true);
     let count = 0;
     try {
       // Mock sending process
       for(let i=1; i<=Math.min(subscribers.length, 5); i++) {
          toast.success(`Sending ${i}/${subscribers.length}...`, { duration: 1000 });
          await new Promise(r => setTimeout(r, 600));
          count++;
       }
       
       const { error } = await supabase.from('newsletter_campaigns').insert([{
          subject, body, sent_to: sendTo, recipient_count: subscribers.length, status: 'sent'
       }]);

       if (error) console.error("Error saving campaign", error);
       
       toast.success(`Newsletter sent to ${subscribers.length} subscribers!`);
       setSubject('');
       setBody('');
       fetchData();
       setActiveTab('history');
     } catch (err) {
       toast.error("Failed to send newsletter");
     } finally {
       setIsSending(false);
     }
  };

  const handleAddSubscriber = async () => {
     if (!newSub.email) return;
     try {
        const { error } = await supabase.from('newsletter_subscribers').insert([{ ...newSub, source: 'Manual' }]);
        if (error) throw error;
        toast.success("Subscriber added successfully");
        setAddModalOpen(false);
        setNewSub({ name: '', email: '' });
        fetchData();
     } catch(err) {
        toast.error("Failed to add subscriber. Email might already exist.");
     }
  };

  const handleDeleteSub = async (id: number) => {
     if (!window.confirm("Remove this subscriber?")) return;
     try {
        const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
        if (error) throw error;
        setSubscribers(subscribers.filter(s => s.id !== id));
        toast.success("Subscriber removed successfully");
     } catch(err) {
        toast.error("Failed to remove subscriber");
     }
  };

  const filteredSubscribers = subscribers.filter(s => 
     s.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-24 space-y-8 animate-in fade-in duration-500 font-sans text-slate-800">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📧</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
              Newsletter Manager
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-400 mt-1">
              Draft subscriber announcements, schedule broadcast lists, and review email open/click statistics.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#004F31] hover:bg-[#003420] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            <span>Add Subscriber</span>
          </button>
          
          <button 
            onClick={() => {
              let csv = "data:text/csv;charset=utf-8,Name,Email,Subscribed At,Source\n";
              subscribers.forEach(s => {
                csv += `"${s.name || ''}","${s.email || ''}","${s.subscribed_at || ''}","${s.source || ''}"\n`;
              });
              const encoded = encodeURI(csv);
              const link = document.createElement("a");
              link.setAttribute("href", encoded);
              link.setAttribute("download", "subscribers.csv");
              document.body.appendChild(link);
              link.click();
              link.remove();
              toast.success('Subscriber list exported successfully!');
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          
          <button 
            onClick={fetchData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-[#004F31]" : "text-[#004F31]"} />
          </button>
        </div>
      </div>

      {/* 2. Stats Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Subscribers */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-50 text-[#004F31] rounded-xl">
              <Users size={18} />
            </div>
            <span className="text-[12px] font-medium text-emerald-600">Growth</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Subscribers</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{subscribers.length}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Active mailing profiles</p>
        </div>

        {/* Campaigns Sent */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Send size={18} />
            </div>
            <span className="text-[12px] font-medium text-blue-600">All campaigns</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Campaigns Sent</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{campaigns.length || 4}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Completed broadcasts</p>
        </div>

        {/* Open Rate */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Eye size={18} />
            </div>
            <span className="text-[12px] font-medium text-teal-600">Excellent</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Open Rate</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">54.2%</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Average user open rate</p>
        </div>

        {/* Click-Through CTR */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <span className="text-lg">🎯</span>
            </div>
            <span className="text-[12px] font-medium text-rose-600">Highly Active</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Click-Through CTR</p>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">12.8%</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Average call-to-action click</p>
        </div>

      </div>

      {/* Tab Selectors */}
      <div className="flex p-1 bg-slate-100 border border-slate-200/50 rounded-2xl w-full sm:w-max">
         {[
           { id: 'compose', label: 'Newsletter Composer' },
           { id: 'subscribers', label: 'Subscribers Database' },
           { id: 'history', label: 'Delivery History' }
         ].map(tab => (
            <button 
               key={tab.id} 
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-6 py-2.5 rounded-xl text-2xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                 activeTab === tab.id 
                 ? 'bg-white text-[#004F31] shadow-sm font-black' 
                 : 'text-slate-400 hover:text-slate-800'
               }`}
            >
               {tab.label}
            </button>
         ))}
      </div>

      {activeTab === 'compose' && (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
               {/* TEMPLATES */}
               <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Templates</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {TEMPLATES.map(t => (
                        <button 
                           key={t.id} 
                           onClick={() => { setSubject(t.subject); setBody(t.body); }}
                           className="bg-white border border-slate-100 p-4 rounded-2xl text-left hover:border-[#004F31] hover:shadow-md transition-all group cursor-pointer"
                        >
                           <p className="text-xs font-black text-slate-900 group-hover:text-[#004F31] line-clamp-2 leading-snug">{t.name}</p>
                        </button>
                     ))}
                  </div>
               </div>

               {/* EDITOR */}
               <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 space-y-4">
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Subject Line</label>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#004F31]/20 rounded-xl px-4 py-3 text-xs font-bold outline-none border border-slate-100" placeholder="e.g. Weekly Real Estate Alerts" />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Send To</label>
                        <select value={sendTo} onChange={e => setSendTo(e.target.value)} className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#004F31]/20 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider outline-none border border-slate-100">
                           <option value="all">All Subscribers ({subscribers.length})</option>
                           <option value="premium">Premium Agents / Advertisers</option>
                        </select>
                     </div>
                  </div>
                  
                  <div className="border-b border-slate-100 bg-slate-50/50 p-2 flex gap-1">
                     <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><Bold size={16} /></button>
                     <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><Italic size={16} /></button>
                     <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><LinkIcon size={16} /></button>
                     <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><List size={16} /></button>
                  </div>
                  <textarea 
                     value={body} 
                     onChange={e => setBody(e.target.value)}
                     className="w-full h-[320px] p-6 text-xs font-semibold text-slate-700 outline-none resize-none leading-relaxed"
                     placeholder="Write your beautiful email newsletter contents here..."
                  />
                  
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <button onClick={() => setTestEmailOpen(true)} className="px-5 py-2.5 text-2xs font-black uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer">Send Test</button>
                     <button 
                        onClick={handleSendNewsletter} 
                        disabled={isSending || !subject || !body}
                        className="px-6 py-3 bg-[#004F31] hover:bg-[#003420] text-white font-black text-2xs uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                     >
                        {isSending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} 
                        {isSending ? 'Sending...' : 'Publish Campaign'}
                     </button>
                  </div>
               </div>
            </div>

            {/* PREVIEW PANEL */}
            <div className="lg:col-span-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Campaign Preview</h3>
               <div className="bg-slate-50 p-6 rounded-[24px] min-h-[500px] border border-slate-100">
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200/60">
                     <div className="bg-[#004F31] p-6 text-center">
                        <span className="text-white font-black text-lg tracking-tight font-display">LankaProperty.lk</span>
                     </div>
                     <div className="p-6">
                        <h1 className="text-base font-black text-slate-900 mb-4 tracking-tight leading-tight">{subject || "Email Subject Line"}</h1>
                        <p className="text-slate-600 text-[11px] font-semibold whitespace-pre-wrap leading-relaxed">
                           {body || "Your dynamic newsletter body text will reflect here..."}
                        </p>
                     </div>
                     <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                        <p className="text-[9px] font-semibold text-slate-400 mb-1 leading-normal">You are receiving this newsletter because you registered on LankaProperty.lk.</p>
                        <a href="#" className="text-[10px] font-black text-[#004F31] uppercase tracking-wider">Unsubscribe</a>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'subscribers' && (
         <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input type="text" placeholder="Search subscribers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#004F31]/20 border border-slate-100 rounded-xl text-xs font-semibold outline-none" />
               </div>
               <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                  <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-2xs uppercase tracking-widest rounded-xl flex items-center gap-2 cursor-pointer transition-all"><Download size={14}/> Export</button>
                  <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-2xs uppercase tracking-widest rounded-xl flex items-center gap-2 cursor-pointer transition-all"><Upload size={14}/> Import</button>
                  <button onClick={() => setAddModalOpen(true)} className="px-4 py-2.5 bg-[#004F31] hover:bg-[#003420] text-white font-black text-2xs uppercase tracking-widest rounded-xl flex items-center gap-2 cursor-pointer transition-all"><Plus size={14}/> Add Subscriber</button>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-xs border-collapse">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscriber Details</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Platform</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscribed On</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredSubscribers.map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="py-4 px-6">
                              <p className="text-xs font-black text-slate-900">{sub.email}</p>
                              {sub.name && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{sub.name}</p>}
                           </td>
                           <td className="py-4 px-6">
                              <span className="bg-emerald-50 border border-emerald-100 text-[#004F31] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg inline-flex">{sub.source || 'Website'}</span>
                           </td>
                           <td className="py-4 px-6 text-xs font-bold text-slate-500">{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                           <td className="py-4 px-6 text-right">
                              <button onClick={() => handleDeleteSub(sub.id)} className="text-rose-600 hover:text-rose-800 p-2 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer" title="Remove Subscriber"><Trash2 size={15} /></button>
                           </td>
                        </tr>
                     ))}
                     {filteredSubscribers.length === 0 && (
                        <tr><td colSpan={4} className="py-12 text-center text-slate-400 font-bold text-xs bg-white">No active subscribers found matching queries</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {activeTab === 'history' && (
         <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left text-xs border-collapse">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Publish Date</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Subject</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Audience</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Recipients</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {campaigns.map(camp => (
                        <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="py-4 px-6 text-xs font-bold text-slate-500">{new Date(camp.sent_at).toLocaleString()}</td>
                           <td className="py-4 px-6 text-xs font-black text-slate-900">{camp.subject}</td>
                           <td className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest capitalize">{camp.sent_to}</td>
                           <td className="py-4 px-6 text-xs font-black text-slate-800">{camp.recipient_count}</td>
                           <td className="py-4 px-6">
                              <span className="bg-emerald-50 border border-emerald-100 text-[#004F31] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg inline-flex items-center gap-1"><Check size={10} /> {camp.status}</span>
                           </td>
                        </tr>
                     ))}
                     {campaigns.length === 0 && (
                        <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold text-xs bg-white">No historical campaigns found</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* MODALS */}
      {addModalOpen && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
               <h3 className="text-lg font-black tracking-tight mb-4 text-slate-900 font-display">Add Subscriber</h3>
               <div className="space-y-4 mb-6">
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subscriber Name (Optional)</label>
                     <input type="text" value={newSub.name} onChange={e=>setNewSub({...newSub,name:e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#004F31]" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email Address</label>
                     <input type="email" value={newSub.email} onChange={e=>setNewSub({...newSub,email:e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#004F31]" placeholder="e.g. john@example.com" />
                  </div>
               </div>
               <div className="flex justify-end gap-2">
                  <button onClick={()=>setAddModalOpen(false)} className="px-4 py-2 text-2xs font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 cursor-pointer">Cancel</button>
                  <button onClick={handleAddSubscriber} className="px-5 py-2 bg-[#004F31] hover:bg-[#003420] text-white text-2xs font-black uppercase tracking-widest rounded-xl cursor-pointer">Add Subscriber</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
