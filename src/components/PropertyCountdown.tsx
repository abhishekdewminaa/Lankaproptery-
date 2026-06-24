import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface PropertyCountdownProps {
  id: any;
  compact?: boolean;
}

function getNumericSeed(id: any): number {
  if (typeof id === 'number') {
    return isNaN(id) ? 1 : id;
  }
  if (!id) return 1;
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export const PropertyCountdown: React.FC<PropertyCountdownProps> = ({ id, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Generate a stable expiry time for each property listing card
    const seed = getNumericSeed(id);
    const now = new Date();
    
    // Create a stable countdown window that repeats and matches the property ID
    // So the countdown is always stable across components and page reloads
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Give each property a different expiry hour cycle based on seed
    const hoursOffset = 12 + (seed * 19) % 36; // Range: 12h to 47h
    const expiryTime = new Date(startOfToday.getTime() + (hoursOffset * 60 * 60 * 1000));
    
    let targetTime = expiryTime;
    // If target has happened or is extremely close, add 36 hours to make sure it's always actively ticking
    if (targetTime.getTime() - now.getTime() < 1000 * 60 * 3) {
      targetTime = new Date(targetTime.getTime() + (36 * 60 * 60 * 1000));
    }

    const updateTimer = () => {
      const nowTime = new Date();
      const diff = targetTime.getTime() - nowTime.getTime();
      
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      const ss = s.toString().padStart(2, '0');
      
      setTimeLeft(`${hh}:${mm}:${ss}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [id]);

  if (!timeLeft) return null;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/90 hover:bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-md backdrop-blur-md border border-white/20 transition-all select-none">
        <Clock size={10} className="animate-pulse" />
        <span className="font-mono">ENDS {timeLeft}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-500/10 border border-white/10 transition-all transform hover:scale-105 select-none">
      <div className="relative flex items-center justify-center">
        <Clock size={12} className="relative z-10" />
        <span className="absolute inset-0 bg-white rounded-full scale-125 animate-ping opacity-30 pointer-events-none" />
      </div>
      <span className="font-mono leading-none pt-[1px]">{timeLeft} LEFT</span>
    </div>
  );
};
