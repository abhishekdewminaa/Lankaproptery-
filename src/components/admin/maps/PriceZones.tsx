import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Calendar, HelpCircle } from 'lucide-react';
import { DISTRICT_COORDS, MOCK_DISTRICTS } from './types';

const TIME_STEPS = [
  { label: 'Jan 2024', scale: 0.78, changeText: '-22% vs Present' },
  { label: 'Jun 2024', scale: 0.84, changeText: '-16% vs Present' },
  { label: 'Dec 2024', scale: 0.90, changeText: '-10% vs Present' },
  { label: 'Jun 2025', scale: 0.96, changeText: '-4% vs Present' },
  { label: 'Dec 2025', scale: 1.02, changeText: '+2% vs Present' },
  { label: 'Jun 2026', scale: 1.10, changeText: '+10% vs Present (Peak)' }
];

export default function PriceZones() {
  const [sliderIndex, setSliderIndex] = useState(5); // Default to latest Jun 2026
  const activeStep = TIME_STEPS[sliderIndex];

  // Map each district to average price scaled by chosen historical date step
  const scaledDistricts = useMemo(() => {
    return MOCK_DISTRICTS.map(dist => {
      // Calculate realistic base price per perch
      let basePricePerPerch = 750000;
      if (dist.district === 'Colombo') basePricePerPerch = 2200000;
      else if (dist.district === 'Gampaha') basePricePerPerch = 1100000;
      else if (dist.district === 'Kandy') basePricePerPerch = 1300000;
      else if (dist.district === 'Galle') basePricePerPerch = 950000;
      else if (dist.district === 'Kalutara') basePricePerPerch = 680000;

      const scaledPrice = Math.round(basePricePerPerch * activeStep.scale);
      
      // Determine choropleth color class mapped from price ranges
      let color = '#004F31'; // Dark green (Most affordable)
      if (scaledPrice >= 1800000) {
        color = '#EF4444'; // Dark red (Colombo high premium)
      } else if (scaledPrice >= 1000000) {
        color = '#F97316'; // Orange (Gampaha / Kandy)
      } else if (scaledPrice >= 800000) {
        color = '#EAB308'; // Yellow
      } else if (scaledPrice >= 500000) {
        color = '#10B981'; // Light green
      }

      return {
        ...dist,
        scaledPrice,
        color
      };
    });
  }, [activeStep]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            🌡️ District Price Heat Zones (MoM)
          </h2>
          <p className="text-xs font-semibold text-gray-500 mt-1 leading-none">
            Choropleth density showing price per perch island-wide. Drag slider to witness historical growth.
          </p>
        </div>

        {/* TIME SLIDER FLOATING HUD */}
        <div className="bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 self-start md:self-auto">
          <Calendar size={16} className="text-[#004F31]" />
          <div>
            <div className="text-[10px] font-black uppercase text-gray-400">Current Phase</div>
            <div className="text-xs font-black text-gray-950 flex items-center gap-1.5 leading-none mt-1">
              {activeStep.label} <span className="text-[10px] text-emerald-600 font-bold">{activeStep.changeText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE CHOROPLETH MAP VIEWPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 h-[440px] rounded-3xl overflow-hidden border border-gray-100 shadow-md relative">
          <MapContainer
            center={[7.8731, 80.7718]}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            
            {scaledDistricts.map((dist, i) => {
              const coords = DISTRICT_COORDS[dist.district];
              if (!coords) return null;

              // Size circles proportionally to price per perch
              let radius = 10000;
              if (dist.district === 'Colombo') radius = 18000;
              else if (dist.district === 'Gampaha') radius = 14000;
              else if (dist.district === 'Kandy') radius = 13000;

              return (
                <Circle
                  key={i}
                  center={coords}
                  radius={radius}
                  pathOptions={{
                    color: dist.color,
                    fillColor: dist.color,
                    fillOpacity: 0.65,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-2.5 w-44">
                      <h4 className="font-black text-gray-950 text-xs leading-none mb-1">{dist.district} District</h4>
                      <p className="text-[9px] font-black uppercase text-gray-400 mb-2">{dist.province} Province</p>
                      
                      <div className="space-y-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-gray-400">Avg Price / Perch:</span>
                          <span className="font-black text-gray-900">Rs. {dist.scaledPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-gray-400">Demand Level:</span>
                          <span className="font-black text-[#004F31]">{dist.demand}%</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Circle>
              );
            })}
          </MapContainer>

          {/* COLOR LEGEND HUD OVERLAY */}
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-gray-100 shadow-xl z-[1000] flex flex-col gap-1.5">
            <span className="text-[9px] font-black uppercase text-gray-400">Price Per Perch (LKR)</span>
            <div className="grid grid-cols-4 gap-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-5 h-2.5 bg-[#EF4444] rounded"></div>
                <span className="text-[8px] font-bold text-gray-500">Colombo</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-5 h-2.5 bg-[#F97316] rounded"></div>
                <span className="text-[8px] font-bold text-gray-500">Premium</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-5 h-2.5 bg-[#EAB308] rounded"></div>
                <span className="text-[8px] font-bold text-gray-500">Medium</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-5 h-2.5 bg-[#004F31] rounded"></div>
                <span className="text-[8px] font-bold text-gray-500">Budget</span>
              </div>
            </div>
          </div>
        </div>

        {/* HISTORICAL TIMELINE PANEL */}
        <div className="lg:col-span-4 bg-gray-50 p-5 rounded-3xl border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-gray-900 text-sm mb-2.5">Historical Timeline</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Slide the index to view price appreciation across Sri Lanka districts from the beginning of 2024 to modern day peak values.
            </p>

            {/* Price change highlights cards */}
            <div className="mt-5 space-y-3">
              <div className="bg-white p-3.5 rounded-2xl border border-gray-100">
                <span className="text-[8px] font-black uppercase text-gray-400">Colombo District (Average Perch)</span>
                <div className="text-base font-black text-gray-950 mt-1">
                  Rs. {Math.round(2200000 * activeStep.scale).toLocaleString()}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-gray-100">
                <span className="text-[8px] font-black uppercase text-gray-400">Gampaha District (Average Perch)</span>
                <div className="text-base font-black text-gray-950 mt-1">
                  Rs. {Math.round(1100000 * activeStep.scale).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* HORIZONTAL DRAG SLIDER */}
          <div className="border-t border-gray-200/50 pt-5 mt-6">
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={sliderIndex}
              onChange={e => setSliderIndex(Number(e.target.value))}
              className="w-full accent-[#004F31] cursor-pointer"
            />
            <div className="flex justify-between mt-3 px-1">
              {TIME_STEPS.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setSliderIndex(idx)}
                  className={`text-[9px] font-black flex flex-col items-center leading-none transition-all ${sliderIndex === idx ? 'text-[#004F31] scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mb-1 ${sliderIndex === idx ? 'bg-[#004F31]' : 'bg-gray-300'}`}></div>
                  {step.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
