import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Download, TrendingUp, HelpCircle, FileText, ArrowUpRight } from 'lucide-react';
import { MOCK_PRICE_HISTORY } from './types';

const SUPPLY_DEMAND_DATA = [
  { district: 'Colombo', listings: 1245, searches: 1540 },
  { district: 'Gampaha', listings: 850, searches: 1120 },
  { district: 'Kandy', listings: 420, searches: 490 },
  { district: 'Galle', listings: 310, searches: 305 },
  { district: 'Kalutara', listings: 320, searches: 240 },
  { district: 'Kurunegala', listings: 250, searches: 195 }
];

const INVESTMENT_DISTRICTS = [
  { rank: 1, name: 'Gampaha', score: 94, reason: 'High MoM price surge (+12%), proximity to highways', yield: '6.4% yield' },
  { rank: 2, name: 'Colombo', score: 92, reason: 'Stable premium demand, rapid commercial absorption', yield: '5.8% yield' },
  { rank: 3, name: 'Kandy', score: 85, reason: 'Tourism recovery boosting short-term villa rentals', yield: '7.1% yield' },
  { rank: 4, name: 'Galle', score: 82, reason: 'Beachside tourism developments, foreign investment', yield: '6.8% yield' },
  { rank: 5, name: 'Kurunegala', score: 79, reason: 'Central expressways intersection, industrial growth', yield: '5.2% yield' }
];

export default function MarketInsights() {
  
  // Custom CSV / TXT download trigger
  const handleDownloadReport = () => {
    const reportText = `LANKAPROPERTY.LK ADMIN DASHBOARD
=============================================
MAPS & MARKET INTELLIGENCE REPORT
Generated: ${new Date().toLocaleDateString()}
=============================================

1. TOP INVESTMENT DISTRICTS (RANKED BY INVESTMENT SCORE)
-------------------------------------------------------
${INVESTMENT_DISTRICTS.map(d => `${d.rank}. ${d.name} (Score: ${d.score}/100)
   - Yield: ${d.yield}
   - Drivers: ${d.reason}`).join('\n\n')}

2. DISTRICT INVENTORY VS VISITOR SEARCH DEMAND
-------------------------------------------------------
Colombo: 1245 listings | 1540 search inquiries (Demand > Supply)
Gampaha: 850 listings | 1120 search inquiries (Demand > Supply)
Kandy: 420 listings | 490 search inquiries (Demand > Supply)
Galle: 310 listings | 305 search inquiries
Kalutara: 320 listings | 240 search inquiries

3. ISLAND-WIDE 12-MONTH PRICE MOMENTUM (LKR)
-------------------------------------------------------
- Land Average: Rs. 885,000 / perch
- House Average: Rs. 11,100,000
- Apartment Average: Rs. 16,000,000

=============================================
END OF AUTOMATED GIS TELEMETRY REPORT
LankaProperty.lk Analytics Portal.`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LankaProperty_Market_Intelligence_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            📈 Advanced Market Insights & ROI Tracker
          </h2>
          <p className="text-xs font-semibold text-gray-500 mt-1 leading-none">
            Deep comparative analysis of real-time supply inventory versus user search telemetry
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="bg-white border-2 border-gray-200 text-gray-700 hover:text-[#004F31] hover:border-[#004F31] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Download size={14} /> Download Market Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1: SUPPLY VS DEMAND */}
        <div className="lg:col-span-4 bg-gray-50/50 p-5 rounded-3xl border border-gray-100 flex flex-col justify-between h-[360px]">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Comparative Velocity</span>
            <h3 className="font-black text-gray-950 text-sm mb-4">Supply (Listings) vs Demand (Searches)</h3>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUPPLY_DEMAND_DATA} margin={{ left: -20, bottom: -5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="district" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, fontWeight: 700 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 700 }} />
                <Bar dataKey="listings" fill="#004F31" radius={[4, 4, 0, 0]} name="Active Listings" />
                <Bar dataKey="searches" fill="#F59E0B" radius={[4, 4, 0, 0]} name="User Searches" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: PRICE MOMENTUM LINE CHART */}
        <div className="lg:col-span-4 bg-gray-50/50 p-5 rounded-3xl border border-gray-100 flex flex-col justify-between h-[360px]">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Historical Momentum</span>
            <h3 className="font-black text-gray-950 text-sm mb-4">12-Month Price Trend Index</h3>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_PRICE_HISTORY} margin={{ left: -20, bottom: -5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, fontWeight: 700 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 700 }} />
                <Line type="monotone" dataKey="land" stroke="#004F31" strokeWidth={3} dot={false} name="Land (/perch)" />
                <Line type="monotone" dataKey="houses" stroke="#3B82F6" strokeWidth={3} dot={false} name="Houses" />
                <Line type="monotone" dataKey="apartments" stroke="#8B5CF6" strokeWidth={3} dot={false} name="Apartments" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LIST 3: TOP INVESTMENT DISTRICTS */}
        <div className="lg:col-span-4 bg-gray-50 p-5 rounded-3xl border border-gray-100 flex flex-col justify-between h-[360px]">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">ROI Scorecard</span>
            <h3 className="font-black text-gray-950 text-sm mb-4 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-[#004F31]" /> Top Investment Districts
            </h3>
            
            <div className="space-y-3">
              {INVESTMENT_DISTRICTS.map((dist, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100">
                  <div className="w-6 h-6 bg-[#004F31]/10 text-[#004F31] rounded-lg font-black text-xs flex items-center justify-center">
                    {dist.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-black text-xs text-gray-950 truncate">{dist.name}</span>
                      <span className="text-[10px] font-black text-emerald-600">{dist.yield}</span>
                    </div>
                    <p className="text-[9px] font-semibold text-gray-400 truncate leading-tight mt-0.5">{dist.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">{dist.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200/50 pt-4 flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
            <span>Powered by LankaProperty GIS</span>
            <span className="text-[#004F31] hover:underline flex items-center gap-0.5 cursor-pointer">Learn More <ArrowUpRight size={10} /></span>
          </div>
        </div>

      </div>
    </div>
  );
}
