import React, { useState, useEffect, useRef } from 'react';
import { Activity, Users, Eye, Globe, Clock, Smartphone, Monitor, ChevronUp, Shield, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import ChartWrapper from './ChartWrapper';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

// Fixed pulsing marker icon
const pulsingDotIcon = L.divIcon({
  className: 'custom-pulsing-marker',
  html: `<div class="marker-pulse-wrapper">
          <div class="marker-pulse"></div>
          <div class="marker-dot"></div>
        </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const defaultChartData = [
  { name: '00:00', today: 400, yesterday: 240 },
  { name: '04:00', today: 300, yesterday: 139 },
  { name: '08:00', today: 200, yesterday: 980 },
  { name: '12:00', today: 278, yesterday: 390 },
  { name: '16:00', today: 189, yesterday: 480 },
  { name: '20:00', today: 239, yesterday: 380 },
  { name: '23:59', today: 349, yesterday: 430 },
];

const popularPages = [
  { name: '/properties', views: 420 },
  { name: '/luxury-villas', views: 380 },
  { name: '/contact', views: 250 },
  { name: '/about', views: 210 },
  { name: '/blog/real-estate-tips', views: 180 },
];

const trafficSources = [
  { name: 'Organic', value: 45, color: '#004F31' },
  { name: 'Direct', value: 25, color: '#00A651' },
  { name: 'Social', value: 20, color: '#3b82f6' },
  { name: 'Referral', value: 10, color: '#94a3b8' },
];

const initialActivity = [
  { id: 1, text: 'New visitor from Colombo searching for "Beach Villas"', time: '2m ago', color: 'blue' },
  { id: 2, text: 'User from Kandy saved "Modern Apartment in Fort"', time: '5m ago', color: 'green' },
  { id: 3, text: 'Visitor from Galle viewing "Sea View Land"', time: '8m ago', color: 'blue' },
  { id: 4, text: 'New inquiry received for "Luxury Penthouse"', time: '12m ago', color: 'orange' },
  { id: 5, text: 'Visitor from Matara shared a property link', time: '15m ago', color: 'blue' },
];

interface Visitor {
  current_page: string;
  location: string;
  device_type: string;
  referrer: string;
}

export default function LiveVisitorTracking({ visitors = [], isDark = false }: { visitors?: Visitor[], isDark?: boolean }) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activityFeed, setActivityFeed] = useState(initialActivity);
  const chartRef = useRef(null);

  // Live update effect simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const displayVisitors = visitors.length > 0 ? visitors : Array(8).fill({
    current_page: '/properties/luxury-apartment-202',
    location: 'Colombo, LK',
    device_type: 'Desktop',
    referrer: 'Google Search'
  });

  const chartData = defaultChartData;

  const chartTheme = {
    gridColor: isDark ? '#374151' : '#f3f4f6',
    textColor: isDark ? '#9CA3AF' : '#9ca3af',
    tooltipBg: isDark ? '#1F2937' : '#FFFFFF',
    tooltipText: isDark ? '#F9FAFB' : '#111827',
  };

  return (
    <div className="bg-white dark:bg-dark-navy p-10 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h3 className="text-3xl font-black text-dark-navy mb-2 flex items-center gap-3">
            <Activity className="text-brand-green animate-pulse" size={32} /> 
            Live Analytics Hub
          </h3>
          <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
            <Clock size={14} className="text-brand-green" />
            REAL-TIME DATA FEED • LAST UPDATED: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-brand-green text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-green/30">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          {displayVisitors.length} ACTIVE VISITORS
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-brand-green compact-transition">
          <div className="flex justify-between mb-4">
            <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Today's Visitors</span>
            <Users size={20} className="text-gray-300 group-hover:text-brand-green compact-transition" />
          </div>
          <div className="text-4xl font-black text-dark-navy">2,450</div>
          <div className="text-xs font-black text-brand-green flex items-center mt-3 bg-brand-green/10 w-fit px-2 py-1 rounded-full"><ChevronUp size={14}/> 12.5%</div>
        </div>

        <div className="p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-blue-500 compact-transition">
          <div className="flex justify-between mb-4">
            <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Page Views</span>
            <Eye size={20} className="text-gray-300 group-hover:text-blue-500 compact-transition" />
          </div>
          <div className="text-4xl font-black text-dark-navy">8,210</div>
          <div className="text-xs font-black text-gray-500 mt-3 flex items-center gap-1">
            <Activity size={14} className="text-blue-500" />
            3.4 AVG PAGES
          </div>
        </div>

        <div className="p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-orange-500 compact-transition">
          <div className="flex justify-between mb-4">
            <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Avg Session</span>
            <Clock size={20} className="text-gray-300 group-hover:text-orange-500 compact-transition" />
          </div>
          <div className="text-4xl font-black text-dark-navy">4m 12s</div>
          <div className="text-xs font-black text-brand-green flex items-center mt-3 bg-brand-green/10 w-fit px-2 py-1 rounded-full"><ChevronUp size={14}/> 5.2%</div>
        </div>

        <div className="p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-purple-500 compact-transition">
          <div className="flex justify-between mb-4">
            <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Top District</span>
            <Globe size={20} className="text-gray-300 group-hover:text-purple-500 compact-transition" />
          </div>
          <div className="text-4xl font-black text-dark-navy">Colombo</div>
          <div className="text-xs font-black text-gray-500 mt-3 uppercase tracking-widest">{Math.round(displayVisitors.length * 0.45)} V. LIVE NOW</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h4 className="text-lg font-black text-dark-navy mb-6 uppercase tracking-[0.15em] flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-green rounded-full shadow-lg shadow-brand-green/50"></div>
              Current Session Activity
            </h4>
            <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Live</th>
                    <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Visited Page</th>
                    <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Location</th>
                    <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Device</th>
                    <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {displayVisitors.map((v, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 compact-transition group">
                      <td className="p-5">
                        <div className="w-2.5 h-2.5 bg-brand-green rounded-full animate-pulse shadow-md shadow-brand-green/30"></div>
                      </td>
                      <td className="p-5">
                        <span className="text-sm font-black text-dark-navy hover:text-brand-green underline decoration-brand-green/30 underline-offset-4 cursor-pointer">{v.current_page}</span>
                      </td>
                      <td className="p-5 text-sm font-bold text-gray-600">{v.location || 'Unknown'}</td>
                      <td className="p-5 text-sm font-bold text-gray-500">
                        <div className="flex items-center gap-2">
                          {v.device_type?.toLowerCase() === 'mobile' ? <Smartphone size={16} className="text-blue-500"/> : <Monitor size={16} className="text-purple-500"/>} 
                          {v.device_type}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-gray-100 text-[10px] font-black text-gray-600 rounded-lg uppercase tracking-tight">{v.referrer}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-black text-dark-navy dark:text-white mb-6 uppercase tracking-[0.15em] flex items-center gap-2">
              <Activity className="text-brand-green" size={24} />
              Platform Velocity Insights
            </h4>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Daily Traffic Retention (24h Window)</p>
            <ChartWrapper height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004F31" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#004F31" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartTheme.textColor, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartTheme.textColor, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    padding: '12px 16px'
                  }} 
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="yesterday" stroke="#cbd5e1" strokeDasharray="8 8" fill="none" strokeWidth={2} name="Yesterday" />
                <Area type="monotone" dataKey="today" stroke="#004F31" fillOpacity={1} fill="url(#colorToday)" strokeWidth={4} name="Today" />
              </AreaChart>
            </ChartWrapper>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-black text-dark-navy dark:text-white mb-6 uppercase tracking-[0.15em] flex items-center gap-2">
              <Activity className="text-brand-green" size={24} />
              Platform Content Popularity
            </h4>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Top performing pages by views</p>
            <ChartWrapper height={300}>
              <BarChart data={popularPages} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartTheme.gridColor} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartTheme.textColor, fontWeight: 'bold' }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 11, fill: chartTheme.textColor, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'}} 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }} 
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="views" fill="#004F31" radius={[0, 8, 8, 0]} barSize={32} />
              </BarChart>
            </ChartWrapper>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <h4 className="text-lg font-black text-dark-navy mb-6 uppercase tracking-[0.15em] flex items-center gap-2">
              <Activity className="text-brand-green" size={24} />
              Recent Actions
            </h4>
            <div className="bg-dark-navy p-2 rounded-[32px] border border-gray-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-h-[400px] overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {activityFeed.map((activity, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.05 }}
                    key={activity.id} 
                    className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-start group hover:bg-white/10 compact-transition"
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${
                        activity.color === 'blue' ? 'bg-blue-400 shadow-blue-400/50' : 
                        activity.color === 'green' ? 'bg-brand-green shadow-brand-green/50' : 
                        'bg-orange-400 shadow-orange-400/50'
                      } shadow-lg`}></div>
                      <p className="text-sm font-bold text-white/90 leading-tight group-hover:text-white">{activity.text}</p>
                    </div>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest whitespace-nowrap ml-4">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div>
             <h4 className="text-lg font-black text-dark-navy mb-6 uppercase tracking-[0.15em] flex items-center justify-between px-1">
                <span>Direct Traffic</span>
                <span className="text-[10px] text-brand-green font-black bg-brand-green/10 px-2 py-0.5 rounded-md tracking-tighter">LIVE FEED</span>
             </h4>
             <ChartWrapper height={180}>
                <div className="flex items-center h-full">
                  <div style={{ width: '60%', height: '100%', minWidth: '120px' }}>
                    <PieChart>
                      <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                        {trafficSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>
                  <div className="w-[40%] space-y-3">
                     {trafficSources.map((source, idx) => (
                       <div key={idx} className="flex justify-between items-center group">
                         <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-tight group-hover:text-dark-navy compact-transition">
                           <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.color }}></div>
                           {source.name}
                         </div>
                         <div className="text-xs font-black text-dark-navy">{source.value}%</div>
                       </div>
                     ))}
                  </div>
                </div>
             </ChartWrapper>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xl font-black text-dark-navy mb-8 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
          <Globe size={28} className="text-brand-green" /> 
          Geographic Heatmap
          <span className="text-xs font-bold text-gray-400 tracking-normal ml-auto uppercase opacity-50">Active Visitor Clusters</span>
        </h4>
        <div className="h-[450px] w-full rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative">
          <MapContainer center={[7.8731, 80.7718]} zoom={8} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap'
            />
            {/* Pulsing visitor markers */}
            {[...Array(15)].map((_, i) => (
              <Marker 
                key={i} 
                position={[
                  6.9 + Math.random() * 1.5, 
                  79.9 + Math.random() * 1.5
                ]} 
                icon={pulsingDotIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-3">
                    <div className="text-sm font-black text-dark-navy">Verified Session</div>
                    <div className="text-xs font-bold text-brand-green mt-0.5">Browsing Marketplace</div>
                    <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-bold">
                      <Clock size={10} /> Just now
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white shadow-2xl z-[1000] flex items-center gap-4">
            <div className="w-3 h-3 bg-brand-green rounded-full animate-ping"></div>
            <span className="text-sm font-black text-dark-navy uppercase tracking-[0.1em]">Live Traffic Stream Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
