import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Calendar, Receipt, Download, LayoutDashboard, PlusCircle, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OwnerPaymentSuccessPageProps {
  onNavigate: (view: any) => void;
  data?: {
    plan?: string;
    price?: number;
    orderId?: string;
  };
}

export const OwnerPaymentSuccessPage: React.FC<OwnerPaymentSuccessPageProps> = ({ onNavigate, data }) => {
  const [countdown, setCountdown] = useState(10);
  
  const plan = data?.plan || new URLSearchParams(window.location.search).get('plan') || 'premium_pro';
  const price = data?.price || Number(new URLSearchParams(window.location.search).get('price')) || 4500;
  const orderId = data?.orderId || new URLSearchParams(window.location.search).get('ref') || 'LP-987153';
  
  const email = localStorage.getItem('owner_email') || '';

  const planName = plan === 'premium_pro' ? 'Premium Pro' : 'Elite Pro';
  const durationDays = plan === 'premium_pro' ? 60 : 90;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + durationDays);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown === 0) {
      window.history.pushState(null, "", `/owner/dashboard`);
      onNavigate({ type: 'owner_dashboard' });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onNavigate]);

  const handleDownloadInvoice = () => {
    toast.success("Generating invoice PDF and starting download...");
    
    // Create elegant simulated invoice download
    const invoiceContent = `
========================================
             LANKAPROPERTY.LK
========================================
INVOICE / RECEIPT

Order ID:      ${orderId}
Date:          ${new Date().toLocaleDateString()}
Status:        PAID (PayHere Sandbox)
----------------------------------------
Billed To:
Name:          ${localStorage.getItem('owner_name') || 'Valued Owner'}
Email:         ${email}
----------------------------------------
Item Summary:
Package:       ${planName} Subscription
Duration:      ${durationDays} Days
Price:         Rs. ${price.toLocaleString('en-US')}
----------------------------------------
Total Paid:    Rs. ${price.toLocaleString('en-US')}
========================================
Thank you for advertising with LankaProperty.lk!
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LankaProperty_Invoice_${orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Falling Confetti Particles Generator
  const confettiCount = 50;
  const confettiColors = ['#004F31', '#10b981', '#fbbf24', '#3b82f6', '#ec4899'];

  return (
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 pt-32">
      
      {/* Confetti Rendering */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: confettiCount }).map((_, i) => {
          const delay = Math.random() * 5;
          const left = Math.random() * 100;
          const duration = 2 + Math.random() * 3;
          const size = 5 + Math.random() * 8;
          const color = confettiColors[i % confettiColors.length];
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                top: -20,
                left: `${left}%`,
                width: size,
                height: size,
                backgroundColor: color,
                opacity: 0.8
              }}
              animate={{
                y: '110vh',
                x: [0, (Math.random() - 0.5) * 200, 0],
                rotate: 360
              }}
              transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          );
        })}
      </div>

      <div className="max-w-xl mx-auto w-full bg-white rounded-[32px] p-8 md:p-12 shadow-2xl border border-neutral-100 text-center relative z-10">
        
        {/* Animated Checkmark Circle */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
          >
            <Check size={40} className="stroke-[3]" />
          </motion.div>
        </div>

        {/* Headlines */}
        <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
          🎉 Your Ad is Now Live!
        </h2>
        <p className="text-neutral-500 font-semibold text-xs mt-3 max-w-md mx-auto leading-relaxed">
          Your premium property ad has been successfully activated and is now visible to thousands of buyers.
        </p>

        {/* Details Card */}
        <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/50 my-8 text-left space-y-4">
          <div className="flex justify-between pb-3 border-b border-neutral-200/50">
            <span className="text-xs font-bold text-neutral-400 uppercase">Activated Package</span>
            <span className="text-xs font-extrabold text-[#004F31] uppercase bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">{planName}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-neutral-200/50">
            <span className="text-xs font-bold text-neutral-400 uppercase">Valid Until</span>
            <span className="text-xs font-extrabold text-neutral-700">{expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-neutral-200/50">
            <span className="text-xs font-bold text-neutral-400 uppercase">Order ID</span>
            <span className="text-xs font-mono font-bold text-neutral-700">{orderId}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-neutral-200/50">
            <span className="text-xs font-bold text-neutral-400 uppercase">Amount Paid</span>
            <span className="text-xs font-extrabold text-neutral-700">Rs. {price.toLocaleString('en-US')}</span>
          </div>
          {email && (
            <div className="flex justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase">Receipt Sent To</span>
              <span className="text-xs font-bold text-neutral-600 truncate max-w-[200px]">{email}</span>
            </div>
          )}
        </div>

        {/* Action Buttons Stack */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                window.history.pushState(null, "", `/post-property`);
                onNavigate({ type: 'publish' });
              }}
              className="py-4 bg-[#004F31] hover:bg-[#002a1a] text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle size={16} /> Add Your Property
            </button>
            <button
              onClick={() => {
                window.history.pushState(null, "", `/owner/dashboard`);
                onNavigate({ type: 'owner_dashboard' });
              }}
              className="py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LayoutDashboard size={16} /> Go to My Dashboard →
            </button>
          </div>

          <button
            onClick={handleDownloadInvoice}
            className="w-full py-3 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={14} /> Download Invoice Receipt
          </button>
        </div>

        {/* Redirect Countdown Indicator */}
        <div className="mt-8 text-neutral-400 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 animate-pulse">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#004F31]" />
          Redirecting to dashboard in {countdown}s...
        </div>
      </div>
    </div>
  );
};
