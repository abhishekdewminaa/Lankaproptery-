import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react';

interface Property {
  id: number;
  listing_title: string;
  price_lkr: string | number;
  city: string;
  images: string[];
  image?: string;
  trending?: boolean;
  luxury?: boolean;
}

interface FeaturedPropertiesProps {
  properties: Property[];
  onNavigate: (view: any) => void;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ properties, onNavigate }) => {
  // Use provided properties or fallback to defaults
  const displayProperties = properties.length >= 4 ? properties.slice(0, 4) : [
    { id: 1, listing_title: 'Skyline Penthouse, Colombo 03', price_lkr: 'Rs. 185,000,000', city: 'Colombo 03', images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'], trending: true, luxury: true },
    { id: 2, listing_title: 'Beachfront Villa, Galle', price_lkr: 'Rs. 86,000,000', city: 'Galle', images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800'] },
    { id: 3, listing_title: 'Modern Condo, Rajagiriya', price_lkr: 'Rs. 42,000,000', city: 'Rajagiriya', images: ['https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=800'] },
    { id: 4, listing_title: 'Family Estate, Kandy', price_lkr: 'Rs. 35,000,000', city: 'Kandy', images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'] },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Properties</h2>
            <p className="text-gray-500 font-medium">Handpicked premium listings in Colombo & Beyond</p>
          </div>
          <a href="#" className="hidden md:flex items-center gap-2 text-brand-green font-bold hover:underline transition-all group">
            View All <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[700px]">
          {/* Main Large Card */}
          <motion.div 
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onClick={() => onNavigate({ type: 'detail', data: displayProperties[0] })}
            className="md:col-span-2 md:row-span-2 relative group rounded-3xl overflow-hidden shadow-xl cursor-pointer"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
               <img 
                src={displayProperties[0].images?.[0] || displayProperties[0].image as any} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={displayProperties[0].listing_title}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
            <div className="absolute top-6 left-6 z-20 flex gap-2">
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                <TrendingUp size={12} /> TRENDING
              </span>
              <span className="bg-brand-green text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles size={12} /> LUXURY
              </span>
            </div>
            <div className="absolute bottom-10 left-10 z-20">
              <h3 className="text-3xl font-bold text-white mb-2 leading-tight max-w-sm drop-shadow-md">
                {displayProperties[0].listing_title}
              </h3>
              <div className="text-brand-green font-black text-2xl tracking-tight">
                {displayProperties[0].price_lkr}
              </div>
            </div>
          </motion.div>

          {/* Right Top Card */}
          <motion.div 
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            onClick={() => onNavigate({ type: 'detail', data: displayProperties[1] })}
            className="md:col-span-2 relative group rounded-3xl overflow-hidden shadow-xl cursor-pointer"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img 
                src={displayProperties[1].images?.[0] || displayProperties[1].image as any} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 alt={displayProperties[1].listing_title}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <div className="absolute bottom-6 left-6 z-20">
              <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md">
                {displayProperties[1].listing_title}
              </h3>
              <div className="text-brand-green font-black text-lg">
                {displayProperties[1].price_lkr}
              </div>
            </div>
          </motion.div>

          {/* Bottom Left Small Card */}
          <motion.div 
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            onClick={() => onNavigate({ type: 'detail', data: displayProperties[2] })}
            className="relative group rounded-3xl overflow-hidden shadow-lg cursor-pointer"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
               <img 
                src={displayProperties[2].images?.[0] || displayProperties[2].image as any} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={displayProperties[2].listing_title}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <div className="absolute bottom-6 left-6 z-20">
              <h4 className="text-sm font-bold text-white mb-0.5 drop-shadow-md">
                {displayProperties[2].listing_title}
              </h4>
            </div>
          </motion.div>

          {/* Bottom Right Small Card */}
          <motion.div 
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
            onClick={() => onNavigate({ type: 'detail', data: displayProperties[3] })}
            className="relative group rounded-3xl overflow-hidden shadow-lg cursor-pointer"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
               <img 
                src={displayProperties[3].images?.[0] || displayProperties[3].image as any} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={displayProperties[3].listing_title}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <div className="absolute bottom-6 left-6 z-20">
              <h4 className="text-sm font-bold text-white mb-0.5 drop-shadow-md">
                {displayProperties[3].listing_title}
              </h4>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
