import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, ChevronDown, Filter, X, 
  CheckCircle, Star, Bed, Bath, Box, 
  Trees, Phone, Send, DollarSign, ArrowRight,
  ChevronLeft, ChevronRight, Share2, Printer,
  Heart, Shield, ExternalLink, Calculator,
  Home, Building2, Building, Hotel, Briefcase,
  LandPlot, TrendingUp
} from 'lucide-react';
import { supabase } from '../supabaseClient';

import { safeQuery } from '../utils/supabaseQuery';

interface CategoryPageProps {
  category: string; 
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
}

const USD_RATE = 300;

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

const PROPERTY_TYPES_MAP: Record<string, string[]> = {
  'House': ['Luxury Villa', 'Modern House', 'Colonial Style', 'Bungalow', 'Town House'],
  'Land': ['Residential Land', 'Commercial Land', 'Agricultural Land', 'Industrial Land'],
  'Apartment': ['Studio', 'Penthouse', 'Standard Apartment', 'Luxury Apartment'],
  'Building': ['OFFICE', 'RETAIL', 'WAREHOUSE']
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
    <div className="h-56 bg-gray-100 animate-shimmer" />
    <div className="p-6 space-y-4">
      <div className="h-4 bg-gray-100 animate-shimmer w-1/4 rounded" />
      <div className="h-6 bg-gray-100 animate-shimmer w-3/4 rounded" />
      <div className="h-4 bg-gray-100 animate-shimmer w-1/2 rounded" />
      <div className="pt-4 border-t border-gray-50 flex gap-4">
        <div className="h-4 bg-gray-100 animate-shimmer w-12 rounded" />
        <div className="h-4 bg-gray-100 animate-shimmer w-12 rounded" />
        <div className="h-4 bg-gray-100 animate-shimmer w-12 rounded" />
      </div>
    </div>
  </div>
);

const PropertyCard = React.memo(({ p, idx, onPropertyClick, favorites, toggleFavorite }: { 
  p: any, idx: number, onPropertyClick: (p: any) => void, favorites: Set<number>, toggleFavorite: (id: number) => void 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="group"
    >
      <div 
        onClick={() => onPropertyClick(p)}
        className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
      >
        <div className="relative h-64 overflow-hidden">
          <img 
            src={p.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=600'} 
            alt={p.listing_title || p.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
              p.listing_type === 'For Sale' ? 'bg-brand-red text-white' : 'bg-brand-gold text-dark-navy'
            }`}>
              {p.listing_type?.toUpperCase()}
            </span>
            {p.is_trending && (
              <span className="px-4 py-1.5 bg-brand-green text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                <TrendingUp size={12} /> TRENDING
              </span>
            )}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
            className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all ${
              favorites.has(p.id) ? 'bg-brand-red text-white' : 'bg-white/90 text-dark-navy hover:bg-white'
            }`}
          >
            <Heart size={18} fill={favorites.has(p.id) ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-2 text-brand-green text-[10px] font-black uppercase tracking-widest mb-3">
            <MapPin size={12} /> {p.district}
          </div>
          <h3 className="text-xl font-black text-dark-navy mb-2 line-clamp-1 group-hover:text-brand-green transition-colors">{p.listing_title || p.title || 'Property Listing'}</h3>
          
          <div className="mb-6">
            <div className="text-2xl font-black text-brand-green leading-none">
              Rs. {p.price_lkr ? (p.price_lkr / 1000000).toFixed(1) : '0'}M
            </div>
            <div className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
              Approx. ${p.price_lkr ? (p.price_lkr / USD_RATE / 1000).toFixed(1) : '0'}K USD
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Bed size={16} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-600">{p.rooms || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath size={16} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-600">{p.bathrooms || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Box size={16} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-600">{(p.land_area || p.land_size || '0') + 'p'}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-brand-green group-hover:text-white transition-all">
               <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  mode,
  onPropertyClick,
  favorites,
  toggleFavorite,
  onPostAd,
  onNavigateHome,
  onNavigate
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
    propertySubTypes: [] as string[],
    sortBy: 'Newest First'
  });

  const getPageTitle = () => {
    const action = mode === 'buy' ? 'for Sale' : 'for Rent';
    switch (category) {
      case 'House': return `Houses ${action} in Sri Lanka`;
      case 'Land': return `Land ${action} in Sri Lanka`;
      case 'Apartment': return `Apartments ${action} in Sri Lanka`;
      default: return `${category} Properties ${action} in Sri Lanka`;
    }
  };

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    
    const start = (page - 1) * 8;
    const end = start + 7;

    const { data, count } = await safeQuery(() => {
      let query = supabase
        .from('properties')
        .select(`
          id,
          listing_title,
          listing_type,
          property_category,
          district,
          city,
          price_lkr,
          usd_estimate,
          rooms,
          bathrooms,
          land_area,
          floor_area,
          images,
          status,
          created_at,
          is_trending,
          views_count
        `, { count: 'exact' })
        .eq('status', 'active');
      
      // Normalizing category search
      if (category === 'Commercial') {
         query = query.in('property_category', ['Commercial', 'Business']);
      } else {
         query = query.eq('property_category', category);
      }
      
      // Filter by type (Sale vs Rent)
      const listingType = mode === 'buy' ? 'For Sale' : 'For Rent';
      query = query.eq('listing_type', listingType);

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
        const bedsVal = String(filters.minBeds || '').replace('+', '');
        const beds = parseInt(bedsVal);
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

      return query.range(start, end);
    });

    setProperties(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [category, mode, filters, page]);

  useEffect(() => {
    fetchProperties();
  }, [page, category, mode, filters, fetchProperties]);

  const clearFilters = () => {
    setFilters({
      district: 'All Districts',
      minPrice: '',
      maxPrice: '',
      minBeds: 'All',
      landSize: 'Any Size',
      amenities: [],
      propertySubTypes: [],
      sortBy: 'Newest First'
    });
    setPage(1);
  };

  const toggleSubtype = (type: string) => {
    setFilters(prev => ({
      ...prev,
      propertySubTypes: prev.propertySubTypes.includes(type)
        ? prev.propertySubTypes.filter(t => t !== type)
        : [...prev.propertySubTypes, type]
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <div className="bg-[#F8FAF8] min-h-screen pb-20">
      {/* Category Hero Section */}
      <section className="relative h-[300px] w-full flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200" 
            alt={category} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-brand-green uppercase tracking-widest mb-4">
            <span onClick={onNavigateHome} className="cursor-pointer hover:underline">HOME</span>
            <span className="text-white/40">/</span>
            <span>{category.toUpperCase()}S</span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight"
          >
            {category}s for {mode === 'buy' ? 'Sale' : 'Rent'}
          </motion.h1>
          <p className="text-white/60 text-lg font-medium">Find your perfect {category.toLowerCase()} in Sri Lanka</p>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Filters */}
          <aside className="lg:w-1/4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
              <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
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

              {/* PROPERTY TYPE checkboxes */}
              <div className="mb-8">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Property Type</h4>
                <div className="space-y-4">
                  {(PROPERTY_TYPES_MAP[category] || []).map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => toggleSubtype(type)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          filters.propertySubTypes.includes(type) ? 'bg-brand-green border-brand-green shadow-lg shadow-brand-green/20' : 'border-gray-200 group-hover:border-brand-green'
                        }`}
                      >
                        {filters.propertySubTypes.includes(type) && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-bold text-gray-600 group-hover:text-dark-navy transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* AMENITIES */}
              <div className="mb-8">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                        filters.amenities.includes(amenity)
                        ? 'bg-brand-green border-brand-green text-white shadow-lg shadow-brand-green/20'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-brand-green hover:bg-gray-50'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* BEDROOMS */}
              {category !== 'Land' && (
                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Bedrooms</h4>
                  <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1">
                    {['All', '1+', '2+', '3+', '4+'].map(val => (
                      <button
                        key={val}
                        onClick={() => setFilters(f => ({ ...f, minBeds: val }))}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${
                          filters.minBeds === val ? 'bg-white text-brand-green shadow-md' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PRICE RANGE */}
              <div className="mb-8">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Price Range</h4>
                <div className="space-y-3">
                  <div className="relative">
                    <select 
                      value={filters.minPrice}
                      onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                      className="w-full bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs font-bold outline-none appearance-none pr-10"
                    >
                      <option value="">Rs. 0</option>
                      <option value="1000000">1M</option>
                      <option value="5000000">5M</option>
                      <option value="10000000">10M</option>
                      <option value="50000000">50M</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select 
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                      className="w-full bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs font-bold outline-none appearance-none pr-10"
                    >
                      <option value="">No Max</option>
                      <option value="10000000">10M</option>
                      <option value="50000000">50M</option>
                      <option value="100000000">100M</option>
                      <option value="500000000">500M+</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* DISTRICT */}
              <div className="mb-8">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">District</h4>
                <div className="relative">
                  <select 
                    value={filters.district}
                    onChange={(e) => setFilters(f => ({ ...f, district: e.target.value }))}
                    className="w-full bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs font-bold outline-none appearance-none pr-10 cursor-pointer"
                  >
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* LAND SIZE */}
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Land Size</h4>
                <div className="relative">
                  <select 
                    value={filters.landSize}
                    onChange={(e) => setFilters(f => ({ ...f, landSize: e.target.value }))}
                    className="w-full bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs font-bold outline-none appearance-none pr-10 cursor-pointer"
                  >
                    <option value="Any Size">Any Size</option>
                    <option value="10">10 Perches+</option>
                    <option value="20">20 Perches+</option>
                    <option value="40">40 Perches+</option>
                    <option value="160">1 Acre+</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content - Results */}
          <main className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 bg-white p-6 rounded-3xl border border-gray-50 shadow-sm">
              <div>
                <div className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] mb-1">
                  SHOWING {totalCount.toLocaleString()} RESULTS
                </div>
                <h2 className="text-xl font-black text-dark-navy tracking-tight">{getPageTitle()}</h2>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Sort By</span>
                <div className="relative flex-1 md:flex-none">
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                    className="w-full md:w-48 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100 text-xs font-bold outline-none appearance-none cursor-pointer pr-10"
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
              {loading ? (
                Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
              ) : properties.length === 0 ? (
                <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Home size={40} className="text-gray-200" />
                  </div>
                  <h3 className="text-2xl font-black text-dark-navy mb-2">No properties found</h3>
                  <p className="max-w-md mx-auto text-gray-400 font-medium mb-8 px-6">
                    We couldn't find any properties matching your current filters. Try relaxing your criteria or use a different location.
                  </p>
                  <button 
                    onClick={clearFilters}
                    className="px-10 py-4 bg-brand-green text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-green/20 hover:scale-105 transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                properties.map((p, idx) => (
                  <PropertyCard 
                    key={p.id} 
                    p={p} 
                    idx={idx} 
                    onPropertyClick={onPropertyClick} 
                    favorites={favorites} 
                    toggleFavorite={toggleFavorite} 
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {!loading && totalCount > 8 && (
              <div className="mt-20 flex justify-center items-center gap-3">
                <button 
                  disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className="w-12 h-12 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-500 hover:border-brand-green hover:text-brand-green transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {[...Array(Math.ceil(totalCount / 8))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setPage(i + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                    className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${
                      page === i + 1 
                      ? 'bg-brand-green text-white shadow-xl shadow-brand-green/20 scale-110' 
                      : 'bg-white border border-gray-100 text-gray-500 hover:border-brand-green hover:text-brand-green'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  disabled={page * 8 >= totalCount}
                  onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className="w-12 h-12 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-500 hover:border-brand-green hover:text-brand-green transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none"
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
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-brand-green to-dark-navy p-10 md:p-16 rounded-[48px] shadow-3xl text-center relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green/20 rounded-full -ml-32 -mb-32 blur-2xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-6">Want to sell your property fast?</h3>
            <p className="text-white/70 text-lg font-medium mb-10 leading-relaxed">
              Reach over 500,000+ monthly visitors and connect with verified buyers instantly.
            </p>
            <button 
              onClick={onPostAd}
              className="px-12 py-5 bg-white text-dark-navy font-black uppercase tracking-widest text-sm rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Post Your Ad for Free
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer is already handled in App.tsx or we keep it simple here */}
    </div>
  );
};
