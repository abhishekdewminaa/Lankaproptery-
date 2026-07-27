import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import LatestAdvertisements from './LatestAdvertisements';
import { 
  Search, MapPin, ChevronDown, Filter, X, 
  CheckCircle, Star, Bed, Bath, Box, 
  Trees, Phone, Send, DollarSign, ArrowRight,
  ChevronLeft, ChevronRight, Share2, Printer,
  Heart, Shield, ExternalLink, Calculator,
  Home, Building2, Building, Hotel, Briefcase,
  LandPlot, TrendingUp, List, Grid
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { DISTRICTS_BY_PROVINCE } from '../constants/districts';
import { PropertyCountdown } from './PropertyCountdown';

import { safeQuery } from '../utils/supabaseQuery';

const getPropertyImage = (images: any, index = 0) => {
  if (!images) return '/placeholder-property.jpg'
  
  if (Array.isArray(images)) {
    return images[index] || 
           images[0] || 
           '/placeholder-property.jpg'
  }
  
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) {
        return parsed[index] || 
               parsed[0] || 
               '/placeholder-property.jpg'
      }
      return images
    } catch {
      return images
    }
  }
  
  return '/placeholder-property.jpg'
}

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

import { USD_RATE } from '../utils/safeUtils';

const AMENITIES = [
  "Garden", "Swimming Pool", "Parking", "Security", "Gym", "Air Conditioning", "Generator"
];

const PROPERTY_TYPES_MAP: Record<string, string[]> = {
  'House': ['Luxury Villa', 'Modern House', 'Colonial Style', 'Bungalow', 'Town House'],
  'Land': ['Residential Land', 'Commercial Land', 'Agricultural Land', 'Industrial Land'],
  'Apartment': ['Studio', 'Penthouse', 'Standard Apartment', 'Luxury Apartment'],
  'Building': ['OFFICE', 'RETAIL', 'WAREHOUSE'],
  'Hotel': ['Guest House', 'Boutique Hotel', 'Resort', 'Hotel Building', 'Villa Resort'],
  'Commercial': ['Office Space', 'Retail Shop', 'Warehouse', 'Showroom', 'Factory']
};

const SkeletonCard = ({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) => (
  <div className={`bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 ${viewMode === 'list' ? 'flex flex-row h-32 md:h-48' : 'h-full'}`}>
    <div className={`bg-gray-100 animate-shimmer ${viewMode === 'list' ? 'w-[120px] md:w-64 h-full shrink-0' : 'h-56'}`} />
    <div className="p-4 md:p-6 space-y-4 flex-1">
      <div className="h-4 bg-gray-100 animate-shimmer w-1/4 rounded" />
      <div className="h-6 bg-gray-100 animate-shimmer w-3/4 rounded" />
      <div className="h-4 bg-gray-100 animate-shimmer w-1/2 rounded" />
      <div className="pt-4 border-t border-gray-50 flex gap-4">
        <div className="h-4 bg-gray-100 animate-shimmer w-8 md:w-12 rounded" />
        <div className="h-4 bg-gray-100 animate-shimmer w-8 md:w-12 rounded" />
      </div>
    </div>
  </div>
);

const PropertyCard = React.memo(({ p, idx, onPropertyClick, favorites, toggleFavorite, viewMode = 'grid' }: { 
  p: any, idx: number, onPropertyClick: (p: any) => void, favorites: Set<number>, toggleFavorite: (id: number) => void, viewMode?: 'grid' | 'list'
}) => {
  const isFeatured = !!(p.is_featured || p.isFeatured || p.package_tier === 'Elite Pro' || p.package_tier === 'Premium Pro');

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(idx * 0.05, 0.5) }}
        className="group w-full"
      >
        <div 
          onClick={() => onPropertyClick(p)}
          className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-row h-[140px] md:h-[220px]"
        >
          <div className="relative w-[120px] md:w-[280px] h-full shrink-0 overflow-hidden">
            <img onError={(e) => { e.currentTarget.src = '/placeholder-property.jpg'; }} 
              src={getPropertyImage(p.images)} 
              alt={p.listing_title || p.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {p.is_trending && (
               <span className="absolute top-2 left-2 md:top-4 md:left-4 px-2 py-1 md:px-3 md:py-1.5 bg-brand-green text-white rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg z-10 scale-90 md:scale-100 origin-top-left">
                  <TrendingUp size={10} className="md:w-3 md:h-3" /> <span className="hidden md:inline">TRENDING</span>
               </span>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
              className={`absolute top-2 right-2 md:top-4 md:right-4 p-2 md:p-3 rounded-full shadow-lg transition-all z-10 ${
                favorites.has(p.id) ? 'bg-brand-red text-white' : 'bg-white/90 text-dark-navy hover:bg-white'
              }`}
            >
              <Heart size={14} className="md:w-[18px] md:h-[18px]" fill={favorites.has(p.id) ? "currentColor" : "none"} />
            </button>
            {isFeatured && p.id && (
              <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 z-10 scale-90 md:scale-100 origin-bottom-left">
                <PropertyCountdown id={p.id} compact />
              </div>
            )}
          </div>

          <div className="p-3 md:p-6 flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-brand-green text-[9px] md:text-[11px] font-black uppercase tracking-wider mb-1 md:mb-2 line-clamp-1">
              <MapPin size={10} className="md:w-3 md:h-3 shrink-0" /> <span className="truncate">{p.district}</span>
            </div>
            <h3 className="text-sm md:text-xl font-bold md:font-black text-gray-900 mb-1 md:mb-2 line-clamp-2 md:line-clamp-1 group-hover:text-brand-green transition-colors leading-tight">
              {p.listing_title || p.title || 'Property Listing'}
            </h3>
            
            <div className="mb-auto">
              <div className="text-base md:text-2xl font-black text-brand-green leading-none">
                Rs. {p.price_lkr ? (p.price_lkr / 1000000).toFixed(1) : '0'}M
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 pt-2 md:pt-4 border-t border-gray-50 flex-wrap">
              <div className="flex items-center gap-1 md:gap-1.5">
                <Bed size={12} className="md:w-4 md:h-4 text-gray-400" />
                <span className="text-[10px] md:text-xs font-bold text-gray-600">{p.rooms || 0}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5">
                <Bath size={12} className="md:w-4 md:h-4 text-gray-400" />
                <span className="text-[10px] md:text-xs font-bold text-gray-600">{p.bathrooms || 0}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5 hidden sm:flex">
                <Box size={12} className="md:w-4 md:h-4 text-gray-400" />
                <span className="text-[10px] md:text-xs font-bold text-gray-600">{(p.land_area || p.land_size || '0') + 'p'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.05, 0.5) }}
      className="group h-full"
    >
      <div 
        onClick={() => onPropertyClick(p)}
        className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 md:duration-500 cursor-pointer flex flex-col h-full"
      >
        <div className="relative h-48 md:h-64 overflow-hidden shrink-0">
          <img onError={(e) => { e.currentTarget.src = '/placeholder-property.jpg'; }} 
            src={getPropertyImage(p.images)} 
            alt={p.listing_title || p.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500 md:duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-1.5 md:gap-2">
            <span className={`px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg ${
              (p.listing_type || '').toLowerCase().includes('sale') 
                ? 'bg-[#CC1414] text-white' 
                : (p.listing_type || '').toLowerCase().includes('rent')
                  ? 'bg-[#1565C0] text-white'
                  : 'bg-[#E8A000] text-[#111827]'
            }`}>
              {(p.listing_type || '').toLowerCase().includes('rent') ? 'rent' : 'sell'}
            </span>
            {p.is_trending && (
               <span className="px-2 py-1 md:px-4 md:py-1.5 bg-brand-green text-white rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                  <TrendingUp size={10} className="md:w-3 md:h-3" /> <span className="hidden md:inline">TRENDING</span>
               </span>
            )}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
            className={`absolute top-3 right-3 md:top-4 md:right-4 p-2 md:p-3 rounded-full shadow-lg transition-all z-10 ${
              favorites.has(p.id) ? 'bg-brand-red text-white' : 'bg-white/90 text-dark-navy hover:bg-white'
            }`}
          >
            <Heart size={14} className="md:w-[18px] md:h-[18px]" fill={favorites.has(p.id) ? "currentColor" : "none"} />
          </button>
          {isFeatured && p.id && (
            <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10">
              <PropertyCountdown id={p.id} />
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 lg:p-8 flex flex-col flex-1">
          <div className="flex items-center gap-1.5 text-brand-green text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1.5 md:mb-3">
            <MapPin size={10} className="md:w-3 md:h-3 shrink-0" /> <span className="truncate">{p.district}</span>
          </div>
          <h3 className="text-base md:text-xl font-bold md:font-black text-gray-900 mb-2 line-clamp-2 md:line-clamp-1 group-hover:text-brand-green transition-colors leading-tight">
            {p.listing_title || p.title || 'Property Listing'}
          </h3>
          
          <div className="mb-4 md:mb-6 mt-auto">
            <div className="text-lg md:text-2xl font-black text-brand-green leading-none">
              Rs. {p.price_lkr ? (p.price_lkr / 1000000).toFixed(1) : '0'}M
            </div>
            <div className="text-[9px] md:text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
              Approx. ${p.price_lkr ? (p.price_lkr / USD_RATE / 1000).toFixed(1) : '0'}K USD
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 md:pt-6 border-t border-gray-50">
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              <div className="flex items-center gap-1 md:gap-1.5">
                <Bed size={12} className="md:w-4 md:h-4 text-gray-400" />
                <span className="text-[10px] md:text-xs font-bold text-gray-600">{p.rooms || 0}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5">
                <Bath size={12} className="md:w-4 md:h-4 text-gray-400" />
                <span className="text-[10px] md:text-xs font-bold text-gray-600">{p.bathrooms || 0}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5 hidden sm:flex">
                <Box size={12} className="md:w-4 md:h-4 text-gray-400" />
                <span className="text-[10px] md:text-xs font-bold text-gray-600">{(p.land_area || p.land_size || '0') + 'p'}</span>
              </div>
            </div>
            <div className="hidden md:flex w-8 h-8 rounded-full bg-gray-50 items-center justify-center text-gray-300 group-hover:bg-brand-green group-hover:text-white transition-all">
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
          views_count,
          property_description
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

    let processedData = data || [];
    if (filters.propertySubTypes.length > 0) {
      processedData = processedData.filter(p => {
        const title = (p.listing_title || '').toLowerCase();
        const desc = (p.property_description || '').toLowerCase();
        return filters.propertySubTypes.some(type => {
          const t = type.toLowerCase();
          return title.includes(t) || desc.includes(t);
        });
      });
    }

    setProperties(processedData);
    setTotalCount(filters.propertySubTypes.length > 0 ? processedData.length : (count || 0));
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
          <img onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'; }} 
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
                    <option value="All Districts">All Districts</option>
                    {Object.entries(DISTRICTS_BY_PROVINCE).map(([province, districts]) => (
                      <optgroup key={province} label={province}>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </optgroup>
                    ))}
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
              
              <button 
                onClick={() => {
                  fetchProperties();
                  toast.success("Filters applied successfully!");
                }}
                className="listings-search-btn w-full mt-6 py-4 bg-brand-green hover:bg-emerald-800 text-white font-extrabold uppercase tracking-wider text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                🔍 Apply Search
              </button>
            </div>

            <LatestAdvertisements 
              category={category} 
              limit={6} 
              onPropertyClick={onPropertyClick}
              onNavigate={onNavigate}
              isSidebar={true}
            />
          </aside>

          {/* Right Content - Results */}
          <main className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 bg-white p-6 rounded-3xl border border-gray-50 shadow-sm">
              <div>
                <div className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] mb-1">
                  SHOWING <span className="results-count-num">{totalCount.toLocaleString()}</span> RESULTS
                </div>
                <h2 className="text-xl font-black text-dark-navy tracking-tight">{getPageTitle()}</h2>
                
                {/* Active Filter Pills list */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mr-1">Active:</span>
                  {mode === 'buy' ? (
                    <span className="filter-active-sale px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1">
                      🔴 For Sale
                    </span>
                  ) : mode === 'rent' ? (
                    <span className="filter-active-rent px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1">
                      🔵 For Rent
                    </span>
                  ) : (
                    <span className="filter-active-lease px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1">
                      🟡 For Lease
                    </span>
                  )}
                  {filters.propertySubTypes.length > 0 && (
                    <span className="filter-active-count px-2.5 py-0.5 text-[10px] font-black rounded-full flex items-center justify-center">
                      {filters.propertySubTypes.length} types
                    </span>
                  )}
                  {filters.amenities.length > 0 && (
                    <span className="filter-active-count px-2.5 py-0.5 text-[10px] font-black rounded-full flex items-center justify-center">
                      {filters.amenities.length} amenities
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Sort By</span>
                <div className="relative flex-1 md:flex-none">
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                    className="sort-select w-full md:w-48 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100 text-xs font-bold outline-none appearance-none cursor-pointer pr-10"
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
                  className="page-btn w-12 h-12 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-500 hover:border-brand-green hover:text-brand-green transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {[...Array(Math.ceil(totalCount / 8))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setPage(i + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                    className={`page-btn ${page === i + 1 ? 'active' : ''} w-12 h-12 rounded-2xl text-sm font-black transition-all ${
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
                  className="page-btn w-12 h-12 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-500 hover:border-brand-green hover:text-brand-green transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none"
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

export default CategoryPage;
