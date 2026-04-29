import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Calendar, Phone, Mail, ChevronRight, User, Clock, Trash2, CheckCircle } from 'lucide-react';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyTitle: string;
  message: string;
  date: string;
  status: 'new' | 'contacted' | 'closed';
}

const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: '1',
    name: 'Kasun Wijesinghe',
    email: 'kasun.w@gmail.com',
    phone: '077 123 4567',
    propertyTitle: 'Modern Villa in Rajagiriya',
    message: 'I am interested in viewing this property this weekend. Is it still available?',
    date: 'Oct 24, 2023 • 10:30 AM',
    status: 'new'
  },
  {
    id: '2',
    name: 'Sanduni Perera',
    email: 'sanduni.p@outlook.com',
    phone: '071 987 6543',
    propertyTitle: 'Luxury Apartment Colombo 03',
    message: 'Could you please send me the floor plans and some more photos of the kitchen area?',
    date: 'Oct 23, 2023 • 02:15 PM',
    status: 'contacted'
  },
  {
    id: '3',
    name: 'Malik Ahmed',
    email: 'malik.ahmed@yahoo.com',
    phone: '076 555 4444',
    propertyTitle: 'Cinnamon Gardens Estate',
    message: 'Is the price negotiable? I would like to make an offer.',
    date: 'Oct 22, 2023 • 09:00 AM',
    status: 'closed'
  }
];

export default function CustomerInquiries() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-brand-dark-blue text-white py-16 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-brand-green rounded-2xl flex items-center justify-center text-white">
                <MessageSquare size={24} />
              </div>
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                12 New Leads
              </span>
            </div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black mb-2"
            >
              Customer Inquiries
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-blue-100 text-lg"
            >
              Manage and respond to your incoming property leads.
            </motion.p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-sm uppercase tracking-widest border border-white/10">
              Export CSV
            </button>
            <button className="px-6 py-3 bg-brand-green text-white rounded-xl font-bold hover:bg-opacity-90 transition-all text-sm uppercase tracking-widest shadow-lg shadow-brand-green/20">
              Refresh Leads
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Inquiries', value: '48', color: 'text-brand-dark-blue', bg: 'bg-white' },
            { label: 'Pending Response', value: '12', color: 'text-brand-green', bg: 'bg-white' },
            { label: 'Conversion Rate', value: '18%', color: 'text-blue-600', bg: 'bg-white' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-6 rounded-3xl shadow-lg border border-gray-100`}>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Inquiry List */}
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center text-sm font-bold bg-gray-50/50">
            <div className="flex gap-8">
              <button className="text-brand-green border-b-2 border-brand-green pb-1">All Leads</button>
              <button className="text-gray-400 hover:text-dark-navy">Unread</button>
              <button className="text-gray-400 hover:text-dark-navy">Following Up</button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-50">
            {MOCK_INQUIRIES.map((inquiry, idx) => (
              <motion.div 
                key={inquiry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 hover:bg-gray-50/80 transition-all group flex flex-col md:flex-row gap-6"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      inquiry.status === 'new' ? 'bg-brand-green/10 text-brand-green' :
                      inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {inquiry.status}
                    </span>
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                      <Clock size={14} />
                      {inquiry.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-dark-navy mb-1 group-hover:text-brand-green transition-colors flex items-center gap-2">
                    {inquiry.name} <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Inquiry for: <span className="text-brand-dark-blue">{inquiry.propertyTitle}</span>
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-2xl italic">
                    "{inquiry.message}"
                  </p>
                </div>

                <div className="md:w-64 flex flex-col justify-center space-y-3">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-all">
                      <Phone size={14} />
                    </div>
                    {inquiry.phone}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-all">
                      <Mail size={14} />
                    </div>
                    <span className="truncate">{inquiry.email}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 py-2.5 rounded-xl bg-brand-dark-blue text-white text-[10px] font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all shadow-md">
                      Reply
                    </button>
                    <button className="w-10 h-10 rounded-xl border border-gray-100 text-gray-400 flex items-center justify-center hover:bg-brand-red/10 hover:text-brand-red transition-all">
                      <Trash2 size={16} />
                    </button>
                    <button className="w-10 h-10 rounded-xl border border-gray-100 text-gray-400 flex items-center justify-center hover:bg-brand-green/10 hover:text-brand-green transition-all">
                      <CheckCircle size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="p-8 text-center bg-gray-50/30">
            <button className="text-brand-green font-black text-sm uppercase tracking-[0.2em] hover:underline">
              Load More Inquiries
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
