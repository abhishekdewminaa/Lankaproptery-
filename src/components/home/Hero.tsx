import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, ChevronDown, Activity, Trash2 } from 'lucide-react';

interface HeroProps {
  propertyCount: number;
  onSearch: (filters: any) => void;
}

export const Hero: React.FC<HeroProps> = ({ propertyCount, onSearch }) => {
  const [activeTab, setActiveTab] = useState<'sale' | 'rent' | 'lease'>('sale');
  
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background with Luxury Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Property" 
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        {/* Text Content */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg"
        >
          Find Your Perfect Home <br className="hidden md:block" /> in Sri Lanka
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-yellow-400 font-semibold tracking-widest text-sm md:text-base uppercase mb-12"
        >
          Sri Lanka's #1 Real Estate Marketplace
        </motion.p>

        {/* Search Widget */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto bg-white rounded-[20px] shadow-2xl p-6 md:p-8"
        >
          {/* Row 1 - Type Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
              {[
                { id: 'sale', label: '🏠 For Sale' },
                { id: 'rent', label: '🔑 For Rent' },
                { id: 'lease', label: '📋 For Lease' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === tab.id 
                    ? 'bg-brand-green text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <a href="#" className="text-brand-green font-bold text-sm flex items-center gap-1 hover:underline whitespace-nowrap">
              Direct Inquiry
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>↗</motion.span>
            </a>
          </div>

          {/* Row 2 - Main search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-green transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Colombo, Landmark, or Project..."
                className="w-full bg-gray-50 border border-transparent focus:border-brand-green focus:bg-white rounded-xl py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <select className="w-full bg-gray-50 border border-transparent focus:border-brand-green focus:bg-white rounded-xl py-4 px-4 appearance-none text-sm font-medium outline-none transition-all cursor-pointer">
                  <option>All Types</option>
                  <option>Houses</option>
                  <option>Apartments</option>
                  <option>Land</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
              <div className="relative">
                <select className="w-full bg-gray-50 border border-transparent focus:border-brand-green focus:bg-white rounded-xl py-4 px-4 appearance-none text-sm font-medium outline-none transition-all cursor-pointer">
                  <option>All Districts</option>
                  <option>Colombo</option>
                  <option>Kandy</option>
                  <option>Galle</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          {/* Row 3 - Filters & Search Now */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="relative">
                <select className="w-full bg-gray-50 rounded-xl py-3.5 px-4 appearance-none text-xs font-bold text-gray-600 outline-none cursor-pointer">
                  <option>Bedrooms</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
              <div className="relative">
                <select className="w-full bg-gray-50 rounded-xl py-3.5 px-4 appearance-none text-xs font-bold text-gray-600 outline-none cursor-pointer">
                  <option>Min Price</option>
                  <option>Rs. 1M</option>
                  <option>Rs. 10M</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
              <div className="relative">
                <select className="w-full bg-gray-50 rounded-xl py-3.5 px-4 appearance-none text-xs font-bold text-gray-600 outline-none cursor-pointer">
                  <option>Max Price</option>
                  <option>Rs. 50M</option>
                  <option>Rs. 100M+</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>
            <button 
              className="w-full md:w-auto md:min-w-[200px] h-[52px] bg-brand-green hover:bg-brand-green-medium text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-green/20"
            >
              <Search size={18} strokeWidth={3} /> Search Now
            </button>
          </div>

          {/* Bottom Info */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <Activity size={14} className="text-brand-green" />
                {propertyCount.toLocaleString()} properties found
              </span>
              <button className="text-xs font-black text-gray-300 hover:text-brand-red flex items-center gap-1 transition-colors uppercase">
                <Trash2 size={12} /> Clear Filters
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-300 uppercase">Popular:</span>
              <div className="flex gap-2">
                {['House in Colombo', 'Land in Gampaha', 'Apartments in Rajagiriya'].map(tag => (
                  <button key={tag} className="px-2.5 py-1 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-md hover:bg-brand-green/10 hover:text-brand-green transition-colors">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
