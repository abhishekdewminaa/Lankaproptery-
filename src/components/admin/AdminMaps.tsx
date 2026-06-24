import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, Search, ExternalLink, Loader2, Navigation, 
  Map as MapIcon, Home, Zap, Building, Crosshair, 
  Navigation2, History, Copy, Layers, Target, ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../../supabaseClient';

const TABS = [
  { id: 'amenities', label: 'Nearby Amenities', icon: <Home size={16} />, placeholder: 'e.g. What schools are near Gampaha?' },
  { id: 'analysis', label: 'Area Analysis', icon: <Target size={16} />, placeholder: 'e.g. Analyze property market in Negombo' },
  { id: 'intel', label: 'Location Intel', icon: <Crosshair size={16} />, placeholder: 'e.g. Best areas to buy land near Colombo' },
  { id: 'schools', label: 'Schools & Facilities', icon: <Building size={16} />, placeholder: 'e.g. International schools near Kelaniya' }
];

const QUICK_PROMPTS = {
  amenities: [
    { label: '🏫 Schools nearby', query: 'List top schools near ' },
    { label: '🏥 Hospitals', query: 'Find hospitals near ' },
    { label: '🚌 Bus routes', query: 'Main bus routes around ' },
    { label: '🛒 Supermarkets', query: 'Supermarkets in ' },
    { label: '🕌 Religious sites', query: 'Religious sites near ' },
    { label: '⛽ Fuel stations', query: 'Fuel stations in ' },
    { label: '🏦 Banks & ATMs', query: 'Banks and ATMs near ' },
    { label: '🌊 Beach access', query: 'How close is beach access from ' }
  ],
  analysis: [
    { label: '📈 Gampaha market', query: 'Analyze property market trends in Gampaha' },
    { label: '📈 Colombo prices', query: 'What are current property prices in Colombo?' },
    { label: '📈 Negombo trends', query: 'Is Negombo a good real estate investment?' },
    { label: '📈 Kandy overview', query: 'Provide a real estate overview of Kandy' },
    { label: '🏆 Best ROI areas', query: 'Which areas in Sri Lanka have the best property ROI?' },
    { label: '💰 Affordable zones', query: 'Where to find affordable property near Colombo?' }
  ],
  intel: [
    { label: 'Find commercial hubs', query: 'Major commercial hubs near ' },
    { label: 'Luxury neighborhoods', query: 'Luxury residential neighborhoods in ' },
    { label: 'Upcoming developments', query: 'Upcoming infrastructure developments near ' }
  ],
  schools: [
    { label: 'International schools', query: 'International schools located in ' },
    { label: 'Pre-schools', query: 'Best pre-schools near ' },
    { label: 'Universities', query: 'Universities and higher education near ' }
  ]
};

const STATS = [
  { label: 'Districts Covered', value: '25', icon: <MapPin size={20} className="text-[#004F31]" /> },
  { label: 'Cities Mapped', value: '150+', icon: <Building size={20} className="text-[#004F31]" /> },
  { label: 'Searches Today', value: '124', icon: <Search size={20} className="text-[#004F31]" /> },
  { label: 'Avg Speed', value: '< 2s', icon: <Zap size={20} className="text-[#004F31]" /> }
];

interface DistrictData {
  district: string;
  province: string;
  count: number;
  avgPrice: number;
  trend: 'up' | 'down' | 'flat';
}

export default function AdminMaps() {
  const [activeTab, setActiveTab] = useState('amenities');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Gampaha, Sri Lanka');
  const [useLocation, setUseLocation] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [chunks, setChunks] = useState<any[]>([]);
  const [errorDesc, setErrorDesc] = useState('');
  
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [districtData, setDistrictData] = useState<DistrictData[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [proximityReport, setProximityReport] = useState<string>('');
  const [proximityLoading, setProximityLoading] = useState(false);

  useEffect(() => {
    fetchDistrictData();
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data } = await supabase.from('properties').select('id, listing_title, district, city').eq('status', 'active');
    if (data) setProperties(data);
  };

  const fetchDistrictData = async () => {
    // In a real app, you would aggregate this from Supabase
    // Here we simulate it based on typical values
    const mockData: DistrictData[] = [
      { district: 'Colombo', province: 'Western', count: 1245, avgPrice: 15000000, trend: 'up' },
      { district: 'Gampaha', province: 'Western', count: 850, avgPrice: 8500000, trend: 'up' },
      { district: 'Kalutara', province: 'Western', count: 320, avgPrice: 6500000, trend: 'flat' },
      { district: 'Kandy', province: 'Central', count: 420, avgPrice: 12000000, trend: 'up' },
      { district: 'Matale', province: 'Central', count: 140, avgPrice: 4500000, trend: 'flat' },
      { district: 'Nuwara Eliya', province: 'Central', count: 110, avgPrice: 16000000, trend: 'down' },
      { district: 'Galle', province: 'Southern', count: 310, avgPrice: 11000000, trend: 'up' },
      { district: 'Matara', province: 'Southern', count: 190, avgPrice: 6000000, trend: 'flat' },
      { district: 'Hambantota', province: 'Southern', count: 85, avgPrice: 4000000, trend: 'up' },
      { district: 'Jaffna', province: 'Northern', count: 165, avgPrice: 5500000, trend: 'flat' },
      { district: 'Kilinochchi', province: 'Northern', count: 42, avgPrice: 2500000, trend: 'flat' },
      { district: 'Mannar', province: 'Northern', count: 30, avgPrice: 2000000, trend: 'flat' },
      { district: 'Vavuniya', province: 'Northern', count: 55, avgPrice: 3000000, trend: 'flat' },
      { district: 'Mullaitivu', province: 'Northern', count: 20, avgPrice: 1800000, trend: 'flat' },
      { district: 'Batticaloa', province: 'Eastern', count: 120, avgPrice: 4200000, trend: 'flat' },
      { district: 'Ampara', province: 'Eastern', count: 95, avgPrice: 3800000, trend: 'flat' },
      { district: 'Trincomalee', province: 'Eastern', count: 115, avgPrice: 5000000, trend: 'flat' },
      { district: 'Kurunegala', province: 'NW', count: 250, avgPrice: 4800000, trend: 'up' },
      { district: 'Puttalam', province: 'NW', count: 130, avgPrice: 3500000, trend: 'flat' },
      { district: 'Anuradhapura', province: 'NC', count: 145, avgPrice: 4000000, trend: 'up' },
      { district: 'Polonnaruwa', province: 'NC', count: 80, avgPrice: 3200000, trend: 'flat' },
      { district: 'Badulla', province: 'Uva', count: 105, avgPrice: 4500000, trend: 'flat' },
      { district: 'Moneragala', province: 'Uva', count: 65, avgPrice: 2800000, trend: 'flat' },
      { district: 'Ratnapura', province: 'Sabaragamuwa', count: 175, avgPrice: 5200000, trend: 'flat' },
      { district: 'Kegalle', province: 'Sabaragamuwa', count: 140, avgPrice: 4600000, trend: 'flat' },
    ];
    setDistrictData(mockData);
  };

  const activePlaceholder = TABS.find(t => t.id === activeTab)?.placeholder || '';

  const handleQuickPrompt = (prompt: string) => {
    if (useLocation && location) {
      setQuery(prompt + location);
    } else {
      setQuery(prompt);
    }
  };

  const handleSearch = async (e: React.FormEvent | null, searchStr = query) => {
    if (e) e.preventDefault();
    if (!searchStr.trim()) return;

    setLoading(true);
    setErrorDesc('');
    setResultText('');
    setChunks([]);

    setRecentSearches(prev => Array.from(new Set([searchStr, ...prev])).slice(0, 5));

    try {
      const payload: any = { message: searchStr };

      const res = await fetch('/api/ai/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch maps data');

      setResultText(data.text);
      setChunks(data.chunks || []);
    } catch (err: any) {
      setErrorDesc(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatSummaryForClipboard = () => {
    let summary = `📍 Location Overview:\n${resultText}`;
    if (chunks.length > 0) {
      summary += '\n\nNearby Amenities:\n';
      chunks.forEach(c => {
        if (c.maps?.title) {
          summary += `- ${c.maps.title}\n`;
        }
      });
    }
    copyToClipboard(summary);
  };

  const analyzeProximity = async () => {
    if (!selectedPropertyId) return;
    const prop = properties.find(p => p.id === selectedPropertyId);
    if (!prop) return;

    setProximityLoading(true);
    setProximityReport('');

    try {
      const q = `Find the nearest school, hospital, supermarket, bus stop, temple, and fuel station to ${prop.city}, ${prop.district}, Sri Lanka. Provide a structured proximity report suitable for a property listing description. Give an overall location score out of 10.`;
      
      const res = await fetch('/api/ai/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProximityReport(data.text);
    } catch (err: any) {
      setProximityReport(`Error generating report: ${err.message}`);
    } finally {
      setProximityLoading(false);
    }
  };

  return (
    <div className="bg-[#f8faf8] min-h-screen text-gray-900 -m-6 p-6">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Maps Intelligence</h1>
        <p className="text-gray-500 font-medium">
          AI-powered geographic insights for Sri Lanka property market using Gemini + Google Maps
        </p>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="text-3xl font-black text-gray-900">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* MAIN LAYOUT: 2 COLUMNS */}
      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        
        {/* LEFT COLUMN: SEARCH */}
        <div className="xl:w-[55%] flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          >
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-6">
              <Search size={20} className="text-[#004F31]" /> AI Property Search
            </h2>

            {/* TABS */}
            <div className="flex overflow-x-auto pb-4 gap-4 border-b border-gray-100 mb-6 scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 px-1 border-b-2 whitespace-nowrap transition-all font-bold text-sm ${
                    activeTab === tab.id 
                    ? 'border-[#004F31] text-[#004F31]' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* SEARCH FORM */}
            <form onSubmit={(e) => handleSearch(e)} className="space-y-5">
              <div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={activePlaceholder}
                  className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-[#004F31] focus:border-[#004F31] outline-none transition-all"
                />
              </div>

              {/* QUICK CHIPS */}
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {(QUICK_PROMPTS[activeTab as keyof typeof QUICK_PROMPTS] || []).map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt.query)}
                    className="shrink-0 bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-[#004F31]/5 hover:text-[#004F31] hover:border-[#004F31]/20 transition-all uppercase tracking-widest"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer w-full sm:w-auto">
                  <input
                    type="checkbox"
                    checked={useLocation}
                    onChange={e => setUseLocation(e.target.checked)}
                    className="w-5 h-5 text-[#004F31] rounded border-gray-300 focus:ring-[#004F31]"
                  />
                  <span className="text-sm font-bold text-gray-600">Base Location</span>
                </label>
                {useLocation && (
                  <div className="relative w-full sm:w-64">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full bg-white border border-gray-200 pl-9 pr-3 py-2 rounded-lg text-sm font-bold text-gray-900 outline-none"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#004F31] text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-green-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Search size={20} /> Search with Gemini + Maps</>
                )}
              </button>
            </form>
          </motion.div>

          {/* RESULTS DISPLAY */}
          {(loading || resultText || errorDesc) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            >
              {errorDesc && (
                <div className="p-4 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 flex items-start gap-3">
                  <ExternalLink size={20} className="shrink-0" />
                  {errorDesc}
                </div>
              )}

              {loading && !resultText && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[#004F31] font-bold pb-2">
                    <Loader2 size={18} className="animate-spin" /> 🤖 Gemini is analyzing location data...
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-5/6 animate-pulse" />
                  <div className="w-full h-1 bg-gray-100 overflow-hidden rounded-full mt-4">
                    <div className="h-full bg-[#004F31] w-1/3 animate-ping" />
                  </div>
                </div>
              )}

              {resultText && (
                <div className="space-y-6">
                  <div className="bg-white border-l-4 border-[#004F31] p-6 rounded-r-2xl border-y border-r border-gray-100">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                      <h3 className="text-xs font-black text-[#004F31] uppercase tracking-widest flex items-center gap-2">
                        📊 AI Analysis
                      </h3>
                      <button 
                        onClick={formatSummaryForClipboard}
                        className="text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1 text-[10px] uppercase font-black tracking-widest"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                    <div className="markdown-body prose max-w-none text-gray-700 text-sm leading-relaxed">
                      <ReactMarkdown>{resultText}</ReactMarkdown>
                    </div>
                  </div>

                  {chunks && chunks.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {chunks.map((chunk, idx) => {
                        if (chunk.maps && chunk.maps.uri) {
                          return (
                            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col hover:border-[#004F31] shadow-sm transition-all hover:shadow-md">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 flex-1 pr-2 leading-tight">
                                  🏫 {chunk.maps.title || 'Location marker'}
                                </h4>
                                <div className="text-yellow-500 flex items-center gap-1 text-[10px] font-black bg-yellow-50 px-2 py-0.5 rounded-full shrink-0">
                                  ⭐ 4.5
                                </div>
                              </div>
                              <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                                <MapPin size={12} /> 123 Main Street, {location.split(',')[0]}
                              </div>
                              <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5 mb-4">
                                <span className="text-[#004F31] font-bold">🕐 Open now</span> · 0.8 km away
                              </div>
                              <div className="mt-auto flex gap-2">
                                <a 
                                  href={chunk.maps.uri}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 bg-gray-50 text-gray-700 text-[10px] uppercase tracking-widest font-black py-2.5 rounded-lg text-center hover:bg-gray-100 flex items-center justify-center gap-1 border border-gray-200 transition-colors"
                                >
                                  📍 View on Map
                                </a>
                                <button className="flex-1 bg-gray-50 text-gray-700 text-[10px] uppercase tracking-widest font-black py-2.5 rounded-lg text-center hover:bg-gray-100 flex items-center justify-center gap-1 border border-gray-200 transition-colors">
                                  📋 Copy Details
                                </button>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  <button 
                    onClick={formatSummaryForClipboard}
                    className="w-full border-2 border-[#004F31] text-[#004F31] py-4 rounded-xl font-black tracking-widest text-xs uppercase hover:bg-[#004F31] hover:text-white transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <Copy size={16} /> Add to Property Description
                  </button>
                </div>
              )}

              {recentSearches.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">📜 Recent Searches</h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSearch(null, s)}
                        className="bg-gray-50 px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-[#004F31] hover:text-white hover:border-[#004F31] transition-all line-clamp-1 max-w-[200px]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </div>

        {/* RIGHT COLUMN: MAP PREVIEW */}
        <div className="xl:w-[45%] flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-2 rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col h-[500px]"
          >
            {/* Map Embed */}
            <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-blue-50 border border-gray-100">
               <iframe 
                  title="Google Maps"
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  style={{ border: 0 }} 
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
                  allowFullScreen
               ></iframe>

               {/* Map Controls */}
               <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  {['🏠 Properties', '🏫 Schools', '🏥 Hospitals', '🛒 Markets', '🚌 Transit'].map((item, i) => (
                     <button key={i} className="bg-white px-3 py-1.5 rounded-full shadow-lg text-[10px] font-black uppercase text-gray-700 hover:text-[#004F31] transition-colors border border-gray-200">
                        {item}
                     </button>
                  ))}
                  <button className="bg-[#004F31] text-white px-3 py-1.5 rounded-full shadow-lg text-[10px] font-black uppercase mt-2 hover:bg-green-900 transition-colors">
                     📍 Reset
                  </button>
               </div>

               <div className="absolute top-4 left-4 flex gap-2 w-[calc(100%-140px)] overflow-x-auto scrollbar-hide py-1 pl-1">
                 {['Gampaha', 'Colombo', 'Negombo', 'Kandy', 'Galle'].map(c => (
                   <button 
                     key={c}
                     onClick={() => setLocation(`${c}, Sri Lanka`)}
                     className={`shrink-0 px-4 py-2 rounded-full shadow-md text-[10px] uppercase font-black tracking-widest border transition-all ${location.includes(c) ? 'bg-[#004F31] text-white border-[#004F31]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#004F31] hover:text-[#004F31]'}`}
                   >
                     📍 {c}
                   </button>
                 ))}
               </div>
            </div>
          </motion.div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
             <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
               <Layers size={18} className="text-[#004F31]" /> 📋 Location Details
             </h3>
             <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-bold">Current area</span>
                   <span className="font-black text-gray-900">{location.split(',')[0]} District</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-bold">Province</span>
                   <span className="font-black text-gray-900">{districtData.find(d => d.district === location.split(',')[0])?.province || 'Western'} Province</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-bold">Properties listed</span>
                   <span className="font-black text-gray-900 bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">1,245</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-bold">Avg price per perch</span>
                   <span className="font-black text-[#004F31]">Rs. 450,000</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-bold">Most searched</span>
                   <span className="font-black text-gray-900 bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">House for Sale</span>
                </div>
             </div>
             <button className="w-full text-xs font-black uppercase tracking-widest text-[#004F31] bg-[#004F31]/5 hover:bg-[#004F31]/10 py-4 rounded-xl transition-colors border border-[#004F31]/10">
                View All {location.split(',')[0]} Listings →
             </button>
          </div>
        </div>

      </div>

      {/* FULL WIDTH: DISTRICT MAP SECTION */}
      <div className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-8">
        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          📍 Property Coverage by District
        </h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-black text-gray-500">
                <th className="py-4 px-6 border-b border-gray-200">District</th>
                <th className="py-4 px-6 border-b border-gray-200">Province</th>
                <th className="py-4 px-6 border-b border-gray-200">Active Listings</th>
                <th className="py-4 px-6 border-b border-gray-200">Avg Price</th>
                <th className="py-4 px-6 border-b border-gray-200">Trend</th>
                <th className="py-4 px-6 border-b border-gray-200 text-right">Quick Search</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {districtData.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-900 flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" /> {d.district}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-600">{d.province}</td>
                  <td className="py-4 px-6 text-sm font-bold text-[#004F31]">{d.count}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-600">Rs. {(d.avgPrice / 1000000).toFixed(1)}M</td>
                  <td className="py-4 px-6">
                    {d.trend === 'up' && <span className="text-green-500 font-bold">↑</span>}
                    {d.trend === 'down' && <span className="text-red-500 font-bold">↓</span>}
                    {d.trend === 'flat' && <span className="text-gray-400 font-bold">→</span>}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => {
                         setLocation(`${d.district}, Sri Lanka`);
                         setUseLocation(true);
                         window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-[10px] font-black uppercase text-[#004F31] border border-[#004F31]/20 bg-[#004F31]/5 px-4 py-2 rounded-lg hover:bg-[#004F31] hover:text-white transition-all tracking-widest"
                    >
                      Search
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL WIDTH: PROXIMITY ANALYZER */}
      <div className="bg-white p-6 md:p-10 rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#004F31]/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl z-0 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <Zap size={24} className="text-[#004F31]" /> Property Proximity Analyzer
          </h2>
          <p className="text-gray-500 font-medium mb-8">
            Check what's near any of your active listed properties using AI.
          </p>

          <div className="flex flex-col md:flex-row gap-4 max-w-4xl bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="relative flex-1">
              <select 
                value={selectedPropertyId}
                onChange={e => setSelectedPropertyId(e.target.value)}
                className="w-full bg-white border border-gray-200 p-4 rounded-xl text-sm font-bold text-gray-900 outline-none appearance-none pr-10 hover:border-[#004F31] focus:ring-2 focus:ring-[#004F31] transition-all"
              >
                <option value="">Select a Property to analyze...</option>
                {properties.map(p => (
                   <option key={p.id} value={p.id}>{p.listing_title} ({p.district})</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button 
               onClick={analyzeProximity}
               disabled={!selectedPropertyId || proximityLoading}
               className="bg-[#004F31] text-white px-8 py-4 rounded-xl font-black shrink-0 hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#004F31]/20"
            >
               {proximityLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />} 
               {proximityLoading ? 'Analyzing...' : 'Analyze Proximity'}
            </button>
          </div>

          {proximityReport && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white p-8 rounded-2xl border-2 border-[#004F31]/20 shadow-xl shadow-[#004F31]/5"
            >
               <h3 className="text-lg font-black text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                  <span>📊 Proximity Report for Selected Property</span>
                  <span className="bg-[#004F31]/10 text-[#004F31] px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest whitespace-nowrap">
                    Score: 8.5 / 10
                  </span>
               </h3>
               <div className="markdown-body prose max-w-none text-gray-700 text-[13px] leading-relaxed mb-8">
                  <ReactMarkdown>{proximityReport}</ReactMarkdown>
               </div>
               
               <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                  <button onClick={() => copyToClipboard(proximityReport)} className="bg-white border-2 border-[#004F31] text-[#004F31] px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#004F31] hover:text-white flex items-center gap-2 transition-colors">
                    <Copy size={16} /> Add to Listing
                  </button>
                  <button className="bg-gray-50 border-2 border-gray-200 text-gray-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 flex items-center gap-2 transition-colors">
                    <Target size={16} /> Full Report
                  </button>
                  <button className="bg-gray-50 border-2 border-gray-200 text-gray-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 flex items-center gap-2 transition-colors">
                    <MapIcon size={16} /> View Map
                  </button>
               </div>
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
}
