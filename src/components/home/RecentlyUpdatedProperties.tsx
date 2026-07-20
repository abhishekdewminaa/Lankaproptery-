import React from 'react';
import { motion } from 'motion/react';
import { Bed, Bath, Maximize2, MapPin, ArrowRight, Clock } from 'lucide-react';

interface RecentlyUpdatedPropertiesProps {
  properties: any[];
  onNavigate: (view: any) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const RecentlyUpdatedProperties: React.FC<RecentlyUpdatedPropertiesProps> = ({
  properties,
  onNavigate,
}) => {
  // Sort properties by updatedAt, updated_at, createdAt, or created_at in descending order
  const sortedProperties = [...properties].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.updated_at || a.createdAt || a.created_at || 0).getTime();
    const timeB = new Date(b.updatedAt || b.updated_at || b.createdAt || b.created_at || 0).getTime();
    return timeB - timeA;
  });

  // Limit to 4 listings
  const recentListings = sortedProperties.slice(0, 4);

  return (
    <section className="py-12 bg-white border-t border-gray-100" id="recently-updated-properties">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#0a4225]/5 border border-[#0a4225]/10 px-2.5 py-1 rounded-full mb-2">
              <Clock size={12} className="text-[#0a4225]" />
              <span className="text-[9px] font-black uppercase tracking-wider text-[#0a4225]">Real-time Live Feed</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Recently Updated Properties</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Freshly added and newly modified estate opportunities.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate({ type: 'home' })}
            className="group flex items-center gap-1 text-xs font-black text-[#0a4225] hover:text-[#072f1a] transition-all cursor-pointer"
          >
            Explore All Listings <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </motion.button>
        </div>

        {/* 4-Card Responsive Grid */}
        {recentListings.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400 font-semibold border border-dashed border-gray-200 rounded-md">
            No properties found matching this criteria.
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {recentListings.map((prop, idx) => {
              const offerType = prop.type === 'Rent' || prop.listing_type === 'For Rent' ? 'RENT' : 'SELL';
              return (
                <motion.div
                  key={prop.id || idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate({ type: 'detail', data: prop })}
                  className="bg-white rounded-md overflow-hidden border border-gray-150 shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col group"
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Recently Updated Badge (Left) */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-[#0a4225] text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                        Just Updated
                      </span>
                    </div>

                    {/* Offer Type Badge (Right) */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm text-white ${offerType === 'RENT' ? 'bg-sky-500' : 'bg-emerald-700'}`}>
                        {offerType}
                      </span>
                    </div>
                  </div>

                  {/* Info Panel */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-xl font-black text-gray-900 leading-tight mb-1">
                      Rs. {prop.priceLkr ? prop.priceLkr.toLocaleString() : (prop.price ? prop.price.toLocaleString() : 'N/A')}
                    </div>

                    <h4 className="text-xs font-black text-gray-800 line-clamp-1 mb-1.5 group-hover:text-[#0a4225] transition-colors">
                      {prop.title}
                    </h4>

                    <div className="flex items-center gap-1 text-gray-400 text-[11px] font-semibold mb-3">
                      <MapPin size={12} className="shrink-0 text-gray-400" />
                      <span className="truncate">{prop.location || prop.city}</span>
                    </div>

                    {/* Specs section */}
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-gray-100">
                      {prop.bedrooms && (
                        <span className="flex items-center gap-1 bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md">
                          <Bed size={12} /> {prop.bedrooms}
                        </span>
                      )}
                      {prop.bathrooms && (
                        <span className="flex items-center gap-1 bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md">
                          <Bath size={12} /> {prop.bathrooms}
                        </span>
                      )}
                      <span className="flex items-center gap-1 bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md">
                        <Maximize2 size={11} /> {prop.size}
                      </span>
                    </div>

                    {/* Button Link */}
                    <div className="mt-3.5 pt-2.5 border-t border-gray-50">
                      <div className="w-full py-2 bg-[#0a4225]/5 group-hover:bg-[#0a4225] text-[#0a4225] group-hover:text-white text-[10px] font-black uppercase tracking-wider rounded-sm transition-colors duration-300 flex items-center justify-center gap-1.5">
                        View Details <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};
