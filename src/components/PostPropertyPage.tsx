import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  X, 
  ArrowRight, 
  Users, 
  Home, 
  Smile, 
  Clock, 
  UserPlus, 
  FileText, 
  Rocket, 
  ShieldCheck, 
  Bot, 
  MessageSquare, 
  Map, 
  BarChart3, 
  Star, 
  Phone, 
  ChevronRight,
  Sparkles,
  Lock,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PostPropertyPageProps {
  onNavigate: (view: any) => void;
  onNavigateHome: () => void;
}

export const PostPropertyPage: React.FC<PostPropertyPageProps> = ({ onNavigate, onNavigateHome }) => {
  // Stats state for animation
  const [visitors, setVisitors] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);
  const [pubTime, setPubTime] = useState(0);

  // Auth / Registration modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  
  // Registration form inputs
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Check login status from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('owner_logged_in') === 'true';
  });

  // Animated counters on page load
  useEffect(() => {
    const duration = 1500; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setVisitors(Math.floor(progress * 500000));
      setActiveListings(Math.floor(progress * 5000));
      setSatisfaction(Math.floor(progress * 98));
      setPubTime(Math.floor(progress * 24));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const handlePostPropertyClick = (plan: string = 'starter_free') => {
    localStorage.setItem('selected_plan', plan);
    const loggedIn = localStorage.getItem('owner_logged_in') === 'true';

    if (plan === 'free' || plan === 'starter_free') {
      if (loggedIn) {
        window.history.pushState(null, "", `/owner/dashboard`);
        onNavigate({ type: 'owner_dashboard' });
      } else {
        window.history.pushState(null, "", `/owner/register?plan=starter_free`);
        onNavigate({ type: 'owner_register', data: { plan: 'starter_free' } });
      }
    } else if (plan === 'premium_pro') {
      if (loggedIn) {
        window.history.pushState(null, "", `/owner/payment?plan=premium_pro`);
        onNavigate({ type: 'owner_payment', data: { plan: 'premium_pro' } });
      } else {
        window.history.pushState(null, "", `/owner/register?plan=premium_pro`);
        onNavigate({ type: 'owner_register', data: { plan: 'premium_pro' } });
      }
    } else if (plan === 'elite_pro') {
      if (loggedIn) {
        window.history.pushState(null, "", `/owner/payment?plan=elite_pro`);
        onNavigate({ type: 'owner_payment', data: { plan: 'elite_pro' } });
      } else {
        window.history.pushState(null, "", `/owner/register?plan=elite_pro`);
        onNavigate({ type: 'owner_register', data: { plan: 'elite_pro' } });
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      toast.error("Please fill in all registration fields.");
      return;
    }

    // Save registration mock state
    localStorage.setItem('owner_logged_in', 'true');
    localStorage.setItem('owner_name', registerName);
    localStorage.setItem('owner_email', registerEmail);
    setIsLoggedIn(true);
    setIsRegisterOpen(false);

    toast.success(`Welcome to LankaProperty.lk, ${registerName}! Account created successfully. Redirecting to publish your listing.`);
    
    // Direct them straight to publish form
    onNavigate({ type: 'publish' });
  };

  const handleTalkToTeam = () => {
    toast.success("Connecting with our premium seller support team. We've initiated a callback request for you!", {
      icon: '📞',
    });
  };

  return (
    <div id="sell-landing-page" className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-[#004f31] selection:text-white">
      
      {/* ═══════════════════════════════════════
          SECTION 1 — HERO SECTION
          ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pb-28 bg-gradient-to-br from-[#004F31] to-[#002a1a] text-white">
        {/* Subtle background glow vectors */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square bg-[#007e50] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] aspect-square bg-[#BBF7D0] rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 bg-emerald-800/60 border border-emerald-700/60 text-[#a8ffd5] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-inner animate-pulse">
                🏡 Sri Lanka's #1 Property Marketplace
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Sell or Rent Your Property <br className="hidden sm:inline" />
                <span className="text-[#a8ffd5] bg-gradient-to-r from-emerald-300 to-teal-100 bg-clip-text text-transparent">Faster Than Ever</span>
              </h1>

              <p className="text-base sm:text-lg text-emerald-100 max-w-xl font-medium leading-relaxed">
                Reach over <span className="text-white font-black underline decoration-brand-yellow decoration-2">500,000 active buyers</span> and renters across Sri Lanka and overseas every single month.
              </p>

              {/* Trust Badges Bar */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs sm:text-sm font-bold text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <Check size={16} className="text-brand-yellow" /> Free to Start
                </span>
                <span className="text-emerald-700">|</span>
                <span className="flex items-center gap-1.5">
                  <Check size={16} className="text-brand-yellow" /> No Commission
                </span>
                <span className="text-emerald-700">|</span>
                <span className="flex items-center gap-1.5">
                  <Check size={16} className="text-brand-yellow" /> Publish in 24 Hours
                </span>
              </div>

              {/* CTA Buttons row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <button
                  onClick={() => handlePostPropertyClick('free')}
                  className="px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-[#002a1a] font-black rounded-2xl shadow-xl shadow-emerald-950/40 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-center uppercase tracking-wider text-sm cursor-pointer"
                >
                  🟢 POST YOUR PROPERTY FREE
                </button>
                <button
                  onClick={handleTalkToTeam}
                  className="px-8 py-4 bg-transparent hover:bg-white/5 border-2 border-white/80 hover:border-white text-white font-bold rounded-2xl transition-all text-center text-sm cursor-pointer"
                >
                  📞 Talk to Our Team
                </button>
              </div>

              {/* Agent registration entry point notice */}
              <div className="pt-2 text-left">
                <p className="text-xs font-semibold text-emerald-200">
                  Are you a professional real estate agent?{" "}
                  <button
                    type="button"
                    onClick={() => onNavigate({ type: 'agent_register' })}
                    className="text-[#a8ffd5] font-black underline hover:text-white transition-colors cursor-pointer inline"
                  >
                    Register on our Agent Portal to list unlimited properties →
                  </button>
                </p>
              </div>
            </div>

            {/* Right Stats Column */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 flex flex-col justify-between hover:bg-white/[0.12] hover:border-white/20 transition-all shadow-xl">
                <Users size={32} className="text-emerald-300 mb-4" />
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {visitors.toLocaleString()}+
                  </h3>
                  <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider mt-1">
                    Monthly Visitors
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 flex flex-col justify-between hover:bg-white/[0.12] hover:border-white/20 transition-all shadow-xl">
                <Home size={32} className="text-emerald-300 mb-4" />
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {activeListings.toLocaleString()}+
                  </h3>
                  <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider mt-1">
                    Active Listings
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 flex flex-col justify-between hover:bg-white/[0.12] hover:border-white/20 transition-all shadow-xl">
                <Smile size={32} className="text-emerald-300 mb-4" />
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {satisfaction}%
                  </h3>
                  <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider mt-1">
                    Seller Satisfaction
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 flex flex-col justify-between hover:bg-white/[0.12] hover:border-white/20 transition-all shadow-xl">
                <Clock size={32} className="text-emerald-300 mb-4" />
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {pubTime}hrs
                  </h3>
                  <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider mt-1">
                    Average Publish
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — HOW IT WORKS
          ═══════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-[#004F31] tracking-tight">
              How It Works
            </h2>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mt-2">
              List your property in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative">
            
            {/* STEP 1 */}
            <div className="bg-neutral-50 border border-neutral-150 rounded-3xl p-8 flex flex-col justify-between relative group hover:border-[#004F31] hover:shadow-xl transition-all duration-300">
              <div className="absolute top-5 right-5 h-8 w-8 bg-emerald-100 text-[#004F31] rounded-full flex items-center justify-center font-black text-sm">
                1
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-2xl inline-block text-[#004F31]">
                  <UserPlus size={28} />
                </div>
                <h3 className="text-xl font-black text-neutral-900 leading-tight">
                  📝 Create Your Account
                </h3>
                <p className="text-neutral-500 font-medium text-sm leading-relaxed">
                  Register for free in under 2 minutes. No credit card required. Manage all properties from a centralized dashboard.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => handlePostPropertyClick('free')}
                  className="flex items-center gap-1.5 text-[#004F31] font-extrabold text-sm hover:gap-2.5 transition-all"
                >
                  Get Started Free <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="bg-neutral-50 border border-neutral-150 rounded-3xl p-8 flex flex-col justify-between relative group hover:border-[#004F31] hover:shadow-xl transition-all duration-300">
              <div className="absolute top-5 right-5 h-8 w-8 bg-emerald-100 text-[#004F31] rounded-full flex items-center justify-center font-black text-sm">
                2
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-2xl inline-block text-[#004F31]">
                  <FileText size={28} />
                </div>
                <h3 className="text-xl font-black text-neutral-900 leading-tight">
                  🏠 Submit Your Property
                </h3>
                <p className="text-neutral-500 font-medium text-sm leading-relaxed">
                  Fill in your property details, upload photos, specify sizes, and set your desired LKR, USD, or EUR pricing tier.
                </p>
              </div>
              <div className="pt-6 text-xs font-bold text-neutral-400">
                No credit card required
              </div>
            </div>

            {/* STEP 3 */}
            <div className="bg-neutral-50 border border-neutral-150 rounded-3xl p-8 flex flex-col justify-between relative group hover:border-[#004F31] hover:shadow-xl transition-all duration-300">
              <div className="absolute top-5 right-5 h-8 w-8 bg-emerald-100 text-[#004F31] rounded-full flex items-center justify-center font-black text-sm">
                3
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-2xl inline-block text-[#004F31]">
                  <Rocket size={28} />
                </div>
                <h3 className="text-xl font-black text-neutral-900 leading-tight">
                  🚀 Go Live & Get Leads
                </h3>
                <p className="text-neutral-500 font-medium text-sm leading-relaxed">
                  Your listing goes live within 24 hours on Sri Lanka’s #1 property index and starts receiving direct inquiries instantly.
                </p>
              </div>
              <div className="pt-6 text-xs font-bold text-neutral-400">
                Auto-reminders included
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — CHOOSE YOUR PACKAGE
          ═══════════════════════════════════════ */}
      <section className="py-20 bg-neutral-100">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-[#004F31] tracking-tight">
              Choose Your Selling Plan
            </h2>
            <p className="text-neutral-500 font-bold text-sm mt-2 max-w-lg mx-auto leading-relaxed">
              Sell your property faster with Sri Lanka's leading property marketplace. Pick the plan that fits your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* CARD 1: STARTER FREE */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-8 flex flex-col justify-between hover:border-gray-400/40 hover:shadow-lg transition-all duration-300">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-3.5 py-1.5 rounded-full border border-gray-200">
                    Starter
                  </span>
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                    FREE
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-neutral-800">Rs. 0</span>
                    <span className="text-neutral-500 font-bold text-sm ml-2">/ 30 Months</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2 font-medium">Standard baseline exposure</p>
                </div>

                <hr className="border-gray-100 my-6" />

                <ul className="space-y-4 text-sm font-medium text-neutral-600">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span>30 Months Extended Duration</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span>Standard Property Listing</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span>Basic Search Integration</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span>Email Support</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-gray-300">
                    <X size={16} className="text-gray-300 shrink-0" />
                    <span className="line-through">Featured Position</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-gray-300">
                    <X size={16} className="text-gray-300 shrink-0" />
                    <span className="line-through">WhatsApp Lead Generation</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handlePostPropertyClick('starter_free')}
                  className="w-full py-4 bg-transparent hover:bg-gray-50 border border-gray-300 text-gray-700 hover:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer text-center"
                >
                  Start For Free →
                </button>
              </div>
            </div>

            {/* CARD 2: PREMIUM PRO (Elevated) */}
            <div className="bg-white border-2 border-[#004F31] rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative scale-100 lg:scale-[1.04] z-10">
              {/* Highlight badge */}
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-[#002a1a] border border-yellow-500 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                <Sparkles size={12} className="fill-current" /> ⭐ BEST VALUE
              </div>

              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black uppercase tracking-widest bg-emerald-50 text-[#004F31] px-3.5 py-1.5 rounded-full border border-emerald-100">
                    Premium Pro
                  </span>
                  <span className="text-xs font-black text-[#004F31] uppercase tracking-widest">
                    POPULAR
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-neutral-800">Rs. 4,500</span>
                    <span className="text-neutral-500 font-bold text-sm ml-2">/ 2 Months</span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-2 font-bold">10x More Leads & Exposure</p>
                </div>

                <hr className="border-emerald-50 my-6" />

                <ul className="space-y-4 text-sm font-medium text-neutral-700">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-[#004F31] shrink-0" />
                    <span className="font-bold">60 Days Exposure</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-[#004F31] shrink-0" />
                    <span>Featured Position (Top 10)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-[#004F31] shrink-0" />
                    <span>Multi-Site Syndication</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-[#004F31] shrink-0" />
                    <span className="font-bold text-emerald-800">WhatsApp Lead Generation</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-[#004F31] shrink-0" />
                    <span>Priority Search Placement</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-[#004F31] shrink-0" />
                    <span>Email Support</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handlePostPropertyClick('premium_pro')}
                  className="w-full py-4 bg-[#004F31] hover:bg-[#002a1a] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-emerald-950/20 text-center"
                >
                  Promote with Premium Pro →
                </button>
              </div>
            </div>

            {/* CARD 3: ELITE PRO */}
            <div className="bg-[#1a2340] border border-[#2b3964] rounded-3xl p-8 flex flex-col justify-between text-white hover:border-[#38497d] hover:shadow-lg transition-all duration-300">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black uppercase tracking-widest bg-white/10 text-emerald-300 px-3.5 py-1.5 rounded-full border border-white/15">
                    Elite Pro
                  </span>
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                    👑 ELITE
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-white">Rs. 8,500</span>
                    <span className="text-neutral-400 font-bold text-sm ml-2">/ 3 Months</span>
                  </div>
                  <p className="text-xs text-[#a8ffd5] mt-2 font-bold">Ultimate VIP Agency Listing</p>
                </div>

                <hr className="border-white/10 my-6" />

                <ul className="space-y-4 text-sm font-medium text-neutral-300">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>90 Days Premium Duration</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Top-Shelf Branding</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>360° Virtual Tour Base</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Verified Seller Badge</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Dedicated Listing Support</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">Featured on Homepage Slider</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handlePostPropertyClick('elite_pro')}
                  className="w-full py-4 bg-white hover:bg-neutral-100 text-[#1a2340] rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer text-center"
                >
                  Go VIP with Elite Pro →
                </button>
              </div>
            </div>

          </div>

          <div className="text-center mt-10">
            <p className="text-xs font-bold text-neutral-500 bg-white/60 inline-block px-6 py-3 rounded-full border border-neutral-200 shadow-sm">
              🔒 No hidden fees. Cancel or upgrade your plan at any time directly from your seller dashboard.
            </p>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate({ type: 'packages' })}
              className="text-sm font-bold text-[#004F31] hover:text-emerald-800 transition-colors inline-flex items-center gap-1 hover:gap-2"
            >
              Need maximum exposure? Check out our Admin-Assisted Advertised Packages <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4 — WHY CHOOSE LANKAPROPERTY.LK
          ═══════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-[#004F31] tracking-tight">
              Why Thousands of Sellers Choose Us
            </h2>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mt-2">
              The premier real estate index of Sri Lanka
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature Card 1 */}
            <div className="bg-neutral-50/50 border border-neutral-150 rounded-3xl p-6 hover:border-[#004F31] transition-all">
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#004F31] mb-5">
                <Users size={24} />
              </div>
              <h4 className="text-lg font-black text-neutral-900 mb-2">🌍 Massive Reach</h4>
              <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                Your property is visible to 500,000+ monthly visitors across Sri Lanka and high-intent overseas Sri Lankan buyers.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-neutral-50/50 border border-neutral-150 rounded-3xl p-6 hover:border-[#004F31] transition-all">
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#004F31] mb-5">
                <Bot size={24} />
              </div>
              <h4 className="text-lg font-black text-neutral-900 mb-2">🤖 AI-Powered Listings</h4>
              <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                Our Gemini AI automatically writes professional, high-converting property descriptions for you in seconds.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-neutral-50/50 border border-neutral-150 rounded-3xl p-6 hover:border-[#004F31] transition-all">
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#004F31] mb-5">
                <MessageSquare size={24} />
              </div>
              <h4 className="text-lg font-black text-neutral-900 mb-2">📱 WhatsApp Lead Alerts</h4>
              <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                Get instant WhatsApp push notifications the second a prospective buyer inquires about your listed property.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-neutral-50/50 border border-neutral-150 rounded-3xl p-6 hover:border-[#004F31] transition-all">
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#004F31] mb-5">
                <Map size={24} />
              </div>
              <h4 className="text-lg font-black text-neutral-900 mb-2">🗺️ Maps Intelligence</h4>
              <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                Buyers can easily locate your land plots, houses, or apartments using our custom Google Maps filtration system.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-neutral-50/50 border border-neutral-150 rounded-3xl p-6 hover:border-[#004F31] transition-all">
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#004F31] mb-5">
                <BarChart3 size={24} />
              </div>
              <h4 className="text-lg font-black text-neutral-900 mb-2">📊 Real-Time Analytics</h4>
              <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                Track exactly how many potential buyers have viewed your listing, saved it to favorites, or requested details.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-neutral-50/50 border border-neutral-150 rounded-3xl p-6 hover:border-[#004F31] transition-all">
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#004F31] mb-5">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-lg font-black text-neutral-900 mb-2">🏆 Verified & Trusted</h4>
              <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                LankaProperty.lk is Sri Lanka's most trusted real estate brand, offering unmatched credibility to all sellers.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 — TESTIMONIALS
          ═══════════════════════════════════════ */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-[#004F31] tracking-tight">
              What Our Sellers Say
            </h2>
            <p className="text-emerald-700/80 font-bold uppercase tracking-widest text-xs mt-2">
              Success stories from property owners like you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-lg shadow-emerald-950/5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                </div>
                <p className="text-neutral-600 font-medium italic text-sm leading-relaxed">
                  "I listed my house in Colombo 7 and received 12 inquiries within the first week. Sold it in 3 weeks!"
                </p>
              </div>
              <div className="pt-6 border-t border-gray-100 mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-[#004F31] font-black flex items-center justify-center text-sm">
                  NP
                </div>
                <div>
                  <h5 className="font-black text-neutral-900 text-sm">Nimal Perera</h5>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Colombo</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-lg shadow-emerald-950/5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                </div>
                <p className="text-neutral-600 font-medium italic text-sm leading-relaxed">
                  "The Premium Pro package got my land listed on multiple websites. Found a buyer from Dubai within a month."
                </p>
              </div>
              <div className="pt-6 border-t border-gray-100 mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-[#004F31] font-black flex items-center justify-center text-sm">
                  CS
                </div>
                <div>
                  <h5 className="font-black text-neutral-900 text-sm">Chamari Silva</h5>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kandy</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-lg shadow-emerald-950/5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                </div>
                <p className="text-neutral-600 font-medium italic text-sm leading-relaxed">
                  "As a first-time seller, the process was incredibly easy. The AI description writer saved me so much time."
                </p>
              </div>
              <div className="pt-6 border-t border-gray-100 mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-[#004F31] font-black flex items-center justify-center text-sm">
                  RF
                </div>
                <div>
                  <h5 className="font-black text-neutral-900 text-sm">Roshan Fernando</h5>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gampaha</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 6 — FINAL CTA BANNER
          ═══════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-[#004F31] to-[#002a1a] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square bg-[#007e50] rounded-full blur-[180px]" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-3xl space-y-6">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Ready to Sell Your Property?
          </h2>
          <p className="text-base sm:text-lg text-emerald-100 font-medium max-w-xl mx-auto leading-relaxed">
            Join 5,000+ property owners who trust LankaProperty.lk with their real estate advertisements.
          </p>

          <div className="pt-4">
            <button
              onClick={() => handlePostPropertyClick('free')}
              className="px-10 py-5 bg-white hover:bg-neutral-50 text-[#004F31] font-black rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-center uppercase tracking-wider text-sm cursor-pointer inline-flex items-center gap-2.5"
            >
              POST YOUR PROPERTY FREE <ArrowRight size={18} />
            </button>
          </div>

          <p className="text-xs text-emerald-200 font-bold">
            No credit card required · Free to list · Publish in 24 hours
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          OWNER REGISTRATION MODAL
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {isRegisterOpen && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-neutral-100 overflow-hidden relative"
            >
              {/* Header */}
              <div className="bg-[#004F31] text-white p-6 relative">
                <button
                  onClick={() => setIsRegisterOpen(false)}
                  className="absolute top-5 right-5 text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={16} className="text-emerald-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Secure Registration</span>
                </div>
                <h3 className="text-xl font-black">Create Your Owner Account</h3>
                <p className="text-xs text-emerald-100/90 mt-1 font-medium">
                  Complete your free registration to list on {selectedPlan === 'free' ? 'Starter Free' : selectedPlan === 'premium_pro' ? 'Premium Pro' : 'Elite Pro'} plan.
                </p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleRegisterSubmit} className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyantha Jayasuriya"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004F31] focus:border-[#004F31] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priyantha@domain.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004F31] focus:border-[#004F31] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +94 77 123 4567"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004F31] focus:border-[#004F31] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Create Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 8 characters"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004F31] focus:border-[#004F31] outline-none"
                  />
                </div>

                <div className="flex items-start gap-2.5 pt-2">
                  <input type="checkbox" required defaultChecked id="agree-terms" className="mt-1 accent-[#004F31]" />
                  <label htmlFor="agree-terms" className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                    I agree to LankaProperty.lk's Terms of Service & Privacy Policy and certify that I am the verified owner or authorized legal agent of the properties listed.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 mt-4 bg-[#004F31] hover:bg-[#002a1a] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-emerald-950/20 text-center"
                >
                  Register & Start Listing
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
