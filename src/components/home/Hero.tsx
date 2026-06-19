import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, ChevronDown, Activity, Trash2, Sparkles, Loader2, Bot, Mic } from 'lucide-react';
import { getSmartSearchFilters } from '../../services/geminiService';
import { DISTRICTS_BY_PROVINCE } from '../../constants/districts';

interface HeroProps {
  propertyCount: number;
  onSearch: (filters: any) => void;
  onNavigate?: (view: any) => void;
}

export const Hero: React.FC<HeroProps> = ({ propertyCount, onSearch, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'sale' | 'rent' | 'lease'>('sale');
  const [isAISearch, setIsAISearch] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bilingualIndex, setBilingualIndex] = useState(0);

  const bilingualTexts = [
    "Call voice Assistant",
    "හඬ සහායකය අමතන්න (සිංහල)"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBilingualIndex((prev) => (prev === 0 ? 1 : 0));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleAISearch = async () => {
    if (!aiQuery.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const filters = await getSmartSearchFilters(aiQuery);
      if (filters) {
        onSearch(filters);
      }
    } catch (error) {
      console.error("AI Search failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
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
          className="max-w-5xl mx-auto bg-white rounded-[24px] shadow-2xl p-6 md:p-10"
        >
          {/* Row 1 - Type Tabs & AI Toggle */}
          <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
            <div className="flex relative bg-[#004F31] p-1.5 rounded-2xl w-full lg:w-max shrink-0 shadow-inner overflow-hidden">
              {[
                { id: 'sale', label: '🏠 For Sale' },
                { id: 'rent', label: '🔑 For Rent' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative z-10 flex-1 lg:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap outline-none ${
                        isActive 
                        ? 'text-[#004F31]' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabHero"
                        className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
                        initial={false}
                        transition={{
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <motion.span 
                      className="relative z-10 block"
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                    >
                      {tab.label}
                    </motion.span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              <motion.button 
                onClick={() => setIsAISearch(!isAISearch)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96, y: 1 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full border-2 transition-colors font-black text-xs uppercase tracking-wider whitespace-nowrap shrink-0 h-[48px] ${
                  isAISearch 
                    ? 'bg-brand-green/10 border-brand-green text-brand-green shadow-[0_4px_14px_0_rgba(0,105,65,0.15)]' 
                    : 'border-gray-200 text-gray-500 hover:text-brand-green hover:bg-gray-50 shadow-sm hover:shadow-[0_4px_14px_0_rgba(0,105,65,0.1)]'
                }`}
              >
                <Sparkles size={16} className={isAISearch ? 'animate-pulse shrink-0' : 'shrink-0'} />
                <span>AI Smart Search</span>
              </motion.button>
              
              <motion.a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  const currentLang = bilingualIndex === 1 ? 'open-si' : 'open';
                  window.dispatchEvent(new CustomEvent('voice-command', { detail: currentLang }));
                }} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-brand-navy hover:bg-brand-navy/90 text-[#00FF87] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-3 px-6 py-3 rounded-full border-2 border-[#00FF87]/30 select-none cursor-pointer shadow-lg shadow-[#00FF87]/10 shrink-0 h-[48px]"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF87] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF87]"></span>
                </span>
                <Mic size={16} className="text-[#00FF87] shrink-0" />
                <div className="w-[185px] overflow-hidden text-left flex items-center shrink-0">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={bilingualIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="block truncate font-extrabold text-[#00FF87]"
                    >
                      {bilingualTexts[bilingualIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="shrink-0">↗</motion.span>
              </motion.a>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isAISearch ? (
              <motion.div
                key="ai-search"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4"
              >
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-green">
                    <Bot size={24} className="animate-bounce" />
                  </div>
                  <input 
                    type="text" 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                    placeholder="e.g. 'I want a 3 bedroom house in Colombo under 50 million with a pool'"
                    className="w-full bg-brand-green/[0.03] border-2 border-brand-green/20 focus:border-brand-green rounded-2xl py-6 pl-16 pr-32 text-lg font-medium outline-none transition-all placeholder:text-gray-400"
                  />
                  <button 
                    onClick={handleAISearch}
                    disabled={!aiQuery.trim() || isAnalyzing}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-green text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-green-dark transition-all shadow-lg disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : "Analyze"}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3 ml-2">
                  <Sparkles size={12} className="text-brand-green" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Try: "Luxury villa in Galle for lease" or "Modern flat in Kandy 20M"</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="normal-search"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
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
                        <option value="">All Districts</option>
                        {Object.entries(DISTRICTS_BY_PROVINCE).map(([province, districts]) => (
                          <optgroup key={province} label={province}>
                            {districts.map(district => (
                              <option key={district} value={district}>{district}</option>
                            ))}
                          </optgroup>
                        ))}
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
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ 
                      boxShadow: [
                        "0 10px 20px -5px rgba(0, 79, 49, 0.2)",
                        "0 10px 30px 5px rgba(0, 79, 49, 0.4)",
                        "0 10px 20px -5px rgba(0, 79, 49, 0.2)"
                      ],
                      x: [0, -2, 2, -2, 2, 0],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{
                      boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                      x: { duration: 0.5, repeat: Infinity, repeatDelay: 3 },
                      opacity: { duration: 1, repeat: Infinity, repeatDelay: 5 }
                    }}
                    className="w-full md:w-auto md:min-w-[200px] h-[52px] bg-brand-green hover:bg-brand-green-medium text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-green/20"
                  >
                    <Search size={18} strokeWidth={3} /> Search Now
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
