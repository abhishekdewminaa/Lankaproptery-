import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Home, Search, Zap, Flame, DollarSign } from 'lucide-react';

const CountUp: React.FC<{ end: number; prefix?: string; suffix?: string; duration?: number }> = ({ 
  end, 
  prefix = "", 
  suffix = "", 
  duration = 1000 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

interface MapStatsProps {
  propertiesCount: number;
  searchesCount: number;
}

export default function MapStats({ propertiesCount, searchesCount }: MapStatsProps) {
  const cards = [
    {
      label: '📍 Districts Covered',
      value: <CountUp end={25} />,
      sub: 'Full island coverage',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      icon: <MapPin size={22} className="text-emerald-600" />
    },
    {
      label: '🏠 Properties on Map',
      value: <CountUp end={propertiesCount || 852} />,
      sub: 'Geo-tagged listings',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      icon: <Home size={22} className="text-blue-600" />
    },
    {
      label: '🔍 Map Searches Today',
      value: <CountUp end={searchesCount || 124} />,
      sub: 'Real-time searches',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      icon: <Search size={22} className="text-amber-600" />
    },
    {
      label: '⏱️ Avg Map Load Time',
      value: '< 2s',
      sub: 'Google Maps API speed',
      color: 'bg-teal-50 text-teal-600 border-teal-100',
      icon: <Zap size={22} className="text-teal-600" />
    },
    {
      label: '🌡️ Hottest District Today',
      value: 'Gampaha',
      sub: 'By search volume',
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      icon: <Flame size={22} className="text-rose-600" />
    },
    {
      label: '💰 Avg Price Per Perch',
      value: 'Rs. 850K',
      sub: 'Island-wide average',
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      icon: <DollarSign size={22} className="text-purple-600" />
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{card.label}</span>
            <div className={`p-2.5 rounded-xl border ${card.color.split(' ')[0]} ${card.color.split(' ')[2]}`}>
              {card.icon}
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 tracking-tight mb-1">
              {card.value}
            </div>
            <p className="text-xs font-semibold text-gray-500 leading-none">{card.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
