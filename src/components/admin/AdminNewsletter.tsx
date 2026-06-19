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

     const confirm = window.confirm(`Send this newsletter to ${sendTo === 'all' ? subscribers.length : 'selected'} subscribers?`);
     if (!confirm) return;

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
        toast.success("Subscriber added");
        setAddModalOpen(false);
        setNewSub({ name: '', email: '' });
        fetchData();
     } catch(err) {
        toast.error("Failed to add subscriber. Email might exist.");
     }
  };

  const handleDeleteSub = async (id: number) => {
     if (!window.confirm("Remove this subscriber?")) return;
     try {
        const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
        if (error) throw error;
        setSubscribers(subscribers.filter(s => s.id !== id));
        toast.success("Subscriber removed");
     } catch(err) {
        toast.error("Failed to remove subscriber");
     }
  };

  const filteredSubscribers = subscribers.filter(s => 
     s.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <Mail className="text-emerald-600" /> Newsletter Manager
          </h2>
          <p className="text-gray-500 font-medium">Manage subscribers and send email campaigns.</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl"><Users size={32} /></div>
            <div>
               <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase">Total Subscribers</p>
               <p className="text-3xl font-black text-gray-900 mt-1">{subscribers.length}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl"><Send size={32} /></div>
            <div>
               <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase">Emails Sent This Month</p>
               <p className="text-3xl font-black text-gray-900 mt-1">{campaigns.reduce((sum, c) => sum + (c.recipient_count || 0), 0)}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl"><Eye size={32} /></div>
            <div>
               <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase">Avg Open Rate</p>
               <p className="text-3xl font-black text-gray-900 mt-1">-- %</p>
               <p className="text-xs text-gray-400 font-bold mt-1">Pending EmailJS setup</p>
            </div>
         </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-100 pb-4">
         {['compose', 'subscribers', 'history'].map(tab => (
            <button 
               key={tab} 
               onClick={() => setActiveTab(tab as any)}
               className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
               {tab}
            </button>
         ))}
      </div>

      {activeTab === 'compose' && (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
               {/* TEMPLATES */}
               <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Quick Templates</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {TEMPLATES.map(t => (
                        <button 
                           key={t.id} 
                           onClick={() => { setSubject(t.subject); setBody(t.body); }}
                           className="bg-white border border-gray-100 p-4 rounded-xl text-left hover:border-emerald-500 hover:shadow-md transition-all group"
                        >
                           <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700">{t.name}</p>
                        </button>
                     ))}
                  </div>
               </div>

               {/* EDITOR */}
               <div className="bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-gray-100 space-y-4">
                     <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Subject Line</label>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500" placeholder="e.g. November Market Updates" />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Send To</label>
                        <select value={sendTo} onChange={e => setSendTo(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500">
                           <option value="all">All Subscribers ({subscribers.length})</option>
                           <option value="premium">Premium Users Only</option>
                        </select>
                     </div>
                  </div>
                  
                  <div className="border-b border-gray-100 bg-gray-50 p-2 flex gap-1">
                     <button className="p-2 hover:bg-gray-200 rounded text-gray-600"><Bold size={16} /></button>
                     <button className="p-2 hover:bg-gray-200 rounded text-gray-600"><Italic size={16} /></button>
                     <button className="p-2 hover:bg-gray-200 rounded text-gray-600"><LinkIcon size={16} /></button>
                     <button className="p-2 hover:bg-gray-200 rounded text-gray-600"><List size={16} /></button>
                  </div>
                  <textarea 
                     value={body} 
                     onChange={e => setBody(e.target.value)}
                     className="w-full h-[300px] p-6 text-sm text-gray-800 outline-none resize-none leading-relaxed"
                     placeholder="Write your email content here..."
                  />
                  
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                     <button onClick={() => setTestEmailOpen(true)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all">Send Test</button>
                     <button 
                        onClick={handleSendNewsletter} 
                        disabled={isSending || !subject || !body}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                     >
                        {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} 
                        {isSending ? 'Sending...' : 'Send Newsletter Now'}
                     </button>
                  </div>
               </div>
            </div>

            {/* PREVIEW PANEL */}
            <div className="lg:col-span-4">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Email Preview</h3>
               <div className="bg-gray-100 p-6 rounded-[24px] min-h-[500px]">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                     <div className="bg-emerald-600 p-6 text-center">
                        <span className="text-white font-black text-xl tracking-tight">LankaProperty.lk</span>
                     </div>
                     <div className="p-8">
                        <h1 className="text-xl font-bold text-gray-900 mb-6">{subject || "Email Subject"}</h1>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                           {body || "Your email body will appear here..."}
                        </p>
                     </div>
                     <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-2">You received this email because you subscribed on our website.</p>
                        <a href="#" className="text-xs font-bold text-emerald-600">Unsubscribe mapping</a>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'subscribers' && (
         <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" placeholder="Search emails..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-emerald-500" />
               </div>
               <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-lg flex items-center gap-2 hover:bg-gray-200"><Download size={14}/> Export</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-lg flex items-center gap-2 hover:bg-gray-200"><Upload size={14}/> Import CSV</button>
                  <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center gap-2 hover:bg-emerald-700"><Plus size={14}/> Add Subscriber</button>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Source</th>
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscribed On</th>
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {filteredSubscribers.map(sub => (
                        <tr key={sub.id} className="hover:bg-gray-50/50">
                           <td className="py-3 px-6 text-sm font-bold text-gray-900">{sub.email}</td>
                           <td className="py-3 px-6 text-sm text-gray-600">{sub.name || '-'}</td>
                           <td className="py-3 px-6">
                              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded inline-flex">{sub.source || 'Website'}</span>
                           </td>
                           <td className="py-3 px-6 text-xs text-gray-500">{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                           <td className="py-3 px-6 text-right">
                              <button onClick={() => handleDeleteSub(sub.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                           </td>
                        </tr>
                     ))}
                     {filteredSubscribers.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-400 font-bold text-sm">No subscribers found</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {activeTab === 'history' && (
         <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sent To</th>
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipients</th>
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {campaigns.map(camp => (
                        <tr key={camp.id} className="hover:bg-gray-50/50">
                           <td className="py-3 px-6 text-sm font-bold text-gray-700">{new Date(camp.sent_at).toLocaleString()}</td>
                           <td className="py-3 px-6 text-sm font-bold text-gray-900">{camp.subject}</td>
                           <td className="py-3 px-6 text-xs text-gray-600 capitalize">{camp.sent_to}</td>
                           <td className="py-3 px-6 text-sm font-bold text-gray-700">{camp.recipient_count}</td>
                           <td className="py-3 px-6">
                              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1"><Check size={10} /> {camp.status}</span>
                           </td>
                        </tr>
                     ))}
                     {campaigns.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-400 font-bold text-sm">No campaigns sent yet</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* MODALS */}
      {addModalOpen && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
               <h3 className="text-lg font-black tracking-tight mb-4 text-gray-900">Add Subscriber</h3>
               <div className="space-y-4 mb-6">
                  <div>
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Name (Optional)</label>
                     <input type="text" value={newSub.name} onChange={e=>setNewSub({...newSub,name:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold" />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Email Address</label>
                     <input type="email" value={newSub.email} onChange={e=>setNewSub({...newSub,email:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold" />
                  </div>
               </div>
               <div className="flex justify-end gap-2">
                  <button onClick={()=>setAddModalOpen(false)} className="px-4 py-2 font-bold text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">Cancel</button>
                  <button onClick={handleAddSubscriber} className="px-4 py-2 font-bold text-sm bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white">Add</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
