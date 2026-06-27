import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUp, ArrowDown, ChevronRight, Search, LayoutGrid, 
  Table, Info, X, MapPin, Building, Calendar, ArrowUpRight, Check
} from 'lucide-react';
import { DistrictData, MOCK_DISTRICTS, DISTRICT_COORDS } from './types';

interface DistrictTableProps {
  properties: any[];
  onFocusLocation: (center: [number, number], zoom: number) => void;
}

export default function DistrictTable({ properties, onFocusLocation }: DistrictTableProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);

  // Group real-time properties by district to enrich stats
  const enrichedDistricts = useMemo(() => {
    return MOCK_DISTRICTS.map(dist => {
      const matchProps = properties.filter(p => p.district === dist.district);
      const count = matchProps.length || dist.count;
      
      // Calculate avg days to sell
      let totalDays = dist.avgDaysToSell;
      
      return {
        ...dist,
        count,
        avgDaysToSell: Math.round(totalDays)
      };
    });
  }, [properties]);

  // Handle click on district (focuses map and displays side panel)
  const handleSelectDistrict = (dist: DistrictData) => {
    setSelectedDistrict(dist);
    const coords = DISTRICT_COORDS[dist.district] || DISTRICT_COORDS['Colombo'];
    onFocusLocation(coords, 12);
  };

  // Find top 3 listings in selected district
  const districtTopListings = useMemo(() => {
    if (!selectedDistrict) return [];
    return properties
      .filter(p => p.district === selectedDistrict.district)
      .slice(0, 3);
  }, [properties, selectedDistrict]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] mb-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            📊 Property Coverage & Demand Analyzer
          </h2>
          <p className="text-xs font-semibold text-gray-500 mt-1 leading-none">
            District-by-district breakdown of inventory, pricing trends, and market velocity
          </p>
        </div>

        {/* VIEW TOGGLE */}
        <div className="flex bg-gray-50 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-gray-100">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Table size={14} /> Table View
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid size={14} /> Card View
          </button>
        </div>
      </div>

      {/* RENDER VIEW SCHEMES */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">District</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Province</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Properties</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Avg Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Trend</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Demand Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Days to Sell</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">MoM Change</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enrichedDistricts.map((dist) => (
                <tr 
                  key={dist.district}
                  onClick={() => handleSelectDistrict(dist)}
                  className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-xs font-black text-gray-950">{dist.district}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">{dist.province}</td>
                  <td className="px-6 py-4 text-xs font-black text-gray-900 text-right">{dist.count.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs font-black text-[#004F31] text-right">
                    Rs. {(dist.avgPrice / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-6 py-4 text-center">
                    {dist.trend === 'up' && <span className="inline-flex p-1.5 rounded-full bg-emerald-50 text-emerald-600"><ArrowUp size={12} strokeWidth={3} /></span>}
                    {dist.trend === 'down' && <span className="inline-flex p-1.5 rounded-full bg-red-50 text-red-600"><ArrowDown size={12} strokeWidth={3} /></span>}
                    {dist.trend === 'flat' && <span className="text-gray-300 font-black">—</span>}
                  </td>
                  <td className="px-6 py-4 min-w-[140px]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${dist.demand >= 75 ? 'bg-emerald-500' : dist.demand >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${dist.demand}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-gray-500 w-6">{dist.demand}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-gray-700 text-right">{dist.avgDaysToSell} days</td>
                  <td className="px-6 py-4 text-xs font-black text-right">
                    <span className={dist.priceTrendMoM > 0 ? 'text-emerald-600' : dist.priceTrendMoM < 0 ? 'text-red-500' : 'text-gray-400'}>
                      {dist.priceTrendMoM > 0 ? `↑ +${dist.priceTrendMoM}%` : dist.priceTrendMoM < 0 ? `↓ ${dist.priceTrendMoM}%` : '0%'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARD GRID SCHEME */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {enrichedDistricts.map((dist) => (
            <div
              key={dist.district}
              onClick={() => handleSelectDistrict(dist)}
              className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg hover:border-[#004F31]/10 transition-all cursor-pointer flex flex-col justify-between h-[210px]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-gray-900 text-sm leading-none">{dist.district}</h3>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 block">{dist.province} Province</span>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${dist.demand >= 75 ? 'bg-emerald-50 text-emerald-700' : dist.demand >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                    {dist.demand >= 75 ? 'High' : dist.demand >= 40 ? 'Medium' : 'Low'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase">Listings</span>
                    <div className="text-sm font-black text-gray-900">{dist.count} properties</div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase">Avg Price</span>
                    <div className="text-sm font-black text-[#004F31]">Rs. {(dist.avgPrice / 1000000).toFixed(1)}M</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${dist.demand >= 75 ? 'bg-emerald-500' : dist.demand >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${dist.demand}%` }}
                    ></div>
                  </div>
                </div>
                <button className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-[#004F31] hover:border-[#004F31] shadow-sm transition-all">
                  <Search size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SLIDING RIGHT INSPECTOR PANEL */}
      <AnimatePresence>
        {selectedDistrict && (
          <>
            {/* Backdrop cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDistrict(null)}
              className="fixed inset-0 bg-black z-[1000]"
            />

            {/* Panel Core */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-white shadow-2xl z-[1001] p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-[#004F31]" size={20} />
                    <div>
                      <h3 className="font-black text-gray-900 text-lg leading-none">{selectedDistrict.district}</h3>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 block">{selectedDistrict.province} Province</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedDistrict(null)}
                    className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* KPI METRICS */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <span className="text-[8px] font-black uppercase text-gray-400 block mb-1">Total Listings</span>
                    <span className="text-base font-black text-gray-900">{selectedDistrict.count}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <span className="text-[8px] font-black uppercase text-gray-400 block mb-1">Avg Price / perch</span>
                    <span className="text-xs font-black text-[#004F31]">Rs. 850,000</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <span className="text-[8px] font-black uppercase text-gray-400 block mb-1">MoM Growth</span>
                    <span className={`text-sm font-black ${selectedDistrict.priceTrendMoM >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      +{selectedDistrict.priceTrendMoM}%
                    </span>
                  </div>
                </div>

                {/* DETAILS EXPANSION */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-bold text-gray-500">Popular Area Today</span>
                    <span className="text-xs font-black text-gray-900">
                      {selectedDistrict.district === 'Colombo' ? 'Kottawa / Malabe' : 'Town Center'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-bold text-gray-500">Avg Days on Market</span>
                    <span className="text-xs font-black text-gray-900">{selectedDistrict.avgDaysToSell} Days</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-bold text-gray-500">Market Velocity Rating</span>
                    <span className="text-xs font-black text-[#004F31]">Very Active (Stable)</span>
                  </div>
                </div>

                {/* TOP 3 PROPERTIES LISTING IN DISTRICT */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Top Property Listings</h4>
                  {districtTopListings.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center text-xs text-gray-400 font-bold">
                      No live local properties tagged in this district.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {districtTopListings.map((p, i) => (
                        <div key={i} className="flex gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                          <img 
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'} 
                            alt={p.listing_title}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-black text-xs text-gray-900 truncate leading-tight">{p.listing_title}</h5>
                            <span className="text-[9px] font-bold text-gray-400">{p.city}</span>
                            <div className="text-xs font-black text-[#004F31] mt-1">{p.price || `Rs. ${p.price_lkr}`}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 mt-8">
                <button
                  onClick={() => setSelectedDistrict(null)}
                  className="w-full bg-[#004F31] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-green-950 transition-colors shadow-lg"
                >
                  Close Deep Dive
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
