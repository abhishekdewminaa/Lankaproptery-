import { safeLocalStorage } from '../utils/safeUtils';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Mail, Lock, Phone, User, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

interface OwnerRegisterPageProps {
  onNavigate: (view: any) => void;
  onNavigateHome: () => void;
}

export const OwnerRegisterPage: React.FC<OwnerRegisterPageProps> = ({ onNavigate, onNavigateHome }) => {
  const [plan, setPlan] = useState<string>('starter_free');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+94 ');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "List My Property — LankaProperty.lk";
    const params = new URLSearchParams(window.location.search);
    const urlPlan = params.get('plan') || safeLocalStorage.getItem('selected_plan') || 'starter_free';
    setPlan(urlPlan);
  }, []);

  const handlePhoneChange = (val: string) => {
    if (!val.startsWith('+94 ')) {
      setPhone('+94 ');
    } else {
      setPhone(val);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const cleanPhone = phone.replace('+94 ', '').trim();
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length < 9) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Check if user email is already registered
      const { data: existingUser, error: queryError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.trim())
        .maybeSingle();

      if (existingUser) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
        toast.error('This email is already registered.');
        setIsSubmitting(false);
        return;
      }

      // Generate a user ID (fallback if sign up fails)
      let userId = crypto.randomUUID ? crypto.randomUUID() : 'usr_' + Math.random().toString(36).substr(2, 9);

      // 2. Try to sign up with Supabase Auth
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'owner',
            }
          }
        });

        if (authError) {
          console.warn('Supabase Auth signUp failed, using custom flow:', authError.message);
        } else if (authData?.user) {
          userId = authData.user.id;
        }
      } catch (authErr) {
        console.warn('Supabase Auth execution exception:', authErr);
      }

      // 3. Insert into 'users' table in Supabase
      const isFree = plan === 'starter_free';
      const initialPrice = isFree ? 0 : (plan === 'premium_pro' ? 4500 : 8500);

      const { error: userInsertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          role: 'owner',
          full_name: fullName,
          email: email.trim(),
          phone,
          created_at: new Date().toISOString(),
          package_type: plan,
          selected_package: isFree ? 'Starter Free' : (plan === 'premium_pro' ? 'Premium Pro' : 'Elite Pro'),
          package_paid: isFree ? false : false, // Paid is false until they complete checkout for premium
          package_price: initialPrice
        }]);

      if (userInsertError) {
        console.warn('Failed to insert user into users table:', userInsertError);
      }

      // Save owner login session info to safeLocalStorage
      safeLocalStorage.setItem('owner_logged_in', 'true');
      safeLocalStorage.setItem('owner_id', userId);
      safeLocalStorage.setItem('owner_name', fullName);
      safeLocalStorage.setItem('owner_email', email.trim());
      safeLocalStorage.setItem('user_role', 'owner');
      safeLocalStorage.removeItem('selected_plan'); // clean up as requested

      if (isFree) {
        // Starter Free plan gets written to owner_packages automatically
        const durationDays = 900; // 30 months = 900 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        const { error: pkgError } = await supabase
          .from('owner_packages')
          .insert([{
            user_id: userId,
            package_type: 'starter_free',
            price_lkr: 0,
            duration_days: durationDays,
            payment_status: 'free',
            is_active: true,
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
          }]);

        if (pkgError) {
          console.error("Failed to insert owner_packages record:", pkgError);
        }

        toast.success("🎉 Welcome! Your free listing account is ready. Start adding your property!", { duration: 6000 });
        onNavigate({ type: 'owner_dashboard' });
      } else {
        toast.success(`✅ Account created! Complete your payment to activate ${plan === 'premium_pro' ? 'Premium Pro' : 'Elite Pro'}.`, { duration: 6000 });
        // Redirect to payment screen
        window.history.pushState(null, "", `/owner/payment?plan=${plan}`);
        onNavigate({ type: 'owner_payment', data: { plan } });
      }

    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error("Something went wrong during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReminderBanner = () => {
    if (plan === 'starter_free') {
      return (
        <div className="bg-[#f9fafb] border-l-4 border-gray-400 p-4 rounded-r-2xl mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">🏠</span>
            <div>
              <h4 className="text-sm font-black text-gray-700 uppercase tracking-wider">STARTER FREE — Rs. 0 / 30 Months</h4>
              <p className="text-xs font-semibold text-gray-500 mt-1">
                ✔ Standard Property Listing & Email Support included. No credit card required.
              </p>
            </div>
          </div>
        </div>
      );
    } else if (plan === 'premium_pro') {
      return (
        <div className="bg-[#f0fdf4] border-l-4 border-[#1A5E2A] p-4 rounded-r-2xl mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">⭐</span>
            <div>
              <h4 className="text-sm font-black text-[#1A5E2A] uppercase tracking-wider">PREMIUM PRO — Rs. 4,500 / 2 Months</h4>
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

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 pt-32">
      <div className="max-w-xl mx-auto w-full bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-neutral-100">
        <div className="text-center mb-8">
          <span className="inline-block bg-brand-green/10 text-[#1A5E2A] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mb-3">
            🏠 FOR PROPERTY SELLERS & LANDLORDS
          </span>
          <h2 className="text-3xl font-black text-[#1A5E2A] tracking-tight">
            List Your Property for Free
          </h2>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-2 max-w-sm mx-auto">
            Create your free account to post your property and start receiving buyer inquiries.
          </p>
        </div>

        {renderReminderBanner()}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Full Name *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Deshani Kaushalya"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors(prev => { const c = { ...prev }; delete c.fullName; return c; });
                }}
                className={`w-full pl-11 pr-4 py-3 bg-neutral-50 border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:ring-[#1A5E2A]'} rounded-xl text-xs font-bold outline-none focus:ring-1`}
              />
            </div>
            {errors.fullName && <p className="text-[10px] text-red-500 font-bold">{errors.fullName}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Email Address *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="e.g. deshani@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => { const c = { ...prev }; delete c.email; return c; });
                }}
                className={`w-full pl-11 pr-4 py-3 bg-neutral-50 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:ring-[#1A5E2A]'} rounded-xl text-xs font-bold outline-none focus:ring-1`}
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Phone Number *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                required
                placeholder="e.g. +94 71 555 1234"
                value={phone}
                onChange={(e) => {
                  handlePhoneChange(e.target.value);
                  if (errors.phone) setErrors(prev => { const c = { ...prev }; delete c.phone; return c; });
                }}
                className={`w-full pl-11 pr-4 py-3 bg-neutral-50 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:ring-[#1A5E2A]'} rounded-xl text-xs font-bold outline-none focus:ring-1`}
              />
            </div>
            {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Password *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => { const c = { ...prev }; delete c.password; return c; });
                }}
                className={`w-full pl-11 pr-12 py-3 bg-neutral-50 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:ring-[#1A5E2A]'} rounded-xl text-xs font-bold outline-none focus:ring-1`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-[#1A5E2A]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-500 font-bold">{errors.password}</p>}
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) setErrors(prev => { const c = { ...prev }; delete c.agreeTerms; return c; });
                }}
                className="h-4 w-4 text-[#1A5E2A] focus:ring-[#1A5E2A] border-neutral-300 rounded"
              />
            </div>
            <div className="ml-3 text-xs font-semibold text-neutral-600">
              <label htmlFor="agree-terms" className="cursor-pointer">
                I agree to LankaProperty.lk's <span className="text-[#1A5E2A] underline">Terms of Service</span> and <span className="text-[#1A5E2A] underline">Privacy Policy</span>.
              </label>
              {errors.agreeTerms && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.agreeTerms}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#1A5E2A] hover:bg-[#0F3D1A] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </span>
            ) : (
              <>
                Start Listing My Property →
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
          <p className="text-xs font-bold text-neutral-500">
            Already have an account?{' '}
            <button
              onClick={() => {
                window.history.pushState(null, "", `/owner/login?plan=${plan}`);
                onNavigate({ type: 'owner_login', data: { plan } });
              }}
              className="text-[#1A5E2A] hover:underline font-extrabold"
            >
              Sign In Here
            </button>
          </p>
          <p className="text-xs font-semibold text-neutral-500 mt-4 pt-4 border-t border-neutral-50">
            Are you a professional real estate agent?{' '}
            <button
              onClick={() => {
                window.history.pushState(null, "", `/agent/register`);
                onNavigate({ type: 'agent_register' });
              }}
              className="text-[#1A5E2A] hover:underline font-black"
            >
              Join our Agent Network →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
