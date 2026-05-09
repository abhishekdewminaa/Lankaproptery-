import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Share2
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

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
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from('property_inquiries').delete().eq('id', id);
      if (error) throw error;
      setInquiries(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const newCount = inquiries.filter(i => i.status === 'new').length;
  // Map internal tabs to statuses for filtering if needed
  const filtered = inquiries.filter(i => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return i.status === 'new';
    if (activeTab === 'following') return i.status === 'contacted';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-admin-text-dark tracking-tight">Customer Inquiries</h1>
          <p className="text-admin-text-gray font-bold mt-2">Manage and respond to your incoming property leads from Supabase.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-5 py-3 border border-admin-border rounded-xl text-admin-text-dark font-black text-xs uppercase tracking-widest hover:bg-admin-bg transition-all shadow-sm">
            <Download size={18} />
            Export CSV
          </button>
          <button 
            onClick={fetchInquiries}
            className="flex items-center gap-2 px-5 py-3 bg-[#006644] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#005533] transition-all shadow-lg shadow-[#006644]/20"
          >
            <RotateCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh Leads
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { 
            label: 'Total Inquiries', 
            value: inquiries.length, 
            tag: 'GROWTH +0%', 
            tagColor: 'text-green-500 bg-green-500/10',
            icon: <Layout className="text-green-600" />,
            bgColor: 'bg-green-50' 
          },
          { 
            label: 'Pending Response', 
            value: newCount, 
            tag: 'PRIORITY', 
            tagColor: 'text-red-500 bg-red-500/10',
            icon: <ClipboardList className="text-red-600" />,
            bgColor: 'bg-red-50'
          },
          { 
            label: 'Conversion Rate', 
            value: '18%', 
            tag: 'BENCHMARKS', 
            tagColor: 'text-indigo-500 bg-indigo-500/10',
            icon: <BarChart className="text-indigo-600" />,
            bgColor: 'bg-indigo-50'
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-admin-border shadow-sm flex flex-col gap-6 hover:shadow-xl hover:shadow-black/5 transition-all group">
             <div className="flex justify-between items-start">
               <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  {stat.icon}
               </div>
               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${stat.tagColor}`}>
                 {stat.tag}
               </span>
             </div>
             <div>
                <p className="text-sm font-black text-admin-text-dark tracking-tight">{stat.label}</p>
                <p className="text-5xl font-black text-admin-text-dark mt-1">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Leads Table/Tabs Area */}
      <div className="bg-white rounded-[40px] border border-admin-border shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-6 border-b border-admin-border flex flex-col sm:flex-row justify-between items-center gap-6">
           <div className="flex p-1 bg-admin-bg rounded-2xl w-full sm:w-auto">
             {[
               { id: 'all', label: 'All Leads' },
               { id: 'unread', label: 'Unread' },
               { id: 'following', label: 'Following Up' }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                   activeTab === tab.id ? 'bg-white text-admin-primary shadow-sm' : 'text-admin-text-gray hover:text-admin-text-dark'
                 }`}
               >
                 {tab.label}
               </button>
             ))}
           </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center p-12">
          {loading ? (
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-admin-primary" size={48} />
                <p className="text-admin-text-gray font-black text-sm uppercase tracking-widest">Loading leads...</p>
             </div>
          ) : filtered.length > 0 ? (
            <div className="w-full divide-y divide-admin-border">
              {filtered.map((inquiry) => (
                <div key={inquiry.id} className="py-8 flex flex-col md:flex-row gap-8 items-center bg-white hover:bg-admin-bg/30 transition-colors">
                  <div className="flex-grow space-y-2">
                    <div className="flex items-center gap-3">
                       <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         inquiry.status === 'new' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                       }`}>
                         {inquiry.status}
                       </span>
                       <span className="text-[11px] font-bold text-admin-text-gray"><Calendar size={14} className="inline mr-1" /> {inquiry.date}</span>
                    </div>
                    <h3 className="text-xl font-black text-admin-text-dark">{inquiry.name}</h3>
                    <p className="text-sm text-admin-text-gray line-clamp-1">{inquiry.message}</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-admin-text-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-admin-primary transition-all">View Details</button>
                    <button onClick={() => deleteInquiry(inquiry.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center max-w-md animate-in fade-in zoom-in duration-500">
               <div className="relative inline-block mb-8">
                  <div className="w-32 h-32 bg-admin-bg rounded-full flex items-center justify-center">
                    <MessageSquare size={48} className="text-gray-300" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-admin-bg">
                    <Search size={20} className="text-admin-text-dark" />
                  </div>
               </div>
               <h3 className="text-3xl font-black text-admin-text-dark mb-3">No inquiries yet</h3>
               <p className="text-admin-text-gray font-bold leading-relaxed mb-10">
                 When customers contact you, they will appear here. We'll also notify you via email and push notifications.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button className="px-8 py-4 bg-[#006644] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#006644]/20 hover:bg-[#005533] transition-all">
                    Check Email Sync
                 </button>
                 <button className="px-8 py-4 bg-white border border-admin-border text-admin-text-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-admin-bg transition-all">
                    View Tutorial
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-[#006644] p-10 rounded-[40px] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="relative z-10">
               <h3 className="text-3xl font-black mb-4">Boost Inquiry Volume</h3>
               <p className="text-white/80 font-bold mb-8 max-w-sm">
                 Premium listings receive 4x more inquiries. Upgrade your most popular properties to the top of search results.
               </p>
               <button className="px-8 py-4 bg-white text-[#006644] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-admin-bg transition-all shadow-xl shadow-black/10">
                 Upgrade Now
               </button>
            </div>
            <div className="absolute bottom-[-20px] right-[-20px] opacity-10 rotate-[-15deg] group-hover:rotate-0 transition-all duration-700 pointer-events-none">
               <Sparkles size={160} />
            </div>
         </div>

         <div className="bg-[#1A1A1A] p-10 rounded-[40px] text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
               <h3 className="text-3xl font-black mb-4">New Lead Automation</h3>
               <p className="text-white/60 font-bold mb-8 max-w-sm uppercase tracking-[0.1em] text-[10px]">
                 Set up instant auto-replies for your property inquiries to improve response times and conversion.
               </p>
               <button className="px-8 py-4 bg-[#00B67A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#00A06B] transition-all shadow-xl shadow-[#00B67A]/20">
                 Enable Automation
               </button>
            </div>
            <div className="absolute bottom-[-30px] right-[-30px] opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none">
               <Command size={180} />
            </div>
         </div>
      </div>
      
      {/* FAB */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-[#006644] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group">
         <Share2 size={24} className="group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}
