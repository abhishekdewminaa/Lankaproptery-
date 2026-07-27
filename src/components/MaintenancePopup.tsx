import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  ShieldAlert, 
  RefreshCw,
  Lock,
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MaintenancePopupProps {
  isOpen?: boolean;
  onClose?: () => void;
  maintenanceMessage?: string;
}

export const MaintenancePopup: React.FC<MaintenancePopupProps> = ({
  isOpen: externalIsOpen = true,
  maintenanceMessage = "Lands.lk is currently undergoing essential system maintenance and database upgrades to serve you better."
}) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Lock scrolling completely on body & html when maintenance mode is active
  useEffect(() => {
    if (externalIsOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyTouch = document.body.style.touchAction;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.touchAction = originalBodyTouch;
      };
    }
  }, [externalIsOpen]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.loading('Checking system status...', { id: 'status-check' });
    setTimeout(() => {
      setIsRefreshing(false);
      toast.error('System is still in maintenance mode. Please try again shortly.', { id: 'status-check' });
    }, 1500);
  };

  if (!externalIsOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl select-none overflow-hidden touch-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-200/50 overflow-hidden my-auto pointer-events-auto"
        >
          {/* Top Accent Gradient Bar */}
          <div className="h-3 bg-gradient-to-r from-amber-500 via-emerald-600 to-[#0a4225]" />

          {/* Modal Body */}
          <div className="p-6 sm:p-8 text-center">
            {/* Animated Icon Circle */}
            <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping opacity-75" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 via-amber-50 to-emerald-50 border border-amber-200 shadow-inner" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a4225] to-[#125833] flex items-center justify-center shadow-xl text-amber-300">
                <Wrench size={28} className="animate-spin-slow" />
              </div>
            </div>

            {/* Lock Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-[11px] font-black uppercase tracking-widest mb-3">
              <Lock size={13} className="text-amber-700 shrink-0" />
              <span>Full System Maintenance Mode</span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
              Website Under Maintenance
            </h2>

            {/* Main Message */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mb-6 max-w-md mx-auto">
              {maintenanceMessage} All user actions, navigation, and data submissions are temporarily paused.
            </p>

            {/* Status Box */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8.5 h-8.5 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Lockdown Active</div>
                  <div className="text-xs font-semibold text-slate-700 leading-snug mt-0.5">
                    Page access and interactions are locked to protect data integrity. Services will resume automatically once system updates finish.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex-1 bg-[#0a4225] hover:bg-[#072d19] text-white py-3.5 px-5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#0a4225]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
              >
                <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? 'Checking Status...' : 'Check Status'}</span>
              </button>

              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-3.5 px-5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer no-underline border border-slate-200"
              >
                <MessageCircle size={15} className="text-emerald-600" />
                <span>Support</span>
              </a>
            </div>

            {/* Footer notice */}
            <p className="text-[10px] text-slate-400 font-medium mt-4">
              Lands.lk System Operations • All rights reserved
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

