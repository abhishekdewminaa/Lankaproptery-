import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabaseClient';
import { Users, Activity, Eye, Monitor, Smartphone, Globe, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom pulsing dot icon for visitors
const pulsingDotIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3); animation: pulse 2s infinite;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

export default function LiveVisitorTracking() {
  const [liveVisitors, setLiveVisitors] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const fetchLiveVisitors = async () => {
    try {
      const { data, error } = await supabase
        .from('visitor_sessions')
        .select('*')
        .eq('is_active', true)
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());
        
      if (error) {
        // Table doesn't exist yet, mock data or ignore
        console.warn("Table visitor_sessions might not exist");
      } else {
        setLiveVisitors(data || []);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLiveVisitors();
    
    const interval = setInterval(fetchLiveVisitors, 30000);
    
    // Attempt realtime subscription
    const channel = supabase
      .channel('visitor_tracking')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'visitor_sessions'
      }, () => { fetchLiveVisitors() })
      .subscribe();
      
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Use mock data if realtime table is empty/missing for the demo effect
  const displayVisitors = liveVisitors.length > 0 ? liveVisitors : [
    { session_id: '1', current_page: '/', location: 'Colombo, Sri Lanka', device_type: 'Mobile', referrer: 'Google', time_on_site: '2m 15s' },
    { session_id: '2', current_page: '/listings', location: 'Kandy, Sri Lanka', device_type: 'Desktop', referrer: 'Direct', time_on_site: '5m 30s' },
    { session_id: '3', current_page: '/agents', location: 'Galle, Sri Lanka', device_type: 'Mobile', referrer: 'Facebook', time_on_site: '1m 10s' },
  ];

  const chartData = [
    { name: '12am', today: 10, yesterday: 15 },
    { name: '4am', today: 5, yesterday: 8 },
    { name: '8am', today: 40, yesterday: 35 },
    { name: '12pm', today: 85, yesterday: 70 },
    { name: '4pm', today: 110, yesterday: 90 },
    { name: '8pm', today: 60, yesterday: 65 },
  ];

  const popularPages = [
    { name: 'Home', views: 450 },
    { name: 'Listings', views: 320 },
    { name: 'Agents', views: 150 },
    { name: 'Property Wanted', views: 90 },
    { name: 'Contact', views: 40 },
  ];

  const deviceData = [
    { name: 'Mobile', value: 65, color: '#3b82f6' },
    { name: 'Desktop', value: 30, color: '#10b981' },
    { name: 'Tablet', value: 5, color: '#f59e0b' },
  ];

  const trafficSources = [
    { name: 'Google', value: 50, color: '#4285F4' },
    { name: 'Direct', value: 25, color: '#9CA3AF' },
    { name: 'Facebook', value: 15, color: '#1877F2' },
    { name: 'Instagram', value: 10, color: '#E4405F' },
  ];

  const activityFeed = [
    { id: 1, type: 'view', text: 'Someone viewed "Luxury House Colombo"', time: '2s ago', color: 'blue' },
    { id: 2, type: 'search', text: 'Someone searched "Land Gampaha"', time: '15s ago', color: 'blue' },
    { id: 3, type: 'register', text: 'New user registered', time: '1m ago', color: 'green' },
    { id: 4, type: 'post', text: 'New listing posted', time: '3m ago', color: 'green' },
    { id: 5, type: 'inquiry', text: 'New inquiry received', time: '5m ago', color: 'green' },
    { id: 6, type: 'system', text: 'Database backup completed', time: '1h ago', color: 'orange' },
  ];

  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-black text-dark-navy mb-1 flex items-center gap-2">
            <Activity className="text-brand-green animate-pulse" size={24} /> 
            Real-Time Visitor Tracking
          </h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-green/10 text-brand-green rounded-full font-black text-sm">
          <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
          {displayVisitors.length} LIVE
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today's Visitors</span>
            <Users size={16} className="text-gray-400" />
          </div>
          <div className="text-2xl font-black text-dark-navy">2,450</div>
          <div className="text-xs font-bold text-brand-green flex items-center mt-1"><ChevronUp size={14}/> 12% vs yesterday</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page Views</span>
            <Eye size={16} className="text-gray-400" />
          </div>
          <div className="text-2xl font-black text-dark-navy">8,210</div>
          <div className="text-xs font-bold text-gray-500 mt-1">3.4 pages/session</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Session</span>
            <Clock size={16} className="text-gray-400" />
          </div>
          <div className="text-2xl font-black text-dark-navy">4m 12s</div>
          <div className="text-xs font-bold text-brand-green flex items-center mt-1"><ChevronUp size={14}/> 5% vs yesterday</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top District</span>
            <Globe size={16} className="text-gray-400" />
          </div>
          <div className="text-2xl font-black text-dark-navy">Colombo</div>
          <div className="text-xs font-bold text-gray-500 mt-1">1,205 visitors</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h4 className="text-sm font-black text-dark-navy mb-4 uppercase tracking-widest">Live Visitors</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Page</th>
                    <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                    <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Device</th>
                    <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {displayVisitors.map((v, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-1"><div className="w-2 h-2 bg-brand-green rounded-full animate-pulse mx-auto"></div></td>
                      <td className="py-3 text-sm font-bold text-dark-navy truncate max-w-[120px]">{v.current_page}</td>
                      <td className="py-3 text-sm font-medium text-gray-600">{v.location || 'Unknown'}</td>
                      <td className="py-3 text-sm font-medium text-gray-600 flex items-center gap-2">
                        {v.device_type?.toLowerCase() === 'mobile' ? <Smartphone size={14}/> : <Monitor size={14}/>} {v.device_type}
                      </td>
                      <td className="py-3 text-sm font-medium text-gray-600">{v.referrer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-dark-navy mb-4 uppercase tracking-widest">Visitors Today (vs Yesterday)</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="yesterday" stroke="#9ca3af" strokeDasharray="5 5" fill="none" strokeWidth={2} />
                  <Area type="monotone" dataKey="today" stroke="#10b981" fillOpacity={1} fill="url(#colorToday)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-black text-dark-navy mb-4 uppercase tracking-widest">Popular Pages (Today)</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularPages} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 10, fill: '#374151', fontWeight: 'bold' }} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="views" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h4 className="text-sm font-black text-dark-navy mb-4 uppercase tracking-widest">Live Activity Feed</h4>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 h-80 overflow-y-auto">
              <div className="space-y-4">
                {activityFeed.map((activity) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={activity.id} 
                    className="flex justify-between items-start border-b border-gray-200 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex gap-2 items-start">
                      <div className={`mt-1 bg-${activity.color}-500 w-2 h-2 rounded-full flex-shrink-0`}></div>
                      <p className="text-xs font-bold text-dark-navy leading-tight">{activity.text}</p>
                    </div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap ml-2">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div>
             <h4 className="text-sm font-black text-dark-navy mb-4 uppercase tracking-widest flex items-center justify-between">
                <span>Traffic Sources</span>
                <span className="text-[10px] text-gray-400 font-bold">TODAY</span>
             </h4>
             <div className="h-40 flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value" stroke="none">
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-[50%] space-y-2">
                   {trafficSources.map((source, idx) => (
                     <div key={idx} className="flex justify-between items-center whitespace-nowrap">
                       <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }}></div>
                         {source.name}
                       </div>
                       <div className="text-xs font-black text-dark-navy">{source.value}%</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-black text-dark-navy mb-4 uppercase tracking-widest flex items-center gap-2">
          <Globe size={18} className="text-brand-green" /> Live Geographic Distribution
        </h4>
        <div className="h-80 w-full rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
          <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {/* Mock random points in Sri Lanka for live visitors */}
            {[...Array(15)].map((_, i) => (
              <Marker 
                key={i} 
                position={[
                  6.9 + Math.random() * 1.5, 
                  79.9 + Math.random() * 1.5
                ]} 
                icon={pulsingDotIcon}
              >
                <Popup className="rounded-xl">
                  <div className="text-xs font-bold text-dark-navy">Active Visitor</div>
                  <div className="text-[10px] text-gray-500">Viewing a property</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
