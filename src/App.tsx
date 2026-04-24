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
  Box
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

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Types & Data ---
const PROPERTY_CATEGORIES = [
  { name: "Land", icon: <LandPlot className="w-6 h-6" />, count: "1,382" },
  { name: "House", icon: <HomeIcon className="w-6 h-6" />, count: "1,524" },
  { name: "Apartment", icon: <Building2 className="w-6 h-6" />, count: "108" },
  { name: "Building", icon: <Building className="w-6 h-6" />, count: "350" },
  { name: "Hotel", icon: <Hotel className="w-6 h-6" />, count: "184" },
  { name: "Business", icon: <Briefcase className="w-6 h-6" />, count: "52" },
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
  { name: "Mr. Lalith Ratnatunga", role: "Manager", img: "https://i.pravatar.cc/150?u=1" },
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

const WORDS = ["Home", "Villa", "Land", "Apartment", "Office"];

const Hero = () => {
  const [activeStatus, setActiveStatus] = useState<"Sale" | "Rent">("Sale");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
            <div className="inline-block relative h-[1.15em] w-full align-top overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORDS[index]}
                  initial={{ y: 30, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -30, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="text-brand-green block"
                >
                  {WORDS[index]}
                </motion.span>
              </AnimatePresence>
            </div>
            in Sri Lanka.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-white/90 text-sm font-medium"
          >
            Over 15,000+ properties available for sale and rent across the island. 
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 rounded-2xl w-full max-w-sm"
        >
          <h3 className="text-xs font-bold mb-4 uppercase tracking-wider text-gray-500">Search Properties</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setActiveStatus("Sale")}
                className={`py-2.5 rounded-lg text-xs font-bold compact-transition ${activeStatus === 'Sale' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                For Sale
              </button>
              <button 
                onClick={() => setActiveStatus("Rent")}
                className={`py-2.5 rounded-lg text-xs font-bold compact-transition ${activeStatus === 'Rent' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                For Rent
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                  <option>All Types</option>
                  <option>Houses</option>
                  <option>Lands</option>
                  <option>Apartments</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                  <option>City</option>
                  <option>Colombo</option>
                  <option>Kandy</option>
                  <option>Galle</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                  <option>Beds</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                </select>
                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                  <option>Baths</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                </select>
                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs font-bold">LKR</span>
              </div>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-12 pr-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                <option>Price Range</option>
                <option>Below 10M</option>
                <option>10M - 50M</option>
                <option>50M - 100M</option>
                <option>Above 100M</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            <button className="w-full py-3 bg-brand-red text-white text-sm font-bold rounded-lg shadow-lg shadow-red-200 hover:bg-brand-red-dark compact-transition uppercase tracking-wide mt-2">
              Search Now
            </button>
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
      className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-sm compact-transition ${
        isFavorited ? 'bg-brand-red text-white' : 'bg-white/50 text-gray-700 hover:bg-white hover:text-brand-red'
      }`}
    >
      <Heart size={12} fill={isFavorited ? "currentColor" : "none"} />
    </button>
    <div className="relative h-36 bg-gray-200 overflow-hidden">
      <img src={property.image} alt={property.title} className="w-full h-full object-cover compact-transition group-hover:scale-105" />
      <span className="absolute top-2 left-2 bg-brand-red text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">For {property.type}</span>
      <span className="absolute top-2 right-10 bg-white/90 text-gray-900 text-[9px] font-bold px-2 py-0.5 rounded-full">{property.location}</span>
    </div>
    <div className="p-3 flex flex-col gap-1">
      <div className="text-brand-green font-bold text-sm leading-none">{property.price === 'Contact for Price' ? 'LKR Contact' : property.price}</div>
      {(() => {
        const converted = convertPrice(property.price);
        if (!converted) return null;
        return (
          <div className="flex gap-2 text-[8px] font-bold text-gray-400 mt-0.5">
            <span>{converted.usd}</span>
            <span className="opacity-40">•</span>
            <span>{converted.eur}</span>
          </div>
        );
      })()}
      <div className="text-xs font-semibold text-gray-800 line-clamp-1 leading-tight">{property.title}</div>
      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
        <span className="flex items-center gap-1 font-medium"><Building2 size={10} /> 3 Beds</span>
        <span className="flex items-center gap-1 font-medium"><LandPlot size={10} /> 15 Perch</span>
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
                <div className="text-xs text-gray-400 font-bold uppercase mb-2">Asking Price</div>
                <div className="text-3xl font-extrabold text-brand-green mb-1">{property.price}</div>
                {(() => {
                  const converted = convertPrice(property.price);
                  if (!converted) return null;
                  return (
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-400 mb-8">
                      <span className="flex items-center gap-1"><DollarSign size={14} /> {converted.usd}</span>
                      <span className="opacity-30">|</span>
                      <span className="flex items-center gap-1 font-medium">{converted.eur}</span>
                    </div>
                  );
                })()}

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img src="https://i.pravatar.cc/150?u=manager" className="w-16 h-16 rounded-full border-2 border-brand-green" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center text-white border-2 border-white">
                        <Shield size={12} fill="currentColor" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-dark-navy">Lalith Ratnatunga</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                        <span className="text-brand-green">Verified Agent</span>
                        <span className="text-gray-300">•</span>
                        <span>4.8 Rating</span>
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
              <div className="space-y-4">
                <input placeholder="Your Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none" />
                <input placeholder="Phone Number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none" />
                <textarea placeholder="Your Message..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none resize-none"></textarea>
                <button className="w-full py-3 bg-brand-green text-white text-xs font-bold rounded-xl hover:bg-brand-green-dark compact-transition">Request Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Sidebar = ({ onOpenCalculator }: { onOpenCalculator: () => void }) => (
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
        <h4 className="text-sm font-bold">Sell your home?</h4>
        <p className="text-[10px] text-gray-400 mt-1 mb-4 leading-tight">List for free and reach 500k monthly buyers across the island.</p>
        <button className="w-full py-2 bg-brand-green text-white text-[10px] font-bold rounded-lg hover:bg-brand-green-dark compact-transition">
          List Now
        </button>
      </div>
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-brand-green/20 rounded-full group-hover:scale-150 compact-transition"></div>
    </div>
  </aside>
);

const Footer = () => (
  <footer className="bg-dark-navy py-6 border-t border-gray-800">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-[10px] text-gray-500">
        &copy; 2026 LankaProperty.lk - Sri Lanka's #1 Real Estate Marketplace.
      </div>

      <div className="flex gap-3">
        {[
          { Icon: Facebook, link: "https://facebook.com" },
          { Icon: Twitter, link: "https://twitter.com" },
          { Icon: Instagram, link: "https://instagram.com" },
          { Icon: Linkedin, link: "https://linkedin.com" }
        ].map(({ Icon, link }, i) => (
          <a 
            key={i} 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:border-brand-green hover:text-brand-green bg-dark-navy hover:bg-gray-800 compact-transition"
          >
            <Icon size={14} />
          </a>
        ))}
      </div>

      <div className="flex gap-6 text-[10px] text-gray-400 font-medium">
        {["Terms", "Privacy", "Sitemap"].map(item => (
          <a key={item} href="#" className="hover:text-white compact-transition">{item}</a>
        ))}
        <a href="#" className="font-semibold text-brand-green hover:text-brand-green-dark compact-transition underline underline-offset-4">Agent Login</a>
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
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Loan Amount (LKR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rs.</span>
                  <input 
                    type="number" 
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-dark-navy font-bold focus:ring-2 focus:ring-brand-green outline-none compact-transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Interest Rate (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-dark-navy font-bold focus:ring-2 focus:ring-brand-green outline-none compact-transition"
                    />
                    <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Loan Term (Years)</label>
                  <input 
                    type="number" 
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-dark-navy font-bold focus:ring-2 focus:ring-brand-green outline-none compact-transition"
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
      initial={{ opacity: 0, y: 20 }}
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
            <div className="relative z-10 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-dark-navy mb-2">Send us an inquiry</h2>
                <p className="text-sm text-gray-400 font-medium">Fill out the form below and our team will get back to you within 24 hours.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition" placeholder="+94 77 123 4567" />
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
                  <textarea rows={5} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button className="w-full bg-brand-green text-white font-bold py-4 rounded-xl hover:bg-brand-green-dark compact-transition shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2">
                  <Send size={18} /> Submit Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [recentFilter, setRecentFilter] = useState<"Sale" | "Rent">("Sale");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentView, setCurrentView] = useState<{ type: 'home' | 'category' | 'detail' | 'contact', data?: any }>({ type: 'home' });
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
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="bg-dark-navy h-8 flex items-center">
          <div className="container mx-auto px-6 flex justify-between items-center text-[10px] text-gray-300">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 opacity-80">Hotline: +94 33 222 96 95</span>
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
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateHome()}>
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-dark-navy leading-none">LankaProperty<span className="text-brand-green">.lk</span></h1>
            </div>
          </div>
          <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            {["Home", "Real Estate", "Directory", "Agents", "Advertising", "Contact"].map((item) => (
              <li key={item}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (item === 'Home') navigateHome();
                    else if (item === 'Contact') setCurrentView({ type: 'contact' });
                  }}
                  className={`${(item === 'Home' && currentView.type === 'home' || item === 'Contact' && currentView.type === 'contact') ? 'text-brand-green border-b-2 border-brand-green pb-1' : 'hover:text-brand-green'} compact-transition`}
                >
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
      
      <AnimatePresence mode="wait">
        {currentView.type === 'home' && (
          <motion.main 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow space-y-12 pb-16"
          >
            <Hero />
            <div className="bg-gray-50 border-b border-gray-100 py-6">
              <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {PROPERTY_CATEGORIES.map((cat, idx) => (
                    <motion.div
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat.name)}
                      className="flex flex-col items-center gap-1.5 min-w-[80px] cursor-pointer group"
                    >
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 group-hover:border-brand-green compact-transition">
                        <div className="text-gray-400 group-hover:text-brand-green group-hover:scale-110 compact-transition">
                          {cat.icon}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight group-hover:text-brand-green">{cat.name}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-gray-200">
                  <button className="px-4 py-1.5 bg-brand-green text-white text-[10px] font-bold rounded-md compact-transition">Buy</button>
                  <button className="px-4 py-1.5 text-gray-400 text-[10px] font-bold hover:text-gray-600 compact-transition">Rent</button>
                </div>
              </div>
            </div>

            <section className="container mx-auto px-6">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-10">
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="text-lg font-bold text-dark-navy">Featured Properties</h2>
                      <a href="#" className="text-xs text-brand-green font-bold hover:underline">View All &rarr;</a>
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
                      <h2 className="text-lg font-bold text-dark-navy">Recent Listings</h2>
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setRecentFilter("Sale")} className={`px-6 py-1.5 rounded-md text-[10px] font-bold compact-transition ${recentFilter === 'Sale' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Buy</button>
                        <button onClick={() => setRecentFilter("Rent")} className={`px-6 py-1.5 rounded-md text-[10px] font-bold compact-transition ${recentFilter === 'Rent' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Rent</button>
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
                <div className="w-full lg:w-64 shrink-0"><Sidebar onOpenCalculator={() => setShowCalculator(true)} /></div>
              </div>
            </section>
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
      </AnimatePresence>

      <Footer />

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

