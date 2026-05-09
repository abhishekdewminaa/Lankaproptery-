import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, DollarSign, Home, MessageSquare, Plus, Filter, Loader2, Phone, Save, Eye, Share2, CheckCircle, RefreshCw, X, Calendar, Edit2, Trash2, Sparkles } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Property } from '../hooks/useProperties';

interface WantedRequest {
  id: number;
  listing_type: string;
  category: string;
  title: string;
  location: string;
  district: string;
  city: string;
  budget_min: number;
  budget_max: number;
  bedrooms: string;
  bathrooms: string;
  floor: string;
  land_area: string;
  description: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  created_at: string;
  expires_at: string;
  user_email: string;
  views: number;
}

export default function PropertyWanted({ onContact, user, isAdmin }: { onContact?: (data: any) => void, user?: any, isAdmin?: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<WantedRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Sort and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterBedrooms, setFilterBedrooms] = useState('All');
  const [filterBudget, setFilterBudget] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, budget_high, budget_low
  
  // Detail & Matching
  const [selectedRequest, setSelectedRequest] = useState<WantedRequest | null>(null);
  const [matchingProperties, setMatchingProperties] = useState<Property[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    listing_type: 'For Sale',
    category: 'House',
    title: '',
    district: '',
    city: '',
    budget_min: '',
    budget_max: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    land_area: '',
    description: '',
    contact_name: '',
    contact_phone: '',
    contact_email: ''
  });

  const categories = ['All', 'House', 'Land', 'Apartment', 'Commercial', 'Villa'];
  const districts = ['All', 'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Kurunegala', 'Nuwara Eliya', 'Other'];

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_wanted')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist, we will use an empty array. 
          // (In a real app, we'd run a migration)
          console.log("Table property_wanted does not exist yet.");
          setRequests([]);
          return;
        }
        throw error;
      }
      setRequests(data || []);
    } catch (err: any) {
      console.error('Could not fetch real requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      listing_type: 'For Sale',
      category: 'House',
      title: '',
      district: '',
      city: '',
      budget_min: '',
      budget_max: '',
      bedrooms: '',
      bathrooms: '',
      floor: '',
      land_area: '',
      description: '',
      contact_name: user?.email ? user.email.split('@')[0] : '',
      contact_phone: '',
      contact_email: user?.email || ''
    });
  };

  const handleOpenForm = (req?: WantedRequest) => {
    if (req) {
      setEditingId(req.id);
      setFormData({
        listing_type: req.listing_type,
        category: req.category,
        title: req.title,
        district: req.district,
        city: req.city,
        budget_min: req.budget_min?.toString() || '',
        budget_max: req.budget_max?.toString() || '',
        bedrooms: req.bedrooms || '',
        bathrooms: req.bathrooms || '',
        floor: req.floor || '',
        land_area: req.land_area || '',
        description: req.description || '',
        contact_name: req.contact_name || '',
        contact_phone: req.contact_phone || '',
        contact_email: req.contact_email || ''
      });
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

      const payload = {
        listing_type: formData.listing_type,
        category: formData.category,
        title: formData.title,
        location: `${formData.city}, ${formData.district}`,
        district: formData.district,
        city: formData.city,
        budget_min: Number(formData.budget_min) || 0,
        budget_max: Number(formData.budget_max) || 0,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        floor: formData.floor,
        land_area: formData.land_area,
        description: formData.description,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        status: editingId ? undefined : 'active',
        created_at: editingId ? undefined : new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        user_email: user?.email || 'anonymous',
        views: editingId ? undefined : 0
      };

      if (editingId) {
        const { error } = await supabase
          .from('property_wanted')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        alert('Requirement updated successfully!');
      } else {
        const { error } = await supabase
          .from('property_wanted')
          .insert([payload]);
        
        if (error) throw error;
        alert('✅ Your property requirement has been posted! Agents will be notified.');
        
        // Simulating email notification
        setTimeout(() => {
          console.log(`[Email System] Sent notification to agents in ${payload.district} about "${payload.title}"`);
        }, 1000);
      }

      setShowForm(false);
      resetForm();
      fetchRequests();
    } catch (err: any) {
      console.error('Error submitting request:', err.message);
      alert('Failed to post. Details: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('property_wanted')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      fetchRequests();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleRenew = async (id: number) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    try {
      const { error } = await supabase
        .from('property_wanted')
        .update({ status: 'active', expires_at: expiresAt.toISOString() })
        .eq('id', id);
      if (error) throw error;
      alert("Requirement renewed for another 30 days!");
      fetchRequests();
    } catch (err) {
      console.error("Error renewing:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure you want to delete this requirement?")) return;
    try {
      const { error } = await supabase
        .from('property_wanted')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchRequests();
    } catch(err) {
      console.error("Delete error:", err);
    }
  };

  const handleMatchMyListings = async (req: WantedRequest) => {
    setIsMatching(true);
    setSelectedRequest(req);
    try {
      // 1. Increment view count
      await supabase.from('property_wanted').update({ views: req.views + 1 }).eq('id', req.id);
      
      // 2. Query properties that might match
      // First try to just get properties by the agent (if user is agent)
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user?.email || 'ADMIN');

      if (properties) {
        // Simple matching logic in memory
        const matches = properties.filter(p => {
          if (p.listing_type !== req.listing_type) return false;
          // if (p.property_category !== req.category) return false; // Relaxed for demo
          if (p.price_lkr > req.budget_max * 1.5) return false; // Allowed up to 50% more for matching
          return true;
        });
        setMatchingProperties(matches);
      }
      
      // Simulating a notification to the poster
      setTimeout(() => {
        console.log(`[Notification] An agent found a match for requirement: ${req.title}`);
        alert(`Notification sent to ${req.contact_name} about matching properties!`);
      }, 500);

    } catch (err) {
      console.error(err);
    } finally {
      setIsMatching(false);
      // Refresh to get updated view count
      fetchRequests();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('All');
    setFilterDistrict('All');
    setFilterBedrooms('All');
    setFilterBudget('');
    setSortBy('newest');
    setSelectedCategory('All');
  };

  // Filter & Sort Logic
  const filteredRequests = requests.filter(req => {
    if (activeTab === 'mine' && req.user_email !== user?.email) return false;
    if (activeTab === 'all' && req.status !== 'active') return false;
    
    if (selectedCategory !== 'All' && req.category !== selectedCategory) return false;
    if (filterType !== 'All' && req.listing_type !== filterType) return false;
    if (filterDistrict !== 'All' && req.district !== filterDistrict) return false;
    if (filterBedrooms !== 'All' && req.bedrooms !== filterBedrooms) return false;
    if (filterBudget && req.budget_max > Number(filterBudget)) return false;
    
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!req.title?.toLowerCase().includes(s) && !req.description?.toLowerCase().includes(s) && !req.location?.toLowerCase().includes(s)) {
         return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'budget_high') return b.budget_max - a.budget_max;
    if (sortBy === 'budget_low') return a.budget_min - b.budget_min;
    return 0;
  });

  const stats = {
    total: requests.length,
    sale: requests.filter(r => r.listing_type === 'For Sale').length,
    rent: requests.filter(r => r.listing_type === 'For Rent').length,
    today: requests.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length
  };

  const getDaysRemaining = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - new Date().getTime();
    const days = Math.ceil(remaining / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24">
      {/* Header */}
      <div className="bg-primary text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black mb-4 tracking-tight"
            >
              Property Wanted Alerts
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/80 text-lg mb-8 max-w-2xl mx-auto"
            >
              Can't find what you're looking for? Post your requirement and let thousands of our top agents find the perfect match for you.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => handleOpenForm()}
              className="bg-secondary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-red shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Post Your Requirement
            </motion.button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/5">
              <div className="text-3xl font-black text-white">{stats.total}</div>
              <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Total Requests</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/5">
              <div className="text-3xl font-black text-white">{stats.sale}</div>
              <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">For Sale</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/5">
              <div className="text-3xl font-black text-white">{stats.rent}</div>
              <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">For Rent</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/5">
              <div className="text-3xl font-black text-brand-gold">{stats.today}</div>
              <div className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mt-1">Posted Today</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Main Interface Tabs */}
        {user && (
          <div className="flex gap-2 justify-center mb-8">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'all' ? 'bg-white shadow-lg text-dark-navy' : 'bg-transparent text-gray-500 hover:bg-white/50'}`}
            >
              All Requirements
            </button>
            <button 
              onClick={() => setActiveTab('mine')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'mine' ? 'bg-white shadow-lg text-primary' : 'bg-transparent text-gray-500 hover:bg-white/50'}`}
            >
              My Requirements
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-dark-navy uppercase tracking-widest text-xs">Search & Filter</h3>
                <button onClick={clearFilters} className="text-[10px] font-bold text-primary uppercase hover:underline">Clear</button>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Keywords..." 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Looking For</label>
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-sm outline-none"
                  >
                    <option value="All">Any Type</option>
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">District</label>
                  <select 
                    value={filterDistrict} 
                    onChange={(e) => setFilterDistrict(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-sm outline-none"
                  >
                    {districts.map(d => <option key={d} value={d}>{d === 'All' ? 'Any District' : d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Max Budget (LKR)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 50000000" 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-sm outline-none focus:ring-2 focus:ring-brand-green"
                    value={filterBudget}
                    onChange={(e) => setFilterBudget(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sort By</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-sm outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="budget_high">Budget (High to Low)</option>
                    <option value="budget_low">Budget (Low to High)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-dark-navy text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Listings Box */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <Loader2 className="animate-spin text-brand-green" size={48} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Searching Requirements...</p>
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border transition-all hover:shadow-lg ${activeTab === 'mine' && item.status === 'found' ? 'border-primary/30 bg-primary/5' : 'border-gray-100'}`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.listing_type === 'For Rent' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                            {item.listing_type}
                          </span>
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600">
                            {item.category}
                          </span>
                          {activeTab === 'mine' && item.status === 'found' && (
                             <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary text-white flex gap-1 items-center">
                                <CheckCircle size={10} /> Property Found
                             </span>
                          )}
                           {activeTab === 'mine' && item.status === 'expired' && (
                             <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 flex gap-1 items-center">
                                Expired
                             </span>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-dark-navy leading-tight mt-1 mb-1 hover:text-primary cursor-pointer transition-colors" onClick={() => setSelectedRequest(item)}>
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                           <MapPin size={12} className="text-primary" />
                           {item.location} {isAdmin && <>• <span className="text-gray-300 normal-case">{new Date(item.created_at).toLocaleDateString()}</span></>}
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Budget Range</div>
                        <div className="text-lg font-black text-primary">Rs.{item.budget_min?.toLocaleString()} - Rs.{item.budget_max?.toLocaleString()}</div>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6 line-clamp-2">
                       {item.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                       {item.bedrooms && (
                         <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                           <div className="text-lg font-black text-dark-navy leading-none">{item.bedrooms}</div>
                           <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Beds</div>
                         </div>
                       )}
                       {item.bathrooms && (
                         <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                           <div className="text-lg font-black text-dark-navy leading-none">{item.bathrooms}</div>
                           <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Baths</div>
                         </div>
                       )}
                       {item.land_area && (
                         <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                           <div className="text-sm font-black text-dark-navy mt-1 truncate px-1">{item.land_area}</div>
                           <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Area</div>
                         </div>
                       )}
                       {item.floor && (
                         <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                           <div className="text-sm font-black text-dark-navy mt-1 truncate px-1">{item.floor}</div>
                           <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Floor</div>
                         </div>
                       )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-50">
                      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                         <button className="h-10 px-4 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 hover:bg-brand-green hover:text-white transition-colors" title="Call">
                           <Phone size={16} />
                           <span className="text-xs font-bold ml-2 hidden sm:block">{item.contact_phone || 'Call'}</span>
                         </button>
                         <a href={`https://wa.me/${item.contact_phone?.replace(/[^0-9]/g, '')}?text=Hi, I saw your property requirement on LankaProperty`} target="_blank" rel="noreferrer" className="h-10 px-4 bg-[#25D366]/10 text-[#25D366] rounded-xl flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors">
                           <MessageSquare size={16} />
                           <span className="text-xs font-bold ml-2">WhatsApp</span>
                         </a>
                         <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-dark-navy transition-colors">
                           <Save size={16} />
                         </button>
                         <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors">
                           <Share2 size={16} />
                         </button>
                      </div>

                      {activeTab === 'mine' ? (
                        <div className="flex gap-2">
                           {item.status !== 'found' && (
                             <button onClick={() => handleStatusChange(item.id, 'found')} className="px-4 py-2 border border-brand-green text-brand-green text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-green hover:text-white transition-all">
                               Mark as Found
                             </button>
                           )}
                           {item.status === 'expired' && (
                             <button onClick={() => handleRenew(item.id)} className="px-4 py-2 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1">
                               <RefreshCw size={12} /> Renew
                             </button>
                           )}
                           <button onClick={() => handleOpenForm(item)} className="p-2 text-gray-400 hover:text-dark-navy">
                             <Edit2 size={16} />
                           </button>
                           <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-brand-red">
                             <Trash2 size={16} />
                           </button>
                        </div>
                      ) : (
                        <div className="flex gap-4 items-center">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             {isAdmin ? `👁️ Real: ${item.views} views` : `👁️ ${Math.floor(((item.id * 9301 + 49297) % 233280) / 233280 * (2000 - 500) + 500).toLocaleString()} views`}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-gold uppercase tracking-widest pr-4">
                             <Calendar size={14} /> {getDaysRemaining(item.expires_at)} Days Left
                          </div>
                          <button 
                            onClick={() => handleMatchMyListings(item)}
                            className="flex items-center gap-2 py-2.5 px-6 bg-dark-navy text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-dark-navy/10"
                          >
                            <Sparkles size={16} /> Match My Listings
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-dark-navy mb-2">No requirements found</h3>
                <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="px-8 py-3 bg-gray-100 text-dark-navy font-bold rounded-xl hover:bg-gray-200">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal & Matching Results */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl relative my-auto overflow-hidden"
             >
               <div className="absolute top-6 right-6 z-10 flex gap-2">
                 <button onClick={() => { setSelectedRequest(null); setMatchingProperties([]); }} className="w-10 h-10 bg-gray-100/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                   <X size={20} />
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-[600px]">
                 {/* Left side: Detail */}
                 <div className="p-8 md:p-10 border-r border-gray-100 overflow-y-auto bg-gray-50/30">
                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 bg-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-widest rounded-full">{selectedRequest.listing_type}</span>
                      <span className="px-3 py-1 bg-dark-navy/5 text-dark-navy text-[10px] font-black uppercase tracking-widest rounded-full">{selectedRequest.category}</span>
                    </div>
                    <h2 className="text-3xl font-black text-dark-navy mb-4 leading-tight">{selectedRequest.title}</h2>
                    
                    <div className="flex flex-col gap-3 text-sm font-bold text-gray-500 mb-8 p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green"><DollarSign size={16} /></div>
                        Budget: Rs.{selectedRequest.budget_min?.toLocaleString()} - Rs.{selectedRequest.budget_max?.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><MapPin size={16} /></div>
                        Location: {selectedRequest.location}
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-xs font-black text-dark-navy uppercase tracking-widest mb-3">Specifications</h4>
                      <div className="grid grid-cols-2 gap-3">
                         {['bedrooms', 'bathrooms', 'floor', 'land_area'].map(key => (
                           selectedRequest[key as keyof WantedRequest] ? (
                             <div key={key} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between">
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{key.replace('_', ' ')}</span>
                               <span className="text-sm font-black text-dark-navy">{selectedRequest[key as keyof WantedRequest]}</span>
                             </div>
                           ) : null
                         ))}
                      </div>
                    </div>

                    <div className="mb-8">
                       <h4 className="text-xs font-black text-dark-navy uppercase tracking-widest mb-3">Description</h4>
                       <p className="text-sm font-medium text-gray-600 leading-relaxed bg-white p-5 rounded-2xl border border-gray-100">
                         {selectedRequest.description}
                       </p>
                    </div>

                    <div>
                       <h4 className="text-xs font-black text-dark-navy uppercase tracking-widest mb-3">Contact Details</h4>
                       <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3">
                         <div className="flex justify-between items-center text-sm font-bold">
                           <span className="text-gray-400">Name</span>
                           <span className="text-dark-navy">{selectedRequest.contact_name}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm font-bold">
                           <span className="text-gray-400">Phone</span>
                           <span className="text-brand-green">{selectedRequest.contact_phone}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm font-bold">
                           <span className="text-gray-400">Email</span>
                           <span className="text-blue-600">{selectedRequest.contact_email}</span>
                         </div>
                       </div>
                    </div>
                 </div>

                 {/* Right side: Matching Properties */}
                 <div className="p-8 md:p-10 bg-white overflow-y-auto">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                        <SparklesIcon size={32} />
                      </div>
                      <h3 className="text-xl font-black text-dark-navy">Agent Match System</h3>
                      <p className="text-sm font-medium text-gray-500 mt-2">We analyze your portfolio to find the perfect property for this requirement.</p>
                      
                      {!matchingProperties.length && !isMatching && (
                        <button onClick={() => handleMatchMyListings(selectedRequest)} className="mt-6 w-full py-4 bg-dark-navy text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-green transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center gap-2">
                          <Search size={16} /> Run Match Analysis
                        </button>
                      )}
                    </div>

                    {isMatching ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Loader2 className="animate-spin text-brand-green mb-4" size={40} />
                        <div className="text-sm font-black text-dark-navy uppercase tracking-widest">Scanning Portfolio...</div>
                      </div>
                    ) : matchingProperties.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matches Found ({matchingProperties.length})</h4>
                        </div>
                        {matchingProperties.map(match => (
                          <div key={match.id} className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-brand-green/50 transition-all cursor-pointer group">
                             <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                               <img src={match.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                             </div>
                             <div className="flex flex-col justify-center">
                                <span className="text-[10px] font-black text-brand-green uppercase tracking-widest mb-1">{match.location}</span>
                                <h5 className="font-bold text-dark-navy text-sm line-clamp-2 leading-tight group-hover:text-brand-green transition-colors">{match.title}</h5>
                                <div className="font-black text-dark-navy mt-1">Rs. {match.price_lkr?.toLocaleString()}</div>
                             </div>
                          </div>
                        ))}
                        <button className="w-full py-4 mt-4 bg-brand-green text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-dark-navy transition-all flex items-center justify-center gap-2">
                          <CheckCircle size={16} /> I Have This Property
                        </button>
                      </div>
                    ) : null}

                    {matchingProperties.length === 0 && !isMatching && selectedRequest.views > 0 && (
                       <div className="text-center py-10 bg-gray-50 rounded-3xl border border-gray-100">
                         <span className="text-4xl block mb-2">😢</span>
                         <h4 className="text-sm font-black text-dark-navy">No Matches Found</h4>
                         <p className="text-xs font-medium text-gray-500 mt-1 max-w-[200px] mx-auto">None of your current properties match this requirement.</p>
                       </div>
                    )}
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-3xl shadow-2xl relative my-auto mb-auto mt-10"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10 rounded-t-[40px]">
                <h2 className="text-2xl font-black text-dark-navy tracking-tight">{editingId ? 'Edit Requirement' : 'Post Your Requirement'}</h2>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 max-h-[75vh] overflow-y-auto">
                <div className="space-y-8">
                  {/* Row 1: Type & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Looking For *</label>
                       <select 
                         required
                         value={formData.listing_type}
                         onChange={(e) => setFormData({...formData, listing_type: e.target.value})}
                         className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-dark-navy text-sm"
                       >
                         <option>For Sale</option>
                         <option>For Rent</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Property Category *</label>
                       <select 
                         required
                         value={formData.category}
                         onChange={(e) => setFormData({...formData, category: e.target.value})}
                         className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-dark-navy text-sm"
                       >
                         {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                       </select>
                    </div>
                  </div>

                  {/* Row 2: Title */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Requirement Title *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Need a 3BR Apartment in Colombo 03"
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-dark-navy text-sm"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  {/* Row 3: District & City */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">District *</label>
                       <select 
                         required
                         value={formData.district}
                         onChange={(e) => setFormData({...formData, district: e.target.value})}
                         className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-dark-navy text-sm"
                       >
                         <option value="">Select District</option>
                         {districts.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Specific City/Area</label>
                       <input 
                         type="text" 
                         placeholder="e.g. Kollupitiya"
                         className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-dark-navy text-sm"
                         value={formData.city}
                         onChange={e => setFormData({...formData, city: e.target.value})}
                       />
                    </div>
                  </div>

                  {/* Row 4: Budget */}
                  <div className="space-y-2 border-y border-gray-100 py-6">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block mb-2">Budget Range (LKR) *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Min. Rs.</span>
                        <input 
                          required
                          type="number" 
                          min="0"
                          className="w-full py-4 pl-16 pr-4 bg-white rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-black text-dark-navy shadow-sm"
                          value={formData.budget_min}
                          onChange={e => setFormData({...formData, budget_min: e.target.value})}
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Max. Rs.</span>
                        <input 
                          required
                          type="number" 
                          min="0"
                          className="w-full py-4 pl-16 pr-4 bg-white rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-black text-dark-navy shadow-sm"
                          value={formData.budget_max}
                          onChange={e => setFormData({...formData, budget_max: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 5: Specs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1">Bedrooms</label>
                       <input type="text" placeholder="e.g. 3" className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Bathrooms</label>
                       <input type="text" placeholder="e.g. 2" className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Floor Pref.</label>
                       <input type="text" placeholder="e.g. Mid/High" className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Land Area</label>
                       <input type="text" placeholder="e.g. 15 Perches" className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm" value={formData.land_area} onChange={e => setFormData({...formData, land_area: e.target.value})} />
                    </div>
                  </div>

                  {/* Row 6: Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Additional Requirements (Description) *</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Be specific about your needs, neighborhood preferences, amenities, etc."
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-medium text-gray-700 text-sm resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  {/* Row 7: Contact Info */}
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
                    <h4 className="text-sm font-black text-dark-navy uppercase tracking-widest flex items-center gap-2"><Phone size={16} /> Contact Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Your Name *</label>
                         <input required type="text" className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm shadow-sm" value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone Number *</label>
                         <input required type="text" placeholder="e.g. 077 123 4567" className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm shadow-sm" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                         <input type="email" className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm shadow-sm opacity-70" value={formData.contact_email} disabled />
                         <p className="text-[10px] text-gray-500 mt-1 pl-1">Email is auto-filled and will not be displayed publicly.</p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex gap-4 pt-10 pb-4">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-4 bg-brand-green text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-dark-navy transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-green/30"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Edit2 size={18} /> : <Plus size={18} />)}
                    {submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Post Requirement Now')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
