import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Kanban, Phone, Mail, MessageCircle, Calendar, Plus, 
  Search, Check, X, FileText, Loader2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'new', label: '🆕 NEW', color: 'border-blue-500', bg: 'bg-blue-50' },
  { id: 'contacted', label: '📞 CONTACTED', color: 'border-yellow-500', bg: 'bg-yellow-50' },
  { id: 'viewing', label: '🏠 VIEWING SCHEDULED', color: 'border-purple-500', bg: 'bg-purple-50' },
  { id: 'negotiating', label: '🤝 NEGOTIATING', color: 'border-orange-500', bg: 'bg-orange-50' },
  { id: 'closed', label: '✅/❌ CLOSED', color: 'border-green-500', bg: 'bg-green-50' }, // merged won/lost visually or custom handling
];

// Split the closed stage visually or handle it separately when displaying in column
const KANBAN_COLUMNS = [
  { id: 'new', label: '🆕 NEW', color: '#3b82f6', bg: 'bg-blue-50' },
  { id: 'contacted', label: '📞 CONTACTED', color: '#eab308', bg: 'bg-yellow-50' },
  { id: 'viewing', label: '🏠 VIEWING SCHEDULED', color: '#a855f7', bg: 'bg-purple-50' },
  { id: 'negotiating', label: '🤝 NEGOTIATING', color: '#f97316', bg: 'bg-orange-50' },
  { id: 'won', label: '✅ WON', color: '#22c55e', bg: 'bg-green-50' },
  { id: 'lost', label: '❌ LOST', color: '#ef4444', bg: 'bg-red-50' },
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

  const getStageColor = (stage: string) => KANBAN_COLUMNS.find(c => c.id === stage)?.color || '#3b82f6';

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
    <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <Kanban className="text-indigo-600" /> Lead Pipeline
          </h2>
          <p className="text-gray-500 font-medium">Manage and track all property enquiries from one place.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button onClick={() => setViewMode('kanban')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500'}`}>Board</button>
             <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500'}`}>List</button>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all">
             <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
         <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Total Leads</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalLeads}</p>
         </div>
         <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-black tracking-widest text-blue-500 uppercase">New Today</p>
            <p className="text-2xl font-black text-blue-700 mt-1">{newToday}</p>
         </div>
         <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-black tracking-widest text-yellow-600 uppercase">Contacted</p>
            <p className="text-2xl font-black text-yellow-700 mt-1">{contactedCount}</p>
         </div>
         <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-black tracking-widest text-purple-500 uppercase">Viewing</p>
            <p className="text-2xl font-black text-purple-700 mt-1">{viewingCount}</p>
         </div>
         <div className="bg-green-50 p-4 rounded-2xl border border-green-100 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-black tracking-widest text-green-600 uppercase">Closed Won</p>
            <p className="text-2xl font-black text-green-700 mt-1">{wonCount}</p>
         </div>
      </div>

      {loading ? (
         <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
      ) : viewMode === 'kanban' ? (
         <div className="flex gap-4 overflow-x-auto pb-4 snap-x pr-8 min-h-[600px] items-start">
            {KANBAN_COLUMNS.map(col => (
               <div 
                  key={col.id} 
                  className={`flex-none w-[320px] rounded-[24px] ${col.bg} border-t-4 p-4 snap-center`}
                  style={{ borderTopColor: col.color }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
               >
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-black text-sm text-gray-800">{col.label}</h3>
                     <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {filteredLeads.filter(l => (l.stage || 'new') === col.id).length}
                     </span>
                  </div>
                  
                  <div className="space-y-3 min-h-[100px]">
                     {filteredLeads.filter(l => (l.stage || 'new') === col.id).map(lead => (
                        <div 
                           key={lead.id} 
                           draggable
                           onDragStart={(e) => handleDragStart(e, lead.id)}
                           onClick={() => setSelectedLead(lead)}
                           className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300 transition-all group"
                           style={{ borderLeftWidth: '4px', borderLeftColor: col.color }}
                        >
                           <div className="flex justify-between items-start mb-2">
                             <p className="font-bold text-gray-900 text-sm truncate pr-2">{lead.name || 'Unknown'}</p>
                             <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap bg-gray-50 px-1.5 py-0.5 rounded">{new Date(lead.created_at).toLocaleDateString()}</span>
                           </div>
                           
                           {lead.property_title && (
                             <p className="text-xs text-gray-500 font-medium line-clamp-1 mb-3 flex items-center gap-1">
                               <Kanban size={12} /> {lead.property_title}
                             </p>
                           )}

                           <div className="flex items-center gap-2 text-xs">
                             <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-md"><Phone size={14} /></button>
                             {lead.phone && <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`); }} className="p-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-md"><MessageCircle size={14} /></button>}
                             {lead.email && <button onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${lead.email}`; }} className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-md"><Mail size={14} /></button>}
                           </div>

                           {lead.follow_up_date && new Date(lead.follow_up_date) >= new Date(new Date().setHours(0,0,0,0)) && (
                             <div className="mt-3 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1">
                               <Calendar size={10} /> Follow-up: {new Date(lead.follow_up_date).toLocaleDateString()}
                             </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      ) : (
         <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                        <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                        <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Property</th>
                        <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Stage</th>
                        <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {filteredLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                           <td className="py-4 px-6">
                              <p className="font-bold text-gray-900 text-sm">{lead.name || 'Unknown'}</p>
                           </td>
                           <td className="py-4 px-6">
                              <p className="text-xs text-gray-600 font-medium">{lead.phone || '-'}</p>
                              <p className="text-[11px] text-gray-400">{lead.email}</p>
                           </td>
                           <td className="py-4 px-6 max-w-[200px]">
                              <p className="text-xs text-gray-700 truncate font-medium">{lead.property_title || '-'}</p>
                           </td>
                           <td className="py-4 px-6">
                              <select 
                                 value={lead.stage || 'new'} 
                                 onChange={(e) => { e.stopPropagation(); updateStage(lead.id, e.target.value); }}
                                 onClick={(e) => e.stopPropagation()}
                                 className="text-xs font-bold rounded-lg px-2 py-1 border-none bg-gray-100 outline-none"
                              >
                                 {KANBAN_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label.replace(/[^A-Za-z ]/g, '')}</option>)}
                              </select>
                           </td>
                           <td className="py-4 px-6 text-xs text-gray-500 font-medium">{new Date(lead.created_at).toLocaleDateString()}</td>
                           <td className="py-4 px-6 text-right">
                              <button onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">View</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {filteredLeads.length === 0 && <div className="p-8 text-center text-gray-500 font-bold text-sm">No leads found.</div>}
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
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
               />
               <motion.div 
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col border-l border-gray-100"
               >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                     <h3 className="font-black text-xl text-gray-900">Lead Details</h3>
                     <button onClick={() => setSelectedLead(null)} className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-500 shadow-sm transition-all"><X size={18} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                     {/* Contact Info */}
                     <div className="bg-white border text-center border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-3">
                           {(selectedLead.name || 'U')[0].toUpperCase()}
                        </div>
                        <h4 className="font-black text-xl text-gray-900">{selectedLead.name || 'Unknown User'}</h4>
                        <p className="text-sm font-medium text-gray-500 mt-1">{selectedLead.source === 'manual' ? 'Added Manually' : 'Via Website Enquiry'}</p>
                        
                        <div className="flex justify-center gap-3 mt-4">
                           <button onClick={() => window.open(`tel:${selectedLead.phone}`)} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"><Phone size={18} /></button>
                           {selectedLead.phone && <button onClick={() => window.open(`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`)} className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100"><MessageCircle size={18} /></button>}
                           {selectedLead.email && <button onClick={() => window.location.href = `mailto:${selectedLead.email}`} className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100"><Mail size={18} /></button>}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-left">
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                              <p className="text-sm font-bold text-gray-900">{selectedLead.phone || 'N/A'}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                              <p className="text-sm font-bold text-gray-900 truncate">{selectedLead.email || 'N/A'}</p>
                           </div>
                        </div>
                     </div>

                     {/* Property & Message */}
                     <div className="space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Enquiry Details</h4>
                        {selectedLead.property_title && (
                           <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Interested In</p>
                              <p className="text-sm font-bold text-gray-900">{selectedLead.property_title}</p>
                           </div>
                        )}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Message</p>
                           <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap">{selectedLead.message || 'No specific message.'}</p>
                        </div>
                     </div>

                     {/* Action Controls */}
                     <div className="space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Pipeline Controls</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Change Stage</label>
                              <select 
                                 value={selectedLead.stage || 'new'} 
                                 onChange={(e) => updateStage(selectedLead.id, e.target.value)}
                                 className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500"
                              >
                                 {KANBAN_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                              </select>
                           </div>
                           <div>
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Set Follow-up</label>
                              <div className="flex">
                                 <input 
                                    type="date" 
                                    value={followUpDate} 
                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-l-lg px-3 py-2 text-xs font-bold outline-none"
                                 />
                                 <button onClick={updateFollowUp} className="bg-indigo-600 text-white px-2 rounded-r-lg hover:bg-indigo-700"><Check size={14} /></button>
                              </div>
                           </div>
                        </div>

                        {selectedLead.stage !== 'won' && selectedLead.stage !== 'lost' && (
                           <div className="flex gap-3 pt-2">
                              <button onClick={() => updateStage(selectedLead.id, 'won')} className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-black py-2.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-green-200"><Check size={14} /> Mark Won</button>
                              <button onClick={() => updateStage(selectedLead.id, 'lost')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-black py-2.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-red-200"><X size={14} /> Mark Lost</button>
                           </div>
                        )}
                     </div>

                     {/* Notes */}
                     <div className="space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Notes & Activity</h4>
                        {selectedLead.notes && (
                           <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 text-sm font-medium text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {selectedLead.notes}
                           </div>
                        )}
                        <div className="relative">
                           <textarea 
                              rows={3} 
                              placeholder="Add a note about this lead..." 
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 resize-none pb-12"
                           />
                           <button 
                              onClick={addNote}
                              disabled={!noteText.trim() || isSavingNote}
                              className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
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
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white max-w-md w-full rounded-[24px] shadow-2xl overflow-hidden text-left">
                  <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <h3 className="font-black tracking-tight text-gray-900 text-lg">Add Lead Manually</h3>
                     <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  </div>
                  <div className="p-6 space-y-4">
                     <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Name</label>
                        <input type="text" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Phone</label>
                           <input type="tel" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Email</label>
                           <input type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500" />
                        </div>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Property Interested In</label>
                        <input type="text" placeholder="e.g. House in Colombo 07" value={newLead.property_title} onChange={e => setNewLead({...newLead, property_title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500" />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Stage</label>
                        <select value={newLead.stage} onChange={e => setNewLead({...newLead, stage: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500">
                           {KANBAN_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                     </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 mt-2">
                     <button onClick={() => setShowAddModal(false)} className="px-5 py-2 font-bold text-gray-500 hover:bg-gray-200 rounded-xl">Cancel</button>
                     <button onClick={handleAddLead} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md">Add Lead</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
