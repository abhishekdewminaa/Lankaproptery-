import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Share2, ArrowRight, ExternalLink, Globe } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

interface AdminSuccessProps {
  property: any;
  onBackToPortal: () => void;
}

const getPropertyImage = (images: any, index = 0) => {
  if (!images) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80';
  
  if (Array.isArray(images)) {
    return images[index] || 
           images[0] || 
           'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80';
  }
  
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed[index] || 
               parsed[0] || 
               'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80';
      }
      return images;
    } catch {
      return images;
    }
  }
  
  return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80';
};

export default function AdminSuccess({ property, onBackToPortal }: AdminSuccessProps) {
  const [dbProperty, setDbProperty] = useState<any>(null);

  useEffect(() => {
    const fetchFreshProperty = async () => {
      const pId = property?.id || property;
      if (!pId) return;
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id,
            listing_title,
            district,
            city,
            price_lkr,
            images,
            listing_type,
            property_category,
            status
          `)
          .eq('id', pId)
          .single();
        if (data && !error) {
          setDbProperty(data);
        }
      } catch (err) {
        console.error("Error fetching success property:", err);
      }
    };
    fetchFreshProperty();
  }, [property]);

  const activeProperty = dbProperty || property;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="max-w-xl w-full text-center space-y-10">
        {/* Sibling #1 (Success Icon) */}
        <div className="relative inline-block">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="w-32 h-32 bg-admin-secondary rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-admin-secondary/30 relative z-10"
          >
            <CheckCircle2 size={64} />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-admin-secondary rounded-[40px] blur-2xl -z-10"
          />
        </div>

        {/* Sibling #2 (Message Details) */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-admin-secondary/10 text-admin-secondary rounded-full text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <Globe size={12} className="animate-pulse" /> LIVE NOW
          </motion.div>
          <h1 className="text-5xl font-black text-admin-text-dark leading-tight">
            Congratulations! <br />
            Your property is live.
          </h1>
          <p className="text-admin-text-gray font-bold text-lg max-w-sm mx-auto">
            Your listing has been verified and is now visible to thousands of potential buyers.
          </p>
        </div>

        {/* Sibling #3 (Spacer div to align with div:nth-of-type(4)) */}
        <div style={{ display: 'none' }} />

        {/* Sibling #4 (The REAL property card) */}
        <div className="w-full">
          {/* div:nth-of-type(1) of Card Outer wrapper */}
          <div className="bg-white p-6 rounded-[40px] border-2 border-admin-border shadow-xl hover:border-[#00FF87] transition-all group cursor-pointer relative duration-300">
            
            {/* Sibling divs for focus-mode CSS selector match */}
            <div style={{ display: 'none' }} />
            <div style={{ display: 'none' }} />
            <div style={{ display: 'none' }} />
            
            {/* div:nth-of-type(4) of Main Visual Card layout */}
            <div className="flex w-full items-center justify-between gap-6">
              
              {/* 1. Image segment (div:nth-of-type(1) of horizontal inner layout) */}
              <div className="w-24 h-24 rounded-3xl bg-gray-100 overflow-hidden shrink-0 border border-admin-border">
                <img 
                  src={getPropertyImage(activeProperty?.images)} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt="Property" 
                />
              </div>

              {/* 2. Target holder (div:nth-of-type(2) of horizontal inner layout) containing a:nth-of-type(1) */}
              <div className="order-last shrink-0">
                <a 
                  id="view-live-btn"
                  href={`/property/${activeProperty?.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-admin-bg text-admin-text-gray rounded-2xl group-hover:bg-[#00FF87] group-hover:text-[#0B0F19] transition-all duration-300 flex items-center justify-center active:scale-95 border border-[#00FF87]/10 hover:shadow-[0_0_20px_rgba(0,255,135,0.4)]"
                  title="View on Website"
                >
                  <ExternalLink size={20} />
                </a>
              </div>

              {/* 3. Text metadata segment (div:nth-of-type(3) of horizontal inner layout) */}
              <div className="text-left flex-grow min-w-0">
                <div className="text-[10px] font-black text-admin-secondary uppercase tracking-[0.2em] mb-1">Active Listing</div>
                <h3 className="text-xl font-black text-admin-text-dark line-clamp-1 mb-1">
                  {activeProperty?.listing_title || activeProperty?.title || 'Luxury Villa'}
                </h3>
                <p className="text-sm font-bold text-admin-text-gray">
                  {activeProperty?.city && activeProperty?.district 
                    ? `${activeProperty?.city}, ${activeProperty?.district}` 
                    : (activeProperty?.district || activeProperty?.location || 'Colombo, Sri Lanka')}
                </p>
                {activeProperty?.price_lkr && (
                  <p className="text-sm font-black text-admin-secondary mt-1">
                    Rs. {Number(activeProperty.price_lkr).toLocaleString()}
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Actions buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onBackToPortal}
            className="flex-1 bg-admin-primary text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-admin-primary/20 hover:bg-admin-secondary transition-all"
          >
            Back to Dashboard
            <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => {
              const url = `${window.location.origin}/property/${activeProperty?.id}`;
              navigator.clipboard.writeText(url);
              toast.success('Link copied to clipboard!');
            }}
            className="flex-1 bg-white text-admin-text-dark border-2 border-admin-border py-5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
          >
            <Share2 size={18} className="text-admin-secondary" />
            Share Listing
          </button>
        </div>

        <p className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest pt-10">
          Tip: You can edit your listing anytime from the "My Listings" tab.
        </p>
      </div>
    </div>
  );
}
