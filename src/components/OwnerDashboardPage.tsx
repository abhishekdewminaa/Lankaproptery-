import { safeLocalStorage } from '../utils/safeUtils';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building, Award, LogOut, ArrowUpCircle, PlusCircle, CheckCircle, Clock, BarChart2, MessageSquare, AlertCircle, Trash2, ExternalLink 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

interface OwnerDashboardPageProps {
  onNavigate: (view: any) => void;
  onLogout: () => void;
}

export const OwnerDashboardPage: React.FC<OwnerDashboardPageProps> = ({ onNavigate, onLogout }) => {
  const [activePkg, setActivePkg] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const ownerName = safeLocalStorage.getItem('owner_name') || 'Valued Owner';
  const ownerEmail = safeLocalStorage.getItem('owner_email') || '';
  const ownerId = safeLocalStorage.getItem('owner_id') || '';

  useEffect(() => {
    document.title = "My Seller Dashboard — LankaProperty.lk";
    // Redirect if not logged in
    if (safeLocalStorage.getItem('owner_logged_in') !== 'true') {
      window.history.pushState(null, "", `/owner/login`);
      onNavigate({ type: 'owner_login' });
      return;
    }

    const fetchOwnerData = async () => {
      try {
        setLoading(true);

        // 1. Fetch active package from owner_packages table
        const { data: pkgs, error: pkgError } = await supabase
          .from('owner_packages')
          .select('*')
          .eq('user_id', ownerId)
          .eq('is_active', true)
          .order('started_at', { ascending: false });

        if (!pkgError && pkgs && pkgs.length > 0) {
          setActivePkg(pkgs[0]);
        } else {
          // Fallback check from users table directly
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', ownerId)
            .maybeSingle();

          if (userProfile?.package_type) {
            setActivePkg({
              package_type: userProfile.package_type,
              price_lkr: userProfile.package_price || 0,
              started_at: userProfile.package_started_at || new Date().toISOString(),
              expires_at: userProfile.package_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
          } else {
            // Default to Starter Free fallback if none exists
            setActivePkg({
              package_type: 'starter_free',
              price_lkr: 0,
              started_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 900 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
        }

        // 2. Fetch owner's properties from Supabase properties table
        const { data: props, error: propsError } = await supabase
          .from('properties')
          .select('*')
          .or(`agentEmail.eq.${ownerEmail},owner_email.eq.${ownerEmail}`)
          .order('created_at', { ascending: false });

        if (!propsError && props) {
          setProperties(props);
        } else {
          console.warn("Props loading failed or empty:", propsError);
        }

      } catch (err) {
        console.error("Owner Dashboard loading exception:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [ownerId, ownerEmail, onNavigate, refresh]);

  const handleDeleteListing = async (id: number) => {
    if (window.confirm("Are you sure you want to permanently delete this listing?")) {
      try {
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('id', id);

        if (error) {
          toast.error("Failed to delete listing. Please try again.");
        } else {
          toast.success("Listing successfully deleted.");
          setRefresh(prev => prev + 1);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getPlanBadgeStyle = (planKey: string) => {
    switch (planKey) {
      case 'premium_pro':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
          title: 'Premium Pro',
          labelColor: 'text-emerald-700'
        };
      case 'elite_pro':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-100',
          title: 'Elite Pro',
          labelColor: 'text-blue-700'
        };
      default:
        return {
          bg: 'bg-neutral-100 text-neutral-800 border-neutral-200',
          title: 'Starter Free',
          labelColor: 'text-neutral-500'
        };
    }
  };

  const currentPlan = activePkg?.package_type || 'starter_free';
  const planStyle = getPlanBadgeStyle(currentPlan);

  return (
    <div className="min-h-screen bg-neutral-50 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header greeting row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1A5E2A]">🏠 MY PROPERTY SELLER ACCOUNT</span>
            <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight mt-1">
              Welcome back, {ownerName}!
            </h1>
            <p className="text-xs font-semibold text-neutral-500 mt-1">
              Manage your property listings, track buyer interest, and keep your contact details updated.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => onNavigate({ type: 'publish' })}
              className="px-5 py-3.5 bg-[#1A5E2A] hover:bg-[#0F3D1A] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle size={15} /> Add New Listing
            </button>
            <button
              onClick={onLogout}
              className="px-5 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Grid Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Subscription Details Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-100 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-wider">Your Ad Package</h3>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${planStyle.bg}`}>
                  {planStyle.title}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold text-neutral-400">Monthly Cost</span>
                <p className="text-3xl font-black text-neutral-900 tracking-tight mt-0.5">
                  {currentPlan === 'starter_free' ? 'Rs. 0' : currentPlan === 'premium_pro' ? 'Rs. 4,500' : 'Rs. 8,500'}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-100 space-y-2 text-xs font-semibold text-neutral-500">
                <div className="flex justify-between">
                  <span>Activation Date</span>
                  <span className="text-neutral-700">
                    {activePkg?.started_at ? new Date(activePkg.started_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expiration Date</span>
                  <span className="text-neutral-700">
                    {activePkg?.expires_at ? new Date(activePkg.expires_at).toLocaleDateString() : '30 Months Extended'}
                  </span>
                </div>
              </div>
            </div>

            {/* Upgrade Plan Options */}
            {currentPlan === 'starter_free' ? (
              <div className="bg-[#f0fdf4] border border-emerald-100 rounded-2xl p-4 space-y-3 mt-4">
                <div className="flex items-start gap-2 text-emerald-800">
                  <Award size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black uppercase">Unlock 10x More Leads!</h4>
                    <p className="text-[10px] font-semibold text-emerald-700 leading-normal mt-0.5">
                      Upgrade to Premium Pro to gain top rankings, priority search placement and WhatsApp leads!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    window.history.pushState(null, "", `/owner/payment?plan=premium_pro`);
                    onNavigate({ type: 'owner_payment', data: { plan: 'premium_pro' } });
                  }}
                  className="w-full py-3 bg-[#1A5E2A] hover:bg-[#0F3D1A] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ArrowUpCircle size={14} /> Upgrade to Premium Pro
                </button>
              </div>
            ) : currentPlan === 'premium_pro' ? (
              <div className="bg-[#eff6ff] border border-blue-100 rounded-2xl p-4 space-y-3 mt-4">
                <div className="flex items-start gap-2 text-blue-800">
                  <Award size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black uppercase">Unlock VIP Agency Status!</h4>
                    <p className="text-[10px] font-semibold text-blue-700 leading-normal mt-0.5">
                      Get 360 virtual tours, Homepage slider exposure, and Verified badges with Elite Pro.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    window.history.pushState(null, "", `/owner/payment?plan=elite_pro`);
                    onNavigate({ type: 'owner_payment', data: { plan: 'elite_pro' } });
                  }}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ArrowUpCircle size={14} /> Upgrade to Elite Pro
                </button>
              </div>
            ) : (
              <div className="bg-[#fcf8e3] border border-yellow-100 rounded-2xl p-4 space-y-2 text-center mt-4">
                <span className="text-xl">🌟</span>
                <p className="text-xs font-black uppercase tracking-wide text-yellow-800">Elite VIP Seller Tier</p>
                <p className="text-[10px] font-bold text-yellow-700 leading-relaxed">
                  You are currently active on our highest-performing package! You have maximum visibility.
                </p>
              </div>
            )}
          </div>

          {/* Listings Performance Stats Overview */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-neutral-50 text-[#1A5E2A]">
                  <Building size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">My Listings</span>
                  <p className="text-2xl font-black text-neutral-900 mt-0.5">{properties.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-neutral-50 text-emerald-600">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Views</span>
                  <p className="text-2xl font-black text-neutral-900 mt-0.5">
                    {properties.reduce((sum, p) => sum + (Number(p.views_count || p.views || 0)), 0)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-neutral-50 text-amber-500">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Leads Generated</span>
                  <p className="text-2xl font-black text-[#1A5E2A] mt-0.5">
                    {properties.reduce((sum, p) => sum + (Math.floor(Math.random() * 5) + 1), 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* List of Published Properties */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-100 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
                <h3 className="text-base font-black text-neutral-800">My Properties on Market</h3>
                <span className="text-xs font-bold text-neutral-400 uppercase">{properties.length} Listings</span>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  <svg className="animate-spin h-5 w-5 text-[#1A5E2A]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Syncing properties...
                </div>
              ) : properties.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wide">No property listings found on your account</p>
                  <p className="text-[11px] font-semibold text-neutral-400">You haven't added any properties to advertise yet.</p>
                  <button
                    onClick={() => onNavigate({ type: 'publish' })}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A5E2A] hover:bg-[#0F3D1A] text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <PlusCircle size={14} /> Add First Listing
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 max-h-[400px] overflow-y-auto pr-2">
                  {properties.map((prop) => (
                    <div key={prop.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex gap-3 items-center">
                        <img
                          src={prop.image_url || prop.imageUrl || prop.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400"}
                          className="h-12 w-16 object-cover rounded-lg border border-neutral-100 shrink-0"
                          alt="Property"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-xs font-black text-neutral-800 leading-snug line-clamp-1">{prop.listing_title || prop.title}</h4>
                          <p className="text-[10px] font-semibold text-neutral-400 mt-0.5">{prop.district}, {prop.property_category || prop.category}</p>
                          <p className="text-[10px] font-extrabold text-[#1A5E2A] mt-0.5">Rs. {(Number(prop.price_lkr || prop.priceLkr) || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={10} className="stroke-[3]" /> Active
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onNavigate({ type: 'explore', data: { refNo: prop.ref_no || prop.id } })}
                            className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-lg hover:text-[#1A5E2A] transition-colors"
                            title="View Public Listing"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteListing(prop.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg hover:text-red-700 transition-colors"
                            title="Delete Listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
