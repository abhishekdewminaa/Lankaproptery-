import React, { useState } from 'react';
import { 
  Megaphone, 
  Target, 
  TrendingUp, 
  Plus, 
  Calendar, 
  MousePointer2, 
  Eye, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  Zap, 
  Globe, 
  Smartphone,
  Trash2,
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

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

const INITIAL_DEMO_SLOTS: AdSlot[] = [
  { id: '1', name: 'Homepage Featured Hero Advertisement', location: 'Home Hero', status: 'active', price: 'රු 75,000', period: '7 Days', audience: '150k+ Visitors', clicks: 1240, views: 45000 },
  { id: '2', name: 'Premium Search Sidebar Ads banner', location: 'Sidebar', status: 'available', price: 'රු 35,000', period: '14 Days', audience: '85k+ Visitors', clicks: 0, views: 0 },
  { id: '3', name: 'Property Page Banner - Upper Section', location: 'Property Top', status: 'scheduled', price: 'රු 50,000', period: '30 Days', audience: '200k+ Visitors', clicks: 0, views: 0 },
  { id: '4', name: 'Search Results Interstitial banner', location: 'Search Results', status: 'active', price: 'රු 60,000', period: '7 Days', audience: '120k+ Visitors', clicks: 850, views: 32000 },
];

export default function AdminMarketing() {
  const [slots, setSlots] = useState<AdSlot[]>(INITIAL_DEMO_SLOTS);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'available' | 'scheduled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<AdSlot | null>(null);
  
  // Create campaign slot simple state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSlotName, setNewSlotName] = useState('');
  const [newLocation, setNewLocation] = useState<'Home Hero' | 'Search Results' | 'Sidebar' | 'Property Top'>('Home Hero');
  const [newPrice, setNewPrice] = useState('');
  const [newPeriod, setNewPeriod] = useState('7 Days');
  const [newAudience, setNewAudience] = useState('100k+ Visitors');

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotName.trim() || !newPrice.trim()) {
      toast.error('Please fill in the slot name and pricing details.');
      return;
    }

    const newAd: AdSlot = {
      id: Date.now().toString(),
      name: newSlotName,
      location: newLocation,
      status: 'available',
      price: newPrice.startsWith('රු') ? newPrice : `රු ${newPrice}`,
      period: newPeriod,
      audience: newAudience,
      clicks: 0,
      views: 0
    };

    setSlots(prev => [newAd, ...prev]);
    setIsCreateOpen(false);
    setNewSlotName('');
    setNewPrice('');
    toast.success('Successfully provisioned new advertising campaign slot!');
  };

  const handleDeleteSlot = (id: string) => {
    if (confirm('Are you sure you want to delete this marketing slot?')) {
      setSlots(prev => prev.filter(s => s.id !== id));
      if (selectedSlot?.id === id) {
        setSelectedSlot(null);
      }
      toast.success('Marketing slot removed permanently.');
    }
  };

  const filteredSlots = slots.filter(slot => {
    const matchesTab = activeTab === 'all' || slot.status === activeTab;
    const matchesSearch = slot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          slot.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalSlots = slots.length;
  const activeCount = slots.filter(s => s.status === 'active').length;
  const totalProjected = slots.reduce((acc, curr) => {
    const num = parseInt(curr.price.replace(/[^0-9]/g, '')) || 0;
    return acc + num;
  }, 0);

  return (
    <div className="max-w-[1400px] mx-auto pb-24 space-y-8 animate-in fade-in duration-500 font-sans text-slate-800">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📢</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
              Marketing & Campaigns
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-400 mt-1">
              Coordinate system-wide ad spaces, featured premium campaigns, and banner slot inventories.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-3 bg-[#004F31] hover:bg-[#003420] text-white text-2xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Campaign Slot</span>
        </button>
      </div>

      {/* 2. Stats Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Slots */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-50 text-[#004F31] rounded-xl">
              <Megaphone size={18} />
            </div>
            <span className="text-[12px] font-medium text-emerald-600">Inventory</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Campaign Slots</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalSlots}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Ad spaces defined</p>
        </div>

        {/* Active Placements */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles size={18} />
            </div>
            <span className="text-[12px] font-medium text-blue-600">Live</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Active Placements</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{activeCount}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Running banner spots</p>
        </div>

        {/* Projected Revenue */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp size={18} />
            </div>
            <span className="text-[12px] font-medium text-amber-600">LKR</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Projected Revenue</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">රු {totalProjected.toLocaleString()}</h3>
          <p className="text-[12px] text-[#6b7280] mt-0.5">Based on listing pricing</p>
        </div>

        {/* CTR */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <MousePointer2 size={18} />
            </div>
            <span className="text-[12px] font-medium text-teal-600">Global</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Global Click-Through (CTR)</p>
          <h3 className="text-2xl sm:text-3xl font-black text-teal-600 mt-1">4.25%</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">High user engagement</p>
        </div>

      </div>

      {/* 3. Filter Bar & Data Table Card */}
      <div className="bg-white border border-slate-200 rounded-[14px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        
        {/* Search & Tabs */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          
          <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto shrink-0">
            {[
              { id: 'all', label: 'All Slots' },
              { id: 'active', label: 'Active' },
              { id: 'available', label: 'Available' },
              { id: 'scheduled', label: 'Scheduled' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id ? 'bg-white text-[#004F31] shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search placement slot..."
              className="w-full bg-white border border-slate-200 focus:border-[#004F31] focus:ring-1 focus:ring-[#004F31] rounded-lg py-2 pl-9 pr-4 text-xs font-semibold outline-none"
            />
          </div>

        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {filteredSlots.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-slate-200">
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Placement / Slot Name</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Location</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Display Period</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Target Audience</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Price</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                          {slot.location === 'Home Hero' ? <Globe size={16} className="text-blue-500" /> : 
                           slot.location === 'Sidebar' ? <Smartphone size={16} className="text-purple-500" /> : 
                           <Megaphone size={16} className="text-[#004F31]" />}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm leading-tight">{slot.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">ID: slot_{slot.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10.5px] rounded-md font-mono border border-slate-200">
                        {slot.location}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      📅 {slot.period}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      🎯 {slot.audience}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-950">
                      {slot.price}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        slot.status === 'active'
                          ? 'bg-green-50 text-green-600 border-green-200'
                          : slot.status === 'available'
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        {slot.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button 
                          onClick={() => setSelectedSlot(slot)}
                          className="px-3 py-1.5 bg-[#004F31]/10 hover:bg-[#004F31] text-[#004F31] hover:text-white rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-3xs"
                        >
                          Performance
                        </button>
                        <button 
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded border border-slate-100 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center max-w-sm mx-auto py-16">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Megaphone size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-black text-slate-900 leading-none">No Slots Found</p>
              <p className="text-xs text-slate-400 mt-1.5">Try widening your filters or keywords.</p>
            </div>
          )}
        </div>

      </div>

      {/* Slide-over Ad Performance & Insights Panel */}
      <AnimatePresence>
        {selectedSlot && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedSlot(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col border-l border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="font-black text-lg text-slate-900 tracking-tight font-display">Ad Performance</h3>
                  <p className="text-2xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Campaign Analytics</p>
                </div>
                <button onClick={() => setSelectedSlot(null)} className="p-2 bg-white hover:bg-slate-100 border border-slate-100 rounded-full text-slate-500 shadow-sm transition-all cursor-pointer"><X size={16} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Info Card */}
                <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                      {selectedSlot.location}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#004F31]/10 px-2 py-0.5 rounded text-[#004F31]">
                      {selectedSlot.status}
                    </span>
                  </div>
                  <h4 className="font-black text-base text-slate-900 leading-snug mt-3">{selectedSlot.name}</h4>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200/60">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Starting Price</p>
                      <p className="text-sm font-extrabold text-slate-900 mt-1">{selectedSlot.price}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Period</p>
                      <p className="text-sm font-extrabold text-slate-900 mt-1">{selectedSlot.period}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Traffic Overview</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Views Count</p>
                      <p className="text-xl font-black text-slate-900 mt-1">{selectedSlot.views.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-xl text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Clicks</p>
                      <p className="text-xl font-black text-[#004F31] mt-1">{selectedSlot.clicks.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Engagement Index */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Optimisation & Strategy</h4>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <div className="flex gap-2.5">
                      <Zap className="text-amber-500 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">Traffic Delivery Optimum</p>
                        <p className="text-[11px] text-slate-600 font-semibold mt-1 leading-relaxed">
                          This placement slot guarantees top tier visibility above fold lines, translating to higher organic interaction for agencies listing premium real estate projects.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => {
                      toast.success('Successfully reserved listing for priority display!');
                      setSelectedSlot(null);
                    }}
                    className="w-full bg-[#004F31] hover:bg-[#003420] text-white py-3 rounded-xl font-black text-2xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Set Live Now
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Campaign slot is now scheduled!');
                      setSelectedSlot(null);
                    }}
                    className="w-full border border-slate-200 hover:bg-slate-50 py-3 rounded-xl font-black text-2xs uppercase tracking-widest text-slate-700 transition-all cursor-pointer"
                  >
                    Schedule Slot Period
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal: Create Campaign Slot */}
      <AnimatePresence>
        {isCreateOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-x-4 top-[10%] md:max-w-md md:mx-auto bg-white rounded-2xl shadow-2xl z-[110] overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-base text-slate-900 font-display">Create Campaign Slot</h3>
                <button onClick={() => setIsCreateOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={16} /></button>
              </div>

              <form onSubmit={handleCreateSlot} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Slot Title / Name</label>
                  <input
                    type="text"
                    required
                    value={newSlotName}
                    onChange={(e) => setNewSlotName(e.target.value)}
                    placeholder="e.g. Premium Homestay Search Interstitial banner"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:border-[#004F31] focus:ring-1 focus:ring-[#004F31]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Location Type</label>
                    <select
                      value={newLocation}
                      onChange={(e: any) => setNewLocation(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold outline-none bg-white focus:border-[#004F31]"
                    >
                      <option value="Home Hero">Home Hero</option>
                      <option value="Search Results">Search Results</option>
                      <option value="Sidebar">Sidebar</option>
                      <option value="Property Top">Property Top</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Price (LKR)</label>
                    <input
                      type="text"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="e.g. රු 45,000"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:border-[#004F31]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Display Period</label>
                    <input
                      type="text"
                      required
                      value={newPeriod}
                      onChange={(e) => setNewPeriod(e.target.value)}
                      placeholder="e.g. 14 Days"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:border-[#004F31]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Est. Reach</label>
                    <input
                      type="text"
                      required
                      value={newAudience}
                      onChange={(e) => setNewAudience(e.target.value)}
                      placeholder="e.g. 120k+ Visitors"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:border-[#004F31]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-[11px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#004F31] hover:bg-[#003420] text-white rounded-lg text-[11px] font-black uppercase tracking-wider shadow-sm"
                  >
                    Provision Slot
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
