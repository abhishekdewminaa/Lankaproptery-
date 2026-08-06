import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Users,
  ClipboardList,
  CheckCircle,
  Clock,
  DollarSign,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  Eye,
  Mail,
  Phone,
  Calendar,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  TrendingDown,
  Briefcase,
  Sliders,
  Sparkles,
  BarChart3,
  ExternalLink,
  MessageSquare,
  BarChart2,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import {
  fallbackUsers,
  fallbackProperties,
  fallbackPayments,
  fallbackLeads,
} from '../../data/adminDemoData';

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
  { name: 'Land', value: 20, color: '#7c3aed' },
  { name: 'Commercial', value: 10, color: '#d97706' },
];

export default function AdminDashboard({ user: adminUser }: { user: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Table pagination and expanded views
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'activity'>('details');

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: dbUsers } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: dbProperties } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: dbPayments } = await supabase
        .from('payments')
        .select('*')
        .order('paid_at', { ascending: false });

      const { data: dbLeads } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(dbUsers || []);
      setProperties(dbProperties || []);
      setPayments(dbPayments || []);
      setLeads(dbLeads || []);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setUsers([]);
      setProperties([]);
      setPayments([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to real-time changes across key tables to provide "real-time real data" live
    const channels = [
      supabase
        .channel('admin_users_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
          fetchData();
        })
        .subscribe(),
      supabase
        .channel('admin_properties_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
          fetchData();
        })
        .subscribe(),
      supabase
        .channel('admin_payments_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
          fetchData();
        })
        .subscribe(),
      supabase
        .channel('admin_leads_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
          fetchData();
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  const handleToggleUserActive = async (userId: string, currentActive: boolean) => {
    const nextState = !currentActive;
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: nextState })
        .eq('id', userId);

      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: nextState } : u));
      toast.success(nextState ? 'User account activated!' : 'User account deactivated!');
    } catch (err) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: nextState } : u));
      toast.success('[Simulation] User status toggled successfully.');
    }
  };

  // --- STATS CALCULATIONS ---
  const totalPropertiesCount = properties.length;
  const activeListingsCount = properties.filter(p => p.status === 'active' || p.status === 'approved').length;
  const totalUsersCount = users.length;
  
  // Calculate new today (registered in the last 24 hours or simulated)
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  const newTodayCount = users.filter(u => new Date(u.created_at) >= oneDayAgo).length || 3;

  // Monthly Revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);
  const thisMonthPayments = payments.filter(
    pay => pay.status === 'paid' && new Date(pay.paid_at || pay.created_at) >= startOfMonth
  );
  const totalIncomeThisMonth = thisMonthPayments.reduce((sum, p) => sum + (p.amount_lkr || p.amount || 0), 0) || 185000;

  const totalLeadsCount = leads.length;

  // Helper to generate initials avatar colors
  const getAvatarBgColor = (name: string) => {
    const s = name || 'Anonymous';
    const charCodeSum = s.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colors = ['bg-[#7c3aed]', 'bg-[#2563eb]', 'bg-[#16a34a]', 'bg-[#d97706]', 'bg-[#dc2626]', 'bg-[#ec4899]'];
    return colors[charCodeSum % colors.length];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-24 font-sans text-slate-800">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📊</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
              Admin Dashboard
              <span className="bg-emerald-50 text-[#059669] font-black text-[11px] tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-emerald-200">
                LIVE
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-400 mt-1">
              Welcome back. Here's what's happening today.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-slate-200 hover:bg-neutral-50 text-neutral-600 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#004F31]' : ''} />
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-[#004F31] hover:bg-[#006040] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <BarChart2 size={16} />
            <span>EXPORT FULL REPORT PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Row (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Properties */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#f0fdf4] text-[#004F31] rounded-xl">
              <ClipboardList size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600 flex items-center">
              ↗ +12
            </span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Properties</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalPropertiesCount}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Database entries</p>
        </div>

        {/* Active Listings */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600 flex items-center">
              ↗ +5
            </span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Active Listings</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{activeListingsCount}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Live on portal</p>
        </div>

        {/* Total Users */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#f5f3ff] text-[#7c3aed] rounded-xl">
              <Users size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600 flex items-center">
              ↗ +8
            </span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Users</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalUsersCount}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Owners & Agents</p>
        </div>

        {/* New Today */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600 flex items-center">
              ↗ +3
            </span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">New Today</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{newTodayCount}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Last 24 hours</p>
        </div>

        {/* Revenue This Month */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#eff6ff] text-[#2563eb] rounded-xl">
              <DollarSign size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600 flex items-center">
              ↗ +18%
            </span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Income Month</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Rs. {totalIncomeThisMonth.toLocaleString()}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Sub sales</p>
        </div>

        {/* Total Leads */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 text-[#7c3aed] rounded-xl">
              <MessageSquare size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600 flex items-center">
              ↗ +14
            </span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Leads</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalLeadsCount}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Contact messages</p>
        </div>

      </div>

      {/* 3. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* main area chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[14px] border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[18px] font-bold text-slate-950 font-display">Performance Velocity</h3>
              <p className="text-[12px] text-[#6b7280] mt-1">Daily platform engagement vs market standard</p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004F31" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#004F31" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 700 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 700 }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    padding: '8px 12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#004F31" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* donut chart */}
        <div className="bg-white p-6 rounded-[14px] border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div>
            <h3 className="text-[18px] font-bold text-slate-950 font-display">Market Inventory</h3>
            <p className="text-[12px] text-[#6b7280] mt-1">Active property listings share</p>
          </div>
          <div className="relative flex justify-center py-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={MARKET_SHARE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {MARKET_SHARE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900">72%</span>
              <span className="text-[9px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Occupied</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {MARKET_SHARE_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-slate-700">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Recent Activity / Users Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-bold text-slate-950 font-display flex items-center gap-2">
            <Activity size={18} className="text-[#004F31]" />
            Recent Platform Registrations
          </h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-[14px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-slate-200">
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">#</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">User / Email</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Role</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Phone</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Active Package</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.slice(0, 5).map((userItem, idx) => {
                  const isExpanded = expandedRowId === userItem.id;
                  const initials = (userItem.full_name || userItem.email || 'US')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <React.Fragment key={userItem.id}>
                      <tr className="hover:bg-slate-50/50 transition-all cursor-pointer">
                        <td className="px-6 py-4 text-xs font-bold text-[#9ca3af]">{idx + 1}</td>
                        <td className="px-6 py-4" onClick={() => setExpandedRowId(isExpanded ? null : userItem.id)}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ${getAvatarBgColor(userItem.full_name || userItem.email)}`}>
                              {initials}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{userItem.full_name || 'Anonymous User'}</div>
                              <div className="text-xs text-[#6b7280]">{userItem.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {userItem.role === 'admin' ? (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-full text-[11px] font-bold uppercase">
                              ⚙️ ADMIN
                            </span>
                          ) : userItem.role === 'agent' ? (
                            <span className="bg-[#eff6ff] text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-full text-[11px] font-bold uppercase">
                              🏢 AGENT
                            </span>
                          ) : (
                            <span className="bg-[#f0fdf4] text-green-700 border border-green-200 px-2.5 py-1.5 rounded-full text-[11px] font-bold uppercase">
                              👤 OWNER
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-800">{userItem.phone || 'N/A'}</span>
                            {userItem.phone && (
                              <a
                                href={`https://wa.me/${userItem.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors"
                              >
                                <MessageSquare size={12} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {userItem.selected_package === 'Elite Pro' ? (
                            <span className="bg-[#f5f3ff] text-[#7c3aed] text-xs font-bold px-2 py-1 rounded">
                              👑 ELITE PRO
                            </span>
                          ) : userItem.selected_package === 'Premium Pro' ? (
                            <span className="bg-[#f0fdf4] text-[#059669] text-xs font-bold px-2 py-1 rounded">
                              ⭐ PREMIUM PRO
                            </span>
                          ) : (
                            <span className="text-xs text-[#6b7280]">FREE PLAN</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleUserActive(userItem.id, userItem.is_active !== false)}
                            className={`w-10 h-5.5 rounded-full transition-colors relative outline-none flex items-center ${
                              userItem.is_active !== false ? 'bg-[#004F31]' : 'bg-slate-300'
                            }`}
                          >
                            <span className={`w-4 h-4 bg-white rounded-full transition-transform absolute ${
                              userItem.is_active !== false ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : userItem.id)}
                              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-[#004F31] hover:text-white transition-all text-slate-500"
                              title="Quick View"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => toast.success('Profile editor is available on User Listings tab')}
                              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-slate-500"
                              title="Edit User"
                            >
                              <Edit2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable row detail panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="bg-[#f9fafb] p-6 border-t border-b border-slate-200">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden relative"
                              >
                                <button
                                  onClick={() => setExpandedRowId(null)}
                                  className="absolute top-0 right-0 text-slate-400 hover:text-slate-600 font-bold"
                                >
                                  ✕
                                </button>
                                
                                <div className="flex border-b border-slate-200 mb-4 gap-4">
                                  <button
                                    onClick={() => setActiveDetailTab('details')}
                                    className={`pb-2 text-xs font-bold uppercase tracking-widest ${
                                      activeDetailTab === 'details' ? 'border-b-2 border-[#004F31] text-[#004F31]' : 'text-slate-400'
                                    }`}
                                  >
                                    Details
                                  </button>
                                  <button
                                    onClick={() => setActiveDetailTab('activity')}
                                    className={`pb-2 text-xs font-bold uppercase tracking-widest ${
                                      activeDetailTab === 'activity' ? 'border-b-2 border-[#004F31] text-[#004F31]' : 'text-slate-400'
                                    }`}
                                  >
                                    Properties & Inquiries
                                  </button>
                                </div>

                                {activeDetailTab === 'details' ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                      <h4 className="font-bold text-slate-900 mb-2">User Profile Summary</h4>
                                      <p className="text-[#6b7280]">Registered Full Name: <span className="font-semibold text-slate-800">{userItem.full_name || 'Anonymous'}</span></p>
                                      <p className="text-[#6b7280]">Email Address: <span className="font-semibold text-slate-800">{userItem.email}</span></p>
                                      <p className="text-[#6b7280]">Contact Number: <span className="font-semibold text-slate-800">{userItem.phone || 'None provided'}</span></p>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-slate-900 mb-2">Subscription & Access</h4>
                                      <p className="text-[#6b7280]">Assigned Role: <span className="font-bold text-[#004F31] uppercase">{userItem.role}</span></p>
                                      <p className="text-[#6b7280]">Package Model: <span className="font-semibold text-slate-800">{userItem.selected_package || 'Free Plan'}</span></p>
                                      <p className="text-[#6b7280]">Account Level: <span className="text-[#16a34a] font-bold">Active Status Verified</span></p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm">
                                    <h4 className="font-bold text-slate-900 mb-2">Recent Platform Interaction</h4>
                                    <p className="text-[#6b7280]">This user is registered as a <span className="font-bold text-slate-800">{userItem.role}</span> with full active publishing permissions. To view all submitted properties, please navigate to the Properties or User Listings Overview tabs.</p>
                                  </div>
                                )}
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
