import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AutoPromoteModal from '../AutoPromoteModal';
import { slugify } from '../../utils/safeUtils';
import { 
  Search, 
  Filter, 
  Eye, 
  MapPin, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Power,
  Loader2,
  Zap,
  Layout,
  Target,
  Plus,
  ClipboardList,
  Tag,
  AlertTriangle,
  Pause,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Award,
  Clock,
  Briefcase,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';
import { DISTRICTS_BY_PROVINCE } from '../../constants/districts';

const getPropertyThumbnail = (images: any) => {
  if (!images) return null;
  if (Array.isArray(images)) {
    const first = images.find((img: any) => img && img !== '' && img !== null);
    return first || null;
  }
  if (typeof images === 'string') {
    if (images.startsWith('[')) {
      try {
        const arr = JSON.parse(images);
        return arr[0] || null;
      } catch {
        return null;
      }
    }
    if (images.startsWith('http')) return images;
  }
  return null;
};

interface Property {
  id: string;
  ref_no?: string;
  listing_title: string;
  price_lkr: number;
  usd_estimate: number;
  city: string;
  district: string;
  property_category: string;
  listing_type: string;
  views_count: number;
  leads_count: number;
  status: string;
  images: string[];
  rooms: number;
  bathrooms: number;
  floor_area: number;
  package_tier: string;
  owner_email?: string;
  agent_email?: string;
}

export default function AdminListings({ user, onEdit, onNewProperty }: { user: any, onEdit: (p: any) => void, onNewProperty: () => void }) {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterPlan, setFilterPlan] = useState('All');

  // Expanded panel
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, property: Property | null }>({ isOpen: false, property: null });
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean, property: Property | null }>({ isOpen: false, property: null });
  const [promoteModal, setPromoteModal] = useState<{ isOpen: boolean, property: Property | null }>({ isOpen: false, property: null });
  const [promotedData, setPromotedData] = useState<Record<string, { time: string, platforms: string[] }>>({});

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      let fetchedListings: Property[] = data || [];
      if (fetchedListings.length < 6) {
        const fallbackProperties: Property[] = [
          {
            id: 'demo-1',
            ref_no: 'LP0012',
            listing_title: 'Luxury Peak Penthouse',
            price_lkr: 145000000,
            usd_estimate: 483300,
            city: 'Colombo 03',
            district: 'Colombo',
            property_category: 'Apartment',
            listing_type: 'FOR SALE',
            views_count: 1420,
            leads_count: 48,
            status: 'active',
            images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
            rooms: 4,
            bathrooms: 4,
            floor_area: 3200,
            package_tier: 'premium',
            owner_email: 'ceo.lankaland@gmail.com'
          },
          {
            id: 'demo-2',
            ref_no: 'LP0034',
            listing_title: 'Spacious Modern Villa',
            price_lkr: 89000000,
            usd_estimate: 296600,
            city: 'Nugegoda',
            district: 'Colombo',
            property_category: 'Villa',
            listing_type: 'FOR SALE',
            views_count: 850,
            leads_count: 32,
            status: 'active',
            images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'],
            rooms: 5,
            bathrooms: 4,
            floor_area: 4100,
            package_tier: 'standard',
            owner_email: 'abhishekdewminaa@gmail.com'
          },
          {
            id: 'demo-3',
            ref_no: 'LP0056',
            listing_title: 'Prime Commercial Complex',
            price_lkr: 320000000,
            usd_estimate: 1066600,
            city: 'Kollupitiya',
            district: 'Colombo',
            property_category: 'Commercial',
            listing_type: 'FOR RENT',
            views_count: 2150,
            leads_count: 89,
            status: 'pending',
            images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'],
            rooms: 0,
            bathrooms: 6,
            floor_area: 8500,
            package_tier: 'premium',
            owner_email: 'finance.lankaproperty@gmail.com'
          },
          {
            id: 'demo-4',
            ref_no: 'LP0078',
            listing_title: 'Ocean View Beachfront Land',
            price_lkr: 180000000,
            usd_estimate: 600000,
            city: 'Galle Fort',
            district: 'Galle',
            property_category: 'Land',
            listing_type: 'FOR SALE',
            views_count: 980,
            leads_count: 41,
            status: 'expired',
            images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
            rooms: 0,
            bathrooms: 0,
            floor_area: 0,
            package_tier: 'standard',
            owner_email: 'partner.relations@lk.com'
          },
          {
            id: 'demo-5',
            ref_no: 'LP0090',
            listing_title: 'Cozy Bungalow in Nuwara Eliya',
            price_lkr: 75000000,
            usd_estimate: 250000,
            city: 'Nuwara Eliya',
            district: 'Nuwara Eliya',
            property_category: 'House',
            listing_type: 'FOR SALE',
            views_count: 620,
            leads_count: 19,
            status: 'active',
            images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
            rooms: 3,
            bathrooms: 2,
            floor_area: 2400,
            package_tier: 'standard'
          }
        ];
        fetchedListings = [...fetchedListings, ...fallbackProperties];
      }
      setListings(fetchedListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    setUpdatingId(id);
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const { error } = await supabase.from('properties').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setListings(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast.success(newStatus === 'active' ? '✅ Listing is now LIVE' : '⏸️ Listing paused successfully');
    } catch (err) {
      setListings(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast.success(`[Simulation] Status toggled to ${newStatus}`);
    } finally {
      setUpdatingId(null);
      setStatusModal({ isOpen: false, property: null });
    }
  };

  const deleteProperty = async (id: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      setListings(prev => prev.filter(p => p.id !== id));
      toast.success('✅ Property deleted permanently');
    } catch (err) {
      setListings(prev => prev.filter(p => p.id !== id));
      toast.success('[Simulation] Property deleted locally.');
    } finally {
      setUpdatingId(null);
      setDeleteModal({ isOpen: false, property: null });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Ref No', 'Title', 'District', 'City', 'Price (LKR)', 'Type', 'Category', 'Views', 'Status'];
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    listings.forEach(p => {
      const row = [
        p.ref_no || p.id,
        `"${p.listing_title}"`,
        p.district,
        p.city,
        p.price_lkr,
        p.listing_type,
        p.property_category,
        p.views_count,
        p.status
      ];
      csvContent += row.join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'LankaProperty_Properties_Export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('CSV exported successfully.');
  };

  // Filter properties
  const filteredListings = listings.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      p.listing_title?.toLowerCase().includes(query) ||
      p.city?.toLowerCase().includes(query) ||
      p.ref_no?.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query);

    const matchesStatus = filterStatus === 'All' || p.status?.toLowerCase() === filterStatus.toLowerCase();
    
    let matchesCategory = true;
    if (filterCategory !== 'All') {
      if (filterCategory === 'Residential') {
        matchesCategory = ['House', 'Apartment', 'Villa', 'Bungalow'].includes(p.property_category);
      } else if (filterCategory === 'Commercial') {
        matchesCategory = ['Commercial', 'Building', 'Hotel'].includes(p.property_category);
      } else if (filterCategory === 'Lands') {
        matchesCategory = ['Land'].includes(p.property_category);
      } else {
        matchesCategory = p.property_category === filterCategory;
      }
    }

    const matchesDistrict = filterDistrict === 'All' || p.district === filterDistrict;
    
    let matchesPlan = true;
    if (filterPlan !== 'All') {
      if (filterPlan === 'Premium') {
        matchesPlan = p.package_tier === 'premium' || p.package_tier === 'Premium Pro';
      } else if (filterPlan === 'Elite') {
        matchesPlan = p.package_tier === 'elite' || p.package_tier === 'Elite Pro';
      } else {
        matchesPlan = !p.package_tier || p.package_tier === 'standard' || p.package_tier === 'free';
      }
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDistrict && matchesPlan;
  });

  const totalItems = filteredListings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  // Stats calculations
  const totalAds = listings.length;
  const activeAds = listings.filter(l => l.status === 'active').length;
  const pendingAds = listings.filter(l => l.status === 'pending').length;
  const expiredAds = listings.filter(l => l.status === 'expired').length;
  const featuredAds = listings.filter(l => l.package_tier === 'premium' || l.package_tier === 'elite' || l.package_tier === 'Premium Pro' || l.package_tier === 'Elite Pro').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-24 font-sans text-slate-800">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏠</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
              All Properties
              <span className="bg-emerald-50 text-[#059669] font-black text-[11px] tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-emerald-200">
                LATEST
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-400 mt-1">
              Manage all property listings on the platform.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchListings}
            className="p-2.5 bg-white border border-slate-200 hover:bg-neutral-50 text-neutral-600 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#004F31]' : ''} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-neutral-50 text-neutral-800 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet size={16} />
            <span>EXPORT CSV</span>
          </button>
          <button
            onClick={onNewProperty}
            className="px-4 py-2.5 bg-[#004F31] hover:bg-[#006040] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Row (5 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Total Properties */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#f0fdf4] text-[#004F31] rounded-xl">
              <ClipboardList size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600">↗ +4</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Ads</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalAds}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Platform listings</p>
        </div>

        {/* Active Pool */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600">↗ +2</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Active Ads</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{activeAds}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Live listings</p>
        </div>

        {/* Pending Approval */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Pending Review</p>
          <h3 className="text-2xl sm:text-3xl font-black text-orange-600 mt-1">{pendingAds}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Awaiting audit</p>
        </div>

        {/* Expired / Paused */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Expired / Paused</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{expiredAds}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Off-market ads</p>
        </div>

        {/* Featured Premium */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#f5f3ff] text-[#7c3aed] rounded-xl">
              <Award size={18} />
            </div>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Featured Ads</p>
          <h3 className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">{featuredAds}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Premium & Elite tier</p>
        </div>

      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-[14px] p-5 space-y-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col lg:flex-row gap-3">
          
          <div className="relative lg:w-[40%] flex-1">
            <Search className="absolute left-3.5 top-3 text-[#9ca3af]" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by title, location or property ID..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 outline-none focus:border-[#004F31] focus:bg-white transition-all text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status */}
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 focus:border-[#004F31] outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
              <option value="Paused">Paused</option>
            </select>

            {/* Type Category */}
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 focus:border-[#004F31] outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Lands">Lands</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Land">Land</option>
            </select>

            {/* District */}
            <select
              value={filterDistrict}
              onChange={(e) => { setFilterDistrict(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 focus:border-[#004F31] outline-none cursor-pointer max-w-[150px]"
            >
              <option value="All">All Districts</option>
              {Object.entries(DISTRICTS_BY_PROVINCE).flatMap(([_, dists]) => dists).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Plan tier */}
            <select
              value={filterPlan}
              onChange={(e) => { setFilterPlan(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 focus:border-[#004F31] outline-none cursor-pointer"
            >
              <option value="All">All Plans</option>
              <option value="Free">Free Plan</option>
              <option value="Premium">Premium Pro</option>
              <option value="Elite">Elite Pro</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('All');
                setFilterCategory('All');
                setFilterDistrict('All');
                setFilterPlan('All');
                setCurrentPage(1);
                toast.success('Filters cleared');
              }}
              className="text-xs font-bold text-[#6b7280] hover:text-[#dc2626] uppercase transition-colors px-3 py-2 cursor-pointer"
            >
              ↺ CLEAR ALL
            </button>
          </div>
        </div>
      </div>

      {/* 4. Data Table */}
      <div className="bg-white border border-slate-200 rounded-[14px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-slate-200">
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af] text-center">#</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Photo</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Title & Location</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Type</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Price</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Owner/Agent</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Plan</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Views</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Status</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={10} className="p-4 text-center">
                      <div className="h-6 bg-slate-100 rounded animate-pulse w-3/4 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : paginatedListings.length > 0 ? (
                paginatedListings.map((property, idx) => {
                  const isExpanded = expandedRowId === property.id;
                  const thumb = getPropertyThumbnail(property.images);
                  return (
                    <React.Fragment key={property.id}>
                      <tr className="hover:bg-slate-50/50 transition-all cursor-pointer">
                        <td className="px-6 py-4 text-xs font-bold text-[#9ca3af] text-center">
                          {startIndex + idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-12 h-9 rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {thumb ? (
                              <img 
                                src={thumb} 
                                alt={property.listing_title} 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">🏠</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4" onClick={() => setExpandedRowId(isExpanded ? null : property.id)}>
                          <div>
                            <div className="text-sm font-bold text-slate-900 line-clamp-1">{property.listing_title}</div>
                            <div className="text-xs text-[#6b7280] flex items-center gap-1 mt-0.5">
                              <MapPin size={12} /> {property.city}, {property.district}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-slate-700 uppercase">{property.listing_type}</span>
                          <span className="block text-[10px] text-[#9ca3af]">{property.property_category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-slate-900">Rs. {property.price_lkr?.toLocaleString()}</div>
                          <div className="text-[10px] text-[#9ca3af]">$ {Math.round(property.price_lkr / 300).toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 truncate max-w-[150px]">
                          {property.owner_email || property.agent_email || 'ceo.lankaland@gmail.com'}
                        </td>
                        <td className="px-6 py-4">
                          {property.package_tier === 'premium' || property.package_tier === 'Premium Pro' ? (
                            <span className="bg-[#f0fdf4] text-[#059669] text-[10px] font-bold px-2 py-0.5 rounded border border-[#bbf7d0]">
                              ⭐ PREMIUM
                            </span>
                          ) : property.package_tier === 'elite' || property.package_tier === 'Elite Pro' ? (
                            <span className="bg-[#f5f3ff] text-[#7c3aed] text-[10px] font-bold px-2 py-0.5 rounded border border-[#bfdbfe]">
                              👑 ELITE
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">FREE PLAN</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-[#004F31]">
                          {property.views_count || 0}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setStatusModal({ isOpen: true, property })}
                            className={`w-10 h-5.5 rounded-full transition-colors relative outline-none flex items-center ${
                              property.status === 'active' ? 'bg-[#004F31]' : 'bg-slate-300'
                            }`}
                          >
                            <span className={`w-4 h-4 bg-white rounded-full transition-transform absolute ${
                              property.status === 'active' ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : property.id)}
                              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-[#004F31] hover:text-white transition-all text-slate-500"
                              title="Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => onEdit(property)}
                              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-slate-500"
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, property })}
                              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all text-slate-500"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              onClick={() => setPromoteModal({ isOpen: true, property })}
                              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-white transition-all scale-95 hover:scale-105"
                              title="Promote"
                            >
                              <Zap size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={10} className="bg-[#f9fafb] p-6 border-t border-b border-slate-200">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden relative text-sm"
                              >
                                <button
                                  onClick={() => setExpandedRowId(null)}
                                  className="absolute top-0 right-0 text-slate-400 hover:text-slate-600 font-bold"
                                >
                                  ✕
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                    <h4 className="font-bold text-slate-900 mb-2">Technical Details</h4>
                                    <p className="text-xs text-slate-500">Property Ref: <span className="font-bold text-slate-800">{property.ref_no || `LP${property.id}`}</span></p>
                                    <p className="text-xs text-slate-500 mt-1">Property Category: <span className="font-semibold text-slate-800">{property.property_category}</span></p>
                                    <p className="text-xs text-slate-500 mt-1">Listing Intention: <span className="font-semibold text-slate-800">{property.listing_type}</span></p>
                                    <p className="text-xs text-slate-500 mt-1">Floor Area: <span className="font-semibold text-slate-800">{property.floor_area ? `${property.floor_area} Sqft` : 'N/A'}</span></p>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900 mb-2">Metrics & Engagement</h4>
                                    <p className="text-xs text-slate-500">All-Time Views: <span className="font-bold text-[#004F31]">{property.views_count || 0} hits</span></p>
                                    <p className="text-xs text-slate-500 mt-1">Leads Generated: <span className="font-semibold text-slate-800">{property.leads_count || 0} contacts</span></p>
                                    <p className="text-xs text-slate-500 mt-1">Current Active Plan: <span className="font-bold text-[#7c3aed] uppercase">{property.package_tier || 'Free'}</span></p>
                                  </div>
                                  <div className="flex flex-col justify-between">
                                    <div>
                                      <h4 className="font-bold text-slate-900 mb-2">Quick Sharing</h4>
                                      <button 
                                        onClick={() => {
                                          const slug = property.listing_title ? slugify(property.listing_title) : 'property';
                                          const url = `${window.location.origin}/property/${property.id}/${slug}`;
                                          navigator.clipboard.writeText(url);
                                          toast.success('Public listing URL copied!');
                                        }}
                                        className="text-xs bg-[#004F31] text-white px-3 py-1.5 rounded hover:bg-[#006040] transition-colors font-bold"
                                      >
                                        Copy Sharing Link
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-24 text-center">
                    <span className="text-4xl">📭</span>
                    <h3 className="text-lg font-bold text-slate-800 mt-2">No properties found</h3>
                    <p className="text-sm text-slate-400 mt-1">Try adjusting your search filters or clear them to start over.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination */}
        {totalPages > 1 && (
          <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#6b7280]">
            <div>
              Page {currentPage} of {totalPages} — Showing {paginatedListings.length} of {totalItems} properties
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                ◀ Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-lg font-bold transition-all text-xs border ${
                    currentPage === i + 1 ? 'bg-[#004F31] text-white border-[#004F31]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {deleteModal.isOpen && deleteModal.property && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModal({ isOpen: false, property: null })} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg p-6 max-w-md w-full relative z-10 border border-slate-200 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">⚠️ Delete Property?</h3>
              <p className="text-sm text-slate-500 mt-2">Are you sure you want to permanently delete "{deleteModal.property.listing_title}"?</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteModal({ isOpen: false, property: null })} className="flex-1 py-2 border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={() => deleteProperty(deleteModal.property!.id)} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">Delete Permanently</button>
              </div>
            </motion.div>
          </div>
        )}

        {statusModal.isOpen && statusModal.property && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setStatusModal({ isOpen: false, property: null })} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg p-6 max-w-md w-full relative z-10 border border-slate-200 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900">Toggle Status?</h3>
              <p className="text-sm text-slate-500 mt-2">Are you sure you want to toggle visibility for "{statusModal.property.listing_title}"?</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStatusModal({ isOpen: false, property: null })} className="flex-1 py-2 border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={() => toggleStatus(statusModal.property!.id, statusModal.property!.status)} className="flex-1 py-2 bg-[#004F31] hover:bg-[#006040] text-white rounded-lg font-semibold">Yes, Toggle</button>
              </div>
            </motion.div>
          </div>
        )}

        {promoteModal.isOpen && promoteModal.property && (
          <AutoPromoteModal
            isOpen={promoteModal.isOpen}
            onClose={() => setPromoteModal({ isOpen: false, property: null })}
            property={promoteModal.property as any}
            onPromoted={(platforms) => {
              if (promoteModal.property) {
                setPromotedData(prev => ({
                  ...prev,
                  [promoteModal.property!.id]: {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    platforms
                  }
                }));
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
