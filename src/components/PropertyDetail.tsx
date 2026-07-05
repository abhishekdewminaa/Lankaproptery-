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

const getOptimizedImageUrl = (url: string, type: 'main' | 'thumb' | 'lightbox') => {
  if (!url) return '/placeholder-property.jpg';
  
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const baseUrl = url.replace('/object/public/', '/render/image/public/');
    if (type === 'main') {
      return `${baseUrl}?width=900&height=600&resize=cover&quality=85`;
    } else if (type === 'thumb') {
      return `${baseUrl}?width=400&height=280&resize=cover&quality=75`;
    } else {
      return `${baseUrl}?width=1600&quality=90`;
    }
  }
  
  if (url.includes('unsplash.com')) {
    const baseUnsplash = url.split('?')[0];
    if (type === 'main') {
      return `${baseUnsplash}?auto=format&fit=crop&w=900&h=600&q=85`;
    } else if (type === 'thumb') {
      return `${baseUnsplash}?auto=format&fit=crop&w=400&h=280&q=75`;
    } else {
      return `${baseUnsplash}?auto=format&fit=crop&w=1600&q=90`;
    }
  }
  
  return url;
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
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  // Lazy loading visibility states
  const [belowFoldVisible, setBelowFoldVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [similarVisible, setSimilarVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  // Refs for Lazy loading
  const mapRef = useRef<HTMLDivElement>(null);
  const similarRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this property. Please contact me with more information.'
  });

  // Load below-the-fold content after 1 second or on scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      setBelowFoldVisible(true);
    }, 1000);

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setBelowFoldVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Map IntersectionObserver
  useEffect(() => {
    if (!property) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setMapVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );
    if (mapRef.current) {
      observer.observe(mapRef.current);
    }
    return () => observer.disconnect();
  }, [property]);

  // Similar Properties IntersectionObserver
  useEffect(() => {
    if (!property) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSimilarVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '300px' }
    );
    if (similarRef.current) {
      observer.observe(similarRef.current);
    }
    return () => observer.disconnect();
  }, [property]);

  // Contact Form IntersectionObserver
  useEffect(() => {
    if (!property) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setContactVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '250px' }
    );
    if (contactRef.current) {
      observer.observe(contactRef.current);
    }
    return () => observer.disconnect();
  }, [property]);

  const trackViewsNonBlocking = (data: any) => {
    // Increment view count (fire and forget - no await)
    supabase.from('properties')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', data.id)
      .then();

    // RPC as a fallback or extra reliable step
    supabase.rpc('increment_property_views', { prop_id: data.id })
      .then(null, () => {});

    // Detailed analytics
    let sessionId = sessionStorage.getItem('lp_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('lp_session_id', sessionId);
    }
    const deviceType = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';

    supabase.from('property_views').insert([{
      property_id: data.id,
      property_type: data.type || data.property_category || 'Property',
      district: data.district,
      property_category: data.property_category,
      session_id: sessionId,
      device_type: deviceType,
      referrer: document.referrer || 'direct'
    }]).then();
  };

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!propertyId) return;
      
      // FIX 4: Check sessionStorage cache first
      const cacheKey = `property_${propertyId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { property: cachedProp, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          if (age < 5 * 60 * 1000) {
            setProperty(cachedProp);
            setLoading(false);
            
            // Fire view tracking in background
            trackViewsNonBlocking(cachedProp);
            return;
          }
        } catch (e) {
          console.error('Error parsing cache', e);
        }
      }

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
        
        // Save to cache
        sessionStorage.setItem(cacheKey, JSON.stringify({
          property: data,
          timestamp: Date.now()
        }));

        // Fire view tracking in background
        trackViewsNonBlocking(data);

      } catch (error: any) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
    window.scrollTo(0, 0);
  }, [propertyId]);

  // Fetch similar properties lazily on intersection
  useEffect(() => {
    if (!property || !similarVisible) return;

    const fetchSimilar = async () => {
      try {
        const cacheKey = `similar_${property.district}_${property.id}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setSimilarProperties(data || []);
            return;
          }
        }

        const { data: similar } = await supabase
          .from('properties')
          .select('id, listing_title, price_lkr, city, district, images, rooms, bedrooms, bathrooms, land_area, land_unit, floors, floor_area, status, listing_type, type, property_category')
          .eq('district', property.district)
          .eq('status', 'active')
          .neq('id', property.id)
          .limit(3);

        const result = similar || [];
        setSimilarProperties(result);
        
        // Cache similar properties
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Error fetching similar properties', err);
      }
    };

    fetchSimilar();
  }, [property, similarVisible]);

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
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-6 space-y-4">
        
        {/* SECTION 1 — PHOTO GALLERY (DESKTOP) */}
        <div className="hidden md:flex gap-2 h-[460px] w-full relative rounded-2xl overflow-hidden shadow-sm">
          {/* Main Photo (60%) */}
          <div 
            onClick={() => { setLightboxOpen(true); setActiveImageIndex(0); }}
            className="w-[60%] h-full overflow-hidden cursor-zoom-in relative group"
          >
            <img 
              src={getOptimizedImageUrl(images[0], 'main')} 
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" 
              referrerPolicy="no-referrer"
              alt="Main listing" 
            />
            {/* For Sale / For Rent badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className={`text-[12px] font-extrabold uppercase px-3.5 py-1.5 rounded-md shadow-md tracking-wider text-white ${
                String(property.listing_type).toLowerCase() === 'sale' 
                  ? 'bg-red-600' 
                  : 'bg-blue-600'
              }`}>
                {String(property.listing_type).toLowerCase() === 'sale' ? '🔴 FOR SALE' : '🔵 FOR RENT'}
              </span>
            </div>
            {/* ⭐ Featured badge */}
            {property.is_featured && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-[#004F31] text-white text-[12px] font-extrabold px-3 py-1.5 rounded-md shadow-md flex items-center gap-1">
                  ⭐ FEATURED
                </span>
              </div>
            )}
            
            {/* View All pill button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
              className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md hover:bg-white text-gray-900 font-bold px-4 py-2 rounded-full text-xs shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center gap-1.5 z-10 transition-all hover:scale-105 cursor-pointer"
            >
              <span>📷</span> View All {images.length} Photos
            </button>
          </div>

          {/* Right side 2x2 grid (40%) */}
          <div className="w-[40%] h-full grid grid-cols-2 grid-rows-2 gap-2 bg-gray-50">
            {[1, 2, 3, 4].map((idx) => {
              const hasImage = !!images[idx];
              const isLast = idx === 4;
              return (
                <div 
                  key={idx}
                  onClick={() => { if (hasImage) { setLightboxOpen(true); setActiveImageIndex(idx); } }}
                  className={`relative overflow-hidden h-full ${hasImage ? 'cursor-zoom-in' : 'bg-gray-100'} group`}
                >
                  {hasImage ? (
                    <>
                      <img 
                        src={getOptimizedImageUrl(images[idx], 'thumb')} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" 
                        referrerPolicy="no-referrer"
                        alt={`Thumbnail ${idx}`} 
                      />
                      {isLast && images.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10">
                          <span className="text-xl font-black">📷 +{images.length - 5}</span>
                          <span className="text-[10px] font-bold tracking-wide uppercase mt-1">More Photos</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs">
                      LankaProperty
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE SWIPE GALLERY */}
        <div className="md:hidden relative h-[260px] -mx-4 overflow-hidden bg-gray-900">
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
                <img 
                  src={idx === 0 ? getOptimizedImageUrl(img, 'main') : getOptimizedImageUrl(img, 'thumb')} 
                  loading={idx === 0 ? "eager" : "lazy"} 
                  alt={`Slide ${idx}`} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </div>
            ))}
          </div>

          {/* Badges on mobile */}
          <div className="absolute top-4 left-4 z-10">
            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded shadow-md tracking-wider text-white ${
              String(property.listing_type).toLowerCase() === 'sale' 
                ? 'bg-red-600' 
                : 'bg-blue-600'
            }`}>
              {String(property.listing_type).toLowerCase() === 'sale' ? '🔴 SALE' : '🔵 RENT'}
            </span>
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

        {/* SECTION 2 — TITLE + PRICE HEADER */}
        <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          {/* Breadcrumb at the top of the card */}
          <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#9ca3af] mb-4 border-b border-gray-100 pb-4">
            <button onClick={onBack} className="hover:text-[#004F31] transition-colors font-medium cursor-pointer">Home</button>
            <span>›</span>
            <span className="hover:text-[#004F31] cursor-pointer transition-colors font-medium">{property.district || 'Colombo'}</span>
            <span>›</span>
            <span className="hover:text-[#004F31] cursor-pointer transition-colors font-medium">{property.city || 'Nugegoda'}</span>
            <span>›</span>
            <span className="text-[#111827] font-semibold truncate max-w-[200px] sm:max-w-xs">{property.listing_title || 'Property Detail'}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-8">
            {/* Left Column (65%) */}
            <div className="space-y-4">
              {/* Status Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[12px] font-bold uppercase px-3 py-1 rounded-full border tracking-wide ${
                  String(property.listing_type).toLowerCase() === 'sale' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
                }`}>
                  {String(property.listing_type).toLowerCase() === 'sale' ? '🔴 FOR SALE' : '🔵 FOR RENT'}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] px-3.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#15803d] rounded-full animate-pulse" /> Active
                </span>
                {property.ref_no ? (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(property.ref_no);
                      setCopiedRef(true);
                      toast.success('Reference Copied!');
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-200 hover:border-gray-300 px-3 py-1 rounded-full transition-all cursor-pointer"
                  >
                    REF: <span className="font-mono text-gray-800">{property.ref_no}</span> 📋
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`LP${property.id || '0186'}`);
                      setCopiedRef(true);
                      toast.success('Reference Copied!');
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-200 hover:border-gray-300 px-3 py-1 rounded-full transition-all cursor-pointer"
                  >
                    REF: <span className="font-mono text-gray-800">LP{property.id || '0186'}</span> 📋
                  </button>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#111827] leading-[1.3] tracking-tight">
                {property.listing_title}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-[#6b7280] text-[14px]">
                <span>📍</span>
                <span className="font-medium">{property.city ? `${property.city}, ` : ''}{property.district || 'Colombo'}</span>
              </div>

              {/* Quick Specs Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] font-medium text-[#374151] pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span>🏢</span>
                  <span>{property.property_type || property.property_category || 'Commercial'}</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span>📐</span>
                  <span>{property.floor_area || property.size || '7,500'} sq.ft</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span>🔑</span>
                  <span>{property.listing_type || 'For Rent'}</span>
                </div>
              </div>
            </div>

            {/* Right Column (35%) Price Card */}
            <div>
              <div className="bg-[#fcfdfd] border border-[#e5e7eb] rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    {String(property.listing_type).toLowerCase() === 'sale' ? 'SELLING PRICE' : 'MONTHLY RENT'}
                  </p>
                  <div className="flex items-baseline flex-wrap gap-2">
                    <span className="text-[32px] font-black text-[#004F31]">
                      Rs. {(property.price_lkr || property.price || 1500000).toLocaleString()}
                    </span>
                    {property.is_negotiable && (
                      <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Negotiable
                      </span>
                    )}
                  </div>
                  {converted && (
                    <p className="text-xs font-semibold text-[#6b7280] mt-1">
                      {converted.usd} <span className="mx-1">·</span> {converted.eur}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => window.open(`https://wa.me/94770000000?text=${encodeURIComponent(`I am interested in ${property.listing_title}`)}`, '_blank')}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl py-3.5 px-5 font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span>💬</span> WhatsApp Now
                  </button>

                  <button 
                    onClick={() => window.open(`tel:+94771234567`)}
                    className="w-full bg-white border-2 border-[#004F31] text-[#004F31] hover:bg-[#f0fdf4] rounded-xl py-3.5 px-5 font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>📞</span> Call Now
                  </button>
                </div>

                <div className="flex justify-center gap-4 border-t border-gray-100 pt-3">
                  <button 
                    onClick={handleSaveClick}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#6b7280] hover:text-[#004F31] transition-all cursor-pointer"
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
                    className="flex items-center gap-1.5 text-xs font-bold text-[#6b7280] hover:text-[#004F31] transition-all cursor-pointer"
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — PROPERTY DETAILS */}
        
        {/* 3A. KEY HIGHLIGHTS BAR */}
        <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getHighlightsList().map((item, idx) => (
              <div key={idx} className="border border-[#e5e7eb] rounded-[14px] p-5 flex flex-col justify-between hover:shadow-sm transition-all bg-white">
                <div className="text-[28px] text-[#004F31] mb-2">{item.icon}</div>
                <div>
                  <div className="text-base font-bold text-[#111827]">{item.value}</div>
                  <div className="text-[12px] text-[#9ca3af] mt-0.5">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3B. PROPERTY DESCRIPTION */}
        {belowFoldVisible ? (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-[#004F31] pl-3 mb-6">
              <h2 className="text-lg font-bold text-[#111827]">Property Description</h2>
              
              {/* Translator button */}
              <button 
                onClick={handleTranslate}
                disabled={isTranslating}
                className="text-xs font-bold text-[#004F31] hover:text-[#003d25] transition-all bg-[#004F31]/5 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#004F31]/10 cursor-pointer"
              >
                <Globe size={14} className={isTranslating ? "animate-spin" : ""} />
                {isTranslating ? 'Translating...' : !showOriginal ? 'Show English' : 'Translate to Sinhala 🗣️'}
              </button>
            </div>

            {/* Text block */}
            <div className={`text-[15px] text-[#374151] leading-[1.8] space-y-4 whitespace-pre-line overflow-hidden transition-all duration-300 ${!isDescriptionExpanded ? 'max-h-[140px] relative' : 'max-h-none'}`}>
              {activeDescText.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
              {!isDescriptionExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
            </div>

            {showOriginal && (
              <button 
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-4 text-[14px] font-bold text-[#004F31] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                {isDescriptionExpanded ? 'Show Less ↑' : 'Read More ↓'}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] skeleton-pulse h-48 flex flex-col justify-center items-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#004F31]/20 border-t-[#004F31] animate-spin mb-2" />
            <div className="text-xs font-bold text-gray-400">Loading Description...</div>
          </div>
        )}

        {/* 3C. FEATURES & SPECIFICATIONS */}
        {belowFoldVisible ? (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] animate-fade-in">
            <div className="border-l-4 border-[#004F31] pl-3 mb-6">
              <h2 className="text-lg font-bold text-[#111827]">Features & Specifications</h2>
            </div>

            <div className="rounded-xl border border-[#e5e7eb] overflow-hidden divide-y divide-[#e5e7eb]">
              {specRows.map((row, idx) => (
                <div 
                  key={idx} 
                  className={`grid grid-cols-2 p-3 sm:p-4 text-sm font-medium ${idx % 2 === 0 ? 'bg-[#f9fafb]' : 'bg-white'}`}
                >
                  <div className="text-[#6b7280] flex items-center gap-2">
                    <span className="text-base">{row.icon}</span>
                    <span>{row.label}</span>
                  </div>
                  <div className="text-[#111827] font-bold text-right">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] skeleton-pulse h-48 flex flex-col justify-center items-center">
            <div className="text-xs font-bold text-gray-400">Loading Specifications...</div>
          </div>
        )}

        {/* 3D. FEATURES & AMENITIES */}
        {belowFoldVisible ? (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] animate-fade-in">
            <div className="border-l-4 border-[#004F31] pl-3 mb-6">
              <h2 className="text-lg font-bold text-[#111827]">Features & Amenities</h2>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {detectedAmenities.map((amenity, idx) => (
                <span 
                  key={idx} 
                  className="flex items-center gap-1.5 bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] rounded-full px-4 py-1.5 text-[13px] font-medium"
                >
                  <span>✅</span> {amenity}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] skeleton-pulse h-24 flex flex-col justify-center items-center">
            <div className="text-xs font-bold text-gray-400">Loading Amenities...</div>
          </div>
        )}

        {/* 3E. LOCATION & MAP */}
        <div ref={mapRef} className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <div className="border-l-4 border-[#004F31] pl-3 mb-4">
            <h2 className="text-lg font-bold text-[#111827]">Location</h2>
          </div>
          
          <div className="text-sm font-semibold text-[#6b7280] flex items-start gap-1.5 mb-5 leading-normal">
            <span>📍</span> 
            <span>
              {property.address || 'Stanley Tilakaratne Mawatha'}<br />
              {property.city ? `${property.city}, ` : ''}{property.district || 'Colombo'}, Sri Lanka
            </span>
          </div>

          {/* Map container */}
          <div className="h-[380px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 relative z-10 mb-6 bg-gray-100 flex flex-col items-center justify-center">
            {mapVisible ? (
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
            ) : (
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full border-4 border-[#004F31]/20 border-t-[#004F31] animate-spin mx-auto" />
                <div className="text-sm font-bold text-gray-400">Loading Map...</div>
              </div>
            )}
          </div>

          {/* Nearby landmarks grid */}
          <div className="bg-[#f9fafb] rounded-[10px] p-5 border border-[#e5e7eb]">
            <p className="text-xs font-black uppercase tracking-widest text-[#004F31] mb-4 flex items-center gap-1">
              <span>📍</span> Nearby Landmarks
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span>🏫</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">School</span>
                  <span className="text-gray-850 font-bold text-sm">0.3km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🏥</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">Hospital</span>
                  <span className="text-gray-850 font-bold text-sm">1.1km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🏦</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">Bank</span>
                  <span className="text-gray-850 font-bold text-sm">0.5km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🛒</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">Shopping</span>
                  <span className="text-gray-850 font-bold text-sm">0.2km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🚌</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">Bus Stop</span>
                  <span className="text-gray-850 font-bold text-sm">0.1km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>⛽</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">Petrol</span>
                  <span className="text-gray-850 font-bold text-sm">0.8km</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 — CONTACT DETAILS */}
        <div ref={contactRef} className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <div className="border-l-4 border-[#004F31] pl-3 mb-6">
            <h2 className="text-lg font-bold text-[#111827]">Contact the Owner / Agent</h2>
          </div>
          
          {contactVisible ? (
            <div className="grid grid-cols-1 lg:grid-cols-[4.5fr_5.5fr] gap-8 animate-fade-in">
              {/* LEFT COLUMN: Agent/Owner Info (45%) */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 bg-gray-50">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" 
                      className="w-full h-full object-cover" 
                      alt="Agent Avatar" 
                    />
                  </div>
                  <div>
                    <h4 className="text-[18px] font-bold text-gray-900">{property.agent_name || 'Pradeep Jayawardene'}</h4>
                    <p className="text-xs text-[#004F31] font-semibold">Commercial Property Owner</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[#f5a623] text-xs font-bold">
                      <span>⭐⭐⭐⭐⭐</span> 
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]">Verified Seller ✅</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-semibold mt-1">Member since: May 2024</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-3">
                  <button 
                    onClick={() => window.open(`https://wa.me/94770000000?text=${encodeURIComponent(`I am interested in ${property.listing_title}`)}`, '_blank')}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl py-3.5 px-5 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <span>💬</span> WhatsApp Now
                  </button>

                  {phoneRevealed ? (
                    <button 
                      onClick={() => window.open(`tel:+94771234567`)}
                      className="w-full bg-white border-2 border-[#004F31] text-[#004F31] hover:bg-[#f0fdf4] rounded-xl py-3.5 px-5 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>📞</span> Call: +94 77 123 4567
                    </button>
                  ) : (
                    <div className="space-y-2 text-center">
                      <p className="text-xs text-gray-400 font-semibold">📞 Phone number hidden for privacy</p>
                      <button 
                        onClick={() => setPhoneRevealed(true)}
                        className="text-[#004F31] hover:underline font-bold text-sm cursor-pointer"
                      >
                        🔓 Click to Reveal Number
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs space-y-1.5 text-gray-500 font-medium">
                  <p>⚡ Response time: Usually replies within 1 hour</p>
                  <p>🗣️ Languages: Sinhala, English</p>
                </div>
              </div>

              {/* RIGHT COLUMN: Contact Form (55%) */}
              <div className="bg-[#f9fafb] p-6 rounded-2xl border border-gray-100">
                <h3 className="text-base font-bold text-[#111827] mb-4">Send a Message</h3>

                {inquirySuccess ? (
                  <div className="p-6 bg-white text-[#15803d] border border-[#bbf7d0] rounded-xl text-center space-y-3 shadow-sm animate-in fade-in duration-300">
                    <div className="text-lg font-bold">✅ Message Sent!</div>
                    <p className="text-xs text-gray-600">The owner will contact you shortly.</p>
                    <button 
                      onClick={() => setInquirySuccess(false)}
                      className="text-xs font-extrabold text-[#004F31] hover:underline cursor-pointer"
                    >
                      [Send Another Message]
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Your Name *</label>
                      <input 
                        type="text" 
                        placeholder="Your Full Name" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F31]/10 focus:border-[#004F31] transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Your Phone / WhatsApp *</label>
                      <input 
                        type="tel" 
                        placeholder="+94 77 123 4567" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F31]/10 focus:border-[#004F31] transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Your Email</label>
                      <input 
                        type="email" 
                        placeholder="your.email@example.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F31]/10 focus:border-[#004F31] transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Your Message</label>
                      <textarea 
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F31]/10 focus:border-[#004F31] transition-all resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#004F31] hover:bg-[#003d25] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {isSubmitting ? 'Sending...' : '📩 Send Message →'}
                    </button>

                    <p className="text-[11px] text-gray-400 text-center">
                      🔒 Your personal details are kept private and only shared with the seller.
                    </p>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center space-y-2">
              <div className="w-8 h-8 rounded-full border-4 border-[#004F31]/20 border-t-[#004F31] animate-spin" />
              <p className="text-xs text-gray-400 font-bold">Loading contact info...</p>
            </div>
          )}
        </div>

        {/* SECTION 5 — SIMILAR PROPERTIES */}
        <div ref={similarRef} className="min-h-[50px] w-full">
          {similarVisible && (
            similarProperties.length > 0 ? (
              <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] animate-fade-in">
                <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                    <span>▌</span> Similar Properties in {property.city || 'Nugegoda'}
                  </h3>
                </div>

                <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible">
                  {similarProperties.map((prop, idx) => {
                    const cover = getPropertyImage(prop.images);
                    const isSaved = favorites.has(Number(prop.id));
                    return (
                      <div 
                        key={idx}
                        onClick={() => onPropertyClick(prop)}
                        className="shrink-0 w-[280px] md:w-full snap-center bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      >
                        {/* Cover photo */}
                        <div className="relative h-[200px] overflow-hidden bg-gray-50">
                          <img 
                            src={getOptimizedImageUrl(cover, 'thumb')} 
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                            referrerPolicy="no-referrer"
                            alt={prop.listing_title} 
                          />
                          <span className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black tracking-widest px-2 py-1 rounded">
                            {String(prop.listing_type || 'Sale').toUpperCase()}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(Number(prop.id));
                              toast.success(isSaved ? 'Removed from favorites' : 'Saved to favorites!');
                            }}
                            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer"
                          >
                            <Heart size={14} fill={isSaved ? '#dc2626' : 'none'} className={isSaved ? 'text-red-500' : 'text-gray-650'} />
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

                            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 border-t border-gray-100 pt-3">
                              <span className="flex items-center gap-1">🏢 {prop.property_type || prop.property_category || 'Property'}</span>
                              <span className="flex items-center gap-1">📐 {prop.floor_area || prop.size || '5,550'} sqft</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-right">
                  <button 
                    onClick={onBack}
                    className="text-xs font-extrabold text-[#004F31] hover:underline cursor-pointer"
                  >
                    View All Properties in {property.city || 'Nugegoda'} →
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] skeleton-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="h-64 bg-gray-100 rounded-2xl flex items-center justify-center text-xs font-bold text-gray-400">Loading Similar...</div>
                  <div className="h-64 bg-gray-100 rounded-2xl flex items-center justify-center text-xs font-bold text-gray-400">Loading Similar...</div>
                  <div className="h-64 bg-gray-100 rounded-2xl flex items-center justify-center text-xs font-bold text-gray-400">Loading Similar...</div>
                </div>
              </div>
            )
          )}
        </div>

        {/* LISTING METADATA (small, bottom of page) */}
        <div className="text-center space-y-3 pt-6 text-xs font-semibold text-[#6b7280]">
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1.5">
            <span>📅 Listed: 28 June 2026</span>
            <span className="text-gray-300">|</span>
            <span>🔄 Updated: 30 June 2026</span>
            <span className="text-gray-300">|</span>
            <span>🆔 REF: LP{property.id || '0186'}</span>
            <span className="text-gray-300">|</span>
            <span>👁️ {(property.views_count || property.views || 1247).toLocaleString()} Views</span>
          </div>
          <div>
            <button 
              onClick={() => {
                toast.success('Thank you! Report received and will be reviewed.');
              }}
              className="text-xs font-semibold text-[#9ca3af] hover:text-[#dc2626] transition-colors cursor-pointer"
            >
              ⚠️ Report this listing
            </button>
          </div>
        </div>

      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-[#e5e7eb] px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-[90] pb-safe flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <span className="text-[10px] font-bold text-gray-400 block tracking-wider">MONTHLY</span>
          <span className="text-base font-extrabold text-[#004F31] block leading-none">
            {abbreviatePrice(property.price_lkr || property.price)}
          </span>
        </div>

        <div className="flex gap-2 flex-1 justify-end">
          <button 
            onClick={() => window.open(`https://wa.me/94770000000?text=${encodeURIComponent(`I am interested in ${property.listing_title}`)}`, '_blank')}
            className="flex-1 bg-[#25D366] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
          >
            <span>💬</span> WhatsApp
          </button>
          
          <button 
            onClick={() => window.open(`tel:+94771234567`)}
            className="flex-1 bg-white border border-[#004F31] text-[#004F31] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            <span>📞</span> Call
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
                className="p-2 hover:bg-white/10 rounded-full transition-all cursor-pointer"
              >
                <X size={28} />
              </button>
            </div>

            {/* Main view frame */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              <button 
                onClick={() => setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all cursor-pointer"
              >
                <ChevronLeft size={32} />
              </button>

              <img 
                src={images[activeImageIndex]} 
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl" 
                referrerPolicy="no-referrer"
                alt="Lightbox view" 
              />

              <button 
                onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all cursor-pointer"
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
                  <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Selector thumb" />
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
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 transition-colors cursor-pointer"
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
                    className="bg-[#004F31] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#003d25] transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      window.history.pushState({}, '', '/owner/register');
                      window.location.reload();
                    }}
                    className="border-2 border-[#004F31] text-[#004F31] py-3 rounded-xl font-bold text-sm hover:bg-[#f0fdf4] transition-all cursor-pointer"
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
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-6 space-y-4">
        
        {/* Gallery shim */}
        <div className="hidden md:flex gap-4 h-[460px] w-full rounded-2xl overflow-hidden">
          <div className="w-[60%] bg-gray-200 h-full" />
          <div className="w-[40%] grid grid-cols-2 grid-rows-2 gap-4 h-full">
            <div className="bg-gray-200" />
            <div className="bg-gray-200 rounded-tr-2xl" />
            <div className="bg-gray-200" />
            <div className="bg-gray-200 rounded-br-2xl" />
          </div>
        </div>
        <div className="md:hidden h-[260px] bg-gray-200 rounded-xl mb-6" />

        {/* Header card shim */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
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

        {/* Details Card Shim */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-20 bg-gray-200 rounded-xl" />
            <div className="h-20 bg-gray-200 rounded-xl" />
            <div className="h-20 bg-gray-200 rounded-xl" />
            <div className="h-20 bg-gray-200 rounded-xl" />
          </div>
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>

      </div>
    </div>
  );
};
