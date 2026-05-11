import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, ChevronDown, Filter, X, 
  CheckCircle, Star, Bed, Bath, Box, 
  Trees, Phone, Send, DollarSign, ArrowRight,
  ChevronLeft, ChevronRight, Share2, Printer,
  Heart, Shield, ExternalLink, Calculator,
  Home, Building2, Building, Hotel, Briefcase,
  LandPlot
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { PropertyCard } from '../App';

interface CategoryPageProps {
  category: string; // 'House', 'Land', 'Apartment', 'Building', 'Hotel', 'Commercial'
  mode: 'buy' | 'rent';
  onBack: () => void;
  onPropertyClick: (property: any) => void;
  favorites: Set<number>;
  toggleFavorite: (id: number) => void;
  compareList: number[];
  toggleCompare: (id: number) => void;
  isAdmin: boolean;
  onPostAd: () => void;
  onNavigateHome: () => void;
  onNavigate: (view: any) => void;
  onGetStarted: (pkg: string) => void;
}

const DISTRICTS = [
  "All Districts", "Colombo", "Kandy", "Galle", "Ampara", "Anuradhapura", "Badulla", 
  "Batticaloa", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kegalle", 
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Moneragala", 
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", 
  "Trincomalee", "Vavuniya"
];

const AMENITIES = [
  "Garden", "Swimming Pool", "Parking", "Security", "Gym", "Air Conditioning", "Generator"
];

import { Navbar } from './home/Navbar';

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  mode,
  onBack,
  onPropertyClick,
  favorites,
  toggleFavorite,
  compareList,
  toggleCompare,
  isAdmin,
  onPostAd,
  onNavigateHome,
  onNavigate,
  onGetStarted
}) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    district: 'All Districts',
    minPrice: '',
    maxPrice: '',
    minBeds: 'All',
    landSize: 'Any Size',
    amenities: [] as string[],
    houseTypes: [] as string[],
    sortBy: 'Newest First'
  });

  const getPageTitle = () => {
    const action = mode === 'buy' ? 'for Sale' : 'for Rent';
    switch (category) {
      case 'House': return `Houses ${action} in Sri Lanka`;
      case 'Land': return `Land ${action} in Sri Lanka`;
      case 'Apartment': return `Apartments ${action}`;
      case 'Building': return `Buildings ${action}`;
      case 'Hotel': return `Hotels & Resorts ${action}`;
      case 'Commercial': return `Commercial Properties ${action}`;
      default: return `${category} Properties ${action}`;
    }
  };

  const getHeroSubtitle = () => {
    switch (category) {
      case 'House': return "Find Your Dream Luxury Home";
      case 'Land': return "Find Your Perfect Land in Sri Lanka";
      case 'Apartment': return "Find Your Ideal Apartment";
      case 'Building': return "Find Commercial Buildings";
      case 'Hotel': return "Find Hotels & Resorts";
      case 'Commercial': return "Find Commercial Properties";
      default: return "Find Your Perfect Property";
    }
  };

  const getHeroImage = () => {
    switch (category) {
      case 'House': return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000";
      case 'Land': return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000";
      case 'Apartment': return "https://images.unsplash.com/photo-1545324418-f1d3ac1ef000?auto=format&fit=crop&q=80&w=2000";
      default: return "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=2000";
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('status', 'active');
    
    // Normalizing category search
    if (category === 'Commercial') {
       query = query.in('property_category', ['Commercial', 'Business']);
    } else {
       query = query.eq('property_category', category);
    }
    
    // Filter by type (Sale vs Rent)
    if (mode === 'buy') {
       query = query.or('listing_type.eq.Sale,listing_type.eq.for sale');
    } else {
       query = query.or('listing_type.eq.Rent,listing_type.eq.for rent');
    }

    if (filters.district !== 'All Districts') {
      query = query.eq('district', filters.district);
    }

    if (filters.minPrice) {
      query = query.gte('price_lkr', parseInt(filters.minPrice));
    }

    if (filters.maxPrice) {
      query = query.lte('price_lkr', parseInt(filters.maxPrice));
    }

    if (filters.minBeds !== 'All') {
      const beds = parseInt(filters.minBeds.replace('+', ''));
      query = query.gte('rooms', beds);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'Price: Low to High': query = query.order('price_lkr', { ascending: true }); break;
      case 'Price: High to Low': query = query.order('price_lkr', { ascending: false }); break;
      case 'Most Viewed': query = query.order('views_count', { ascending: false }); break;
      case 'Bedrooms': query = query.order('rooms', { ascending: false }); break;
      default: query = query.order('created_at', { ascending: false });
    }

    const start = (page - 1) * 8;
    const end = start + 7;
    query = query.range(start, end);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
    } else {
      setProperties(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, [category, mode, filters, page]);

  const clearFilters = () => {
    setFilters({
      district: 'All Districts',
      minPrice: '',
      maxPrice: '',
      minBeds: 'All',
      landSize: 'Any Size',
      amenities: [],
      houseTypes: [],
      sortBy: 'Newest First'
    });
    setPage(1);
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleHouseType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      houseTypes: prev.houseTypes.includes(type)
        ? prev.houseTypes.filter(t => t !== type)
        : [...prev.houseTypes, type]
    }));
  };

  return (
    <div className="bg-[#F8FAF8] min-h-screen pb-20">
      <Navbar 
        onPostAd={onPostAd} 
        onNavigateHome={onNavigateHome} 
        onAdminAccess={() => {}}
        onNavigate={onNavigate}
        currentView="category"
      />

      {/* Category Hero Section */}
      <section className="relative h-[400px] w-full flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={getHeroImage()} 
            alt={category} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-[10px] md:text-sm font-black text-brand-green uppercase tracking-widest mb-4">
            <span onClick={onNavigateHome} className="cursor-pointer hover:underline">HOME</span>
            <span className="text-white/40">/</span>
            <span>{category.toUpperCase()}S</span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight"
          >
            {getHeroSubtitle()}
          </motion.h1>

          <div className="mt-8 max-w-4xl bg-white rounded-full shadow-2xl p-2 flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center px-6 gap-3 min-w-0">
              <Search size={20} className="text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Location, Neighborhood or Project..."
                className="w-full py-3 bg-transparent text-sm focus:outline-none font-medium truncate"
              />
            </div>
            <div className="h-8 w-px bg-gray-100 hidden md:block" />
            <div className="flex items-center px-6 gap-3 cursor-pointer group">
               <DollarSign size={20} className="text-gray-400 group-hover:text-brand-green" />
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase leading-none">Price Range</span>
                  <span className="text-xs font-bold text-dark-navy">Any Price</span>
               </div>
               <ChevronDown size={16} className="text-gray-400 ml-2" />
            </div>
            <button className="w-full md:w-auto px-10 h-[52px] bg-brand-green hover:bg-brand-green-dark text-white font-black uppercase tracking-widest text-xs rounded-full transition-all shadow-xl shadow-brand-green/20">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Filters */}
          <motion.aside 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/4 space-y-8"
          >
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-dark-navy flex items-center gap-2">
                  <Filter size={18} className="text-brand-green" /> Filters
                </h3>
                <button 
                  onClick={clearFilters}
                  className="text-[10px] font-black text-brand-red uppercase hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* HOUSE TYPE Section */}
              {category === 'House' && (
                <div className="mb-8">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">House Type</h4>
                  <div className="space-y-3">
                    {['Luxury Villa', 'Modern House', 'Colonial Style'].map(type => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <div 
                          onClick={() => toggleHouseType(type)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${filters.houseTypes.includes(type) ? 'bg-brand-green border-brand-green' : 'border-gray-200 group-hover:border-brand-green'}`}
                        >
                          {filters.houseTypes.includes(type) && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <span className="text-xs font-bold text-gray-600">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {category === 'Land' && (
                <div className="mb-8">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Land Type</h4>
                  <div className="space-y-3">
                    {['Residential Land', 'Commercial Land', 'Agricultural Land', 'Industrial Land'].map(type => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded border-2 border-gray-200 flex items-center justify-center transition-all group-hover:border-brand-green">
                           <input type="checkbox" className="hidden" />
                        </div>
                        <span className="text-xs font-bold text-gray-600">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* AMENITIES */}
              <div className="mb-8">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Must Have Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all border ${
                        filters.amenities.includes(amenity)
                        ? 'bg-brand-green border-brand-green text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-brand-green'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* BEDROOMS */}
              <div className="mb-8">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Bedrooms</h4>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {['All', '2+', '3+', '4+'].map(val => (
                    <button
                      key={val}
                      onClick={() => setFilters(f => ({ ...f, minBeds: val }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                        filters.minBeds === val ? 'bg-white text-brand-green shadow-sm' : 'text-gray-400'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRICE RANGE */}
              <div className="mb-8">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Price Range</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <select 
                      value={filters.minPrice}
                      onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                      className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs font-bold outline-none appearance-none"
                    >
                      <option value="">Min LKR</option>
                      <option value="1000000">1M</option>
                      <option value="5000000">5M</option>
                      <option value="10000000">10M</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select 
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                      className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs font-bold outline-none appearance-none"
                    >
                      <option value="">Max LKR</option>
                      <option value="20000000">20M</option>
                      <option value="50000000">50M</option>
                      <option value="100000000">100M+</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* DISTRICT */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">District</h4>
                <div className="relative">
                  <select 
                    value={filters.district}
                    onChange={(e) => setFilters(f => ({ ...f, district: e.target.value }))}
                    className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs font-bold outline-none appearance-none cursor-pointer"
                  >
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Right Content - Results */}
          <main className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <div className="text-xs font-black text-brand-green uppercase tracking-[4px] mb-1">
                  SHOWING {totalCount.toLocaleString()} RESULTS
                </div>
                <h2 className="text-2xl font-black text-dark-navy">{getPageTitle()}</h2>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-[10px] font-black text-gray-400 uppercase shrink-0">Sort By</span>
                <div className="relative flex-1 md:flex-none">
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                    className="w-full md:w-48 bg-white px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold outline-none appearance-none cursor-pointer"
                  >
                    <option>Newest First</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Most Viewed</option>
                    <option>Bedrooms</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence>
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      <div className="h-56 bg-gray-200 animate-pulse" />
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-200 animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-200 animate-pulse w-1/2" />
                        <div className="pt-4 border-t border-gray-50 flex gap-4">
                          <div className="h-4 bg-gray-200 animate-pulse w-12" />
                          <div className="h-4 bg-gray-200 animate-pulse w-12" />
                          <div className="h-4 bg-gray-200 animate-pulse w-12" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  properties.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      <PropertyCard 
                        property={p} 
                        onClick={() => onPropertyClick(p)}
                        isFavorited={favorites.has(p.id)}
                        onToggleFavorite={() => toggleFavorite(p.id)}
                        isComparing={compareList.includes(p.id)}
                        onToggleCompare={() => toggleCompare(p.id)}
                        isAdmin={isAdmin}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {properties.length === 0 && !loading && (
              <div className="py-20 text-center">
                <Search size={48} className="text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-500">No properties found</h3>
                <p className="text-gray-400 mt-2">Try adjusting your filters or use different keywords.</p>
                <button 
                  onClick={clearFilters}
                  className="mt-6 px-8 py-3 bg-brand-green text-white font-black uppercase tracking-widest text-xs rounded-full"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalCount > 8 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:border-brand-green hover:text-brand-green transition-all disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                {[...Array(Math.min(5, Math.ceil(totalCount / 8)))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-xs font-black transition-all ${
                      page === i + 1 
                      ? 'bg-brand-green text-white shadow-lg' 
                      : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {Math.ceil(totalCount / 8) > 5 && <span className="text-gray-400 px-2">...</span>}
                {Math.ceil(totalCount / 8) > 5 && (
                   <button 
                    onClick={() => setPage(Math.ceil(totalCount / 8))}
                    className={`w-10 h-10 rounded-lg text-xs font-black transition-all border border-gray-200 text-gray-500 hover:bg-gray-50 ${page === Math.ceil(totalCount/8) ? 'bg-brand-green text-white shadow-lg' : ''}`}
                   >
                     {Math.ceil(totalCount/8)}
                   </button>
                )}
                <button 
                  disabled={page * 8 >= totalCount}
                  onClick={() => setPage(p => p + 1)}
                  className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:border-brand-green hover:text-brand-green transition-all disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* CTA Banner */}
      <section className="container mx-auto px-6 mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-brand-green to-brand-green-dark p-8 md:p-12 rounded-[32px] shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-32 -mb-32 blur-2xl" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="max-w-2xl text-center md:text-left">
              <h3 className="text-2xl md:text-4xl font-black text-white mb-4">Want to sell your house fast?</h3>
              <p className="text-white/80 text-sm md:text-lg font-medium leading-relaxed">
                Reach over 500,000 monthly visitors and get the best market value for your property today.
              </p>
            </div>
            <button 
              onClick={onPostAd}
              className="px-10 py-5 bg-white text-brand-green font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Post Your Ad for Free
            </button>
          </div>
          
          {/* Subtle house illustration floating */}
          <div className="absolute right-12 bottom-0 opacity-10 pointer-events-none hidden lg:block">
            <Home size={280} strokeWidth={0.5} className="text-white" />
          </div>
        </motion.div>
      </section>

      {/* Footer Section */}
      <footer className="bg-white pt-20 mt-20 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <span className="text-2xl font-black text-brand-green">LankaProperty.lk</span>
              <p className="text-gray-500 text-sm leading-relaxed">
                Sri Lanka's most trusted real estate marketplace since 2012. We connect property buyers and sellers with transparency.
              </p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Company</h4>
              <ul className="space-y-4">
                {['About Us', 'Contact Us', 'Careers'].map(item => (
                  <li key={item} className="text-sm font-bold text-gray-600 hover:text-brand-green cursor-pointer transition-colors">{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Resources</h4>
              <ul className="space-y-4">
                {['Help Center', 'Terms of Service', 'Privacy Policy'].map(item => (
                  <li key={item} className="text-sm font-bold text-gray-600 hover:text-brand-green cursor-pointer transition-colors">{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Mobile App</h4>
              <div className="space-y-3">
                <button className="w-full bg-dark-navy text-white flex items-center justify-center gap-3 py-3 rounded-xl hover:opacity-90 transition-opacity">
                  <div className="bg-white/10 p-1.5 rounded-lg"><Box size={14} /></div>
                  <div className="text-left">
                    <p className="text-[8px] uppercase font-medium leading-none mb-1">Get it on</p>
                    <p className="text-xs font-bold leading-none">Google Play</p>
                  </div>
                </button>
                <button className="w-full bg-dark-navy text-white flex items-center justify-center gap-3 py-3 rounded-xl hover:opacity-90 transition-opacity">
                  <div className="bg-white/10 p-1.5 rounded-lg"><X size={14} /></div>
                  <div className="text-left">
                    <p className="text-[8px] uppercase font-medium leading-none mb-1">Download on</p>
                    <p className="text-xs font-bold leading-none">App Store</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="py-8 border-t border-gray-100 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              © 2024 LankaProperty.lk - Sri Lanka's #1 Real Estate Marketplace
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
