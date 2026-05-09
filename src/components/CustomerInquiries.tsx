import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Calendar, Phone, Mail, ChevronRight, User, Clock, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

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

export default function CustomerInquiries({ user }: { user?: any }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        const formatted = data.map((item: any) => ({
          id: item.id,
          name: item.full_name,
          email: item.email,
          phone: item.phone,
          propertyTitle: item.inquiry_type || 'General Inquiry',
          message: item.message,
          date: new Date(item.created_at).toLocaleString(),
          status: item.status || 'new'
        }));
        setInquiries(formatted);
      }
    } catch (err: any) {
      console.warn('Using mock inquiries as fallback:', err.message);
      setInquiries([
        {
          id: '1',
          name: 'Kasun Wijesinghe',
          email: 'kasun.w@gmail.com',
          phone: '077 123 4567',
          propertyTitle: 'Modern Villa in Rajagiriya',
          message: 'I am interested in viewing this property this weekend. Is it still available?',
          date: 'Oct 24, 2023 • 10:30 AM',
          status: 'new'
        },
        {
          id: '2',
          name: 'Sanduni Perera',
          email: 'sanduni.p@outlook.com',
          phone: '071 987 6543',
          propertyTitle: 'Luxury Apartment Colombo 03',
          message: 'Could you please send me the floor plans and some more photos of the kitchen area?',
          date: 'Oct 23, 2023 • 02:15 PM',
          status: 'contacted'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id: string, newStatus: 'new' | 'contacted' | 'closed') => {
    try {
      const { error } = await supabase
        .from('property_inquiries')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i));
    } catch (err: any) {
      console.warn("Failed to update status:", err);
      // Fallback update for mock data
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i));
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    
    try {
      const { error } = await supabase
        .from('property_inquiries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setInquiries(inquiries.filter(i => i.id !== id));
    } catch (err: any) {
      console.warn("Failed to delete inquiry:", err);
      // Fallback delete for mock data
      setInquiries(inquiries.filter(i => i.id !== id));
    }
  };

  const newCount = inquiries.filter(i => i.status === 'new').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-dark-navy text-white py-16 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-brand-green rounded-2xl flex items-center justify-center text-white">
                <MessageSquare size={24} />
              </div>
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {newCount} New Leads
              </span>
            </div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black mb-2"
            >
              Customer Inquiries
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-blue-100 text-lg"
            >
              Manage and respond to your incoming property leads from Supabase.
            </motion.p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-sm uppercase tracking-widest border border-white/10">
              Export CSV
            </button>
            <button 
              onClick={fetchInquiries}
              disabled={loading}
              className="px-6 py-3 bg-brand-green text-white rounded-xl font-bold hover:bg-opacity-90 transition-all text-sm uppercase tracking-widest shadow-lg shadow-brand-green/20 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Refresh Leads'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Inquiries', value: inquiries.length.toString(), color: 'text-dark-navy', bg: 'bg-white' },
            { label: 'Pending Response', value: newCount.toString(), color: 'text-brand-green', bg: 'bg-white' },
            { label: 'Conversion Rate', value: '18%', color: 'text-blue-600', bg: 'bg-white' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-6 rounded-3xl shadow-lg border border-gray-100`}>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Inquiry List */}
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center text-sm font-bold bg-gray-50/50">
            <div className="flex gap-8">
              <button 
                onClick={() => setActiveTab('all')}
                className={`${activeTab === 'all' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400 hover:text-dark-navy'} pb-1`}
              >
                All Leads
              </button>
              <button 
                onClick={() => setActiveTab('unread')}
                className={`${activeTab === 'unread' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400 hover:text-dark-navy'} pb-1`}
              >
                Unread
              </button>
              <button 
                onClick={() => setActiveTab('following')}
                className={`${activeTab === 'following' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400 hover:text-dark-navy'} pb-1`}
              >
                Following Up
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-brand-green" size={48} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm text-center px-4">Syncing with Supabase...</p>
              </div>
            ) : inquiries.filter(i => activeTab === 'all' || (activeTab === 'unread' && i.status === 'new') || (activeTab === 'following' && i.status === 'contacted')).length > 0 ? (
              inquiries
                .filter(i => activeTab === 'all' || (activeTab === 'unread' && i.status === 'new') || (activeTab === 'following' && i.status === 'contacted'))
                .map((inquiry, idx) => (
                <motion.div 
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 hover:bg-gray-50/80 transition-all group flex flex-col md:flex-row gap-6"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        inquiry.status === 'new' ? 'bg-brand-green/10 text-brand-green' :
                        inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {inquiry.status}
                      </span>
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                        <Clock size={14} />
                        {inquiry.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-dark-navy mb-1 group-hover:text-brand-green transition-colors flex items-center gap-2">
                      {inquiry.name} <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      Inquiry for: <span className="text-dark-navy">{inquiry.propertyTitle}</span>
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-2xl italic">
                      "{inquiry.message}"
                    </p>
                  </div>

                  <div className="md:w-64 flex flex-col justify-center space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-all">
                        <Phone size={14} />
                      </div>
                      {inquiry.phone}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-all">
                        <Mail size={14} />
                      </div>
                      <span className="truncate">{inquiry.email}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => updateStatus(inquiry.id, 'contacted')}
                        className="flex-1 py-2.5 rounded-xl bg-dark-navy text-white text-[10px] font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all shadow-md"
                      >
                        {inquiry.status === 'contacted' ? 'Contacted' : 'Reply'}
                      </button>
                      <button 
                        onClick={() => deleteInquiry(inquiry.id)}
                        className="w-10 h-10 rounded-xl border border-gray-100 text-gray-400 flex items-center justify-center hover:bg-brand-red/10 hover:text-brand-red transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => updateStatus(inquiry.id, inquiry.status === 'closed' ? 'new' : 'closed')}
                        className={`w-10 h-10 rounded-xl border ${inquiry.status === 'closed' ? 'bg-brand-green border-brand-green text-white' : 'border-gray-100 text-gray-400 hover:bg-brand-green/10 hover:text-brand-green'} flex items-center justify-center transition-all`}
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center">
                <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">No inquiries yet</h3>
                <p className="text-gray-500 mt-2">When customers contact you, they will appear here.</p>
              </div>
            )}
          </div>
          
          {inquiries.length > 10 && (
            <div className="p-8 text-center bg-gray-50/30">
              <button className="text-brand-green font-black text-sm uppercase tracking-[0.2em] hover:underline">
                Load More Inquiries
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
