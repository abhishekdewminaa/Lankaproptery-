import React, { useState } from 'react';
import { Agent, AgentLead, AgentProperty } from './types';
import { Search, Filter, MessageSquare, Phone, Download, Check, ChevronDown, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeadsTabProps {
  agent: Agent;
  leads: AgentLead[];
  properties: AgentProperty[];
  onUpdateLeadStatus: (leadId: string, status: AgentLead['status']) => void;
  adminDarkMode: boolean;
}

export default function LeadsTab({
  agent,
  leads,
  properties,
  onUpdateLeadStatus,
  adminDarkMode
}: LeadsTabProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | 'New' | 'In Progress' | 'Won' | 'Lost'>('All');
  const [filterProperty, setFilterProperty] = useState<string>('All');
  const [selectedLeadMsg, setSelectedLeadMsg] = useState<AgentLead | null>(null);

  const agentLeads = leads.filter((l) => l.agent_id === agent.id);
  const agentProps = properties.filter((p) => p.agent_id === agent.id);

  // Filters mapping
  const filteredLeads = agentLeads.filter((l) => {
    // Property Filter
    if (filterProperty !== 'All' && l.property_id !== filterProperty) return false;

    // Status Filter
    if (filterStatus === 'New' && l.status !== 'New') return false;
    if (filterStatus === 'In Progress' && !['Contacted', 'Viewing', 'Negotiating'].includes(l.status)) return false;
    if (filterStatus === 'Won' && l.status !== 'Won') return false;
    if (filterStatus === 'Lost' && l.status !== 'Lost') return false;

    return true;
  });

  // KPI Calculations
  const totalCount = agentLeads.length;
  const newCount = agentLeads.filter((l) => l.status === 'New').length;
  const inProgressCount = agentLeads.filter((l) => ['Contacted', 'Viewing', 'Negotiating'].includes(l.status)).length;
  const wonCount = agentLeads.filter((l) => l.status === 'Won').length;
  const lostCount = agentLeads.filter((l) => l.status === 'Lost').length;

  const funnelSteps = [
    { label: 'New', count: agentLeads.filter((l) => l.status === 'New').length },
    { label: 'Contacted', count: agentLeads.filter((l) => l.status === 'Contacted').length },
    { label: 'Viewing', count: agentLeads.filter((l) => l.status === 'Viewing').length },
    { label: 'Negotiating', count: agentLeads.filter((l) => l.status === 'Negotiating').length },
    { label: 'Won', count: agentLeads.filter((l) => l.status === 'Won').length }
  ];

  const handleExportCSV = () => {
    toast.success('Generating leads CSV...');
    const headers = 'ID,Lead Name,Email,Phone,Property,Date,Status,Message\n';
    const rows = filteredLeads.map((l) => 
      `"${l.id}","${l.name}","${l.email}","${l.phone}","${l.property_title}","${new Date(l.created_at).toLocaleDateString()}","${l.status}","${l.message.replace(/"/g, '""')}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.name.replace(/\s+/g, '_')}_Leads_Report.csv`;
    a.click();
  };

  const getStatusColor = (status: AgentLead['status']) => {
    switch (status) {
      case 'New': return 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200';
      case 'Contacted': return 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200';
      case 'Viewing': return 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200';
      case 'Negotiating': return 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border border-yellow-200';
      case 'Won': return 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200';
      case 'Lost': return 'bg-slate-100 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border border-slate-200';
    }
  };

  const bgCard = adminDarkMode ? 'bg-[#1e1e2d] border-slate-800' : 'bg-white border-slate-100';
  const textPrimary = adminDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = adminDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className={`text-base font-bold ${textPrimary}`}>
            All buyer leads for {agent.name}'s listings
          </h4>
          <p className="text-xs text-slate-400">Manage, organize, and assign buyer enquiries in the CRM pipe.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="py-1.5 px-3 bg-[#004F31] hover:bg-[#003B24] text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Download size={14} /> Export Leads CSV
        </button>
      </div>

      {/* Stats row (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${bgCard} shadow-xs`}>
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Leads</p>
          <p className={`text-2xl font-black ${textPrimary} mt-1`}>{totalCount}</p>
        </div>
        <div className={`p-4 rounded-xl border ${bgCard} shadow-xs border-l-orange-500 border-l-4`}>
          <p className="text-xs text-orange-500 font-bold uppercase">New (Unread)</p>
          <p className={`text-2xl font-black ${textPrimary} mt-1`}>{newCount}</p>
        </div>
        <div className={`p-4 rounded-xl border ${bgCard} shadow-xs border-l-blue-500 border-l-4`}>
          <p className="text-xs text-blue-500 font-bold uppercase">In Progress</p>
          <p className={`text-2xl font-black ${textPrimary} mt-1`}>{inProgressCount}</p>
        </div>
        <div className={`p-4 rounded-xl border ${bgCard} shadow-xs border-l-green-500 border-l-4`}>
          <p className="text-xs text-green-500 font-bold uppercase">Won / Closed</p>
          <p className={`text-2xl font-black ${textPrimary} mt-1`}>{wonCount}</p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-700/5 text-xs">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-400">Status:</span>
          <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded">
            {(['All', 'New', 'In Progress', 'Won', 'Lost'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`py-1 px-2.5 rounded ${
                  filterStatus === st ? 'bg-[#004F31] text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="font-semibold text-slate-400">Filter by Property:</span>
          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="All" className="bg-white dark:bg-slate-900">All Properties</option>
            {agentProps.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900">
                {p.title.slice(0, 35)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CRM Funnel Mini Visualization */}
      <div className={`p-5 rounded-xl border ${bgCard} shadow-xs space-y-3`}>
        <h5 className={`text-xs font-black uppercase tracking-wider ${textPrimary}`}>
          Lead Conversion Funnel Overview
        </h5>
        <div className="grid grid-cols-5 gap-2 text-center">
          {funnelSteps.map((step, idx) => {
            const pct = totalCount > 0 ? (step.count / totalCount) * 100 : 0;
            return (
              <div key={idx} className="space-y-1">
                <p className={`text-[10px] font-bold ${textSecondary}`}>{step.label}</p>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#004F31]" style={{ width: `${pct}%` }} />
                </div>
                <p className={`text-xs font-black ${textPrimary}`}>{step.count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <div className={`border rounded-xl p-8 text-center ${bgCard}`}>
          <p className="text-slate-500 italic text-sm">No leads match the specified filter queries.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-700/10 shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-400 border-b border-slate-700/10">
              <tr>
                <th className="p-3 w-12">#</th>
                <th className="p-3">Lead Name</th>
                <th className="p-3">Property Inquiry</th>
                <th className="p-3">Phone / Contact</th>
                <th className="p-3">Message Snippet</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/10">
              {filteredLeads.map((ld, index) => (
                <tr key={ld.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className={`p-3 font-mono ${textSecondary}`}>{index + 1}</td>
                  <td className="p-3">
                    <p className={`font-bold ${textPrimary}`}>{ld.name}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{ld.email}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 max-w-xs">
                      {ld.property_image && (
                        <img src={ld.property_image} alt="" className="w-8 h-8 rounded object-cover shadow-xs shrink-0" referrerPolicy="no-referrer" />
                      )}
                      <span className={`font-medium ${textPrimary} truncate`} title={ld.property_title}>
                        {ld.property_title}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className={`font-mono font-semibold ${textPrimary}`}>{ld.phone}</p>
                    <div className="flex gap-2 mt-1">
                      <a
                        href={`tel:${ld.phone}`}
                        className="text-[#004F31] hover:underline"
                        title="Call Buyer"
                      >
                        📱 Call
                      </a>
                      <a
                        href={`https://wa.me/${ld.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-500 hover:underline flex items-center gap-0.5"
                      >
                        💬 Chat
                      </a>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className={`text-slate-500 max-w-[180px] truncate`} title={ld.message}>
                      {ld.message}
                    </p>
                    <button
                      onClick={() => setSelectedLeadMsg(ld)}
                      className="text-blue-500 hover:underline font-bold mt-0.5"
                    >
                      View Full
                    </button>
                  </td>
                  <td className={`p-3 text-slate-400 whitespace-nowrap`}>
                    {new Date(ld.created_at).toLocaleDateString('en-LK', { dateStyle: 'medium' })}
                  </td>
                  <td className="p-3">
                    <select
                      value={ld.status}
                      onChange={(e) => onUpdateLeadStatus(ld.id, e.target.value as any)}
                      className={`p-1 rounded text-[10px] font-bold outline-none ${getStatusColor(ld.status)}`}
                    >
                      <option value="New" className="bg-white text-slate-800">New</option>
                      <option value="Contacted" className="bg-white text-slate-800">Contacted</option>
                      <option value="Viewing" className="bg-white text-slate-800">Viewing</option>
                      <option value="Negotiating" className="bg-white text-slate-800">Negotiating</option>
                      <option value="Won" className="bg-white text-slate-800">Won</option>
                      <option value="Lost" className="bg-white text-slate-800">Lost</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <a
                        href={`https://wa.me/${ld.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(ld.name)},%20I%20am%20following%20up%20on%20your%20inquiry%20regarding%20${encodeURIComponent(ld.property_title)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                      >
                        Reply on WhatsApp
                      </a>
                      {ld.unread && (
                        <button
                          onClick={() => {
                            toast.success('Marked as read');
                          }}
                          className="py-1 px-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message View Modal Backdrop */}
      {selectedLeadMsg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-xl border p-6 ${bgCard} shadow-2xl space-y-4`}>
            <div className="flex justify-between items-center">
              <h4 className={`text-base font-bold ${textPrimary}`}>Buyer Inquiry Message</h4>
              <button onClick={() => setSelectedLeadMsg(null)} className="text-slate-400 hover:text-red-500 font-bold">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <p><span className={textSecondary}>Buyer: </span> <span className={`font-bold ${textPrimary}`}>{selectedLeadMsg.name}</span></p>
              <p><span className={textSecondary}>Email: </span> <span className={`font-bold ${textPrimary}`}>{selectedLeadMsg.email}</span></p>
              <p><span className={textSecondary}>Phone: </span> <span className={`font-bold ${textPrimary}`}>{selectedLeadMsg.phone}</span></p>
              <p><span className={textSecondary}>Property: </span> <span className={`font-bold ${textPrimary}`}>{selectedLeadMsg.property_title}</span></p>
              <p><span className={textSecondary}>Inquiry Date: </span> <span className={`font-bold ${textPrimary}`}>{new Date(selectedLeadMsg.created_at).toLocaleString()}</span></p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 border italic leading-relaxed">
              "{selectedLeadMsg.message}"
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedLeadMsg(null)}
                className="py-1.5 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-bold rounded"
              >
                Close Window
              </button>
              <a
                href={`https://wa.me/${selectedLeadMsg.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded"
              >
                Open Chat
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
