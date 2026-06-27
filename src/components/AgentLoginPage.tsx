import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Home, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

interface AgentLoginPageProps {
  onLoginSuccess: (agentData: { id: string; email: string; name: string; phone?: string; agency?: string; is_verified?: boolean; image?: string }) => void;
  onBackToHome: () => void;
  onNavigateToRegister: () => void;
  onNavigate?: (view: any) => void;
}

const DEMO_AGENTS = [
  {
    id: "agent_deshani",
    email: "deshani@lankaproperty.lk",
    name: "Deshani Kaushalya",
    phone: "+94 71 555 1234",
    agency: "Kaushalya Real Estate",
    is_verified: true,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "agent_lalith",
    email: "lalith@lankaproperty.lk",
    name: "Lion Lalith Ranatunga",
    phone: "+94 77 395 1560",
    agency: "Lanka Premier Lands",
    is_verified: true,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "agent_chamath",
    email: "chamath@lankaproperty.lk",
    name: "Chamath Wickramasooriya",
    phone: "+94 77 123 4567",
    agency: "Wickramasooriya Associates",
    is_verified: false,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

export const AgentLoginPage: React.FC<AgentLoginPageProps> = ({ 
  onLoginSuccess, 
  onBackToHome, 
  onNavigateToRegister,
  onNavigate
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // 1. Check if email is a Demo agent
      const demoMatch = DEMO_AGENTS.find(a => a.email.toLowerCase() === email.toLowerCase().trim());
      if (demoMatch) {
        setTimeout(() => {
          setIsSubmitting(false);
          toast.success(`Welcome back, ${demoMatch.name}! Authenticated successfully.`);
          
          // Save login info in localStorage
          localStorage.setItem('agent_logged_in', 'true');
          localStorage.setItem('agent_user_id', demoMatch.id);
          localStorage.setItem('agent_name', demoMatch.name);
          localStorage.setItem('agent_email', demoMatch.email);
          localStorage.setItem('agent_phone', demoMatch.phone);
          localStorage.setItem('agent_agency', demoMatch.agency);
          localStorage.setItem('agent_image', demoMatch.image);
          localStorage.setItem('agent_is_verified', String(demoMatch.is_verified));
          localStorage.setItem('user_role', 'agent');

          onLoginSuccess(demoMatch);
        }, 1000);
        return;
      }

      // 2. Real Supabase Auth execution
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        // Fallback checks on custom users table if auth is not set up
        const { data: customUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.trim())
          .maybeSingle();

        if (customUser) {
          if (customUser.role !== 'agent') {
            toast.error(
              (t) => (
                <span className="text-xs">
                  This login is for real estate agents. Selling your own property?{' '}
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      window.history.pushState(null, "", `/owner/login`);
                      if (onNavigate) onNavigate({ type: 'owner_login' });
                    }}
                    className="underline font-bold text-brand-green"
                  >
                    Click here for Property Seller Login →
                  </button>
                </span>
              ),
              { duration: 8000 }
            );
            setIsSubmitting(false);
            return;
          }

          // Fetch agent details
          const { data: agentDetails } = await supabase
            .from('agents')
            .select('*')
            .eq('id', customUser.id)
            .maybeSingle();

          setIsSubmitting(false);
          toast.success(`Successfully signed in as ${customUser.full_name}`);
          
          const agentObj = {
            id: customUser.id,
            email: customUser.email,
            name: customUser.full_name,
            phone: customUser.phone,
            agency: agentDetails?.agency_name || '',
            is_verified: agentDetails?.is_verified || false,
            image: agentDetails?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
          };

          localStorage.setItem('agent_logged_in', 'true');
          localStorage.setItem('agent_user_id', agentObj.id);
          localStorage.setItem('agent_name', agentObj.name);
          localStorage.setItem('agent_email', agentObj.email);
          localStorage.setItem('agent_phone', agentObj.phone || '');
          localStorage.setItem('agent_agency', agentObj.agency);
          localStorage.setItem('agent_image', agentObj.image);
          localStorage.setItem('agent_is_verified', String(agentObj.is_verified));
          localStorage.setItem('user_role', 'agent');

          onLoginSuccess(agentObj);
          return;
        }

        throw new Error(authError.message || 'Authentication failed');
      }

      if (authData?.user) {
        const uid = authData.user.id;
        
        // Check users table for agent role
        const { data: dbUser, error: dbUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', uid)
          .maybeSingle();

        if (dbUserError || !dbUser) {
          // Auto create role = agent if logged in successfully but db entry is missing
          const { data: agentDetails } = await supabase
            .from('agents')
            .select('*')
            .eq('id', uid)
            .maybeSingle();

          const agentObj = {
            id: uid,
            email: authData.user.email || email,
            name: authData.user.user_metadata?.full_name || 'Agent User',
            phone: agentDetails?.phone || '',
            agency: agentDetails?.agency_name || '',
            is_verified: agentDetails?.is_verified || false,
            image: agentDetails?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
          };

          localStorage.setItem('agent_logged_in', 'true');
          localStorage.setItem('agent_user_id', agentObj.id);
          localStorage.setItem('agent_name', agentObj.name);
          localStorage.setItem('agent_email', agentObj.email);
          localStorage.setItem('agent_phone', agentObj.phone);
          localStorage.setItem('agent_agency', agentObj.agency);
          localStorage.setItem('agent_image', agentObj.image);
          localStorage.setItem('agent_is_verified', String(agentObj.is_verified));
          localStorage.setItem('user_role', 'agent');

          onLoginSuccess(agentObj);
        } else {
          if (dbUser.role !== 'agent') {
            toast.error(
              (t) => (
                <span className="text-xs">
                  This login is for real estate agents. Selling your own property?{' '}
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      window.history.pushState(null, "", `/owner/login`);
                      if (onNavigate) onNavigate({ type: 'owner_login' });
                    }}
                    className="underline font-bold text-brand-green"
                  >
                    Click here for Property Seller Login →
                  </button>
                </span>
              ),
              { duration: 8000 }
            );
            setIsSubmitting(false);
            return;
          }

          const { data: agentDetails } = await supabase
            .from('agents')
            .select('*')
            .eq('id', uid)
            .maybeSingle();

          const agentObj = {
            id: uid,
            email: dbUser.email,
            name: dbUser.full_name,
            phone: dbUser.phone,
            agency: agentDetails?.agency_name || '',
            is_verified: agentDetails?.is_verified || false,
            image: agentDetails?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
          };

          localStorage.setItem('agent_logged_in', 'true');
          localStorage.setItem('agent_user_id', agentObj.id);
          localStorage.setItem('agent_name', agentObj.name);
          localStorage.setItem('agent_email', agentObj.email);
          localStorage.setItem('agent_phone', agentObj.phone || '');
          localStorage.setItem('agent_agency', agentObj.agency);
          localStorage.setItem('agent_image', agentObj.image);
          localStorage.setItem('agent_is_verified', String(agentObj.is_verified));
          localStorage.setItem('user_role', 'agent');

          onLoginSuccess(agentObj);
        }
      }
    } catch (err: any) {
      console.error('Sign in exception:', err);
      // Fallback for custom login if offline/development
      toast.error(err.message || 'Invalid agent credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (demo: typeof DEMO_AGENTS[0]) => {
    setEmail(demo.email);
    setPassword('••••••••');
    
    toast.success(`Prefilled demo account for ${demo.name}`);
    
    // Auto submit or let user click
    localStorage.setItem('agent_logged_in', 'true');
    localStorage.setItem('agent_user_id', demo.id);
    localStorage.setItem('agent_name', demo.name);
    localStorage.setItem('agent_email', demo.email);
    localStorage.setItem('agent_phone', demo.phone);
    localStorage.setItem('agent_agency', demo.agency);
    localStorage.setItem('agent_image', demo.image);
    localStorage.setItem('agent_is_verified', String(demo.is_verified));
    localStorage.setItem('user_role', 'agent');

    onLoginSuccess(demo);
  };

  return (
    <div id="agent-login-root" className="fixed inset-0 z-50 flex flex-col md:flex-row bg-[#f8fafc] text-neutral-900 font-sans antialiased">
      
      {/* LEFT COLUMN - THE AGENT FOCUS */}
      <div className="relative w-full md:w-[45%] flex flex-col justify-between p-8 md:p-12 overflow-hidden bg-[#1a2340]">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center mix-blend-overlay opacity-25 pointer-events-none"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1526] via-[#1a2340]/95 to-[#1a2340]/80 z-0 pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-[#1a2340] font-black shadow-md">
            <Users size={22} className="text-[#1a2340]" />
          </div>
          <span className="text-xl font-black text-white uppercase tracking-tight">
            LankaProperty<span className="text-[#3b82f6]">.lk</span>
          </span>
        </div>

        {/* Center */}
        <div className="relative z-10 my-auto py-12 space-y-5 max-w-sm">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
            AGENT CENTRAL PORTAL
          </div>
          <h1 className="text-3.5xl md:text-4xl font-black text-white leading-tight tracking-tight">
            Maximize Your Sales Potential
          </h1>
          <p className="text-neutral-300 text-sm leading-relaxed font-medium">
            Manage listing pipelines, respond to hot WhatsApp leads instantly, track analytics and showcase your professional real estate portfolio.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest border-t border-white/10 pt-4">
          <span>PORTAL VER. 2.5</span>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span>REALTIME LEADS</span>
        </div>
      </div>

      {/* RIGHT COLUMN - SECURE LOG IN */}
      <div className="w-full md:w-[55%] flex flex-col justify-between p-8 md:p-16 lg:p-24 bg-white relative overflow-y-auto">
        
        {/* Back navigation */}
        <button 
          onClick={onBackToHome}
          className="absolute top-6 right-6 md:top-12 md:right-12 flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-[#1a2340] uppercase tracking-widest transition-colors duration-200 cursor-pointer"
        >
          <Home size={14} />
          Back to Home
        </button>

        <div className="my-auto max-w-md w-full mx-auto space-y-8 py-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
              Agent Sign In
            </h2>
            <p className="text-sm text-neutral-500 font-semibold">
              Enter your agent credentials or choose a quick demo account below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">
                EMAIL ADDRESS
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-blue-600 transition-colors duration-200">
                  <Mail size={16} />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-transparent rounded-xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-blue-600 transition-all duration-200"
                  placeholder="agent@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">
                  PASSWORD
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-blue-600 transition-colors duration-200">
                  <Lock size={16} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-transparent rounded-xl py-3.5 pl-11 pr-11 text-xs font-bold outline-none text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-blue-600 transition-all duration-200"
                  placeholder="••••••••••••"
                  required={!DEMO_AGENTS.some(a => a.email.toLowerCase() === email.toLowerCase().trim())}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1a2340] hover:bg-[#111827] text-white text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-xl shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  SIGN IN TO PORTAL <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* REGISTER REDIRECT */}
          <div className="text-center pt-2">
            <p className="text-xs font-semibold text-neutral-500">
              New to our agent portal?{" "}
              <button 
                onClick={onNavigateToRegister}
                className="text-blue-600 hover:text-blue-800 font-extrabold underline cursor-pointer"
              >
                Register as an Agent Now →
              </button>
            </p>
          </div>

          {/* DEMO ACCOUNTS ACCORDION */}
          <div className="border-t border-neutral-100 pt-6">
            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">
              ⚡ Sandbox Demo Accounts (Instant Test Login)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_AGENTS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleDemoLogin(demo)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[#f8fafc] border border-neutral-200 hover:bg-blue-50/50 hover:border-blue-200 text-left transition-all duration-200 cursor-pointer"
                >
                  <img src={demo.image} className="w-8 h-8 rounded-full object-cover border border-neutral-200 flex-shrink-0" alt="" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-neutral-800 truncate leading-tight">{demo.name.split(' ').slice(-1)[0]}</p>
                    <p className="text-[9px] font-bold text-neutral-400 truncate leading-none">Role: Agent</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-6 border-t border-neutral-100 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-blue-600" />
            <span>SECURED AGENT LOGIN</span>
          </div>
        </div>

      </div>

    </div>
  );
};
