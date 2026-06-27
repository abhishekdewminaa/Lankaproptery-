import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, MapPin, ChevronDown, Clock, Bed, Bath, LandPlot, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LatestAdvertisementsProps {
  category?: string | null;
  limit?: number;
  onPropertyClick?: (property: any) => void;
  onNavigate?: (view: any) => void;
  isSidebar?: boolean;
}

const LatestAdvertisements: React.FC<LatestAdvertisementsProps> = ({ 
  category = null,
  limit = 8,
  onPropertyClick,
  onNavigate,
  isSidebar = false
}) => {
  const [period, setPeriod] = useState('alltime');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '3days', label: 'Last 3 Days' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '14days', label: 'Last 14 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: 'thisyear', label: 'This Year' },
    { value: 'alltime', label: 'All Time' },
  ];

  const getPeriodDate = (periodStr: string) => {
    const now = new Date();
    switch(periodStr) {
      case 'today': {
        const today = new Date();
        today.setHours(0,0,0,0);
        return today.toISOString();
      }
      case 'yesterday': {
        const yest = new Date();
        yest.setDate(yest.getDate() - 1);
        yest.setHours(0,0,0,0);
        return yest.toISOString();
      }
      case '3days':
        return new Date(now.getTime() - 3*24*60*60*1000).toISOString();
      case '7days':
        return new Date(now.getTime() - 7*24*60*60*1000).toISOString();
      case '14days':
        return new Date(now.getTime() - 14*24*60*60*1000).toISOString();
      case '30days':
        return new Date(now.getTime() - 30*24*60*60*1000).toISOString();
      case '3months':
        return new Date(now.getTime() - 90*24*60*60*1000).toISOString();
      case '6months':
        return new Date(now.getTime() - 180*24*60*60*1000).toISOString();
      case 'thisyear':
        return new Date(now.getFullYear(), 0, 1).toISOString();
      case 'alltime':
        return new Date('2020-01-01').toISOString();
      default:
        return new Date(now.getTime() - 7*24*60*60*1000).toISOString();
    }
  };

  const fetchLatest = async () => {
    setLoading(true);
    try {
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
          images,
          rooms,
          bathrooms,
          land_area,
          is_negotiable,
          created_at
        `)
        .eq('status', 'active')
        .gte('created_at', getPeriodDate(period))
        .order('created_at', { 
          ascending: false 
        })
        .limit(limit);

      // Filter by category if on category page
      if (category) {
        query = query.eq('property_category', category);
      }

      const { data, error } = await query;
      if (!error) {
        setProperties(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, [period, category]);

  const selectedLabel = periodOptions.find(
    o => o.value === period
  )?.label || 'Select Period';

  const navigateToProperty = (property: any) => {
    if (onPropertyClick) {
      onPropertyClick(property);
    } else if (onNavigate) {
      window.history.pushState({}, '', `/property/${property.id}`);
      onNavigate({ type: 'detail', data: { id: property.id } });
    } else {
      window.history.pushState({}, '', `/property/${property.id}`);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleViewAll = () => {
    if (onNavigate) {
      window.history.pushState({}, '', '/');
      onNavigate({ type: 'home' });
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff/60000);
    const hours = Math.floor(diff/3600000);
    const days = Math.floor(diff/86400000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm relative ${isSidebar ? 'p-4 md:p-5' : 'p-6 md:p-8'}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#004F31]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className={`flex flex-col ${isSidebar ? 'gap-3 mb-4' : 'sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'} pb-4 border-b border-gray-100 relative z-10`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-5 bg-[#004F31] rounded-full inline-block" />
            <h3 className={`font-black text-gray-900 tracking-tight uppercase ${isSidebar ? 'text-sm' : 'text-xl md:text-2xl'}`}>
              Latest Project Areas
            </h3>
          </div>
          {!isSidebar && (
            <p className="text-xs text-gray-500 font-medium">
              Real-time projects verified and published directly from the admin platform.
            </p>
          )}
        </div>

        {/* Period Dropdown styled beautifully */}
        <div className="relative self-start z-[60]">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl cursor-pointer text-sm font-bold text-gray-700 transition-all shadow-sm active:scale-95"
          >
            <Calendar size={16} className="text-[#004F31]" />
            <span>{selectedLabel}</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop to close dropdown */}
                <div
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 z-[45]"
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-50"
                >
                  <div className="py-1.5 max-h-64 overflow-y-auto">
                    {periodOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setPeriod(option.value);
                          setIsOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors flex items-center justify-between ${
                          period === option.value 
                            ? 'bg-[#E8F5E9] text-[#004F31] font-bold' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span>{option.label}</span>
                        {period === option.value && <span className="w-1.5 h-1.5 bg-[#004F31] rounded-full" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results Status */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#004F31] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#004F31]"></span>
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-400">
            {loading ? 'Querying database...' : `${properties.length} project areas available`}
          </span>
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div className={`grid ${isSidebar ? 'grid-cols-1 gap-5' : 'grid-cols-1 md:grid-cols-3 gap-8'} relative z-10`}>
          {Array(isSidebar ? 3 : 3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-3xl p-4 flex flex-col h-full">
              <div className="w-full aspect-video bg-gray-100 rounded-2xl mb-4" />
              <div className="h-5 bg-gray-100 rounded-md mb-2 w-3/4" />
              <div className="h-4 bg-gray-100 rounded-md mb-4 w-1/2" />
              <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                <div className="h-4 bg-gray-100 rounded-md w-1/3" />
                <div className="h-4 bg-gray-100 rounded-md w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50 relative z-10">
          <div className="w-16 h-16 bg-[#004F31]/5 text-[#004F31] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🏠
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-1">No Active Listings found</h4>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            There are no real property units recorded on the database for {selectedLabel.toLowerCase()}.
          </p>
          <button
            onClick={() => setPeriod('alltime')}
            className="px-6 py-2.5 bg-[#004F31] text-white rounded-xl text-sm font-bold hover:bg-[#003B24] transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Show All Time Live Properties
          </button>
        </div>
      ) : (
        <div className={`grid ${isSidebar ? 'grid-cols-1 gap-5' : 'grid-cols-1 md:grid-cols-3 gap-8'} relative z-10`}>
          {properties.map((property, index) => {
            let image = '/placeholder-property.jpg';
            if (property.images) {
              if (Array.isArray(property.images)) {
                image = property.images[0] || '/placeholder-property.jpg';
              } else if (typeof property.images === 'string') {
                try {
                  const parsed = JSON.parse(property.images);
                  image = (Array.isArray(parsed) ? parsed[0] : parsed) || '/placeholder-property.jpg';
                } catch {
                  image = property.images;
                }
              }
            }

            const isSale = property.listing_type === 'For Sale' || property.listing_type === 'Sale';

            return (
              <motion.div
                key={property.id}
                onClick={() => navigateToProperty(property)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100/70 hover:border-[#004F31]/20 cursor-pointer flex flex-col h-full transition-all"
              >
                {/* Image Section */}
                <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
                  <img
                    src={image}
                    alt={property.listing_title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/placeholder-property.jpg';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full text-white shadow-sm ${
                      isSale ? 'bg-rose-600' : 'bg-[#004F31]'
                    }`}>
                      FOR {isSale ? 'SALE' : 'RENT'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-gray-800 shadow-sm flex items-center gap-1">
                    <Clock size={10} className="text-[#004F31]" />
                    {timeAgo(property.created_at)}
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Category */}
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#004F31] mb-1.5 block">
                    {property.property_category || 'Property'}
                  </span>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-3 group-hover:text-[#004F31] transition-colors flex-1">
                    {property.listing_title}
                  </h4>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold mb-4">
                    <MapPin size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate">{property.city}, {property.district}</span>
                  </div>

                  {/* Details strip */}
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 border-t border-b border-gray-50 py-2.5 mb-4">
                    <span className="flex items-center gap-1">
                      <Bed size={13} className="text-[#004F31]" />
                      {property.rooms || 0} Bed
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={13} className="text-[#004F31]" />
                      {property.bathrooms || 0} Bath
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[90px]">
                      <LandPlot size={13} className="text-[#004F31]" />
                      {property.land_area || 'N/A'}
                    </span>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="text-[#004F31] font-extrabold text-base">
                      {property.price_lkr
                        ? `Rs. ${Number(property.price_lkr).toLocaleString()}`
                        : 'Price on Request'
                      }
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View All Footer */}
      {!loading && properties.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-50 flex justify-center relative z-10">
          <button
            onClick={handleViewAll}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-50 hover:bg-[#004F31] hover:text-white border border-[#BBF7D0] hover:border-[#004F31] rounded-2xl text-[#004F31] font-bold text-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <span>Explore All Project Areas</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LatestAdvertisements;
