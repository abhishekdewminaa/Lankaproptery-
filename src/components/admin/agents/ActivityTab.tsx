import React, { useState } from 'react';
import { Agent, AgentActivityLog } from './types';
import { Download, Calendar, ArrowUpRight, Shield, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface ActivityTabProps {
  agent: Agent;
  logs: AgentActivityLog[];
  adminDarkMode: boolean;
}

export default function ActivityTab({
  agent,
  logs,
  adminDarkMode
}: ActivityTabProps) {
  const [filterType, setFilterType] = useState<'All' | AgentActivityLog['type']>('All');

  const agentLogs = logs.filter((l) => l.agent_id === agent.id);
  const filteredLogs = filterType === 'All'
    ? agentLogs
    : agentLogs.filter((l) => l.type === filterType);

  const getLogIcon = (type: AgentActivityLog['type']) => {
    switch (type) {
      case 'listings': return '🏠';
      case 'leads': return '📩';
      case 'payments': return '💳';
      case 'logins': return '🔑';
      case 'general': return '👤';
    }
  };

  const getLogColor = (type: AgentActivityLog['type']) => {
    switch (type) {
      case 'listings': return 'bg-blue-100 dark:bg-blue-950/40 text-blue-600';
      case 'leads': return 'bg-orange-100 dark:bg-orange-950/40 text-orange-600';
      case 'payments': return 'bg-green-100 dark:bg-green-950/40 text-green-600';
      case 'logins': return 'bg-purple-100 dark:bg-purple-950/40 text-purple-600';
      case 'general': return 'bg-slate-100 dark:bg-slate-950/40 text-slate-600';
    }
  };

  const handleExportLogs = () => {
    toast.success('Exporting activity logs...');
    const headers = 'ID,Date,Type,Action,Detail\n';
    const rows = filteredLogs.map((l) =>
      `"${l.id}","${new Date(l.created_at).toISOString()}","${l.type}","${l.action.replace(/"/g, '""')}","${l.detail.replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.name.replace(/\s+/g, '_')}_Activity_Logs.csv`;
    a.click();
  };

  const getTimeAgo = (dateStr: string) => {
    const elapsed = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(elapsed / (1000 * 60));
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 60) return `${mins} mins ago`;
    if (hrs < 24) return `${hrs} hours ago`;
    return `${days} days ago`;
  };

  const bgCard = adminDarkMode ? 'bg-[#1e1e2d] border-slate-800' : 'bg-white border-slate-100';
  const textPrimary = adminDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = adminDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className={`text-base font-bold ${textPrimary}`}>
            Everything this agent has done on the platform
          </h4>
          <p className="text-xs text-slate-400">Audit logs tracking login geography, listing updates, and subscription payments.</p>
        </div>
        <button
          onClick={handleExportLogs}
          className="py-1.5 px-3 bg-[#004F31] hover:bg-[#003B24] text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Download size={14} /> Export Activity Log
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold w-max max-w-full overflow-x-auto">
        {(['All', 'listings', 'leads', 'payments', 'logins', 'general'] as const).map((type) => {
          const count = type === 'All' ? agentLogs.length : agentLogs.filter((l) => l.type === type).length;
          const label = type === 'All' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1);
          const isActive = filterType === type;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`py-1.5 px-3 rounded-md transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#004F31] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#004F31]'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Timeline Feed */}
      {filteredLogs.length === 0 ? (
        <div className={`border rounded-xl p-8 text-center ${bgCard}`}>
          <p className="text-slate-500 italic text-xs">No activity log entries found matching this category.</p>
        </div>
      ) : (
        <div className={`border rounded-xl p-6 ${bgCard} shadow-sm space-y-6`}>
          <div className="relative border-l-2 border-[#004F31]/20 pl-6 ml-4 space-y-6">
            {filteredLogs.slice(0, 50).map((log) => (
              <div key={log.id} className="relative text-xs">
                {/* Visual Timeline Node */}
                <span className={`absolute -left-[37px] top-0 w-8 h-8 rounded-full border-4 border-white dark:border-[#1e1e2d] flex items-center justify-center text-sm shadow-sm ${getLogColor(log.type)}`}>
                  {getLogIcon(log.type)}
                </span>

                <div className="space-y-1 pl-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`font-bold ${textPrimary}`}>{log.action}</p>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{getTimeAgo(log.created_at)}</span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      ({new Date(log.created_at).toLocaleDateString()})
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-2xl bg-slate-50 dark:bg-slate-800/20 p-2 rounded border border-slate-700/5">
                    {log.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filteredLogs.length > 50 && (
            <p className="text-center text-xs text-slate-500 italic">Showing the last 50 events max.</p>
          )}
        </div>
      )}
    </div>
  );
}
