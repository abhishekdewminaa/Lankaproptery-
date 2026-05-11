import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bed, Bath, LandPlot, ArrowRight } from 'lucide-react';

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

export const RecentListings: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Recent Listings Column */}
          <div className="flex-grow lg:w-2/3">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Recent Listings</h2>
              <a href="#" className="flex items-center gap-2 text-brand-green font-bold text-sm hover:underline">
                View All <ArrowRight size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {LISTINGS.map((listing, idx) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 cursor-pointer"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={listing.images?.[0] || (listing as any).image} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt={listing.listing_title}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full text-white shadow-lg ${listing.listing_type === 'sale' ? 'bg-red-600' : 'bg-brand-green'}`}>
                        FOR {listing.listing_type}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-brand-green font-black text-xl mb-2">{listing.price_lkr}</div>
                    <h3 className="text-gray-900 font-bold mb-4 line-clamp-1 group-hover:text-brand-green transition-colors">{listing.listing_title}</h3>
                    <div className="flex items-center justify-between text-gray-500 text-xs font-medium border-t border-gray-50 pt-4">
                      <span className="flex items-center gap-1.5"><Bed size={14} className="text-brand-green" /> {listing.bedrooms} Beds</span>
                      <span className="flex items-center gap-1.5"><Bath size={14} className="text-brand-green" /> {listing.bathrooms} Baths</span>
                      <span className="flex items-center gap-1.5"><LandPlot size={14} className="text-brand-green" /> {listing.size}</span>
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
                  <input type="text" defaultValue="15000000" className="w-full bg-[#f0fdf4] border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Down Payment (%)</label>
                  <input type="text" defaultValue="20" className="w-full bg-[#f0fdf4] border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Interest Rate (%)</label>
                  <input type="text" defaultValue="14.5" className="w-full bg-[#f0fdf4] border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none" />
                </div>

                <div className="pt-6 border-t border-gray-50 mt-4">
                  <div className="text-xs font-bold text-gray-400 mb-1">Estimated Monthly Payment:</div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-black text-brand-green"
                  >
                    Rs. 142,450
                  </motion.div>
                </div>
              </div>

              <button className="w-full py-4 bg-brand-navy hover:bg-black text-white font-bold rounded-xl mt-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Get Bank Offers
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
