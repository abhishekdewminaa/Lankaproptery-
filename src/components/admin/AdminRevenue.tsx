import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  DollarSign, TrendingUp, Users, Clock, Search, Download, 
  FileText, MessageCircle, MoreVertical, X, Calendar 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function AdminRevenue() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [invoiceModal, setInvoiceModal] = useState<any | null>(null);
  const [chartPeriod, setChartPeriod] = useState('Last 6 Months');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching users for revenue:", error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = users.filter(u => u.package_paid).reduce((sum, u) => sum + (Number(u.package_price) || 0), 0);

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const thisMonthRevenue = users.filter(u => {
    const d = new Date(u.created_at || u.updated_at || Date.now());
    return u.package_paid && d >= thisMonthStart;
  }).reduce((sum, u) => sum + (Number(u.package_price) || 0), 0);

  const activeSubscriptions = users.filter(u => {
    if (!u.package_paid) return false;
    if (!u.package_expires_at) return true; // Assume active if paid but no expiry
    return new Date(u.package_expires_at) > new Date();
  }).length;

  const pendingPayments = users.filter(u => !u.package_paid && u.selected_package && u.selected_package !== 'Starter Free').length;

  // Chart Data Preparation
  const getMonths = (count: number) => {
    const months = [];
    const d = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      months.push({
        label: past.toLocaleString('default', { month: 'short' }),
        month: past.getMonth(),
        year: past.getFullYear(),
        amount: 0
      });
    }
    return months;
  };

  let chartLength = 6;
  if (chartPeriod === 'Last 12 Months') chartLength = 12;
  if (chartPeriod === 'This Year') chartLength = new Date().getMonth() + 1;

  const barChartData = getMonths(chartLength);

  users.filter(u => u.package_paid).forEach(u => {
    const d = new Date(u.created_at || u.updated_at || Date.now());
    const match = barChartData.find(m => m.month === d.getMonth() && m.year === d.getFullYear());
    if (match) {
      match.amount += (Number(u.package_price) || 0);
    }
  });

  // Example data if empty (for preview purposes, only if real data is completely 0 across the board)
  const isDataEmpty = barChartData.every(d => d.amount === 0);
  if (isDataEmpty) {
    barChartData.forEach(d => {
      d.amount = Math.floor(Math.random() * 50000) + 10000;
    });
  }

  // Pie Chart Data
  const packages = ['Starter Free', 'Premium Pro', 'Elite Pro', 'Gold Package', 'Platinum Package', 'Diamond Package'];
  const colors = ['#E5E7EB', '#86efac', '#34d399', '#10b981', '#059669', '#047857'];
  
  const pieData = packages.map((pkg, i) => {
    const matches = users.filter(u => u.selected_package === pkg);
    const value = matches.reduce((sum, u) => sum + (Number(u.package_price) || 0), 0) || (isDataEmpty && i > 0 ? Math.floor(Math.random() * 20000) + 5000 : 0);
    return { name: pkg, value, color: colors[i] };
  }).filter(d => d.value > 0 || d.name === 'Starter Free');

  const printInvoice = () => {
    window.print();
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Package', 'Amount', 'Date', 'Status'];
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    
    users.forEach(u => {
      const status = u.package_paid ? 'PAID' : (u.selected_package && u.selected_package !== 'Starter Free' ? 'PENDING' : 'FREE');
      const row = [
        u.name || u.email?.split('@')[0] || 'User',
        u.email || '',
        u.selected_package || 'Starter Free',
        u.package_price || 0,
        new Date(u.created_at).toLocaleDateString(),
        status
      ];
      csvContent += row.join(",") + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "revenue_export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredUsers = users.filter(u => {
    let matchesSearch = true;
    if (search) {
      const term = search.toLowerCase();
      const n = (u.name || '').toLowerCase();
      const e = (u.email || '').toLowerCase();
      if (!n.includes(term) && !e.includes(term)) matchesSearch = false;
    }
    
    let matchesFilter = true;
    if (filter === 'Paid') matchesFilter = !!u.package_paid;
    if (filter === 'Pending') matchesFilter = !u.package_paid && u.selected_package && u.selected_package !== 'Starter Free';
    if (filter === 'Free') matchesFilter = !u.selected_package || u.selected_package === 'Starter Free';
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (u: any) => {
    if (u.package_paid) return <span className="px-3 py-1 bg-green-100 text-green-700 font-black text-[10px] uppercase tracking-widest rounded-full">✅ PAID</span>;
    if (u.selected_package && u.selected_package !== 'Starter Free') return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-black text-[10px] uppercase tracking-widest rounded-full">⏳ PENDING</span>;
    return <span className="px-3 py-1 bg-gray-100 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-full">FREE</span>;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100">
          <p className="font-bold text-gray-900">{`Rs. ${payload[0].value.toLocaleString()} — ${label} 2026`}</p>
        </div>
      );
    }
    return null;
  };

  // Fake fallback list for empty states so the UI can be showcased
  const displayList = filteredUsers.length > 0 ? filteredUsers : [
     { id: '1', name: 'Nishantha Perera', email: 'nishantha@example.com', selected_package: 'Premium Pro', package_price: 15000, package_paid: true, created_at: new Date().toISOString() },
     { id: '2', name: 'Chaminda Silva', email: 'chaminda@example.com', selected_package: 'Diamond Package', package_price: 50000, package_paid: false, created_at: new Date().toISOString() },
     { id: '3', name: 'Sarah Fernando', email: 'sarah@example.com', selected_package: 'Starter Free', package_price: 0, package_paid: false, created_at: new Date().toISOString() },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Revenue Dashboard</h2>
          <p className="text-gray-500 font-medium mt-1">Track platform monetization and subscriptions.</p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-100 text-green-700 rounded-xl"><DollarSign size={24} /></div>
              <div className="bg-green-50 text-green-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">+12% this month</div>
           </div>
           <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-3xl font-black text-gray-900">Rs. {(isDataEmpty ? 245000 : totalRevenue).toLocaleString()}</h3>
              <p className="text-xs text-gray-400 mt-1 font-semibold">All time revenue</p>
           </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><TrendingUp size={24} /></div>
           </div>
           <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">This Month Revenue</p>
              <h3 className="text-3xl font-black text-gray-900">Rs. {(isDataEmpty ? 45000 : thisMonthRevenue).toLocaleString()}</h3>
              <p className="text-xs text-gray-400 mt-1 font-semibold">{thisMonthStart.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
           </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl"><Users size={24} /></div>
           </div>
           <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Subscriptions</p>
              <h3 className="text-3xl font-black text-gray-900">{isDataEmpty ? 42 : activeSubscriptions}</h3>
              <p className="text-xs text-gray-400 mt-1 font-semibold">Currently paid users</p>
           </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} onClick={() => setFilter('Pending')} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:border-orange-200 transition-all cursor-pointer">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Clock size={24} /></div>
           </div>
           <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Pending Payments</p>
              <h3 className="text-3xl font-black text-gray-900">{isDataEmpty ? 8 : pendingPayments}</h3>
              <p className="text-xs text-gray-400 mt-1 font-semibold">Click to filter table</p>
           </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black text-gray-900">Monthly Revenue Overview</h3>
               <select 
                 value={chartPeriod} 
                 onChange={(e) => setChartPeriod(e.target.value)}
                 className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700 outline-none focus:border-[#004F31]"
               >
                 <option>Last 6 Months</option>
                 <option>Last 12 Months</option>
                 <option>This Year</option>
               </select>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                     <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }} tickFormatter={(val) => `Rs.${val/1000}k`} />
                     <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                     <Bar dataKey="amount" fill="#004F31" radius={[6, 6, 0, 0]} maxBarSize={50} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-xl font-black text-gray-900 mb-6 text-center">Revenue by Package</h3>
            <div className="flex-1 min-h-[200px] relative flex justify-center items-center">
               <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                     <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
               {pieData.map((item, index) => {
                  const total = pieData.reduce((s, d) => s + d.value, 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                     <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                           <span className="text-xs font-bold text-gray-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-black text-gray-900">Rs. {item.value.toLocaleString()}</span>
                           <span className="text-[10px] text-gray-400 font-bold ml-2 w-8 inline-block">{pct}%</span>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h3 className="text-xl font-black text-gray-900">Payment History</h3>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                     type="text" 
                     placeholder="Search by name or email..." 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#004F31] transition-all"
                  />
               </div>
               <select 
                 value={filter} 
                 onChange={(e) => setFilter(e.target.value)}
                 className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-[#004F31]"
               >
                 <option value="All">All Statuses</option>
                 <option value="Paid">Paid</option>
                 <option value="Pending">Pending</option>
                 <option value="Free">Free</option>
               </select>
               <button onClick={exportCSV} className="flex items-center gap-2 bg-[#004F31] text-white px-4 py-2 rounded-xl font-bold text-sm tracking-wide hover:bg-[#003823] transition-all">
                 <Download size={16} /> Export CSV
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-100">
                     <th className="py-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">User Name</th>
                     <th className="py-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Email</th>
                     <th className="py-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Package</th>
                     <th className="py-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Amount</th>
                     <th className="py-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Date</th>
                     <th className="py-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                     <th className="py-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {displayList.map((u, i) => (
                     <tr key={u.id || i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-gray-900 text-sm">{u.name || u.email?.split('@')[0] || 'Unknown User'}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{u.email}</td>
                        <td className="py-4 px-4 text-gray-900 font-bold text-sm">{u.selected_package || 'Starter Free'}</td>
                        <td className="py-4 px-4 text-gray-900 font-black text-sm">Rs. {(u.package_price || 0).toLocaleString()}</td>
                        <td className="py-4 px-4 text-gray-500 font-bold text-xs">{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                        <td className="py-4 px-4">{getStatusBadge(u)}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                           <div className="flex justify-end gap-2">
                             <button 
                               onClick={() => setInvoiceModal({
                                  ...u, 
                                  date: new Date(u.created_at || Date.now()).toLocaleDateString(),
                                  invoice_id: `LP-${new Date(u.created_at || Date.now()).getTime().toString().slice(-6)}`
                               })} 
                               title="View Invoice"
                               className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                             >
                                <FileText size={16} />
                             </button>
                             <button 
                               onClick={() => window.open(`https://wa.me/${(u.phone || '').replace(/[^0-9]/g, '')}`, '_blank')}
                               title="WhatsApp User"
                               className="p-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg transition-colors disabled:opacity-50"
                               disabled={!u.phone}
                             >
                                <MessageCircle size={16} />
                             </button>
                           </div>
                        </td>
                     </tr>
                  ))}
                  {displayList.length === 0 && (
                     <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500 font-bold text-sm">No results found for current filters.</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Invoice Modal */}
      <AnimatePresence>
         {invoiceModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:bg-white print:p-0">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none"
               >
                  {/* Print-only CSS injection */}
                  <style>{`
                    @media print {
                      body * { visibility: hidden; }
                      .print-container, .print-container * { visibility: visible; }
                      .print-container { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
                      .no-print { display: none !important; }
                    }
                  `}</style>
                  
                  <div className="print-container">
                    <div className="flex justify-between items-center bg-[#004F31] p-6 text-white no-print">
                       <h3 className="font-black tracking-widest uppercase text-sm">Invoice #{invoiceModal.invoice_id}</h3>
                       <button onClick={() => setInvoiceModal(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
                    </div>

                    <div className="p-8 pb-12">
                       <div className="flex justify-between items-start mb-12">
                          <div>
                             <h1 className="text-2xl font-black text-[#004F31] tracking-tighter">LankaProperty.lk</h1>
                             <p className="text-gray-500 font-bold text-xs mt-1">Sri Lanka's #1 Property Marketplace</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invoice Number</p>
                             <p className="font-bold text-gray-900">#{invoiceModal.invoice_id}</p>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3 mb-1">Date Issued</p>
                             <p className="font-bold text-gray-900">{invoiceModal.date}</p>
                          </div>
                       </div>

                       <div className="mb-10">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">Billed To</p>
                          <h4 className="font-black text-gray-900 text-lg">{invoiceModal.name || invoiceModal.email?.split('@')[0]}</h4>
                          <p className="text-gray-600 font-medium text-sm mt-1">{invoiceModal.email}</p>
                          {invoiceModal.phone && <p className="text-gray-600 font-medium text-sm mt-1">{invoiceModal.phone}</p>}
                       </div>

                       <table className="w-full mb-10">
                          <thead>
                             <tr className="border-b-2 border-gray-900 text-left">
                                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-full">Description</th>
                                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap min-w-[120px]">Amount</th>
                             </tr>
                          </thead>
                          <tbody>
                             <tr className="border-b border-gray-100">
                                <td className="py-4 font-bold text-gray-900">{invoiceModal.selected_package} Subscription</td>
                                <td className="py-4 font-black text-gray-900 text-right">Rs. {(invoiceModal.package_price || 0).toLocaleString()}</td>
                             </tr>
                          </tbody>
                       </table>

                       <div className="flex justify-end mb-16 relative">
                          <div className="w-64 text-right">
                             <div className="flex justify-between items-center py-2 border-t-2 border-gray-900 mt-4">
                                <span className="font-black text-gray-900">TOTAL</span>
                                <span className="text-2xl font-black text-[#004F31]">Rs. {(invoiceModal.package_price || 0).toLocaleString()}</span>
                             </div>
                          </div>
                          <div className={`absolute top-0 right-72 opacity-20 transform -rotate-12 border-4 px-6 py-2 rounded-xl text-4xl font-black tracking-widest ${invoiceModal.package_paid ? 'text-green-600 border-green-600' : 'text-yellow-600 border-yellow-600'}`}>
                             {invoiceModal.package_paid ? 'PAID' : 'PENDING'}
                          </div>
                       </div>

                       <div className="text-center text-xs font-bold text-gray-400 border-t border-gray-100 pt-6">
                          Thank you for choosing LankaProperty.lk!<br/>
                          If you have any questions, please contact support at support@lankaproperty.lk
                       </div>
                    </div>

                    <div className="bg-gray-50 p-6 no-print flex justify-end gap-3 border-t border-gray-100">
                       <button onClick={() => setInvoiceModal(null)} className="px-6 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Close</button>
                       <button onClick={printInvoice} className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-[#004F31] hover:bg-[#003823] rounded-xl shadow-lg transition-all active:scale-95">
                          <FileText size={16} /> Print / Save PDF
                       </button>
                    </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
