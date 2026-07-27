import React from 'react';
import { Home, Building2, LandPlot, Building } from 'lucide-react';
import { motion } from 'motion/react';

const CATEGORIES = [
  { 
    id: 'house', 
    icon: <Home className="w-6 h-6 text-[#0a4225]" />, 
    label: 'Houses' 
  },
  { 
    id: 'apartment', 
    icon: <Building2 className="w-6 h-6 text-[#0a4225]" />, 
    label: 'Apartments' 
  },
  { 
    id: 'land', 
    icon: <LandPlot className="w-6 h-6 text-[#0a4225]" />, 
    label: 'Land' 
  },
  { 
    id: 'commercial', 
    icon: <Building className="w-6 h-6 text-[#0a4225]" />, 
    label: 'Commercial' 
  },
];

interface CategoryIconsProps {
  onNavigate?: (view: any) => void;
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

export const CategoryIcons: React.FC<CategoryIconsProps> = ({ onNavigate }) => {
  const handleCategoryClick = (id: string) => {
    let cat = id.charAt(0).toUpperCase() + id.slice(1);
    if (id === 'commercial') cat = 'Commercial';
    
    if (onNavigate) {
      onNavigate({ type: 'category', data: { category: cat, mode: 'buy' } });
      const path = `/buy/${id}`;
      window.history.pushState({}, '', path);
    }
  };

  return (
    <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 bg-[#f8fafc]" id="browse-by-category">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Browse by Category</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Explore properties by type across Sri Lanka.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick(cat.id)}
              className="bg-white rounded-md border border-gray-100 p-6 shadow-sm hover:border-gray-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-[#ecfdf5] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                {cat.icon}
              </div>
              <span className="font-bold text-gray-800 text-sm tracking-wide">
                {cat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

