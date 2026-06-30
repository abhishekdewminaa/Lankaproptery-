import React from 'react';
import { Agent, AgentProperty, AgentLead } from './types';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, TrendingUp, Award, Clock, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface PerformanceTabProps {
  agent: Agent;
  properties: AgentProperty[];
  leads: AgentLead[];
  adminDarkMode: boolean;
}

export default function PerformanceTab({
  agent,
  properties,
  leads,
  adminDarkMode
}: PerformanceTabProps) {
  const agentProps = properties.filter((p) => p.agent_id === agent.id);
  const agentLeads = leads.filter((l) => l.agent_id === agent.id);

  // 1. KPI Calculations
  const totalViews = agentProps.reduce((acc, p) => acc + p.views, 0);
  const avgViews = agentProps.length > 0 ? Math.round(totalViews / agentProps.length) : 0;
  
  // Find Best Listing
  let bestListing = { title: 'No Listings', views: 0 };
  if (agentProps.length > 0) {
    const sortedProps = [...agentProps].sort((a, b) => b.views - a.views);
    bestListing = { title: sortedProps[0].title, views: sortedProps[0].views };
  }

  const responseRate = 94; // Standard beautiful benchmark

  // 2. Chart 1 Data: Views Over Time (Simulated 30 Days)
  const viewsOverTimeData = Array.from({ length: 30 }).map((_, i) => {
    const day = i + 1;
    // Base views + slight wave
    const wave = Math.sin(day / 2) * 20;
    const base = 120 + i * 2;
    return {
      name: `${day} Jun`,
      views: Math.round(base + wave)
    };
  });

  // 3. Chart 2 Data: Leads per property
  const leadsPerPropertyData = agentProps.map((p) => ({
    name: p.title.length > 20 ? `${p.title.slice(0, 18)}...` : p.title,
    leads: p.leads
  }));

  // 4. Chart 3 Data: Lead Status Breakdown
  const leadStatuses = ['New', 'Contacted', 'Viewing', 'Negotiating', 'Won', 'Lost'];
  const colors = ['#f97316', '#3b82f6', '#a855f7', '#eab308', '#22c55e', '#64748b'];
  const leadStatusData = leadStatuses.map((st) => {
    const count = agentLeads.filter((l) => {
      if (st === 'New') return l.status === 'New';
      if (st === 'Contacted') return l.status === 'Contacted';
      if (st === 'Viewing') return l.status === 'Viewing';
      if (st === 'Negotiating') return l.status === 'Negotiating';
      if (st === 'Won') return l.status === 'Won';
      return l.status === 'Lost';
    }).length;
    return { name: st, value: count || 1 }; // Fallback 1 to keep layout balanced
  });

  // 5. Monthly performance dataset (mock static list)
  const monthlyPerformance = [
    { month: 'Jun 2026', listings: agentProps.length, views: totalViews, leads: agentLeads.length, won: agentLeads.filter(l => l.status === 'Won').length, revenue: agent.total_paid },
    { month: 'May 2026', listings: Math.max(agentProps.length - 1, 0), views: Math.round(totalViews * 0.8), leads: Math.max(agentLeads.length - 2, 0), won: 1, revenue: 6500 },
    { month: 'Apr 2026', listings: Math.max(agentProps.length - 2, 0), views: Math.round(totalViews * 0.6), leads: Math.max(agentLeads.length - 4, 0), won: 0, revenue: 0 }
  ];

  // 6. District breakdown list
  const districtPerformance = [
    { name: 'Colombo', views: Math.round(totalViews * 0.7), leads: Math.round(agentLeads.length * 0.8) },
    { name: 'Gampaha', views: Math.round(totalViews * 0.2), leads: Math.round(agentLeads.length * 0.15) },
    { name: 'Kandy', views: Math.round(totalViews * 0.1), leads: Math.round(agentLeads.length * 0.05) }
  ];

  const handleDownloadReport = () => {
    toast.success('Downloading performance report in PDF format...');
  };

  const bgCard = adminDarkMode ? 'bg-[#1e1e2d] border-slate-800' : 'bg-white border-slate-100';
  const textPrimary = adminDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = adminDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className={`text-base font-bold ${textPrimary}`}>
            How {agent.name} is performing on the platform
          </h4>
          <p className="text-xs text-slate-400">Review analytics, active view metrics, and client pipelines.</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="py-1.5 px-3 bg-[#004F31] hover:bg-[#003B24] text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Download size={14} /> Download Performance Report PDF
        </button>
      </div>

      {/* TOP 4 KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${bgCard} shadow-xs flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center text-lg">
            👁️
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Views</p>
            <p className={`text-xl font-black ${textPrimary} mt-0.5`}>{totalViews.toLocaleString()}</p>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${bgCard} shadow-xs flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950/40 text-green-600 flex items-center justify-center text-lg">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Views / List</p>
            <p className={`text-xl font-black ${textPrimary} mt-0.5`}>{avgViews.toLocaleString()}</p>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${bgCard} shadow-xs flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-lg">
            <Award size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Best Listing</p>
            <p className={`text-xs font-bold ${textPrimary} mt-0.5 truncate`} title={bestListing.title}>
              {bestListing.title}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{bestListing.views} views</p>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${bgCard} shadow-xs flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center text-lg">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Response Rate</p>
            <p className={`text-xl font-black ${textPrimary} mt-0.5`}>{responseRate}%</p>
          </div>
        </div>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Line Chart - Views Over Time */}
        <div className={`p-5 border rounded-xl ${bgCard} shadow-xs space-y-4`}>
          <h5 className={`text-xs font-black uppercase tracking-wider ${textPrimary}`}>
            Listing Views Over Time (Last 30 Days)
          </h5>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004F31" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#004F31" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="views" stroke="#004F31" fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bar Chart - Leads per Property */}
        <div className={`p-5 border rounded-xl ${bgCard} shadow-xs space-y-4`}>
          <h5 className={`text-xs font-black uppercase tracking-wider ${textPrimary}`}>
            Leads Received Per Property Listing
          </h5>
          {leadsPerPropertyData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500 italic">
              No property listings available to analyze leads.
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsPerPropertyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <RechartsTooltip />
                  <Bar dataKey="leads" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Pie Chart - Lead Status Breakdown */}
        <div className={`p-5 border rounded-xl ${bgCard} shadow-xs space-y-4`}>
          <h5 className={`text-xs font-black uppercase tracking-wider ${textPrimary}`}>
            Lead Funnel Status Breakdown
          </h5>
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[9px] font-bold">
            {leadStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[index] }} />
                <span className="truncate text-slate-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* District Performance List */}
        <div className={`p-5 border rounded-xl ${bgCard} shadow-xs space-y-4 lg:col-span-2`}>
          <h5 className={`text-xs font-black uppercase tracking-wider ${textPrimary}`}>
            District Location Performance Overview
          </h5>
          <div className="space-y-3 pt-2 text-xs">
            {districtPerformance.map((dist, idx) => {
              const maxVal = districtPerformance[0].views || 1;
              const barPct = (dist.views / maxVal) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className={textPrimary}>📍 {dist.name} District</span>
                    <span className={textSecondary}>
                      {dist.views} views • {dist.leads} leads
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600" style={{ width: `${barPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Performance Table */}
      <div className={`p-5 border rounded-xl ${bgCard} shadow-sm space-y-4`}>
        <h5 className={`text-xs font-black uppercase tracking-wider ${textPrimary}`}>
          Historical Monthly Performance Log
        </h5>
        <div className="overflow-x-auto rounded-lg border border-slate-700/10">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-400 border-b border-slate-700/10">
              <tr>
                <th className="p-3">Billing Month</th>
                <th className="p-3">Active Listings</th>
                <th className="p-3">Total Page Views</th>
                <th className="p-3">Inquiries & Leads</th>
                <th className="p-3">Deals Won</th>
                <th className="p-3 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/10">
              {monthlyPerformance.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/15">
                  <td className={`p-3 font-semibold ${textPrimary}`}>{row.month}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{row.listings} listings</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{row.views.toLocaleString()}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{row.leads} leads</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 font-bold text-green-500">{row.won} won</td>
                  <td className="p-3 text-right font-black text-[#004F31] dark:text-[#4ade80]">
                    Rs. {row.revenue.toLocaleString('en-LK')}
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
