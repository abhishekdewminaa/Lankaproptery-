import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './Hero';
import { CategoryIcons } from './CategoryIcons';
import { FeaturedProperties } from './FeaturedProperties';
import { Testimonials } from './Testimonials';
import { ValuationCTA } from './ValuationCTA';
import { PriceCalculator } from './PriceCalculator';
import { RecentlyUpdatedProperties } from './RecentlyUpdatedProperties';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowUp } from 'lucide-react';
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
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-x-hidden" ref={containerRef}>
      <main className="flex-1 space-y-0">
        {/* 1. Hero Search Section */}
        <Hero 
          propertyCount={propertyCount} 
          onSearch={(filters) => onNavigate({ type: 'search_results', data: filters })} 
          onNavigate={onNavigate}
        />
        
        {/* 2. Browse by Category Section */}
        <motion.div {...fadeInUpOptions}>
          <CategoryIcons onNavigate={onNavigate} />
        </motion.div>
        
        {/* 3. Featured Properties Section */}
        <motion.div {...fadeInUpOptions}>
          <FeaturedProperties 
            properties={featuredProperties} 
            onNavigate={onNavigate}
          />
        </motion.div>

        {/* 3.5. Recently Updated Properties Section */}
        <motion.div {...fadeInUpOptions}>
          <RecentlyUpdatedProperties 
            properties={properties} 
            onNavigate={onNavigate}
          />
        </motion.div>

        {/* 4. Ready to Sell / Rent Promo Banner */}
        <motion.div {...fadeInUpOptions} className="py-8 bg-white" id="sell-rent-banner">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="bg-gradient-to-r from-[#032f17] to-[#0a4c28] rounded-[32px] p-8 sm:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl relative overflow-hidden">
              {/* Subtle ambient glowing background patterns */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#0a4225]/20 blur-[60px] rounded-full pointer-events-none" />

              <div className="space-y-3 max-w-2xl relative z-10 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  Ready to sell or rent your property?
                </h2>
                <p className="text-sm text-emerald-100/85 font-medium leading-relaxed">
                  Join thousands of owners who trust EstateFlow to reach premium buyers and tenants across the island. Professional photography and listing assistance included.
                </p>
              </div>
              
              <button 
                onClick={() => onNavigate({ type: 'packages' })}
                className="shrink-0 bg-white hover:bg-neutral-100 text-[#0a4225] text-sm font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all duration-300 shadow-lg relative z-10 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Post Your Property <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* 5. Customer Testimonials & Success Stories */}
        <motion.div {...fadeInUpOptions}>
          <Testimonials />
        </motion.div>

        {/* 6. Property Valuation Call to Action */}
        <motion.div {...fadeInUpOptions}>
          <ValuationCTA />
        </motion.div>

        {/* 7. Calculate Your Property Price (Online Property Price Indicator) */}
        <motion.div {...fadeInUpOptions}>
          <PriceCalculator />
        </motion.div>

        {/* 8. News & Insights Section */}
        <motion.div {...fadeInUpOptions}>
          <section className="py-12 bg-white border-t border-gray-50" id="news-and-insights">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
              {/* Header */}
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">News & Insights</h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Expert advice to help you navigate the real estate market.</p>
                </div>
                <button 
                  onClick={() => onNavigate({ type: 'blog' })}
                  className="flex items-center gap-1 text-[#0a4225] hover:text-[#072d19] font-bold text-sm transition-colors group cursor-pointer"
                >
                  Read All Guides <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* 3-Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div 
                  onClick={() => onNavigate({ type: 'blog' })}
                  className="bg-white rounded-md overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                    <img 
                      src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800" 
                      alt="Why Colombo 07 Remains the Safest Property Investment"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[10px] font-black text-[#0a4225] uppercase tracking-widest mb-3 block">
                      INVESTMENT
                    </span>
                    <h3 className="text-xl font-black text-gray-900 leading-snug mb-3 group-hover:text-[#0a4225] transition-colors line-clamp-2">
                      Why Colombo 07 Remains the Safest Property Investment
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                      Exploring the long-term capital appreciation trends in Sri Lanka's most prestigious residential district and why high-net-worth individuals continue to park their wealth here...
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-bold">
                      <span>July 17, 2026</span>
                      <span className="text-[#0a4225] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-extrabold">
                        Read Guide <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div 
                  onClick={() => onNavigate({ type: 'blog' })}
                  className="bg-white rounded-md overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                    <img 
                      src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800" 
                      alt="Sustainable Living: Modern Trends in Eco-Friendly Housing"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[10px] font-black text-[#0a4225] uppercase tracking-widest mb-3 block">
                      LIFESTYLE
                    </span>
                    <h3 className="text-xl font-black text-gray-900 leading-snug mb-3 group-hover:text-[#0a4225] transition-colors line-clamp-2">
                      Sustainable Living: Modern Trends in Eco-Friendly Housing
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                      How new developments are integrating green spaces, solar energy systems, and high-efficiency water recycling infrastructures directly into urban high-rise living...
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-bold">
                      <span>July 15, 2026</span>
                      <span className="text-[#0a4225] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-extrabold">
                        Read Guide <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div 
                  onClick={() => onNavigate({ type: 'blog' })}
                  className="bg-white rounded-md overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                    <img 
                      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" 
                      alt="First-Time Home Buyer's Checklist for 2024"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[10px] font-black text-[#0a4225] uppercase tracking-widest mb-3 block">
                      BUYING GUIDE
                    </span>
                    <h3 className="text-xl font-black text-gray-900 leading-snug mb-3 group-hover:text-[#0a4225] transition-colors line-clamp-2">
                      First-Time Home Buyer's Checklist for 2024
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                      Everything you need to know about checking deed clearances, working with local banks for mortgages, and performing rigorous physical structural inspections before signing...
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-bold">
                      <span>July 10, 2026</span>
                      <span className="text-[#0a4225] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-extrabold">
                        Read Guide <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
            className="fixed bottom-8 right-8 w-12 h-12 bg-[#0a4225] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#072d19] transition-all z-[100] active:scale-95 cursor-pointer"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

