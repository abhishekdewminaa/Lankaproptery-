import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Search, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Activity, 
  FileText, 
  Compass, 
  Sparkles,
  Award,
  Grid,
  Filter,
  Layers,
  Trees,
  Waves,
  Mountain
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { removeSinhala } from '../../utils/safeUtils';

interface LandProperty {
  id: string | number;
  title: string;
  location: string;
  district: string;
  city: string;
  priceLkr: number; // per perch upwards
  category: 'Residential' | 'Commercial' | 'Agricultural' | 'Industrial' | 'Coconut Land' | 'Water Front Land' | 'Mountain View' | 'Other';
  image: string;
  isFeatured?: boolean;
  views?: number;
  size?: string;
  description?: string;
}

const DEFAULT_LAND_PROPERTIES: LandProperty[] = [
  {
    id: 'l-1',
    title: 'Green Radiant - Alawwa',
    location: 'Alawwa, Kurunegala',
    district: 'Kurunegala',
    city: 'Alawwa',
    priceLkr: 250000,
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    isFeatured: true,
    views: 1450,
    size: '10 - 15 Perches',
    description: 'Beautiful land plots in Alawwa town with all infrastructure. Gated community with modern facilities, tarred roads, and 24-hour security.'
  },
  {
    id: 'l-2',
    title: 'Prime Liora - Nachchaduwa',
    location: 'Nachchaduwa, Anuradhapura',
    district: 'Anuradhapura',
    city: 'Nachchaduwa',
    priceLkr: 97500,
    category: 'Agricultural',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800',
    isFeatured: true,
    views: 980,
    size: '20 - 40 Perches',
    description: 'Serene land located in beautiful historical Nachchaduwa area. Perfect for agriculture, holiday villas or a peaceful living space close to nature.'
  },
  {
    id: 'l-3',
    title: 'Aventra - Rajagiriya',
    location: 'Rajagiriya, Colombo',
    district: 'Colombo',
    city: 'Rajagiriya',
    priceLkr: 3250000,
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    isFeatured: true,
    views: 2420,
    size: '8 - 12 Perches',
    description: 'Extremely high-value commercial and residential plots in Rajagiriya. Highly residential neighborhood, ideal for luxury multi-story house or corporate office.'
  },
  {
    id: 'l-4',
    title: 'Elevare - Dewalapola',
    location: 'Dewalapola, Minuwangoda',
    district: 'Gampaha',
    city: 'Minuwangoda',
    priceLkr: 880000,
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
    isFeatured: true,
    views: 1120,
    size: '12 - 20 Perches',
    description: 'Prime plots located in Dewalapola. Minutes away from Minuwangoda and Gampaha towns. Surrounded by highly reputed schools and modern facilities.'
  },
  {
    id: 'l-5',
    title: 'Golden Heaven - Dambulla',
    location: 'Dambulla, Matale',
    district: 'Matale',
    city: 'Dambulla',
    priceLkr: 275000,
    category: 'Other',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    isFeatured: false,
    views: 890,
    size: '15 Perches',
    description: 'Premium plot situated right by the Dambulla main road. Incredible tourism potential, perfect for hotel or villa development.'
  },
  {
    id: 'l-6',
    title: 'The Few - Nawala',
    location: 'Nawala, Colombo',
    district: 'Colombo',
    city: 'Nawala',
    priceLkr: 4700000,
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800',
    isFeatured: false,
    views: 3120,
    size: '10 Perches',
    description: 'Ultra-exclusive residential neighborhood in Nawala. High elevation, concrete paved access, complete privacy with luxury community benefits.'
  },
  {
    id: 'l-7',
    title: 'Elysia - Karapitiya',
    location: 'Karapitiya, Galle',
    district: 'Galle',
    city: 'Galle',
    priceLkr: 1700000,
    category: 'Coconut Land',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800',
    isFeatured: false,
    views: 1540,
    size: '20 Perches',
    description: 'Beautiful land filled with mature coconut trees near the Karapitiya Medical College. Excellent residential potential or investment value.'
  }
];

interface LandsPortfolioProps {
  properties: any[];
  onPropertyClick: (property: any) => void;
  onNavigateHome: () => void;
  onNavigate: (view: any) => void;
}

export const LandsPortfolio: React.FC<LandsPortfolioProps> = ({ 
  properties, 
  onPropertyClick, 
  onNavigateHome,
  onNavigate
}) => {
  // Load custom lands list or merge with default and regular properties that are lands
  const [customLands, setCustomLands] = useState<LandProperty[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // States for filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterDistrict, setFilterDistrict] = useState<string>('All Districts');
  const [filterCity, setFilterCity] = useState<string>('All Cities');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');

  // Expand states for sidebar
  const [showAllDistricts, setShowAllDistricts] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllQuickLinks, setShowAllQuickLinks] = useState(false);

  useEffect(() => {
    // Load from local storage if exists
    try {
      const stored = localStorage.getItem('lands_portfolio_custom');
      if (stored) {
        setCustomLands(JSON.parse(stored));
      } else {
        setCustomLands(DEFAULT_LAND_PROPERTIES);
        localStorage.setItem('lands_portfolio_custom', JSON.stringify(DEFAULT_LAND_PROPERTIES));
      }
    } catch (e) {
      setCustomLands(DEFAULT_LAND_PROPERTIES);
    }
  }, []);

  // Merge with other properties that have category === 'Land'
  const allLands = useMemo(() => {
    const regularLands = properties
      .filter(p => p.category === 'Land' || p.property_category === 'Land')
      .map((p, idx) => ({
        id: p.id || `reg-${idx}`,
        title: removeSinhala(p.title || p.listing_title || 'Premium Land Plot'),
        location: p.location || `${p.city || ''}, ${p.district || ''}`,
        district: p.district || 'Colombo',
        city: p.city || 'Colombo 03',
        priceLkr: p.priceLkr || p.price_lkr || 1500000,
        category: 'Residential' as const,
        image: p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
        views: p.views || 75,
        size: p.size || '15 Perches',
        description: removeSinhala(p.description || p.property_description || ''),
        isFeatured: !!p.isFeatured
      }));

    // Filter out duplicates (if id matches)
    const existingIds = new Set(customLands.map(c => String(c.id)));
    const uniqueRegularLands = regularLands.filter(r => !existingIds.has(String(r.id)));

    return [...customLands, ...uniqueRegularLands];
  }, [customLands, properties]);

  // Extract districts list with count of lands
  const districtsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allLands.forEach(land => {
      const d = land.district || 'Colombo';
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allLands]);

  // Extract cities list with count of lands
  const citiesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allLands.forEach(land => {
      const c = land.city || 'Other';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allLands]);

  // Quick categories
  const categoriesList = ['Residential', 'Commercial', 'Agricultural', 'Coconut Land', 'Water Front Land', 'Mountain View', 'Industrial'];

  // Filter application
  const filteredLands = useMemo(() => {
    return allLands.filter(land => {
      // Category Filter
      if (filterCategory !== 'All') {
        if (land.category.toLowerCase() !== filterCategory.toLowerCase()) {
          return false;
        }
      }

      // District Filter
      if (filterDistrict !== 'All Districts' && filterDistrict !== 'All') {
        if (land.district.toLowerCase() !== filterDistrict.toLowerCase()) {
          return false;
        }
      }

      // City Filter
      if (filterCity !== 'All Cities' && filterCity !== 'All') {
        if (land.city.toLowerCase() !== filterCity.toLowerCase()) {
          return false;
        }
      }

      // Price Filter (Min)
      if (minPrice && parseInt(minPrice) > 0) {
        if (land.priceLkr < parseInt(minPrice)) return false;
      }

      // Price Filter (Max)
      if (maxPrice && parseInt(maxPrice) > 0) {
        if (land.priceLkr > parseInt(maxPrice)) return false;
      }

      // Keyword
      if (keyword.trim()) {
        const query = keyword.toLowerCase();
        const matchesTitle = land.title.toLowerCase().includes(query);
        const matchesLoc = land.location.toLowerCase().includes(query);
        const matchesDesc = (land.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesLoc && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [allLands, filterCategory, filterDistrict, filterCity, minPrice, maxPrice, keyword]);

  // Featured lands for top slider
  const featuredLands = useMemo(() => {
    return allLands.filter(l => l.isFeatured);
  }, [allLands]);

  // Reset all filters
  const handleResetFilters = () => {
    setFilterCategory('All');
    setFilterDistrict('All Districts');
    setFilterCity('All Cities');
    setMinPrice('');
    setMaxPrice('');
    setKeyword('');
    toast.success('Filters cleared successfully!');
  };

  // Autoplay slider
  useEffect(() => {
    if (featuredLands.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredLands.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredLands]);

  return (
    <div id="lands-portfolio-page" className="min-h-screen bg-neutral-50 pb-16 text-neutral-900 selection:bg-[#004f31] selection:text-white">
      <Toaster position="bottom-center" />

      {/* --- HERO BANNER & BREADCRUMB --- */}
      <div className="relative bg-gradient-to-r from-[#003d25] to-[#015f3b] text-white overflow-hidden py-16 px-6 sm:px-12">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
          <div className="absolute top-0 right-0 h-96 w-96 bg-brand-yellow/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 h-72 w-72 bg-emerald-300 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-bold uppercase tracking-wider mb-3">
              <button onClick={onNavigateHome} className="hover:text-white transition-colors cursor-pointer">Home</button>
              <ChevronRight size={12} className="opacity-60" />
              <span className="text-white">Projects</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 flex items-center gap-3">
              Projects
              <span className="text-xs bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 px-2.5 py-1 rounded-full uppercase tracking-widest font-black">
                Official Portfolio
              </span>
            </h1>
            
            <p className="max-w-2xl text-emerald-100 text-sm sm:text-base font-medium leading-relaxed">
              Choose from an elite portfolio of hand-picked prime land developments and housing projects across Sri Lanka's finest growth corridors, verified by Prime Group experts for clean title deed clearance and instant appreciation potential.
            </p>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 flex items-center gap-4 text-left shrink-0">
            <div className="p-3 bg-brand-yellow text-emerald-950 rounded-xl">
              <Compass size={24} className="animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-300 block mb-0.5">Secure Investment</span>
              <span className="text-base font-extrabold text-white block">100% Deed Clearance</span>
              <span className="text-xs font-bold text-emerald-200 block">Bank Loan Friendly Schemes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        
        {/* ==============================================
            SECTION: FEATURED LAND SLIDER (VISUAL POSTERS)
            ============================================== */}
        {featuredLands.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#004f31] rounded-full" />
                <h2 className="text-xl sm:text-2xl font-black text-[#004f31] tracking-tight">Featured Project Developments</h2>
              </div>
              <div className="flex gap-1.5">
                {featuredLands.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFeaturedIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      featuredIndex === idx ? 'bg-[#004f31] w-6' : 'bg-gray-200 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-white border border-gray-100 shadow-xl h-[400px] sm:h-[450px]">
              <AnimatePresence mode="wait">
                {featuredLands.map((land, idx) => {
                  if (idx !== featuredIndex) return null;
                  return (
                    <motion.div
                      key={land.id}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      className="absolute inset-0 grid grid-cols-1 md:grid-cols-12 h-full group"
                    >
                      {/* Left: Graphic/Poster details */}
                      <div className="col-span-1 md:col-span-7 relative h-full flex flex-col justify-between p-8 sm:p-12 text-left z-10 bg-gradient-to-r from-white via-white/95 to-transparent">
                        <div className="space-y-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#004f31]/10 text-[#004f31] text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                            <Sparkles size={12} className="text-amber-500" />
                            Premium Gated Development
                          </span>
                          <h3 className="text-3xl sm:text-4xl font-extrabold text-[#004f31] tracking-tight leading-tight">
                            {land.title}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
                            <MapPin size={16} className="text-[#004f31]" />
                            {land.location}
                          </div>
                        </div>

                        <div className="my-6 md:my-0 space-y-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Starting from</span>
                            <span className="text-3xl sm:text-4xl font-black text-[#004f31]">
                              {land.priceLkr.toLocaleString()} LKR
                            </span>
                            <span className="text-xs font-bold text-gray-500 uppercase">per perch upwards</span>
                          </div>

                          <p className="text-gray-600 text-xs sm:text-sm max-w-lg font-medium leading-relaxed">
                            {land.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <button
                            onClick={() => {
                              // Find equivalent in properties list or construct
                              const matched = properties.find(p => p.id === land.id || p.title === land.title);
                              if (matched) onPropertyClick(matched);
                              else {
                                // Fallback property mock for detail page
                                onPropertyClick({
                                  ...land,
                                  price_lkr: land.priceLkr,
                                  listing_title: land.title,
                                  property_category: 'Land'
                                });
                              }
                            }}
                            className="px-6 py-3 bg-[#004f31] hover:bg-[#003621] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-[#004f31]/20 transition-all flex items-center gap-2 cursor-pointer group"
                          >
                            Explore Land 
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                          
                          <div className="flex items-center gap-6 text-gray-400 text-xs font-bold border-l border-gray-100 pl-6">
                            <div>
                              <span className="block text-gray-500 uppercase tracking-widest text-[9px] mb-0.5">Views</span>
                              <span className="block text-sm font-black text-gray-800">{land.views || 150}</span>
                            </div>
                            <div>
                              <span className="block text-gray-500 uppercase tracking-widest text-[9px] mb-0.5">Size range</span>
                              <span className="block text-sm font-black text-gray-800">{land.size || '10+ Perches'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Immersive background image with premium badges */}
                      <div className="col-span-1 md:col-span-5 relative h-full overflow-hidden">
                        <img 
                          src={land.image} 
                          alt={land.title} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] ease-out group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-gradient-to-r md:from-white md:via-white/70 md:to-transparent" />
                        
                        {/* Premium ambient color overlay */}
                        <div className="absolute inset-0 bg-emerald-950/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none mix-blend-color" />

                        {/* Elegant Brand Badge in bottom right corner */}
                        <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shadow-2xl flex items-center gap-3 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-emerald-950/10">
                          <div className="w-9 h-9 rounded-xl bg-[#004f31] flex items-center justify-center text-white font-black text-sm shadow-inner transition-transform duration-500 group-hover:rotate-6">
                            P
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase tracking-wider text-gray-400 font-bold">Prime Lands</span>
                            <span className="block text-[11px] font-black text-[#004f31] uppercase tracking-tight">Verified Project</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ==============================================
            SECTION: FILTER SIDEBAR & PROPERTY LISTINGS
            ============================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: LISTING GRID (70% on desktop) */}
          <div className="col-span-1 lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm text-left">
              <div>
                <h3 className="text-base font-black text-gray-800">Find Your Dream Property</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                  Showing {filteredLands.length} exclusive verified project developments
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Filter State:</span>
                <span className="px-2.5 py-1 bg-emerald-50 text-[#004f31] rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
                  <Activity size={12} className="animate-pulse" />
                  Live Portfolio
                </span>
              </div>
            </div>

            {filteredLands.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredLands.map((land, idx) => (
                  <motion.div
                    key={land.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-2xl hover:border-emerald-100 transition-all flex flex-col overflow-hidden group text-left"
                  >
                    {/* Visual poster / photo container */}
                    <div className="relative h-[200px] overflow-hidden">
                      <img
                        src={land.image}
                        alt={land.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                      
                      {/* Floating tag */}
                      <span className="absolute top-4 left-4 px-2.5 py-1 bg-white/95 backdrop-blur-md text-[#004f31] text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm border border-gray-100/40">
                        {land.category} Land
                      </span>

                      {/* Floating Price overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div>
                          <span className="text-[9px] uppercase font-black text-gray-200 tracking-wider block mb-0.5">Price Per Perch</span>
                          <span className="text-lg font-black text-white block leading-none">
                            Rs. {land.priceLkr.toLocaleString()}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[9px] font-bold">
                          100% Clear Title
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-[#004f31] text-base group-hover:text-[#003621] transition-colors leading-snug">
                          {land.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                          <MapPin size={14} className="text-gray-400 shrink-0" />
                          {land.location}
                        </div>
                      </div>

                      {land.description && (
                        <p className="text-gray-500 text-xs font-semibold line-clamp-2 leading-relaxed">
                          {land.description}
                        </p>
                      )}

                      <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Size: <span className="text-gray-800 font-black">{land.size || '10+ Perches'}</span>
                        </span>

                        <button
                          onClick={() => {
                            const matched = properties.find(p => p.id === land.id || p.title === land.title);
                            if (matched) onPropertyClick(matched);
                            else {
                              onPropertyClick({
                                ...land,
                                price_lkr: land.priceLkr,
                                listing_title: land.title,
                                property_category: 'Land'
                              });
                            }
                          }}
                          className="px-3.5 py-2 bg-[#004f31]/5 hover:bg-[#004f31] hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-[#004f31] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          Explore Project
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <Compass size={32} className="animate-spin-slow" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="text-base font-black text-gray-800">No Projects Found</h4>
                  <p className="text-xs font-bold text-gray-400 leading-relaxed">
                    We couldn't find any premium projects matching your current search parameters. Try expanding your location or price filters.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-[#004f31] hover:text-white text-[#004f31] rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw size={14} /> Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PREMIUM FILTER SIDEBAR (30% on desktop) */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
            
            {/* 1. MAIN FILTER COMPONENT */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-lg overflow-hidden text-left">
              <div className="bg-[#5C9C84] p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-emerald-100" />
                  <h3 className="font-extrabold text-base tracking-tight">Search Filters</h3>
                </div>
                {(filterCategory !== 'All' || filterDistrict !== 'All Districts' || filterCity !== 'All Cities' || minPrice || maxPrice || keyword) && (
                  <button 
                    onClick={handleResetFilters}
                    className="text-[10px] font-black uppercase text-emerald-100 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={10} /> Reset
                  </button>
                )}
              </div>

              <div className="p-6 space-y-4">
                {/* Field: Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Land Categories</label>
                  <div className="relative">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 outline-none appearance-none focus:ring-2 focus:ring-[#5C9C84] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Field: District */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Districts</label>
                  <div className="relative">
                    <select
                      value={filterDistrict}
                      onChange={(e) => {
                        setFilterDistrict(e.target.value);
                        setFilterCity('All Cities'); // Reset city on district change
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 outline-none appearance-none focus:ring-2 focus:ring-[#5C9C84] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="All Districts">All Districts</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Kalutara">Kalutara</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Galle">Galle</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Matale">Matale</option>
                      <option value="Anuradhapura">Anuradhapura</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Field: Popular Cities */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Popular Cities</label>
                  <div className="relative">
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 outline-none appearance-none focus:ring-2 focus:ring-[#5C9C84] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="All Cities">All Cities</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Nawala">Nawala</option>
                      <option value="Rajagiriya">Rajagiriya</option>
                      <option value="Malabe">Malabe</option>
                      <option value="Alawwa">Alawwa</option>
                      <option value="Nachchaduwa">Nachchaduwa</option>
                      <option value="Minuwangoda">Minuwangoda</option>
                      <option value="Dambulla">Dambulla</option>
                      <option value="Galle">Galle</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Field: Min Perch Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Perch Price (Min)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 100000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#5C9C84] focus:bg-white transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">LKR</span>
                  </div>
                </div>

                {/* Field: Max Perch Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Perch Price (Max)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 5000000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#5C9C84] focus:bg-white transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">LKR</span>
                  </div>
                </div>

                {/* Field: Keyword Search */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Keyword Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type name, landmark, etc..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-11/12 pl-10 py-2.5 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#5C9C84] focus:bg-white transition-all"
                    />
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <button
                  onClick={() => toast.success('Filters applied! Showing matching land properties.')}
                  className="w-full py-3 bg-[#004f31] hover:bg-[#003c24] text-white font-black rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md hover:shadow-lg mt-2 cursor-pointer"
                >
                  Apply Search
                </button>
              </div>
            </div>

            {/* 2. DISTRICTS STATISTICS CONTAINER */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-md p-6 text-left space-y-4">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                🗺️ Districts Coverage
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                {districtsWithCounts.slice(0, showAllDistricts ? districtsWithCounts.length : 6).map(([district, count]) => (
                  <button
                    key={district}
                    onClick={() => {
                      setFilterDistrict(district);
                      toast.success(`Selected ${district} district`);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      filterDistrict.toLowerCase() === district.toLowerCase()
                        ? 'bg-emerald-50 border-[#004f31] text-[#004f31]'
                        : 'bg-gray-50 border-gray-100/60 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{district}</span>
                    <span className="px-1.5 py-0.5 bg-white text-gray-500 rounded-md border text-[9px] font-black">
                      {count}
                    </span>
                  </button>
                ))}
              </div>

              {districtsWithCounts.length > 6 && (
                <button
                  onClick={() => setShowAllDistricts(!showAllDistricts)}
                  className="w-full text-center py-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  {showAllDistricts ? (
                    <>Show Less <ChevronUp size={12} /></>
                  ) : (
                    <>Show More ({districtsWithCounts.length - 6}) <ChevronDown size={12} /></>
                  )}
                </button>
              )}
            </div>

            {/* 3. POPULAR CITIES COUNT */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-md p-6 text-left space-y-4">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                📍 Popular Real Estate Hubs
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                {citiesWithCounts.slice(0, showAllCities ? citiesWithCounts.length : 6).map(([city, count]) => (
                  <button
                    key={city}
                    onClick={() => {
                      setFilterCity(city);
                      toast.success(`Selected ${city} City`);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      filterCity.toLowerCase() === city.toLowerCase()
                        ? 'bg-emerald-50 border-[#004f31] text-[#004f31]'
                        : 'bg-gray-50 border-gray-100/60 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{city}</span>
                    <span className="px-1.5 py-0.5 bg-white text-gray-500 rounded-md border text-[9px] font-black">
                      {count}
                    </span>
                  </button>
                ))}
              </div>

              {citiesWithCounts.length > 6 && (
                <button
                  onClick={() => setShowAllCities(!showAllCities)}
                  className="w-full text-center py-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  {showAllCities ? (
                    <>Show Less <ChevronUp size={12} /></>
                  ) : (
                    <>Show More ({citiesWithCounts.length - 6}) <ChevronDown size={12} /></>
                  )}
                </button>
              )}
            </div>

            {/* 4. QUICK CATEGORY LINKS */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[24px] text-white p-6 text-left space-y-4 shadow-lg border border-emerald-900">
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-300" />
                <span className="text-[10px] font-black uppercase text-emerald-300 tracking-widest">
                  Quick Category Links
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                {categoriesList.slice(0, showAllQuickLinks ? categoriesList.length : 4).map(cat => {
                  const Icon = cat === 'Residential' ? Trees 
                    : cat === 'Coconut Land' ? Trees
                    : cat === 'Water Front Land' ? Waves
                    : cat === 'Mountain View' ? Mountain
                    : Trees;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setFilterCategory(cat);
                        toast.success(`Filtering by ${cat}`);
                      }}
                      className="w-full flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-emerald-300 group-hover:scale-110 transition-transform" />
                        <span>{cat} Land</span>
                      </div>
                      <ChevronRight size={12} className="opacity-60 group-hover:translate-x-1 transition-transform" />
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowAllQuickLinks(!showAllQuickLinks)}
                className="w-full text-center py-1 hover:bg-white/5 text-emerald-300 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                {showAllQuickLinks ? (
                  <>Show Less <ChevronUp size={12} /></>
                ) : (
                  <>Show More <ChevronDown size={12} /></>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* ==============================================
            SECTION: GROUP OF COMPANIES
            ============================================== */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-md p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Group of Companies</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider leading-relaxed">
              Prime Group, Sri Lanka's premier real estate developer, comprises a dynamic portfolio of subsidiaries. Together, we create innovative and value-driven solutions to fulfill every property need.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center justify-center">
            {[
              { name: 'Prime Premier', logo: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=120', desc: 'Elite Realty Investments' },
              { name: 'Prime Construction', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=120', desc: 'Premium Engineering' },
              { name: 'Prime Lands Residencies PLC', logo: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=120', desc: 'PLC Condominium Experts' },
              { name: 'Bhoomi Realty Holdings', logo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=120', desc: 'Premium Plot Developments' },
              { name: 'Prime Group Dubai', logo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', desc: 'International Reach' }
            ].map((company) => (
              <div 
                key={company.name} 
                className="p-5 bg-gray-50 border border-gray-100/50 rounded-2xl flex flex-col items-center text-center gap-3 hover:bg-emerald-50 hover:border-emerald-100 transition-all cursor-pointer group shadow-sm hover:shadow-lg"
              >
                <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-[#004f31] font-black text-lg group-hover:bg-[#004f31] group-hover:text-white transition-all shadow-sm">
                  {company.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-800 leading-snug">{company.name}</h4>
                  <span className="text-[9px] font-bold text-gray-400 group-hover:text-emerald-600 transition-colors block mt-0.5">{company.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
