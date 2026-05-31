import React, { useState, useEffect } from 'react';
import { Plus, Play, Pause, Edit, Trash2, Clock, Zap, History, Settings, Loader2, CheckCircle, XCircle, Search, Folder, MoreVertical, Copy, Download } from 'lucide-react';
import { Workflow } from './types';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export function WorkflowDashboard({ onNew, onEdit }: { onNew: () => void, onEdit: (wf: Workflow) => void }) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('workflows').select('*').order('created_at', { ascending: false });
      if (error && error.code !== '42P01') throw error;
      setWorkflows(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (wf: Workflow) => {
    if (!wf.id) return;
    try {
      const { error } = await supabase.from('workflows').update({ is_active: !wf.is_active }).eq('id', wf.id);
      if (error) throw error;
      toast.success(wf.is_active ? 'Workflow paused' : 'Workflow activated');
      fetchWorkflows();
    } catch (e: any) {
      toast.error(e.message || 'Error updating workflow');
    }
  };

  const handleDelete = async (wf: Workflow) => {
    if (!wf.id || !confirm('Are you sure you want to delete this workflow?')) return;
    try {
      const { error } = await supabase.from('workflows').delete().eq('id', wf.id);
      if (error) throw error;
      toast.success('Workflow deleted');
      fetchWorkflows();
    } catch (e: any) {
      toast.error(e.message || 'Error deleting workflow');
    }
  };

  const stats = {
    active: workflows.filter(w => w.is_active).length,
    success: workflows.reduce((acc, w) => acc + (w.success_runs || 0), 0) || 1248, // mock data for UI
    failed: workflows.reduce((acc, w) => acc + (w.failed_runs || 0), 0) || 3, // mock data
    pending: 12 // mock data
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f172a] p-6 lg:p-8 flex gap-8">
      {/* Sidebar - Folders */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2">
        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest px-3 mb-2">Folders</h3>
        <button className="flex items-center gap-3 px-3 py-2 bg-blue-600/10 text-blue-400 rounded-lg text-sm font-medium w-full">
          <Folder size={16} /> All Workflows ({workflows.length})
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg text-sm font-medium w-full transition-colors">
          <Folder size={16} /> Social Media (2)
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg text-sm font-medium w-full transition-colors">
          <Folder size={16} /> Lead Management (2)
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg text-sm font-medium w-full transition-colors">
          <Folder size={16} /> Reporting (1)
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg text-sm font-medium w-full transition-colors">
          <Folder size={16} /> AI Automation (1)
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-white rounded-lg text-sm font-medium w-full mt-4 border border-dashed border-gray-700 hover:border-gray-500 transition-colors">
          <Plus size={16} /> New Folder
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-gray-800">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2"><Zap size={14} className="text-blue-500"/> Active</div>
            <div className="text-3xl font-black text-white">{stats.active}</div>
            <div className="text-gray-500 text-xs mt-1">workflows</div>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-gray-800">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Success</div>
            <div className="text-3xl font-black text-white">{stats.success.toLocaleString()}</div>
            <div className="text-gray-500 text-xs mt-1">this mo</div>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-gray-800">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2"><XCircle size={14} className="text-red-500"/> Failed</div>
            <div className="text-3xl font-black text-white">{stats.failed}</div>
            <div className="text-gray-500 text-xs mt-1">this mo</div>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-gray-800">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2"><Clock size={14} className="text-yellow-500"/> Pending</div>
            <div className="text-3xl font-black text-white">{stats.pending}</div>
            <div className="text-gray-500 text-xs mt-1">jobs</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1 max-w-lg">
             <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="Search workflows..." className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
             </div>
             <select className="bg-[#1e293b] border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500">
               <option>All Status</option>
               <option>Active</option>
               <option>Paused</option>
             </select>
          </div>
          <button onClick={onNew} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
            <Plus size={16} /> New Workflow
          </button>
        </div>

        {/* List */}
        <div className="bg-[#1e293b] rounded-2xl border border-gray-800 overflow-hidden flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0f172a]/50 text-gray-400 text-xs uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4 border-b border-gray-800">Name</th>
                <th className="px-6 py-4 border-b border-gray-800 w-32">Status</th>
                <th className="px-6 py-4 border-b border-gray-800">Trigger</th>
                <th className="px-6 py-4 border-b border-gray-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                 <tr><td colSpan={4} className="py-12 text-center text-gray-500"><Loader2 className="mx-auto animate-spin mb-2"/> Loading workflows...</td></tr>
              ) : workflows.length > 0 ? (
                workflows.map((wf) => (
                  <tr key={wf.id} className="hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base flex items-center gap-2">
                        {wf.name}
                        {wf.tags?.map(t => <span key={t} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-700 text-gray-300">#{t}</span>)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex gap-4">
                        <span>Updated: {wf.last_run_at ? new Date(wf.last_run_at).toLocaleDateString() : 'Never'}</span>
                        <span>Runs: {wf.run_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleActive(wf)} 
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors ${
                          wf.is_active 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${wf.is_active ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                        {wf.is_active ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        {wf.trigger_type === 'webhook' ? <span className="text-purple-400">🔗</span> : '⚡'} 
                        {wf.nodes?.[0]?.data?.label || 'Manual Trigger'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg tooltip-trigger" title="Run Now">
                          <Play size={16} />
                        </button>
                        <button onClick={() => onEdit(wf)} className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg" title="Duplicate">
                          <Copy size={16} />
                        </button>
                        <button onClick={() => handleDelete(wf)} className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={4} className="py-16 text-center text-gray-500 text-sm">
                      <Zap className="mx-auto mb-3 opacity-20" size={48} />
                      No workflows found. Create your first automation.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
