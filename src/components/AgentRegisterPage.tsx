import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ArrowRight, 
  Phone, 
  Globe, 
  Award, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  Briefcase,
  Users,
  Smile,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

interface AgentRegisterPageProps {
  onNavigate: (view: any) => void;
  onNavigateHome: () => void;
}

const DISTRICTS_LIST = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota',
  'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya',
  'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala',
  'Ratnapura', 'Kegalle'
];

export const AgentRegisterPage: React.FC<AgentRegisterPageProps> = ({ onNavigate, onNavigateHome }) => {
  // --- FORM STATES ---
  const [fullName, setFullName] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+94 ');
  const [whatsapp, setWhatsapp] = useState('+94 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [agencyName, setAgencyName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [yearsExperience, setYearsExperience] = useState('Less than 1 year');
  const [specialization, setSpecialization] = useState('Residential Sales');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmLicense, setConfirmLicense] = useState(false);

  // --- UI STATES ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // --- ERROR STATES ---
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check phone number input to keep the +94 prefix nicely formatted
  const handlePhoneChange = (val: string, setter: (v: string) => void) => {
    if (!val.startsWith('+94 ')) {
      setter('+94 ');
    } else {
      setter(val);
    }
  };

  // Live password strength calculation
  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    setPasswordStrength(score);
  }, [password]);

  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev => 
      prev.includes(district)
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  // Inline Validation
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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!yearsExperience) newErrors.yearsExperience = 'Please select your years of experience';
    if (!specialization) newErrors.specialization = 'Please select your specialization';
    if (selectedDistricts.length === 0) newErrors.districts = 'Please select at least one service district';

    if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms of Service';
    if (!confirmLicense) newErrors.confirmLicense = 'You must confirm your license or agency status';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the validation errors on the form.');
      // Scroll to top of form area
      const formElement = document.getElementById('registration-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Check if email exists in Supabase users table
      const { data: existingUser, error: queryError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered as an agent or owner' }));
        toast.error('This email address is already registered.');
        setIsSubmitting(false);
        return;
      }

      // Generate a user ID (fallback if sign up fails/offline)
      let userId = crypto.randomUUID ? crypto.randomUUID() : 'usr_' + Math.random().toString(36).substr(2, 9);

      // 2. Try to sign up with Supabase Auth
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'agent',
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

      // 3. Insert into existing 'users' table
      const { error: userInsertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          role: 'agent',
          full_name: fullName,
          email,
          phone,
          whatsapp: whatsapp.replace('+94 ', '').trim() ? whatsapp : phone,
          created_at: new Date().toISOString()
        }]);

      if (userInsertError) {
        console.warn('Failed to insert user into users table:', userInsertError);
      }

      // 4. Insert into existing 'agents' table
      const { error: agentInsertError } = await supabase
        .from('agents')
        .insert([{
          id: userId,
          user_id: userId,
          email,
          name: fullName,
          phone,
          agency_name: agencyName || null,
          license_no: licenseNo || null,
          years_experience: yearsExperience,
          specialization,
          service_areas: selectedDistricts,
          bio: bio || null,
          facebook_url: facebookUrl || null,
          instagram_url: instagramUrl || null,
          linkedin_url: linkedinUrl || null,
          website_url: websiteUrl || null,
          is_verified: false,
          created_at: new Date().toISOString()
        }]);

      if (agentInsertError) {
        console.warn('Failed to insert agent into agents table:', agentInsertError);
      }

      // Save session states to localStorage for mock/real logged-in experience
      localStorage.setItem('owner_logged_in', 'true');
      localStorage.setItem('owner_name', fullName);
      localStorage.setItem('owner_email', email);
      localStorage.setItem('user_role', 'agent');

      // Success
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Registration processing exception:', err);
      toast.error('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return 'Very Weak';
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-emerald-500';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col lg:flex-row">
      
      {/* ════════════════════════════════════════
          LEFT SIDE: BRANDING & BENEFITS (35%)
          ════════════════════════════════════════ */}
      <div className="lg:w-[35%] bg-[#1a2340] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden lg:sticky lg:top-0 lg:h-screen">
        {/* Subtle decorative background shapes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] aspect-square bg-blue-600 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[80%] aspect-square bg-emerald-500 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 space-y-12">
          {/* Logo / Back to home */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="https://qsqqolvsndvkwegvcfqv.supabase.co/storage/v1/object/sign/Homa%20page%20images/Homa%20page.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MWNhMTU1MC03OGYzLTQwZGMtYTYzYi02NzVmZTRiYjM2NWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJIb21hIHBhZ2UgaW1hZ2VzL0hvbWEgcGFnZS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgyMjcyNDczLCJleHAiOjI3MjgzNTI0NzN9.anq2vvFCtVaS-LDJkzccWqjo4kqH7wMmOIGw6oM7XKA"
              alt="LankaProperty Logo"
              className="h-10 w-auto object-contain rounded-xl bg-white p-1"
              referrerPolicy="no-referrer"
            />
            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">LankaProperty.lk</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Grow Your Real Estate <br />
              <span className="text-blue-400">Business With Us</span>
            </h1>
            <p className="text-gray-400 font-medium text-sm leading-relaxed max-w-sm">
              Join Sri Lanka's fastest growing real estate agent network and connect directly with high-value buyers.
            </p>
          </div>

          {/* Benefit Points */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mt-0.5 shrink-0">
                <Check size={12} className="stroke-[3]" />
              </div>
              <p className="text-sm font-semibold text-gray-200">Unlimited property listings</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mt-0.5 shrink-0">
                <Check size={12} className="stroke-[3]" />
              </div>
              <p className="text-sm font-semibold text-gray-200">Direct WhatsApp lead alerts</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mt-0.5 shrink-0">
                <Check size={12} className="stroke-[3]" />
              </div>
              <p className="text-sm font-semibold text-gray-200">Professional agent profile page</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mt-0.5 shrink-0">
                <Check size={12} className="stroke-[3]" />
              </div>
              <p className="text-sm font-semibold text-gray-200">Real-time analytics dashboard</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mt-0.5 shrink-0">
                <Check size={12} className="stroke-[3]" />
              </div>
              <p className="text-sm font-semibold text-gray-200">AI-powered listing descriptions</p>
            </div>
          </div>
        </div>

        {/* Stats footer row */}
        <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 mt-12 lg:mt-0 relative z-10">
          <div>
            <h4 className="text-xl font-black text-white">5,000+</h4>
            <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">Active Listings</p>
          </div>
          <div>
            <h4 className="text-xl font-black text-white">500K+</h4>
            <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">Monthly Visitors</p>
          </div>
          <div>
            <h4 className="text-xl font-black text-white">98%</h4>
            <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">Agent Satisfaction</p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT SIDE: REGISTRATION FORM (65%)
          ════════════════════════════════════════ */}
      <div className="lg:w-[65%] bg-white p-8 md:p-16 flex flex-col justify-start" id="registration-form">
        <div className="max-w-3xl w-full">
          
          {/* Header */}
          <div className="space-y-3 mb-10">
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              AGENT PORTAL
            </span>
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
              Create Your Agent Account
            </h2>
            <p className="text-sm font-bold text-neutral-500">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => onNavigate({ type: 'auth', data: 'login' })}
                className="text-blue-600 hover:text-blue-800 transition-colors underline cursor-pointer"
              >
                Login here →
              </button>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8 text-left">
            
            {/* GROUP 1 — Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                <h3 className="text-base font-black text-neutral-800 uppercase tracking-wider">
                  Personal Information
                </h3>
              </div>
              <hr className="border-neutral-100" />

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deshani Kaushalya"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                    }}
                    className={`w-full px-4 py-3 bg-neutral-50 border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:ring-blue-500'} rounded-xl text-xs font-bold outline-none focus:ring-1`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold">{errors.fullName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">NIC Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 199501234567 or 950123456V"
                    value={nicNumber}
                    onChange={(e) => setNicNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-blue-500 rounded-xl text-xs font-bold outline-none focus:ring-1"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. deshani@agency.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`w-full px-4 py-3 bg-neutral-50 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:ring-blue-500'} rounded-xl text-xs font-bold outline-none focus:ring-1`}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +94 71 555 1234"
                    value={phone}
                    onChange={(e) => {
                      handlePhoneChange(e.target.value, setPhone);
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className={`w-full px-4 py-3 bg-neutral-50 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:ring-blue-500'} rounded-xl text-xs font-bold outline-none focus:ring-1`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +94 71 555 1234"
                    value={whatsapp}
                    onChange={(e) => handlePhoneChange(e.target.value, setWhatsapp)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-blue-500 rounded-xl text-xs font-bold outline-none focus:ring-1"
                  />
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                      }}
                      className={`w-full pr-12 pl-4 py-3 bg-neutral-50 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:ring-blue-500'} rounded-xl text-xs font-bold outline-none focus:ring-1`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[10px] text-red-500 font-bold">{errors.password}</p>}
                  
                  {/* Password Strength indicator */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Password Strength:</span>
                        <span className={passwordStrength >= 3 ? 'text-emerald-500' : passwordStrength === 2 ? 'text-yellow-500' : 'text-red-500'}>
                          {getStrengthLabel()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStrengthColor()} transition-all duration-300`}
                          style={{ width: `${Math.max((passwordStrength / 4) * 100, 10)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 relative">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }}
                      className={`w-full pr-12 pl-4 py-3 bg-neutral-50 border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:ring-blue-500'} rounded-xl text-xs font-bold outline-none focus:ring-1`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* GROUP 2 — Professional Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600" />
                <h3 className="text-base font-black text-neutral-800 uppercase tracking-wider">
                  Professional Information
                </h3>
              </div>
              <hr className="border-neutral-100" />

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Agency / Company Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Lanka Realty Partners"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-blue-500 rounded-xl text-xs font-bold outline-none focus:ring-1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Real Estate License No. (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. LIC-2026-991"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-blue-500 rounded-xl text-xs font-bold outline-none focus:ring-1"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Years of Experience *</label>
                  <div className="relative">
                    <select
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-blue-500 rounded-xl text-xs font-bold outline-none focus:ring-1 appearance-none cursor-pointer"
                    >
                      <option value="Less than 1 year">Less than 1 year</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Primary Specialization *</label>
                  <div className="relative">
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-blue-500 rounded-xl text-xs font-bold outline-none focus:ring-1 appearance-none cursor-pointer"
                    >
                      <option value="Residential Sales">Residential Sales</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land</option>
                      <option value="Luxury Properties">Luxury Properties</option>
                      <option value="Rentals">Rentals</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 3 - Service Districts Checkbox Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Service Districts * (Choose at least one)</label>
                <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                    {DISTRICTS_LIST.map((dist) => (
                      <label 
                        key={dist} 
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedDistricts.includes(dist) 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-white border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDistricts.includes(dist)}
                          onChange={() => {
                            toggleDistrict(dist);
                            if (errors.districts) setErrors(prev => ({ ...prev, districts: '' }));
                          }}
                          className="h-3.5 w-3.5 rounded text-blue-600 border-neutral-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-[11px] font-bold select-none">{dist}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {errors.districts && <p className="text-[10px] text-red-500 font-bold">{errors.districts}</p>}
              </div>

              {/* Row 4 - Short Bio */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Short Bio (Max 300 chars)</label>
                  <span className={`text-[10px] font-bold ${bio.length > 300 ? 'text-red-500' : 'text-neutral-400'}`}>
                    {bio.length} / 300
                  </span>
                </div>
                <textarea
                  placeholder="Tell buyers about your experience and expertise..."
                  maxLength={300}
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-blue-500 rounded-xl text-xs font-bold outline-none focus:ring-1 resize-none"
                />
              </div>
            </div>

            {/* GROUP 3 — Social Media (Optional) */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-blue-600" />
                <h3 className="text-base font-black text-neutral-800 uppercase tracking-wider">
                  Social Media Links (Optional)
                </h3>
              </div>
              <hr className="border-neutral-100" />

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Facebook Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/username"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-blue-500 rounded-xl text-xs font-bold outline-none focus:ring-1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Instagram Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/username"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-blue-500 rounded-xl text-xs font-bold outline-none focus:ring-1"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-blue-500 rounded-xl text-xs font-bold outline-none focus:ring-1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Personal Website URL</label>
                  <input
                    type="url"
                    placeholder="https://www.yourwebsite.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:ring-blue-500 rounded-xl text-xs font-bold outline-none focus:ring-1"
                  />
                </div>
              </div>
            </div>

            {/* GROUP 4 — Agreements */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.agreeTerms) setErrors(prev => ({ ...prev, agreeTerms: '' }));
                  }}
                  className="mt-1 h-4 w-4 rounded text-blue-600 border-neutral-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[11px] text-neutral-500 font-bold select-none leading-relaxed">
                  I agree to LankaProperty.lk's Terms of Service and Privacy Policy *
                </span>
              </label>
              {errors.agreeTerms && <p className="text-[10px] text-red-500 font-bold pl-7">{errors.agreeTerms}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmLicense}
                  onChange={(e) => {
                    setConfirmLicense(e.target.checked);
                    if (errors.confirmLicense) setErrors(prev => ({ ...prev, confirmLicense: '' }));
                  }}
                  className="mt-1 h-4 w-4 rounded text-blue-600 border-neutral-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[11px] text-neutral-500 font-bold select-none leading-relaxed">
                  I confirm I am a licensed real estate professional or working under a licensed real estate agency *
                </span>
              </label>
              {errors.confirmLicense && <p className="text-[10px] text-red-500 font-bold pl-7">{errors.confirmLicense}</p>}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4.5 bg-[#1a2340] hover:bg-[#11172a] disabled:bg-neutral-300 text-white font-black rounded-2xl transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Agent Account...</span>
                  </>
                ) : (
                  <>
                    <span>🏢 Create My Agent Account</span>
                  </>
                )}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => onNavigate({ type: 'sell' })}
                  className="text-xs font-black text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  Are you a Property Owner (not an Agent)?{' '}
                  <span className="text-[#004f31] underline">Register as Owner →</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>

      {/* ════════════════════════════════════════
          SUCCESS MODAL
          ════════════════════════════════════════ */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-neutral-100 text-center space-y-6"
            >
              <div className="mx-auto h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <CheckCircle size={40} className="stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-neutral-900 leading-tight">
                  Welcome to LankaProperty.lk Agent Network!
                </h3>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  Your account is being reviewed by our administrative team. <br />
                  <span className="font-extrabold text-neutral-700">You can start adding premium property listings right now!</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  toast.success("Redirecting to publish your first verified property listing.");
                  onNavigate({ type: 'publish' });
                }}
                className="w-full py-4 bg-[#1a2340] hover:bg-[#11172a] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-blue-950/20 text-center"
              >
                Go to My Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
