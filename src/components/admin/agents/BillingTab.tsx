import React, { useState } from 'react';
import { Agent, AgentPayment, AgentProperty } from './types';
import { CreditCard, Shield, Clock, Sliders, Calendar, ChevronDown, Check, Download, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface BillingTabProps {
  agent: Agent;
  payments: AgentPayment[];
  properties: AgentProperty[];
  onUpdateAgent: (updated: Agent) => void;
  onAddPayment: (payment: AgentPayment) => void;
  adminDarkMode: boolean;
}

export default function BillingTab({
  agent,
  payments,
  properties,
  onUpdateAgent,
  onAddPayment,
  adminDarkMode
}: BillingTabProps) {
  const [selectedPlan, setSelectedPlan] = useState<Agent['package']>(agent.package);
  const [expiryDays, setExpiryDays] = useState('30');
  const [customExpiry, setCustomExpiry] = useState('');

  const agentPayments = payments.filter((p) => p.agent_id === agent.id);
  const agentProperties = properties.filter((p) => p.agent_id === agent.id);

  // Package thresholds
  const maxListingsMap = {
    Free: 3,
    Starter: 10,
    Professional: 25,
    Enterprise: 100
  };

  const currentMax = maxListingsMap[agent.package];
  const listingsUsed = agentProperties.length;
  const listingsPct = Math.min((listingsUsed / currentMax) * 100, 100);

  // Expiry Calculations
  const msLeft = new Date(agent.package_expiry).getTime() - new Date().getTime();
  const daysLeft = Math.max(Math.ceil(msLeft / (1000 * 60 * 60 * 24)), 0);
  const daysPct = Math.min((daysLeft / 90) * 100, 100); // Base 90 days as standard subscription length

  const handleSavePlan = () => {
    onUpdateAgent({
      ...agent,
      package: selectedPlan
    });
    toast.success(`Subscription updated to ${selectedPlan}!`);
  };

  const handleExtendExpiry = () => {
    const daysToAdd = parseInt(expiryDays);
    const currExpiry = new Date(agent.package_expiry);
    currExpiry.setDate(currExpiry.getDate() + daysToAdd);
    
    onUpdateAgent({
      ...agent,
      package_expiry: currExpiry.toISOString()
    });
    toast.success(`Expiry date extended by ${daysToAdd} days!`);
  };

  const handleSetCustomExpiry = () => {
    if (!customExpiry) return;
    onUpdateAgent({
      ...agent,
      package_expiry: new Date(customExpiry).toISOString()
    });
    toast.success(`Custom expiry date successfully applied!`);
  };

  const handleFreeUpgrade = () => {
    onUpdateAgent({
      ...agent,
      package: 'Enterprise',
      package_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year free
    });
    
    // Add payment entry representing free upgrade
    const mockPay: AgentPayment = {
      id: `pay-${Math.floor(Math.random() * 90000) + 10000}`,
      agent_id: agent.id,
      date: new Date().toISOString(),
      package: 'Enterprise',
      amount: 0,
      method: 'Admin Promotional Grant',
      order_id: `LP-FREE-${Date.now()}`,
      status: 'free'
    };
    onAddPayment(mockPay);
    toast.success('Agent upgraded to free promotional Enterprise plan for 1 Year!');
  };

  const handleCancelPlan = () => {
    if (window.confirm('Are you absolutely sure you want to cancel their paid subscription and downgrade them to the Free tier?')) {
      onUpdateAgent({
        ...agent,
        package: 'Free',
        package_expiry: new Date().toISOString()
      });
      toast.error('Paid plan canceled. Agent downgraded to Free.');
    }
  };

  const downloadInvoice = (pay: AgentPayment) => {
    toast.success(`Downloading Invoice ${pay.order_id}...`);
  };

  const getPackageBadgeColor = (p: Agent['package']) => {
    switch (p) {
      case 'Free': return 'bg-slate-100 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 border border-slate-300';
      case 'Starter': return 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200';
      case 'Professional': return 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200';
      case 'Enterprise': return 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200';
    }
  };

  const bgCard = adminDarkMode ? 'bg-[#1e1e2d] border-slate-800' : 'bg-white border-slate-100';
  const textPrimary = adminDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = adminDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Current Plan */}
        <div className={`border rounded-xl p-6 ${bgCard} shadow-sm space-y-6`}>
          <div>
            <h4 className={`text-xs font-black uppercase tracking-wider ${textSecondary} mb-4`}>
              Current Active Plan
            </h4>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black px-3 py-1.5 uppercase tracking-wider rounded-lg ${getPackageBadgeColor(agent.package)}`}>
                {agent.package} PLAN
              </span>
              <p className="text-xs text-slate-400">
                Started on {new Date(agent.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Days Left Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className={textSecondary}>Subscription Period:</span>
                <span className={textPrimary}>{daysLeft} days left</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600" style={{ width: `${daysPct}%` }} />
              </div>
              <p className="text-[10px] text-slate-400">
                Expires on: {new Date(agent.package_expiry).toLocaleString('en-LK', { dateStyle: 'medium' })}
              </p>
            </div>

            {/* Listings Limit Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className={textSecondary}>Max Listings Allowed:</span>
                <span className={textPrimary}>{listingsUsed} / {currentMax} Properties</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: `${listingsPct}%` }} />
              </div>
              <p className="text-[10px] text-slate-400">
                {listingsPct.toFixed(0)}% listings quota utilized
              </p>
            </div>

            {/* Financial Totals */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-700/10 pt-4 text-xs">
              <div>
                <span className={textSecondary}>Payment Status:</span>
                <p className="font-bold text-green-500 mt-0.5 flex items-center gap-0.5">
                  <Check size={14} className="stroke-[3]" /> PAID
                </p>
              </div>
              <div>
                <span className={textSecondary}>Latest Order ID:</span>
                <p className={`font-mono font-bold ${textPrimary} mt-0.5 truncate`}>
                  {agentPayments[0]?.order_id || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Admin Package Controls */}
        <div className={`border rounded-xl p-6 ${bgCard} shadow-sm space-y-6`}>
          <h4 className={`text-xs font-black uppercase tracking-wider ${textSecondary} flex items-center gap-1.5`}>
            <Sliders size={14} className="text-[#004F31]" /> ADMIN SUBSCRIPTION CONTROLS
          </h4>

          <div className="space-y-4 text-xs">
            {/* Change Plan */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className={`block font-bold ${textSecondary} mb-1.5`}>Change Active Plan:</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="Free" className="bg-white dark:bg-slate-900">Free Tier</option>
                  <option value="Starter" className="bg-white dark:bg-slate-900">Starter Tier</option>
                  <option value="Professional" className="bg-white dark:bg-slate-900">Professional Tier</option>
                  <option value="Enterprise" className="bg-white dark:bg-slate-900">Enterprise Tier</option>
                </select>
              </div>
              <button
                onClick={handleSavePlan}
                className="py-2 px-4 bg-[#004F31] hover:bg-[#003B24] text-white font-bold rounded-lg transition-colors shadow-xs shrink-0 self-end"
              >
                Save
              </button>
            </div>

            {/* Extend Expiry */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className={`block font-bold ${textSecondary} mb-1.5`}>Extend Expiry Period:</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="7" className="bg-white dark:bg-slate-900">+7 Days (Extra week)</option>
                  <option value="14" className="bg-white dark:bg-slate-900">+14 Days (Bi-weekly)</option>
                  <option value="30" className="bg-white dark:bg-slate-900">+30 Days (1 Month)</option>
                  <option value="60" className="bg-white dark:bg-slate-900">+60 Days (2 Months)</option>
                  <option value="90" className="bg-white dark:bg-slate-900">+90 Days (Quarterly)</option>
                </select>
              </div>
              <button
                onClick={handleExtendExpiry}
                className="py-2 px-4 bg-[#004F31] hover:bg-[#003B24] text-white font-bold rounded-lg transition-colors shadow-xs shrink-0 self-end"
              >
                Extend
              </button>
            </div>

            {/* Set Custom Expiry */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className={`block font-bold ${textSecondary} mb-1.5`}>Set Custom Expiry Date:</label>
                <input
                  type="date"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>
              <button
                onClick={handleSetCustomExpiry}
                className="py-2 px-4 bg-[#004F31] hover:bg-[#003B24] text-white font-bold rounded-lg transition-colors shadow-xs shrink-0 self-end"
                disabled={!customExpiry}
              >
                Set Date
              </button>
            </div>

            {/* Quick Promo Upgrade / Cancel Controls */}
            <div className="flex gap-2 pt-2 border-t border-slate-700/10">
              <button
                onClick={handleFreeUpgrade}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1"
              >
                <Star size={12} className="fill-white" /> Grant Free Upgrade
              </button>
              <button
                onClick={handleCancelPlan}
                className="flex-1 py-2 bg-red-600/15 text-red-600 border border-red-600/20 hover:bg-red-600/25 font-bold rounded-lg transition-colors"
              >
                Cancel Their Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className={`border rounded-xl p-6 ${bgCard} shadow-sm space-y-4`}>
        <h4 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>
          Payment History & Transaction Log
        </h4>

        {agentPayments.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No transactions found for this agent.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-700/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-400 border-b border-slate-700/10">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Plan / Description</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Order ID / Ref</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10">
                {agentPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/15 transition-colors">
                    <td className="p-3 text-slate-400">
                      {new Date(pay.date).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-200">
                      {pay.package} Subscription Plan
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {pay.amount === 0 ? 'FREE / UPGRADE' : `Rs. ${pay.amount.toLocaleString('en-LK')}`}
                    </td>
                    <td className="p-3 text-slate-500">{pay.method}</td>
                    <td className="p-3 font-mono text-slate-400">{pay.order_id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        pay.status === 'paid' ? 'bg-green-100 dark:bg-green-950/40 text-green-600 border border-green-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {pay.status === 'paid' ? '✅ PAID' : '⏳ PENDING'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => downloadInvoice(pay)}
                        className="py-1 px-2 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-semibold flex items-center gap-1 ml-auto text-slate-400"
                      >
                        <Download size={12} /> Invoice PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Total Paid Row */}
        <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 text-xs font-bold border border-slate-700/5">
          <span className={textSecondary}>Total revenue generated by {agent.name}:</span>
          <span className="text-emerald-600 dark:text-emerald-400 text-base font-black">
            Rs. {agent.total_paid.toLocaleString('en-LK')}
          </span>
        </div>
      </div>
    </div>
  );
}
