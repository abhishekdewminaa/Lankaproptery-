import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, ChevronDown, Activity, Trash2, Sparkles, Loader2, Bot } from 'lucide-react';
import { getSmartSearchFilters } from '../../services/geminiService';
import { DISTRICTS_BY_PROVINCE } from '../../constants/districts';

const POPULAR_CITIES = [
  'Colombo', 'Kandy', 'Galle', 'Negombo', 'Kurunegala', 
  'Jaffna', 'Gampaha', 'Batticaloa', 'Trincomalee', 'Matara', 
  'Nugegoda', 'Mount Lavinia', 'Dehiwala', 'Rajagiriya', 'Malabe',
  'Battaramulla', 'Kotte', 'Wattala', 'Moratuwa', 'Maharagama'
];

const CITIES_BY_DISTRICT: Record<string, string[]> = {
  'Colombo': ['Colombo', 'Nugegoda', 'Dehiwala', 'Mount Lavinia', 'Moratuwa', 'Maharagama', 'Kotte', 'Rajagiriya', 'Malabe', 'Battaramulla', 'Kolonnawa', 'Avissawella', 'Hanwella', 'Homagama', 'Kesbewa', 'Piliyandala'],
  'Gampaha': ['Gampaha', 'Negombo', 'Wattala', 'Kelaniya', 'Ja-Ela', 'Kadawatha', 'Kiribathgoda', 'Ragama', 'Minuwangoda', 'Veyangoda', 'Nittambuwa', 'Mirigama'],
  'Kalutara': ['Kalutara', 'Panadura', 'Horana', 'Aluthgama', 'Beruwala', 'Matugama', 'Wadduwa', 'Bandaragama'],
  'Kandy': ['Kandy', 'Peradeniya', 'Katugastota', 'Gampola', 'Nawalapitiya', 'Kundasale', 'Pilimathalawa'],
  'Matale': ['Matale', 'Dambulla', 'Sigiriya', 'Ukuwela'],
  'Nuwara Eliya': ['Nuwara Eliya', 'Hatton', 'Talawakele', 'Ginigathena'],
  'Galle': ['Galle', 'Hikkaduwa', 'Elpitiya', 'Karapitiya', 'Ambalangoda', 'Ahangama'],
  'Matara': ['Matara', 'Weligama', 'Dikwella', 'Mirissa', 'Deniyaya'],
  'Hambantota': ['Hambantota', 'Tangalle', 'Beliatta', 'Ambalantota', 'Tissamaharama'],
  'Jaffna': ['Jaffna', 'Chavakachcheri', 'Point Pedro', 'Nallur'],
  'Kurunegala': ['Kurunegala', 'Kuliyapitiya', 'Wariyapola', 'Narammala', 'Mawathagama', 'Ibbagamuwa'],
  'Puttalam': ['Puttalam', 'Chilaw', 'Marawila', 'Wennappuwa', 'Kalpitiya'],
  'Anuradhapura': ['Anuradhapura', 'Mihintale', 'Kekirawa', 'Eppawala'],
  'Polonnaruwa': ['Polonnaruwa', 'Kaduruwela', 'Hingurakgoda'],
  'Badulla': ['Badulla', 'Bandarawela', 'Hali-Ela', 'Ella', 'Diyatalawa', 'Mahiyanganaya'],
  'Monaragala': ['Monaragala', 'Wellawaya', 'Buttala', 'Kataragama'],
  'Ratnapura': ['Ratnapura', 'Balangoda', 'Pelmadulla', 'Embilipitiya'],
  'Kegalle': ['Kegalle', 'Mawanella', 'Rambukkana', 'Warakapola'],
  'Batticaloa': ['Batticaloa', 'Kattankudy', 'Eravur'],
  'Ampara': ['Ampara', 'Kalmunai', 'Samanthurai'],
  'Trincomalee': ['Trincomalee', 'Kinniya']
};

const ALL_CITIES_FLAT: string[] = [];
Object.values(CITIES_BY_DISTRICT).forEach(cities => {
  ALL_CITIES_FLAT.push(...cities);
});
const UNIQUE_SORTED_CITIES = Array.from(new Set(ALL_CITIES_FLAT)).sort();

const getCityDistrict = (cityName: string): string => {
  for (const [district, cities] of Object.entries(CITIES_BY_DISTRICT)) {
    if (cities.includes(cityName)) {
      return district;
    }
  }
  return '';
};

interface HeroProps {
  propertyCount: number;
  onSearch: (filters: any) => void;
  onNavigate?: (view: any) => void;
}

export const Hero: React.FC<HeroProps> = ({ propertyCount, onSearch, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'sale' | 'rent' | 'lease'>('sale');
  const [isAISearch, setIsAISearch] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bilingualIndex, setBilingualIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  // Normal Search State variables
  const [searchType, setSearchType] = useState('All Types');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [searchBeds, setSearchBeds] = useState('Bedrooms');
  const [searchMinPrice, setSearchMinPrice] = useState('Min Price');
  const [searchMaxPrice, setSearchMaxPrice] = useState('Max Price');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const bilingualTexts = [
    "Call Voice Assistant",
    "Speak with Voice AI"
  ];
  
  const cycleWords = ["Perfect", "Dream", "Ideal", "Luxury", "Future"];

  useEffect(() => {
    const interval = setInterval(() => {
      setBilingualIndex((prev) => (prev === 0 ? 1 : 0));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % cycleWords.length);
    }, 3000);
    return () => clearInterval(wordInterval);
  }, []);

  const handleAISearch = async () => {
    if (!aiQuery.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const filters = await getSmartSearchFilters(aiQuery);
      if (filters) {
        onSearch(filters);
      }
    } catch (error) {
      console.error("AI Search failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <section className="relative h-[calc(100vh-124px)] md:h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background with Luxury Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Property" 
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        {/* Text Content */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[28px] md:text-7xl font-bold text-white mb-4 drop-shadow-lg leading-tight"
        >
          Find Your{' '}
          <div className="inline-grid [grid-template-columns:1fr] [grid-template-rows:1fr] align-baseline text-[#004F31] min-w-[100px] md:min-w-[280px] text-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0, y: 40, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -40, rotateX: 90 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                className="[grid-area:1/1] origin-center block whitespace-nowrap font-black tracking-tight text-[28px] md:text-7xl"
              >
                {cycleWords[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
          {' '}Home <br className="hidden md:block" /> in Sri Lanka
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-[#004F31] font-semibold tracking-widest text-[14px] md:text-base uppercase mb-8 md:mb-12"
        >
          Sri Lanka's #1 Real Estate Marketplace
        </motion.p>

        {/* Search Widget */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-5xl mx-auto bg-white rounded-[24px] shadow-2xl p-4 md:p-10"
        >
          {/* Row 1 - Type Tabs & AI Toggle */}
          <div className="flex flex-col lg:flex-row justify-between items-center mb-6 md:mb-8 gap-4 md:gap-6">
            <div className="flex overflow-x-auto no-scrollbar w-full lg:w-max shrink-0 bg-gray-100 p-1.5 md:rounded-2xl rounded-full snap-x snap-mandatory">
              {[
                { id: 'sale', label: '🏠 For Sale' },
                { id: 'rent', label: '🔑 For Rent' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative z-10 flex-col md:flex-row flex-1 lg:flex-none px-6 md:px-8 py-3 rounded-full md:rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap outline-none min-w-[120px] md:min-w-0 snap-start shrink-0 ${
                        isActive 
                        ? 'text-[white]' 
                        : 'text-dark-navy hover:text-[#004F31]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabHero"
                        className="absolute inset-0 bg-[#004F31] rounded-full md:rounded-xl shadow-[0_4px_12px_rgba(0,79,49,0.3)]"
                        initial={false}
                        transition={{
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <motion.span 
                      className="relative z-10 block"
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                    >
                      {tab.label}
                    </motion.span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto justify-center lg:justify-end overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              <motion.button 
                onClick={() => setIsAISearch(!isAISearch)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96, y: 1 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className={`flex items-center justify-center gap-2 px-4 md:px-5 py-3 rounded-full border-2 transition-colors font-black text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap shrink-0 h-[44px] md:h-[48px] ${
                  isAISearch 
                    ? 'bg-brand-green/10 border-brand-green text-brand-green shadow-[0_4px_14px_0_rgba(0,105,65,0.15)]' 
                    : 'border-gray-200 text-gray-500 hover:text-brand-green hover:bg-gray-50 shadow-sm hover:shadow-[0_4px_14px_0_rgba(0,105,65,0.1)]'
                }`}
              >
                <Sparkles size={16} className={isAISearch ? 'animate-pulse shrink-0' : 'shrink-0'} />
                <span className="hidden sm:inline">AI Smart Search</span>
                <span className="sm:hidden">AI Search</span>
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isAISearch ? (
              <motion.div
                key="ai-search"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4"
              >
                <div className="relative group flex flex-col md:block">
                  <div className="absolute left-4 top-6 md:top-1/2 md:-translate-y-1/2 text-brand-green">
                    <Bot size={24} className="animate-bounce" />
                  </div>
                  <input 
                    type="text" 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                    placeholder="e.g. '3 bed house in Colombo under 50m'"
                    className="w-full bg-brand-green/[0.03] border-2 border-brand-green/20 focus:border-brand-green md:rounded-2xl rounded-xl py-4 md:py-6 pl-12 md:pl-16 pr-4 md:pr-32 text-base md:text-lg font-medium outline-none transition-all placeholder:text-gray-400 mb-2 md:mb-0"
                  />
                  <button 
                    onClick={handleAISearch}
                    disabled={!aiQuery.trim() || isAnalyzing}
                    className="md:absolute right-4 md:top-1/2 md:-translate-y-1/2 bg-brand-green text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-green-dark transition-all shadow-lg disabled:opacity-50 h-[48px] md:h-auto flex items-center justify-center w-full md:w-auto"
                  >
                    {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : "Analyze"}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3 ml-2 justify-center md:justify-start">
                  <Sparkles size={12} className="text-brand-green" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Try: "Luxury villa in Galle for lease"</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="normal-search"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {/* Row 2 - Main search */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-3 md:mb-4">
                  <div className="relative w-full md:w-[200px] shrink-0">
                    <select 
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="w-full bg-gray-50 border border-transparent focus:border-brand-green focus:bg-white rounded-xl h-[48px] px-4 appearance-none text-sm font-medium outline-none transition-all cursor-pointer"
                    >
                      <option value="All Types">All Types</option>
                      <option value="House">Houses</option>
                      <option value="Apartment">Apartments</option>
                      <option value="Land">Land</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Building">Buildings</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                  
                  <div className="relative w-full md:w-[200px] shrink-0 hidden md:block">
                    <select 
                      value={searchDistrict}
                      onChange={(e) => setSearchDistrict(e.target.value)}
                      className="w-full bg-gray-50 border border-transparent focus:border-brand-green focus:bg-white rounded-xl h-[48px] px-4 appearance-none text-sm font-medium outline-none transition-all cursor-pointer"
                    >
                      <option value="">All Districts</option>
                      {Object.entries(DISTRICTS_BY_PROVINCE).map(([province, districts]) => (
                        <optgroup key={province} label={province}>
                          {districts.map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>

                  <div className="relative group flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-green transition-colors">
                      <Search size={20} />
                    </div>
                    <input 
                      type="text" 
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value);
                        setShowCityDropdown(true);
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setShowCityDropdown(false), 200);
                      }}
                      placeholder="City, Neighborhood, or Landmark"
                      className="w-full bg-gray-50 border border-transparent focus:border-brand-green focus:bg-white rounded-xl h-[48px] pl-12 pr-4 text-sm font-medium outline-none transition-all"
                    />

                    {/* Elegant Autocomplete Dropdown */}
                    <AnimatePresence>
                      {showCityDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.15),0_5px_15px_-3px_rgba(0,0,0,0.1)] border border-gray-100/80 z-[110] max-h-[320px] overflow-y-auto no-scrollbar"
                        >
                          {cityInput.trim() === '' ? (
                            <div className="p-4">
                              <div className="mb-4">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2.5 text-left">
                                  🔥 Popular Real Estate Hubs
                                </span>
                                <div className="flex flex-wrap gap-1.5 justify-start">
                                  {POPULAR_CITIES.map(city => (
                                    <button
                                      key={city}
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        setCityInput(city);
                                        const dist = getCityDistrict(city);
                                        if (dist) setSearchDistrict(dist);
                                        setShowCityDropdown(false);
                                      }}
                                      className="px-3 py-1.5 bg-gray-50 hover:bg-brand-green hover:text-white rounded-lg text-xs font-bold text-gray-600 transition-colors cursor-pointer"
                                    >
                                      {city}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="text-left">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
                                  📍 Select by District
                                </span>
                                <div className="grid grid-cols-2 gap-1 max-h-[140px] overflow-y-auto pr-1">
                                  {Object.keys(CITIES_BY_DISTRICT).sort().map(district => (
                                    <button
                                      key={district}
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        setSearchDistrict(district);
                                        setCityInput('');
                                        setShowCityDropdown(false);
                                      }}
                                      className="text-left px-2.5 py-1.5 hover:bg-gray-50 text-xs font-bold text-gray-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green/40" />
                                      {district}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 text-left">
                              {UNIQUE_SORTED_CITIES.filter(city => city.toLowerCase().includes(cityInput.toLowerCase())).length > 0 ? (
                                UNIQUE_SORTED_CITIES
                                  .filter(city => city.toLowerCase().includes(cityInput.toLowerCase()))
                                  .map((city) => {
                                    const district = getCityDistrict(city);
                                    return (
                                      <button
                                        key={city}
                                        type="button"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          setCityInput(city);
                                          if (district) setSearchDistrict(district);
                                          setShowCityDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-brand-green/5 hover:text-brand-green flex items-center justify-between rounded-xl transition-colors cursor-pointer group"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <MapPin size={16} className="text-gray-400 group-hover:text-brand-green transition-colors" />
                                          <span className="text-sm font-bold text-gray-800 group-hover:text-brand-green">{city}</span>
                                        </div>
                                        {district && (
                                          <span className="text-[10px] font-bold uppercase text-gray-400 group-hover:text-brand-green/80 bg-gray-50 px-2 py-0.5 rounded-md">
                                            {district}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })
                              ) : (
                                <div className="p-6 text-center text-gray-400 text-sm font-medium">
                                  No cities found matching "{cityInput}"
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Row 3 - Filters & Search Now */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center">
                  <div className="flex flex-row gap-3 w-full border-t border-gray-100 pt-3 md:pt-0 md:border-0 lg:w-auto overflow-x-auto no-scrollbar shrink-0 pb-1 md:pb-0">
                    <div className="relative shrink-0 min-w-[120px] hidden md:block">
                      <select 
                        value={searchBeds}
                        onChange={(e) => setSearchBeds(e.target.value)}
                        className="w-full bg-gray-50 rounded-xl h-[48px] px-4 appearance-none text-xs font-bold text-gray-600 outline-none cursor-pointer"
                      >
                        <option value="Any Beds">Bedrooms</option>
                        <option value="1">1+ Beds</option>
                        <option value="2">2+ Beds</option>
                        <option value="3">3+ Beds</option>
                        <option value="4">4+ Beds</option>
                        <option value="5">5+ Beds</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                    <div className="relative shrink-0 min-w-[130px] flex-1 md:flex-none">
                      <select 
                        value={searchMinPrice}
                        onChange={(e) => setSearchMinPrice(e.target.value)}
                        className="w-full bg-gray-50 rounded-xl h-[48px] px-4 appearance-none text-xs font-bold text-gray-600 outline-none cursor-pointer"
                      >
                        <option value="Any">Min Price</option>
                        <option value="1000000">Rs. 10 Lakhs (1M)</option>
                        <option value="5000000">Rs. 50 Lakhs (5M)</option>
                        <option value="10000000">Rs. 1 Crore (10M)</option>
                        <option value="25000000">Rs. 2.5 Crores (25M)</option>
                        <option value="50000000">Rs. 5 Crores (50M)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                    <div className="relative shrink-0 min-w-[130px] flex-1 md:flex-none">
                      <select 
                        value={searchMaxPrice}
                        onChange={(e) => setSearchMaxPrice(e.target.value)}
                        className="w-full bg-gray-50 rounded-xl h-[48px] px-4 appearance-none text-xs font-bold text-gray-600 outline-none cursor-pointer"
                      >
                        <option value="Any">Max Price</option>
                        <option value="5000000">Rs. 50 Lakhs (5M)</option>
                        <option value="10000000">Rs. 1 Crore (10M)</option>
                        <option value="25000000">Rs. 2.5 Crores (25M)</option>
                        <option value="50000000">Rs. 5 Crores (50M)</option>
                        <option value="100000000">Rs. 10 Crores (100M)</option>
                        <option value="200000000">Rs. 20 Crores (200M+)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                  <motion.button 
                    onClick={() => {
                      onSearch({
                        status: activeTab === 'sale' ? 'Sale' : activeTab === 'rent' ? 'Rent' : 'Lease',
                        category: searchType === 'All Types' ? 'All Categories' : searchType,
                        district: searchDistrict || 'All Districts',
                        text: cityInput.trim(),
                        beds: searchBeds,
                        minPrice: searchMinPrice,
                        maxPrice: searchMaxPrice
                      });
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ 
                      boxShadow: [
                        "0 10px 20px -5px rgba(0, 79, 49, 0.2)",
                        "0 10px 30px 5px rgba(0, 79, 49, 0.4)",
                        "0 10px 20px -5px rgba(0, 79, 49, 0.2)"
                      ],
                      x: [0, -2, 2, -2, 2, 0],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{
                      boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                      x: { duration: 0.5, repeat: Infinity, repeatDelay: 3 },
                      opacity: { duration: 1, repeat: Infinity, repeatDelay: 5 }
                    }}
                    className="w-full md:w-auto md:min-w-[200px] h-[52px] bg-brand-green hover:bg-brand-green-medium text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-green/20"
                  >
                    <Search size={18} strokeWidth={3} /> Search Now
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Info */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <Activity size={14} className="text-brand-green" />
                {propertyCount.toLocaleString()} properties found
              </span>
              <button 
                onClick={() => {
                  setSearchType('All Types');
                  setSearchDistrict('');
                  setCityInput('');
                  setSearchBeds('Any Beds');
                  setSearchMinPrice('Any');
                  setSearchMaxPrice('Any');
                  onSearch({
                    status: activeTab === 'sale' ? 'Sale' : activeTab === 'rent' ? 'Rent' : 'Lease',
                    category: 'All Categories',
                    district: 'All Districts',
                    text: '',
                    beds: 'Any Beds',
                    minPrice: 'Any',
                    maxPrice: 'Any'
                  });
                }}
                className="text-xs font-black text-gray-400 hover:text-brand-red flex items-center gap-1 transition-colors uppercase cursor-pointer"
              >
                <Trash2 size={12} /> Clear Filters
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-300 uppercase">Popular:</span>
              <div className="flex gap-2">
                {[
                  { label: 'Colombo', text: 'Colombo' },
                  { label: 'Kandy', text: 'Kandy' },
                  { label: 'Galle', text: 'Galle' }
                ].map(tag => (
                  <button 
                    key={tag.label} 
                    onClick={() => {
                      setCityInput(tag.text);
                      const dist = getCityDistrict(tag.text);
                      if (dist) setSearchDistrict(dist);
                      onSearch({
                        status: activeTab === 'sale' ? 'Sale' : activeTab === 'rent' ? 'Rent' : 'Lease',
                        category: searchType === 'All Types' ? 'All Categories' : searchType,
                        district: dist || 'All Districts',
                        text: tag.text,
                        beds: searchBeds,
                        minPrice: searchMinPrice,
                        maxPrice: searchMaxPrice
                      });
                    }}
                    className="px-2.5 py-1 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-md hover:bg-brand-green/10 hover:text-brand-green transition-colors cursor-pointer"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
