import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Search, ArrowLeft, Filter, TrendingUp, Sparkles, MapPin, Bed, Bath, LandPlot } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface Property {
  id: number;
  listing_title: string;
  price_lkr: string | number;
  city: string;
  district: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  land_area: string;
  listing_type: string;
  package_tier: string;
}

interface FeaturedViewProps {
  onBack: () => void;
  onNavigate: (view: any) => void;
}

export const FeaturedView: React.FC<FeaturedViewProps> = ({ onBack, onNavigate }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .or('is_featured.eq.true,package_tier.eq.Elite Pro,package_tier.eq.Premium Pro,published_by.eq.admin')
          .order('created_at', { ascending: false });

        if (data) {
          setProperties(data.map(p => ({
            ...p,
            listing_title: p.listing_title || p.title,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const filteredProperties = properties.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'house') return p.listing_title?.toLowerCase().includes('house');
    if (filter === 'land') return p.listing_title?.toLowerCase().includes('land');
    if (filter === 'apartment') return p.listing_title?.toLowerCase().includes('apartment');
    return true;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sort === 'newest') return 0; // Already sorted by created_at
    if (sort === 'price_high') return Number(b.price_lkr) - Number(a.price_lkr);
    if (sort === 'price_low') return Number(a.price_lkr) - Number(b.price_lkr);
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-10">
        <div className="container mx-auto px-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-brand-green font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft size={18} /> Back to Home
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Featured Listings</h1>
              <p className="text-gray-500 mt-2 font-medium">The most exclusive properties in Sri Lanka, handpicked for you.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-brand-green/10 text-brand-green px-4 py-2 rounded-full flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                <Sparkles size={14} /> {sortedProperties.length} Premium Listings
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Sorting */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex gap-2">
            {['all', 'house', 'land', 'apartment'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort By:</span>
            <select 
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-brand-green appearance-none pr-10 relative"
            >
              <option value="newest">Newest First</option>
              <option value="price_high">Price: High to Low</option>
              <option value="price_low">Price: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-[400px] animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {sortedProperties.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onNavigate({ type: 'detail', data: p })}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer border border-gray-100/50"
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.listing_title} />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-brand-green text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                      <Sparkles size={12} /> FEATURED
                    </span>
                    {p.package_tier === 'Elite Pro' && (
                      <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                        <TrendingUp size={12} /> TOP LISTING
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-brand-green font-black text-xl mb-2">Rs. {Number(p.price_lkr).toLocaleString()}</div>
                  <h3 className="text-gray-900 font-bold mb-4 line-clamp-1 group-hover:text-brand-green transition-colors">{p.listing_title}</h3>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
                    <MapPin size={14} className="text-brand-green" /> {p.city}, {p.district}
                  </div>
                  
                  <div className="flex items-center justify-between text-gray-500 text-[10px] font-black uppercase tracking-widest border-t border-gray-50 pt-6">
                    <span className="flex items-center gap-1.5"><Bed size={14} className="text-brand-green" /> {p.bedrooms} Beds</span>
                    <span className="flex items-center gap-1.5"><Bath size={14} className="text-brand-green" /> {p.bathrooms} Baths</span>
                    <span className="flex items-center gap-1.5"><LandPlot size={14} className="text-brand-green" /> {p.land_area}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && sortedProperties.length === 0 && (
          <div className="py-32 text-center flex flex-col items-center">
            <Search size={64} className="text-gray-200 mb-6" />
            <h2 className="text-2xl font-black text-gray-400 uppercase tracking-widest">No Featured Properties Found</h2>
            <p className="text-gray-400 mt-2 font-medium">Try different filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};
