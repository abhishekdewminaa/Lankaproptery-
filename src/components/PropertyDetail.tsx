import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Bed, Bath, Maximize, Check, Phone, Star, ArrowRight, X, 
  ChevronLeft, ChevronRight, MessageCircle, Share2, Heart, Copy, 
  Tag, Home, Layers, Lock, Maximize2, AlertTriangle, Globe
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import { triggerNotification } from '../services/notificationService';
import { runLeadFollowUpWorkflow } from '../automation/workflows';
import { translateDescription } from '../services/geminiService';
import { safeReplace, USD_RATE, EUR_RATE, slugify } from '../utils/safeUtils';
import toast from 'react-hot-toast';

// Fix Leaflet marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const getPropertyImage = (images: any, index = 0) => {
  if (!images) return '/placeholder-property.jpg';
  if (Array.isArray(images)) return images[index] || images[0] || '/placeholder-property.jpg';
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed[index] || parsed[0] || '/placeholder-property.jpg';
      return images;
    } catch {
      return images;
    }
  }
  return '/placeholder-property.jpg';
};

const getPropertyImagesList = (images: any) => {
  if (!images) return ['/placeholder-property.jpg'];
  if (Array.isArray(images)) {
    return images.filter(Boolean).length > 0 ? images.filter(Boolean) : ['/placeholder-property.jpg'];
  }
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).length > 0 ? parsed.filter(Boolean) : ['/placeholder-property.jpg'];
      }
      return [images];
    } catch {
      return [images];
    }
  }
  return ['/placeholder-property.jpg'];
};

const convertPrice = (priceVal: any) => {
  if (!priceVal) return null;
  const numericStr = safeReplace(priceVal, /[^0-9]/g, '');
  const amount = parseInt(numericStr);
  if (isNaN(amount) || amount === 0) return null;
  return {
    usd: `$${Math.round(amount / USD_RATE).toLocaleString()}`,
    eur: `€${Math.round(amount / EUR_RATE).toLocaleString()}`
  };
};

const abbreviatePrice = (priceVal: any) => {
  if (!priceVal) return 'Price on request';
  const numericStr = String(priceVal).replace(/[^0-9]/g, '');
  const amount = parseInt(numericStr);
  if (isNaN(amount)) return priceVal;
  if (amount >= 10000000) return `Rs. ${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `Rs. ${(amount / 100000).toFixed(1)} Lk`;
  return `Rs. ${amount.toLocaleString()}`;
};

interface PropertyDetailProps {
  propertyId: number | string;
  onBack: () => void;
  onPropertyClick: (p: any) => void;
  favorites: Set<number>;
  toggleFavorite: (id: number) => void;
  isAdmin?: boolean;
}

export const PropertyDetail = ({ 
  propertyId, 
  onBack, 
  onPropertyClick,
  favorites,
  toggleFavorite,
  isAdmin 
}: PropertyDetailProps) => {
  const [property, setProperty] = useState<any>(null);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [copiedRef, setCopiedRef] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this property. Please contact me with more information.'
  });

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!propertyId) return;
      setLoading(true);
      try {
        let data = null;
        let error = null;

        if (isNaN(Number(propertyId))) {
          const res = await supabase.from('properties').select('*').eq('slug', propertyId).limit(1);
          if (res.data && res.data.length > 0) {
            data = res.data[0];
          } else {
            const allRes = await supabase.from('properties').select('*').eq('status', 'active');
            if (allRes.data) {
              data = allRes.data.find(p => slugify(p.listing_title || p.title || "") === propertyId);
            }
          }
        } else {
          const res = await supabase.from('properties').select('*').eq('id', Number(propertyId)).single();
          data = res.data;
          error = res.error;
        }

        if (error && !data) throw error;
        if (!data) throw new Error('Property not found');
        
        setProperty(data);

        // Increment view count
        await supabase.from('properties').update({ views_count: (data.views_count || 0) + 1 }).eq('id', data.id);

        // Record detailed analytics view
        let sessionId = sessionStorage.getItem('lp_session_id');
        if (!sessionId) {
          sessionId = Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('lp_session_id', sessionId);
        }
        const deviceType = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';

        await supabase.from('property_views').insert([{
          property_id: data.id,
          property_type: data.type || data.property_category || 'Property',
          district: data.district,
          property_category: data.property_category,
          session_id: sessionId,
          device_type: deviceType,
          referrer: document.referrer || 'direct'
        }]);

        // Fetch similar properties
        const { data: similar } = await supabase
          .from('properties')
          .select('id, listing_title, price_lkr, city, district, images, rooms, bedrooms, bathrooms, land_area, land_unit, floors, floor_area, status, listing_type, type, property_category')
          .eq('district', data.district)
          .eq('status', 'active')
          .neq('id', data.id)
          .limit(3);

        setSimilarProperties(similar || []);
      } catch (error: any) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
    window.scrollTo(0, 0);
  }, [propertyId]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert({
        property_id: property.id,
        assigned_to: property.agent_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        property_title: property.listing_title,
        message: formData.message || property.listing_title || 'Property Inquiry',
        source: 'website',
        stage: 'new',
      });

      if (error) throw error;

      let agentEmail = property.agent_id || 'admin@lankaproperty.lk';
      let agentPhone = '+94 77 123 4567';
      let agentWhatsappKey = '';

      if (property.agent_id) {
        const { data: agentData } = await supabase
          .from('agents')
          .select('*')
          .or(`id.eq."${property.agent_id}",email.eq."${property.agent_id}"`)
          .maybeSingle();

        if (agentData) {
          agentEmail = agentData.email || agentEmail;
          agentPhone = agentData.phone || agentPhone;
          agentWhatsappKey = agentData.whatsapp_api_key || '';
        }
      }

      await triggerNotification('new_inquiry', {
        property_title: property.listing_title,
        property_id: property.id,
        district: property.district || 'Colombo',
        city: property.city || 'Colombo',
        price_lkr: property.price_lkr || 'N/A',
        agent_email: agentEmail,
        agent_phone: agentPhone,
        agent_whatsapp_key: agentWhatsappKey,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        message: formData.message
      });
      
      runLeadFollowUpWorkflow({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      }, property).catch(console.error);

      setInquirySuccess(true);
      toast.success('Inquiry submitted successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: 'I am interested in this property. Please contact me with more information.'
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Inquiry submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranslate = async () => {
    if (translatedDesc) {
      setShowOriginal(!showOriginal);
      return;
    }

    const desc = (property.property_description || property.description || "").trim();
    if (!desc) return;

    setIsTranslating(true);
    try {
      const result = await translateDescription(desc, 'sinhala');
      setTranslatedDesc(result);
      setShowOriginal(false);
      toast.success('Translated successfully!');
    } catch (err) {
      console.error('Translation error:', err);
      toast.error('Could not translate text.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isLoggedIn = localStorage.getItem('owner_logged_in') === 'true' || localStorage.getItem('agent_logged_in') === 'true';
    if (!isLoggedIn) {
      setShowSaveModal(true);
    } else {
      toggleFavorite(Number(property.id));
      const saved = !favorites.has(Number(property.id));
      toast.success(saved ? 'Saved to Favorites!' : 'Removed from Favorites.');
      
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          if (!saved) {
            supabase.from('saved_properties').delete().eq('user_id', user.id).eq('property_id', property.id).then();
          } else {
            supabase.from('saved_properties').insert([{ user_id: user.id, property_id: property.id }]).then();
          }
        }
      });
    }
  };

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    setActiveMobileIndex(index);
  };

  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-6 text-center font-sans">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Property Not Found</h2>
        <p className="text-gray-500 mb-6">The listing you are looking for might have been removed or is unavailable.</p>
        <button onClick={onBack} className="bg-[#004F31] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#003d25] transition-all">
          Go Back Home
        </button>
      </div>
    );
  }

  const images = getPropertyImagesList(property.images);
  const converted = convertPrice(property.price_lkr || property.price);
  
  // Parse description text and word counts
  const fullDesc = (property.property_description || property.description || "").trim();
  const descWords = fullDesc.split(/\s+/);
  const hasLongDesc = descWords.length > 300;
  const truncatedDesc = hasLongDesc ? descWords.slice(0, 300).join(' ') + '...' : fullDesc;
  const activeDescText = showOriginal ? (isDescriptionExpanded ? fullDesc : truncatedDesc) : (translatedDesc || '');

  // Calculate dynamic features table
  const specRows = [
    { label: 'Listing Type', value: property.listing_type || 'For Rent', icon: '🏷️' },
    { label: 'Property Type', value: property.property_type || property.property_category || 'Commercial Building', icon: '🏢' },
    { label: 'Floor Area', value: property.floor_area || property.size || '7,500 Sq.ft', icon: '📐' },
    { label: 'Total Floors', value: property.floors || '4', icon: '🏗️' },
    { label: 'Monthly Rent', value: `Rs. ${(property.price_lkr || property.price || 1500000).toLocaleString()}`, icon: '💰' },
    { label: 'Negotiable', value: property.is_negotiable ? 'Yes' : 'No', icon: '🤝' },
    { label: 'Available From', value: property.available_from || 'Immediately', icon: '📅' },
    { label: 'Condition', value: property.condition || 'Good', icon: '📋' }
  ];

  // Dynamic Category Highlights Cards
  const getHighlightsList = () => {
    const isLand = String(property.property_category || '').toLowerCase() === 'land';
    if (isLand) {
      return [
        { icon: '🏢', value: property.property_category || 'Land', label: 'Property Type' },
        { icon: '📐', value: `${property.land_area || 'N/A'} ${property.land_unit || 'Perches'}`, label: 'Land Area' },
        { icon: '🏗️', value: property.zoning || 'Residential', label: 'Zoning' },
        { icon: '🔑', value: property.listing_type || 'For Sale', label: 'Listing Type' },
      ];
    }
    return [
      { icon: '🏢', value: property.property_type || property.property_category || 'Commercial', label: 'Property Type' },
      { icon: '📐', value: `${property.floor_area || property.size || '7,500'} sq.ft`, label: 'Floor Area' },
      { icon: '🏗️', value: `${property.floors || '4'} Floors`, label: 'Total Floors' },
      { icon: '🔑', value: property.listing_type || 'For Rent', label: 'Listing Type' },
    ];
  };

  // Safe search terms check for amenities
  const getDetectedAmenities = () => {
    const defaultCommercial = ["Air Conditioning", "Parking/Garage", "24-Hour CCTV", "Generator", "3-Phase Electricity", "City Water Supply", "Fiber Internet"];
    const defaultResidential = ["Air Conditioning", "Parking/Garage", "24-Hour CCTV", "City Water Supply", "Fiber Internet", "Hot Water", "Security"];
    const defaultLand = ["3-Phase Electricity", "City Water Supply", "Clear Deeds", "Boundary Wall", "Wide Access Road"];

    const infoStr = `${property.additional_info || ''} ${fullDesc}`.toLowerCase();
    const standardList = [
      { label: "Air Conditioning", terms: ["ac", "air condition", "air-conditioning", "air conditioning"] },
      { label: "Parking/Garage", terms: ["parking", "garage", "car park", "vehicle park"] },
      { label: "24-Hour CCTV", terms: ["cctv", "camera", "surveillance"] },
      { label: "Generator", terms: ["generator", "power backup", "gen-set"] },
      { label: "Solar Power", terms: ["solar"] },
      { label: "City Water Supply", terms: ["water", "tap line", "city water"] },
      { label: "Fiber Internet", terms: ["internet", "fiber", "wifi", "wi-fi"] },
      { label: "3-Phase Electricity", terms: ["3-phase", "3 phase", "electricity"] }
    ];

    const matched = standardList.filter(item => item.terms.some(term => infoStr.includes(term))).map(i => i.label);
    if (matched.length > 0) return matched;
    
    const cat = String(property.property_category || '').toLowerCase();
    if (cat === 'land') return defaultLand;
    if (cat.includes('commercial') || cat.includes('office') || cat.includes('building')) return defaultCommercial;
    return defaultResidential;
  };

  const detectedAmenities = getDetectedAmenities();

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 pb-24 [perspective:1200px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-8">
        
        {/* SECTION 1 — BREADCRUMB */}
        <nav className="flex items-center gap-1.5 text-[13px] text-[#6b7280] mb-4">
          <button onClick={onBack} className="hover:text-[#004F31] transition-colors font-medium">Home</button>
          <span>›</span>
          <span className="hover:text-[#004F31] cursor-pointer transition-colors font-medium">{property.district || 'Colombo'}</span>
          <span>›</span>
          <span className="hover:text-[#004F31] cursor-pointer transition-colors font-medium">{property.city || 'Nugegoda'}</span>
          <span>›</span>
          <span className="text-[#111827] font-semibold truncate max-w-[200px] sm:max-w-xs">{property.listing_title || 'Property Detail'}</span>
        </nav>

        {/* HEADER CARD */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            
            {/* Left Column (60%) */}
            <div className="flex-1 lg:max-w-[60%]">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* For Rent Badge */}
                <span className={`text-[12px] font-bold uppercase px-3.5 py-1 rounded-full border tracking-wide ${
                  String(property.listing_type).toLowerCase() === 'sale' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
                }`}>
                  {property.listing_type ? `FOR ${property.listing_type}` : 'FOR RENT'}
                </span>
                {/* Active status Badge */}
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] px-3.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#15803d] rounded-full animate-pulse" /> Active
                </span>
                {/* Ref No Badge */}
                {property.ref_no && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(property.ref_no);
                      setCopiedRef(true);
                      toast.success('Reference Copied!');
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-200 hover:border-gray-300 px-3 py-1 rounded-full transition-all"
                  >
                    REF NO: <span className="font-mono text-gray-800">{property.ref_no}</span>
                    <Copy size={12} className={copiedRef ? "text-green-600" : ""} />
                  </button>
                )}
              </div>

              {/* Title */}
              <h1 className="text-[22px] sm:text-[28px] font-extrabold text-[#111827] leading-[1.3] mb-3">
                {property.listing_title}
              </h1>

              {/* Location clickable row */}
              <div className="flex items-center gap-1.5 text-[#6b7280] text-sm mb-5 group cursor-pointer hover:text-[#004F31] transition-colors inline-flex">
                <MapPin size={16} className="text-[#6b7280] group-hover:text-[#004F31] transition-colors" />
                <span className="underline font-medium">{property.city ? `${property.city}, ` : ''}{property.district || 'Colombo'}</span>
              </div>

              {/* Specs dividers row */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 border-t border-gray-100 pt-4 text-sm font-medium text-[#374151]">
                <div className="flex items-center gap-1.5">
                  <Home size={18} className="text-[#004F31]" />
                  <span>{property.property_type || property.property_category || 'Commercial'}</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5">
                  <Maximize size={18} className="text-[#004F31]" />
                  <span>{property.floor_area || property.size || '7,500'} Sq.ft</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5">
                  <Tag size={18} className="text-[#004F31]" />
                  <span>{property.listing_type || 'For Rent'}</span>
                </div>
              </div>
            </div>

            {/* Right Column Price Card (40%) */}
            <div className="lg:w-[40%] bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-[#6b7280] uppercase mb-1">
                  {property.listing_type === 'Sale' ? 'SELLING PRICE' : 'MONTHLY RENT'}
                </p>
                
                <div className="flex items-baseline flex-wrap gap-2 mb-2">
                  <span className="text-[32px] sm:text-[36px] font-extrabold text-[#004F31]">
                    Rs. {(property.price_lkr || property.price || 1500000).toLocaleString()}
                  </span>
                  {property.is_negotiable && (
                    <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Negotiable
                    </span>
                  )}
                </div>

                {converted && (
                  <p className="text-xs font-semibold text-[#6b7280] mb-4">
                    {converted.usd} <span className="mx-1">•</span> {converted.eur}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                {/* Contact buttons */}
                <button 
                  onClick={() => window.open(`https://wa.me/94770000000?text=${encodeURIComponent(`I am interested in ${property.listing_title}`)}`, '_blank')}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-[10px] py-3.5 px-5 font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <MessageCircle size={18} /> WhatsApp Owner
                </button>

                <button 
                  onClick={() => window.open(`tel:+94771234567`)}
                  className="w-full bg-white border-2 border-[#004F31] text-[#004F31] hover:bg-[#f0fdf4] rounded-[10px] py-3.5 px-5 font-bold text-[15px] flex items-center justify-center gap-2 transition-all"
                >
                  <Phone size={18} /> Call Now
                </button>

                {/* Save Share actions row */}
                <div className="flex gap-4 justify-center pt-2">
                  <button 
                    onClick={handleSaveClick}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#6b7280] hover:text-[#004F31] transition-all"
                  >
                    <Heart size={16} fill={favorites.has(Number(property.id)) ? '#dc2626' : 'none'} className={favorites.has(Number(property.id)) ? 'text-red-500' : ''} />
                    {favorites.has(Number(property.id)) ? 'Saved' : 'Save'}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button 
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/property/${property.id}`;
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        toast.success('Link copied to clipboard!');
                      });
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#6b7280] hover:text-[#004F31] transition-all"
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* SECTION 2 — PHOTO GALLERY (DESKTOP) */}
        <div className="hidden md:flex gap-4 h-[450px] mb-8 w-full">
          {/* Main Photo (55%) */}
          <div 
            onClick={() => { setLightboxOpen(true); setActiveImageIndex(0); }}
            className="w-[55%] h-full rounded-l-2xl overflow-hidden cursor-zoom-in relative group"
          >
            <img 
              src={images[0]} 
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" 
              alt="Main listing" 
            />
            {/* View All pill button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
              className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md hover:bg-white text-gray-900 font-bold px-4 py-2 rounded-full text-xs shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center gap-1.5 z-10 transition-all hover:scale-105"
            >
              <span>📷</span> View All {images.length} Photos
            </button>
          </div>

          {/* Right side 2x2 grid (45%) */}
          <div className="w-[45%] h-full grid grid-cols-2 grid-rows-2 gap-4">
            {[1, 2, 3, 4].map((idx) => {
              const hasImage = !!images[idx];
              const isLast = idx === 4;
              return (
                <div 
                  key={idx}
                  onClick={() => { if (hasImage) { setLightboxOpen(true); setActiveImageIndex(idx); } }}
                  className={`relative overflow-hidden group ${hasImage ? 'cursor-zoom-in' : 'bg-gray-100'} ${
                    idx === 1 ? 'rounded-tr-2xl' : idx === 3 ? 'rounded-br-2xl' : ''
                  }`}
                >
                  {hasImage ? (
                    <>
                      <img 
                        src={images[idx]} 
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" 
                        alt={`Thumbnail ${idx}`} 
                      />
                      {isLast && images.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10">
                          <span className="text-2xl font-black">📷 +{images.length - 5}</span>
                          <span className="text-xs font-bold tracking-wide uppercase mt-1">More Photos</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-sm">
                      LankaProperty
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE SWIPE GALLERY */}
        <div className="md:hidden relative h-[260px] -mx-4 mb-6 overflow-hidden bg-gray-900">
          <div 
            onScroll={handleMobileScroll}
            className="w-full h-full shrink-0 snap-x snap-mandatory flex overflow-x-auto scroll-smooth scrollbar-none"
          >
            {images.map((img: string, idx: number) => (
              <div 
                key={idx} 
                onClick={() => { setLightboxOpen(true); setActiveImageIndex(idx); }}
                className="w-full h-full shrink-0 snap-center relative cursor-pointer"
              >
                <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 border border-white/15 pointer-events-none">
            {activeMobileIndex + 1} / {images.length}
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeMobileIndex ? 'bg-white w-3' : 'bg-white/50'}`} 
              />
            ))}
          </div>
        </div>

        {/* SECTION 3 — MAIN CONTENT (Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.62fr_1fr] gap-8 items-start">
          
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            
            {/* 3A. KEY HIGHLIGHTS BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getHighlightsList().map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                  <div className="text-[24px] mb-2">{item.icon}</div>
                  <div>
                    <div className="text-base font-bold text-[#111827] line-clamp-1">{item.value}</div>
                    <div className="text-[12px] text-[#6b7280] font-medium mt-0.5">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 3B. PROPERTY DESCRIPTION */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between border-l-4 border-[#004F31] pl-3.5 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827]">Property Description</h2>
                
                {/* Translator button */}
                <button 
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="text-xs font-bold text-[#004F31] hover:text-[#003d25] transition-all bg-[#004F31]/5 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#004F31]/10"
                >
                  <Globe size={14} className={isTranslating ? "animate-spin" : ""} />
                  {isTranslating ? 'Translating...' : !showOriginal ? 'Show English' : 'Translate to Sinhala 🗣️'}
                </button>
              </div>

              {/* Text block */}
              <div className="text-[15px] text-[#374151] leading-[1.8] space-y-4 whitespace-pre-line">
                {activeDescText.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Show more show less */}
              {hasLongDesc && showOriginal && (
                <button 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-4 text-[14px] font-bold text-[#004F31] hover:underline"
                >
                  {isDescriptionExpanded ? 'Show less ↑' : 'Read more ↓'}
                </button>
              )}
            </div>

            {/* 3C. PROPERTY FEATURES */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="border-l-4 border-[#004F31] pl-3.5 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827]">Features & Specifications</h2>
              </div>

              <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100 shadow-inner">
                {specRows.map((row, idx) => (
                  <div 
                    key={idx} 
                    className={`grid grid-cols-2 p-3.5 text-sm font-medium ${idx % 2 === 0 ? 'bg-[#f9fafb]' : 'bg-white'}`}
                  >
                    <div className="text-[#6b7280] flex items-center gap-2">
                      <span>{row.icon}</span>
                      <span>{row.label}</span>
                    </div>
                    <div className="text-[#111827] font-bold text-right">{row.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D. AMENITIES */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="border-l-4 border-[#004F31] pl-3.5 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827]">Features & Amenities</h2>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {detectedAmenities.map((amenity, idx) => (
                  <span 
                    key={idx} 
                    className="flex items-center gap-1.5 bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm"
                  >
                    <span>✅</span> {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* 3E. LOCATION & MAP */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="border-l-4 border-[#004F31] pl-3.5 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827]">Location</h2>
              </div>
              
              <div className="text-sm font-semibold text-[#6b7280] flex items-start gap-1.5 mb-5 leading-normal">
                📍 <span>{property.city ? `${property.city}, ` : ''}{property.district || 'Colombo'}, Sri Lanka</span>
              </div>

              {/* Large styled Map container */}
              <div className="h-[380px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 relative z-10 mb-6">
                <MapContainer 
                  center={[6.8841, 79.9402]} 
                  zoom={14} 
                  className="w-full h-full"
                  zoomControl={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <Marker position={[6.8841, 79.9402]} icon={customMarkerIcon}>
                    <Popup>
                      <div className="text-center font-sans p-1">
                        <p className="font-bold text-gray-900 text-sm">{property.city || 'Nugegoda'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{property.district || 'Colombo'}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Nearby Landmarks card */}
              <div className="bg-gray-50 rounded-xl border border-gray-150 p-5">
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#004F31] mb-4 flex items-center gap-1">
                  <span>📍</span> Nearby Landmarks
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm font-medium">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 text-[11px] font-bold uppercase">🏫 School</span>
                    <span className="text-gray-800 font-bold">0.3km</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 text-[11px] font-bold uppercase">🏥 Hospital</span>
                    <span className="text-gray-800 font-bold">1.1km</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 text-[11px] font-bold uppercase">🏦 Bank</span>
                    <span className="text-gray-800 font-bold">0.4km</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 text-[11px] font-bold uppercase">🛒 Shopping</span>
                    <span className="text-gray-800 font-bold">0.2km</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 text-[11px] font-bold uppercase">🚌 Bus Stop</span>
                    <span className="text-gray-800 font-bold">0.1km</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 text-[11px] font-bold uppercase">⛽ Petrol</span>
                    <span className="text-gray-800 font-bold">0.8km</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 3F. WHO LISTED THIS */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="border-l-4 border-[#004F31] pl-3.5 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827]">Listed By</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white rounded-xl border border-gray-150 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden shadow-inner flex-shrink-0 bg-gray-50 border border-gray-100">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" 
                      className="w-full h-full object-cover" 
                      alt="Agent Avatar" 
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-0.5">{property.agent_name || 'Pradeep Jayawardene'}</h4>
                    <p className="text-xs text-[#004F31] font-semibold mb-1">Commercial Property Specialist</p>
                    <div className="flex items-center gap-1 text-[#f5a623] text-xs font-bold">
                      <span>⭐⭐⭐⭐⭐</span> <span className="text-gray-500 font-semibold">(verified)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto">
                  <button 
                    onClick={() => window.open(`https://wa.me/94770000000`, '_blank')}
                    className="flex-1 sm:flex-initial bg-[#25D366] text-white py-2 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                  <button 
                    onClick={() => window.open(`tel:+94771234567`)}
                    className="flex-1 sm:flex-initial border border-gray-200 text-gray-700 py-2 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-all"
                  >
                    <Phone size={14} /> Call
                  </button>
                </div>
              </div>
            </div>

            {/* 3G. REPORT LISTING */}
            <div className="pt-4 text-center">
              <button 
                onClick={() => {
                  toast.success('Thank you! Report received and will be reviewed.');
                }}
                className="text-xs font-semibold text-[#9ca3af] hover:text-[#dc2626] transition-colors"
              >
                ⚠️ Report this listing as incorrect or fraudulent →
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN — STICKY CONTACT CARD */}
          <div className="space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <h3 className="text-sm font-extrabold tracking-wider text-[#6b7280] uppercase border-b border-gray-100 pb-3 mb-5">
                CONTACT OWNER / AGENT
              </h3>

              {/* Agent Quick View */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150" 
                    className="w-full h-full object-cover" 
                    alt="Agent" 
                  />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 leading-none mb-1">
                    {property.agent_name || 'Pradeep Jayawardene'}
                  </h4>
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="bg-green-50 text-[#15803d] text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-0.5">
                      ⭐ Verified
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold">Response: Within a few hours</p>
                </div>
              </div>

              {/* Message form */}
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Your Name *</label>
                  <input 
                    type="text" 
                    placeholder="Abhishek Dewminaa" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F31]/10 focus:border-[#004F31] transition-all placeholder:text-gray-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Phone / WhatsApp *</label>
                  <input 
                    type="tel" 
                    placeholder="+94 77 123 4567" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F31]/10 focus:border-[#004F31] transition-all placeholder:text-gray-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Message</label>
                  <textarea 
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F31]/10 focus:border-[#004F31] transition-all resize-none"
                  />
                </div>

                {inquirySuccess ? (
                  <div className="p-3 bg-green-50 text-[#15803d] border border-[#bbf7d0] rounded-xl text-center text-xs font-bold animate-pulse">
                    📩 Message sent! We will contact you soon.
                  </div>
                ) : (
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#004F31] hover:bg-[#003d25] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Sending...' : '📩 Send Message'}
                  </button>
                )}
              </form>

              {/* Safety lock */}
              <div className="border-t border-gray-100 mt-5 pt-4 text-center">
                <span className="text-[11px] font-semibold text-gray-400 flex items-center justify-center gap-1.5">
                  <Lock size={12} className="text-[#004F31]" /> Your details stay private
                </span>
              </div>

              {/* Meta stats list */}
              <div className="border-t border-gray-100 mt-4 pt-4 text-xs font-semibold text-[#6b7280] space-y-2">
                <div className="flex justify-between">
                  <span>📅 Listed Date</span>
                  <span className="text-[#111827]">28 June 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>🆙 Updated</span>
                  <span className="text-[#111827]">30 June 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>🆔 Listing Ref</span>
                  <span className="text-[#111827] font-mono">LP{property.id || '0186'}</span>
                </div>
                <div className="flex justify-between">
                  <span>👁️ Property Views</span>
                  <span className="text-[#004F31] font-bold">{(property.views_count || property.views || 1247).toLocaleString()} views</span>
                </div>
              </div>

            </div>

            {/* Quick safety banner */}
            <div className="bg-[#eff6ff] rounded-2xl border border-[#bfdbfe]/50 p-5 flex gap-3.5 items-start">
              <span className="text-[20px] bg-white rounded-lg p-1.5 shadow-sm">🔒</span>
              <p className="text-[11px] leading-relaxed text-[#1d4ed8]/80 font-semibold">
                <strong className="text-[#1d4ed8] block mb-0.5">Safety Tip</strong>
                Never send money in advance as a deposit. Real estate transactions must always be validated in person.
              </p>
            </div>

          </div>

        </div>

        {/* SECTION 4 — SIMILAR PROPERTIES */}
        {similarProperties.length > 0 && (
          <section className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex items-baseline justify-between mb-8">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                🏢 Similar Properties in {property.city || 'Nugegoda'}
              </h3>
              <button 
                onClick={onBack}
                className="text-xs font-extrabold text-[#004F31] hover:underline"
              >
                View All Properties in {property.city || 'Nugegoda'} →
              </button>
            </div>

            {/* Slider carousel row on mobile, Grid on desktop */}
            <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
              {similarProperties.map((prop, idx) => {
                const cover = getPropertyImage(prop.images);
                const isSaved = favorites.has(Number(prop.id));
                return (
                  <div 
                    key={idx}
                    onClick={() => onPropertyClick(prop)}
                    className="shrink-0 w-[280px] md:w-full snap-center bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    {/* Cover image container */}
                    <div className="relative h-48 overflow-hidden bg-gray-50">
                      <img 
                        src={cover} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                        alt={prop.listing_title} 
                      />
                      {/* For Sale Badge */}
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black tracking-widest px-2 py-1 rounded">
                        {String(prop.listing_type || 'Sale').toUpperCase()}
                      </span>
                      {/* Favorite save button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(Number(prop.id));
                          toast.success(isSaved ? 'Removed from favorites' : 'Saved to favorites!');
                        }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md transition-all"
                      >
                        <Heart size={14} fill={isSaved ? '#dc2626' : 'none'} className={isSaved ? 'text-red-500' : 'text-gray-600'} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-gray-900 font-extrabold text-sm line-clamp-2 leading-snug mb-1">
                          {prop.listing_title}
                        </h4>
                        <p className="text-[11px] text-[#6b7280] font-semibold mb-3">
                          📍 {prop.city}, {prop.district}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#004F31] font-extrabold text-base mb-2">
                          Rs. {(prop.price_lkr || prop.price || 1500000).toLocaleString()}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 border-t border-gray-100 pt-3">
                          <span className="flex items-center gap-1">🏢 {prop.property_type || prop.property_category || 'Property'}</span>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-1">📐 {prop.floor_area || prop.size || '5,500'} sqft</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </section>
        )}

      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] py-3.5 px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-[90] pb-safe flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-gray-400 block tracking-wider">MONTHLY</span>
          <span className="text-base font-extrabold text-[#004F31] block leading-none">
            {abbreviatePrice(property.price_lkr || property.price)}
          </span>
        </div>

        <div className="flex gap-2.5">
          <button 
            onClick={() => window.open(`https://wa.me/94770000000?text=${encodeURIComponent(`I am interested in ${property.listing_title}`)}`, '_blank')}
            className="bg-[#25D366] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <MessageCircle size={15} /> WhatsApp
          </button>
          
          <button 
            onClick={() => window.open(`tel:+94771234567`)}
            className="bg-white border-2 border-[#004F31] text-[#004F31] py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Phone size={15} /> Call
          </button>
        </div>
      </div>

      {/* LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {lightboxOpen && (
          <div 
            className="fixed inset-0 z-[1000] bg-black/95 flex flex-col justify-between"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setLightboxOpen(false);
              if (e.key === 'ArrowRight') setActiveImageIndex((activeImageIndex + 1) % images.length);
              if (e.key === 'ArrowLeft') setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length);
            }}
            ref={(el) => el?.focus()}
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center text-white z-20">
              <span className="text-sm font-bold tracking-widest uppercase">
                {activeImageIndex + 1} of {images.length}
              </span>
              <button 
                onClick={() => setLightboxOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>

            {/* Main view frame */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              <button 
                onClick={() => setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all"
              >
                <ChevronLeft size={32} />
              </button>

              <img 
                src={images[activeImageIndex]} 
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl" 
                alt="Lightbox view" 
              />

              <button 
                onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            {/* Bottom thumbnail selector strip */}
            <div className="p-4 overflow-x-auto flex gap-3.5 scrollbar-none justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    idx === activeImageIndex ? 'border-[#004F31] scale-105' : 'border-transparent opacity-50'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="Selector thumb" />
                </button>
              ))}
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* SAVE / FAVORITES SIGN IN REQUIRED MODAL */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 font-sans"
            >
              <button 
                onClick={() => setShowSaveModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#004F31]/10 text-[#004F31] flex items-center justify-center mx-auto mb-2">
                  <Heart size={24} className="fill-current" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900">Login to save this property</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Join LankaProperty.lk today to save your favorite real estate listings, sync them across devices, and get instant updates!
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      window.history.pushState({}, '', '/owner/login');
                      window.location.reload();
                    }}
                    className="bg-[#004F31] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#003d25] transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      window.history.pushState({}, '', '/owner/register');
                      window.location.reload();
                    }}
                    className="border-2 border-[#004F31] text-[#004F31] py-3 rounded-xl font-bold text-sm hover:bg-[#f0fdf4] transition-all"
                  >
                    Register
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Shimmering skeleton loader structure
const PropertyDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 pb-24 animate-pulse">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-8">
        
        {/* Breadcrumb shim */}
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />

        {/* Header card shim */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-24" />
                <div className="h-6 bg-gray-200 rounded-full w-20" />
              </div>
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="w-full lg:w-[35%] space-y-3">
              <div className="h-10 bg-gray-200 rounded w-1/2 ml-auto" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Gallery shim */}
        <div className="hidden md:flex gap-4 h-[450px] mb-8">
          <div className="w-[55%] bg-gray-200 rounded-l-2xl h-full" />
          <div className="w-[45%] grid grid-cols-2 grid-rows-2 gap-4 h-full">
            <div className="bg-gray-200" />
            <div className="bg-gray-200 rounded-tr-2xl" />
            <div className="bg-gray-200" />
            <div className="bg-gray-200 rounded-br-2xl" />
          </div>
        </div>

        <div className="md:hidden h-[260px] bg-gray-200 rounded-xl mb-6" />

        {/* Content grid shim */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-20 bg-gray-200 rounded-xl" />
              <div className="h-20 bg-gray-200 rounded-xl" />
              <div className="h-20 bg-gray-200 rounded-xl" />
              <div className="h-20 bg-gray-200 rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl p-6 space-y-4 h-64 border border-gray-200" />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 h-96 border border-gray-200" />
          </div>
        </div>

      </div>
    </div>
  );
};
