import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './Hero';
import { CategoryIcons } from './CategoryIcons';
import { FeaturedProperties } from './FeaturedProperties';
import LatestAdvertisements from '../LatestAdvertisements';
import { Testimonials } from './Testimonials';
import { RecentListings } from './RecentListings';
import { PriceCalculator } from './PriceCalculator';
import { TrustedPartners } from './TrustedPartners';
import { HomeServices } from './HomeServices';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import Lenis from 'lenis';

interface HomeRedesignProps {
  propertyCount: number;
  featuredProperties: any[];
  properties?: any[];
  onNavigate: (view: any) => void;
  onPostAd?: () => void;
  onAdminAccess?: () => void;
}

export const HomeRedesign: React.FC<HomeRedesignProps> = ({
  propertyCount,
  featuredProperties,
  properties = [],
  onNavigate,
  onPostAd,
  onAdminAccess
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if in iframe to prevent Lenis from hijacking scroll and breaking inside parent frame wrappers
    let isInIframe = false;
    try {
      isInIframe = window.self !== window.top;
    } catch (e) {
      isInIframe = true;
    }
    let lenis: any = null;

    if (!isInIframe) {
      try {
        // Initialize Lenis smooth scrolling
        lenis = new Lenis({
          autoRaf: true,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } catch (e) {
        console.warn("Lenis init failed:", e);
      }
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fadeInUpOptions: any = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-sage overflow-x-hidden" ref={containerRef}>
      <main>
        <Hero 
          propertyCount={propertyCount} 
          onSearch={(filters) => onNavigate({ type: 'search_results', data: filters })} 
          onNavigate={onNavigate}
        />
        
        <motion.div {...fadeInUpOptions}>
          <CategoryIcons onNavigate={onNavigate} />
        </motion.div>
        
        <HomeServices onNavigate={onNavigate} />
        
        <motion.div {...fadeInUpOptions}>
          <FeaturedProperties 
            properties={featuredProperties} 
            onNavigate={onNavigate}
          />
        </motion.div>
        
        <motion.div {...fadeInUpOptions} className="container mx-auto px-6 py-6 max-w-7xl">
          <LatestAdvertisements limit={8} onNavigate={onNavigate} />
        </motion.div>
        
        <motion.div {...fadeInUpOptions}>
          <Testimonials />
        </motion.div>
        
        <motion.div {...fadeInUpOptions}>
          <RecentListings 
            onNavigate={onNavigate}
            properties={properties}
          />
        </motion.div>
        
        <motion.div {...fadeInUpOptions}>
          <PriceCalculator />
        </motion.div>
        
        <motion.div {...fadeInUpOptions}>
          <TrustedPartners />
        </motion.div>
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
