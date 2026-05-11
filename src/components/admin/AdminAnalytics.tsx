import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Search, 
  Download, 
  Calendar,
  ChevronDown,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartWrapper } from '../ChartWrapper';

const REVENUE_DATA = [
  { name: 'JANUARY', value: 3.2, forecast: false },
  { name: 'FEBRUARY', value: 3.8, forecast: false },
  { name: 'MARCH', value: 3.5, forecast: false },
  { name: 'APRIL', value: 4.8, forecast: false },
  { name: 'MAY', value: 4.2, forecast: false },
  { name: 'JUNE', value: 4.6, forecast: false },
  { name: 'JULY (FORECAST)', value: 5.1, forecast: true },
  { name: 'AUG (FORECAST)', value: 5.4, forecast: true },
];

const LEAD_SOURCE_DATA = [
  { name: 'Organic Search', value: 45, color: '#004f31' },
  { name: 'Social Media', value: 25, color: '#00c389' },
  { name: 'Direct', value: 15, color: '#4a5568' },
  { name: 'Referral', value: 15, color: '#e53e3e' },
];

const CATEGORY_DATA = [
  { category: 'Apartments', listings: '1,240', leads: '8,420', conversion: '6.8%', trend: 'up', trendColor: 'text-green-500' },
  { category: 'Houses', listings: '2,850', leads: '12,100', conversion: '4.2%', trend: 'down', trendColor: 'text-red-500' },
  { category: 'Lands', listings: '4,120', leads: '5,300', conversion: '3.1%', trend: 'up', trendColor: 'text-green-500' },
  { category: 'Commercial', listings: '640', leads: '1,900', conversion: '5.4%', trend: 'up', trendColor: 'text-green-500' },
];

const DISTRICT_VOLUME = [
  { name: 'COLOMBO DISTRICT', volume: '142,500', searches: 142500, percentage: 100 },
  { name: 'KANDY DISTRICT', volume: '58,200', searches: 58200, percentage: 41 },
  { name: 'GAMPAHA DISTRICT', volume: '42,100', searches: 42100, percentage: 30 },
];

export default function AdminAnalytics() {
  const [selectedRange, setSelectedRange] = useState('30d');
  const [isRangeOpen, setIsRangeOpen] = useState(false);

  const TIME_RANGES = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: '12m', label: 'Last 12 Months' }
  ];

  const currentRangeLabel = TIME_RANGES.find(r => r.id === selectedRange)?.label || 'Last 30 Days';

  // Dynamic multipliers for data based on selection
  const multiplier = selectedRange === 'today' ? 0.05 : 
                    selectedRange === '7d' ? 0.25 : 
                    selectedRange === '90d' ? 2.5 : 
                    selectedRange === '12m' ? 8.5 : 1;

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-admin-text-dark tracking-tight">Analytics & Insights</h1>
          <p className="text-admin-text-gray font-bold mt-2">Performance metrics and strategic data for your property portfolio.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto relative">
          <div className="relative group flex-grow md:flex-grow-0">
            <button 
              onClick={() => setIsRangeOpen(!isRangeOpen)}
              className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-white border border-admin-border rounded-2xl font-black text-sm text-admin-text-dark shadow-sm hover:shadow-md transition-all min-w-[200px]"
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-admin-primary" />
                <span>{currentRangeLabel}</span>
              </div>
              <ChevronDown size={18} className={`transition-transform duration-300 ${isRangeOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Range Dropdown */}
            <AnimatePresence>
              {isRangeOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-admin-border rounded-2xl shadow-2xl z-50 py-2 overflow-hidden"
                >
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => {
                        setSelectedRange(range.id);
                        setIsRangeOpen(false);
                      }}
                      className={`w-full text-left px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
                        selectedRange === range.id ? 'bg-admin-bg text-admin-primary' : 'text-admin-text-gray hover:bg-gray-50'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button className="flex items-center gap-2 px-8 py-4 bg-admin-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-admin-primary/20 hover:bg-admin-secondary transition-all">
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Hero Chart: Revenue & Forecast */}
      <div className="bg-white p-10 rounded-[48px] border border-admin-border shadow-sm space-y-10">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-black text-admin-text-dark">Revenue & Forecast</h2>
            <p className="text-admin-text-gray font-bold text-sm leading-relaxed">
              Track monthly revenue performance against algorithmic predictions for <span className="text-admin-primary">{currentRangeLabel}</span>.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-4">
              <div>
                <p className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Total Revenue</p>
                <p className="text-2xl font-black text-admin-primary">LKR {(4.2 * multiplier).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Projected Growth</p>
                <p className="text-2xl font-black text-red-500">+{selectedRange === 'today' ? '0.2' : (12.4 * (multiplier > 1 ? 0.8 : multiplier)).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Avg. Revenue/Slot</p>
                <p className="text-2xl font-black text-admin-text-dark">LKR 12.5k</p>
              </div>
            </div>
          </div>

          <ChartWrapper height={400}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#004f31" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#004f31" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }}
                dy={15}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: 'none', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
                  padding: '16px' 
                }}
                labelStyle={{ fontWeight: 900, marginBottom: '8px' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#004f31" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                dot={{ r: 6, fill: '#004f31', strokeWidth: 3, stroke: '#fff' }}
                activeDot={{ r: 8, fill: '#00c389' }}
              />
              {/* Forecast Line */}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#004f31" 
                strokeWidth={4} 
                strokeDasharray="8 8"
                fill="transparent"
                data={REVENUE_DATA.filter(d => d.forecast || d.name === 'JUNE')}
              />
            </AreaChart>
          </ChartWrapper>
        </div>
      </div>

      {/* Secondary Row: Heatmap & Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* District Search Volume */}
        <div className="bg-white p-10 rounded-[48px] border border-admin-border shadow-sm space-y-8">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-admin-text-dark">Search Volume by District</h3>
              <button className="p-2 text-admin-text-gray hover:text-admin-text-dark">
                 <Info size={20} />
              </button>
           </div>

           <div className="flex flex-col sm:flex-row gap-10">
              {/* Heatmap Placeholder */}
              <div className="relative w-full sm:w-1/2 aspect-square bg-admin-bg rounded-full flex items-center justify-center p-8">
                 <div className="absolute inset-0 bg-gradient-to-tr from-admin-primary/10 to-transparent rounded-full blur-3xl opacity-50" />
                 <div className="relative z-10 w-full h-full border-2 border-white/50 rounded-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                       <MapPin size={200} className="text-admin-primary/10" strokeWidth={0.5} />
                    </div>
                    <div className="w-3/4 h-3/4 bg-admin-primary/5 rounded-full animate-pulse" />
                    <div className="absolute top-1/4 right-1/4 w-8 h-8 bg-admin-primary/30 rounded-full blur-xl" />
                    <div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-admin-primary/20 rounded-full blur-2xl" />
                    <span className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">Interactive Heatmap</span>
                 </div>
              </div>

              {/* District List */}
              <div className="flex-grow space-y-6">
                 {DISTRICT_VOLUME.map((district, idx) => (
                   <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">{district.name}</p>
                         <p className="text-lg font-black text-admin-text-dark">{district.volume}</p>
                      </div>
                      <p className="text-[9px] font-bold text-admin-text-gray uppercase tracking-widest pb-1">searches</p>
                      <div className="h-1.5 w-full bg-admin-bg rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${district.percentage}%` }}
                           transition={{ duration: 1, delay: idx * 0.2 }}
                           className="h-full bg-admin-primary"
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Lead Source Tracking */}
        <div className="bg-white p-10 rounded-[48px] border border-admin-border shadow-sm space-y-8 relative overflow-hidden">
           <div className="flex justify-between items-center relative z-10">
              <h3 className="text-2xl font-black text-admin-text-dark">Lead Source Tracking</h3>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-admin-bg rounded-full">
                 <div className="w-1.5 h-1.5 bg-admin-primary rounded-full animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-admin-text-dark">Live Feed</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
              <ChartWrapper height={240}>
                <div className="relative w-full h-full">
                  <PieChart>
                    <Pie
                        data={LEAD_SOURCE_DATA}
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                    >
                        {LEAD_SOURCE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-3xl font-black text-admin-text-dark tracking-tight">2,840</p>
                      <p className="text-[9px] font-black text-admin-text-gray uppercase tracking-widest">Total Leads</p>
                  </div>
                </div>
              </ChartWrapper>

              <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                 {LEAD_SOURCE_DATA.map((source, idx) => (
                   <div key={idx} className="space-y-1">
                      <div className="flex items-center gap-2">
                         <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                         <span className="text-[10px] font-black text-admin-text-dark whitespace-nowrap">{source.name}</span>
                      </div>
                      <p className="text-xl font-black text-admin-text-dark pl-4.5">{source.value}%</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Table: Top Categories */}
      <div className="bg-white rounded-[48px] border border-admin-border shadow-sm overflow-hidden">
         <div className="p-10 flex justify-between items-center border-b border-admin-border">
            <h3 className="text-2xl font-black text-admin-text-dark">Top Performing Categories</h3>
            <button className="text-xs font-black text-admin-primary uppercase tracking-widest hover:underline">
               View All Categories
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-admin-border">
                     <th className="px-10 py-6 text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Category</th>
                     <th className="px-10 py-6 text-[10px] font-black text-admin-text-gray uppercase tracking-widest text-center">Total Listings</th>
                     <th className="px-10 py-6 text-[10px] font-black text-admin-text-gray uppercase tracking-widest text-center">Lead Volume</th>
                     <th className="px-10 py-6 text-[10px] font-black text-admin-text-gray uppercase tracking-widest text-center">Conversion Rate</th>
                     <th className="px-10 py-6 text-[10px] font-black text-admin-text-gray uppercase tracking-widest text-right">Trend</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-admin-border">
                  {CATEGORY_DATA.map((row, idx) => (
                    <tr key={idx} className="group hover:bg-admin-bg/30 transition-colors">
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-admin-bg rounded-2xl flex items-center justify-center text-admin-primary group-hover:bg-white group-hover:shadow-sm transition-all">
                                {idx === 0 && <Layers size={22} />}
                                {idx === 1 && <MapPin size={22} />}
                                {idx === 2 && <TrendingUp size={22} />}
                                {idx === 3 && <Activity size={22} />}
                             </div>
                             <span className="font-black text-admin-text-dark">{row.category}</span>
                          </div>
                       </td>
                       <td className="px-10 py-8 text-center font-bold text-admin-text-dark">{row.listings}</td>
                       <td className="px-10 py-8 text-center font-bold text-admin-text-dark">{row.leads}</td>
                       <td className="px-10 py-8 text-center">
                          <div className="flex flex-col items-center">
                             <span className="font-black text-admin-text-dark">{row.conversion}</span>
                             <span className={`text-[8px] font-black uppercase tracking-tighter ${row.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                {row.trend === 'up' ? '+' : ''}{row.trend === 'up' ? '1.2%' : '-0.4%'}
                             </span>
                          </div>
                       </td>
                       <td className="px-10 py-8 text-right">
                          <div className="inline-flex items-center justify-center px-4 py-2 bg-admin-bg rounded-xl border border-transparent group-hover:border-admin-border group-hover:bg-white transition-all">
                             {row.trend === 'up' ? (
                               <ArrowUpRight className="text-green-500" size={20} />
                             ) : (
                               <ArrowDownRight className="text-red-500" size={20} />
                             )}
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
