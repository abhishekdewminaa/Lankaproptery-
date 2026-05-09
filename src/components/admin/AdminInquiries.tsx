import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  ArrowUpRight,
  Loader2,
  Trash2,
  ChevronRight
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
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'contacted'>('all');

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
  const filtered = inquiries.filter(i => activeTab === 'all' || i.status === activeTab);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-admin-text-dark tracking-tight">Customer Inquiries</h1>
          <p className="text-admin-text-gray font-bold mt-2">Manage and convert your leads efficiently</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0 md:min-w-[300px]">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
              type="text" 
              placeholder="Filter leads..."
              className="w-full bg-white border border-admin-border rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-admin-primary/20"
             />
          </div>
          <button className="p-3 bg-white border border-admin-border rounded-2xl text-admin-text-gray hover:bg-gray-50 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Inquiries', value: inquiries.length, icon: <MessageSquare className="text-blue-500" /> },
          { label: 'Pending Response', value: newCount, icon: <Clock className="text-admin-accent" /> },
          { label: 'Conversion Rate', value: '18%', icon: <Zap className="text-admin-gold" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-admin-border shadow-sm flex items-center gap-6">
             <div className="w-14 h-14 bg-admin-bg rounded-2xl flex items-center justify-center">
                {stat.icon}
             </div>
             <div>
                <p className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-admin-text-dark">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[40px] border border-admin-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-admin-border bg-gray-50/50 flex gap-1">
               {['all', 'new', 'contacted'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                     activeTab === tab ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20' : 'text-admin-text-gray hover:bg-gray-100'
                   }`}
                 >
                   {tab}
                 </button>
               ))}
            </div>

            <div className="divide-y divide-admin-border">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-admin-primary" size={32} />
                  <p className="text-admin-text-gray font-bold text-sm tracking-widest uppercase">Fetching leads...</p>
                </div>
              ) : filtered.length > 0 ? (
                filtered.map((inquiry) => (
                  <div key={inquiry.id} className="p-8 hover:bg-admin-bg/50 transition-colors group">
                    <div className="flex flex-col md:flex-row gap-8">
                       <div className="flex-grow space-y-4">
                         <div className="flex items-center gap-3">
                           <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                             inquiry.status === 'new' ? 'bg-admin-accent/10 text-admin-accent' :
                             inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                           }`}>
                             {inquiry.status}
                           </span>
                           <span className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest flex items-center gap-2">
                             <Calendar size={14} /> {inquiry.date}
                           </span>
                         </div>
                         
                         <div>
                            <h3 className="text-lg font-black text-admin-text-dark group-hover:text-admin-primary transition-colors flex items-center gap-2">
                              {inquiry.name}
                              <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-admin-primary" />
                            </h3>
                            <p className="text-xs font-bold text-admin-text-gray uppercase tracking-widest mt-1">
                              Interested in: <span className="text-admin-text-dark">{inquiry.propertyTitle}</span>
                            </p>
                         </div>

                         <div className="bg-admin-bg p-5 rounded-3xl relative">
                            <p className="text-admin-text-dark text-sm leading-relaxed italic">"{inquiry.message}"</p>
                            <div className="absolute top-4 right-4 text-admin-primary opacity-20">
                               <MessageSquare size={32} />
                            </div>
                         </div>
                       </div>

                       <div className="md:w-64 flex flex-col justify-center gap-4">
                          <div className="space-y-3">
                             <div className="flex items-center gap-4 text-sm font-bold text-admin-text-dark">
                               <div className="w-10 h-10 bg-white border border-admin-border rounded-xl flex items-center justify-center shadow-sm">
                                 <Phone size={16} className="text-admin-primary" />
                               </div>
                               {inquiry.phone}
                             </div>
                             <div className="flex items-center gap-4 text-sm font-bold text-admin-text-dark">
                               <div className="w-10 h-10 bg-white border border-admin-border rounded-xl flex items-center justify-center shadow-sm">
                                 <Mail size={16} className="text-admin-primary" />
                               </div>
                               <span className="truncate">{inquiry.email}</span>
                             </div>
                          </div>

                          <div className="flex gap-2">
                             <button 
                               onClick={() => updateStatus(inquiry.id, 'contacted')}
                               className="flex-grow bg-admin-text-dark text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-admin-primary transition-colors shadow-lg shadow-black/5"
                             >
                               {inquiry.status === 'contacted' ? 'Follow Up' : 'Mark Contacted'}
                             </button>
                             <button 
                               onClick={() => deleteInquiry(inquiry.id)}
                               className="p-3 border border-admin-border rounded-xl text-gray-400 hover:text-admin-accent hover:bg-admin-accent/5 transition-all"
                             >
                               <Trash2 size={18} />
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-black text-admin-text-dark">No inquiries found</h3>
                  <p className="text-admin-text-gray font-bold max-w-xs mx-auto mt-2">
                    When customers reach out about your properties, you'll see them here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
           <div className="bg-admin-primary p-8 rounded-[40px] text-white relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full" />
              <Zap className="text-admin-gold mb-6" size={32} />
              <h4 className="text-xl font-black mb-3">Boost Inquiry Volume</h4>
              <p className="text-white/70 text-xs font-medium leading-relaxed mb-6">
                Active listings with "Promoted" badges get 3x more responses on average.
              </p>
              <button className="w-full bg-white text-admin-primary py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-admin-bg transition-colors flex items-center justify-center gap-2">
                Upgrade Now <ArrowUpRight size={14} />
              </button>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-admin-border shadow-sm">
              <CheckCircle className="text-admin-secondary mb-6" size={32} />
              <h4 className="text-xl font-black text-admin-text-dark mb-3">Lead Automation</h4>
              <p className="text-admin-text-gray text-xs font-bold leading-relaxed mb-6 uppercase tracking-wider">
                System is monitoring 24/7 for high-intent visitors.
              </p>
              <div className="flex items-center gap-3 p-3 bg-admin-bg rounded-2xl border border-admin-border/50">
                 <div className="w-2 h-2 bg-admin-secondary rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-admin-secondary uppercase tracking-widest">Active & Validating</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
