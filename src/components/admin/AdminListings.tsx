import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  MessageSquare, 
  MapPin, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Power,
  ChevronRight,
  Loader2,
  Zap,
  Layout,
  BarChart3,
  Target,
  Plus,
  ClipboardList
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface Property {
  id: string;
  listing_title: string;
  price_lkr: number;
  city: string;
  district: string;
  property_category: string;
  listing_type: string;
  views_count: number;
  leads_count: number;
  status: string;
  images: string[];
}

export default function AdminListings({ user, onEdit, onNewProperty }: { user: any, onEdit: (p: any) => void, onNewProperty: () => void }) {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user?.email)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchListings();
  }, [user]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    setUpdatingId(id);
    const newStatus = currentStatus === 'paused' ? 'active' : 'paused';
    try {
      const { error } = await supabase.from('properties').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setListings(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteProperty = async (id: string) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      setListings(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-admin-text-dark tracking-tight">Active Properties</h1>
          <p className="text-admin-text-gray font-bold mt-2">Manage your inventory and track listing performance across all channels.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={fetchListings}
            className="p-4 border border-admin-border rounded-2xl text-admin-text-gray hover:bg-admin-bg transition-all shadow-sm"
          >
            <Loader2 className={loading ? "animate-spin" : ""} size={20} />
          </button>
          <button 
            onClick={onNewProperty}
            className="flex-grow md:flex-grow-0 bg-[#006644] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#006644]/20 hover:bg-[#005533] transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <Plus size={20} />
            Post New Ad
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Ads', 
            value: listings.length, 
            tag: 'SYNCED', 
            tagColor: 'text-green-500 bg-green-500/10',
            icon: <Layout className="text-green-600" />,
            bgColor: 'bg-green-50' 
          },
          { 
            label: 'Active Pool', 
            value: listings.filter(l => l.status === 'active').length, 
            tag: 'LIVE', 
            tagColor: 'text-blue-500 bg-blue-500/10',
            icon: <Zap className="text-blue-600" />,
            bgColor: 'bg-blue-50'
          },
          { 
            label: 'Total Views', 
            value: listings.reduce((acc, l) => acc + (l.views_count || 0), 0).toLocaleString(), 
            tag: 'REACH', 
            tagColor: 'text-indigo-500 bg-indigo-500/10',
            icon: <Eye className="text-indigo-600" />,
            bgColor: 'bg-indigo-50'
          },
          { 
            label: 'Ad Spend', 
            value: 'LKR 0', 
            tag: 'FREE', 
            tagColor: 'text-admin-gold bg-admin-gold/10',
            icon: <Target className="text-admin-gold" />,
            bgColor: 'bg-admin-gold/5'
          },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[40px] border border-admin-border shadow-sm flex flex-col gap-6 hover:shadow-xl hover:shadow-black/5 transition-all group"
          >
             <div className="flex justify-between items-start">
               <div className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  {stat.icon}
               </div>
               <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${stat.tagColor}`}>
                 {stat.tag}
               </span>
             </div>
             <div>
                <p className="text-sm font-black text-admin-text-dark tracking-tight">{stat.label}</p>
                <p className="text-4xl font-black text-admin-text-dark mt-1">{stat.value}</p>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-admin-border shadow-sm flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by title, location or property ID..."
              className="w-full bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all"
            />
         </div>
         <div className="flex gap-3 w-full md:w-auto">
            <select className="flex-grow md:flex-grow-0 bg-admin-bg border-transparent rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-gray-100 transition-colors">
               <option>All Assets</option>
               <option>Residential</option>
               <option>Commercial</option>
               <option>Lands</option>
            </select>
            <button className="p-4 bg-admin-bg border-transparent rounded-2xl text-admin-text-gray hover:bg-gray-100 transition-colors">
               <Filter size={20} />
            </button>
         </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
             <Loader2 className="animate-spin text-admin-primary" size={48} />
             <p className="text-admin-text-gray font-black text-sm uppercase tracking-widest">Syncing inventory...</p>
          </div>
        ) : listings.length > 0 ? (
          listings.map((property) => (
            <motion.div
              layout
              key={property.id}
              className={`bg-white p-8 rounded-[48px] border border-admin-border shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all group flex flex-col lg:flex-row gap-10 items-start lg:items-center ${property.status === 'paused' ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              {/* Thumbnail */}
              <div className="w-full lg:w-60 h-40 rounded-[32px] overflow-hidden shrink-0 relative bg-gray-100 shadow-inner">
                 <img 
                   src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'} 
                   alt={property.listing_title} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                 />
                 <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg ${
                      property.status === 'paused' ? 'bg-black text-white' : 'bg-white text-admin-primary'
                    }`}>
                      {property.status}
                    </span>
                 </div>
              </div>

              {/* Info */}
              <div className="flex-grow min-w-0 space-y-3">
                 <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-admin-bg border border-admin-border text-admin-text-gray text-[9px] font-black uppercase tracking-widest">
                       {property.property_category || 'House'}
                    </span>
                    <span className="text-[10px] text-admin-text-gray font-bold uppercase tracking-widest">ID: #{String(property.id).split('-')[0].toUpperCase()}</span>
                 </div>
                 <h3 className="text-2xl font-black text-admin-text-dark line-clamp-1 group-hover:text-[#006644] transition-colors tracking-tight">{property.listing_title}</h3>
                 <div className="flex items-center gap-6 text-xs font-bold text-admin-text-gray">
                    <span className="flex items-center gap-2"><MapPin size={16} className="text-[#006644]" /> {property.city}, {property.district}</span>
                    <span className="flex items-center gap-2"><BarChart3 size={16} className="text-[#006644]" /> {property.listing_type}</span>
                 </div>
              </div>

              {/* Stats - Vertical Stack */}
              <div className="hidden xl:flex flex-col gap-4 px-10 border-x border-admin-border min-w-[180px]">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Views</span>
                    <span className="text-lg font-black text-admin-text-dark">{property.views_count || 0}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Leads</span>
                    <span className="text-lg font-black text-admin-primary">{property.leads_count || 0}</span>
                 </div>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-8 w-full lg:w-auto">
                 <div className="text-center sm:text-right flex-grow min-w-[140px]">
                    <p className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest mb-1">Market Price</p>
                    <p className="text-2xl font-black text-admin-text-dark tracking-tight">Rs. {property.price_lkr?.toLocaleString()}</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="relative group/tooltip">
                      <button 
                        onClick={() => toggleStatus(property.id, property.status)}
                        disabled={updatingId === property.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          property.status === 'paused' 
                            ? 'border-admin-border text-gray-400 hover:text-admin-primary hover:bg-admin-bg' 
                            : 'bg-[#00B67A] text-white border-[#00B67A] shadow-lg shadow-[#00B67A]/20 hover:scale-105'
                        }`}
                      >
                        {updatingId === property.id ? <Loader2 className="animate-spin" size={22} /> : <Power size={22} />}
                      </button>
                    </div>

                    <button 
                      onClick={() => onEdit(property)}
                      className="p-4 bg-white border border-admin-border rounded-2xl text-admin-text-dark hover:bg-admin-bg transition-all shadow-sm active:scale-95"
                    >
                      <Edit3 size={22} />
                    </button>

                    <button 
                      onClick={() => deleteProperty(property.id)}
                      className="p-4 bg-white border border-admin-border rounded-2xl text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-95"
                    >
                      <Trash2 size={22} />
                    </button>

                    <a 
                      href={`/property/${property.id}`}
                      target="_blank"
                      className="p-4 bg-admin-text-dark text-white rounded-2xl hover:bg-admin-primary transition-all shadow-xl shadow-black/10 active:scale-95"
                    >
                      <ExternalLink size={22} />
                    </a>
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-24 text-center animate-in fade-in zoom-in duration-700">
             <div className="relative inline-block mb-8">
                <div className="w-32 h-32 bg-admin-bg rounded-full flex items-center justify-center">
                  <ClipboardList size={48} className="text-gray-200" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-admin-bg">
                  <Plus size={20} className="text-[#006644]" />
                </div>
             </div>
             <h3 className="text-3xl font-black text-admin-text-dark mb-4">Inventory is empty</h3>
             <p className="text-admin-text-gray font-bold max-w-sm mx-auto mb-10">
                You haven't posted any properties yet. Start your journey by listing your first property and attract potential buyers.
             </p>
             <button 
               onClick={onNewProperty}
               className="bg-[#006644] text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-[#006644]/20 hover:bg-[#005533] transition-all active:scale-95"
             >
                List Your First Property
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Compass({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
