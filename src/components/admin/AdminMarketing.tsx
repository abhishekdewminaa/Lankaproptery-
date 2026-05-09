import React, { useState } from 'react';
import { 
  Megaphone, 
  Target, 
  TrendingUp, 
  Plus, 
  Calendar, 
  MousePointer2, 
  Eye, 
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Zap,
  Globe,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdSlot {
  id: string;
  name: string;
  location: 'Home Hero' | 'Search Results' | 'Sidebar' | 'Property Top';
  status: 'active' | 'available' | 'scheduled';
  price: string;
  period: string;
  audience: string;
  clicks: number;
  views: number;
}

const DEMO_SLOTS: AdSlot[] = [
  { id: '1', name: 'Homepage Featured Hero', location: 'Home Hero', status: 'active', price: '$250', period: '7 Days', audience: '150k+ Visitors', clicks: 1240, views: 45000 },
  { id: '2', name: 'Premium Search Sidebar', location: 'Sidebar', status: 'available', price: '$120', period: '14 Days', audience: '85k+ Visitors', clicks: 0, views: 0 },
  { id: '3', name: 'Property Page Banner', location: 'Property Top', status: 'scheduled', price: '$180', period: '30 Days', audience: '200k+ Visitors', clicks: 0, views: 0 },
  { id: '4', name: 'Search Results Interstitial', location: 'Search Results', status: 'active', price: '$200', period: '7 Days', audience: '120k+ Visitors', clicks: 850, views: 32000 },
];

export default function AdminMarketing() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'available'>('all');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const filteredSlots = DEMO_SLOTS.filter(slot => {
    if (activeTab === 'all') return true;
    return slot.status === activeTab;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-admin-text-dark tracking-tight">Marketing & Ads</h2>
          <p className="text-admin-text-gray font-bold mt-2">Manage your advertising inventory and campaign performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#006644] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#005533] transition-all shadow-xl shadow-[#006644]/20 active:scale-95">
            <Plus size={18} />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Ads', value: '12', icon: <Megaphone className="text-green-600" />, sub: '+2 this week', color: 'bg-green-50' },
          { label: 'Avg CTR', value: '4.2%', icon: <MousePointer2 className="text-blue-600" />, sub: 'High Engagement', color: 'bg-blue-50' },
          { label: 'Total Views', value: '840k', icon: <Eye className="text-indigo-600" />, sub: 'Across Platform', color: 'bg-indigo-50' },
          { label: 'Ad Revenue', value: '$8.4k', icon: <TrendingUp className="text-admin-gold" />, sub: 'Monthly Goal', color: 'bg-admin-gold/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[40px] border border-admin-border shadow-sm group hover:shadow-xl hover:shadow-black/5 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">{stat.sub}</span>
            </div>
            <p className="text-sm font-black text-admin-text-gray uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-admin-text-dark mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Ad Slots Inventory */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] border border-admin-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-admin-border flex flex-col sm:flex-row justify-between items-center gap-6">
               <div className="flex p-1 bg-admin-bg rounded-2xl w-full sm:w-auto">
                 {['all', 'active', 'available'].map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab as any)}
                     className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                       activeTab === tab ? 'bg-white text-admin-primary shadow-sm' : 'text-admin-text-gray hover:text-admin-text-dark'
                     }`}
                   >
                     {tab}
                   </button>
                 ))}
               </div>
               <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search slots..."
                      className="bg-admin-bg border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-admin-primary/10 w-48"
                    />
                  </div>
               </div>
            </div>

            <div className="divide-y divide-admin-border">
              {filteredSlots.map((slot) => (
                <div 
                  key={slot.id} 
                  className={`p-8 hover:bg-admin-bg/30 transition-all cursor-pointer group ${selectedSlot === slot.id ? 'bg-admin-bg/50 ring-2 ring-inset ring-admin-primary/10' : ''}`}
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-6">
                      <div className="w-20 h-20 bg-admin-bg rounded-[24px] flex items-center justify-center border border-admin-border group-hover:scale-105 transition-transform">
                        {slot.location === 'Home Hero' ? <Globe size={32} className="text-blue-500" /> : 
                         slot.location === 'Sidebar' ? <Smartphone size={32} className="text-purple-500" /> : 
                         <BarChart3 size={32} className="text-green-500" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            slot.status === 'active' ? 'bg-green-100 text-green-600' : 
                            slot.status === 'available' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {slot.status}
                          </span>
                          <span className="text-[10px] font-bold text-admin-text-gray uppercase tracking-widest">{slot.location}</span>
                        </div>
                        <h4 className="text-xl font-black text-admin-text-dark">{slot.name}</h4>
                        <div className="flex items-center gap-4 pt-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-admin-text-gray">
                            <Calendar size={14} />
                            {slot.period}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-admin-text-gray">
                            <Target size={14} />
                            {slot.audience}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                       <p className="text-2xl font-black text-admin-text-dark mb-1">{slot.price}</p>
                       <p className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Base Starting Price</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Tips & Actions */}
        <div className="space-y-6">
           <div className="bg-admin-primary p-10 rounded-[40px] text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-admin-primary/20">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Zap className="text-admin-gold mb-8" size={48} />
              </motion.div>
              <h4 className="text-3xl font-black mb-4 leading-tight">Elite Real Estate Marketing</h4>
              <p className="text-white/70 text-sm font-medium leading-relaxed mb-8">
                Target high-net-worth investors directly in the home-buying journey. Double your response rate with AI-optimized slots.
              </p>
              <button className="w-full bg-white text-admin-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-admin-bg transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10">
                Optimization Tool <ArrowUpRight size={18} />
              </button>
           </div>

           <div className="bg-[#1A1A1A] p-10 rounded-[40px] text-white relative overflow-hidden">
              <div className="relative z-10">
                <Sparkles size={32} className="text-[#00B67A] mb-8" />
                <h4 className="text-2xl font-black mb-4">Ad Performance</h4>
                <div className="space-y-6">
                   <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50">
                       <span>Total Engagement</span>
                       <span>84% Level</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '84%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-[#00B67A]" 
                      />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Weekly Views</p>
                        <p className="text-xl font-black">+42.5k</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Click Growth</p>
                        <p className="text-xl font-black text-[#00B67A]">+18%</p>
                      </div>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-admin-border shadow-sm">
              <CheckCircle2 className="text-[#006644] mb-4" size={32} />
              <h4 className="text-xl font-black text-admin-text-dark mb-2">Automated Payouts</h4>
              <p className="text-admin-text-gray text-xs font-bold uppercase tracking-widest leading-relaxed">
                Connect your account to receive advertising revenue instantly upon campaign completion.
              </p>
              <button className="mt-6 w-full py-4 border border-admin-border rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-admin-bg transition-all">
                Connect Stripe
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
