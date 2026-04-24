import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const USD_RATE = 300;
const EUR_RATE = 325;

const convertPrice = (priceStr: string) => {
  if (!priceStr || priceStr.toLowerCase().includes('contact')) return null;
  
  // Extract number
  const numericStr = priceStr.replace(/[^0-9]/g, '');
  const amount = parseInt(numericStr);
  
  if (isNaN(amount) || amount === 0) return null;
  
  const suffix = priceStr.includes('/') ? ` / ${priceStr.split('/').pop()?.trim()}` : '';
  
  const formatValue = (val: number, symbol: string) => {
    return `${symbol} ${Math.round(val).toLocaleString()}${suffix}`;
  };

  return {
    usd: formatValue(amount / USD_RATE, '$'),
    eur: formatValue(amount / EUR_RATE, '€')
  };
};
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  LandPlot,
  Home as HomeIcon,
  Building2,
  Building,
  Hotel,
  Briefcase,
  User,
  ArrowRight,
  ArrowUp,
  Bed,
  Bath,
  DollarSign,
  Coffee,
  School,
  ShoppingBag,
  Heart,
  Calculator,
  Percent,
  CheckCircle,
  Share2,
  Printer,
  MessageCircle,
  Clock,
  Eye,
  Copy,
  Wifi,
  Tv,
  Waves,
  Wind,
  Shield,
  ExternalLink,
  Send,
  Globe,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Box,
  Quote,
  Star,
  Lock,
  LogOut
} from "lucide-react";

// ... (previous code)

const VirtualTourModal = ({ isOpen, onClose, propertyTitle }: { isOpen: boolean, onClose: () => void, propertyTitle: string }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-white">
                <Box size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold leading-none mb-1">{propertyTitle}</h3>
                <p className="text-brand-green text-[10px] uppercase font-bold tracking-widest">360° Virtual Experience</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md compact-transition"
            >
              <ArrowUp className="rotate-180" size={24} />
            </button>
          </motion.div>

          {/* Virtual Tour Container (Simulated with high-quality 360 pano source) */}
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full h-full relative"
          >
            <iframe 
              src="https://pannellum.org/6.0/pannellum.htm?config=https://pannellum.org/configs/tour.json"
              className="w-full h-full border-none"
              allowFullScreen
            />
            
            {/* Overlay controls hint */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white text-[10px] font-bold uppercase tracking-widest pointer-events-none">
              Click and drag to explore the room
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Types & Data ---
const PROPERTY_CATEGORIES = [
  { name: "Land", icon: <LandPlot className="w-8 h-8" />, count: "1,382" },
  { name: "House", icon: <HomeIcon className="w-8 h-8" />, count: "1,524" },
  { name: "Apartment", icon: <Building2 className="w-8 h-8" />, count: "108" },
  { name: "Building", icon: <Building className="w-8 h-8" />, count: "350" },
  { name: "Hotel", icon: <Hotel className="w-8 h-8" />, count: "184" },
  { name: "Business", icon: <Briefcase className="w-8 h-8" />, count: "52" },
];

const FEATURED_PROPERTIES = [
  {
    id: 1,
    title: "Recently Built Down Stair Fully Completed House",
    location: "Ratmalana",
    price: "Contact for Price",
    type: "Sale",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    lat: 6.8259,
    lng: 79.8804,
  },
  {
    id: 2,
    title: "Residential Land for Sale at Malwatta",
    location: "Nittambuwa",
    price: "Rs. 850,000 / Perch",
    type: "Sale",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    lat: 7.0873,
    lng: 80.0957,
  },
  {
    id: 3,
    title: "Valuable 40 Perches Land (SINNAKKARA) with House",
    location: "Talawakele",
    price: "Rs. 25,000,000",
    type: "Sale",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    lat: 6.9374,
    lng: 80.6486,
  },
  {
    id: 4,
    title: "Modern 3 Bedroom Apartment for Rent",
    location: "Colombo 03",
    price: "Rs. 150,000 / Month",
    type: "Rent",
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800",
    lat: 6.9147,
    lng: 79.8510,
  },
  {
    id: 5,
    title: "Luxury Beachfront Guest House for Lease",
    location: "Negombo",
    price: "Rs. 450,000 / Month",
    type: "Rent",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800",
    lat: 7.2089,
    lng: 79.8355,
  },
  {
    id: 6,
    title: "Spacious Warehouse for Rent in Wattala",
    location: "Wattala",
    price: "Rs. 250,000 / Month",
    type: "Rent",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    lat: 6.9847,
    lng: 79.8914,
  },
];

const AMENITIES = [
  { name: "24/7 Security", icon: <Shield size={16} /> },
  { name: "Swimming Pool", icon: <Waves size={16} /> },
  { name: "High-Speed Wifi", icon: <Wifi size={16} /> },
  { name: "Air Conditioning", icon: <Wind size={16} /> },
  { name: "Parking Area", icon: <Building2 size={16} /> },
  { name: "Smart TV", icon: <Tv size={16} /> },
  { name: "Hot Water", icon: <Bath size={16} /> },
  { name: "Gym Access", icon: <User size={16} /> },
];

const AGENTS = [
  { name: "Mr. Lalith Ratnatunga", role: "General Manager", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" },
  { name: "Chamath Wickramasooriya", role: "Sales Lead", img: "https://i.pravatar.cc/150?u=2" },
  { name: "Barnad Fernando", role: "Consultant", img: "https://i.pravatar.cc/150?u=3" },
  { name: "Deshani Kaushalya", role: "Agent", img: "https://i.pravatar.cc/150?u=4" },
];

// --- Components ---

const Navbar = () => (
  <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
    <div className="bg-dark-navy h-8 flex items-center">
      <div className="container mx-auto px-6 flex justify-between items-center text-[10px] text-gray-300">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 opacity-80 underline-offset-2">Hotline: +94 33 222 96 95</span>
          <span className="flex items-center gap-1.5 opacity-80">Email: info@lankaproperty.lk</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-white compact-transition">Login</a>
          <span className="text-gray-700 text-[8px]">|</span>
          <a href="#" className="font-semibold text-brand-green hover:text-brand-green-dark compact-transition">Post a Free Ad</a>
        </div>
      </div>
    </div>
    <nav className="container mx-auto px-6 h-16 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold tracking-tight text-dark-navy leading-none">LankaProperty<span className="text-brand-green">.lk</span></h1>
        </div>
      </div>
      <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
        {["Home", "Real Estate", "Directory", "Agents", "Advertising", "Contact"].map((item) => (
          <li key={item}>
            <a href="#" className={`${item === 'Home' ? 'text-brand-green border-b-2 border-brand-green pb-1' : 'hover:text-brand-green'} compact-transition`}>
              {item}
            </a>
          </li>
        ))}
      </ul>
      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 compact-transition">
        Menu
      </button>
    </nav>
  </header>
);

const FlipWords = ({ words, className = "" }: { words: string[], className?: string }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <div className={`inline-block relative h-[1.15em] overflow-hidden align-top ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 20, opacity: 0, rotateX: -90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -20, opacity: 0, rotateX: 90 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

const WORDS = ["Home", "Villa", "Land", "Apartment", "Office"];

const Hero = ({ onDirectInquiry }: { onDirectInquiry: () => void }) => {
  const [activeStatus, setActiveStatus] = useState<"Sale" | "Rent">("Sale");

  return (
    <section className="relative h-[650px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover"
          alt="Modern Home"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
        <div className="max-w-md text-white">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold leading-tight drop-shadow-md"
          >
            Find Your Dream <br/>
            <FlipWords words={WORDS} className="text-brand-green w-full" />
            in Sri Lanka.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-white/95 text-lg font-semibold max-w-lg leading-relaxed shadow-sm"
          >
            Over 15,000+ premium properties available for sale and rent across the island. 
          </motion.p>
        </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-3xl w-full max-w-sm shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Search Properties</h3>
              <button 
                onClick={onDirectInquiry}
                className="text-xs font-bold text-brand-green hover:underline"
              >
                Direct Inquiry
              </button>
            </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActiveStatus("Sale")}
                className={`py-3.5 rounded-xl text-sm font-bold compact-transition ${activeStatus === 'Sale' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                For Sale
              </button>
              <button 
                onClick={() => setActiveStatus("Rent")}
                className={`py-3.5 rounded-xl text-sm font-bold compact-transition ${activeStatus === 'Rent' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                For Rent
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 appearance-none text-sm text-gray-700 font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition">
                  <option>All Types</option>
                  <option>Houses</option>
                  <option>Lands</option>
                  <option>Apartments</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 appearance-none text-sm text-gray-700 font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition">
                  <option>City</option>
                  <option>Colombo</option>
                  <option>Kandy</option>
                  <option>Galle</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3.5 appearance-none text-sm text-gray-700 font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition">
                  <option>Beds</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                </select>
                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3.5 appearance-none text-sm text-gray-700 font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition">
                  <option>Baths</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                </select>
                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm font-black">LKR</span>
              </div>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-14 pr-3 py-3.5 appearance-none text-sm text-gray-700 font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition">
                <option>Price Range</option>
                <option>Below 10M</option>
                <option>10M - 50M</option>
                <option>50M - 100M</option>
                <option>Above 100M</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-brand-red text-white text-base font-black rounded-xl shadow-xl shadow-red-200 hover:bg-brand-red-dark compact-transition uppercase tracking-widest mt-4"
            >
              Search Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const CategoryStrip = () => (
  <div className="bg-gray-50 border-b border-gray-100 py-6">
    <div className="container mx-auto px-6 flex justify-between items-center">
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {PROPERTY_CATEGORIES.slice(0, 4).map((cat, idx) => (
          <motion.div
            key={cat.name}
            className="flex flex-col items-center gap-1.5 min-w-[80px]"
          >
            <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 hover:border-brand-green cursor-pointer group compact-transition">
              <div className="text-gray-400 group-hover:text-brand-green group-hover:scale-110 compact-transition">
                {cat.icon}
              </div>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">{cat.name}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-gray-200">
        <button className="px-4 py-1.5 bg-brand-green text-white text-[10px] font-bold rounded-md compact-transition">Buy</button>
        <button className="px-4 py-1.5 text-gray-400 text-[10px] font-bold hover:text-gray-600 compact-transition">Rent</button>
      </div>
    </div>
  </div>
);

const PropertyCard = ({ 
  property, 
  onClick, 
  isFavorited, 
  onToggleFavorite 
}: any) => (
  <motion.div 
    onClick={onClick}
    className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden flex flex-col compact-transition cursor-pointer relative"
  >
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite?.(e);
      }}
      className={`absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-md compact-transition ${
        isFavorited ? 'bg-brand-red text-white' : 'bg-white/70 text-gray-700 hover:bg-white hover:text-brand-red shadow-lg'
      }`}
    >
      <Heart size={14} fill={isFavorited ? "currentColor" : "none"} />
    </button>
    <div className="relative h-44 bg-gray-200 overflow-hidden">
      <img src={property.image} alt={property.title} className="w-full h-full object-cover compact-transition group-hover:scale-105" />
      <span className="absolute top-3 left-3 bg-brand-red text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">For {property.type}</span>
      <span className="absolute top-3 right-3 bg-white/95 text-gray-900 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">{property.location}</span>
    </div>
    <div className="p-4 flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-brand-green font-black text-lg leading-none">
          {property.price === 'Contact for Price' ? 'LKR Contact' : property.price}
        </span>
      </div>
      {(() => {
        const converted = convertPrice(property.price);
        if (!converted) return null;
        return (
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
            <span className="bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">{converted.usd}</span>
            <span className="bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">{converted.eur}</span>
          </div>
        );
      })()}
      <div className="text-sm font-bold text-dark-navy line-clamp-1 leading-tight mt-1">{property.title}</div>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-semibold">
        <span className="flex items-center gap-1.5"><Building2 size={14} className="text-brand-green opacity-70" /> 3 Beds</span>
        <span className="flex items-center gap-1.5"><LandPlot size={14} className="text-brand-green opacity-70" /> 15 Perch</span>
      </div>
    </div>
  </motion.div>
);

const PropertyDetail = ({ 
  property, 
  onBack,
  isFavorited,
  onToggleFavorite,
  onOpenCalculator,
  onPropertyClick
}: { 
  property: any, 
  onBack: () => void,
  isFavorited?: boolean,
  onToggleFavorite?: () => void,
  onOpenCalculator?: () => void,
  onPropertyClick?: (p: any) => void
}) => {
  const images = Array(12).fill(property.image).map((img, i) => 
    i === 0 ? img : `https://images.unsplash.com/photo-${1512917774080 + i}-9991f1c4c750?auto=format&fit=crop&q=60&w=800`
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-6 py-8"
    >
      {/* Top Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 compact-transition"
          >
            <ArrowRight className="rotate-180" size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              <span className="flex items-center gap-1.5"><Clock size={12} /> Posted 2 days ago</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5"><Eye size={12} /> 1,245 views</span>
              <span className="text-gray-300">|</span>
              <span>Ref: LP-9402</span>
            </div>
            <h1 className="text-2xl font-bold text-dark-navy leading-tight">{property.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={onToggleFavorite}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border compact-transition ${
              isFavorited 
              ? 'bg-brand-red text-white border-brand-red' 
              : 'bg-white text-gray-600 border-gray-200 hover:border-brand-red hover:text-brand-red'
            }`}
          >
            <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
            {isFavorited ? 'Saved' : 'Save'}
          </button>
          <button className="flex items-center justify-center p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:border-brand-green hover:text-brand-green compact-transition">
            <Share2 size={18} />
          </button>
          <button className="flex items-center justify-center p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:border-brand-green hover:text-brand-green compact-transition">
            <Printer size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Gallery Carousel */}
          <div className="space-y-4">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden group shadow-lg bg-gray-100">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIndex}
                  src={images[activeIndex]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full h-full object-cover"
                  alt={`Property view ${activeIndex + 1}`}
                />
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 compact-transition z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-dark-navy hover:bg-brand-green hover:text-white shadow-xl compact-transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-dark-navy hover:bg-brand-green hover:text-white shadow-xl compact-transition"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Counter Overlay */}
              <div className="absolute bottom-4 right-4 bg-dark-navy/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase z-10 flex items-center gap-2">
                <span>{activeIndex + 1}</span>
                <span className="opacity-40">/</span>
                <span className="opacity-40">{images.length}</span>
              </div>
            </div>

            {/* Thumbnails Row */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 compact-transition ${
                    activeIndex === i ? 'border-brand-green scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i + 1}`} />
                  {activeIndex === i && <div className="absolute inset-0 bg-brand-green/20" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-8">
              {/* Features section */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 rounded-bl-full -mr-4 -mt-4" />
                <h3 className="text-lg font-bold text-dark-navy mb-6 flex items-center gap-2">
                  <CheckCircle className="text-brand-green" size={20} /> Property Features
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Bedrooms</div>
                    <div className="flex items-center gap-2 text-dark-navy font-bold">
                      <Bed size={18} className="text-brand-green" /> 04
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Bathrooms</div>
                    <div className="flex items-center gap-2 text-dark-navy font-bold">
                      <Bath size={18} className="text-brand-green" /> 02
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Floor Area</div>
                    <div className="text-dark-navy font-bold">2,450 sqft</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Land Size</div>
                    <div className="text-dark-navy font-bold">15.5 Perches</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-dark-navy mb-4">About this property</h3>
                <div className="prose prose-sm text-gray-600 space-y-4 max-w-none">
                  <p>Step into luxury with this stunning architect-designed residence located in one of Colombo's most sought-after residential pockets. This property defines modern elegance through its minimalist aesthetic and functional floor plan.</p>
                  <p>The ground floor welcomes you with a grand entrance lobby leading to a spacious living and dining area that opens onto a beautifully landscaped private garden. The high ceilings and large windows ensure the house is naturally illuminated throughout the day.</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-medium">
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green" /> High-quality granite flooring</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green" /> Teak doors and windows</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green" /> Rooftop entertainment space</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green" /> Maid's quarters with washroom</li>
                  </ul>
                </div>
              </div>

              {/* Amenities Grid */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-dark-navy mb-6">Building Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {AMENITIES.map((amenity, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-brand-green/20 compact-transition group">
                      <div className="text-gray-400 group-hover:text-brand-green compact-transition">
                        {amenity.icon}
                      </div>
                      <span className="text-[10px] font-bold text-dark-navy group-hover:text-brand-green">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Map Section */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Location Map</h3>
                <div className="h-[250px] w-full rounded-xl overflow-hidden relative z-0 border border-gray-100 shadow-inner">
                  <MapContainer 
                    center={[property.lat || 6.9271, property.lng || 79.8612]} 
                    zoom={15} 
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[property.lat || 6.9271, property.lng || 79.8612]} />
                  </MapContainer>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-gray-500">
                  <span className="flex items-center gap-1.5"><MapPin size={12} /> {property.location}</span>
                  <button className="text-brand-green flex items-center gap-1">Open in Google Maps <ExternalLink size={10} /></button>
                </div>
              </div>

              {/* Share section */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Share Listing</h3>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white rounded-xl text-[10px] font-bold hover:opacity-90 compact-transition shadow-sm">
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-green/10 text-brand-green rounded-xl text-[10px] font-bold hover:bg-brand-green transition-all hover:text-white group">
                    <Copy size={14} /> Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Similar Properties */}
          <div className="pt-12 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-dark-navy">Similar Properties Nearby</h3>
              <a href="#" className="text-xs text-brand-green font-bold">View Related &rarr;</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {FEATURED_PROPERTIES.slice(0, 3).map(p => (
                <PropertyCard 
                  key={`sim-${p.id}`} 
                  property={p} 
                  onClick={() => onPropertyClick?.(p)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Contact & Action */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -mr-16 -mt-16 sm:block hidden" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Asking Price</div>
                  <div className="px-2 py-0.5 bg-brand-green/10 text-brand-green text-[9px] font-bold rounded-full uppercase tracking-wider">LKR Base</div>
                </div>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-black text-brand-green tracking-tight">{property.price}</span>
                </div>

                {(() => {
                  const converted = convertPrice(property.price);
                  if (!converted) return null;
                  return (
                    <div className="flex flex-wrap items-center gap-2 mb-8">
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                        <DollarSign size={12} className="text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-600">{converted.usd}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                        <span className="text-gray-400 text-xs font-bold">€</span>
                        <span className="text-[11px] font-bold text-gray-600">{converted.eur}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" className="w-16 h-16 rounded-full border-2 border-brand-green object-cover" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center text-white border-2 border-white">
                        <Shield size={12} fill="currentColor" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-dark-navy">Lalith Ratnatunga</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                        <span className="text-brand-green">General Manager</span>
                        <span className="text-gray-300">•</span>
                        <span>Verified Agent</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center py-2 bg-white rounded-lg border border-gray-100">
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Member Since</div>
                      <div className="text-xs font-bold text-dark-navy">Feb 2021</div>
                    </div>
                    <div className="text-center py-2 bg-white rounded-lg border border-gray-100">
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Active Ads</div>
                      <div className="text-xs font-bold text-dark-navy">12 Listed</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <a 
                    href="tel:+94771234567" 
                    className="w-full flex items-center justify-center gap-3 bg-brand-green text-white font-bold py-4 rounded-xl hover:bg-brand-green-dark compact-transition text-sm shadow-lg shadow-brand-green/20"
                  >
                    <Phone size={18} /> Call Manager
                  </a>
                  <button 
                    className="w-full flex items-center justify-center gap-3 bg-dark-navy text-white font-bold py-4 rounded-xl hover:opacity-90 compact-transition text-sm"
                  >
                    <Send size={18} /> Send Inquiry
                  </button>
                  
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-300 bg-white px-2">Financials</div>
                  </div>

                  <button 
                    onClick={onOpenCalculator}
                    className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:border-brand-green hover:text-brand-green compact-transition text-xs"
                  >
                    <Calculator size={18} /> Mortgage Calculator
                  </button>

                  <button 
                    onClick={() => {
                      // @ts-ignore
                      window.setShowVirtualTour(true);
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-orange-500/10 text-orange-600 font-bold py-3.5 rounded-xl hover:bg-orange-500 hover:text-white compact-transition text-xs border border-orange-200"
                  >
                    <Box size={18} /> Launch 360° Virtual Tour
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Inquiry form */}
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-white shadow-2xl">
              <h4 className="text-sm font-bold mb-2">Request more information</h4>
              <p className="text-[10px] text-gray-400 mb-6 font-medium">Lalith typically responds within 2 hours.</p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Your inquiry has been sent to Lalith. He will contact you shortly.");
                }}
                className="space-y-4"
              >
                <input required placeholder="Your Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none" />
                <input required type="tel" placeholder="Phone Number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none" />
                <textarea required placeholder="Your Message..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none resize-none"></textarea>
                <button type="submit" className="w-full py-3 bg-brand-green text-white text-xs font-bold rounded-xl hover:bg-brand-green-dark compact-transition">Request Details</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Sidebar = ({ onOpenCalculator, onShowPackages }: { onOpenCalculator: () => void, onShowPackages?: () => void }) => (
  <aside className="space-y-6">
    <div 
      onClick={onOpenCalculator}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-brand-green group compact-transition"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 group-hover:scale-110 compact-transition">
          <Calculator size={20} />
        </div>
        <div>
          <div className="text-xs font-bold text-dark-navy">Mortgage Calculator</div>
          <div className="text-[10px] text-gray-400 font-medium">Estimate your monthly payments</div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Directory</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-center shadow-sm cursor-pointer hover:border-brand-green compact-transition">
          <div className="text-sm font-bold text-dark-navy">2.4k</div>
          <div className="text-[8px] text-gray-500 uppercase font-bold">Agents</div>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-center shadow-sm cursor-pointer hover:border-brand-green compact-transition">
          <div className="text-sm font-bold text-dark-navy">850</div>
          <div className="text-[8px] text-gray-500 uppercase font-bold">Developers</div>
        </div>
      </div>
    </div>
    
    <div>
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Popular Cities</h3>
      <div className="flex flex-wrap gap-1.5">
        {["Colombo", "Kandy", "Galle", "Wattala", "Negombo"].map(city => (
          <span key={city} className="px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-600 rounded-full hover:bg-brand-green hover:text-white cursor-pointer compact-transition">
            {city}
          </span>
        ))}
      </div>
    </div>

    <div className="bg-dark-navy p-4 rounded-xl text-white relative overflow-hidden group">
      <div className="relative z-10">
        <h4 className="text-sm font-bold flex items-center gap-1.5">
          Sell your <FlipWords words={["Home", "Land", "Villa", "Agency"]} className="text-brand-green" />?
        </h4>
        <p className="text-[10px] text-gray-400 mt-1 mb-4 leading-tight">List for free and reach 500k monthly buyers across the island.</p>
        <button 
          onClick={onShowPackages}
          className="w-full py-2 bg-brand-green text-white text-[10px] font-bold rounded-lg hover:bg-brand-green-dark compact-transition"
        >
          View Packages
        </button>
      </div>
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-brand-green/20 rounded-full group-hover:scale-150 compact-transition"></div>
    </div>
  </aside>
);

const Footer = ({ onNavigateHome, onShowContact, onShowAbout, onShowPackages }: { onNavigateHome: () => void, onShowContact: () => void, onShowAbout: () => void, onShowPackages: () => void }) => (
  <footer className="bg-[#0c1a2e] text-gray-400 pt-20 pb-10">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigateHome()}>
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
            <h2 className="text-xl font-bold tracking-tight text-white leading-none">LankaProperty<span className="text-brand-green">.lk</span></h2>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            Sri Lanka's premier real estate marketplace. Connecting buyers, sellers, and renters with the most trusted properties and agents in the island.
          </p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-green hover:border-brand-green hover:text-white compact-transition">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Quick Links</h4>
          <ul className="space-y-4 text-base font-medium">
            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowAbout(); }} className="hover:text-brand-green compact-transition">About Us</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowContact(); }} className="hover:text-brand-green compact-transition">Contact Support</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowPackages(); }} className="hover:text-brand-green compact-transition">Advertising Packages</a></li>
            <li><a href="#" className="hover:text-brand-green compact-transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-brand-green compact-transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-brand-green compact-transition">Sitemap</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Popular Areas</h4>
          <ul className="space-y-4 text-base font-medium">
            {["Colombo Real Estate", "Kandy Properties", "Galle Villas", "Negombo Land", "Kurunegala Homes", "Kalutara Estates"].map(item => (
              <li key={item}><a href="#" className="hover:text-brand-green compact-transition">{item}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Newsletter</h4>
          <p className="text-base font-medium mb-6 leading-relaxed">Subscribe to receive the latest property market insights and deals.</p>
          <div className="relative">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-base focus:outline-none focus:border-brand-green compact-transition"
            />
            <button className="absolute right-2 top-2 bottom-2 px-6 bg-brand-green text-white rounded-lg text-sm font-bold hover:bg-brand-green-dark compact-transition">
              Join
            </button>
          </div>
          <div className="flex items-center gap-3 mt-6 text-xs bg-brand-green/10 border border-brand-green/20 p-4 rounded-xl text-brand-green font-bold">
            <Percent size={16} />
            <span>Get 10% off your first ad listing!</span>
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-[11px] font-bold text-gray-500 tracking-wider">
          &copy; 2026 LANKAPROPERTY.LK. ALL RIGHTS RESERVED. DESIGNED FOR EXCELLENCE.
        </div>
        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-white group cursor-pointer">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="group-hover:text-brand-green compact-transition">Platform Status: Online</span>
          </div>
          <div className="w-px h-5 bg-white/10" />
          <a href="#" className="text-xs font-bold text-brand-green hover:underline uppercase tracking-widest underline-offset-4">Agent Access</a>
        </div>
      </div>
    </div>
  </footer>
);

const MortgageCalculatorModal = ({ isOpen, onClose, initialAmount = 10000000 }: { isOpen: boolean, onClose: () => void, initialAmount?: number }) => {
  const [loanAmount, setLoanAmount] = useState(initialAmount);
  const [interestRate, setInterestRate] = useState(12);
  const [loanTerm, setLoanTerm] = useState(15);

  const calculatePayment = () => {
    const r = interestRate / 100 / 12;
    const n = loanTerm * 12;
    if (r === 0) return loanAmount / n;
    const payment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return payment;
  };

  const monthlyPayment = calculatePayment();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark-navy/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <Calculator className="text-brand-green" size={20} />
                <h3 className="text-lg font-bold text-dark-navy">Mortgage Calculator</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 compact-transition">
                <ArrowUp className="rotate-180" size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 block">Loan Amount (LKR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">Rs.</span>
                  <input 
                    type="number" 
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-14 pr-4 py-4 text-dark-navy font-black text-lg focus:ring-2 focus:ring-brand-green outline-none compact-transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 block">Interest Rate (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-dark-navy font-black text-lg focus:ring-2 focus:ring-brand-green outline-none compact-transition"
                    />
                    <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 block">Loan Term (Years)</label>
                  <input 
                    type="number" 
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-dark-navy font-black text-lg focus:ring-2 focus:ring-brand-green outline-none compact-transition"
                  />
                </div>
              </div>

              <div className="bg-brand-green/10 p-6 rounded-2xl border border-brand-green/20 text-center">
                <div className="text-[10px] text-brand-green font-bold uppercase tracking-widest mb-1">Estimated Monthly Payment</div>
                <div className="text-3xl font-extrabold text-brand-green">
                  Rs. {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                * This is an estimate based on the provided inputs. Exact rates and terms will depend on your bank and credit status.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ContactUs = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-6 py-12"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h1 className="text-4xl font-extrabold text-dark-navy mb-4">Contact Information</h1>
              <p className="text-gray-500 font-medium">We're here to help you find your dream property.</p>
            </div>

            <div className="space-y-6">
              {[
                { icon: <Phone className="text-brand-green" />, label: "Call Us", value: "077 395 1560 / 011 492 2492" },
                { icon: <Mail className="text-brand-green" />, label: "Email", value: "ceo.Lankaland@gmail.com" },
                { icon: <Globe className="text-brand-green" />, label: "Website", value: "www.LankaProperty.lk" },
                { icon: <MapPin className="text-brand-green" />, label: "Address", value: "95 Metro Complex, Kirillawala, Kadawatha." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md compact-transition">
                  <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-sm font-bold text-dark-navy leading-relaxed">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-brand-green rounded-2xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/20">
                  <div className="w-16 h-16 rounded-full border-2 border-white/50 overflow-hidden bg-white/10 shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" 
                      className="w-full h-full object-cover" 
                      alt="Lalith Ratnatunga"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">Lalith Ratnatunga</h3>
                    <p className="text-xs font-medium opacity-80 uppercase tracking-widest">General Manager</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Office Hours</h3>
                <div className="space-y-2 opacity-90 text-sm">
                  <p className="flex justify-between"><span>Mon - Fri</span> <span>9:00 AM - 6:00 PM</span></p>
                  <p className="flex justify-between"><span>Saturday</span> <span>9:00 AM - 2:00 PM</span></p>
                  <p className="flex justify-between"><span>Sunday</span> <span className="font-bold">Closed</span></p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-4 h-full bg-brand-green" />
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you! Your message has been sent to our management team. We will get back to you shortly.");
                (e.target as HTMLFormElement).reset();
              }}
              className="relative z-10 space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-dark-navy mb-2">Send us an inquiry</h2>
                <p className="text-sm text-gray-400 font-medium">Fill out the form below and our team will get back to you within 24 hours.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input required type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <input required type="tel" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition" placeholder="+94 77 123 4567" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inquiry Type</label>
                  <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition appearance-none">
                    <option>Property Viewing</option>
                    <option>Buy Property</option>
                    <option>List Property</option>
                    <option>General Support</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message</label>
                  <textarea required rows={5} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button type="submit" className="w-full bg-brand-green text-white font-bold py-4 rounded-xl hover:bg-brand-green-dark compact-transition shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2">
                  <Send size={18} /> Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Meet the Team Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-dark-navy mb-4">Meet Our Expert Agents</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Our dedicated team of professionals is ready to guide you through every step of your real estate journey.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {AGENTS.map((agent, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="relative mb-4 overflow-hidden rounded-3xl aspect-[4/5] shadow-lg">
                  <img src={agent.img} alt={agent.name} className="w-full h-full object-cover group-hover:scale-110 compact-transition" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 compact-transition flex flex-col justify-end p-6">
                    <div className="flex gap-3 justify-center">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand-green compact-transition cursor-pointer"><Linkedin size={16} /></div>
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand-green compact-transition cursor-pointer"><Facebook size={16} /></div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-dark-navy mb-0.5 group-hover:text-brand-green compact-transition">{agent.name}</h4>
                  <p className="text-[10px] font-bold text-brand-green uppercase tracking-widest">{agent.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EXPERTISE = [
  { label: "Years of Excellence", value: "15+", icon: <Clock size={24} /> },
  { label: "Properties Sold", value: "2,500+", icon: <CheckCircle size={24} /> },
  { label: "Verified Agents", value: "80+", icon: <User size={24} /> },
  { label: "Client Satisfaction", value: "99%", icon: <Heart size={24} /> }
];

const ExpertiseSection = () => (
  <section className="py-12 bg-white border-y border-gray-100">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {EXPERTISE.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-brand-green mb-4 group-hover:bg-brand-green group-hover:text-white compact-transition">
              {item.icon}
            </div>
            <div className="text-2xl font-extrabold text-dark-navy mb-1">{item.value}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const TESTIMONIALS = [
  {
    name: "Sanduni Perera",
    role: "Home Owner",
    text: "LankaProperty helped me find my dream home in Rajagiriya within just two weeks! The virtual tour feature was a game-changer for my busy schedule.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=sanduni"
  },
  {
    name: "Dr. Rohan Silva",
    role: "Property Investor",
    text: "Reliable and professional. Lalith and his team at LankaProperty are the best in the business for high-value commercial land deals in Colombo.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=rohan"
  },
  {
    name: "Michael de Soyza",
    role: "Overseas Buyer",
    text: "As an overseas investor, transparency is key. Their mortgage calculator and detailed property insights made the process seamless and trustworthy.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=michael"
  }
];

const TestimonialsSection = () => (
  <section className="py-20 bg-gray-50 overflow-hidden">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-extrabold text-dark-navy mb-4">What Our Clients Say</h2>
        <div className="w-20 h-1.5 bg-brand-green mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((testimonial, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative group hover:shadow-xl hover:-translate-y-1 compact-transition"
          >
            <div className="absolute top-8 right-8 text-brand-green/20">
              <Quote size={40} />
            </div>
            
            <div className="flex gap-1 mb-6 text-orange-400">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            
            <p className="text-gray-600 italic mb-8 leading-relaxed">"{testimonial.text}"</p>
            
            <div className="flex items-center gap-4">
              <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full ring-2 ring-brand-green/10" />
              <div>
                <div className="font-bold text-dark-navy leading-tight">{testimonial.name}</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{testimonial.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const AD_PACKAGES = [
  {
    name: "Starter",
    price: "Free",
    duration: "30 Days",
    description: "Ideal for individuals looking to test the waters with a single property listing.",
    features: [
      "Standard Property Listing",
      "Up to 3 High-Res Photos",
      "Basic Search Visibility",
      "Standard Email Support",
      "Public Search Integration"
    ],
    highlight: false,
    color: "bg-slate-100",
    textColor: "text-slate-600"
  },
  {
    name: "Premium",
    price: "Rs. 4,500",
    duration: "60 Days",
    description: "The most popular choice for serious sellers and professional agents.",
    features: [
      "Featured Position (Top 5)",
      "Up to 15 High-Res Photos",
      "Priority Search Placement",
      "Social Media Promotion",
      "Direct WhatsApp Inquiry Button",
      "Verified Seller Badge"
    ],
    highlight: true,
    color: "bg-brand-green",
    textColor: "text-white"
  },
  {
    name: "Elite",
    price: "Rs. 12,500",
    duration: "90 Days",
    description: "Maximum exposure for high-value luxury properties and commercial projects.",
    features: [
      "Top-Shelf Branding",
      "Unlimited Professional Photos",
      "360° Virtual Tour Creation",
      "Dedicated Account Manager",
      "Weekly Performance Reports",
      "Multi-Platform Ad Network",
      "Drone Photography Support"
    ],
    highlight: false,
    color: "bg-dark-navy",
    textColor: "text-white"
  }
];

const PricingPackages = ({ onBack, onGetStarted }: { onBack: () => void, onGetStarted: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-6 py-16"
    >
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-extrabold text-dark-navy tracking-tight">
          Advertising <FlipWords words={["Packages", "Solutions", "Plans", "Options"]} className="text-brand-green min-w-[180px]" />
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium">
          Choose the perfect plan to reach over 500,000 potential buyers and renters every month in Sri Lanka.
        </p>
        <div className="w-24 h-1.5 bg-brand-green mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {AD_PACKAGES.map((pkg, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8 }}
            className={`relative rounded-[32px] p-8 border border-gray-100 flex flex-col h-full bg-white shadow-xl shadow-gray-100/50 compact-transition ${pkg.highlight ? 'ring-2 ring-brand-green' : ''}`}
          >
            {pkg.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-green text-white text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-dark-navy mb-2">{pkg.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black text-brand-green tracking-tight">{pkg.price}</span>
                <span className="text-gray-500 text-base font-bold">/ {pkg.duration}</span>
              </div>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">{pkg.description}</p>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              {pkg.features.map((feature, fIdx) => (
                <div key={fIdx} className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mt-0.5">
                    <CheckCircle size={14} fill="currentColor" className="text-brand-green flex-grow-0" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onGetStarted}
              className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide uppercase compact-transition ${pkg.highlight ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20 hover:bg-brand-green-dark' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Get Started
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 bg-dark-navy rounded-[40px] p-12 text-white relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl -mb-48 -mr-48"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-extrabold leading-tight">Need a Custom Solution for your Agency?</h3>
            <p className="text-gray-400 font-medium leading-relaxed">
              We offer exclusive enterprise packages for real estate agencies, developers, and large-scale property management firms. Get bulk listing discounts and priority support.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => window.open('https://wa.me/94773951560', '_blank')}
                className="bg-brand-green text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark compact-transition"
              >
                Schedule a Demo
              </button>
              <button 
                onClick={onBack}
                className="bg-white/10 text-white font-bold py-4 px-8 rounded-2xl backdrop-blur-md hover:bg-white/20 compact-transition"
              >
                Back to Home
              </button>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-sm border border-white/5">
                <div className="text-brand-green font-black text-2xl mb-1">98%</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Satisfaction Rate</div>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-sm border border-white/5">
                <div className="text-brand-green font-black text-2xl mb-1">24h</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Listing Approval</div>
              </div>
            </div>
            <div className="pt-8 space-y-4">
              <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-sm border border-white/5">
                <div className="text-brand-green font-black text-2xl mb-1">5k+</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Agents</div>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-sm border border-white/5">
                <div className="text-brand-green font-black text-2xl mb-1">10M+</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Page Views</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AboutUs = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-6 py-12"
    >
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-dark-navy tracking-tight">About LankaProperty.lk</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Sri Lanka's most trusted real estate marketplace, dedicated to connecting people with their ideal properties since 2011.
          </p>
          <div className="w-24 h-1.5 bg-brand-green mx-auto rounded-full"></div>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" 
              className="w-full h-full object-cover" 
              alt="Our Story" 
            />
            <div className="absolute inset-0 bg-brand-green/10"></div>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-dark-navy">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              Founded over a decade ago, LankaProperty.lk emerged from a simple vision: to bring transparency and efficiency to the Sri Lankan real estate market. We understood the challenges buyers and sellers faced, and we set out to build a platform that prioritizes trust, accuracy, and user experience.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, we are proud to be the premier destination for property seekers across the island, hosting over 15,000 active listings and serving a community of thousands of verified agents and developers.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-1 text-center">
                <div className="text-2xl font-black text-brand-green">12+</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Years Experience</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-1 text-center">
                <div className="text-2xl font-black text-brand-green">15k+</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Listings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-dark-navy p-12 rounded-[32px] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-brand-green">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold">Uncompromising Trust</h3>
              <p className="text-gray-400 text-sm leading-relaxed">We verify our agents and listings to ensure that every interaction on our platform is safe and reliable.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-brand-green">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold">Island-wide Coverage</h3>
              <p className="text-gray-400 text-sm leading-relaxed">From the heart of Colombo to the hills of Kandy, we list properties in every corner of Sri Lanka.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-brand-green">
                <User size={32} />
              </div>
              <h3 className="text-xl font-bold">Customer First</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Our dedicated support team and expert agents are always here to guide you through your journey.</p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="text-center space-y-6 max-w-2xl mx-auto py-8">
          <h2 className="text-3xl font-extrabold text-dark-navy">Our Mission</h2>
          <p className="text-gray-600 text-lg italic font-medium leading-relaxed">
            "To empower everyone in Sri Lanka to find their place in the world through innovative technology and a commitment to radical transparency."
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => onBack()}
              className="bg-brand-green text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-green-dark compact-transition shadow-lg shadow-brand-green/20"
            >
              Back to Home
            </button>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-dark-navy text-white font-bold py-4 px-8 rounded-xl hover:opacity-90 compact-transition"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AuthPage = ({ onBack, onLogin }: { onBack: () => void, onLogin: (email: string) => void }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[70vh]"
    >
      <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200 border border-gray-100 p-10 max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -mr-16 -mt-16"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-dark-navy tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400 text-sm font-medium">
              {mode === 'login' ? 'Enter your details to access your account' : 'Join Sri Lanka\'s premier property network'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-12 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green compact-transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-12 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green compact-transition"
                  required
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <a href="#" className="text-xs font-bold text-brand-green hover:underline">Forgot Password?</a>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-brand-green text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark compact-transition mt-4"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold"><span className="bg-white px-2 text-gray-300">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 border border-gray-100 rounded-2xl py-3 hover:bg-gray-50 compact-transition">
              <img src="https://www.iconpacks.net/icons/2/free-google-logo-icon-2422-thumb.png" className="h-5" alt="Google" />
              <span className="text-sm font-bold text-gray-600">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-100 rounded-2xl py-3 hover:bg-gray-50 compact-transition">
              <Facebook className="text-[#1877f2]" size={20} fill="currentColor" />
              <span className="text-sm font-bold text-gray-600">Facebook</span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400 font-medium">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-brand-green font-bold hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>

          <button 
            onClick={onBack}
            className="w-full text-gray-400 text-xs font-bold hover:text-gray-600 compact-transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [recentFilter, setRecentFilter] = useState<"Sale" | "Rent">("Sale");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentView, setCurrentView] = useState<{ type: 'home' | 'category' | 'detail' | 'contact' | 'about' | 'packages' | 'auth', data?: any }>({ type: 'home' });
  const [user, setUser] = useState<{ email: string } | null>(null);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView.type]);

  const navigateToAuth = () => setCurrentView({ type: 'auth' });
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showCalculator, setShowCalculator] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);

  // Expose virtual tour control for global access from nested components
  useEffect(() => {
    // @ts-ignore
    window.setShowVirtualTour = setShowVirtualTour;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredRecent = FEATURED_PROPERTIES.filter(p => p.type === recentFilter);
  const categoryProperties = currentView.type === 'category' 
    ? FEATURED_PROPERTIES // Simplified: showing all for demo
    : [];

  const handleCategoryClick = (category: string) => {
    setCurrentView({ type: 'category', data: category });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleDetailClick = (property: any) => {
    setCurrentView({ type: 'detail', data: property });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateHome = () => {
    setCurrentView({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="bg-dark-navy h-10 flex items-center">
          <div className="container mx-auto px-6 flex justify-between items-center text-xs text-gray-300">
            <div className="flex gap-6">
              <span className="flex items-center gap-1.5 opacity-90">Hotline: +94 33 222 96 95</span>
              <span className="flex items-center gap-1.5 opacity-90">Email: info@lankaproperty.lk</span>
            </div>
            <div className="flex items-center gap-4 font-medium">
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView({ type: 'auth' }); }} className="hover:text-white compact-transition">Login</a>
              <span className="text-gray-700 text-xs">|</span>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView({ type: 'packages' }); }} className="font-bold text-brand-green hover:text-brand-green-dark compact-transition">Post a Free Ad</a>
            </div>
          </div>
        </div>
        <nav className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateHome()}>
            <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-white font-bold text-xl">L</div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold tracking-tight text-dark-navy leading-none">LankaProperty<span className="text-brand-green">.lk</span></h1>
            </div>
          </div>
          <ul className="hidden lg:flex items-center gap-8 text-base font-semibold text-slate-700">
            {["Home", "About", "Real Estate", "Packages", "Agents", "Advertising", "Contact"].map((item) => (
              <li key={item}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (item === 'Home') navigateHome();
                    else if (item === 'About') setCurrentView({ type: 'about' });
                    else if (item === 'Packages') setCurrentView({ type: 'packages' });
                    else if (item === 'Advertising') setCurrentView({ type: 'packages' });
                    else if (item === 'Contact') setCurrentView({ type: 'contact' });
                  }}
                  className={`${(item === 'Home' && currentView.type === 'home' || item === 'About' && currentView.type === 'about' || item === 'Packages' && currentView.type === 'packages' || item === 'Advertising' && currentView.type === 'packages' || item === 'Contact' && currentView.type === 'contact') ? 'text-brand-green border-b-2 border-brand-green pb-1.5' : 'hover:text-brand-green'} compact-transition`}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-5">
            {user ? (
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-full pl-1.5 pr-4 py-2">
                <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white text-sm font-bold">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="text-sm font-bold text-dark-navy truncate max-w-[140px]">{user.email}</span>
                <button onClick={() => setUser(null)} className="text-gray-400 hover:text-red-500 ml-1">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setCurrentView({ type: 'auth' })}
                className="bg-brand-green text-white font-bold text-sm px-8 py-4 rounded-2xl hover:bg-brand-green-dark compact-transition shadow-lg shadow-brand-green/20"
              >
                Sign In
              </button>
            )}
            <button className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl text-base font-bold hover:bg-gray-200 compact-transition">
              Menu
            </button>
          </div>
        </nav>
      </header>
      
      <AnimatePresence mode="wait">
        {currentView.type === 'home' && (
          <motion.main 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow space-y-12 pb-16"
          >
            <Hero onDirectInquiry={() => setCurrentView({ type: 'contact' })} />
            <div className="bg-gray-50 border-b border-gray-100 py-6">
              <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="flex gap-8 overflow-x-auto pb-4 no-scrollbar">
                  {PROPERTY_CATEGORIES.map((cat, idx) => (
                    <motion.div
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat.name)}
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-2.5 min-w-[100px] cursor-pointer group"
                    >
                      <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100 group-hover:border-brand-green group-hover:shadow-lg group-hover:shadow-brand-green/10 compact-transition">
                        <div className="text-gray-400 group-hover:text-brand-green group-hover:scale-110 compact-transition">
                          {cat.icon}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-600 uppercase tracking-widest group-hover:text-brand-green">{cat.name}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center gap-8 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm ml-6">
                  <button className="px-10 py-3 bg-brand-green text-white text-sm font-black rounded-xl compact-transition hover:bg-brand-green-dark shadow-lg shadow-brand-green/20">Buy</button>
                  <button className="px-10 py-3 text-gray-500 text-sm font-black hover:text-dark-navy compact-transition">Rent</button>
                </div>
              </div>
            </div>

            <ExpertiseSection />

            <section className="container mx-auto px-6">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-10">
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="text-xl font-extrabold text-dark-navy">Featured Properties</h2>
                      <a href="#" className="text-sm text-brand-green font-bold hover:underline">View All &rarr;</a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {FEATURED_PROPERTIES.slice(0,3).map(p => (
                        <PropertyCard 
                          key={p.id} 
                          property={p} 
                          onClick={() => handleDetailClick(p)}
                          isFavorited={favorites.has(p.id)}
                          onToggleFavorite={() => toggleFavorite(p.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                      <h2 className="text-xl font-extrabold text-dark-navy">Recent Listings</h2>
                      <div className="flex bg-gray-100 p-1.5 rounded-xl">
                        <button onClick={() => setRecentFilter("Sale")} className={`px-8 py-2 rounded-lg text-xs font-bold compact-transition ${recentFilter === 'Sale' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Buy</button>
                        <button onClick={() => setRecentFilter("Rent")} className={`px-8 py-2 rounded-lg text-xs font-bold compact-transition ${recentFilter === 'Rent' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Rent</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRecent.map(p => (
                        <motion.div key={`${recentFilter}-${p.id}`} layout transition={{ duration: 0.2 }}>
                          <PropertyCard 
                            property={p} 
                            onClick={() => handleDetailClick(p)} 
                            isFavorited={favorites.has(p.id)}
                            onToggleFavorite={() => toggleFavorite(p.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-64 shrink-0">
                  <Sidebar 
                    onOpenCalculator={() => setShowCalculator(true)} 
                    onShowPackages={() => setCurrentView({ type: 'packages' })}
                  />
                </div>
              </div>
            </section>

            <TestimonialsSection />
          </motion.main>
        )}

        {currentView.type === 'category' && (
          <motion.main 
            key="category"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-grow pb-16"
          >
            <div className="bg-white border-b border-gray-100 py-8">
              <div className="container mx-auto px-6">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 font-medium">
                  <a href="#" onClick={navigateHome} className="hover:text-brand-green">Home</a>
                  <ChevronDown size={12} className="-rotate-90" />
                  <span className="text-gray-900">{currentView.data}s in Sri Lanka</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h1 className="text-3xl font-bold text-dark-navy">{currentView.data}s For Sale & Rent</h1>
                    <p className="text-gray-500 mt-2 text-sm">Showing verified {currentView.data?.toLowerCase()} listings</p>
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setRecentFilter("Sale")} className={`px-6 py-2 rounded-md text-xs font-bold compact-transition ${recentFilter === 'Sale' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>For Buy</button>
                    <button onClick={() => setRecentFilter("Rent")} className={`px-6 py-2 rounded-md text-xs font-bold compact-transition ${recentFilter === 'Rent' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>For Rent</button>
                  </div>
                </div>
              </div>
            </div>

            <section className="container mx-auto px-6 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoryProperties.map(p => (
                  <PropertyCard 
                    key={p.id} 
                    property={p} 
                    onClick={() => handleDetailClick(p)}
                    isFavorited={favorites.has(p.id)}
                    onToggleFavorite={() => toggleFavorite(p.id)}
                  />
                ))}
              </div>
            </section>
          </motion.main>
        )}

        {currentView.type === 'detail' && (
          <PropertyDetail 
            property={currentView.data} 
            onBack={navigateHome} 
            isFavorited={favorites.has(currentView.data.id)}
            onToggleFavorite={() => toggleFavorite(currentView.data.id)}
            onOpenCalculator={() => setShowCalculator(true)}
            onPropertyClick={(p) => handleDetailClick(p)}
          />
        )}

        {currentView.type === 'contact' && (
          <ContactUs onBack={navigateHome} />
        )}

        {currentView.type === 'about' && (
          <AboutUs onBack={navigateHome} />
        )}

        {currentView.type === 'packages' && (
          <PricingPackages onBack={navigateHome} onGetStarted={() => setCurrentView({ type: 'auth' })} />
        )}

        {currentView.type === 'auth' && (
          <AuthPage 
            onBack={navigateHome} 
            onLogin={(email) => {
              setUser({ email });
              setCurrentView({ type: 'home' });
            }} 
          />
        )}
      </AnimatePresence>

      <Footer 
        onNavigateHome={navigateHome} 
        onShowContact={() => setCurrentView({ type: 'contact' })} 
        onShowAbout={() => setCurrentView({ type: 'about' })} 
        onShowPackages={() => setCurrentView({ type: 'packages' })} 
      />

      <MortgageCalculatorModal 
        isOpen={showCalculator} 
        onClose={() => setShowCalculator(false)} 
        initialAmount={currentView.type === 'detail' ? parseInt(currentView.data.price.replace(/[^0-9]/g, '')) || 10000000 : 10000000}
      />

      <VirtualTourModal 
        isOpen={showVirtualTour}
        onClose={() => setShowVirtualTour(false)}
        propertyTitle={currentView.type === 'detail' ? currentView.data.title : 'Selected Property'}
      />

      <a 
        href="https://wa.me/94773951560" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-[150] group flex flex-col items-end gap-3"
        title="Chat with Lalith on WhatsApp"
      >
        <span className="bg-white text-dark-navy text-xs font-bold py-2 px-4 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none compact-transition whitespace-nowrap border border-gray-100">
          Chat with Lalith
        </span>
        <div className="relative">
          <div className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 compact-transition overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" 
              className="w-full h-full object-cover group-hover:opacity-0 compact-transition" 
              alt="Lalith"
            />
            <MessageCircle size={30} fill="currentColor" className="absolute opacity-0 group-hover:opacity-100 compact-transition" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#25D366] rounded-full border-2 border-white flex items-center justify-center p-1">
            <MessageCircle size={10} fill="currentColor" className="text-white" />
          </div>
        </div>
      </a>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-brand-green text-white rounded-full flex items-center justify-center shadow-xl hover:bg-brand-green-dark compact-transition z-[100]"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

