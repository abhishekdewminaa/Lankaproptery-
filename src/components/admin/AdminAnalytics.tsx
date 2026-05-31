import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
  Loader2,
  Eye,
  Home,
  MessageCircle,
  CreditCard
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  Legend,
  Sector,
  Label,
  LabelList
} from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { supabase } from '../../supabaseClient';

const CountUp = ({ end, prefix = "", suffix = "", decimals = 0 }: { end: number, prefix?: string, suffix?: string, decimals?: number }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1000;
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const rate = Math.min(progress / duration, 1);
      
      const easing = 1 - Math.pow(2, -10 * rate);
      countRef.current = easing * end;
      setCount(countRef.current);

      if (rate < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end]);

  return <span>{prefix}{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
};

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-4 font-sans">
        <p className="text-gray-500 font-bold mb-1 text-xs uppercase tracking-wider">{label}</p>
        <p className="font-black text-[#2E7D32] text-lg">LKR {payload[0].value.toFixed(1)}M</p>
        {!data.forecast && (
          <p className="text-[#2E7D32] text-xs font-bold mt-1">
            +12.4% ↑ <span className="text-gray-400 font-medium">vs last month</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

const SparklineBar = ({ color, data }: { color: string, data: any[] }) => (
  <div className="h-10 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} isAnimationActive={true} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const CustomDonutLabel = ({ viewBox, totalLeads }: any) => {
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} fill="#111827" className="recharts-text recharts-label" textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} y={cy - 5} fontSize="32" fontWeight="900" fontFamily="inherit">{totalLeads.toLocaleString()}</tspan>
      <tspan x={cx} y={cy + 20} fontSize="10" fill="#6B7280" fontWeight="800" textAnchor="middle" fontFamily="inherit">TOTAL LEADS</tspan>
    </text>
  );
};

export default function AdminAnalytics() {
  const [selectedRange, setSelectedRange] = useState('30d');
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const analytics = useAnalytics(selectedRange);

  const TIME_RANGES = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: '12m', label: 'Last 12 Months' }
  ];

  const currentRangeLabel = TIME_RANGES.find(r => r.id === selectedRange)?.label || 'Last 30 Days';

  const downloadCSV = async () => {
    setIsExporting(true);
    try {
      const { data: properties } = await supabase.from('properties').select('id, ref_no, listing_title, property_category, district, price_lkr, status, created_at');
      const { data: leads } = await supabase.from('leads').select('property_id, name, source, status, created_at');

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "LankaProperty Analytics Report\n";
      csvContent += `Date Range: ${currentRangeLabel}\n\n`;

      csvContent += "--- REVENUE SUMMARY ---\n";
      csvContent += `Total Revenue (LKR),${analytics.totalRevenue}\n`;
      csvContent += `Average Revenue/Slot (LKR),${analytics.avgRevenuePerSlot}\n\n`;

      csvContent += "--- METRICS ---\n";
      csvContent += `Total Views,${analytics.totalViews}\n`;
      csvContent += `Properties Sold,${analytics.propertiesSold}\n`;
      csvContent += `New Enquiries,${analytics.newEnquiries}\n\n`;

      csvContent += "--- CATEGORY PERFORMANCE ---\n";
      csvContent += "Category,Total Listings,Lead Volume,Conversion Rate\n";
      analytics.categoryData.forEach(c => {
        csvContent += `${c.category},"${c.listings}","${c.leads}","${c.conversion}"\n`;
      });

      csvContent += "\n--- SEARCH VOLUME BY DISTRICT ---\n";
      csvContent += "District,Searches\n";
      analytics.districtVolume.forEach(d => {
        csvContent += `${d.name},${d.searches}\n`;
      });

      csvContent += "\n--- PROPERTY PERFORMANCE ---\n";
      csvContent += "Ref No,Title,Category,District,Price,Status,Created At\n";
      if (properties) {
        properties.forEach(p => {
          csvContent += `"${p.ref_no || ''}","${(p.listing_title || '').replace(/"/g, '""')}","${p.property_category || ''}","${p.district || ''}",${p.price_lkr || 0},"${p.status || ''}","${p.created_at || ''}"\n`;
        });
      }

      csvContent += "\n--- LEAD DETAILS ---\n";
      csvContent += "Property ID,Name,Source,Status,Created At\n";
      if (leads) {
        leads.forEach(l => {
          csvContent += `"${l.property_id || ''}","${(l.name || '').replace(/"/g, '""')}","${l.source || ''}","${l.status || ''}","${l.created_at || ''}"\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `LankaProperty-Analytics-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  if (analytics.loading && analytics.empty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-[#1B5E20]" size={48} />
        <p className="text-gray-400 font-black text-sm uppercase tracking-widest">Loading Analytics...</p>
      </div>
    );
  }

  const {
    revenueData,
    totalRevenue,
    avgRevenuePerSlot,
    districtVolume,
    leadSourceData,
    categoryData,
    rawLeadsCount
  } = analytics;

  // Enhance leadSourceData colors if needed
  const sourceColors: Record<string, string> = {
    'Organic': '#1B5E20',
    'Social': '#F9A825',
    'Direct': '#1565C0',
    'Referral': '#C62828'
  };
  const pieData = leadSourceData.map(d => ({ ...d, color: sourceColors[d.name] || '#999' }));

  // District Bar Data
  const districtColors: Record<string, string> = {
    'COLOMBO': '#1B5E20',
    'KANDY': '#2E7D32',
    'GAMPAHA': '#388E3C',
    'GALLE': '#43A047',
    'KURUNEGALA': '#66BB6A'
  };
  const barData = districtVolume.map(d => {
    const shortName = d.name.replace(' DISTRICT', '');
    return { ...d, shortName, fill: districtColors[shortName] || '#66BB6A' };
  });

  // Mock Sparkline Data
  const mockSparkView = [5, 12, 8, 15, 10, 22, 18].map(v => ({ value: v }));
  const mockSparkSold = [1, 0, 3, 2, 1, 4, 3].map(v => ({ value: v }));
  const mockSparkLeads = [2, 5, 3, 8, 6, 12, 10].map(v => ({ value: v }));
  const mockSparkRev = [20, 15, 30, 25, 40, 35, 50].map(v => ({ value: v }));
  const mockSparkTable = [2,4,3,6,5,8,7].map(v => ({ value: v }));

  return (
    <div className="space-y-10 pb-20 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Analytics & Insights</h1>
          <p className="text-gray-500 font-medium mt-2">Performance metrics and strategic data for your property portfolio.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto relative">
          <div className="relative group flex-grow md:flex-grow-0">
            <button 
              onClick={() => setIsRangeOpen(!isRangeOpen)}
              className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-white border border-gray-200 rounded-2xl font-black text-sm text-gray-800 shadow-sm hover:shadow-md transition-all min-w-[200px]"
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#1B5E20]" />
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
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 overflow-hidden"
                >
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => {
                        setSelectedRange(range.id);
                        setIsRangeOpen(false);
                      }}
                      className={`w-full text-left px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
                        selectedRange === range.id ? 'bg-green-50 text-[#1B5E20]' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button disabled={isExporting} onClick={downloadCSV} className="flex items-center gap-2 px-8 py-4 bg-[#1B5E20] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#1B5E20]/20 hover:bg-[#2E7D32] transition-all disabled:opacity-50">
            {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {isExporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>

      {analytics.empty && !analytics.loading ? (
        <div className="bg-white p-16 rounded-[32px] border border-gray-100 shadow-sm text-center space-y-4">
          <Activity className="mx-auto text-gray-300" size={64} />
          <h3 className="text-3xl font-black text-gray-800 tracking-tight">No data yet</h3>
          <p className="text-gray-500 font-medium text-lg">Analytics will appear as users view properties and submit inquiries.</p>
        </div>
      ) : (
        <>
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Views', value: analytics.totalViews, icon: Eye, color: '#1565C0', bg: 'bg-blue-50', text: 'text-blue-700', trend: '+14.2%', spark: mockSparkView, prefix: '' },
              { title: 'Properties Sold', value: analytics.propertiesSold, icon: Home, color: '#1B5E20', bg: 'bg-green-50', text: 'text-green-700', trend: '+5.4%', spark: mockSparkSold, prefix: '' },
              { title: 'New Enquiries', value: analytics.newEnquiries, icon: MessageCircle, color: '#F57F17', bg: 'bg-amber-50', text: 'text-amber-700', trend: '+8.1%', spark: mockSparkLeads, prefix: '' },
              { title: 'Revenue', value: totalRevenue, icon: CreditCard, color: '#6A1B9A', bg: 'bg-purple-50', text: 'text-purple-700', trend: '+12.4%', spark: mockSparkRev, prefix: 'LKR ' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                style={{ borderLeft: `6px solid ${stat.color}` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                      <CountUp end={stat.value} prefix={stat.prefix} />
                    </h3>
                  </div>
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.text}`}>
                    <stat.icon size={20} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-lg">
                    <TrendingUp size={14} className="text-green-700" />
                    <span className="text-xs font-black text-green-700">{stat.trend}</span>
                  </div>
                  <SparklineBar color={stat.color} data={stat.spark} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* 1. REVENUE CHART */}
          <div className="bg-white p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-8 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Revenue & Forecast</h2>
                <div className="flex items-center gap-4 mt-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#1B5E20]" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actual Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-[#1B5E20] border-dashed" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Forecasted</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Revenue/Slot</p>
                 <p className="text-xl font-black text-gray-900">LKR <CountUp end={Math.round(avgRevenuePerSlot)} /></p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1B5E20" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#9CA3AF' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(value) => `LKR ${value}M`}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#9CA3AF' }}
                />
                <RechartsTooltip content={<CustomAreaTooltip />} cursor={{ stroke: '#f0f0f0', strokeWidth: 2 }} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2E7D32" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  isAnimationActive={true}
                  dot={{ r: 5, fill: '#fff', strokeWidth: 2, stroke: '#2E7D32' }}
                  activeDot={{ r: 8, fill: '#1B5E20', strokeWidth: 0, style: { filter: 'drop-shadow(0 0 8px rgba(27,94,32,0.6))' } }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2E7D32" 
                  strokeWidth={3} 
                  strokeDasharray="6 6"
                  fill="transparent"
                  data={revenueData.filter(d => d.forecast)}
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Secondary Row: Heatmap & Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            
            {/* 2. SEARCH VOLUME BY DISTRICT - Horizontal Bar */}
            <div className="bg-white p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
               <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700">
                        <MapPin size={20} />
                     </div>
                     <h3 className="text-xl font-black text-gray-900 tracking-tight">TOP SEARCH AREAS</h3>
                  </div>
               </div>

               <div className="mt-4">
                  {barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={barData} layout="vertical" margin={{ left: -10, right: 60, top: 10, bottom: 0 }}>
                        <CartesianGrid horizontal={false} stroke="#f9fafb" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="shortName" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          width={110} 
                          tick={(props) => {
                             const { x, y, payload } = props;
                             return (
                               <g transform={`translate(${x},${y})`}>
                                 <text x={0} y={0} dy={4} textAnchor="end" fill="#374151" fontSize={11} fontWeight={800} >
                                   🔍 {payload.value}
                                 </text>
                               </g>
                             );
                          }}
                        />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(243, 244, 246, 0.4)' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                               const { searches, shortName } = payload[0].payload;
                               return (
                                 <div className="bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-4 font-sans">
                                    <p className="text-lg font-black text-gray-900">{searches.toLocaleString()} searches</p>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">in {shortName} this month</p>
                                 </div>
                               );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="searches" 
                          radius={[0, 8, 8, 0]} 
                          isAnimationActive={true} 
                          animationDuration={800} 
                          barSize={28}
                        >
                          {barData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                          <LabelList 
                            dataKey="searches" 
                            position="right" 
                            formatter={(val: number) => `${val.toLocaleString()}`}
                            style={{ fill: '#4B5563', fontSize: 12, fontWeight: 800 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[320px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
                       <span className="text-gray-400 font-bold">No district data available</span>
                    </div>
                  )}
               </div>
            </div>

            {/* 3. LEAD SOURCE TRACKING - Modern Donut */}
            <div className="bg-white p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-sm relative flex flex-col justify-between">
               <div className="flex justify-between items-center relative z-10 mb-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Lead Sources</h3>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200 shadow-sm">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-wide text-green-700">● LIVE</span>
                  </div>
               </div>

               <div className="flex-grow flex flex-col items-center justify-center relative">
                  {pieData.length > 0 ? (
                    <div className="h-[260px] w-full flex justify-center items-center">
                      <ResponsiveContainer width={260} height={260}>
                        <PieChart>
                          <Pie
                              data={pieData}
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={4}
                              dataKey="value"
                              onMouseEnter={(_, index) => setActiveIndex(index)}
                              onMouseLeave={() => setActiveIndex(-1)}
                              isAnimationActive={true}
                              animationBegin={0}
                              animationDuration={1000}
                              stroke="none"
                          >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                              <Label content={<CustomDonutLabel totalLeads={rawLeadsCount} />} position="center" />
                          </Pie>
                          <RechartsTooltip 
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                             itemStyle={{ fontWeight: 'bold' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="w-[200px] h-[200px] bg-gray-50 rounded-full border-4 border-gray-100 flex items-center justify-center my-8">
                      <span className="text-gray-400 font-bold text-sm">No leads</span>
                    </div>
                  )}
                  
                  {/* 4 Stat Cards below Donut */}
                  <div className="grid grid-cols-2 gap-4 w-full mt-2">
                     {pieData.map((d, i) => {
                       const iconMap: Record<string, string> = {
                         'Organic': '🌐',
                         'Social': '📱',
                         'Direct': '🔗',
                         'Referral': '👥'
                       };
                       const matchingColorClass = {
                          'Organic': 'text-[#1B5E20]',
                          'Social': 'text-[#F9A825]',
                          'Direct': 'text-[#1565C0]',
                          'Referral': 'text-[#C62828]'
                       }[d.name] || 'text-gray-700';

                       return (
                         <div key={i} className="bg-gray-50/50 hover:bg-white rounded-2xl p-4 border border-gray-100 shadow-sm transition-all flex flex-col justify-between group cursor-default">
                            <div className="flex items-center justify-between mb-3">
                               <div className="flex items-center gap-2">
                                  <span>{iconMap[d.name] || '📌'}</span>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${matchingColorClass}`}>{d.name}</span>
                               </div>
                               <div className="w-2h-2 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
                            </div>
                            <div className="flex items-end justify-between">
                               <span className="text-2xl font-black text-gray-900 leading-none">{d.value}%</span>
                               <span className="text-sm font-bold text-gray-400 leading-none">
                                  {Math.round((d.value/100) * rawLeadsCount).toLocaleString()}
                               </span>
                            </div>
                         </div>
                       );
                     })}
                  </div>
               </div>
            </div>
          </div>

          {/* 4. TOP PERFORMING CATEGORIES - Rich Visual Table */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mt-6 pb-2">
             <div className="p-8 md:p-10 flex justify-between items-center border-b border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Top Performing Categories</h3>
                <button className="text-[10px] font-black text-[#1B5E20] bg-green-50 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-green-100 transition-colors">
                   View Full Report
                </button>
             </div>
             <div className="overflow-x-auto relative">
                <table className="w-full text-left">
                   <thead className="bg-[#f0f9f4] sticky top-0 z-10">
                      <tr>
                         <th className="px-8 py-5 text-[10px] font-black text-[#1B5E20] uppercase tracking-widest rounded-tl-2xl">Rank / Category</th>
                         <th className="px-8 py-5 text-[10px] font-black text-[#1B5E20] uppercase tracking-widest text-center">Listings</th>
                         <th className="px-8 py-5 text-[10px] font-black text-[#1B5E20] uppercase tracking-widest text-center">Leads</th>
                         <th className="px-8 py-5 text-[10px] font-black text-[#1B5E20] uppercase tracking-widest">Conversion Rate</th>
                         <th className="px-8 py-5 text-[10px] font-black text-[#1B5E20] uppercase tracking-widest text-center">Trend (7d)</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 bg-white">
                      {categoryData.length > 0 ? categoryData.map((row, idx) => {
                        const rankColors = ['bg-yellow-100 text-yellow-700', 'bg-gray-200 text-gray-700', 'bg-orange-100 text-orange-700'];
                        const rankClass = idx < 3 ? rankColors[idx] : 'bg-gray-50 text-gray-500';
                        const emojiMap: Record<string, string> = {
                           'Apartments': '🏢',
                           'Houses': '🏠',
                           'Lands': '🌿',
                           'Commercial': '🏬'
                        };
                        const catIcon = emojiMap[row.category] || '📌';
                        const convNum = parseFloat(row.conversion);
                        const progressBg = row.trend === 'up' ? 'bg-[#2E7D32]' : 'bg-[#1565C0]';

                        return (
                          <tr key={idx} className="group hover:bg-[#f8fbf9] transition-colors even:bg-gray-50/30">
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${rankClass}`}>
                                      #{idx + 1}
                                   </div>
                                   <div className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center text-lg">
                                      {catIcon}
                                   </div>
                                   <span className="font-black text-gray-900">{row.category}</span>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center font-bold text-gray-700">{row.listings}</td>
                             <td className="px-8 py-6 text-center font-bold text-gray-900">{row.leads}</td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <span className="font-black text-gray-900 w-12">{row.conversion}</span>
                                   <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div className={`h-full ${progressBg} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(100, convNum * 5)}%` }} />
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center justify-center gap-4">
                                   {row.trend === 'up' ? (
                                     <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-black">
                                       <ArrowUpRight size={14} /> +2.1%
                                     </div>
                                   ) : (
                                     <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-black">
                                       <ArrowDownRight size={14} /> -0.4%
                                     </div>
                                   )}
                                   <div className="w-16 hidden sm:block opacity-50 group-hover:opacity-100 transition-opacity">
                                      <SparklineBar color={row.trend === 'up' ? '#388E3C' : '#d32f2f'} data={mockSparkTable} />
                                   </div>
                                </div>
                             </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                           <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-bold bg-white">No category data available</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
