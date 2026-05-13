import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  LandPlot, 
  Check, 
  Phone, 
  Mail, 
  User, 
  Star, 
  ArrowRight, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Share2,
  Heart,
  Printer
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import { translateDescription } from '../services/geminiService';

const USD_RATE = 305.50; // Current estimated LKR to USD
const EUR_RATE = 330.15; // Current estimated LKR to EUR

const convertPrice = (priceVal: any) => {
  if (!priceVal) return null;
  
  let amount = 0;
  if (typeof priceVal === 'number') {
    amount = priceVal;
  } else if (typeof priceVal === 'string') {
    if (priceVal.toLowerCase().includes('contact')) return null;
    const numericStr = (priceVal || '').replace(/[^0-9]/g, '');
    amount = parseInt(numericStr);
  }
  
  if (isNaN(amount) || amount === 0) return null;
  
  const formatValue = (val: number, symbol: string) => {
    return `${symbol} ${Math.round(val).toLocaleString()}`;
  };

  return {
    usd: formatValue(amount / USD_RATE, '$'),
    eur: formatValue(amount / EUR_RATE, '€')
  };
};

// Fix Leaflet icon issue
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

interface PropertyDetailProps {
  propertyId: number | string;
  onBack: () => void;
  onPropertyClick: (p: any) => void;
  favorites: Set<number>;
  toggleFavorite: (id: number) => void;
  isAdmin?: boolean;
}

const CountUp = ({ end, duration = 2000 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const rate = Math.min(progress / duration, 1);
      
      // Easing function: easeOutExpo
      const easing = 1 - Math.pow(2, -10 * rate);
      countRef.current = Math.floor(easing * end);
      setCount(countRef.current);

      if (rate < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this property. Please contact me with more information.'
  });

  const specsRef = useRef(null);
  const [specsVisible, setSpecsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSpecsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (specsRef.current) {
      observer.observe(specsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      try {
        // Fetch property
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();

        if (error) throw error;
        setProperty(data);

        // Increment views
        await supabase.rpc('increment_views', { listing_id: propertyId });

        // Fetch similar properties
        if (data) {
          const { data: similar, error: similarError } = await supabase
            .from('properties')
            .select('*')
            .eq('district', data.district)
            .eq('status', 'active')
            .neq('id', data.id)
            .limit(3);

          if (!similarError) {
            setSimilarProperties(similar || []);
          }
        }
      } catch (error) {
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
      const { error } = await supabase
        .from('property_inquiries')
        .insert({
          property_id: property.id,
          agent_id: property.agent_id,
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone,
          message: formData.message,
          status: 'new'
        });

      if (error) throw error;
      setInquirySuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: 'I am interested in this property. Please contact me with more information.'
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranslate = async () => {
    if (translatedDesc) {
      setShowOriginal(!showOriginal);
      return;
    }

    const desc = property.property_description || property.description;
    if (!desc) return;

    setIsTranslating(true);
    try {
      const result = await translateDescription(desc, 'sinhala');
      setTranslatedDesc(result);
      setShowOriginal(false);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF8]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#004F31] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAF8] p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
        <button onClick={onBack} className="bg-[#004F31] text-white px-6 py-2 rounded-lg font-bold">
          Go Back Home
        </button>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: property.district || 'District', href: '#' },
    { label: property.city || 'City', href: '#' },
    { label: property.listing_title, href: '#' }
  ];

  const features = property.additional_info ? property.additional_info.split(',').map((f: string) => f.trim()) : [
    "Double garage with remote access",
    "Maid's quarters and bathroom",
    "Solar power net metering system",
    "Smart home automation ready"
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF8] font-sans text-gray-900 pb-12">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6">
          {breadcrumbs.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-2"
            >
              <button 
                onClick={() => idx === 0 && onBack()}
                className={`text-xs ${idx === breadcrumbs.length - 1 ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-[#004F31] transition-colors'}`}
              >
                {item.label}
              </button>
              {idx < breadcrumbs.length - 1 && <span className="text-gray-300 text-xs">›</span>}
            </motion.div>
          ))}
        </nav>

        {/* Title Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 max-w-4xl leading-tight">
              {property.listing_title}
            </h1>
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin size={16} />
              <span className="text-sm font-medium">{property.city}, {property.district}</span>
            </div>
          </div>

          <div className="lg:text-right">
            <div className="flex items-start lg:justify-end gap-1 mb-1">
              <span className="text-xs font-bold text-[#004F31] mt-2">LKR</span>
              <span className="text-4xl font-bold text-[#004F31]">
                {property.price_lkr?.toLocaleString() || property.price?.toLocaleString()}
              </span>
            </div>
            {(() => {
              const converted = convertPrice(property.price_lkr || property.price);
              if (!converted) return null;
              return (
                <div className="flex items-center lg:justify-end gap-3 text-xs font-bold text-gray-400 mb-2">
                  <span className="bg-white px-2 py-0.5 rounded border border-gray-100">{converted.usd}</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-gray-100">{converted.eur}</span>
                </div>
              );
            })()}
            {property.is_negotiable && (
              <span className="inline-block bg-[#004F31]/10 text-[#004F31] text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
                NEGOTIABLE
              </span>
            )}
          </div>
        </div>

        {/* Photo Gallery Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] lg:h-[600px] mb-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative rounded-2xl overflow-hidden cursor-zoom-in group"
            onClick={() => { setLightboxOpen(true); setActiveImageIndex(0); }}
          >
            <img 
              src={images[0]} 
              className="w-full h-full object-cover group-hover:brightness-105 transition-all duration-300" 
              alt="Main hero" 
            />
            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-lg">
              FEATURED
            </div>
          </motion.div>

          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            {[1, 2, 3, 4].map((idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="relative rounded-2xl overflow-hidden cursor-zoom-in group"
                onClick={() => { setLightboxOpen(true); setActiveImageIndex(idx); }}
              >
                {images[idx] ? (
                  <>
                    <img 
                      src={images[idx]} 
                      className="w-full h-full object-cover group-hover:brightness-105 transition-all duration-300" 
                      alt={`Gallery ${idx}`} 
                    />
                    {idx === 4 && images.length > 5 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/50 transition-all">
                        <span className="text-white font-bold text-xl">+{images.length - 4} Photos</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                    <Maximize size={32} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Property Specs Bar */}
        <motion.div
          ref={specsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={specsVisible ? { opacity: 1, y: 0 } : {}}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-wrap justify-between gap-8 mb-12"
        >
          <div className="flex items-center gap-4 flex-1 min-w-[200px]">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[#004F31] group hover:bg-[#004F31]/10 transition-colors">
              <Bed size={24} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none mb-1">
                {specsVisible ? <CountUp end={parseInt(property.rooms) || 0} /> : 0} Bedrooms
              </p>
              <p className="text-xs text-gray-500 font-medium">Large suites</p>
            </div>
          </div>

          <div className="w-px bg-gray-100 hidden md:block" />

          <div className="flex items-center gap-4 flex-1 min-w-[200px]">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[#004F31] group hover:bg-[#004F31]/10 transition-colors">
              <Bath size={24} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none mb-1">
                {specsVisible ? <CountUp end={parseInt(property.bathrooms) || 0} /> : 0} Bathrooms
              </p>
              <p className="text-xs text-gray-500 font-medium">Modern fittings</p>
            </div>
          </div>

          <div className="w-px bg-gray-100 hidden lg:block" />

          <div className="flex items-center gap-4 flex-1 min-w-[200px]">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[#004F31] group hover:bg-[#004F31]/10 transition-colors">
              <Maximize size={24} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none mb-1">
                {specsVisible ? <CountUp end={parseInt(property.floor_area) || 4500} /> : 0} Sqft
              </p>
              <p className="text-xs text-gray-500 font-medium">Built area</p>
            </div>
          </div>

          <div className="w-px bg-gray-100 hidden xl:block" />

          <div className="flex items-center gap-4 flex-1 min-w-[200px]">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[#004F31] group hover:bg-[#004F31]/10 transition-colors">
              <LandPlot size={24} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none mb-1">
                {specsVisible ? <CountUp end={parseInt(property.land_area) || 15} /> : 0} Perches
              </p>
              <p className="text-xs text-gray-500 font-medium">Land size</p>
            </div>
          </div>
        </motion.div>

        {/* Main Content (Two column) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.15 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold">Property Description</h2>
                <button 
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="flex items-center gap-2 px-4 py-2 bg-[#004F31] text-white text-xs font-bold rounded-lg hover:bg-[#004F31]/90 transition-all disabled:opacity-50"
                >
                  {isTranslating ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Star size={14} className={!showOriginal ? "fill-yellow-400 text-yellow-400" : ""} />
                      {showOriginal ? 'Translate to Sinhala' : 'Show English'}
                    </>
                  )}
                </button>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-6">
                {(showOriginal ? (property.property_description || "") : (translatedDesc || "")).split('\n').filter((p: string) => p.trim()).map((para: string, i: number) => (
                  <p key={i} className={!showOriginal ? "font-sinhala leading-[2]" : ""}>{para}</p>
                ))}
              </div>

              {/* Features Grid */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-50 shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#004F31]/10 flex items-center justify-center text-[#004F31] group-hover:scale-110 transition-transform">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Location */}
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.15 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Location</h2>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.city}, ${property.district}`)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-[#004F31] flex items-center gap-1 hover:underline"
                >
                  Open in Google Maps <ArrowRight size={14} />
                </a>
              </div>
              <div className="h-[400px] rounded-2xl overflow-hidden shadow-inner border border-gray-100 z-0 relative">
                <MapContainer 
                  center={[6.8841, 79.9402]} 
                  zoom={14} 
                  className="w-full h-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.5 }}
                  >
                    <Marker position={[6.8841, 79.9402]} icon={customMarkerIcon}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-bold mb-1">Hokandara Road</p>
                          <p className="text-xs text-gray-500">Thalawathugoda, Colombo 10116</p>
                        </div>
                      </Popup>
                    </Marker>
                  </motion.div>
                </MapContainer>
              </div>
            </motion.section>
          </div>

          {/* Right Column - Agent Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl"
              >
                {/* Agent Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-inner">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" 
                      className="w-full h-full object-cover" 
                      alt="Agent" 
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-none mb-1">Pradeep Jayawardene</h3>
                    <p className="text-xs text-[#004F31] font-bold">Platinum Member • Premier Realty</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4].map(i => <Star key={i} size={12} fill="#F5A623" className="text-[#F5A623]" />)}
                      <Star size={12} fill="url(#star-half)" className="text-[#F5A623]" />
                      <svg width="0" height="0" className="absolute">
                        <defs>
                          <linearGradient id="star-half">
                            <stop offset="50%" stopColor="#F5A623"/>
                            <stop offset="50%" stopColor="transparent" stopOpacity="1"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Inquiry Form */}
                <form className="space-y-4" onSubmit={handleInquirySubmit}>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F31]/20 focus:border-[#004F31] transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="email@example.com" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F31]/20 focus:border-[#004F31] transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+94 XX XXX XXXX" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F31]/20 focus:border-[#004F31] transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Message</label>
                    <textarea 
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F31]/20 focus:border-[#004F31] transition-all placeholder:text-gray-300 resize-none"
                    />
                  </div>

                  {inquirySuccess ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-50 text-green-700 rounded-xl text-center text-sm font-bold"
                    >
                      Inquiry sent successfully!
                    </motion.div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        className="w-full bg-[#004F31] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#004F31]/20 active:shadow-none transition-shadow"
                      >
                        {isSubmitting ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : 'Request Property Visit'}
                      </motion.button>
                      <button 
                        type="button"
                        className="w-full border-2 border-[#004F31] text-[#004F31] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#004F31] hover:text-white transition-all group"
                      >
                        <Phone size={18} className="group-hover:rotate-12 transition-transform" /> Call Agent
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>

              <div className="bg-[#E7F2FF] p-6 rounded-2xl flex gap-4 items-start border border-blue-100/50">
                <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[11px] leading-relaxed text-blue-900/70 font-medium">
                    <span className="font-bold text-blue-900 block mb-0.5">Safety Tip</span>
                    Never send money in advance for inspection. Report any suspicious listings to our trust & safety team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Similar Properties in {property.city}</h2>
          <button className="text-sm font-bold text-[#004F31] flex items-center gap-1 hover:underline">
            View all <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similarProperties.map((prop, idx) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12 }}
              onClick={() => onPropertyClick(prop)}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={prop.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={prop.listing_title} 
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black tracking-widest px-2 py-1 rounded">
                  FOR SALE
                </div>
              </div>
              <div className="p-5">
                <p className="text-[#004F31] font-bold text-lg mb-1">
                  LKR {prop.price_lkr?.toLocaleString() || prop.price?.toLocaleString()}
                </p>
                <h3 className="text-gray-900 font-bold line-clamp-1 mb-4 group-hover:text-[#004F31] transition-colors">
                  {prop.listing_title}
                </h3>
                <div className="flex items-center justify-between text-gray-500">
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><Bed size={14} className="text-[#004F31]" /> {prop.rooms || 0}</span>
                    <span className="flex items-center gap-1.5"><Bath size={14} className="text-[#004F31]" /> {prop.bathrooms || 0}</span>
                    <span className="flex items-center gap-1.5"><Maximize size={14} className="text-[#004F31]" /> {prop.floor_area?.toLocaleString() || 3200}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 pt-12 pb-8 border-t border-gray-100 text-center">
        <h2 className="text-xl font-bold text-[#004F31] mb-6">LankaProperty</h2>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-[#004F31] transition-colors">About Us</a>
          <a href="#" className="hover:text-[#004F31] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#004F31] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#004F31] transition-colors">Help Center</a>
          <a href="#" className="hover:text-[#004F31] transition-colors">Contact</a>
        </div>
        <p className="text-xs text-gray-400">
          © 2024 LankaProperty.lk - Sri Lanka's Most Trusted Real Estate Marketplace
        </p>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center text-white z-10">
              <span className="text-sm font-bold">{activeImageIndex + 1} / {images.length}</span>
              <button 
                onClick={() => setLightboxOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main Image */}
            <div className="flex-1 relative flex items-center justify-center p-6 sm:p-12 overflow-hidden">
              <button 
                onClick={() => setActiveImageIndex(i => (i - 1 + images.length) % images.length)}
                className="absolute left-6 z-10 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors"
                title="Previous Image"
              >
                <ChevronLeft size={32} />
              </button>
              
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={images[activeImageIndex]} 
                  className="max-h-full max-w-full object-contain shadow-2xl" 
                  alt="Full view" 
                />
              </AnimatePresence>

              <button 
                onClick={() => setActiveImageIndex(i => (i + 1) % images.length)}
                className="absolute right-6 z-10 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors"
                title="Next Image"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="p-6 bg-black/40 backdrop-blur-sm overflow-x-auto flex gap-4 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === activeImageIndex ? 'border-[#004F31] scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
