import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Compass, Eye, Sliders, Layers, Star, MapPin, 
  Search, ShieldAlert, Check, X, Maximize2, Minimize2, 
  HelpCircle, Sparkles, Building, Trash2, ArrowUpRight
} from 'lucide-react';
import { DistrictData, FeaturedProject, DISTRICT_COORDS, MOCK_PROJECTS } from './types';

// Fix Leaflet Default Icon asset paths so they don't break
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper component to programmatically pan/zoom map on center/zoom updates
function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Helper to listen for map click events for custom tools
function MapClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    }
  });
  return null;
}

// Ray-casting point-in-polygon math
function isPointInPolygon(point: [number, number], polygon: [number, number][]) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Haversine formula for distance calculation
function getDistanceKM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Custom HTML Pin Generator
function createCustomPin(color: string, typeSymbol: string = "") {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-7 w-7 rounded-full opacity-60 animate-ping" style="background-color: ${color};"></span>
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-xl text-white text-[11px] font-black" style="background-color: ${color};">
          ${typeSymbol || '🏠'}
        </div>
      </div>
    `,
    className: 'custom-leaflet-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

const SALE_ICON = createCustomPin('#004F31', '🟢');
const RENT_ICON = createCustomPin('#3B82F6', '🔵');
const FEATURED_ICON = createCustomPin('#F59E0B', '🟡');
const URGENT_ICON = createCustomPin('#EF4444', '🔴');
const PROJECT_ICON = createCustomPin('#8B5CF6', '⭐');

interface InteractiveMapProps {
  properties: any[];
  onNavigateDetail: (prop: any) => void;
  mapCenter: [number, number];
  mapZoom: number;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
}

export default function InteractiveMap({
  properties,
  onNavigateDetail,
  mapCenter,
  mapZoom,
  setMapCenter,
  setMapZoom
}: InteractiveMapProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'listings' | 'amenities' | 'projects'>('overview');
  const [mapStyle, setMapStyle] = useState<'default' | 'satellite' | 'terrain'>('default');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Draw State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [polygonComplete, setPolygonComplete] = useState(false);

  // Measure State
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // Heatmap State
  const [heatmapSource, setHeatmapSource] = useState<'listings' | 'demand'>('listings');

  // Listings Filter State
  const [filterTypes, setFilterTypes] = useState<string[]>(['House', 'Land', 'Apartment']);
  const [filterListingType, setFilterListingType] = useState<string>('All');
  const [filterMaxPrice, setFilterMaxPrice] = useState<number>(100); // In Millions LKR
  const [filterBedrooms, setFilterBedrooms] = useState<string>('Any');
  const [filterMinLandSize, setFilterMinLandSize] = useState<string>('');
  const [filterMaxLandSize, setFilterMaxLandSize] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('Active');

  // Amenities Toggles
  const [activeAmenities, setActiveAmenities] = useState<{ [key: string]: boolean }>({
    schools: false,
    hospitals: false,
    banks: false,
    supermarkets: false,
    transit: false
  });

  // Calculate Tiles URL
  const tileUrl = useMemo(() => {
    if (mapStyle === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (mapStyle === 'terrain') {
      return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    }
    return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  }, [mapStyle]);

  // Clean properties lists with guaranteed coordinate fallbacks in Sri Lanka
  const validProperties = useMemo(() => {
    return properties.map((p, idx) => {
      let lat = p.lat || p.latitude;
      let lng = p.lng || p.longitude;
      
      // Assign realistic coordinates based on district if missing
      if (!lat || !lng) {
        const districtName = p.district || 'Colombo';
        const fallbackCoords = DISTRICT_COORDS[districtName] || DISTRICT_COORDS['Colombo'];
        // Offset slightly to prevent overlap
        lat = fallbackCoords[0] + (Math.sin(idx) * 0.015);
        lng = fallbackCoords[1] + (Math.cos(idx) * 0.015);
      }

      return {
        ...p,
        lat,
        lng,
        category: p.property_category || p.propertyType || 'House',
        listing_type: p.listing_type || p.type || 'For Sale'
      };
    });
  }, [properties]);

  // Filter listings inside polygonal drawn area
  const drawnAreaProperties = useMemo(() => {
    if (drawnPoints.length < 3 || !polygonComplete) return [];
    return validProperties.filter(p => isPointInPolygon([p.lat, p.lng], drawnPoints));
  }, [validProperties, drawnPoints, polygonComplete]);

  // Apply Sidebar Listings Filters
  const filteredPropertiesList = useMemo(() => {
    return validProperties.filter(p => {
      // Type Check
      if (filterTypes.length > 0 && !filterTypes.includes(p.category)) return false;
      
      // Listing Type Check
      if (filterListingType !== 'All' && p.listing_type !== filterListingType) return false;
      
      // Price Check
      const pLkr = Number(p.price_lkr);
      if (!isNaN(pLkr)) {
        const millions = pLkr / 1000000;
        if (millions > filterMaxPrice) return false;
      }

      // Bedrooms Check
      if (filterBedrooms !== 'Any') {
        const beds = p.rooms || p.bedrooms || 0;
        if (filterBedrooms === '5+' && beds < 5) return false;
        if (filterBedrooms !== '5+' && beds !== parseInt(filterBedrooms)) return false;
      }

      // Land size check
      const perchVal = Number(p.land_area_perch || p.landArea || 0);
      if (filterMinLandSize && perchVal < Number(filterMinLandSize)) return false;
      if (filterMaxLandSize && perchVal > Number(filterMaxLandSize)) return false;

      // Status Check
      if (filterStatus === 'Active' && p.status !== 'active') return false;
      if (filterStatus === 'Featured' && !p.is_featured) return false;

      return true;
    });
  }, [validProperties, filterTypes, filterListingType, filterMaxPrice, filterBedrooms, filterMinLandSize, filterMaxLandSize, filterStatus]);

  // Toggle single filter checkbox
  const handleTypeToggle = (type: string) => {
    setFilterTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Click on map event handler
  const handleMapClick = (latlng: L.LatLng) => {
    if (isDrawing && !polygonComplete) {
      setDrawnPoints(prev => [...prev, [latlng.lat, latlng.lng]]);
    } else if (isMeasuring) {
      if (measurePoints.length >= 2) {
        setMeasurePoints([[latlng.lat, latlng.lng]]);
      } else {
        setDrawnPoints([]); // Clear any draw states
        setMeasurePoints(prev => [...prev, [latlng.lat, latlng.lng]]);
      }
    }
  };

  // Search Address / Town coordinate jumps
  const runAddressSearch = () => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase().trim();
    
    // Check our coordinate lookup or zoom to matched district
    const matchedDistrict = Object.keys(DISTRICT_COORDS).find(
      key => key.toLowerCase().includes(query) || query.includes(key.toLowerCase())
    );

    if (matchedDistrict) {
      setMapCenter(DISTRICT_COORDS[matchedDistrict]);
      setMapZoom(11);
    } else {
      // Simulate standard search address coordinates
      setMapCenter([6.9271, 79.8612]); // Colombo default fallback
      setMapZoom(12);
    }
  };

  // Calculate distance of measuring tools
  const measuredDistanceText = useMemo(() => {
    if (measurePoints.length < 2) return '';
    const dist = getDistanceKM(
      measurePoints[0][0], measurePoints[0][1],
      measurePoints[1][0], measurePoints[1][1]
    );
    if (dist < 1) {
      return `${Math.round(dist * 1000)} meters`;
    }
    return `${dist.toFixed(2)} km`;
  }, [measurePoints]);

  const midPoint = useMemo<[number, number] | null>(() => {
    if (measurePoints.length < 2) return null;
    return [
      (measurePoints[0][0] + measurePoints[1][0]) / 2,
      (measurePoints[0][1] + measurePoints[1][1]) / 2
    ];
  }, [measurePoints]);

  // Pre-cached realistic amenity marker generators across Sri Lanka map viewport
  const amenityMarkers = useMemo(() => {
    const list: { name: string; type: string; lat: number; lng: number; icon: string; color: string }[] = [];
    const centerLat = mapCenter[0];
    const centerLng = mapCenter[1];

    if (activeAmenities.schools) {
      list.push(
        { name: 'Royal College Colombo', type: 'school', lat: centerLat + 0.008, lng: centerLng - 0.004, icon: '🏫', color: '#10B981' },
        { name: 'St. Thomas College', type: 'school', lat: centerLat - 0.012, lng: centerLng + 0.009, icon: '🏫', color: '#10B981' }
      );
    }
    if (activeAmenities.hospitals) {
      list.push(
        { name: 'National General Hospital', type: 'hospital', lat: centerLat + 0.005, lng: centerLng + 0.006, icon: '🏥', color: '#EF4444' },
        { name: 'Nawaloka Hospital Private', type: 'hospital', lat: centerLat - 0.007, lng: centerLng - 0.005, icon: '🏥', color: '#EF4444' }
      );
    }
    if (activeAmenities.banks) {
      list.push(
        { name: 'Commercial Bank ATM', type: 'bank', lat: centerLat + 0.002, lng: centerLng - 0.003, icon: '🏦', color: '#3B82F6' },
        { name: 'Hatton National Bank', type: 'bank', lat: centerLat - 0.004, lng: centerLng + 0.003, icon: '🏦', color: '#3B82F6' }
      );
    }
    if (activeAmenities.supermarkets) {
      list.push(
        { name: 'Keells Supermarket', type: 'supermarket', lat: centerLat + 0.011, lng: centerLng + 0.001, icon: '🛒', color: '#F59E0B' },
        { name: 'Cargills Food City', type: 'supermarket', lat: centerLat - 0.009, lng: centerLng - 0.008, icon: '🛒', color: '#F59E0B' }
      );
    }
    if (activeAmenities.transit) {
      list.push(
        { name: 'Central Bus Terminal', type: 'transit', lat: centerLat + 0.003, lng: centerLng + 0.008, icon: '🚌', color: '#8B5CF6' }
      );
    }
    return list;
  }, [activeAmenities, mapCenter]);

  // Heatmap hotspots rendering
  const heatmapHotspots = useMemo(() => {
    if (heatmapSource === 'listings') {
      return [
        { center: DISTRICT_COORDS['Colombo'], radius: 10000, intensity: 0.55 },
        { center: DISTRICT_COORDS['Gampaha'], radius: 8000, intensity: 0.45 },
        { center: DISTRICT_COORDS['Kandy'], radius: 7000, intensity: 0.4 },
        { center: DISTRICT_COORDS['Galle'], radius: 6000, intensity: 0.35 },
        { center: DISTRICT_COORDS['Kurunegala'], radius: 5000, intensity: 0.3 }
      ];
    } else {
      // Show Search Demand hotspots
      return [
        { center: DISTRICT_COORDS['Colombo'], radius: 14000, intensity: 0.75 },
        { center: DISTRICT_COORDS['Gampaha'], radius: 11000, intensity: 0.65 },
        { center: DISTRICT_COORDS['Kandy'], radius: 8500, intensity: 0.55 },
        { center: DISTRICT_COORDS['Kalutara'], radius: 6000, intensity: 0.4 },
        { center: DISTRICT_COORDS['Galle'], radius: 8000, intensity: 0.5 }
      ];
    }
  }, [heatmapSource]);

  return (
    <div className={`bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] overflow-hidden mb-8 flex flex-col ${isFullscreen ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none' : 'h-[680px]'}`}>
      
      {/* MAP TAB HEADER BAR */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(['overview', 'heatmap', 'listings', 'amenities', 'projects'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setDrawnPoints([]);
                setPolygonComplete(false);
                setMeasurePoints([]);
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap border-2 transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-[#004F31] border-[#004F31] text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}
            >
              {tab === 'overview' && '🗺️ Overview'}
              {tab === 'heatmap' && '🔥 Heatmap'}
              {tab === 'listings' && '📍 Listings'}
              {tab === 'amenities' && '🏫 Amenities'}
              {tab === 'projects' && '🏗️ Projects'}
            </button>
          ))}
        </div>

        {/* Dynamic map address search bar */}
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search address / town..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runAddressSearch()}
              className="w-full bg-white border border-gray-200 pl-9 pr-3 py-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#004F31]"
            />
          </div>
          <button 
            onClick={runAddressSearch}
            className="bg-[#004F31] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-950 transition-colors"
          >
            Go
          </button>
        </div>
      </div>

      {/* CORE MAP WORKSPACE */}
      <div className="flex flex-1 relative min-h-0 overflow-hidden">
        
        {/* TAB 3 SIDE PANEL: FILTER BAR */}
        {activeTab === 'listings' && (
          <div className="w-[280px] border-r border-gray-100 bg-white p-5 flex flex-col justify-between overflow-y-auto shrink-0 h-full scrollbar-hide">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <span className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <Sliders size={16} className="text-[#004F31]" /> Filter Listings
                </span>
                <button 
                  onClick={() => {
                    setFilterTypes(['House', 'Land', 'Apartment']);
                    setFilterListingType('All');
                    setFilterMaxPrice(100);
                    setFilterBedrooms('Any');
                    setFilterMinLandSize('');
                    setFilterMaxLandSize('');
                    setFilterStatus('Active');
                  }}
                  className="text-[10px] font-black text-emerald-600 hover:underline uppercase"
                >
                  Clear All
                </button>
              </div>

              {/* Property Category checkboxes */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2.5">Property Type</label>
                <div className="space-y-2">
                  {['House', 'Land', 'Apartment', 'Villa', 'Commercial'].map(t => (
                    <label key={t} className="flex items-center gap-2.5 text-xs font-bold text-gray-600 cursor-pointer hover:text-gray-900">
                      <input
                        type="checkbox"
                        checked={filterTypes.includes(t)}
                        onChange={() => handleTypeToggle(t)}
                        className="w-4 h-4 text-[#004F31] border-gray-300 rounded focus:ring-[#004F31]"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              {/* Listing Type tabs */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Listing Type</label>
                <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-xl">
                  {['All', 'For Sale', 'For Rent'].map(lt => (
                    <button
                      key={lt}
                      onClick={() => setFilterListingType(lt)}
                      className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterListingType === lt ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {lt.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Max Price</label>
                  <span className="text-xs font-black text-[#004F31]">Rs. {filterMaxPrice}M</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filterMaxPrice}
                  onChange={e => setFilterMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#004F31] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-1">
                  <span>0 LKR</span>
                  <span>100M LKR</span>
                </div>
              </div>

              {/* Bedrooms Picker */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Bedrooms</label>
                <div className="grid grid-cols-6 gap-1 bg-gray-50 p-1 rounded-xl">
                  {['Any', '1', '2', '3', '4', '5+'].map(b => (
                    <button
                      key={b}
                      onClick={() => setFilterBedrooms(b)}
                      className={`py-1.5 rounded-lg text-xs font-black transition-all ${filterBedrooms === b ? 'bg-[#004F31] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Land Area Input Size */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Land Size (Perches)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filterMinLandSize}
                    onChange={e => setFilterMinLandSize(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs font-bold text-gray-900 outline-none"
                  />
                  <span className="text-gray-300 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filterMaxLandSize}
                    onChange={e => setFilterMaxLandSize(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 p-2 rounded-xl text-xs font-bold text-gray-900 outline-none"
                  />
                </div>
              </div>

              {/* Status Picker */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Listing Status</label>
                <div className="flex gap-2">
                  {['Active', 'Pending', 'Featured'].map(st => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${filterStatus === st ? 'bg-[#004F31] border-[#004F31] text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-50 pt-4 mt-6">
              <div className="text-xs font-black text-gray-400 mb-2">Active Match</div>
              <div className="bg-[#004F31]/10 text-[#004F31] border border-[#004F31]/20 px-4 py-3 rounded-xl font-black text-xs text-center">
                Showing {filteredPropertiesList.length} properties
              </div>
            </div>
          </div>
        )}

        {/* MAP MAIN CONTAINER */}
        <div className="flex-1 h-full w-full relative">
          
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer url={tileUrl} attribution="LankaProperty.lk Maps Engine" />
            <ChangeMapView center={mapCenter} zoom={mapZoom} />
            <MapClickHandler onClick={handleMapClick} />

            {/* TAB 1: OVERVIEW PINS AND POPUPS */}
            {activeTab === 'overview' && (
              <>
                {validProperties.map((p, idx) => {
                  let pinIcon = SALE_ICON;
                  if (p.listing_type === 'For Rent') pinIcon = RENT_ICON;
                  else if (p.is_featured) pinIcon = FEATURED_ICON;
                  else if (p.is_trending) pinIcon = URGENT_ICON;

                  return (
                    <Marker key={p.id || idx} position={[p.lat, p.lng]} icon={pinIcon}>
                      <Popup className="custom-map-popup">
                        <div className="w-56 p-2 overflow-hidden rounded-xl">
                          <img 
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'} 
                            alt={p.listing_title}
                            className="w-full h-28 object-cover rounded-lg mb-2.5"
                          />
                          <div className="space-y-1.5">
                            <span className="bg-[#004F31]/10 text-[#004F31] px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                              {p.listing_type}
                            </span>
                            <h4 className="font-black text-gray-900 text-xs leading-snug line-clamp-1">
                              {p.listing_title}
                            </h4>
                            <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <MapPin size={10} /> {p.city}, {p.district}
                            </div>
                            <div className="text-xs font-black text-[#004F31] pt-1">
                              {p.price || `Rs. ${Number(p.price_lkr || 0).toLocaleString()}`}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-50">
                              <button 
                                onClick={() => onNavigateDetail(p)}
                                className="bg-[#004F31] text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-green-950 text-center"
                              >
                                View Listing
                              </button>
                              <a 
                                href={`/listing/${p.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-gray-50 text-gray-600 border border-gray-200 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-gray-100 flex items-center justify-center gap-0.5"
                              >
                                Live Site <ArrowUpRight size={10} />
                              </a>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </>
            )}

            {/* TAB 2: HEATMAP GRADIENT OVERLAYS */}
            {activeTab === 'heatmap' && (
              <>
                {heatmapHotspots.map((hotspot, i) => (
                  <React.Fragment key={i}>
                    {/* Inner core */}
                    <Circle 
                      center={hotspot.center}
                      radius={hotspot.radius * 0.4}
                      pathOptions={{
                        color: '#EF4444',
                        fillColor: '#EF4444',
                        fillOpacity: hotspot.intensity * 0.9,
                        stroke: false
                      }}
                    />
                    {/* Mid ring */}
                    <Circle 
                      center={hotspot.center}
                      radius={hotspot.radius * 0.7}
                      pathOptions={{
                        color: '#F97316',
                        fillColor: '#F97316',
                        fillOpacity: hotspot.intensity * 0.5,
                        stroke: false
                      }}
                    />
                    {/* Outer ring */}
                    <Circle 
                      center={hotspot.center}
                      radius={hotspot.radius}
                      pathOptions={{
                        color: '#EAB308',
                        fillColor: '#EAB308',
                        fillOpacity: hotspot.intensity * 0.25,
                        stroke: false
                      }}
                    />
                  </React.Fragment>
                ))}
              </>
            )}

            {/* TAB 3: FILTERED PROPERTIES PINS */}
            {activeTab === 'listings' && (
              <>
                {filteredPropertiesList.map((p, idx) => (
                  <Marker 
                    key={p.id || idx} 
                    position={[p.lat, p.lng]} 
                    icon={p.listing_type === 'For Rent' ? RENT_ICON : SALE_ICON}
                  >
                    <Popup className="custom-map-popup">
                      <div className="w-48 p-1">
                        <h4 className="font-black text-gray-900 text-xs leading-none mb-1 line-clamp-1">{p.listing_title}</h4>
                        <p className="text-[10px] font-semibold text-gray-400 mb-1.5">{p.city}, {p.district}</p>
                        <div className="text-xs font-black text-[#004F31]">{p.price}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            )}

            {/* TAB 4: AMENITY MAP LAYER */}
            {activeTab === 'amenities' && (
              <>
                {amenityMarkers.map((am, idx) => (
                  <Marker 
                    key={idx} 
                    position={[am.lat, am.lng]} 
                    icon={createCustomPin(am.color, am.icon)}
                  >
                    <Popup>
                      <div className="p-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{am.type}</span>
                        <h4 className="font-black text-gray-900 text-xs leading-none mt-0.5">{am.name}</h4>
                        <div className="text-[10px] font-semibold text-emerald-600 mt-1">Verified Location</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            )}

            {/* TAB 5: DEVELOPMENTS / PROJECTS LAYER */}
            {activeTab === 'projects' && (
              <>
                {MOCK_PROJECTS.map((proj) => (
                  <Marker key={proj.id} position={[proj.lat, proj.lng]} icon={PROJECT_ICON}>
                    <Popup>
                      <div className="w-56 p-1.5">
                        <img 
                          src={proj.image} 
                          alt={proj.name} 
                          className="w-full h-24 object-cover rounded-lg mb-2"
                        />
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider block w-max mb-1.5">
                          {proj.status}
                        </span>
                        <h4 className="font-black text-gray-900 text-xs leading-snug">{proj.name}</h4>
                        <p className="text-[9px] font-bold text-gray-400 leading-none mb-2">Dev: {proj.developer}</p>
                        <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                          <span className="text-[10px] font-black text-[#004F31]">From {proj.startingPrice}</span>
                          <button className="bg-purple-600 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-purple-800 transition-colors">
                            View Project
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            )}

            {/* DRAW POLYGON RENDERING */}
            {drawnPoints.length > 0 && (
              <Polygon 
                positions={drawnPoints} 
                pathOptions={{
                  color: '#004F31',
                  fillColor: '#004F31',
                  fillOpacity: 0.18,
                  weight: 3
                }}
              />
            )}

            {/* DISTANCE MEASURING POLYLINE */}
            {measurePoints.length > 0 && (
              <>
                <Polyline 
                  positions={measurePoints} 
                  pathOptions={{
                    color: '#EF4444',
                    weight: 3,
                    dashArray: '6,6'
                  }}
                />
                {measurePoints.map((pt, i) => (
                  <Circle 
                    key={i} 
                    center={pt} 
                    radius={150} 
                    pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.8 }} 
                  />
                ))}
                {midPoint && measuredDistanceText && (
                  <Popup position={midPoint} closeButton={false}>
                    <div className="text-center font-black text-xs text-red-600 leading-none py-0.5">
                      📏 Distance: {measuredDistanceText}
                    </div>
                  </Popup>
                )}
              </>
            )}
          </MapContainer>

          {/* FLOATING AMENITIES TOGGLES HUD */}
          {activeTab === 'amenities' && (
            <div className="absolute top-4 left-4 z-[1000] flex flex-wrap gap-1.5 max-w-[calc(100%-100px)]">
              {(Object.keys(activeAmenities) as Array<keyof typeof activeAmenities>).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveAmenities(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all border ${activeAmenities[key] ? 'bg-[#004F31] border-[#004F31] text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {key === 'schools' && '🏫 Schools'}
                  {key === 'hospitals' && '🏥 Hospitals'}
                  {key === 'banks' && '🏦 Banks & ATMs'}
                  {key === 'supermarkets' && '🛒 Supermarkets'}
                  {key === 'transit' && '🚌 Transit'}
                  {activeAmenities[key] && <Check size={11} strokeWidth={3} />}
                </button>
              ))}
            </div>
          )}

          {/* FLOATING DRAW / MEASURE TOOL HUD */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            
            {/* Draw Area Toggle Button */}
            <button
              onClick={() => {
                setIsDrawing(!isDrawing);
                setIsMeasuring(false);
                setMeasurePoints([]);
                setDrawnPoints([]);
                setPolygonComplete(false);
              }}
              className={`p-3 rounded-2xl shadow-xl border flex items-center justify-center transition-all ${isDrawing ? 'bg-[#004F31] border-[#004F31] text-white scale-105' : 'bg-white border-gray-200 text-gray-700 hover:text-[#004F31]'}`}
              title="Draw Polygon Area to select properties"
            >
              <Compass size={18} />
            </button>

            {/* Distance Measure Button */}
            <button
              onClick={() => {
                setIsMeasuring(!isMeasuring);
                setIsDrawing(false);
                setDrawnPoints([]);
                setPolygonComplete(false);
                setMeasurePoints([]);
              }}
              className={`p-3 rounded-2xl shadow-xl border flex items-center justify-center transition-all ${isMeasuring ? 'bg-red-600 border-red-600 text-white scale-105' : 'bg-white border-gray-200 text-gray-700 hover:text-red-600'}`}
              title="Measure map distance"
            >
              <Maximize2 size={18} />
            </button>

            {/* Map Style Overlay Toggle */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-1 flex flex-col gap-0.5">
              {(['default', 'satellite', 'terrain'] as const).map(style => (
                <button
                  key={style}
                  onClick={() => setMapStyle(style)}
                  className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-center ${mapStyle === style ? 'bg-[#004F31] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  {style}
                </button>
              ))}
            </div>

            {/* Fullscreen view button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-white p-3 rounded-2xl shadow-xl border border-gray-200 text-gray-700 hover:text-gray-900"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>

          {/* FLOATING ACTION BANNER HUD FOR ACTIVE TOOLS */}
          {(isDrawing || isMeasuring || drawnAreaProperties.length > 0) && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-4 animate-fade-in max-w-lg">
              
              {isDrawing && !polygonComplete && (
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#004F31] rounded-full animate-ping"></div>
                  <span className="text-xs font-black text-gray-900">Drawing Area: Click map to place vertices</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setPolygonComplete(true)}
                      disabled={drawnPoints.length < 3}
                      className="bg-[#004F31] text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase hover:bg-green-950 transition-colors disabled:opacity-40"
                    >
                      Complete
                    </button>
                    <button 
                      onClick={() => {
                        setDrawnPoints([]);
                        setPolygonComplete(false);
                        setIsDrawing(false);
                      }}
                      className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {polygonComplete && drawnAreaProperties.length >= 0 && (
                <div className="flex items-center justify-between gap-6 w-full">
                  <span className="text-xs font-black text-gray-900">
                    🎯 Found <span className="text-[#004F31] text-sm">{drawnAreaProperties.length}</span> properties inside drawn boundary!
                  </span>
                  <button 
                    onClick={() => {
                      setDrawnPoints([]);
                      setPolygonComplete(false);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              {isMeasuring && (
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-xs font-black text-gray-900">
                    {measurePoints.length === 0 && 'Distance tool: Click first point on map'}
                    {measurePoints.length === 1 && 'Click second point to measure distance'}
                    {measurePoints.length === 2 && `Measured distance: ${measuredDistanceText}`}
                  </span>
                  {measurePoints.length > 0 && (
                    <button 
                      onClick={() => setMeasurePoints([])}
                      className="text-[10px] font-black uppercase text-red-600 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* HEATMAP LEGEND AT BOTTOM RIGHT */}
          {activeTab === 'heatmap' && (
            <div className="absolute bottom-6 right-6 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-2.5">
              <div className="flex gap-2">
                <button
                  onClick={() => setHeatmapSource('listings')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${heatmapSource === 'listings' ? 'bg-[#004F31] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  Listings Density
                </button>
                <button
                  onClick={() => setHeatmapSource('demand')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${heatmapSource === 'demand' ? 'bg-[#004F31] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  Search Demand
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] font-black text-gray-400 uppercase">Low</span>
                <div className="h-2 w-32 rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-600"></div>
                <span className="text-[9px] font-black text-gray-400 uppercase">High</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
