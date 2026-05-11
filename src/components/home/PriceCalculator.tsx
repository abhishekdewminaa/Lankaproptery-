import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Home, LandPlot, Building2, Building, Briefcase, Shovel, Palmtree, Hotel } from 'lucide-react';

const PROPERTY_TYPES = [
  { icon: <Home size={20} />, label: 'House' },
  { icon: <LandPlot size={20} />, label: 'Land' },
  { icon: <Building2 size={20} />, label: 'Apartment' },
  { icon: <Building size={20} />, label: 'Building' },
  { icon: <Briefcase size={20} />, label: 'Commercial' },
  { icon: <Shovel size={20} />, label: 'Farm Land' },
  { icon: <Palmtree size={20} />, label: 'Villa' },
  { icon: <Hotel size={20} />, label: 'Hotel' },
];

export const PriceCalculator: React.FC = () => {
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [selectedType, setSelectedType] = useState('House');

  return (
    <section className="py-24 bg-gradient-to-br from-[#004F31] to-[#002618] relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/10 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-green-medium/10 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true, amount: 0.3 }}
           transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Calculate Your Property Price</h2>
          <p className="text-brand-green-medium font-medium mb-12 max-w-2xl mx-auto">
            Get an instant AI-powered market value estimate for any property in Sri Lanka
          </p>

          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12">
            {/* Listing Type Toggle */}
             <div className="flex justify-center mb-10">
              <div className="flex bg-white/5 p-1.5 rounded-full border border-white/5">
                <button 
                  onClick={() => setListingType('sale')}
                  className={`px-8 py-2 rounded-full text-xs font-bold transition-all ${listingType === 'sale' ? 'bg-brand-green text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  For Sale
                </button>
                <button 
                  onClick={() => setListingType('rent')}
                  className={`px-8 py-2 rounded-full text-xs font-bold transition-all ${listingType === 'rent' ? 'bg-brand-green text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  For Rent
                </button>
              </div>
            </div>

            {/* Property Types Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-12">
              {PROPERTY_TYPES.map((type, idx) => (
                <motion.button
                  key={type.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedType(type.label)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                    selectedType === type.label 
                    ? 'bg-brand-green border-brand-green text-white shadow-lg shadow-brand-green/30' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {type.icon}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{type.label}</span>
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 bg-brand-green text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-2xl shadow-brand-green/20 hover:bg-brand-green-medium transition-all flex items-center justify-center gap-3"
            >
              <Shovel size={20} className="-rotate-45" /> CALCULATE NOW
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
