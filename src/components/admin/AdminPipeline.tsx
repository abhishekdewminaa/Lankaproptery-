import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Kanban, Phone, Mail, MessageCircle, Calendar, Plus, 
  Search, Check, X, FileText, Loader2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

const KANBAN_COLUMNS = [
  { id: 'new', label: '🆕 NEW', color: '#004F31', bg: 'bg-[#004F31]/5' },
  { id: 'contacted', label: '📞 CONTACTED', color: '#00897b', bg: 'bg-[#00897b]/5' },
  { id: 'viewing', label: '🏠 VIEWING SCHEDULED', color: '#3b82f6', bg: 'bg-blue-50/50' },
  { id: 'negotiating', label: '🤝 NEGOTIATING', color: '#f59e0b', bg: 'bg-amber-50/50' },
  { id: 'won', label: '✅ WON', color: '#10b981', bg: 'bg-emerald-50/50' },
  { id: 'lost', label: '❌ LOST', color: '#ef4444', bg: 'bg-red-50/50' },
];

export default function AdminPipeline() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '', email: '', message: '', property_title: '', stage: 'new' });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
       setLoading(true);
       const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
       if (error) {
          console.error("Leads error:", error);
       } else {
          setLeads(data || []);
       }
    } catch (e) {
       console.error(e);
    } finally {
       setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('leadId', id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    try {
      const { error } = await supabase.from('leads').update({ stage: stageId }).eq('id', parseInt(leadId));
      if (error) throw error;
      
      setLeads(prev => prev.map(l => l.id.toString() === leadId ? { ...l, stage: stageId } : l));
      toast.success('Stage updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stage');
    }
  };

  const addNote = async () => {
    if (!selectedLead || !noteText.trim()) return;
    setIsSavingNote(true);
    try {
       const existingNotes = selectedLead.notes || '';
       const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
       const newNoteStr = `${existingNotes ? existingNotes + '\n' : ''}${dateStr} — ${noteText.trim()}`;
       
       const { error } = await supabase.from('leads').update({ notes: newNoteStr }).eq('id', selectedLead.id);
       if (error) throw error;
       
       const updatedLead = { ...selectedLead, notes: newNoteStr };
       setSelectedLead(updatedLead);
       setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
       setNoteText('');
       toast.success('Note added');
    } catch (err: any) {
       toast.error('Failed to save note');
    } finally {
       setIsSavingNote(false);
    }
  };
  
  const updateStage = async (id: number, stage: string) => {
    try {
      const { error } = await supabase.from('leads').update({ stage }).eq('id', id);
      if (error) throw error;
      if (selectedLead && selectedLead.id === id) setSelectedLead({ ...selectedLead, stage });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
      toast.success('Stage updated');
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };
  
  const updateFollowUp = async () => {
    if (!selectedLead || !followUpDate) return;
    try {
       const { error } = await supabase.from('leads').update({ follow_up_date: followUpDate }).eq('id', selectedLead.id);
       if (error) throw error;
       
       const updatedLead = { ...selectedLead, follow_up_date: followUpDate };
       setSelectedLead(updatedLead);
       setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
       toast.success('Follow-up set!');
    } catch (err) {
       toast.error('Failed to set follow-up');
    }
  };

  const handleAddLead = async () => {
     try {
        const { data, error } = await supabase.from('leads').insert([{
           ...newLead,
           source: 'manual'
        }]).select('*');
        if (error) throw error;
        setLeads(prev => [data[0], ...prev]);
        setShowAddModal(false);
        setNewLead({ name: '', phone: '', email: '', message: '', property_title: '', stage: 'new' });
        toast.success('Lead added!');
     } catch (err: any) {
        toast.error('Failed to add lead');
     }
  };

  const filteredLeads = leads.filter(l => {
     const term = searchTerm.toLowerCase();
     return (l.name || '').toLowerCase().includes(term) ||
            (l.email || '').toLowerCase().includes(term) ||
            (l.phone || '').toLowerCase().includes(term) ||
            (l.property_title || '').toLowerCase().includes(term);
  });

  const getStageColor = (stage: string) => KANBAN_COLUMNS.find(c => c.id === stage)?.color || '#004F31';

  // Stats
  const totalLeads = leads.length;
  const newToday = leads.filter(l => {
     if (!l.created_at) return false;
     const d = new Date(l.created_at);
     const today = new Date();
     return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && l.stage === 'new';
  }).length;
  const contactedCount = leads.filter(l => l.stage === 'contacted').length;
  const viewingCount = leads.filter(l => l.stage === 'viewing').length;
  const wonCount = leads.filter(l => l.stage === 'won').length;

  return (
    <div className="max-w-[1400px] mx-auto pb-24 font-sans text-slate-800 animate-in fade-in duration-500">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📊</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
              Lead Pipeline
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-400 mt-1">
              Track incoming buyer enquiries, organize client viewing schedules, log negotiation stages, and calculate conversion ratios.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3.5 bg-slate-100 border-0 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#004F31]/20 outline-none transition-all placeholder-slate-400 text-slate-800"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-white shadow-sm text-[#004F31]' : 'text-slate-500'}`}>Board</button>
             <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm text-[#004F31]' : 'text-slate-500'}`}>List</button>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-3 bg-[#004F31] hover:bg-[#003420] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm active:scale-95">
             <Plus size={14} /> Add New Lead
          </button>
        </div>
      </div>

      {/* 2. Stats Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         
         {/* Total Leads */}
         <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
                <Kanban size={18} />
              </div>
              <span className="text-[12px] font-medium text-slate-600">All Leads</span>
            </div>
            <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Leads</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalLeads}</h3>
            <p className="text-[12px] text-[#6b7280] mt-1">Acquired property leads</p>
         </div>

         {/* Contacted Leads */}
         <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                <Phone size={18} />
              </div>
              <span className="text-[12px] font-medium text-teal-600">Contacted</span>
            </div>
            <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Contacted Leads</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{contactedCount}</h3>
            <p className="text-[12px] text-[#6b7280] mt-1">Interactions logged</p>
         </div>

         {/* Scheduled Viewings */}
         <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <Calendar size={18} />
              </div>
              <span className="text-[12px] font-medium text-blue-600">Scheduled</span>
            </div>
            <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Scheduled Viewings</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{viewingCount}</h3>
            <p className="text-[12px] text-[#6b7280] mt-1">Site visits coordinated</p>
         </div>

         {/* Closed Won Deals */}
         <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-50 text-[#004F31] rounded-xl">
                <Check size={18} />
              </div>
              <span className="text-[12px] font-medium text-emerald-600">Success</span>
            </div>
            <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Closed Won Deals</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{wonCount}</h3>
            <p className="text-[12px] text-[#6b7280] mt-1">Successfully signed deeds</p>
         </div>

      </div>

      {loading ? (
         <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#004F31]" size={40} />
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Syncing pipeline...</p>
         </div>
      ) : viewMode === 'kanban' ? (
         <div className="flex gap-4 overflow-x-auto pb-6 snap-x pr-8 min-h-[600px] items-start">
            {KANBAN_COLUMNS.map(col => (
               <div 
                  key={col.id} 
                  className={`flex-none w-[310px] rounded-[24px] ${col.bg} border-t-4 p-4 snap-center shadow-sm`}
                  style={{ borderTopColor: col.color }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
               >
                  <div className="flex justify-between items-center mb-4 px-1">
                     <h3 className="font-black text-xs text-slate-800 tracking-tight uppercase">{col.label}</h3>
                     <span className="bg-white text-slate-700 text-2xs font-black px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
                        {filteredLeads.filter(l => (l.stage || 'new') === col.id).length}
                     </span>
                  </div>
                  
                  <div className="space-y-3 min-h-[350px]">
                     {filteredLeads.filter(l => (l.stage || 'new') === col.id).map(lead => (
                        <div 
                           key={lead.id} 
                           draggable
                           onDragStart={(e) => handleDragStart(e, lead.id)}
                           onClick={() => setSelectedLead(lead)}
                           className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-200 transition-all duration-200 group"
                           style={{ borderLeftWidth: '4px', borderLeftColor: col.color }}
                        >
                           <div className="flex justify-between items-start mb-1.5">
                             <p className="font-black text-slate-900 text-xs truncate pr-2 group-hover:text-[#004F31] transition-colors">{lead.name || 'Unknown'}</p>
                             <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap bg-slate-50 px-1.5 py-0.5 rounded">{new Date(lead.created_at).toLocaleDateString()}</span>
                           </div>
                           
                           {lead.property_title && (
                             <p className="text-[10px] text-slate-500 font-semibold line-clamp-1 mb-3 flex items-center gap-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                               <Kanban size={10} className="text-[#004F31]" /> {lead.property_title}
                             </p>
                           )}

                           <div className="flex items-center gap-2 text-xs">
                             <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200"><Phone size={12} /></button>
                             {lead.phone && <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`); }} className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-100"><MessageCircle size={12} /></button>}
                             {lead.email && <button onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${lead.email}`; }} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200"><Mail size={12} /></button>}
                           </div>

                           {lead.follow_up_date && new Date(lead.follow_up_date) >= new Date(new Date().setHours(0,0,0,0)) && (
                             <div className="mt-3 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded inline-flex items-center gap-1 border border-rose-100">
                               <Calendar size={10} /> {new Date(lead.follow_up_date).toLocaleDateString()}
                             </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      ) : (
         <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-[#004F31]/5 border-b border-slate-100 text-[#004F31]">
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Name</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Contact</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Property</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Stage</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Date</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                           <td className="py-4 px-6">
                              <p className="font-black text-slate-900 text-sm hover:text-[#004F31] transition-colors">{lead.name || 'Unknown'}</p>
                           </td>
                           <td className="py-4 px-6">
                              <p className="text-xs text-slate-700 font-semibold">{lead.phone || '-'}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{lead.email}</p>
                           </td>
                           <td className="py-4 px-6 max-w-[200px]">
                              <p className="text-xs text-slate-700 truncate font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 inline-block">{lead.property_title || '-'}</p>
                           </td>
                           <td className="py-4 px-6">
                              <select 
                                 value={lead.stage || 'new'} 
                                 onChange={(e) => { e.stopPropagation(); updateStage(lead.id, e.target.value); }}
                                 onClick={(e) => e.stopPropagation()}
                                 className="text-2xs font-black uppercase tracking-wider rounded-lg px-2.5 py-1 border-none bg-slate-100 text-slate-700 outline-none cursor-pointer"
                              >
                                 {KANBAN_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label.replace(/[^A-Za-z ]/g, '')}</option>)}
                              </select>
                           </td>
                           <td className="py-4 px-6 text-xs text-slate-500 font-bold">{new Date(lead.created_at).toLocaleDateString()}</td>
                           <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => setSelectedLead(lead)} className="text-[#004F31] hover:text-[#003420] text-xs font-black uppercase tracking-wider">View Details</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {filteredLeads.length === 0 && <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No leads found in this filter.</div>}
            </div>
         </div>
      )}

      {/* LEAD DETAIL PANEL */}
      <AnimatePresence>
         {selectedLead && (
            <>
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSelectedLead(null)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
               />
               <motion.div 
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col border-l border-slate-200"
               >
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                     <h3 className="font-black text-lg text-slate-900 tracking-tight font-display">Lead Details</h3>
                     <button onClick={() => setSelectedLead(null)} className="p-2 bg-white hover:bg-slate-100 border border-slate-100 rounded-full text-slate-500 shadow-sm transition-all cursor-pointer"><X size={16} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     {/* Contact Info */}
                     <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-100 text-[#004F31] rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-3 border border-emerald-100 shadow-inner">
                           {(selectedLead.name || 'U')[0].toUpperCase()}
                        </div>
                        <h4 className="font-black text-lg text-slate-900 leading-tight">{selectedLead.name || 'Unknown User'}</h4>
                        <p className="text-2xs font-black text-slate-400 uppercase tracking-widest mt-1">{selectedLead.source === 'manual' ? 'Added Manually' : 'Via Website Enquiry'}</p>
                        
                        <div className="flex justify-center gap-3 mt-4">
                           <button onClick={() => window.open(`tel:${selectedLead.phone}`)} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100 cursor-pointer"><Phone size={16} /></button>
                           {selectedLead.phone && <button onClick={() => window.open(`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`)} className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 border border-green-100 cursor-pointer"><MessageCircle size={16} /></button>}
                           {selectedLead.email && <button onClick={() => window.location.href = `mailto:${selectedLead.email}`} className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 border border-amber-100 cursor-pointer"><Mail size={16} /></button>}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-left">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                              <p className="text-xs font-bold text-slate-800">{selectedLead.phone || 'N/A'}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                              <p className="text-xs font-bold text-slate-800 truncate">{selectedLead.email || 'N/A'}</p>
                           </div>
                        </div>
                     </div>

                     {/* Property & Message */}
                     <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Enquiry Details</h4>
                        {selectedLead.property_title && (
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-[9px] font-black text-[#004F31] uppercase tracking-widest mb-1">Interested In</p>
                              <p className="text-xs font-bold text-slate-800">{selectedLead.property_title}</p>
                           </div>
                        )}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Message</p>
                           <p className="text-xs font-semibold text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedLead.message || 'No specific message.'}</p>
                        </div>
                     </div>

                     {/* Action Controls */}
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Pipeline Controls</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Change Stage</label>
                              <select 
                                 value={selectedLead.stage || 'new'} 
                                 onChange={(e) => updateStage(selectedLead.id, e.target.value)}
                                 className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#004F31]/20 cursor-pointer text-slate-700"
                              >
                                 {KANBAN_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                              </select>
                           </div>
                           <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Set Follow-up</label>
                              <div className="flex">
                                 <input 
                                    type="date" 
                                    value={followUpDate} 
                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-l-xl px-2 py-1.5 text-[10px] font-bold outline-none focus:ring-2 focus:ring-[#004F31]/20 text-slate-700"
                                 />
                                 <button onClick={updateFollowUp} className="bg-[#004F31] text-white px-2.5 rounded-r-xl hover:bg-[#003420] transition-colors cursor-pointer flex items-center justify-center"><Check size={14} /></button>
                              </div>
                           </div>
                        </div>

                        {selectedLead.stage !== 'won' && selectedLead.stage !== 'lost' && (
                           <div className="flex gap-3 pt-2">
                              <button onClick={() => updateStage(selectedLead.id, 'won')} className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-black py-2.5 rounded-xl text-2xs uppercase tracking-widest flex items-center justify-center gap-1.5 border border-green-200 cursor-pointer transition-colors"><Check size={12} /> Mark Won</button>
                              <button onClick={() => updateStage(selectedLead.id, 'lost')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-black py-2.5 rounded-xl text-2xs uppercase tracking-widest flex items-center justify-center gap-1.5 border border-red-200 cursor-pointer transition-colors"><X size={12} /> Mark Lost</button>
                           </div>
                        )}
                     </div>

                     {/* Notes */}
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Notes & Activity</h4>
                        {selectedLead.notes && (
                           <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 text-xs font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {selectedLead.notes}
                           </div>
                        )}
                        <div className="relative">
                           <textarea 
                              rows={3} 
                              placeholder="Add a note about this lead..." 
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#004F31]/20 text-slate-800 resize-none pb-12 placeholder-slate-400"
                           />
                           <button 
                              onClick={addNote}
                              disabled={!noteText.trim() || isSavingNote}
                              className="absolute bottom-3 right-3 bg-[#004F31] hover:bg-[#003420] text-white rounded-lg px-3 py-1.5 text-2xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                           >
                              {isSavingNote ? 'Saving...' : 'Add Note'}
                           </button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>

      {/* ADD LEAD MODAL */}
      <AnimatePresence>
         {showAddModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white max-w-md w-full rounded-[24px] shadow-2xl overflow-hidden text-left border border-slate-100">
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                     <h3 className="font-black tracking-tight text-slate-900 text-lg font-display">Add Lead Manually</h3>
                     <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
                  </div>
                  <div className="p-6 space-y-4">
                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Name</label>
                        <input type="text" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#004F31]/20 text-slate-800" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Phone</label>
                           <input type="tel" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#004F31]/20 text-slate-800" />
                        </div>
                        <div>
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Email</label>
                           <input type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#004F31]/20 text-slate-800" />
                        </div>
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Property Interested In</label>
                        <input type="text" placeholder="e.g. House in Colombo 07" value={newLead.property_title} onChange={e => setNewLead({...newLead, property_title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#004F31]/20 text-slate-800" />
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Stage</label>
                        <select value={newLead.stage} onChange={e => setNewLead({...newLead, stage: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#004F31]/20 text-slate-800 cursor-pointer">
                           {KANBAN_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                     </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                     <button onClick={() => setShowAddModal(false)} className="px-5 py-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-200 rounded-xl cursor-pointer">Cancel</button>
                     <button onClick={handleAddLead} className="px-5 py-2 bg-[#004F31] hover:bg-[#003420] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md cursor-pointer transition-all active:scale-95">Add Lead</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
