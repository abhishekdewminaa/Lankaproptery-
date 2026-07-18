import { safeLocalStorage } from '../utils/safeUtils';
import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck, CreditCard, Lock, ArrowLeft, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

interface OwnerPaymentPageProps {
  onNavigate: (view: any) => void;
  onLogout: () => void;
}

export const OwnerPaymentPage: React.FC<OwnerPaymentPageProps> = ({ onNavigate, onLogout }) => {
  const [plan, setPlan] = useState<string>('premium_pro');
  const [loading, setLoading] = useState(false);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Pre-filled owner details
  const ownerName = safeLocalStorage.getItem('owner_name') || 'Guest User';
  const ownerEmail = safeLocalStorage.getItem('owner_email') || '';
  const ownerId = safeLocalStorage.getItem('owner_id') || '';

  useEffect(() => {
    document.title = "Secure Ad Checkout — LankaProperty.lk";
    const params = new URLSearchParams(window.location.search);
    const urlPlan = params.get('plan') || 'premium_pro';
    setPlan(urlPlan);

    // Ensure they are logged in and have owner_logged_in flag
    if (safeLocalStorage.getItem('owner_logged_in') !== 'true') {
      toast.error('Please login first to access the payment checkout.');
      window.history.pushState(null, "", `/owner/login?plan=${urlPlan}`);
      onNavigate({ type: 'owner_login', data: { plan: urlPlan } });
    }
  }, [onNavigate]);

  const planDetails = {
    premium_pro: {
      name: 'Premium Pro',
      price: 4500,
      period: '2 Months',
      durationDays: 60,
      features: [
        '60 Days Premium Exposure',
        'Featured Position (Top 10 Rankings)',
        'Multi-Site Syndication Across 10 Partner Sites',
        'WhatsApp Lead Generation Alerts',
        'Priority Search and Filter Boosting',
        'Dedicated Email & WhatsApp Support'
      ]
    },
    elite_pro: {
      name: 'Elite Pro',
      price: 8500,
      period: '3 Months',
      durationDays: 90,
      features: [
        '90 Days Maximum Exposure',
        'Top-Shelf Agency Level Branding',
        '360° Interactive Virtual Tour Integration',
        'Verified Seller Gold Badge',
        'Priority Home Slider Placement',
        'Dedicated Client Success Manager'
      ]
    }
  }[plan] || {
    name: 'Premium Pro',
    price: 4500,
    period: '2 Months',
    durationDays: 60,
    features: []
  };

  const formattedPrice = `Rs. ${planDetails.price.toLocaleString('en-US')}`;
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + planDetails.durationDays);

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Start sandbox simulation modal
    setCardName(ownerName);
    setShowSandboxModal(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setShowSandboxModal(false);

    const toastId = toast.loading('Initiating PayHere sandbox verification...');

    try {
      const orderId = 'LP-' + Math.floor(100000 + Math.random() * 900000);
      const nowString = new Date().toISOString();
      const expiresString = endDate.toISOString();

      // 1. Insert into owner_packages table
      const { error: pkgError } = await supabase
        .from('owner_packages')
        .insert([{
          user_id: ownerId,
          package_type: plan,
          price_lkr: planDetails.price,
          duration_days: planDetails.durationDays,
          payment_status: 'paid',
          payment_reference: orderId,
          is_active: true,
          started_at: nowString,
          expires_at: expiresString
        }]);

      if (pkgError) {
        console.warn('Failed inserting owner_packages:', pkgError);
      }

      // 2. Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          package_type: plan,
          package_started_at: nowString,
          package_expires_at: expiresString,
          package_paid: true,
          package_price: planDetails.price,
          selected_package: planDetails.name
        })
        .eq('id', ownerId);

      if (userError) {
        console.warn('Failed updating users table:', userError);
      }

      // 3. Insert into payments table (For AdminRevenue to pick up instantly!)
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: ownerId,
          amount_lkr: planDetails.price,
          amount: planDetails.price,
          currency: 'LKR',
          status: 'paid',
          payment_method: 'payhere',
          reference: orderId,
          paid_at: nowString,
          created_at: nowString
        }]);

      if (paymentError) {
        console.warn('Failed inserting payments:', paymentError);
      }

      // Notify other active tabs / real-time (can also trigger email notifications)
      toast.success('Payment authorized and received!', { id: toastId });

      // Redirect to success screen with URL params
      const successUrl = `/owner/payment/success?plan=${plan}&price=${planDetails.price}&ref=${orderId}`;
      window.history.pushState(null, "", successUrl);
      onNavigate({ 
        type: 'owner_payment_success', 
        data: { plan, price: planDetails.price, orderId } 
      });

    } catch (err) {
      console.error('Payment exception:', err);
      toast.error('An error occurred while communicating with PayHere gateway.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = () => {
    toast.error('Payment was cancelled. Your account is still active on the Starter Free plan. You can upgrade anytime from your dashboard.', {
      duration: 6000,
      icon: 'ℹ'
    });
    // Redirect to dashboard or home
    window.history.pushState(null, "", `/owner/dashboard`);
    onNavigate({ type: 'owner_dashboard' });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Link */}
        <button
          onClick={() => {
            window.history.pushState(null, "", `/post-property`);
            onNavigate({ type: 'sell' });
          }}
          className="flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-[#1A5E2A] mb-8 group transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Packages
        </button>

        {/* Two-Column Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Order Summary */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-md border border-neutral-100">
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">
                Activate Your Ad Package
              </h2>
              <p className="text-sm font-semibold text-neutral-500 mb-6">
                Complete your secure payment via PayHere to launch your premium property listing instantly.
              </p>

              {/* Order Summary Card */}
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/60 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Selected Plan</span>
                    <h3 className="text-lg font-black text-[#1A5E2A] mt-0.5">{planDetails.name} Plan</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Duration</span>
                    <p className="text-sm font-bold text-neutral-700 mt-0.5">{planDetails.period}</p>
                  </div>
                </div>

                <div className="py-4 border-b border-neutral-200 space-y-2.5">
                  <div className="flex justify-between text-xs font-semibold text-neutral-500">
                    <span>Activated on</span>
                    <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-500">
                    <span>Valid until</span>
                    <span>{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2.5">
                  <div className="flex justify-between text-xs font-semibold text-neutral-500">
                    <span>Subtotal</span>
                    <span>{formattedPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-500">
                    <span>Processing Fees / VAT</span>
                    <span>Rs. 0</span>
                  </div>
                  <hr className="border-neutral-200 my-2" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-black uppercase text-neutral-800">Total Due (LKR)</span>
                    <span className="text-2xl font-black text-[#1A5E2A]">{formattedPrice}</span>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">Includes These Features:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planDetails.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs font-bold text-neutral-600">
                      <div className="mt-0.5 rounded-full p-0.5 bg-emerald-50 text-emerald-600 shrink-0">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Badges */}
              <div className="border-t border-neutral-100 pt-6 mt-8 flex flex-wrap justify-between items-center gap-4 text-[10px] font-black tracking-wider text-neutral-400 uppercase">
                <span className="flex items-center gap-1.5"><Lock size={14} className="text-emerald-600" /> 256-Bit SSL Encryption</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-600" /> Instant Activation</span>
                <span>•</span>
                <span>🔄 100% Satisfaction Guarantee</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Payment Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-md border border-neutral-100">
              <h2 className="text-xl font-black text-neutral-900 tracking-tight mb-4">
                Payment Details
              </h2>

              {/* Account Info Bar */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/60 flex items-center justify-between mb-6">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Billing Account</span>
                  <p className="text-xs font-bold text-neutral-800 mt-0.5">{ownerName}</p>
                  <p className="text-[10px] text-neutral-500 font-semibold">{ownerEmail}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-600 hover:underline"
                >
                  Sign Out
                </button>
              </div>

              {/* PayHere details */}
              <div className="space-y-4">
                <div className="border border-emerald-100 bg-[#f0fdf4]/50 rounded-2xl p-4 flex gap-3">
                  <div className="h-6 w-12 bg-white rounded border flex items-center justify-center text-[10px] font-black tracking-tight text-[#1A5E2A] border-neutral-100 shrink-0">
                    Pay<span className="text-emerald-500 font-semibold">Here</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800">Pay securely with PayHere Gateway</h4>
                    <p className="text-[10px] text-neutral-500 font-semibold mt-0.5">
                      Visa, Mastercard, AMEX, Genie, eZCash, mCash, and internet banking accepted.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center items-center gap-2 py-4">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4 object-contain opacity-60" alt="Visa" referrerPolicy="no-referrer" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6 object-contain opacity-60" alt="Mastercard" referrerPolicy="no-referrer" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" className="h-4 object-contain opacity-60" alt="AMEX" referrerPolicy="no-referrer" />
                </div>

                {/* Secure checkout trigger form */}
                <form onSubmit={handleStartPayment} className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#1A5E2A] hover:bg-[#0F3D1A] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Lock size={14} /> Confirm & Pay {formattedPrice} Securely →
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelPayment}
                    className="w-full py-3 bg-transparent hover:bg-neutral-50 text-neutral-500 hover:text-neutral-700 font-black text-xs uppercase tracking-widest rounded-2xl transition-all text-center"
                  >
                    Cancel Payment
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════
          SANDBOX PAYHERE MODAL OVERLAY
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showSandboxModal && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl border border-neutral-100 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSandboxModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-4">
                  <div className="h-6 w-12 bg-[#1A5E2A] rounded flex items-center justify-center text-[10px] font-black tracking-tight text-white shrink-0">
                    Pay<span className="text-yellow-400 font-semibold">Here</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">Sandbox Test</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-neutral-900">Enter Payment Details</h3>
                  <p className="text-[11px] font-semibold text-neutral-400 mt-0.5">Simulate a successful payment for testing purposes</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Deshani Kaushalya"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 1111 1111 1111"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">CVC / CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex gap-2">
                  <span className="text-base mt-0.5">⚠️</span>
                  <p className="text-[10px] text-yellow-800 font-semibold leading-normal">
                    Sandbox Mode is ON. Clicking below will authorize a simulated transaction of <strong>{formattedPrice}</strong>. No money will be moved.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowSandboxModal(false)}
                    className="py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider text-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider text-center shadow-lg shadow-emerald-600/15"
                  >
                    Authorize Test
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
