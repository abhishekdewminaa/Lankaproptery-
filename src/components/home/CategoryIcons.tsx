import React from 'react';
import { motion } from 'motion/react';
import { LandPlot, Home, Building2, Building, Hotel, Briefcase } from 'lucide-react';

const CATEGORIES = [
  { icon: <LandPlot size={32} />, label: 'LAND' },
  { icon: <Home size={32} />, label: 'HOUSE' },
  { icon: <Building2 size={32} />, label: 'APARTMENT' },
  { icon: <Building size={32} />, label: 'BUILDING' },
  { icon: <Hotel size={32} />, label: 'HOTEL' },
  { icon: <Briefcase size={32} />, label: 'BUSINESS' },
];

interface CategoryIconsProps {
  onNavigate?: (view: any) => void;
}

export const CategoryIcons: React.FC<CategoryIconsProps> = ({ onNavigate }) => {
  const handleCategoryClick = (label: string) => {
    let cat = label.charAt(0) + label.slice(1).toLowerCase(); // Default: House, Land, etc.
    if (label === 'BUSINESS') cat = 'Commercial';
    
    if (onNavigate) {
      onNavigate({ type: 'category', data: { category: cat, mode: 'buy' } });
      const path = `/buy/${cat.toLowerCase()}`;
      window.history.pushState({}, '', path);
    }
  };

  return (
    <section className="py-12 md:py-20 bg-[#F8FAF8]">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ 
                type: 'spring', 
                stiffness: 260, 
                damping: 20, 
                delay: idx * 0.08 
              }}
              whileHover={{ scale: 1.1, y: -5 }}
              onClick={() => handleCategoryClick(cat.label)}
              className="flex flex-col items-center gap-4 group cursor-pointer"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-green/5 rounded-full flex items-center justify-center text-brand-green transition-all group-hover:bg-brand-green group-hover:text-white shadow-sm">
                {cat.icon}
              </div>
              <span className="text-[10px] md:text-xs font-black text-gray-500 tracking-widest uppercase transition-colors group-hover:text-brand-green">
                {cat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
