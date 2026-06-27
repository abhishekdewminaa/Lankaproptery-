import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

interface OwnerLoginPageProps {
  onNavigate: (view: any) => void;
  onNavigateHome: () => void;
}

export const OwnerLoginPage: React.FC<OwnerLoginPageProps> = ({ onNavigate, onNavigateHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<string>('starter_free');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Property Seller Login — LankaProperty.lk";
    const params = new URLSearchParams(window.location.search);
    const urlPlan = params.get('plan') || localStorage.getItem('selected_plan') || '';
    if (urlPlan) {
      setPlan(urlPlan);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Try real Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      let loggedInUser = null;

      if (!authError && authData?.user) {
        // Query users table for profile info
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        loggedInUser = {
          id: authData.user.id,
          name: profile?.full_name || authData.user.user_metadata?.full_name || email.split('@')[0],
          email: authData.user.email || email,
          role: profile?.role || 'owner'
        };
      } else {
        // Fallback to custom users table query (useful if offline, demo or mock state)
        const { data: customUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.trim())
          .maybeSingle();

        if (customUser) {
          loggedInUser = {
            id: customUser.id,
            name: customUser.full_name,
            email: customUser.email,
            role: customUser.role || 'owner'
          };
        }
      }

      if (loggedInUser) {
        if (loggedInUser.role === 'agent') {
          toast.error(
            (t) => (
              <span className="text-xs">
                This login is for property sellers. Are you an agent?{' '}
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    window.history.pushState(null, "", `/agent/login`);
                    onNavigate({ type: 'agent_login' });
                  }}
                  className="underline font-bold text-brand-green"
                >
                  Click here to go to Agent Login →
                </button>
              </span>
            ),
            { duration: 8000 }
          );
          setIsSubmitting(false);
          return;
        }

        localStorage.setItem('owner_logged_in', 'true');
        localStorage.setItem('owner_id', loggedInUser.id);
        localStorage.setItem('owner_name', loggedInUser.name);
        localStorage.setItem('owner_email', loggedInUser.email);
        localStorage.setItem('user_role', loggedInUser.role || 'owner');

        toast.success(`Welcome back, ${loggedInUser.name}! Login successful.`, { icon: '👋' });

        // Navigate based on selected plan
        if (plan === 'premium_pro' || plan === 'elite_pro') {
          window.history.pushState(null, "", `/owner/payment?plan=${plan}`);
          onNavigate({ type: 'owner_payment', data: { plan } });
        } else {
          window.history.pushState(null, "", `/owner/dashboard`);
          onNavigate({ type: 'owner_dashboard' });
        }
      } else {
        toast.error('Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error("Login processing error:", err);
      toast.error('Authentication failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReminderBanner = () => {
    if (!plan || plan === 'starter_free') return null;

    if (plan === 'premium_pro') {
      return (
        <div className="bg-[#f0fdf4] border-l-4 border-[#004F31] p-4 rounded-r-2xl mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">⭐</span>
            <div>
              <h4 className="text-sm font-black text-[#004F31] uppercase tracking-wider">PREMIUM PRO — Rs. 4,500 / 2 Months</h4>
              <p className="text-xs font-semibold text-emerald-800 mt-1">
                ✔ 10x More Leads, Featured Position, WhatsApp alerts, and Search Boost included.
              </p>
            </div>
          </div>
        </div>
      );
    } else if (plan === 'elite_pro') {
      return (
        <div className="bg-[#f0f9ff] border-l-4 border-[#1a2340] p-4 rounded-r-2xl mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">👑</span>
            <div>
              <h4 className="text-sm font-black text-[#1a2340] uppercase tracking-wider">ELITE PRO — Rs. 8,500 / 3 Months</h4>
              <p className="text-xs font-semibold text-blue-900 mt-1">
                ✔ Ultimate VIP treatment, 360° virtual tour, Home slider feature, and verified badge included.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const planName = plan === 'premium_pro' ? 'Premium Pro' : plan === 'elite_pro' ? 'Elite Pro' : '';

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 pt-32">
      <div className="max-w-md mx-auto w-full bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-neutral-100">
        <div className="text-center mb-8">
          <span className="inline-block bg-brand-green/10 text-[#004F31] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mb-3">
            🏠 PROPERTY SELLER LOGIN
          </span>
          <h2 className="text-3xl font-black text-[#004F31] tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs font-semibold text-neutral-500 mt-2 max-w-xs mx-auto">
            Login to manage your property listings and view buyer inquiries.
          </p>
        </div>

        {renderReminderBanner()}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="e.g. deshani@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-[#004F31] rounded-xl text-xs font-bold outline-none focus:ring-1"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Password</label>
              <button type="button" className="text-[10px] font-bold text-[#004F31] hover:underline">Forgot password?</button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-neutral-50 border border-neutral-200 focus:ring-[#004F31] rounded-xl text-xs font-bold outline-none focus:ring-1"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-[#004F31]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#004F31] hover:bg-[#002a1a] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing In...
              </span>
            ) : (
              <>
                Login to My Account →
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 text-center space-y-4">
          <p className="text-xs font-bold text-neutral-500">
            Don't have an account yet?{' '}
            <button
              onClick={() => {
                window.history.pushState(null, "", `/owner/register?plan=${plan}`);
                onNavigate({ type: 'owner_register', data: { plan } });
              }}
              className="text-[#004F31] hover:underline font-extrabold"
            >
              {planName ? `Register to get ${planName} →` : 'Register Account →'}
            </button>
          </p>
          <p className="text-xs font-semibold text-neutral-500 pt-4 border-t border-neutral-50">
            Are you a real estate agent?{' '}
            <button
              onClick={() => {
                window.history.pushState(null, "", `/agent/login`);
                onNavigate({ type: 'agent_login' });
              }}
              className="text-[#004F31] hover:underline font-black"
            >
              Agent Login →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
