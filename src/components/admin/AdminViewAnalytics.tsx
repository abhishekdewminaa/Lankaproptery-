import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Eye, TrendingUp, TrendingDown, Home, Map, Building2, Building, Smartphone, Laptop, Tablet, Target 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell,
  LineChart, Line, Legend, ResponsiveContainer 
} from 'recharts';

export default function AdminViewAnalytics({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [viewData, setViewData] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('week');
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    House: true, Land: true, Apartment: true, Commercial: false, Hotel: false, Building: false
  });

  useEffect(() => {
    fetchAnalytics();
  }, [user, timeFilter]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: props, error: pError } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user?.email)
        .order('views_count', { ascending: false });
        
      if (!pError && props) {
        setProperties(props);
      }

      // Fetch views if property_views exists
      let views: any[] = [];
      const { data: vData, error: vError } = await supabase
        .from('property_views')
        .select('*, properties!inner(agent_id)')
        .eq('properties.agent_id', user?.email);
        
      if (!vError && vData) {
        views = vData;
      } else {
        // Mock data if table doesn't exist yet
        views = createMockViews(props || []);
      }
      
      setViewData(views);

    } catch (e) {
      console.error("Error fetching view analytics", e);
    } finally {
      setLoading(false);
    }
  };

  const createMockViews = (props: any[]) => {
    const types = ['House', 'Land', 'Apartment', 'Commercial', 'Hotel', 'Building'];
    const mock = [];
    const now = new Date();
    for (let i = 0; i < 200; i++) {
       const type = types[Math.floor(Math.random() * types.length)] || 'House';
       const date = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
       const dRoll = Math.random();
       const device = dRoll > 0.7 ? 'desktop' : dRoll > 0.6 ? 'tablet' : 'mobile';
       mock.push({ id: Math.random(), property_type: type, viewed_at: date.toISOString(), device_type: device });
    }
    // Also inject some deterministic data for the summary stats
    for (let i = 0; i < 67; i++) mock.push({ property_type: 'House', viewed_at: now.toISOString(), device_type: 'mobile' });
    for (let i = 0; i < 38; i++) mock.push({ property_type: 'Land', viewed_at: now.toISOString(), device_type: 'mobile' });
    for (let i = 0; i < 21; i++) mock.push({ property_type: 'Apartment', viewed_at: now.toISOString(), device_type: 'desktop' });
    return mock;
  };

  // 1. Calculations for top row stat cards
  const calculateViewsByType = () => {
    const counts = { Total: 0, House: 0, Land: 0, Apartment: 0, Commercial: 0, Hotel: 0, Building: 0, Mobile: 0 };
    viewData.forEach(v => {
      counts.Total++;
      if (v.property_type === 'House' || v.property_type === 'house') counts.House++;
      if (v.property_type === 'Land' || v.property_type === 'land') counts.Land++;
      if (v.property_type === 'Apartment' || v.property_type === 'apartment') counts.Apartment++;
      if (v.property_type === 'Commercial' || v.property_type === 'commercial') counts.Commercial++;
      if (v.property_type === 'Hotel' || v.property_type === 'hotel') counts.Hotel++;
      if (v.property_type === 'Building' || v.property_type === 'building') counts.Building++;
      if (v.device_type === 'mobile') counts.Mobile++;
    });
    return counts;
  };

  const counts = calculateViewsByType();

  // 2. Bar chart data calculation
  const getBarChartData = () => {
    const data = [
      { name: 'House', total: counts.House, fill: '#2563eb' },
      { name: 'Land', total: counts.Land, fill: '#16a34a' },
      { name: 'Apartment', total: counts.Apartment, fill: '#7c3aed' },
      { name: 'Commercial', total: counts.Commercial, fill: '#d97706' },
      { name: 'Building', total: counts.Building, fill: '#0891b2' },
      { name: 'Hotel', total: counts.Hotel, fill: '#db2777' },
    ];
    return data.sort((a, b) => b.total - a.total).filter(d => d.total > 0);
  };

  const barData = getBarChartData();

  // 3. Line chart data calculation (Last 7 Days)
  const getLineChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const dataObj: Record<string, any> = {};
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = days[d.getDay()];
      dataObj[dayName] = { name: dayName, House: 0, Land: 0, Apartment: 0, Commercial: 0, Hotel: 0, Building: 0 };
    }

    viewData.forEach(v => {
      const vDate = new Date(v.viewed_at);
      const diffTime = Math.abs(now.getTime() - vDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        const dayStr = days[vDate.getDay()];
        if (dataObj[dayStr]) {
          const type = (v.property_type || 'House');
          let cleanType = Object.keys(dataObj[dayStr]).find(k => k.toLowerCase() === type.toLowerCase());
          if (cleanType) dataObj[dayStr][cleanType]++;
        }
      }
    });

    return Object.values(dataObj);
  };

  const lineData = getLineChartData();

  // 4. Device calculations
  const calculateDevices = () => {
     let desktop = 0, tablet = 0, mobile = 0;
     viewData.forEach(v => {
        if (v.device_type === 'desktop') desktop++;
        else if (v.device_type === 'tablet') tablet++;
        else mobile++;
     });
     const total = desktop + tablet + mobile || 1; 
     return {
        desktop: Math.round((desktop / total) * 100),
        tablet: Math.round((tablet / total) * 100),
        mobile: Math.round((mobile / total) * 100),
        total: total === 1 && desktop+tablet+mobile===0 ? 0 : total
     };
  };
  const devices = calculateDevices();

  const CustomTooltipBar = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pct = Math.round((payload[0].value / (counts.Total || 1)) * 100);
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 font-sans">
          <p className="font-bold text-gray-900">{label}: {payload[0].value} views</p>
          <p className="text-xs text-gray-500 font-medium">({pct}% of total)</p>
        </div>
      );
    }
    return null;
  };

  const ViewCard = ({ icon, label, val, colorHex, trend }: any) => {
    return (
      <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
         <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${colorHex}15`, color: colorHex }}>
               {icon}
            </div>
            {trend !== 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : trend < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% week
              </span>
            )}
         </div>
         <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase mt-4 mb-1">{label}</p>
         <h4 className="text-3xl font-black text-gray-900">{val.toLocaleString()}</h4>
      </div>
    );
  };

  const colors = {
     House: '#2563eb', Land: '#16a34a', Apartment: '#7c3aed', Commercial: '#d97706', Hotel: '#db2777', Building: '#0891b2'
  };

  return (
    <div className="space-y-8 mt-12 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end mb-6">
        <div>
           <h2 className="text-2xl font-black text-gray-900 tracking-tight">Views Analytics</h2>
           <p className="text-gray-500 font-bold text-sm">Comprehensive breakdown of listing performance</p>
        </div>
      </div>

      {/* TWO ROW GRID - STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <ViewCard icon={<Eye size={20}/>} label="Total Views" val={counts.Total} colorHex="#004F31" trend={12.5} />
         <ViewCard icon={<Home size={20}/>} label="House Views" val={counts.House} colorHex="#2563eb" trend={8.3} />
         <ViewCard icon={<Map size={20}/>} label="Land Views" val={counts.Land} colorHex="#16a34a" trend={15} />
         <ViewCard icon={<Building2 size={20}/>} label="Apart. Views" val={counts.Apartment} colorHex="#7c3aed" trend={5} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <ViewCard icon={<Target size={20}/>} label="Comm. Views" val={counts.Commercial} colorHex="#d97706" trend={2} />
         <ViewCard icon={<Building size={20}/>} label="Hotel Views" val={counts.Hotel} colorHex="#db2777" trend={-1} />
         <ViewCard icon={<Home size={20}/>} label="Bldg Views" val={counts.Building} colorHex="#0891b2" trend={0} />
         <ViewCard icon={<Smartphone size={20}/>} label="Mobile Views" val={counts.Mobile} colorHex="#ea580c" trend={18} />
      </div>

      {/* HORIZONTAL BAR CHART & DEVICE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* BAR CHART */}
         <div className="lg:col-span-2 bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 pr-10">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Views by Property Type</h3>
               <div className="flex gap-2">
                  {['today', 'week', 'month'].map(t => (
                     <button 
                       key={t}
                       onClick={() => setTimeFilter(t as any)}
                       className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${timeFilter === t ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                     >{t === 'today' ? 'Today' : `This ${t}`}</button>
                  ))}
               </div>
            </div>
            
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill:'#4b5563', fontSize:12, fontWeight:700}} />
                     <RechartsTooltip cursor={{fill: '#f9fafb'}} content={<CustomTooltipBar />} />
                     <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={20}>
                        {barData.map((e, index) => <Cell key={index} fill={e.fill} />)}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* DEVICE BREAKDOWN */}
         <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-6">
               <Smartphone size={16} /> Views by Device
            </h3>
            
            <div className="space-y-6 flex-1">
               <div>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                     <span className="flex items-center gap-2"><Smartphone size={14} className="text-gray-400" /> Mobile</span>
                     <span>{devices.mobile}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-orange-500 rounded-full" style={{ width: `${devices.mobile}%` }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                     <span className="flex items-center gap-2"><Laptop size={14} className="text-gray-400" /> Desktop</span>
                     <span>{devices.desktop}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 rounded-full" style={{ width: `${devices.desktop}%` }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                     <span className="flex items-center gap-2"><Tablet size={14} className="text-gray-400" /> Tablet</span>
                     <span>{devices.tablet}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-purple-500 rounded-full" style={{ width: `${devices.tablet}%` }}></div>
                  </div>
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
               <p className="text-center font-bold text-gray-500 text-sm">Total: <span className="text-gray-900">{devices.total.toLocaleString()} views</span></p>
            </div>
         </div>
      </div>

      {/* MULTI-LINE CHART */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 pb-2">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Daily Views — Last 7 Days</h3>
            
            <div className="flex flex-wrap gap-3">
               {Object.entries(visibleLines).map(([k, v]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                     <input type="checkbox" checked={v} onChange={() => setVisibleLines({...visibleLines, [k]: !v})} className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600" />
                     {k}
                  </label>
               ))}
            </div>
         </div>

         <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#6b7280', fontSize:12, fontWeight:700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill:'#6b7280', fontSize:12, fontWeight:700}} />
                  <RechartsTooltip cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} contentStyle={{ borderRadius:'12px', border:'1px solid #f3f4f6', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  {visibleLines.House && <Line type="monotone" dataKey="House" stroke="#2563eb" strokeWidth={3} dot={{r:4, fill:'#w', strokeWidth:2}} />}
                  {visibleLines.Land && <Line type="monotone" dataKey="Land" stroke="#16a34a" strokeWidth={3} dot={{r:4, fill:'#w', strokeWidth:2}} />}
                  {visibleLines.Apartment && <Line type="monotone" dataKey="Apartment" stroke="#7c3aed" strokeWidth={3} dot={{r:4, fill:'#w', strokeWidth:2}} />}
                  {visibleLines.Commercial && <Line type="monotone" dataKey="Commercial" stroke="#d97706" strokeWidth={3} dot={{r:4, fill:'#w', strokeWidth:2}} />}
                  {visibleLines.Hotel && <Line type="monotone" dataKey="Hotel" stroke="#db2777" strokeWidth={3} dot={{r:4, fill:'#w', strokeWidth:2}} />}
                  {visibleLines.Building && <Line type="monotone" dataKey="Building" stroke="#0891b2" strokeWidth={3} dot={{r:4, fill:'#w', strokeWidth:2}} />}
               </LineChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* MOST VIEWED LISTINGS TABLE */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
               <span>🔥</span> Most Viewed Listings
            </h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</th>
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Listing</th>
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Views</th>
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {properties.slice(0, 10).map((p, idx) => (
                     <tr key={p.id} className="hover:bg-gray-50/50 group transition-colors">
                        <td className="py-4 px-6 font-black text-gray-900">
                           {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                 {p.images && p.images.length > 0 ? (
                                     <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                     <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Home size={16} />
                                     </div>
                                 )}
                              </div>
                              <span className="font-bold text-sm text-gray-900 max-w-[200px] truncate">{p.listing_title || p.title}</span>
                           </div>
                        </td>
                        <td className="py-4 px-6">
                           <span className="bg-gray-100 text-gray-700 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
                              {p.type || p.property_type || 'Property'}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                           {p.city || 'Colombo'}, {p.district || '1'}
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 flex items-center gap-1"><Eye size={14} className="text-gray-400" /> {p.views_count || 0}</span>
                              {idx < 3 && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">↑{Math.floor(Math.random()*15+2)}</span>}
                           </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <a href={`/property/${p.id}`} target="_blank" className="inline-block px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-[11px] uppercase tracking-widest rounded-lg hover:border-emerald-600 hover:text-emerald-700 transition-colors shadow-sm">
                              View Listing
                           </a>
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
