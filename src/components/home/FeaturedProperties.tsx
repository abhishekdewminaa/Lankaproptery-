import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, TrendingUp, Sparkles, ChevronRight, Play, Pause } from 'lucide-react';

interface Property {
  id: number;
  listing_title: string;
  price_lkr: string | number;
  city: string;
  images: string[];
  trending?: boolean;
  luxury?: boolean;
  is_featured?: boolean;
  package_tier?: string;
  image?: string;
}

interface FeaturedPropertiesProps {
  properties: Property[];
  onNavigate: (view: any) => void;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ properties, onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Use provided properties or fallback to defaults, ensuring we always have at least 4
  const FALLBACK: Property[] = [
    { id: 1, listing_title: 'Skyline Penthouse, Colombo 03', price_lkr: 'Rs. 185,000,000', city: 'Colombo 03', images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'], trending: true, luxury: true, package_tier: 'Elite Pro' },
    { id: 2, listing_title: 'Beachfront Villa, Galle', price_lkr: 'Rs. 86,000,000', city: 'Galle', images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800'], package_tier: 'Premium Pro' },
    { id: 3, listing_title: 'Modern Condo, Rajagiriya', price_lkr: 'Rs. 42,000,000', city: 'Rajagiriya', images: ['https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=800'], package_tier: 'Standard' },
    { id: 4, listing_title: 'Family Estate, Kandy', price_lkr: 'Rs. 35,000,000', city: 'Kandy', images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'], package_tier: 'Standard' },
  ];

  const displayProperties = properties.length >= 4 
    ? properties.slice(0, 4) 
    : [...properties, ...FALLBACK.slice(properties.length, 4)];

  const AUTOPLAY_DURATION = 5000; // 5 seconds

  useEffect(() => {
    if (isPaused) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    const startTime = Date.now();
    const interval = 50; // Update progress every 50ms
    
    autoPlayRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / AUTOPLAY_DURATION) * 100;
      
      if (newProgress >= 100) {
        setProgress(0);
        setActiveIndex((prev) => (prev + 1) % displayProperties.length);
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      } else {
        setProgress(newProgress);
      }
    }, interval);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [activeIndex, isPaused, displayProperties.length]);

  const currentMain = displayProperties[activeIndex];
  // Other slots show indices in order
  const secondaryIndex1 = (activeIndex + 1) % displayProperties.length;
  const secondaryIndex2 = (activeIndex + 2) % displayProperties.length;
  const secondaryIndex3 = (activeIndex + 3) % displayProperties.length;

  return (
    <section 
      className="py-16 bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Featured Properties</h2>
            
            {/* Auto-play Indicator (Progress Bubble) */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-100"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * progress) / 100}
                  className="text-brand-green transition-all duration-75"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {isPaused ? <Pause size={12} className="text-gray-400" /> : <Play size={12} className="text-brand-green fill-brand-green" />}
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate({ type: 'featured' })}
            className="flex items-center gap-2 text-brand-green font-black text-sm uppercase tracking-widest hover:text-brand-green-dark transition-all group"
          >
            View All Featured <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">
          {/* Main Large Card (Slot 1) */}
          <div className="md:col-span-2 md:row-span-2 relative h-full">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                onClick={() => onNavigate({ type: 'detail', data: currentMain })}
                className="absolute inset-0 group rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
              >
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img 
                    src={currentMain.images?.[0] || currentMain.image as any} 
                    className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110" 
                    alt={currentMain.listing_title}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                <div className="absolute top-6 left-6 z-20 flex gap-2">
                  {(currentMain.trending || currentMain.package_tier === 'Elite Pro') && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                      <TrendingUp size={12} /> TRENDING
                    </span>
                  )}
                  {(currentMain.luxury || currentMain.package_tier === 'Premium Pro') && (
                    <span className="bg-brand-green text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                      <Sparkles size={12} /> LUXURY
                    </span>
                  )}
                </div>
                <div className="absolute bottom-10 left-10 z-20 pr-10">
                  <h3 className="text-3xl font-black text-white mb-2 leading-tight drop-shadow-md">
                    {currentMain.listing_title}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-brand-green font-black text-3xl tracking-tight">
                      {typeof currentMain.price_lkr === 'number' ? `Rs. ${currentMain.price_lkr.toLocaleString()}` : currentMain.price_lkr}
                    </div>
                    <div className="text-white/60 font-bold text-sm flex items-center gap-1 uppercase tracking-widest">
                      {currentMain.city}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slot 2 (Right Top) */}
          <motion.div 
            layout
            key={secondaryIndex1}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => onNavigate({ type: 'detail', data: displayProperties[secondaryIndex1] })}
            className="md:col-span-2 relative group rounded-3xl overflow-hidden shadow-xl cursor-pointer"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img 
                src={displayProperties[secondaryIndex1].images?.[0] || displayProperties[secondaryIndex1].image as any} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={displayProperties[secondaryIndex1].listing_title}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <div className="absolute bottom-6 left-6 z-20">
              <h3 className="text-xl font-black text-white mb-1 drop-shadow-md">
                {displayProperties[secondaryIndex1].listing_title}
              </h3>
              <div className="text-brand-green font-black text-lg">
                {typeof displayProperties[secondaryIndex1].price_lkr === 'number' ? `Rs. ${displayProperties[secondaryIndex1].price_lkr.toLocaleString()}` : displayProperties[secondaryIndex1].price_lkr}
              </div>
            </div>
          </motion.div>

          {/* Slot 3 (Bottom Mid) */}
          <motion.div 
            layout
            key={secondaryIndex2}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => onNavigate({ type: 'detail', data: displayProperties[secondaryIndex2] })}
            className="relative group rounded-3xl overflow-hidden shadow-lg cursor-pointer"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img 
                src={displayProperties[secondaryIndex2].images?.[0] || displayProperties[secondaryIndex2].image as any} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={displayProperties[secondaryIndex2].listing_title}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
            <div className="absolute bottom-4 left-4 z-20">
              <h4 className="text-sm font-black text-white mb-0.5 drop-shadow-md line-clamp-1">
                {displayProperties[secondaryIndex2].listing_title}
              </h4>
              <div className="text-brand-green font-black text-xs">
                {typeof displayProperties[secondaryIndex2].price_lkr === 'number' ? `Rs. ${displayProperties[secondaryIndex2].price_lkr.toLocaleString()}` : displayProperties[secondaryIndex2].price_lkr}
              </div>
            </div>
          </motion.div>

          {/* Slot 4 (Bottom Right) */}
          <motion.div 
            layout
            key={secondaryIndex3}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => onNavigate({ type: 'detail', data: displayProperties[secondaryIndex3] })}
            className="relative group rounded-3xl overflow-hidden shadow-lg cursor-pointer"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img 
                src={displayProperties[secondaryIndex3].images?.[0] || displayProperties[secondaryIndex3].image as any} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={displayProperties[secondaryIndex3].listing_title}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
            <div className="absolute bottom-4 left-4 z-20">
              <h4 className="text-sm font-black text-white mb-0.5 drop-shadow-md line-clamp-1">
                {displayProperties[secondaryIndex3].listing_title}
              </h4>
              <div className="text-brand-green font-black text-xs">
                {typeof displayProperties[secondaryIndex3].price_lkr === 'number' ? `Rs. ${displayProperties[secondaryIndex3].price_lkr.toLocaleString()}` : displayProperties[secondaryIndex3].price_lkr}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center mt-8 gap-3">
          {displayProperties.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIndex(idx);
                setProgress(0);
              }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-8 bg-brand-green' : 'w-2.5 bg-gray-200 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

