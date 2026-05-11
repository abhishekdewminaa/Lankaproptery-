import React from 'react';

const LOGOS = [
  'John Keells Properties',
  'Home Lands',
  'Blue Ocean',
  'Prime Group',
  'Fairway Holdings',
  'Softlogic Properties',
];

export const TrustedPartners: React.FC = () => {
  return (
    <section className="py-20 bg-[#F8FAF8] overflow-hidden border-t border-gray-100/50">
      <div className="container mx-auto px-6 text-center mb-12">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          TRUSTED BY SRI LANKA'S LEADING DEVELOPERS
        </h3>
      </div>

      <div className="relative flex overflow-hidden group">
        {/* First Set of Logos */}
        <div className="flex gap-20 py-4 animate-marquee-slow whitespace-nowrap group-hover:[animation-play-state:paused]">
          {LOGOS.map((logo, i) => (
            <div key={i} className="flex items-center justify-center min-w-[200px]">
              <span className="text-2xl font-bold text-gray-300 hover:text-brand-green transition-colors cursor-default select-none grayscale hover:grayscale-0">
                {logo}
              </span>
            </div>
          ))}
        </div>
        
        {/* Second Set (Duplicate for continuous loop) */}
        <div className="flex gap-20 py-4 animate-marquee-slow whitespace-nowrap group-hover:[animation-play-state:paused]" aria-hidden="true">
          {LOGOS.map((logo, i) => (
            <div key={`dup-${i}`} className="flex items-center justify-center min-w-[200px]">
              <span className="text-2xl font-bold text-gray-300 hover:text-brand-green transition-colors cursor-default select-none grayscale hover:grayscale-0">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
