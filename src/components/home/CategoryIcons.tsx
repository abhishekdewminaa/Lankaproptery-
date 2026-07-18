import React from 'react';
import { motion } from 'motion/react';
import { LandPlot, Home, Building2, Building, Hotel, Briefcase } from 'lucide-react';

const CATEGORIES = [
  { icon: <LandPlot size={22} />, label: 'LAND' },
  { icon: <Home size={22} />, label: 'HOUSE' },
  { icon: <Building2 size={22} />, label: 'APARTMENT' },
  { icon: <Building size={22} />, label: 'BUILDING' },
  { icon: <Hotel size={22} />, label: 'HOTEL' },
  { icon: <Briefcase size={22} />, label: 'BUSINESS' },
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
    <section className="category-section">
      <div className="container">
        <div className="category-grid">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ 
                type: 'spring', 
                stiffness: 260, 
                damping: 20, 
                delay: idx * 0.05 
              }}
              onClick={() => handleCategoryClick(cat.label)}
              className="category-item"
            >
              <div className="category-icon">
                {cat.icon}
              </div>
              <span className="category-label">
                {cat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
