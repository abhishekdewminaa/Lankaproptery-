import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Share2, ArrowRight, ExternalLink, Globe, MapPin, Bed, Bath } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';
import { slugify } from '../../utils/safeUtils';

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
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100/50 mb-6 group cursor-pointer transition-all hover:shadow-[0_4px_30px_rgba(0,0,0,0.15)] focus-within::shadow-[0_4px_30px_rgba(0,0,0,0.15)] relative">
            
            {/* MAIN IMAGE - Full width at top */}
            <div className="w-full h-[220px] relative overflow-hidden bg-gray-100 z-0">
              {!activeProperty ? (
                // Skeleton while loading
                <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
              ) : getPropertyImage(activeProperty?.images) ? (
                // Real uploaded image
                <img
                  src={getPropertyImage(activeProperty?.images)}
                  alt={activeProperty?.listing_title}
                  className="w-full h-full object-cover animate-fade-in group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                // Placeholder if no image
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                  <span className="text-5xl">🏠</span>
                  <span className="text-sm font-semibold">Property Image</span>
                </div>
              )}

              {/* ACTIVE LISTING badge on image */}
              <div className="absolute top-3 left-3 bg-[#004F31]/90 text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wider z-10">
                ACTIVE LISTING
              </div>

              {/* View on website button */}
              <a
                id="view-live-btn"
                href={`/property/${activeProperty?.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 bg-white border-none rounded-lg p-1.5 cursor-pointer text-gray-700 hover:text-black hover:bg-gray-50 flex items-center justify-center shadow-sm z-10 active:scale-95 transition-transform"
                title="View on Website"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={20} />
              </a>
            </div>

            {/* Property details below image */}
            <div className="p-5 text-left bg-white relative z-10">
              
              {/* Property title */}
              <h3 className="m-0 mb-1.5 text-lg font-bold text-gray-900 truncate">
                {activeProperty?.listing_title || activeProperty?.title || 'Property Listing'}
              </h3>

              {/* Location */}
              <p className="m-0 mb-3 text-sm text-gray-500 flex items-center gap-1.5 truncate font-medium">
                <MapPin size={14} className="shrink-0" />
                {[activeProperty?.city, activeProperty?.district, 'Sri Lanka']
                  .filter(Boolean)
                  .join(', ')}
              </p>

              {/* Price + specs row */}
              <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-50">
                <span className="text-[#004F31] font-bold text-lg leading-none">
                  {activeProperty?.price_lkr 
                    ? `Rs. ${Number(activeProperty.price_lkr).toLocaleString()}`
                    : 'Price on Request'}
                </span>

                <div className="flex gap-4 text-gray-500 text-sm font-semibold">
                  {activeProperty?.rooms > 0 && (
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Bed size={16} /> {activeProperty.rooms}
                    </span>
                  )}
                  {activeProperty?.bathrooms > 0 && (
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Bath size={16} /> {activeProperty.bathrooms}
                    </span>
                  )}
                </div>
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
              const slug = activeProperty?.listing_title ? slugify(activeProperty.listing_title) : 'property';
              const url = `${window.location.origin}/property/${activeProperty?.id}/${slug}`;
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
