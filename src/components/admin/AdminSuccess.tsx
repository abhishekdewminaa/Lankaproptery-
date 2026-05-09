import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Share2, ArrowRight, ExternalLink, Globe } from 'lucide-react';

interface AdminSuccessProps {
  property: any;
  onBackToPortal: () => void;
}

export default function AdminSuccess({ property, onBackToPortal }: AdminSuccessProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="max-w-xl w-full text-center space-y-10">
        {/* Success Icon */}
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

        {/* Message */}
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

        {/* Property Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-[40px] border-2 border-admin-border shadow-xl flex gap-6 items-center text-left hover:border-admin-secondary transition-colors group cursor-pointer"
        >
          <div className="w-24 h-24 rounded-3xl bg-gray-100 overflow-hidden shrink-0 border border-admin-border">
             <img 
              src={property?.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              alt="Property" 
            />
          </div>
          <div className="flex-grow min-w-0">
             <div className="text-[10px] font-black text-admin-secondary uppercase tracking-[0.2em] mb-1">Active Listing</div>
             <h3 className="text-xl font-black text-admin-text-dark line-clamp-1 mb-1">{property?.title || 'Luxury Villa'}</h3>
             <p className="text-sm font-bold text-admin-text-gray">{property?.location || 'Colombo, Sri Lanka'}</p>
          </div>
          <div className="p-3 bg-admin-bg rounded-2xl text-admin-text-gray group-hover:bg-admin-secondary group-hover:text-white transition-colors">
             <ExternalLink size={20} />
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
           <button 
             onClick={onBackToPortal}
             className="flex-1 bg-admin-primary text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-admin-primary/20 hover:bg-admin-secondary transition-all"
           >
             Back to Dashboard
             <ArrowRight size={18} />
           </button>
           <button className="flex-1 bg-white text-admin-text-dark border-2 border-admin-border py-5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
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
