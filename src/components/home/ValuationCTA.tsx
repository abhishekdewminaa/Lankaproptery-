import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, ArrowRight, CheckCircle2, Calculator, ShieldCheck, MapPin } from 'lucide-react';

export function ValuationCTA() {
  const [propertyType, setPropertyType] = useState('House');
  const [location, setLocation] = useState('');
  const [sizeValue, setSizeValue] = useState('');
  const [sizeUnit, setSizeUnit] = useState('Perches');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setError('Please specify the location (City or District).');
      return;
    }
    if (!sizeValue.trim() || isNaN(Number(sizeValue)) || Number(sizeValue) <= 0) {
      setError('Please provide a valid numeric size.');
      return;
    }
    if (!contactInfo.trim()) {
      setError('Please enter an email or phone number.');
      return;
    }

    setError('');
    setIsSubmitted(true);
  };

  return (
    <section id="valuation-section" className="py-12 bg-[#f8fafc] border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div 
          id="valuation-banner" 
          className="bg-gradient-to-br from-[#0a4225] to-[#042010] rounded-[32px] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-8 items-center"
        >
          {/* Decorative ambient glowing backdrops */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#0a4225]/30 blur-[80px] rounded-full pointer-events-none" />

          {/* Left Column: Text & Marketing Details */}
          <div className="flex-1 space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/35 px-4 py-2 rounded-full">
              <Landmark size={16} className="text-emerald-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-300">Instant Appraisal</span>
            </div>
            
            <h2 id="valuation-title" className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Curious about your property's current market value?
            </h2>
            
            <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed font-medium">
              Get a free, data-driven valuation estimate from our Sri Lankan real estate experts in minutes. Our team aggregates local transaction data and active listings to deliver an accurate price guide.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-emerald-900/40">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Calculator size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Algorithmic Match</h4>
                  <p className="text-xs text-emerald-100/60 mt-0.5">Cross-referenced with 10k+ local sales indexes.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">100% Confidential</h4>
                  <p className="text-xs text-emerald-100/60 mt-0.5">Your personal data is protected and never shared.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Floating White Form Card */}
          <div className="w-full lg:w-[480px] relative z-10 shrink-0">
            <div 
              id="valuation-form-card" 
              className="bg-white rounded-3xl p-5 sm:p-6 text-gray-900 shadow-2xl border border-gray-100 relative min-h-[360px] flex flex-col justify-center"
            >
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form 
                    key="valuation-form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                    id="free-valuation-form"
                  >
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-gray-900">Estimate Value</h3>
                      <p className="text-xs text-gray-400 font-medium mt-1">Submit details below to query active neighborhood records.</p>
                    </div>

                    {error && (
                      <div id="valuation-form-error" className="p-3 text-xs bg-red-50 text-red-700 font-bold rounded-xl border border-red-100">
                        ⚠️ {error}
                      </div>
                    )}

                    {/* Property Type Dropdown */}
                    <div className="space-y-1.5">
                      <label htmlFor="valuation-prop-type" className="text-xs font-black text-gray-400 uppercase tracking-wider">Property Type</label>
                      <select
                        id="valuation-prop-type"
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Bare Land">Bare Land</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>

                    {/* Location Text Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="valuation-location" className="text-xs font-black text-gray-400 uppercase tracking-wider">Location / City</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          id="valuation-location"
                          placeholder="e.g. Colombo 07, Kandy, Negombo"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Size Inputs Side-by-Side */}
                    <div className="space-y-1.5">
                      <label htmlFor="valuation-size-val" className="text-xs font-black text-gray-400 uppercase tracking-wider block">Property Size</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          id="valuation-size-val"
                          placeholder="Size Value"
                          min="1"
                          step="any"
                          value={sizeValue}
                          onChange={(e) => setSizeValue(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all"
                        />
                        <select
                          id="valuation-size-unit"
                          value={sizeUnit}
                          onChange={(e) => setSizeUnit(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all cursor-pointer"
                        >
                          <option value="Perches">Perches</option>
                          <option value="Sq. Ft">Sq. Ft</option>
                          <option value="Acres">Acres</option>
                        </select>
                      </div>
                    </div>

                    {/* Contact Info (Email or Phone number) */}
                    <div className="space-y-1.5">
                      <label htmlFor="valuation-contact" className="text-xs font-black text-gray-400 uppercase tracking-wider">Contact Info</label>
                      <input
                        type="text"
                        id="valuation-contact"
                        placeholder="Email or Mobile Number"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="valuation-submit-btn"
                      className="w-full h-12 bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      Get Free Valuation <ArrowRight size={14} />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="valuation-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-5"
                    id="valuation-success-container"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-600 mb-2">
                      <CheckCircle2 size={36} className="animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h3 id="valuation-success-heading" className="text-xl font-black text-gray-900 tracking-tight">
                        Appraisal Initiated
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed font-medium">
                        Thank you! Our valuation experts are analyzing your area and will contact you shortly.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2.5">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SUBMITTED DETAILS</div>
                      <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                        <span className="text-gray-400 font-bold">Property Type:</span>
                        <span className="text-gray-800 font-black text-right">{propertyType}</span>
                        <span className="text-gray-400 font-bold">Location:</span>
                        <span className="text-gray-800 font-black text-right truncate">{location}</span>
                        <span className="text-gray-400 font-bold">Size:</span>
                        <span className="text-gray-800 font-black text-right">{sizeValue} {sizeUnit}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setLocation('');
                        setSizeValue('');
                        setContactInfo('');
                      }}
                      id="valuation-reset-btn"
                      className="text-xs text-[#0a4225] hover:text-[#072d19] font-black underline cursor-pointer"
                    >
                      Estimate Another Property
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
