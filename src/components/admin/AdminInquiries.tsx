import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Calendar,
  Zap,
  ArrowUpRight,
  Loader2,
  Trash2,
  ChevronRight,
  Download,
  RotateCw,
  Layout,
  BarChart,
  ClipboardList,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  Command,
  Share2,
  X,
  User,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { triggerNotification } from '../../services/notificationService';
import toast from 'react-hot-toast';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyTitle: string;
  message: string;
  date: string;
  status: 'new' | 'contacted' | 'closed';
}

export default function AdminInquiries({ user }: { user: any }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'following'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const fetchInquiries = async () => {
    try {
       setLoading(true);
       let query = supabase
         .from('property_inquiries')
         .select('*')
         .order('created_at', { ascending: false });

       if (user?.email) {
         query = query.eq('agent_id', user.email);
       }

       const { data, error } = await query;
       if (error) throw error;

       if (data) {
         setInquiries(data.map((item: any) => ({
           id: item.id,
           name: item.full_name,
           email: item.email,
           phone: item.phone,
           propertyTitle: item.inquiry_type || 'General Inquiry',
           message: item.message,
           date: new Date(item.created_at).toLocaleDateString('en-US', { 
             day: 'numeric', 
             month: 'short', 
             year: 'numeric' 
           }),
           status: item.status || 'new'
         })));
       }
    } catch (err) {
       console.error('Error fetching inquiries:', err);
       toast.error("Failed to load inquiries");
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchInquiries();
  }, [user]);

  const updateStatus = async (id: string, newStatus: 'new' | 'contacted' | 'closed') => {
    try {
      const { error } = await supabase
        .from('property_inquiries')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;

      const targetInquiry = inquiries.find(i => i.id === id);
      if (targetInquiry) {
        triggerNotification('inquiry_status_change', {
          new_status: newStatus,
          client_name: targetInquiry.name,
          property_title: targetInquiry.propertyTitle || 'Property Inquiry',
          agent_email: user?.email || 'admin@lankaproperty.lk'
        }).catch(err => console.warn('Failed to dispatch status update alert:', err));
      }

      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
      if (selectedInquiry && selectedInquiry.id === id) {
         setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast.success(`Inquiry marked as ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Status update failed");
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      const { error } = await supabase.from('property_inquiries').delete().eq('id', id);
      if (error) throw error;
      setInquiries(prev => prev.filter(i => i.id !== id));
      if (selectedInquiry?.id === id) {
         setSelectedInquiry(null);
      }
      toast.success("Inquiry deleted permanently");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete inquiry");
    }
  };

  const newCount = inquiries.filter(i => i.status === 'new').length;
  const filtered = inquiries.filter(i => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return i.status === 'new';
    if (activeTab === 'following') return i.status === 'contacted';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-24 font-sans text-slate-800">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📩</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
              Legacy Enquiries
              <span className="bg-amber-50 text-amber-700 font-black text-[11px] tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-amber-200">
                ARCHIVE
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-400 mt-1">
              Access archive of early-stage customer queries, direct contact requests, and unassigned leads.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const headers = ['Name', 'Email', 'Phone', 'Property Reference', 'Message', 'Date', 'Status'];
              const rows = inquiries.map(i => [i.name, i.email, i.phone, i.propertyTitle, i.message, i.date, i.status]);
              const csvContent = "data:text/csv;charset=utf-8," 
                + [headers.join(','), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `LankaProperty_Legacy_Enquiries_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success('Successfully exported inquiries list to CSV!');
            }}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-neutral-50 text-neutral-800 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download size={16} />
            <span>EXPORT CSV</span>
          </button>

          <button 
            onClick={fetchInquiries}
            className="px-4 py-2.5 bg-[#004F31] hover:bg-[#003420] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />
            <span>Sync Inbox</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Enquiries */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#f0fdf4] text-[#004F31] rounded-xl">
              <MessageSquare size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600">↗ Active</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Enquiries</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{inquiries.length}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Archived user logs</p>
        </div>

        {/* Awaiting Callback */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Phone size={18} />
            </div>
            <span className="text-[12px] font-medium text-orange-600">Priority</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Awaiting Callback</p>
          <h3 className="text-2xl sm:text-3xl font-black text-orange-600 mt-1">{newCount}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Direct callback pending</p>
        </div>

        {/* Replied / Closed */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle size={18} />
            </div>
            <span className="text-[12px] font-medium text-blue-600">Completed</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Replied / Closed</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {inquiries.filter(i => i.status === 'closed' || i.status === 'contacted').length}
          </h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Marked as resolved</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Sparkles size={18} />
            </div>
            <span className="text-[12px] font-medium text-purple-600">Average</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Conversion Rate</p>
          <h3 className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">18%</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Leads to sales ratios</p>
        </div>

      </div>

      {/* 3. Inquiry Tabs & Table card */}
      <div className="bg-white border border-slate-200 rounded-[14px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Leads' },
              { id: 'unread', label: 'Unread' },
              { id: 'following', label: 'Following Up' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id ? 'bg-white text-[#004F31] shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {filtered.length} queries listed
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#004F31]" size={32} />
              <p className="text-xs font-semibold text-slate-400">Loading legacy inquiries...</p>
            </div>
          ) : filtered.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-slate-200">
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Customer Profile</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Phone / WhatsApp</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Message Excerpt</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Property Ref</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm leading-tight">{inquiry.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{inquiry.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      <div className="space-y-1">
                        <p className="text-xs font-bold">📞 {inquiry.phone || 'No phone'}</p>
                        {inquiry.phone && (
                          <a
                            href={`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block text-[10px] font-bold text-emerald-600 hover:underline"
                          >
                            💬 Open WhatsApp Chat
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 font-medium max-w-[240px] truncate" title={inquiry.message}>
                        {inquiry.message || '—'}
                      </p>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1">Submitted: {inquiry.date}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] border border-slate-200">
                        {inquiry.propertyTitle || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        inquiry.status === 'new'
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : inquiry.status === 'contacted'
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button 
                          onClick={() => setSelectedInquiry(inquiry)}
                          className="px-3 py-1.5 bg-[#004F31]/10 hover:bg-[#004F31] text-[#004F31] hover:text-white rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-3xs"
                        >
                          Details
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Permanently delete this inquiry?")) {
                              deleteInquiry(inquiry.id);
                            }
                          }} 
                          className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded border border-slate-100 transition-colors cursor-pointer"
                          title="Delete Inquiry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center max-w-md mx-auto py-24 animate-in fade-in zoom-in duration-500">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center">
                  <MessageSquare size={32} className="text-slate-300" />
                </div>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1">No inquiries yet</h3>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed mb-6">
                When customers contact you, they will appear here. We'll also notify you via email.
              </p>
              <button onClick={fetchInquiries} className="px-5 py-2.5 bg-[#004F31] hover:bg-[#003420] text-white rounded-xl font-black text-2xs uppercase tracking-widest cursor-pointer shadow-sm">
                Sync Inbox
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Slide-over Enquiry Details Panel */}
      <AnimatePresence>
         {selectedInquiry && (
            <>
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSelectedInquiry(null)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
               />
               <motion.div 
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col border-l border-slate-200"
               >
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                     <h3 className="font-black text-lg text-slate-900 tracking-tight font-display">Inquiry Message</h3>
                     <button onClick={() => setSelectedInquiry(null)} className="p-2 bg-white hover:bg-slate-100 border border-slate-100 rounded-full text-slate-500 shadow-sm transition-all cursor-pointer"><X size={16} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     {/* Contact Box */}
                     <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-100 text-[#004F31] rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-3 border border-emerald-100 shadow-inner">
                           <User size={24} />
                        </div>
                        <h4 className="font-black text-lg text-slate-900 leading-tight">{selectedInquiry.name}</h4>
                        <p className="text-2xs font-black text-slate-400 uppercase tracking-widest mt-1">Inquiry Lead</p>
                        
                        <div className="flex justify-center gap-3 mt-4">
                           <button onClick={() => window.open(`tel:${selectedInquiry.phone}`)} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100 cursor-pointer"><Phone size={16} /></button>
                           {selectedInquiry.phone && <button onClick={() => window.open(`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`)} className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 border border-green-100 cursor-pointer"><MessageCircle size={16} /></button>}
                           {selectedInquiry.email && <button onClick={() => window.location.href = `mailto:${selectedInquiry.email}`} className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 border border-amber-100 cursor-pointer"><Mail size={16} /></button>}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-left">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                              <p className="text-xs font-bold text-slate-800">{selectedInquiry.phone || 'N/A'}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                              <p className="text-xs font-bold text-slate-800 truncate">{selectedInquiry.email || 'N/A'}</p>
                           </div>
                        </div>
                     </div>

                     {/* Message Details */}
                     <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Enquiry Message</h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <p className="text-[9px] font-black text-[#004F31] uppercase tracking-widest mb-1">Type / Title</p>
                           <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              {selectedInquiry.propertyTitle}
                           </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Message</p>
                           <p className="text-xs font-semibold text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedInquiry.message || 'No message left.'}</p>
                        </div>
                     </div>

                     {/* Quick Controls */}
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Inquiry Controls</h4>
                        <div className="grid grid-cols-2 gap-3">
                           <button 
                              onClick={() => updateStatus(selectedInquiry.id, 'contacted')} 
                              className={`flex-1 font-black py-2.5 rounded-xl text-2xs uppercase tracking-widest flex items-center justify-center gap-1 border cursor-pointer transition-colors ${
                                 selectedInquiry.status === 'contacted' 
                                 ? 'bg-[#004F31] text-white border-transparent' 
                                 : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                           >
                              Mark Contacted
                           </button>
                           <button 
                              onClick={() => updateStatus(selectedInquiry.id, 'closed')} 
                              className={`flex-1 font-black py-2.5 rounded-xl text-2xs uppercase tracking-widest flex items-center justify-center gap-1 border cursor-pointer transition-colors ${
                                 selectedInquiry.status === 'closed' 
                                 ? 'bg-green-600 text-white border-transparent' 
                                 : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                           >
                              Mark Closed
                           </button>
                        </div>
                        <button 
                           onClick={() => {
                              if(confirm("Are you sure you want to delete this permanently?")) {
                                 deleteInquiry(selectedInquiry.id);
                              }
                           }}
                           className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-black py-2.5 rounded-xl text-2xs uppercase tracking-widest flex items-center justify-center gap-1 border border-rose-200 cursor-pointer transition-colors"
                        >
                           <Trash2 size={12} /> Delete Permanently
                        </button>
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>

      {/* Bottom Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-[#004F31] p-10 rounded-[40px] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="relative z-10">
               <h3 className="text-3xl font-black mb-4">Boost Inquiry Volume</h3>
               <p className="text-white/80 font-bold mb-8 max-w-sm">
                 Premium listings receive 4x more inquiries. Upgrade your most popular properties to the top of search results.
               </p>
               <button className="px-8 py-4 bg-white text-[#004F31] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl shadow-black/10 cursor-pointer">
                 Upgrade Now
               </button>
            </div>
            <div className="absolute bottom-[-20px] right-[-20px] opacity-10 rotate-[-15deg] group-hover:rotate-0 transition-all duration-700 pointer-events-none">
               <Sparkles size={160} />
            </div>
         </div>

         <div className="bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
               <h3 className="text-3xl font-black mb-4">New Lead Automation</h3>
               <p className="text-white/60 font-bold mb-8 max-w-sm uppercase tracking-[0.1em] text-[10px]">
                 Set up instant auto-replies for your property inquiries to improve response times and conversion.
               </p>
               <button className="px-8 py-4 bg-[#00897b] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#007b6e] transition-all shadow-xl shadow-[#00897b]/20 cursor-pointer">
                 Enable Automation
               </button>
            </div>
            <div className="absolute bottom-[-30px] right-[-30px] opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none">
               <Command size={180} />
            </div>
         </div>
      </div>
    </div>
  );
}
