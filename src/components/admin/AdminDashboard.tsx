import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  CheckCircle, 
  MessageSquare, 
  DollarSign,
  ArrowRight,
  Download,
  Calendar,
  MoreVertical,
  MapPin,
  Flame,
  Award,
  ChevronRight
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
import { ChartContainer } from '../ChartContainer';
import { supabase } from '../../supabaseClient';

const PERFORMANCE_DATA = [
  { day: 'Mon', views: 4200, avg: 3800 },
  { day: 'Tue', views: 5100, avg: 4000 },
  { day: 'Wed', views: 4800, avg: 4200 },
  { day: 'Thu', views: 6100, avg: 4100 },
  { day: 'Fri', views: 5800, avg: 4500 },
  { day: 'Sat', views: 7200, avg: 4800 },
  { day: 'Sun', views: 6800, avg: 4600 },
];

const MARKET_SHARE_DATA = [
  { name: 'Apartments', value: 45, color: '#004F31' },
  { name: 'Villas', value: 25, color: '#007E50' },
  { name: 'Land', value: 20, color: '#8DC63F' },
  { name: 'Commercial', value: 10, color: '#F5A623' },
];

interface StatCardProps {
  label: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  delay: number;
}

function StatCard({ label, value, trend, icon, delay }: StatCardProps) {
  const isPositive = trend > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[32px] border border-admin-border shadow-sm hover:shadow-xl hover:shadow-admin-primary/5 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-admin-bg rounded-2xl text-admin-primary group-hover:bg-admin-primary group-hover:text-white transition-colors">
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${
          isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-admin-text-gray uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-admin-text-dark">{value}</h3>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState({
    totalViews: 0,
    propertiesSold: 0,
    newEnquiries: 0,
    totalRevenue: 0
  });
  const [hotListings, setHotListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch properties for stats
        const { data: properties, error: pError } = await supabase
          .from('properties')
          .select('*')
          .eq('agent_id', user?.email);
        
        if (pError) throw pError;

        // Fetch inquiries
        const { data: inquiries, error: iError } = await supabase
            .from('property_inquiries')
            .select('*')
            .eq('agent_id', user?.email)
            .eq('status', 'new');
        
        if (iError) throw iError;

        const totalViews = properties?.reduce((sum, p) => sum + (Number(p.views_count) || 0), 0) || 0;
        const soldCount = properties?.filter(p => p.status === 'sold').length || 0;
        const revenue = properties?.filter(p => p.status === 'sold')
          .reduce((sum, p) => {
            const price = parseInt((p.price_lkr || p.price || '0').toString().replace(/[^0-9]/g, '')) || 0;
            return sum + price;
          }, 0) || 0;

        setStats({
          totalViews,
          propertiesSold: soldCount,
          newEnquiries: inquiries?.length || 0,
          totalRevenue: revenue
        });

        // Hot Listings (Top 2 by views)
        const sorted = [...(properties || [])].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        setHotListings(sorted.slice(0, 2));

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.email) fetchData();
  }, [user]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-admin-text-dark tracking-tight">Market Performance</h1>
          <p className="text-admin-text-gray font-bold mt-2">
            Overview of your real estate portfolio in Colombo
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl font-bold text-sm text-admin-text-dark border border-admin-border hover:bg-gray-50 transition-all shadow-sm">
            <Calendar size={18} className="text-admin-primary" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 bg-admin-primary text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-admin-primary/20 hover:bg-admin-secondary transition-all">
            <Download size={18} />
            Download
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Views" 
          value={stats.totalViews.toLocaleString()} 
          trend={12.5} 
          icon={<Eye size={24} />} 
          delay={0.1}
        />
        <StatCard 
          label="Properties Sold" 
          value={stats.propertiesSold.toString()} 
          trend={8.2} 
          icon={<CheckCircle size={24} />} 
          delay={0.2}
        />
        <StatCard 
          label="New Enquiries" 
          value={stats.newEnquiries.toString()} 
          trend={-2.4} 
          icon={<MessageSquare size={24} />} 
          delay={0.3}
        />
        <StatCard 
          label="Total Revenue" 
          value={`Rs. ${(stats.totalRevenue / 1000000).toFixed(1)}M`} 
          trend={15.8} 
          icon={<DollarSign size={24} />} 
          delay={0.4}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-admin-border shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-admin-text-dark">Performance Velocity</h3>
              <p className="text-xs font-bold text-admin-text-gray uppercase tracking-widest mt-1">Daily engagement vs market average</p>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <MoreVertical size={20} className="text-admin-text-gray" />
            </button>
          </div>
          
          <ChartContainer height={350}>
            <AreaChart data={PERFORMANCE_DATA}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#004F31" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#004F31" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px 16px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="#004F31" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorViews)" 
              />
              <Area 
                type="monotone" 
                dataKey="avg" 
                stroke="#E5E7EB" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                fill="none" 
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-8 rounded-[40px] border border-admin-border shadow-sm flex flex-col">
          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-xl font-black text-admin-text-dark">Market Share</h3>
            <p className="text-xs font-bold text-admin-text-gray uppercase tracking-widest mt-1">Inventory by property type</p>
          </div>

          <ChartContainer height={250}>
            <div className="relative w-full h-full">
              <PieChart>
                <Pie
                  data={MARKET_SHARE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {MARKET_SHARE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-admin-text-dark">2,410</span>
                <span className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Active Units</span>
              </div>
            </div>
          </ChartContainer>

          <div className="mt-auto space-y-3">
            {MARKET_SHARE_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-bold text-admin-text-dark">{item.name}</span>
                </div>
                <span className="text-sm font-black text-admin-text-gray">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hot Listings & Premium Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-admin-accent" />
              <h3 className="text-xl font-black text-admin-text-dark">Hot Listings</h3>
            </div>
            <button className="text-sm font-bold text-admin-primary hover:underline flex items-center gap-1 group">
              View All Listings <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hotListings.map((listing) => (
              <motion.div 
                key={listing.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-4 rounded-[32px] border border-admin-border shadow-sm flex gap-4 items-center group cursor-pointer"
              >
                <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                  <img 
                    src={listing.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'} 
                    alt={listing.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-admin-primary/10 text-admin-primary text-[8px] font-black uppercase tracking-widest">
                      {listing.listing_type || 'FOR SALE'}
                    </span>
                    <span className="text-[10px] text-admin-text-gray font-bold line-clamp-1">
                      <MapPin size={10} className="inline mr-1" /> {listing.location || 'Colombo'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-admin-text-dark line-clamp-1 mb-1">{listing.title}</h4>
                  <div className="text-admin-primary font-black text-sm">
                    Rs. {listing.price_lkr || listing.price || 'Contact for price'}
                  </div>
                </div>
              </motion.div>
            ))}
            {hotListings.length === 0 && (
              <div className="col-span-2 py-10 text-center bg-white rounded-[32px] border border-admin-border border-dashed">
                <p className="text-admin-text-gray font-bold">No active listings to highlight yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Premium Agent Card */}
        <div className="bg-admin-primary p-8 rounded-[40px] text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Award size={24} className="text-admin-gold" />
            </div>
            <h3 className="text-2xl font-black mb-2">Premium Agent Bonus</h3>
            <p className="text-white/70 text-sm font-medium leading-relaxed">
              You're only <span className="text-white font-bold">2 listings away</span> from unlocking featured slots for your inventory.
            </p>
          </div>

          <div className="relative z-10 mt-8 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span>Monthly Progress</span>
                <span>80%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-admin-gold"
                />
              </div>
            </div>
            <button className="w-full bg-white text-admin-primary py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-admin-bg transition-colors shadow-lg shadow-black/20">
              Claim Featured Slots
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
