import React, { useState, useEffect } from 'react';
import { Plus, Play, Pause, Edit, Trash2, Clock, Zap, History, Settings, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Workflow } from './types';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export function WorkflowDashboard({ workflows, onNew, onEdit, onRefresh }: { workflows: Workflow[], onNew: () => void, onEdit: (wf: Workflow) => void, onRefresh: () => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
     fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase.from('workflow_logs').select('*').order('ran_at', { ascending: false }).limit(20);
      if (error && error.code !== '42P01') {
         console.error('Error fetching logs', error);
      } else {
         setLogs(data || []);
      }
    } catch (e) {} finally {
      setLoadingLogs(false);
    }
  };

  const toggleActive = async (wf: Workflow) => {
    if (!wf.id) return;
    try {
      const { error } = await supabase.from('workflows').update({ is_active: !wf.is_active }).eq('id', wf.id);
      if (error) throw error;
      toast.success(wf.is_active ? 'Workflow paused' : 'Workflow activated');
      onRefresh();
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
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || 'Error deleting workflow');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black text-gray-900 tracking-tight">Workflow Automations</h2>
           <p className="text-gray-500 font-medium mt-1 text-sm">Automate repetitive tasks, notifications, and property updates.</p>
        </div>
        <button onClick={onNew} className="flex items-center gap-2 px-6 py-3 bg-[#1B5E20] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#1B5E20]/20 hover:bg-[#2E7D32] transition-colors">
          <Plus size={18} /> New Workflow
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
               <Zap size={20} className="text-[#1B5E20]" /> My Workflows
            </h3>
         </div>
         <div className="divide-y divide-gray-100">
            {workflows.length > 0 ? workflows.map(wf => (
              <div key={wf.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                 <div>
                    <div className="flex items-center gap-3 mb-1">
                       <h4 className="text-xl font-black text-gray-900 leading-tight">{wf.name}</h4>
                       {wf.is_active ? (
                         <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-200 flex items-center gap-1">
                           <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Active
                         </span>
                       ) : (
                         <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-200 flex items-center gap-1">
                           <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Paused
                         </span>
                       )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">
                       <span className="flex items-center gap-1"><Clock size={12} /> {wf.last_run_at ? new Date(wf.last_run_at).toLocaleString() : 'Never run'}</span>
                       <span className="flex items-center gap-1"><Play size={12} /> {wf.run_count || 0} Runs</span>
                    </div>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => onEdit(wf)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors flex items-center gap-1">
                       <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => toggleActive(wf)} className={`px-4 py-2 ${wf.is_active ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-[#1B5E20]/10 text-[#1B5E20] hover:bg-[#1B5E20]/20'} text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors flex items-center gap-1`}>
                       {wf.is_active ? <Pause size={14} /> : <Play size={14} />} {wf.is_active ? 'Pause' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(wf)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors" title="Delete">
                       <Trash2 size={16} />
                    </button>
                 </div>
              </div>
            )) : (
              <div className="p-12 text-center">
                 <Zap className="mx-auto text-gray-300 mb-4" size={48} />
                 <h4 className="text-xl font-black text-gray-400 mb-2">No workflows created yet</h4>
                 <p className="text-gray-400 font-medium text-sm">Create your first automated workflow to save time.</p>
              </div>
            )}
         </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mt-8">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
               <History size={20} className="text-gray-500" /> Execution Logs
            </h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-[#f0f9f4]">
                  <tr>
                     <th className="px-6 py-4 text-[10px] font-black text-[#1B5E20] uppercase tracking-widest rounded-tl-2xl">Status</th>
                     <th className="px-6 py-4 text-[10px] font-black text-[#1B5E20] uppercase tracking-widest">Workflow ID</th>
                     <th className="px-6 py-4 text-[10px] font-black text-[#1B5E20] uppercase tracking-widest">Triggered By</th>
                     <th className="px-6 py-4 text-[10px] font-black text-[#1B5E20] uppercase tracking-widest">Duration</th>
                     <th className="px-6 py-4 text-[10px] font-black text-[#1B5E20] uppercase tracking-widest">Timestamp</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 bg-white">
                  {loadingLogs ? (
                    <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="animate-spin text-gray-400 mx-auto" /></td></tr>
                  ) : logs.length > 0 ? (
                    logs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-gray-50/50">
                         <td className="px-6 py-4">
                            {log.status === 'success' ? (
                               <span className="flex items-center gap-1.5 text-xs font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-lg w-fit"><CheckCircle size={14} /> Success</span>
                            ) : log.status === 'failed' ? (
                               <span className="flex items-center gap-1.5 text-xs font-black text-red-700 bg-red-50 px-2.5 py-1 rounded-lg w-fit"><XCircle size={14} /> Failed</span>
                            ) : (
                               <span className="flex items-center gap-1.5 text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg w-fit"><Loader2 size={14} className="animate-spin" /> Running</span>
                            )}
                         </td>
                         <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{log.workflow_id?.substring(0,8)}...</td>
                         <td className="px-6 py-4 text-xs font-bold text-gray-700">{log.triggered_by}</td>
                         <td className="px-6 py-4 text-xs font-bold text-gray-500">{log.duration_ms}ms</td>
                         <td className="px-6 py-4 text-xs font-bold text-gray-500">{new Date(log.ran_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                     <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-bold text-sm">No execution logs found</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
