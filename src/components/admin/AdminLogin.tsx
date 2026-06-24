import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [email, setEmail] = useState('ceo.lankaland@gmail.com');
  const [password, setPassword] = useState('••••••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLang, setCurrentLang] = useState<'EN' | 'SI'>('EN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate real auth delay
    setTimeout(() => {
      setIsSubmitting(false);
      // Accept ceo.lankaland@gmail.com or abhishekdewminaa@gmail.com for admin fallback
      const allowedEmails = ['ceo.lankaland@gmail.com', 'abhishekdewminaa@gmail.com'];
      if (allowedEmails.includes(email.toLowerCase().trim())) {
        toast.success('Successfully authenticated as administrator');
        onLoginSuccess(email.toLowerCase().trim());
      } else {
        toast.error('Unauthorized email address for admin access');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-white text-neutral-900 font-sans antialiased">
      
      {/* LEFT SIDE - BRANDING & VISUAL (Green overlay) */}
      <div className="relative w-full md:w-[48%] flex flex-col justify-between p-8 md:p-12 overflow-hidden bg-[#004f31]">
        {/* Background Image with soft dark green overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#002b1b] via-[#004f31]/95 to-[#004f31]/80 z-0 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-[#004f31] font-black shadow-md">
            <Home size={22} className="fill-[#004f31] text-[#004f31]" />
          </div>
          <span className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-1">
            LankaProperty<span className="text-emerald-400">.lk</span>
          </span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-auto py-12 space-y-6 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Welcome <br />
              <span className="text-[#a7f3d0]">Back</span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-emerald-100 text-base md:text-lg font-medium leading-relaxed opacity-90"
          >
            Sri Lanka's Premier Real Estate Management Platform
          </motion.p>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-bold text-emerald-300 uppercase tracking-widest border-t border-white/10 pt-4">
          <span>REAL ESTATE</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>MANAGEMENT</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>2026</span>
        </div>
      </div>

      {/* RIGHT SIDE - SIGN IN FORM */}
      <div className="w-full md:w-[52%] flex flex-col justify-between p-8 md:p-16 lg:p-24 bg-white relative">
        
        {/* Back navigation button top-right */}
        <button 
          onClick={onBackToHome}
          className="absolute top-6 right-6 md:top-12 md:right-12 flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-[#004f31] uppercase tracking-widest transition-colors duration-200"
        >
          <Home size={14} />
          Back to Home
        </button>

        <div className="my-auto max-w-md w-full mx-auto space-y-8">
          
          {/* Admin Access Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#e6f4f0] text-[#004f31] text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#b3ded1]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ADMIN ACCESS
          </div>

          {/* Header Title */}
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Sign In
            </h2>
            <p className="text-sm text-neutral-500 font-medium">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">
                EMAIL ADDRESS
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#004f31] transition-colors duration-200">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f3f6f5] border border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#004f31] transition-all duration-200 shadow-inner"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">
                  PASSWORD
                </label>
                <button 
                  type="button"
                  onClick={() => toast('Password recovery is managed by the CEO portal administrator.', { icon: 'ℹ️' })}
                  className="text-[11px] font-extrabold text-[#004f31] hover:underline uppercase tracking-wider"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#004f31] transition-colors duration-200">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f3f6f5] border border-transparent rounded-2xl py-4 pl-12 pr-12 text-sm font-bold outline-none text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#004f31] transition-all duration-200 shadow-inner"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-[#004f31] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#004f31] hover:bg-[#003822] text-white text-xs font-bold uppercase tracking-wider py-4 px-6 rounded-2xl shadow-lg shadow-emerald-950/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  SIGN IN <ArrowRight size={14} />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Bottom bar inside right half */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-neutral-100 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-emerald-600" />
            <span>SECURED BY LANKAPROPERTY.LK</span>
          </div>

          {/* Language selector toggle */}
          <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 shadow-sm font-black text-[9px]">
            <button 
              type="button"
              onClick={() => setCurrentLang('EN')}
              className={`px-2.5 py-1 rounded-md transition-all ${currentLang === 'EN' ? 'bg-[#004f31] text-white shadow' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              EN
            </button>
            <button 
              type="button"
              onClick={() => setCurrentLang('SI')}
              className={`px-2.5 py-1 rounded-md transition-all ${currentLang === 'SI' ? 'bg-[#004f31] text-white shadow' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              සිං
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
