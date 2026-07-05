import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bed, Bath, LandPlot, ArrowRight } from 'lucide-react';

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

interface ListingProps {
  id: number;
  listing_title: string;
  price_lkr: string;
  city: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  size: string;
  listing_type: 'sale' | 'rent';
}

const LISTINGS: ListingProps[] = [
  {
    id: 101,
    listing_title: 'Modern Family House in Malabe',
    price_lkr: 'Rs. 42,000,000',
    city: 'Malabe',
    images: ['https://images.unsplash.com/photo-1580587771525-78b9bed1b427?auto=format&fit=crop&q=80&w=800'],
    bedrooms: 4,
    bathrooms: 3,
    size: '2,400 sqft',
    listing_type: 'sale'
  },
  {
    id: 102,
    listing_title: 'Luxury Apartment, Havelock City',
    price_lkr: 'Rs. 150,000 / mo',
    city: 'Colombo 05',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800'],
    bedrooms: 3,
    bathrooms: 2,
    size: '1,200 sqft',
    listing_type: 'rent'
  }
];

interface RecentListingsProps {
  onNavigate: (view: any) => void;
  properties?: any[];
}

export const RecentListings: React.FC<RecentListingsProps> = ({ onNavigate, properties = [] }) => {
  // Use provided properties or fallback to static ones if truly needed (but we prefer dynamic)
  // Sort properties by creation date (newest first)
  const sortedProperties = [...properties].sort((a, b) => {
    const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
    const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  
  const displayProperties = sortedProperties.length > 0 ? sortedProperties.slice(0, 4) : LISTINGS;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Recent Listings Column */}
          <div className="flex-grow lg:w-2/3">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 uppercase pl-4 border-l-4 border-[var(--lp-green)]">Recent Listings</h2>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate({ type: 'home' }); window.scrollTo({ top: 800, behavior: 'smooth' }); }} className="flex items-center gap-2 text-brand-green font-bold text-sm hover:underline uppercase tracking-widest">
                View All <ArrowRight size={16} />
              </a>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-6 px-6 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:pb-0 md:mx-0 md:px-0 scroll-smooth touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
              {displayProperties.map((listing, idx) => (
                <motion.div key={idx}

                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  whileHover={{ y: -8 }}
                  onClick={() => onNavigate({ type: 'detail', data: listing })}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 cursor-pointer h-full w-[260px] md:w-auto shrink-0 snap-center flex flex-col"
                >
                  <div className="relative h-48 md:h-56 overflow-hidden shrink-0">
                    <img onError={(e) => { e.currentTarget.src = '/placeholder-property.jpg'; }} 
                      src={getPropertyImage(listing.images)} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt={listing.listing_title || listing.title}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg ${
                        (listing.listing_type || '').toLowerCase().includes('sale') 
                          ? 'bg-[#CC1414] text-white' 
                          : (listing.listing_type || '').toLowerCase().includes('rent')
                            ? 'bg-[#1565C0] text-white'
                            : 'bg-[#E8A000] text-[#111827]'
                      }`}>
                        FOR {(listing.listing_type || 'Sale').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <div className="text-brand-green font-black text-lg md:text-xl mb-1 md:mb-2">
                       {typeof listing.price_lkr === 'number' ? `Rs. ${listing.price_lkr.toLocaleString()}` : (listing.price_lkr || listing.price || 'Price on Request')}
                    </div>
                    <h3 className="text-gray-900 font-bold mb-4 line-clamp-2 leading-tight group-hover:text-brand-green transition-colors">{listing.listing_title || listing.title}</h3>
                    <div className="mt-auto flex items-center justify-between text-gray-500 text-[10px] font-black uppercase tracking-widest border-t border-gray-50 pt-4">
                      <span className="flex items-center gap-1.5"><Bed size={14} className="text-brand-green" /> {listing.bedrooms || 0}</span>
                      <span className="flex items-center gap-1.5"><Bath size={14} className="text-brand-green" /> {listing.bathrooms || 0}</span>
                      <span className="flex items-center gap-1.5"><LandPlot size={14} className="text-brand-green" /> {listing.land_area || listing.size || 'N/A'}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mortgage Calculator Column */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/3"
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Mortgage Calculator</h2>
              
              <div className="space-y-6 flex-grow">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Property Price (Rs.)</label>
                  <input type="text" defaultValue="15000000" className="w-full bg-white border border-gray-200 focus:border-[var(--lp-green)] rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Down Payment (%)</label>
                  <input type="text" defaultValue="20" className="w-full bg-white border border-gray-200 focus:border-[var(--lp-green)] rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Interest Rate (%)</label>
                  <input type="text" defaultValue="14.5" className="w-full bg-white border border-gray-200 focus:border-[var(--lp-green)] rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none transition-colors" />
                </div>

                <div className="pt-6 border-t border-gray-50 mt-4">
                  <div className="text-xs font-bold text-gray-400 mb-1">Estimated Monthly Payment:</div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-black text-[var(--lp-green)]"
                  >
                    Rs. 142,450
                  </motion.div>
                </div>
              </div>

              <button className="w-full py-4 bg-[var(--lp-green)] hover:bg-[var(--lp-green-dark)] text-white font-bold rounded-xl mt-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Get Bank Offers
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
