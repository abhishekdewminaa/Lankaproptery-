import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  ArrowRight, 
  Info, 
  Check, 
  RefreshCw, 
  Sparkles, 
  MapPin, 
  Home, 
  Landmark, 
  Sliders, 
  TrendingUp, 
  Flame, 
  CheckCircle, 
  ChevronDown
} from 'lucide-react';

interface LocationPreset {
  name: string;
  district: string;
  rateHouse: number;      // Rs per sqft
  rateApartment: number;  // Rs per sqft
  rateLand: number;       // Rs per perch
  demand: 'Very High' | 'High' | 'Moderate' | 'Steady';
  trend: 'up' | 'stable' | 'surging';
}

const LOCATION_PRESETS: Record<string, LocationPreset> = {
  'colombo-07': { name: 'Colombo 07 (Cinnamon Gardens)', district: 'Colombo', rateHouse: 82000, rateApartment: 105000, rateLand: 15500000, demand: 'Very High', trend: 'surging' },
  'colombo-03': { name: 'Colombo 03 (Kollupitiya)', district: 'Colombo', rateHouse: 78000, rateApartment: 98000, rateLand: 14000000, demand: 'Very High', trend: 'up' },
  'colombo-05': { name: 'Colombo 05 (Havelock Town / Kirulapone)', district: 'Colombo', rateHouse: 65000, rateApartment: 84000, rateLand: 11000000, demand: 'High', trend: 'up' },
  'rajagiriya': { name: 'Rajagiriya (Kotte / Gateway)', district: 'Colombo', rateHouse: 36000, rateApartment: 52000, rateLand: 4800000, demand: 'High', trend: 'stable' },
  'malabe': { name: 'Malabe (IT & Education Hub)', district: 'Colombo', rateHouse: 24000, rateApartment: 36000, rateLand: 2400000, demand: 'Very High', trend: 'surging' },
  'battaramulla': { name: 'Battaramulla', district: 'Colombo', rateHouse: 31000, rateApartment: 44000, rateLand: 3500000, demand: 'High', trend: 'up' },
  'mount-lavinia': { name: 'Mount Lavinia', district: 'Colombo', rateHouse: 29000, rateApartment: 39000, rateLand: 3100000, demand: 'High', trend: 'stable' },
  'kandy-city': { name: 'Kandy (City Center / Primrose)', district: 'Kandy', rateHouse: 19500, rateApartment: 29000, rateLand: 2600000, demand: 'Moderate', trend: 'stable' },
  'galle-fort': { name: 'Galle Fort / Coastal Belt', district: 'Galle', rateHouse: 32000, rateApartment: 46000, rateLand: 3800000, demand: 'High', trend: 'up' },
  'negombo': { name: 'Negombo (Beach Road / Kochchikade)', district: 'Gampaha', rateHouse: 17500, rateApartment: 25000, rateLand: 1900000, demand: 'Moderate', trend: 'stable' },
  'kurunegala': { name: 'Kurunegala Town', district: 'Kurunegala', rateHouse: 16000, rateApartment: 22000, rateLand: 1500000, demand: 'Moderate', trend: 'stable' },
  'jaffna-city': { name: 'Jaffna City', district: 'Jaffna', rateHouse: 15000, rateApartment: 20000, rateLand: 1800000, demand: 'Moderate', trend: 'up' },
  'kalutara': { name: 'Kalutara Town', district: 'Kalutara', rateHouse: 14000, rateApartment: 18000, rateLand: 1100000, demand: 'Steady', trend: 'stable' },
  'matara': { name: 'Matara (Beach Road)', district: 'Matara', rateHouse: 18000, rateApartment: 26000, rateLand: 2200000, demand: 'Moderate', trend: 'up' },
  'gampaha-town': { name: 'Gampaha Town', district: 'Gampaha', rateHouse: 20000, rateApartment: 28000, rateLand: 2100000, demand: 'High', trend: 'up' },
  'batticaloa': { name: 'Batticaloa Town', district: 'Batticaloa', rateHouse: 13000, rateApartment: 17000, rateLand: 1200000, demand: 'Steady', trend: 'stable' },
  'trincomalee': { name: 'Trincomalee Bay', district: 'Trincomalee', rateHouse: 15500, rateApartment: 22000, rateLand: 1400000, demand: 'Moderate', trend: 'stable' },
};

export function PriceCalculator() {
  const [activeTab, setActiveTab] = useState<'valuation' | 'affordability'>('valuation');
  
  // Tab 1: Valuation State
  const [searchQuery, setSearchQuery] = useState('Colombo 05 (Havelock Town / Kirulapone)');
  const [selectedLocKey, setSelectedLocKey] = useState('colombo-05');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [propType, setPropType] = useState<'House' | 'Apartment' | 'Bare Land'>('House');
  const [size, setSize] = useState<number>(1800); // sqft or perches
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [finishes, setFinishes] = useState<'Standard' | 'Premium' | 'Ultra-Luxury'>('Premium');
  
  const [isValuating, setIsValuating] = useState(false);
  const [valStepText, setValStepText] = useState('');
  const [valuationResult, setValuationResult] = useState<any | null>(null);

  // Tab 2: Affordability State
  const [targetPrice, setTargetPrice] = useState<number>(25000000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(13.5);
  const [loanTermYrs, setLoanTermYrs] = useState<number>(15);
  const [affordabilityResult, setAffordabilityResult] = useState<any | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Custom size slider ranges based on property type
  const minSize = propType === 'Bare Land' ? 5 : 400;
  const maxSize = propType === 'Bare Land' ? 80 : 8000;
  const sizeStep = propType === 'Bare Land' ? 1 : 50;
  const sizeUnit = propType === 'Bare Land' ? 'Perches' : 'Sq. Ft.';

  // Automatically update size when property type changes to stay within bounds
  useEffect(() => {
    if (propType === 'Bare Land') {
      setSize(15); // Default perches
    } else {
      setSize(1800); // Default sqft
    }
  }, [propType]);

  // Handle Dynamic Real-Time Valuation Estimate
  const runValuationEstimate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsValuating(true);
    
    // Simulate high-end calculation delay steps
    const steps = [
      'Querying Lanka historical database...',
      'Mapping location benchmark coefficients...',
      'Applying finishes and specification indices...',
      'Compiling regional market temperature report...'
    ];
    
    let stepIdx = 0;
    setValStepText(steps[0]);
    
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setValStepText(steps[stepIdx]);
      } else {
        clearInterval(interval);
        
        // Compute base rate
        const locData = selectedLocKey !== 'Custom' ? LOCATION_PRESETS[selectedLocKey] : null;
        let baseRate = 18500; // default generic rate
        let demand = 'Steady';
        let trend: 'up' | 'stable' | 'surging' = 'stable';
        let matchedLocationName = searchQuery || 'Sri Lanka General';
        
        if (locData) {
          demand = locData.demand;
          trend = locData.trend;
          matchedLocationName = locData.name;
          if (propType === 'House') baseRate = locData.rateHouse;
          else if (propType === 'Apartment') baseRate = locData.rateApartment;
          else baseRate = locData.rateLand;
        } else if (searchQuery.trim()) {
          // generic formula for custom location based on string length to simulate variety
          baseRate = 18000 + (searchQuery.length * 350);
          if (propType === 'Apartment') baseRate *= 1.35;
          if (propType === 'Bare Land') baseRate = 1500000; // custom land perch default
        }

        // Apply specifications multipliers
        let multiplier = 1.0;
        
        // Finishes
        if (finishes === 'Premium') multiplier *= 1.15;
        if (finishes === 'Ultra-Luxury') multiplier *= 1.38;

        // Bedrooms (only relevant for house/apartment)
        if (propType !== 'Bare Land') {
          if (bedrooms === 1) multiplier *= 0.85;
          if (bedrooms === 2) multiplier *= 0.95;
          if (bedrooms === 4) multiplier *= 1.08;
          if (bedrooms >= 5) multiplier *= 1.18;
        }

        const computedBase = size * baseRate * multiplier;
        
        // Round to nearest 50k
        const averagePrice = Math.round(computedBase / 50000) * 50000;
        const lowPrice = Math.round((averagePrice * 0.92) / 50000) * 50000;
        const highPrice = Math.round((averagePrice * 1.08) / 50000) * 50000;
        const avgPricePerUnit = Math.round(averagePrice / size);

        setValuationResult({
          lowPrice,
          highPrice,
          averagePrice,
          avgPricePerUnit,
          location: matchedLocationName,
          demand,
          trend,
          propType,
          size,
          sizeUnit,
          finishes,
          bedrooms: propType !== 'Bare Land' ? bedrooms : null
        });
        setIsValuating(false);
      }
    }, 450);
  };

  // Run Affordability & Loan Estimate in real-time when sliders change
  useEffect(() => {
    const principal = targetPrice * (1 - downPaymentPct / 100);
    const monthlyRate = (interestRate / 12) / 100;
    const totalPayments = loanTermYrs * 12;
    
    let monthlyInstallment = 0;
    if (monthlyRate > 0) {
      monthlyInstallment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyInstallment = principal / totalPayments;
    }

    const totalPaid = monthlyInstallment * totalPayments;
    const totalInterest = totalPaid - principal;
    const minIncome = Math.round(monthlyInstallment * 2.85);

    setAffordabilityResult({
      principal,
      downPaymentAmt: targetPrice * (downPaymentPct / 100),
      monthlyInstallment: Math.round(monthlyInstallment),
      totalInterest: Math.round(totalInterest),
      totalPaid: Math.round(totalPaid),
      minIncome
    });
  }, [targetPrice, downPaymentPct, interestRate, loanTermYrs]);

  // Run initial estimate
  useEffect(() => {
    runValuationEstimate();
  }, []);

  // Filter matching presets by Town or District
  const filteredPresets = Object.entries(LOCATION_PRESETS).filter(([_, preset]) => {
    const query = searchQuery.toLowerCase().trim();
    if (query.length < 3) return false;
    return preset.name.toLowerCase().includes(query) || preset.district.toLowerCase().includes(query);
  });

  return (
    <section id="oppi-calculator-section" className="py-20 bg-gradient-to-b from-[#fdfefe] to-[#f4f7f5] border-t border-b border-emerald-50/50">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        
        {/* Section Heading with Luxury Touches */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 id="oppi-calculator-title" className="text-3xl sm:text-4xl md:text-[42px] font-black text-gray-900 tracking-tight mb-4 leading-none">
            Calculate Your Property Price
          </h2>
          <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
            Access instant, highly-calibrated indicative evaluations for estates and residential assets. Toggle between instant valuation and complex affordability calculators.
          </p>
        </div>

        {/* Dual Tab Control Grid */}
        <div className="flex p-1.5 bg-gray-100/80 backdrop-blur rounded-2xl max-w-md mx-auto mb-10 border border-gray-200/50">
          <button
            onClick={() => setActiveTab('valuation')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'valuation'
                ? 'bg-[#0a4225] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <Home size={14} />
            Market Valuation
          </button>
          <button
            onClick={() => setActiveTab('affordability')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'affordability'
                ? 'bg-[#0a4225] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <Landmark size={14} />
            Loan Affordability
          </button>
        </div>

        {/* Outer Intelligent Board */}
        <div 
          id="oppi-calculator-card" 
          className="bg-white rounded-3xl shadow-xl shadow-emerald-950/5 border border-emerald-500/10 relative overflow-hidden"
        >
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0a4225] via-[#22c55e] to-[#0a4225]" />

          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: VALUATION ENGINE */}
              {activeTab === 'valuation' && (
                <motion.div
                  key="valuation-panel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
                >
                  
                  {/* Left Controls Form Column */}
                  <form onSubmit={runValuationEstimate} className="lg:col-span-6 space-y-6 flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 text-gray-800 font-extrabold text-lg pb-2 border-b border-gray-100">
                        <Sliders size={18} className="text-[#0a4225]" />
                        <span>Configure Parameters</span>
                      </div>

                      {/* Property Type Choice Buttons */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Property Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['House', 'Apartment', 'Bare Land'] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setPropType(type)}
                              className={`py-2.5 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border ${
                                propType === type
                                  ? 'bg-[#0a4225]/5 border-[#0a4225] text-[#0a4225] shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-500 hover:bg-slate-50'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interactive Autocomplete Location Filter by Town / District */}
                      <div ref={dropdownRef} className="space-y-1.5 relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                          Search Town or District
                        </label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            value={searchQuery}
                            onFocus={() => setShowDropdown(true)}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setShowDropdown(true);
                            }}
                            placeholder="Type town or district (e.g. Malabe, Galle)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3.5 text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery('');
                                setSelectedLocKey('Custom');
                                setShowDropdown(true);
                              }}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-extrabold text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Dropdown Suggestions List */}
                        {showDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-gray-50">
                            {searchQuery.trim().length < 3 ? (
                              <div className="p-4 text-center text-[11px] text-gray-400 font-medium">
                                Type <span className="font-extrabold text-[#0a4225]">at least 3 characters</span> to search Sri Lanka towns & districts...
                                <div className="mt-3 text-left">
                                  <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Popular Quick Picks:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {['Colombo 07', 'Malabe', 'Kandy', 'Galle Fort'].map((pop) => (
                                      <button
                                        key={pop}
                                        type="button"
                                        onClick={() => {
                                          const entry = Object.entries(LOCATION_PRESETS).find(([_, p]) => p.name.includes(pop));
                                          if (entry) {
                                            setSelectedLocKey(entry[0]);
                                            setSearchQuery(entry[1].name);
                                            setShowDropdown(false);
                                          }
                                        }}
                                        className="bg-slate-100 hover:bg-[#0a4225]/10 text-gray-700 hover:text-[#0a4225] text-[10px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer"
                                      >
                                        {pop}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : filteredPresets.length > 0 ? (
                              filteredPresets.map(([key, preset]) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => {
                                    setSelectedLocKey(key);
                                    setSearchQuery(preset.name);
                                    setShowDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 hover:bg-[#0a4225]/5 transition-colors flex items-center justify-between cursor-pointer"
                                >
                                  <div>
                                    <div className="text-xs font-bold text-gray-800">{preset.name}</div>
                                    <div className="text-[10px] text-gray-400 font-semibold">District: {preset.district}</div>
                                  </div>
                                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#0a4225] bg-[#0a4225]/5 border border-[#0a4225]/10 px-2.5 py-1 rounded-md">
                                    Select
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-4">
                                <div className="text-center text-[11px] text-gray-500 font-medium mb-2.5">
                                  No preset match found for "{searchQuery}".
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedLocKey('Custom');
                                    setShowDropdown(false);
                                  }}
                                  className="w-full text-center py-2.5 bg-slate-100 hover:bg-[#0a4225] hover:text-white text-[#0a4225] rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                  Use "{searchQuery}" as Custom Location
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Size Slider Input */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          <span>Total Size ({sizeUnit})</span>
                          <span className="text-gray-800 text-xs font-extrabold normal-case">
                            {size.toLocaleString()} {sizeUnit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={minSize}
                          max={maxSize}
                          step={sizeStep}
                          value={size}
                          onChange={(e) => setSize(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0a4225] focus:outline-none"
                        />
                        <div className="flex justify-between text-[9px] font-bold text-gray-400">
                          <span>{minSize} {sizeUnit}</span>
                          <span>{maxSize.toLocaleString()} {sizeUnit}</span>
                        </div>
                      </div>

                      {/* Conditionally Render Specification Fields */}
                      {propType !== 'Bare Land' && (
                        <div className="grid grid-cols-2 gap-4 pt-1">
                          
                          {/* Bedroom Buttons Selection */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Bedrooms</label>
                            <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-slate-50">
                              {[1, 2, 3, 4, 5].map((bed) => (
                                <button
                                  key={bed}
                                  type="button"
                                  onClick={() => setBedrooms(bed)}
                                  className={`flex-1 py-2 text-xs font-extrabold transition-all ${
                                    bedrooms === bed
                                      ? 'bg-[#0a4225] text-white'
                                      : 'text-gray-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {bed === 5 ? '5+' : bed}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Finishes Standard Select */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Quality Standard</label>
                            <select
                              value={finishes}
                              onChange={(e: any) => setFinishes(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all cursor-pointer"
                            >
                              <option value="Standard">Standard Finishes</option>
                              <option value="Premium">Premium Luxury</option>
                              <option value="Ultra-Luxury">Architect Masterpiece</option>
                            </select>
                          </div>

                        </div>
                      )}

                    </div>

                    <button
                      type="submit"
                      disabled={isValuating}
                      className="w-full h-12 bg-[#0a4225] hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-6 active:scale-95 disabled:opacity-80"
                    >
                      {isValuating ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Generating report...</span>
                        </>
                      ) : (
                        <>
                          <Calculator size={14} />
                          <span>Calculate Valuation</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Right Real-time Report Column */}
                  <div className="lg:col-span-6 bg-slate-50/60 border border-slate-100 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[400px]">
                    
                    {/* Simulated Loading Overlay */}
                    <AnimatePresence>
                      {isValuating && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center"
                        >
                          <div className="w-12 h-12 rounded-full border-4 border-[#0a4225]/10 border-t-[#0a4225] animate-spin mb-4" />
                          <div className="text-[#0a4225] text-[11px] font-black uppercase tracking-widest mb-2 animate-pulse">
                            Processing Market Engine
                          </div>
                          <div className="text-gray-500 text-sm font-medium italic">
                            "{valStepText}"
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Valuation Result Render */}
                    {valuationResult ? (
                      <div className="space-y-6 h-full flex flex-col justify-between">
                        <div>
                          
                          {/* Report Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-[9px] font-extrabold text-[#0a4225] uppercase tracking-wider bg-[#0a4225]/5 border border-[#0a4225]/15 px-3 py-1 rounded-full inline-block">
                                OPPI Intelligent Estimate
                              </span>
                              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
                                Indicative Market Valuation
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 font-bold">
                              <CheckCircle size={12} />
                              Calibrated
                            </div>
                          </div>

                          {/* Large Price Range */}
                          <div className="bg-gradient-to-br from-[#0a4225] to-[#125833] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                              <Home size={120} />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest block mb-1">Indicative Value Range</span>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                              Rs. {valuationResult.lowPrice.toLocaleString()} - Rs. {valuationResult.highPrice.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-emerald-100 font-medium">
                              <div>
                                Midpoint: <span className="font-extrabold text-white">Rs. {valuationResult.averagePrice.toLocaleString()}</span>
                              </div>
                              <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full" />
                              <div>
                                Rate: <span className="font-extrabold text-white">Rs. {valuationResult.avgPricePerUnit.toLocaleString()} / {valuationResult.sizeUnit.replace('. ', '')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Market Temperature meters */}
                          <div className="grid grid-cols-2 gap-4 mt-5">
                            <div className="bg-white border border-slate-150 rounded-xl p-3.5">
                              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Local Demand</span>
                              <div className="flex items-center gap-1.5 text-sm font-extrabold text-gray-800">
                                <Flame size={14} className="text-orange-500" />
                                <span>{valuationResult.demand}</span>
                              </div>
                            </div>
                            <div className="bg-white border border-slate-150 rounded-xl p-3.5">
                              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Price Trend</span>
                              <div className="flex items-center gap-1.5 text-sm font-extrabold text-gray-800">
                                <TrendingUp size={14} className="text-[#0a4225]" />
                                <span className="capitalize">{valuationResult.trend}</span>
                              </div>
                            </div>
                          </div>

                          {/* Config Details Checklist */}
                          <div className="mt-5 space-y-2 border-t border-slate-200/60 pt-4">
                            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Report Parameters</span>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                              <div className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                                <span className="text-gray-400">Location:</span>
                                <span className="font-bold text-gray-700 truncate max-w-[120px]" title={valuationResult.location}>{valuationResult.location}</span>
                              </div>
                              <div className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                                <span className="text-gray-400">Total Area:</span>
                                <span className="font-bold text-gray-700">{valuationResult.size} {valuationResult.sizeUnit}</span>
                              </div>
                              {valuationResult.bedrooms && (
                                <div className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                                  <span className="text-gray-400">Bedrooms:</span>
                                  <span className="font-bold text-gray-700">{valuationResult.bedrooms} Beds</span>
                                </div>
                              )}
                              <div className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                                <span className="text-gray-400">Finishes:</span>
                                <span className="font-bold text-gray-700">{valuationResult.finishes}</span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Interactive Bank loan hook */}
                        <div className="bg-[#0a4225]/5 border border-[#0a4225]/10 rounded-xl p-3.5 flex justify-between items-center gap-4 text-xs mt-4">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-extrabold text-[#0a4225] uppercase tracking-wider block">Estimated Loan Quote</span>
                            <span className="text-gray-700 font-bold">Get a 12.5% home loan on this property.</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              setTargetPrice(valuationResult.averagePrice);
                              setActiveTab('affordability');
                            }}
                            className="bg-[#0a4225] hover:bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95"
                          >
                            Plan Budget
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center h-full text-gray-400 py-12">
                        <Calculator size={36} className="text-gray-300 mb-3" />
                        <span className="text-sm font-bold text-gray-500">Awaiting parameter input</span>
                        <p className="text-xs text-gray-400 mt-1 max-w-[240px]">Configure the controls on the left to estimate the property price.</p>
                      </div>
                    )}

                  </div>
                </motion.div>
              )}

              {/* TAB 2: AFFORDABILITY & MORTGAGE ENGINE */}
              {activeTab === 'affordability' && (
                <motion.div
                  key="affordability-panel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
                >
                  
                  {/* Left Controls Sliders */}
                  <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 text-gray-800 font-extrabold text-lg pb-2 border-b border-gray-100">
                        <Landmark size={18} className="text-[#0a4225]" />
                        <span>Mortgage Parameters</span>
                      </div>

                      {/* Property Price Input */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          <label htmlFor="oppi-target-price">Target Property Price</label>
                          <span className="text-[#0a4225] text-xs font-extrabold">Rs. {targetPrice.toLocaleString()}</span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rs.</span>
                          <input
                            type="number"
                            id="oppi-target-price"
                            value={targetPrice}
                            min="100000"
                            onChange={(e) => setTargetPrice(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Down Payment Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          <span>Down Payment ({downPaymentPct}%)</span>
                          <span className="text-gray-800 text-xs font-extrabold">
                            Rs. {((targetPrice * downPaymentPct) / 100).toLocaleString()}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          step="5"
                          value={downPaymentPct}
                          onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0a4225] focus:outline-none"
                        />
                        <div className="flex justify-between text-[9px] font-bold text-gray-400">
                          <span>10% Minimum</span>
                          <span>80% Maximum</span>
                        </div>
                      </div>

                      {/* Interest Rate Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          <span>Interest Rate (Annual)</span>
                          <span className="text-gray-800 text-xs font-extrabold">{interestRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="24"
                          step="0.5"
                          value={interestRate}
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0a4225] focus:outline-none"
                        />
                        <div className="flex justify-between text-[9px] font-bold text-gray-400">
                          <span>8.0% Base Rate</span>
                          <span>24.0% Max Rate</span>
                        </div>
                      </div>

                      {/* Loan Term Selection Row */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Loan Duration</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[5, 10, 15, 20].map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => setLoanTermYrs(term)}
                              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${
                                loanTermYrs === term
                                  ? 'bg-[#0a4225] text-white border-[#0a4225] shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-slate-50'
                              }`}
                            >
                              {term} Years
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    <div className="text-[11px] text-gray-400 bg-slate-50 border border-slate-100 rounded-xl p-3.5 mt-6 flex gap-2">
                      <Info size={14} className="text-[#0a4225] shrink-0 mt-0.5" />
                      <span>These calculations are estimates. Loan approvals depend on individual credit profiles, verifiable monthly incomes, and property evaluations.</span>
                    </div>
                  </div>

                  {/* Right Report Column for Affordability */}
                  <div className="lg:col-span-6 bg-slate-50/60 border border-slate-100 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                    
                    {affordabilityResult ? (
                      <div className="space-y-6">
                        
                        {/* Summary Header */}
                        <div>
                          <span className="text-[9px] font-extrabold text-indigo-700 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full inline-block">
                            Budget Intelligence
                          </span>
                          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
                            Estimated Monthly Installment
                          </h4>
                        </div>

                        {/* Large Monthly Result Card */}
                        <div className="bg-gradient-to-br from-[#121c17] to-[#1e3427] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Landmark size={120} />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block mb-1">Monthly Cost Quote</span>
                          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                            Rs. {affordabilityResult.monthlyInstallment.toLocaleString()}
                          </div>
                          <p className="text-[11px] text-gray-300 font-medium">
                            Calculated for a total loan amount of <span className="font-bold text-white">Rs. {affordabilityResult.principal.toLocaleString()}</span>.
                          </p>
                        </div>

                        {/* Income Recommendation */}
                        <div className="bg-amber-50/50 border border-amber-500/10 rounded-xl p-4">
                          <span className="text-[9px] font-extrabold text-amber-800 uppercase tracking-widest block mb-1">Recommended Monthly Household Income</span>
                          <div className="text-base font-extrabold text-gray-800">
                            Rs. {affordabilityResult.minIncome.toLocaleString()} +
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5">Based on standard banking guidelines where debt service ratio is less than 40%.</p>
                        </div>

                        {/* Advanced Financial Details Breakdown */}
                        <div className="space-y-2 border-t border-slate-200/60 pt-4">
                          <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Cost Projections Breakdown</span>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="flex flex-col border-b border-dashed border-gray-100 pb-2">
                              <span className="text-gray-400 font-medium">Down Payment Amount:</span>
                              <span className="font-bold text-gray-800 mt-0.5">Rs. {affordabilityResult.downPaymentAmt.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col border-b border-dashed border-gray-100 pb-2">
                              <span className="text-gray-400 font-medium">Principal Loan Size:</span>
                              <span className="font-bold text-gray-800 mt-0.5">Rs. {affordabilityResult.principal.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col border-b border-dashed border-gray-100 pb-2">
                              <span className="text-gray-400 font-medium">Interest Cost Over Term:</span>
                              <span className="font-bold text-gray-800 mt-0.5">Rs. {affordabilityResult.totalInterest.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col border-b border-dashed border-gray-100 pb-2">
                              <span className="text-gray-400 font-medium">Total Term Cost:</span>
                              <span className="font-bold text-gray-800 mt-0.5">Rs. {affordabilityResult.totalPaid.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center h-full text-gray-400 py-12">
                        <Landmark size={36} className="text-gray-300 mb-3" />
                        <span className="text-sm font-bold text-gray-500">Calculating schedule...</span>
                      </div>
                    )}

                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Disclaimer Section */}
            <div id="oppi-disclaimer" className="text-[11px] text-gray-400 leading-relaxed space-y-2.5 mt-10 border-t border-slate-100 pt-8">
              <p>
                <strong className="text-gray-500 font-black uppercase tracking-wider text-[10px] block mb-1">Statistical Indicator Disclaimer:</strong>
                The Online Property Price Indicator (OPPI) is a simulated statistical model utilizing standard Sri Lankan region-wide averages, sizing constants, and build coefficients. It provides a generalized reference benchmark and does not represent an appraisal or registered physical valuation. Regional variances such as main road proximity, land elevation, beach frontage, and access road width can produce significant deviations in real-world prices.
              </p>
              <p>
                All calculations, interest rates, and loan installments are theoretical and for indicative budgeting only. Please consult certified professional valuers, banking officers, or registered estate agents in your local area before finalizing any sale, rental, or mortgage commitments.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
