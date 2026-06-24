import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight, ShieldCheck, Zap, Star, Sparkles, Building, BarChart2, MessageSquare, Clock, Globe } from 'lucide-react';

interface AdvertisedPackagesProps {
  onSelectPackage?: (packageName: string) => void;
  onContactAgency?: () => void;
}

export const AdvertisedPackages: React.FC<AdvertisedPackagesProps> = ({
  onSelectPackage,
  onContactAgency
}) => {
  const premiumPackages = [
    {
      tier: 'PREMIUM TIER',
      name: 'GOLD PACKAGE',
      price: 'Rs. 15,000',
      period: '12 Months',
      features: [
        'Fully Website Advertising',
        '12 Months Duration',
        'Featured Property Status',
        'Social Media (WhatsApp, FB, IG, TikTok)',
      ],
      visibility: 'Visibility on: ikman.lk, LankaPropertyWeb.lk',
      isPopular: false,
      theme: 'gold',
    },
    {
      tier: 'STRATEGIC TIER',
      name: 'PLATINUM PACKAGE',
      price: 'Rs. 25,000',
      period: 'Until Sold',
      features: [
        'Advertised until sold',
        'Featured on 10 Major Websites',
        'Fully Social Media Marketing',
        'Priority Direct Support',
      ],
      visibility: 'Visibility on across our entire real estate network',
      isPopular: true,
      theme: 'platinum',
    },
    {
      tier: 'ULTIMATE TIER',
      name: 'DIAMOND PACKAGE',
      price: 'Rs. 45,000',
      period: 'Until Sold',
      features: [
        'All Platinum Tier Features',
        'High-Traffic Banner Placement',
        'Priority Listing Diagnostics',
        'Premium Web Slider (990x340 px)',
        'Dedicated Account Manager',
      ],
      visibility: 'Visibility on across our entire real estate network',
      isPopular: false,
      theme: 'diamond',
    },
  ];

  const directPlans = [
    {
      name: 'STARTER FREE',
      price: 'FREE',
      period: '30 Months',
      features: [
        '30 Months Extended Duration',
        'Standard Property Listing',
        'Basic Search Integration',
        'Email Support',
      ],
      isBestValue: false,
      buttonText: 'START FREE',
    },
    {
      name: 'PREMIUM PRO',
      price: 'Rs. 4,500',
      period: '2 Months',
      features: [
        '60 Days Exposure',
        'Featured Position (Top 10)',
        'Multi-Site Syndication',
        'WhatsApp Lead Generation',
      ],
      isBestValue: true,
      buttonText: 'GO PREMIUM',
    },
    {
      name: 'ELITE PRO',
      price: 'Rs. 8,500',
      period: '3 Months',
      features: [
        '90 Days Premium Duration',
        'Top-Shelf Branding',
        '360 Virtual Tour Base',
        'Verified Seller Badge',
      ],
      isBestValue: false,
      buttonText: 'SELECT ELITE',
    },
  ];

  const partners = [
    'LankaLand.lk',
    'ikman.lk',
    'Adsme.lk',
    'LankaProperty.lk',
    'LankaPropertyWeb.lk',
    'Jacktree.lk',
    'LankAdz.lk',
    'House.lk',
    'AdBoom.lk',
    'LankaBuySell.lk',
  ];

  const stats = [
    { value: '98%', label: 'CLIENT SATISFACTION' },
    { value: '24h', label: 'RESPONSE RATE' },
    { value: '5k+', label: 'VERIFIED AGENTS' },
    { value: '10M+', label: 'PAGEVIEWS/MO' },
  ];

  return (
    <div className="bg-neutral-50 min-h-screen pt-32 pb-16">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-[#004f31] tracking-tight mb-4">
            Advertised Packages
          </h1>
          <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto font-medium">
            Choose the perfect plan to reach over 500,000 potential buyers and renters every month in Sri Lanka.
          </p>
        </motion.div>
      </div>

      {/* Premium Tier Packages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {premiumPackages.map((pkg, idx) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-[32px] p-8 flex flex-col justify-between overflow-hidden shadow-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                pkg.theme === 'platinum'
                  ? 'bg-gradient-to-b from-[#003c25] to-[#001e12] text-white border-transparent'
                  : 'bg-white text-neutral-900 border-neutral-100'
              }`}
            >
              {/* Most Popular Badge */}
              {pkg.isPopular && (
                <div className="absolute top-0 right-0 overflow-hidden w-32 h-32 pointer-events-none">
                  <div className="absolute bg-[#da3737] text-white text-[9px] font-black tracking-widest text-center py-1.5 uppercase rotate-45 top-6 -right-6 w-36 shadow-md">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div>
                {/* Tier indicator */}
                <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${
                  pkg.theme === 'platinum' ? 'text-emerald-400' : 'text-[#004f31]'
                }`}>
                  {pkg.tier}
                </p>

                {/* Name */}
                <h3 className="text-2xl font-black tracking-tight mb-4">
                  {pkg.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline mb-6 border-b border-neutral-100/10 pb-6">
                  <span className={`text-3xl font-black tracking-tight ${
                    pkg.theme === 'platinum' ? 'text-emerald-400' : 'text-[#004f31]'
                  }`}>
                    {pkg.price}
                  </span>
                  <span className={`text-xs font-bold ml-1.5 ${
                    pkg.theme === 'platinum' ? 'text-emerald-300' : 'text-neutral-500'
                  }`}>
                    / {pkg.period}
                  </span>
                </div>

                {/* Features list */}
                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-0.5 flex items-center justify-center ${
                        pkg.theme === 'platinum' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#004f31]/10 text-[#004f31]'
                      }`}>
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <span className={`text-xs font-bold leading-normal ${
                        pkg.theme === 'platinum' ? 'text-neutral-200' : 'text-neutral-700'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Elements */}
              <div>
                {/* Visibility note */}
                {pkg.visibility && (
                  <p className={`text-[10px] italic font-semibold mb-6 ${
                    pkg.theme === 'platinum' ? 'text-neutral-400' : 'text-neutral-400'
                  }`}>
                    {pkg.visibility}
                  </p>
                )}

                {/* Action button */}
                <button
                  id={`pkg-btn-${pkg.name.toLowerCase().replace(' ', '-')}`}
                  onClick={() => onSelectPackage?.(pkg.name)}
                  className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md ${
                    pkg.theme === 'platinum'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-[#001e12] shadow-emerald-500/10'
                      : pkg.theme === 'diamond'
                      ? 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-neutral-900/10'
                      : 'bg-white hover:bg-neutral-50 text-[#004f31] border border-neutral-200'
                  }`}
                >
                  LIST YOUR PROPERTY
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Direct Publishing Plans Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight mb-3">
            Direct Publishing Plans
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto font-medium">
            Choose a plan to instantly publish your property and manage your listings through your owner dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {directPlans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-[32px] p-8 flex flex-col justify-between overflow-hidden shadow-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                plan.isBestValue
                  ? 'bg-white border-red-500 ring-2 ring-red-500/20'
                  : 'bg-white border-neutral-100'
              }`}
            >
              {/* Best Value Badge */}
              {plan.isBestValue && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-full uppercase shadow-sm">
                  BEST VALUE
                </div>
              )}

              <div>
                {/* Title */}
                <h3 className="text-xl font-black tracking-tight text-neutral-900 mb-4 mt-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline mb-6 border-b border-neutral-100 pb-6">
                  <span className={`text-2xl font-black tracking-tight ${
                    plan.name === 'STARTER FREE' ? 'text-red-500' : 'text-[#004f31]'
                  }`}>
                    {plan.price}
                  </span>
                  <span className="text-xs font-bold text-neutral-500 ml-1.5">
                    / {plan.period}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-0.5 flex items-center justify-center bg-emerald-50 text-[#004f31]">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <span className="text-xs font-bold text-neutral-600">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Button */}
              <button
                id={`direct-btn-${plan.name.toLowerCase().replace(' ', '-')}`}
                onClick={() => onSelectPackage?.(plan.name)}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md ${
                  plan.isBestValue
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/10'
                    : plan.name === 'ELITE PRO'
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                    : 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200'
                }`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Network Partners Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-8">
          YOUR AD WILL BE VISIBLE ACROSS OUR NETWORK
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 max-w-4xl mx-auto">
          {partners.map((partner) => (
            <span
              key={partner}
              className="text-xs font-extrabold text-neutral-400 hover:text-neutral-600 transition-colors cursor-default"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>

      {/* Agency Section (Enterprise Solution) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-neutral-900 rounded-[32px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12"
        >
          {/* Decorative mesh background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#003c25]/30 to-transparent pointer-events-none opacity-50" />

          {/* Left Panel */}
          <div className="space-y-6 relative z-10 max-w-xl">
            <h3 className="text-3xl font-black tracking-tight leading-tight">
              Are you a Real Estate Agency?
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-medium">
              Get custom enterprise solutions for bulk property listings and dedicated performance tracking.
            </p>
            <button
              onClick={onContactAgency}
              className="bg-emerald-500 hover:bg-emerald-400 text-neutral-900 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              REQUEST CUSTOM QUOTE
            </button>
          </div>

          {/* Right Panel (Stats Grid) */}
          <div className="grid grid-cols-2 gap-4 relative z-10 w-full lg:w-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-neutral-800/50 backdrop-blur border border-neutral-800 p-6 rounded-2xl text-center min-w-[160px]"
              >
                <div className="text-3xl font-black text-emerald-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
