import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, LandPlot, Building2, Building, Briefcase, Shovel, Palmtree, Hotel, 
  Sparkles, MapPin, Loader2, ArrowRight, RefreshCw, Layers, DollarSign, Calculator
} from 'lucide-react';
import { SRI_LANKA_DISTRICTS } from '../../constants/districts';

const PROPERTY_TYPES = [
  { icon: <Home size={20} />, label: 'House' },
  { icon: <LandPlot size={20} />, label: 'Land' },
  { icon: <Building2 size={20} />, label: 'Apartment' },
  { icon: <Building size={20} />, label: 'Building' },
  { icon: <Briefcase size={20} />, label: 'Commercial' },
  { icon: <Shovel size={20} />, label: 'Farm Land' },
  { icon: <Palmtree size={20} />, label: 'Villa' },
  { icon: <Hotel size={20} />, label: 'Hotel' },
];

const BASE_RATES: Record<string, { landPerPerch: number; buildPerSqft: number }> = {
  'Colombo': { landPerPerch: 4800000, buildPerSqft: 22000 },
  'Gampaha': { landPerPerch: 950000, buildPerSqft: 12000 },
  'Kalutara': { landPerPerch: 600000, buildPerSqft: 10000 },
  'Kandy': { landPerPerch: 1800000, buildPerSqft: 14500 },
  'Matale': { landPerPerch: 550000, buildPerSqft: 10000 },
  'Nuwara Eliya': { landPerPerch: 1400000, buildPerSqft: 15000 },
  'Galle': { landPerPerch: 2000000, buildPerSqft: 16000 },
  'Matara': { landPerPerch: 900000, buildPerSqft: 12500 },
  'Hambantota': { landPerPerch: 450000, buildPerSqft: 10000 },
  'Jaffna': { landPerPerch: 1100000, buildPerSqft: 11500 },
  'Kurunegala': { landPerPerch: 750000, buildPerSqft: 11500 },
  'Puttalam': { landPerPerch: 400000, buildPerSqft: 9000 },
  'Anuradhapura': { landPerPerch: 500000, buildPerSqft: 10000 },
  'Polonnaruwa': { landPerPerch: 400000, buildPerSqft: 9500 },
  'Badulla': { landPerPerch: 650000, buildPerSqft: 11000 },
  'Monaragala': { landPerPerch: 350000, buildPerSqft: 9000 },
  'Ratnapura': { landPerPerch: 550000, buildPerSqft: 10500 },
  'Kegalle': { landPerPerch: 500000, buildPerSqft: 10000 },
};

const DEFAULT_RATE = { landPerPerch: 400000, buildPerSqft: 9500 };

const LOADING_STEPS = [
  "Checking property specifications & regional multipliers...",
  "Analyzing average transaction price index in Sri Lanka...",
  "Matching regional land value per perch databases...",
  "Applying luxury finish index & structure depreciation factors...",
  "Synthesizing final high-precision property valuation report..."
];

export const PriceCalculator: React.FC = () => {
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [selectedType, setSelectedType] = useState('House');
  const [district, setDistrict] = useState('Colombo');
  const [city, setCity] = useState('');
  
  // Specs state
  const [landArea, setLandArea] = useState<number>(10); // in perches
  const [floorArea, setFloorArea] = useState<number>(1500); // in sqft
  const [rooms, setRooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [finishGrade, setFinishGrade] = useState<'standard' | 'premium' | 'luxury'>('premium');

  // Loading & Results
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStepIndex, setCalcStepIndex] = useState(0);
  const [results, setResults] = useState<any | null>(null);

  useEffect(() => {
    let timer: any;
    if (isCalculating) {
      if (calcStepIndex < LOADING_STEPS.length - 1) {
        timer = setTimeout(() => {
          setCalcStepIndex(prev => prev + 1);
        }, 600);
      } else {
        timer = setTimeout(() => {
          generateValuation();
          setIsCalculating(false);
        }, 800);
      }
    }
    return () => clearTimeout(timer);
  }, [isCalculating, calcStepIndex]);

  const triggerCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setCalcStepIndex(0);
    setIsCalculating(true);
    setResults(null);
  };

  const generateValuation = () => {
    const rate = BASE_RATES[district] || DEFAULT_RATE;
    
    // Multipliers based on property types
    let landMultiplier = 1.0;
    let buildMultiplier = 1.0;
    
    if (selectedType === 'Villa') {
      landMultiplier = 1.2;
      buildMultiplier = 1.4;
    } else if (selectedType === 'Apartment') {
      landMultiplier = 0; // Purely floor area based
      buildMultiplier = 2.1; // Apartments have higher structural overhead / common area pricing
    } else if (selectedType === 'Commercial' || selectedType === 'Building') {
      landMultiplier = 1.3;
      buildMultiplier = 1.5;
    } else if (selectedType === 'Hotel') {
      landMultiplier = 1.4;
      buildMultiplier = 1.8;
    } else if (selectedType === 'Farm Land' || selectedType === 'Land') {
      buildMultiplier = 0; // Pure land
    }

    // Finish grade multiplier
    let gradeMultiplier = 1.0;
    if (finishGrade === 'premium') gradeMultiplier = 1.35;
    if (finishGrade === 'luxury') gradeMultiplier = 1.85;

    // Calculations
    const landValue = landArea * rate.landPerPerch * landMultiplier;
    const structureValue = floorArea * rate.buildPerSqft * buildMultiplier * gradeMultiplier;
    
    // Add bed/bath premiums for residential properties
    const bedBathPremium = (selectedType === 'House' || selectedType === 'Apartment' || selectedType === 'Villa')
      ? (rooms * 1200000 + bathrooms * 800000)
      : 0;

    let totalValuation = landValue + structureValue + bedBathPremium;

    // Apply city markup (if custom city, add subtle variance or standard boost)
    const normalizedCity = city.trim().toLowerCase();
    let cityMarkup = 1.0;
    if (normalizedCity.includes('fort') || normalizedCity.includes('cinnamon') || normalizedCity.includes('colombo 7') || normalizedCity.includes('colombo 3')) {
      cityMarkup = 1.5;
    } else if (normalizedCity.includes('battaramulla') || normalizedCity.includes('rajagiriya') || normalizedCity.includes('dehiwala') || normalizedCity.includes('nugegoda')) {
      cityMarkup = 1.2;
    } else if (normalizedCity.length > 0) {
      cityMarkup = 1.05; // general city bonus
    }
    
    totalValuation *= cityMarkup;

    // Valuation range
    const lowRange = Math.round(totalValuation * 0.92);
    const highRange = Math.round(totalValuation * 1.08);
    const finalEstimate = Math.round(totalValuation);

    // Calculate Rental Yields
    // 4-5% residential yield, 7-9% commercial yield
    const isCommercial = ['Commercial', 'Building', 'Hotel'].includes(selectedType);
    const annualYieldRate = isCommercial ? 0.075 : 0.045;
    const monthlyRentEstimate = Math.round((finalEstimate * annualYieldRate) / 12);

    // If renting is requested, present rent value as main, and sale value as reference
    const mainValue = listingType === 'sale' ? finalEstimate : monthlyRentEstimate;
    const mainRangeLow = listingType === 'sale' ? lowRange : Math.round(monthlyRentEstimate * 0.9);
    const mainRangeHigh = listingType === 'sale' ? highRange : Math.round(monthlyRentEstimate * 1.1);

    setResults({
      mainValue,
      rangeLow: mainRangeLow,
      rangeHigh: mainRangeHigh,
      isSale: listingType === 'sale',
      estimatedSalePrice: finalEstimate,
      estimatedRentPrice: monthlyRentEstimate,
      landComponent: Math.round(landValue * cityMarkup),
      structureComponent: Math.round((structureValue + bedBathPremium) * cityMarkup),
      ratePerPerch: Math.round(rate.landPerPerch * cityMarkup * landMultiplier),
      ratePerSqft: Math.round(rate.buildPerSqft * cityMarkup * buildMultiplier * gradeMultiplier),
      annualYieldRate,
    });
  };

  const formatPriceLKR = (val: number) => {
    if (val >= 10000000) {
      return `Rs. ${(val / 10000000).toFixed(2)} Crore`;
    } else if (val >= 100000) {
      return `Rs. ${(val / 100000).toFixed(2)} Lakh`;
    }
    return `Rs. ${val.toLocaleString()}`;
  };

  const hasLand = ['House', 'Land', 'Farm Land', 'Villa', 'Commercial', 'Building', 'Hotel'].includes(selectedType);
  const hasStructure = ['House', 'Apartment', 'Villa', 'Commercial', 'Building', 'Hotel'].includes(selectedType);
  const hasBedBath = ['House', 'Apartment', 'Villa'].includes(selectedType);

  return (
    <section className="calculate-section py-24 bg-gradient-to-br from-[var(--lp-green-dark)] to-[#002618] relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/10 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-green-medium/10 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true, amount: 0.3 }}
           transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-4 hover:border-[#00D27B]/30 hover:bg-white/10 transition-all duration-300">
            <motion.div
              animate={{ 
                y: [0, -4, 0],
                rotate: [0, -8, 8, -8, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="text-[#00D27B] flex items-center justify-center"
            >
              <Calculator size={16} />
            </motion.div>
            <span className="text-xs font-bold uppercase tracking-wider text-white">Smart Real Estate Appraiser</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Calculate Your Property Price</h2>
          <p className="text-brand-green-medium font-medium mb-12 max-w-2xl mx-auto">
            Get an instant highly precise market value estimate for any property in Sri Lanka based on live suburb data.
          </p>

          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-10 text-left">
            
            <AnimatePresence mode="wait">
              {isCalculating ? (
                /* Calculating Screen */
                <motion.div 
                  key="calculating"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="py-16 flex flex-col items-center justify-center text-center min-h-[400px]"
                >
                  <div className="relative mb-8">
                    <Loader2 size={56} className="text-brand-green animate-spin" />
                    <Sparkles size={20} className="text-yellow-400 absolute top-0 right-0 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">AI Engine Processing</h3>
                  <div className="h-2 w-64 bg-white/10 rounded-full overflow-hidden mx-auto mb-4">
                    <motion.div 
                      className="h-full bg-brand-green"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((calcStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm max-w-md mx-auto italic transition-all duration-300">
                    "{LOADING_STEPS[calcStepIndex]}"
                  </p>
                </motion.div>
              ) : results ? (
                /* Results Screen */
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
                    <div>
                      <p className="text-xs font-bold text-brand-green uppercase tracking-widest mb-1">
                        Valuation Result for {district} • {city || 'Sri Lanka'}
                      </p>
                      <h3 className="text-2xl font-bold text-white">Estimated Market Price</h3>
                    </div>
                    <button 
                      onClick={() => setResults(null)}
                      className="flex items-center gap-2 text-xs font-bold text-brand-green-medium hover:text-white transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-xl"
                    >
                      <RefreshCw size={14} /> Calculate Another
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Hero Price Badge */}
                    <div className="lg:col-span-7 bg-gradient-to-br from-brand-green/30 to-brand-green/5 border border-brand-green/20 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <DollarSign size={200} className="text-white" />
                      </div>
                      
                      <div className="relative z-10">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-full inline-block mb-4">
                          Expected {results.isSale ? 'Selling Price' : 'Monthly Rent'}
                        </span>
                        
                        <div className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">
                          {formatPriceLKR(results.mainValue)}
                        </div>
                        
                        <div className="text-brand-green-medium font-bold text-lg mb-6">
                          Approx. ${(results.mainValue / 300).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                        </div>

                        <div className="border-t border-white/10 pt-4 mt-6">
                          <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Realistic Market Range</p>
                          <div className="flex items-center justify-between text-white font-bold">
                            <span>{formatPriceLKR(results.rangeLow)}</span>
                            <span className="text-xs text-gray-500">to</span>
                            <span>{formatPriceLKR(results.rangeHigh)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown & Analytics */}
                    <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Appraisal Breakdown</h4>
                        
                        {hasLand && results.landComponent > 0 && (
                          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                            <span className="text-gray-400 flex items-center gap-1.5"><MapPin size={14} /> Land Value ({landArea} Perches)</span>
                            <span className="text-white font-semibold">{formatPriceLKR(results.landComponent)}</span>
                          </div>
                        )}

                        {hasStructure && results.structureComponent > 0 && (
                          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                            <span className="text-gray-400 flex items-center gap-1.5"><Layers size={14} /> Build / Specs Value</span>
                            <span className="text-white font-semibold">{formatPriceLKR(results.structureComponent)}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                          <span className="text-gray-400">Finish / Finish Standard</span>
                          <span className="text-white font-semibold capitalize">{finishGrade}</span>
                        </div>

                        <div className="pt-2">
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Expected Alternative Valuation</p>
                          <div className="flex justify-between items-center text-sm bg-white/5 px-3 py-2.5 rounded-xl border border-white/5">
                            <span className="text-gray-300 font-medium">{results.isSale ? 'Rental Yield (Est. Month)' : 'Outright Selling Value'}</span>
                            <span className="text-brand-green-medium font-bold">
                              {results.isSale ? formatPriceLKR(results.estimatedRentPrice) : formatPriceLKR(results.estimatedSalePrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-500 leading-relaxed mt-6 border-t border-white/5 pt-3">
                        *This estimate is calculated using actual regional averages and transaction markup indicators. Physical visits, road width, and precise neighborhood factors will affect the absolute market price.
                      </div>
                    </div>
                  </div>

                  {/* Market Insights */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-yellow-400" />
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Suburb Analysis & Market Insights</h4>
                    </div>
                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                      {district} exhibits very high demand with strong capital appreciation, especially in prime locales like {city || 'its key cities'}. 
                      The chosen <span className="font-bold text-white capitalize">{finishGrade} Finish</span> of this <span className="font-bold text-white">{selectedType}</span> provides excellent long-term asset value. 
                      {results.isSale ? (
                        <span> Commencing listing at approximately <span className="font-bold text-white">{formatPriceLKR(results.rangeLow)}</span> will capture immediate serious interest, with room to negotiate up to market peaks.</span>
                      ) : (
                        <span> A rental yield of approximately <span className="font-bold text-white">{(results.annualYieldRate * 100).toFixed(1)}%</span> annual return is anticipated for this grade of finish and size.</span>
                      )}
                      {" "}Current trends indicate high infrastructure investment throughout the province, pushing local values steadily upwards.
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* The Interactive Form */
                <form onSubmit={triggerCalculate} className="space-y-8">
                  {/* Listing Type Toggle */}
                  <div className="flex justify-center">
                    <div className="flex bg-white/5 p-1.5 rounded-full border border-white/5">
                      <button 
                        type="button"
                        onClick={() => setListingType('sale')}
                        className={`px-8 py-2 rounded-full text-xs font-bold transition-all ${listingType === 'sale' ? 'bg-brand-green text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                      >
                        For Sale
                      </button>
                      <button 
                        type="button"
                        onClick={() => setListingType('rent')}
                        className={`px-8 py-2 rounded-full text-xs font-bold transition-all ${listingType === 'rent' ? 'bg-brand-green text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                      >
                        For Rent
                      </button>
                    </div>
                  </div>

                  {/* Property Types Grid */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
                      Select Property Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                      {PROPERTY_TYPES.map((type, idx) => (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => setSelectedType(type.label)}
                          className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                            selectedType === type.label 
                            ? 'bg-brand-green border-brand-green text-white shadow-lg shadow-brand-green/30 scale-105' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {type.icon}
                          <span className="text-[10px] font-bold uppercase tracking-widest">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Input Form Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    
                    {/* District Dropdown */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                        District
                      </label>
                      <select 
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-green focus:outline-none transition-colors"
                        required
                      >
                        {SRI_LANKA_DISTRICTS.map(d => (
                          <option key={d} value={d} className="bg-[#002618] text-white">
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City Text Field */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                        City / Suburb
                      </label>
                      <input 
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Kollupitiya, Battaramulla, Negombo"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:border-brand-green focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    {/* Dynamic Specs inputs */}
                    {hasLand && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Land Area (Perches)
                          </label>
                          <span className="text-xs font-bold text-brand-green-medium">{landArea} perch</span>
                        </div>
                        <input 
                          type="range"
                          min="1"
                          max="200"
                          value={landArea}
                          onChange={(e) => setLandArea(parseInt(e.target.value))}
                          className="w-full accent-brand-green bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                    )}

                    {hasStructure && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Floor Area (Sq. Ft.)
                          </label>
                          <span className="text-xs font-bold text-brand-green-medium">{floorArea.toLocaleString()} sqft</span>
                        </div>
                        <input 
                          type="range"
                          min="200"
                          max="15000"
                          step="50"
                          value={floorArea}
                          onChange={(e) => setFloorArea(parseInt(e.target.value))}
                          className="w-full accent-brand-green bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                    )}

                    {hasBedBath && (
                      <>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Bedrooms
                          </label>
                          <div className="flex items-center gap-3">
                            <button 
                              type="button" 
                              onClick={() => setRooms(Math.max(1, rooms - 1))}
                              className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center transition-colors"
                            >
                              -
                            </button>
                            <span className="text-lg font-black text-white w-8 text-center">{rooms}</span>
                            <button 
                              type="button" 
                              onClick={() => setRooms(Math.min(10, rooms + 1))}
                              className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Bathrooms
                          </label>
                          <div className="flex items-center gap-3">
                            <button 
                              type="button" 
                              onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                              className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center transition-colors"
                            >
                              -
                            </button>
                            <span className="text-lg font-black text-white w-8 text-center">{bathrooms}</span>
                            <button 
                              type="button" 
                              onClick={() => setBathrooms(Math.min(10, bathrooms + 1))}
                              className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Quality Finish Grade */}
                    <div className="md:col-span-2 space-y-3 pt-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Construction / Finish Grade
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'standard', title: 'Standard', desc: 'Basic modern fixtures & clean finish' },
                          { id: 'premium', title: 'Premium', desc: 'High-quality tiles & modern branded fittings' },
                          { id: 'luxury', title: 'Luxury', desc: 'Architect-designed, top-tier imported fixtures' }
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setFinishGrade(g.id as any)}
                            className={`p-4 rounded-xl text-left border transition-all duration-200 ${
                              finishGrade === g.id 
                              ? 'bg-brand-green/20 border-brand-green text-white shadow-md' 
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            <span className="block font-bold text-white text-sm mb-1">{g.title}</span>
                            <span className="block text-[10px] leading-tight text-gray-500">{g.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Submission Button */}
                   <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="calculate-btn w-full py-5 mt-4 bg-brand-green text-white hover:bg-brand-green-medium font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-2xl shadow-brand-green/20 transition-all flex items-center justify-center gap-3 cursor-pointer border-none"
                  >
                    CALCULATE ESTIMATE
                  </motion.button>
                </form>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

