import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { CategoryIcons } from './CategoryIcons';
import { FeaturedProperties } from './FeaturedProperties';
import { Testimonials } from './Testimonials';
import { RecentListings } from './RecentListings';
import { PriceCalculator } from './PriceCalculator';
import { TrustedPartners } from './TrustedPartners';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

interface HomeRedesignProps {
  propertyCount: number;
  featuredProperties: any[];
  supabaseProperties: any[];
  onNavigate: (view: any) => void;
  onPostAd: () => void;
  onAdminAccess: () => void;
}

export const HomeRedesign: React.FC<HomeRedesignProps> = ({
  propertyCount,
  featuredProperties,
  supabaseProperties,
  onNavigate,
  onPostAd,
  onAdminAccess,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-sage overflow-x-hidden">
      <Navbar 
        onPostAd={onPostAd} 
        onNavigateHome={() => {
          onNavigate({ type: 'home' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        onAdminAccess={onAdminAccess} 
        onNavigate={onNavigate}
      />
      
      <main>
        <Hero 
          propertyCount={propertyCount} 
          onSearch={(filters) => onNavigate({ type: 'search_results', data: filters })} 
        />
        
        <CategoryIcons onNavigate={onNavigate} />
        
        <FeaturedProperties properties={featuredProperties} />
        
        <Testimonials />
        
        <RecentListings />
        
        <PriceCalculator />
        
        <TrustedPartners />
      </main>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-brand-green text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-brand-green-medium transition-all z-[100] active:scale-95"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
