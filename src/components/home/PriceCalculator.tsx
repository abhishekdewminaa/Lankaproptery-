import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ArrowRight, Info, Check, RefreshCw, Sparkles } from 'lucide-react';

export function PriceCalculator() {
  const [listingType, setListingType] = useState('For Sale');
  const [propertyType, setPropertyType] = useState('House');
  const [location, setLocation] = useState('');
  const [floorArea, setFloorArea] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  
  const [isCalculated, setIsCalculated] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setError('Please enter a location.');
      return;
    }
    if (!floorArea.trim() || isNaN(Number(floorArea)) || Number(floorArea) <= 0) {
      setError('Please enter a valid floor area.');
      return;
    }
    if (!totalPrice.trim() || isNaN(Number(totalPrice)) || Number(totalPrice) <= 0) {
      setError('Please enter a valid total price.');
      return;
    }

    setError('');
    
    // Perform dynamic dummy calculation based on user input
    const inputPrice = Number(totalPrice);
    const inputArea = Number(floorArea);
    
    // Variance multipliers for low & high estimate ranges
    const lowPrice = Math.round(inputPrice * 0.91);
    const highPrice = Math.round(inputPrice * 1.09);
    const pricePerSqFt = Math.round(inputPrice / inputArea);

    setResult({
      lowPrice,
      highPrice,
      averagePrice: Math.round(inputPrice),
      pricePerSqFt,
      location,
      propertyType,
      listingType
    });
    setIsCalculated(true);
  };

  const handleReset = () => {
    setIsCalculated(false);
    setResult(null);
    setLocation('');
    setFloorArea('');
    setTotalPrice('');
  };

  return (
    <section id="oppi-calculator-section" className="py-12 bg-[#f8fafc] border-t border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-[#0a4225]/5 border border-[#0a4225]/10 px-3.5 py-1.5 rounded-full mb-4">
            <Calculator size={15} className="text-[#0a4225]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0a4225]">Valuation Indicator</span>
          </div>
          <h2 id="oppi-calculator-title" className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
            Calculate Your Property Price
          </h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Determine the indicative value of your estate with our Online Property Price Indicator (OPPI). Compare regional rates instantly.
          </p>
        </div>

        {/* Floating White Card */}
        <div 
          id="oppi-calculator-card" 
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 relative overflow-hidden"
        >
          {/* Subtle green ambient accent at the top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0a4225]" />

          <AnimatePresence mode="wait">
            {!isCalculated ? (
              <motion.form 
                key="oppi-form"
                onSubmit={handleCalculate}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
                id="oppi-price-indicator-form"
              >
                {error && (
                  <div id="oppi-form-error" className="p-3 text-xs bg-red-50 text-red-700 font-bold rounded-xl border border-red-100">
                    ⚠️ {error}
                  </div>
                )}

                {/* 2x2 Grid for desktop / Stacking for mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Transaction Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="oppi-type" className="text-xs font-black text-gray-400 uppercase tracking-wider">Transaction Type</label>
                    <select
                      id="oppi-type"
                      value={listingType}
                      onChange={(e) => setListingType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="For Sale">For Sale</option>
                      <option value="For Rent">For Rent</option>
                    </select>
                  </div>

                  {/* Property Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="oppi-property-type" className="text-xs font-black text-gray-400 uppercase tracking-wider">Property Type</label>
                    <select
                      id="oppi-property-type"
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

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label htmlFor="oppi-location" className="text-xs font-black text-gray-400 uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      id="oppi-location"
                      placeholder="Enter location (e.g. Colombo 05, Kandy)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Floor Area */}
                  <div className="space-y-1.5">
                    <label htmlFor="oppi-floor-area" className="text-xs font-black text-gray-400 uppercase tracking-wider">Floor Area (sqft)</label>
                    <input
                      type="number"
                      id="oppi-floor-area"
                      min="1"
                      placeholder="Floor area (sqft)"
                      value={floorArea}
                      onChange={(e) => setFloorArea(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Total Price */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label htmlFor="oppi-total-price" className="text-xs font-black text-gray-400 uppercase tracking-wider">Total Price (LKR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-gray-400">Rs.</span>
                      <input
                        type="number"
                        id="oppi-total-price"
                        min="1"
                        placeholder="Enter total price"
                        value={totalPrice}
                        onChange={(e) => setTotalPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a4225] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                </div>

                {/* Calculate Submit Button */}
                <button
                  type="submit"
                  id="oppi-submit-btn"
                  className="w-full h-13 bg-[#0a4225] hover:bg-[#072f1a] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer border-none"
                >
                  Calculate Price <ArrowRight size={14} />
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="oppi-results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
                id="oppi-results-container"
              >
                {/* Result Hero Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-5 gap-4">
                  <div>
                    <span className="text-[10px] font-black text-[#0a4225] uppercase tracking-widest bg-[#0a4225]/5 px-3 py-1 rounded-full inline-block mb-1">
                      OPPI Estimate Results
                    </span>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">
                      Indicative Market Range
                    </h3>
                  </div>
                  <button 
                    onClick={handleReset}
                    id="oppi-recalculate-btn"
                    className="flex items-center gap-1.5 text-xs font-black text-[#0a4225] hover:text-[#072f1a] border border-gray-100 rounded-xl px-3.5 py-2 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <RefreshCw size={13} /> Calculate Another
                  </button>
                </div>

                {/* Primary Price Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Left Highlight Panel: Range */}
                  <div className="md:col-span-7 bg-[#0a4225]/5 border border-[#0a4225]/10 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold text-[#0a4225] uppercase tracking-widest block mb-2">Estimated Market Range</span>
                      <div className="text-2xl sm:text-3xl font-black text-[#0a4225] tracking-tight">
                        Rs. {result.lowPrice.toLocaleString()} - Rs. {result.highPrice.toLocaleString()}
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium mt-1">
                        Calculated based on listing profile in {result.location}.
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">Input Base Price:</span>
                      <span className="text-gray-800 font-extrabold">Rs. {result.averagePrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Right Breakdowns Panel */}
                  <div className="md:col-span-5 border border-gray-100 rounded-2xl p-5 space-y-3.5 flex flex-col justify-center">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold">Rate Per Sq. Ft:</span>
                      <span className="text-gray-800 font-extrabold">Rs. {result.pricePerSqFt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold">Property Type:</span>
                      <span className="text-gray-800 font-extrabold">{result.propertyType}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold">Transaction Category:</span>
                      <span className="text-gray-800 font-extrabold">{result.listingType}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold">Location Filter:</span>
                      <span className="text-gray-800 font-extrabold truncate max-w-[140px]">{result.location}</span>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer Section */}
          <div id="oppi-disclaimer" className="text-[11px] text-gray-400 leading-relaxed space-y-2 mt-8 border-t border-gray-100 pt-6">
            <p>
              <strong className="text-gray-500 font-extrabold uppercase tracking-wider text-[10px] block mb-1">Disclaimer:</strong>
              The Online Property Price Indicator (OPPI) is a statistical model that uses information from the properties advertised on Lanka Property Web to provide an indicative estimate of the current market value of a residential or commercial property. The model is based on the properties advertised on our site, which may not reflect the specific circumstances of your property.
            </p>
            <p>
              The OPPI is not a registered valuer and cannot be relied on for the purpose of buying or selling a property. Prices within the area will have their own variances, such as property close to main roads or junctions being expensive and above average. If you wish to obtain more accurate prices for your property or neighborhood prices, then you should view ‘Properties for sale’ listings for that area, check with an estate agent or a registered valuer in your area.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
