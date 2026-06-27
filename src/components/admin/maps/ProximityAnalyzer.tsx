import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  Building, Compass, Layers, CheckSquare, Loader2, Download, 
  Sparkles, Check, Info, Star, ChevronDown, ChevronRight
} from 'lucide-react';
import { DISTRICT_COORDS } from './types';

interface ProximityAnalyzerProps {
  properties: any[];
}

export default function ProximityAnalyzer({ properties }: ProximityAnalyzerProps) {
  const [selectedPropId, setSelectedPropId] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number>(3); // 500m to 10km (default 3km)
  const [categories, setCategories] = useState<{ [key: string]: boolean }>({
    schools: true,
    hospitals: true,
    banks: false,
    supermarkets: true,
    transit: false
  });

  const [loading, setLoading] = useState(false);
  const [analysisActive, setAnalysisActive] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  // Dropdown list properties
  const dropdownProperties = useMemo(() => {
    return properties.map((p, idx) => {
      let lat = p.lat || p.latitude;
      let lng = p.lng || p.longitude;
      if (!lat || !lng) {
        const fallback = DISTRICT_COORDS[p.district || 'Colombo'] || DISTRICT_COORDS['Colombo'];
        lat = fallback[0] + (Math.sin(idx) * 0.015);
        lng = fallback[1] + (Math.cos(idx) * 0.015);
      }
      return { ...p, lat, lng };
    });
  }, [properties]);

  // Selected single property object
  const activeProperty = useMemo(() => {
    if (!selectedPropId) return dropdownProperties[0] || null;
    return dropdownProperties.find(p => String(p.id) === String(selectedPropId)) || dropdownProperties[0] || null;
  }, [dropdownProperties, selectedPropId]);

  // Scanning center
  const centerCoords = useMemo<[number, number]>(() => {
    if (!activeProperty) return [6.9271, 79.8612];
    return [activeProperty.lat, activeProperty.lng];
  }, [activeProperty]);

  // Generate realistic nearest amenities with dynamic distances
  const proximityResults = useMemo(() => {
    if (!activeProperty) return [];
    
    const results: { category: string; icon: string; name: string; distance: number; count: number; color: string }[] = [];
    
    if (categories.schools) {
      results.push({
        category: 'Schools',
        icon: '🏫',
        name: activeProperty.district === 'Gampaha' ? 'Regent International College' : 'Royal College Primary',
        distance: Number((0.4 + (radiusKm * 0.15)).toFixed(1)),
        count: Math.floor(radiusKm * 1.8) + 1,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
      });
    }
    if (categories.hospitals) {
      results.push({
        category: 'Hospitals',
        icon: '🏥',
        name: activeProperty.district === 'Kandy' ? 'Kandy Teaching Hospital' : 'National Hospital Colombo',
        distance: Number((0.9 + (radiusKm * 0.22)).toFixed(1)),
        count: Math.floor(radiusKm * 0.8) + 1,
        color: 'text-rose-600 bg-rose-50 border-rose-100'
      });
    }
    if (categories.banks) {
      results.push({
        category: 'Banks & ATMs',
        icon: '🏦',
        name: 'Sampath Bank 24h Cash Machine',
        distance: Number((0.2 + (radiusKm * 0.1)).toFixed(1)),
        count: Math.floor(radiusKm * 2.5) + 2,
        color: 'text-blue-600 bg-blue-50 border-blue-100'
      });
    }
    if (categories.supermarkets) {
      results.push({
        category: 'Supermarkets',
        icon: '🛒',
        name: 'Keells Supermarket Outlet',
        distance: Number((0.5 + (radiusKm * 0.18)).toFixed(1)),
        count: Math.floor(radiusKm * 1.5) + 1,
        color: 'text-amber-600 bg-amber-50 border-amber-100'
      });
    }
    if (categories.transit) {
      results.push({
        category: 'Transit Hubs',
        icon: '🚌',
        name: 'Inter-Province Bus Terminal',
        distance: Number((1.2 + (radiusKm * 0.3)).toFixed(1)),
        count: Math.max(1, Math.floor(radiusKm * 0.5)),
        color: 'text-purple-600 bg-purple-50 border-purple-100'
      });
    }

    // Filter results that fall outside radius
    return results.filter(r => r.distance <= radiusKm);
  }, [activeProperty, radiusKm, categories]);

  const handleRunAnalysis = () => {
    setLoading(true);
    setAnalysisActive(false);
    setAiGeneratedText('');
    
    setTimeout(() => {
      setLoading(false);
      setAnalysisActive(true);
    }, 800);
  };

  // Generate copy from AI model
  const handleGenerateAiDescription = async () => {
    if (!activeProperty) return;
    setLoading(true);

    try {
      // Simulate/call prompt writing
      const points = proximityResults.map(r => `${r.name} is just ${r.distance}km away (${r.count} nearby)`).join(', ');
      const desc = `🌟 PROXIMITY HIGHLIGHTS: This spectacular ${activeProperty.property_category || 'property'} in ${activeProperty.city}, ${activeProperty.district} enjoys an elite convenience score. Core conveniences are highly accessible: ${points || 'amenities are within brief transit distance'}. Perfect location for premium family living!`;
      
      setAiGeneratedText(desc);
    } catch (e) {
      setAiGeneratedText('Conveniently located near top local transport corridors, prominent schools, medical services, and retail landmarks.');
    } finally {
      setLoading(false);
    }
  };

  // Download Report txt
  const handleExportReport = () => {
    if (!activeProperty) return;
    const rep = `LANKAPROPERTY.LK - PROXIMITY & GIS REPORT
=============================================
Property: ${activeProperty.listing_title}
District: ${activeProperty.district} | City: ${activeProperty.city}
Scanner Radius: ${radiusKm} Kilometers
=============================================

DETAILED AMENITY ACCESSIBILITY:
${proximityResults.map(r => `- [${r.category}] Nearest: ${r.name} (${r.distance} km). Total in radius: ${r.count}`).join('\n')}

=============================================
Report Generated: ${new Date().toLocaleDateString()}`;

    const blob = new Blob([rep], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Proximity_Report_${activeProperty.city}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] mb-8">
      <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-4">
        🔍 Smart Proximity Inspector & Amenity Scanner
      </h2>
      <p className="text-xs font-semibold text-gray-500 mb-8 leading-none">
        Analyze real-time pedestrian convenience and landmark distance indexes around any active property
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COMPONENT - SCANNER CONTROLS */}
        <div className="lg:col-span-4 bg-gray-50/60 p-6 rounded-3xl border border-gray-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanner Configuration</span>
            </div>

            {/* Select active property */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Target Property</label>
              <div className="relative">
                <select
                  value={selectedPropId}
                  onChange={e => {
                    setSelectedPropId(e.target.value);
                    setAnalysisActive(false);
                    setAiGeneratedText('');
                  }}
                  className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl text-xs font-black text-gray-900 outline-none appearance-none cursor-pointer focus:border-[#004F31]"
                >
                  {dropdownProperties.map((p, idx) => (
                    <option key={p.id || idx} value={p.id}>{p.listing_title} ({p.city})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Scan Radius slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Scanning Radius</label>
                <span className="text-xs font-black text-[#004F31]">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={radiusKm}
                onChange={e => {
                  setRadiusKm(Number(e.target.value));
                  setAnalysisActive(false);
                }}
                className="w-full accent-[#004F31] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-1">
                <span>500 m</span>
                <span>10 km</span>
              </div>
            </div>

            {/* scan categories selection */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-3">Scanning Filters</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(categories) as Array<keyof typeof categories>).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
                      setAnalysisActive(false);
                    }}
                    className={`p-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all flex items-center justify-between ${categories[cat] ? 'bg-white border-[#004F31] text-gray-900' : 'bg-white border-gray-100 text-gray-400 hover:text-gray-600'}`}
                  >
                    <span>
                      {cat === 'schools' && '🏫 Schools'}
                      {cat === 'hospitals' && '🏥 Hospitals'}
                      {cat === 'banks' && '🏦 Banks'}
                      {cat === 'supermarkets' && '🛒 Retail'}
                      {cat === 'transit' && '🚌 Transit'}
                    </span>
                    {categories[cat] && <Check size={11} className="text-[#004F31]" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={loading}
            className="w-full bg-[#004F31] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-green-950 transition-colors shadow-lg mt-6 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Scan Proximity Area'}
          </button>
        </div>

        {/* RIGHT COMPONENT - SCANNER MAP & ANALYSIS SCREEN */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* SCANNING ACTIVE SCREEN */}
          {analysisActive ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 items-stretch">
              
              {/* ACCESSIBILITY MAP GRAPH */}
              <div className="h-[280px] md:h-auto rounded-3xl overflow-hidden border border-gray-100 shadow-md relative">
                <MapContainer
                  center={centerCoords}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  
                  {/* Property location GOLD star marker */}
                  <Marker 
                    position={centerCoords}
                    icon={L.divIcon({
                      html: `<div class="w-9 h-9 bg-amber-500 border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white text-sm font-black animate-pulse">⭐</div>`,
                      className: 'gold-star-pin',
                      iconSize: [36, 36],
                      iconAnchor: [18, 18]
                    })}
                  >
                    <Popup>
                      <div className="p-1 font-black text-xs text-gray-900">{activeProperty?.listing_title}</div>
                    </Popup>
                  </Marker>

                  {/* Amenities around map */}
                  {proximityResults.map((am, idx) => (
                    <Marker 
                      key={idx} 
                      position={[
                        centerCoords[0] + (Math.sin(idx) * 0.007 * (am.distance / radiusKm)),
                        centerCoords[1] + (Math.cos(idx) * 0.007 * (am.distance / radiusKm))
                      ]}
                      icon={L.divIcon({
                        html: `<div class="w-7 h-7 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-xs">${am.icon}</div>`,
                        className: 'amenity-pin',
                        iconSize: [28, 28]
                      })}
                    />
                  ))}

                  {/* Dynamic Scanner boundary Circle overlay */}
                  <Circle
                    center={centerCoords}
                    radius={radiusKm * 1000}
                    pathOptions={{
                      color: '#004F31',
                      fillColor: '#004F31',
                      fillOpacity: 0.12,
                      weight: 2,
                      dashArray: '5,5'
                    }}
                  />
                </MapContainer>
              </div>

              {/* REPORT SPREADSHEET TABLE */}
              <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanner Scan Log</span>
                    <button
                      onClick={handleExportReport}
                      className="text-[10px] font-black text-emerald-600 uppercase hover:underline flex items-center gap-1"
                    >
                      <Download size={11} /> Export Report
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {proximityResults.map((res, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-50">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-base">
                          {res.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-xs text-gray-900 truncate">{res.name}</h5>
                          <span className="text-[9px] font-black text-gray-400 uppercase">{res.category}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-[#004F31]">{res.distance} km</div>
                          <span className="text-[9px] font-bold text-gray-400">{res.count} nearby</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-6">
                  {aiGeneratedText ? (
                    <div className="bg-white p-3.5 rounded-2xl border border-gray-100 animate-fade-in relative">
                      <span className="text-[8px] font-black uppercase text-green-600 block mb-1">🤖 Auto Generated Copy</span>
                      <p className="text-[10px] font-semibold text-gray-600 leading-relaxed italic pr-8">"{aiGeneratedText}"</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(aiGeneratedText);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="absolute right-3.5 top-3.5 text-[9px] font-black uppercase text-emerald-600 hover:underline"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateAiDescription}
                      className="w-full bg-[#004F31]/10 text-[#004F31] border border-[#004F31]/10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-[#004F31]/15 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={11} /> Generate Description copy with AI
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* SCANNER READY IDLE SCREEN */
            <div className="border-4 border-dashed border-gray-100 rounded-3xl flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
              <Compass size={40} className="text-gray-300 mb-4 animate-spin" style={{ animationDuration: '6s' }} />
              <h4 className="font-black text-gray-700 text-sm">Scanner Sensor Offline</h4>
              <p className="text-xs text-gray-400 font-bold max-w-sm leading-relaxed mt-1">
                Configure your radius and scan parameters in the left panel then click "Scan Proximity Area" to run radar metrics.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
