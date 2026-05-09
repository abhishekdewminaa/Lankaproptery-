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
  Plus,
  ClipboardList
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface Property {
  id: string;
  title: string;
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-admin-text-dark tracking-tight">My Listings</h1>
          <p className="text-admin-text-gray font-bold mt-2">Manage your inventory and track listing performance</p>
        </div>
        <button 
          onClick={onNewProperty}
          className="bg-admin-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-admin-primary/20 hover:bg-admin-secondary transition-all flex items-center gap-3"
        >
          <Plus size={20} />
          Post New Property
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-admin-border shadow-sm flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, location or type..."
              className="w-full bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none transition-all"
            />
         </div>
         <div className="flex gap-2 w-full md:w-auto">
            <select className="flex-grow md:flex-grow-0 bg-admin-bg border-transparent rounded-2xl px-6 py-3 text-sm font-bold outline-none cursor-pointer hover:bg-gray-100">
               <option>All Types</option>
               <option>Apartment</option>
               <option>House</option>
               <option>Land</option>
            </select>
            <button className="p-3 bg-admin-bg border-transparent rounded-2xl text-admin-text-gray hover:bg-gray-100">
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
              className={`bg-white p-6 rounded-[40px] border border-admin-border shadow-sm hover:shadow-xl hover:shadow-admin-primary/5 transition-all group flex flex-col lg:flex-row gap-8 items-start lg:items-center ${property.status === 'paused' ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              {/* Thumbnail */}
              <div className="w-full lg:w-48 h-32 rounded-3xl overflow-hidden shrink-0 relative bg-gray-100">
                 <img 
                   src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'} 
                   alt={property.title} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                 />
                 {property.status === 'paused' && (
                   <div className="absolute inset-0 bg-admin-text-dark/40 backdrop-blur-[2px] flex items-center justify-center">
                     <span className="bg-white text-admin-text-dark text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">PAUSED</span>
                   </div>
                 )}
              </div>

              {/* Info */}
              <div className="flex-grow min-w-0 space-y-2">
                 <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-admin-primary/10 text-admin-primary text-[9px] font-black uppercase tracking-widest">
                       {property.property_category || 'House'}
                    </span>
                    <span className="text-[10px] text-admin-text-gray font-black uppercase tracking-widest">#{String(property.id).split('-')[0]}</span>
                 </div>
                 <h3 className="text-xl font-black text-admin-text-dark line-clamp-1 group-hover:text-admin-primary transition-colors">{property.title}</h3>
                 <div className="flex items-center gap-4 text-xs font-bold text-admin-text-gray">
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-admin-primary" /> {property.city}, {property.district}</span>
                    <span className="flex items-center gap-1.5"><Compass size={14} className="text-admin-primary" /> {property.listing_type}</span>
                 </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8 px-6 border-x border-admin-border hidden xl:flex">
                 <div className="text-center">
                    <p className="text-lg font-black text-admin-text-dark tracking-tight">{property.views_count || 0}</p>
                    <p className="text-[9px] font-black text-admin-text-gray uppercase tracking-widest">Views</p>
                 </div>
                 <div className="text-center">
                    <p className="text-lg font-black text-admin-text-dark tracking-tight">{property.leads_count || 0}</p>
                    <p className="text-[9px] font-black text-admin-text-gray uppercase tracking-widest">Leads</p>
                 </div>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                 <div className="text-center sm:text-right flex-grow">
                    <p className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest mb-1">Price</p>
                    <p className="text-xl font-black text-admin-primary tracking-tight">Rs. {property.price_lkr?.toLocaleString()}</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleStatus(property.id, property.status)}
                      disabled={updatingId === property.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        property.status === 'paused' 
                          ? 'border-admin-border text-gray-400 hover:text-admin-primary hover:bg-admin-bg' 
                          : 'bg-admin-secondary text-white border-admin-secondary shadow-lg shadow-admin-secondary/20 hover:bg-admin-secondary/90'
                      }`}
                    >
                      {updatingId === property.id ? <Loader2 className="animate-spin" size={20} /> : <Power size={20} />}
                    </button>
                    <button 
                      onClick={() => onEdit(property)}
                      className="p-3 bg-white border border-admin-border rounded-2xl text-admin-text-gray hover:text-admin-primary hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button 
                      onClick={() => deleteProperty(property.id)}
                      className="p-3 bg-white border border-admin-border rounded-2xl text-admin-text-gray hover:text-admin-accent hover:bg-admin-accent/5 transition-all shadow-sm"
                    >
                      <Trash2 size={20} />
                    </button>
                    <a 
                      href={`/property/${property.id}`}
                      target="_blank"
                      className="p-3 bg-white border border-admin-border rounded-2xl text-admin-text-gray hover:text-admin-primary hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <ExternalLink size={20} />
                    </a>
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-24 text-center">
             <div className="w-24 h-24 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList size={40} className="text-gray-300" />
             </div>
             <h3 className="text-2xl font-black text-admin-text-dark">No Listings Found</h3>
             <p className="text-admin-text-gray font-bold max-w-sm mx-auto mt-2">
                You haven't posted any properties yet. Start your journey by listing your first property.
             </p>
             <button 
               onClick={onNewProperty}
               className="mt-8 bg-admin-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-admin-primary/20 hover:bg-admin-secondary transition-all"
             >
                List Property Now
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
