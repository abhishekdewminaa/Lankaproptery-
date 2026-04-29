import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "./supabaseClient";
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
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  Smartphone,
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
  Camera,
  Maximize,
  Plus,
  CreditCard,
  Tag,
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
  Box,
  Quote,
  Star,
  Lock,
  LogOut,
  Youtube,
  PenTool,
  MessageSquare,
  Languages,
  Loader2,
  Sparkles,
  Wand2,
  X,
  Info
} from "lucide-react";
import { translateToSinhala } from "./services/geminiService";
import PropertyWanted from "./components/PropertyWanted";
import CustomerInquiries from "./components/CustomerInquiries";
import { useProperties, Property } from "./hooks/useProperties";

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
  { name: "Land", icon: <LandPlot className="w-8 h-8" />, count: "1,382", color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "House", icon: <HomeIcon className="w-8 h-8" />, count: "1,524", color: "text-orange-500", bg: "bg-orange-50" },
  { name: "Apartment", icon: <Building2 className="w-8 h-8" />, count: "108", color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Building", icon: <Building className="w-8 h-8" />, count: "350", color: "text-indigo-500", bg: "bg-indigo-50" },
  { name: "Hotel", icon: <Hotel className="w-8 h-8" />, count: "184", color: "text-rose-500", bg: "bg-rose-50" },
  { name: "Business", icon: <Briefcase className="w-8 h-8" />, count: "52", color: "text-amber-500", bg: "bg-amber-50" },
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
    agentId: "lalith-ratnatunga",
    description: "Step into luxury with this stunning architect-designed residence located in one of Ratmalana's most sought-after residential pockets. This property defines modern elegance through its minimalist aesthetic and functional floor plan."
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
    agentId: "lalith-ratnatunga",
    description: "Valuable residential land located in the heart of Nittambuwa. Perfect for building your dream home in a quiet yet accessible neighborhood. Close to supermarkets, schools, and public transport."
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
    agentId: "lalith-ratnatunga",
    description: "A rare opportunity to own a large plot of land in Talawakele. Contains a well-maintained house with beautiful views of the surrounding hills. Ideal for a holiday home or eco-tourism project."
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
    agentId: "chamath-wickramasooriya",
    description: "Experience urban living at its finest in this spacious 3-bedroom apartment in Colombo 03. Features modern amenities, 24/7 security, and breathtaking city views. Walking distance to major shopping malls."
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
    agentId: "chamath-wickramasooriya",
    description: "Stunning beachfront guest house available for lease in Negombo. Fully furnished with 8 bedrooms, common lounge, and pool area. Perfect for seasoned hospitality entrepreneurs."
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
    agentId: "barnad-fernando",
    description: "Large warehouse space with high ceilings and wide entrance for heavy vehicle access. Located in a prime industrial zone in Wattala with easy access to the highway and port."
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
  { 
    id: "lalith-ratnatunga",
    name: "Lion Lalith Ranatunga MAF", 
    role: "Executive Director | Real Estate Agent | Visa Consultant", 
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
    experience: "15+ Years",
    credentials: "B. Sc. Mgt (Sp) USJ, LICA, PGD. Real Estate Mgt (Uni of Toronto)",
    phone: "+94 77 395 1560",
    email: "lalith@lankaproperty.lk",
    bio: "Lalith is a seasoned real estate professional with over 15 years of experience in the Sri Lankan market. As Executive Director of LankaProperty.lk, he leads the strategic direction of our agency while offering specialized expertise in real estate investment and visa consultancy.",
    listings: [1, 2, 3],
    reviews: [
      { user: "Rohan S.", rating: 5, comment: "Lalith provided exceptional service. Very professional and knowledgeable.", date: "2 months ago" },
      { user: "Anusha K.", rating: 5, comment: "Highly recommend working with Lalith. He made the buying process so easy.", date: "5 months ago" }
    ]
  },
  { 
    id: "chamath-wickramasooriya",
    name: "Chamath Wickramasooriya", 
    role: "Sales Lead", 
    img: "https://i.pravatar.cc/150?u=2",
    experience: "8 Years",
    phone: "+94 77 123 4567",
    email: "chamath@lankaproperty.lk",
    bio: "Chamath leads our sales team with a focus on residential properties in Colombo and Kandy. His energetic approach and market insight ensure clients get the best deals.",
    listings: [4, 5],
    reviews: [
      { user: "Sunil F.", rating: 4, comment: "Great experience with Chamath. He found us a perfect apartment.", date: "1 month ago" }
    ]
  },
  { 
    id: "barnad-fernando",
    name: "Barnad Fernando", 
    role: "Consultant", 
    img: "https://i.pravatar.cc/150?u=3",
    experience: "12 Years",
    phone: "+94 77 987 6543",
    email: "barnad@lankaproperty.lk",
    bio: "Barnad specializes in commercial property consulting and large-scale land acquisitions. His strategic advice is highly valued by property investors.",
    listings: [6],
    reviews: []
  },
  { 
    id: "deshani-kaushalya",
    name: "Deshani Kaushalya", 
    role: "Agent", 
    img: "https://i.pravatar.cc/150?u=4",
    experience: "4 Years",
    phone: "+94 71 555 1234",
    email: "deshani@lankaproperty.lk",
    bio: "Deshani is a rising star in real estate, known for her attention to detail and commitment to customer satisfaction. She specializes in luxury villas and holiday homes.",
    listings: [],
    reviews: [
      { user: "Kasun T.", rating: 5, comment: "Deshani was very helpful and patient with all our questions.", date: "3 weeks ago" }
    ]
  },
];

// --- Components ---

const Navbar = () => (
  <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
    <div className="bg-dark-navy h-8 flex items-center">
      <div className="container mx-auto px-6 flex justify-between items-center text-[10px] text-gray-300">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 opacity-80 underline-offset-2">
            <motion.span 
              animate={{ opacity: [1, 0.4, 1] }} 
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_5px_#00b562]"
            ></motion.span>
            Hotline: +94 33 222 96 95
          </span>
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
        {["Home", "Directory", "Agents", "Advertising", "Contact"].map((item) => (
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
              animate={{ 
                boxShadow: ["0 0 0px rgba(239, 68, 68, 0)", "0 0 20px rgba(239, 68, 68, 0.4)", "0 0 0px rgba(239, 68, 68, 0)"] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
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
            initial={{ y: 0 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5 min-w-[80px]"
          >
            <div className={`w-10 h-10 ${cat.bg} rounded-full shadow-sm flex items-center justify-center border border-gray-100 hover:border-brand-green cursor-pointer group compact-transition`}>
              <div className={`${cat.color} group-hover:scale-110 compact-transition`}>
                {cat.icon}
              </div>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">{cat.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const PropertyCard = ({ 
  property, 
  onClick, 
  isFavorited, 
  onToggleFavorite,
  isComparing,
  onToggleCompare
}: any) => (
  <motion.div 
    onClick={onClick}
    className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden flex flex-col compact-transition cursor-pointer relative"
  >
    <div className="absolute top-2 left-2 z-10 flex gap-2">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompare?.(e);
        }}
        className={`p-2 rounded-full backdrop-blur-md compact-transition ${
          isComparing ? 'bg-brand-green text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white hover:text-brand-green shadow-sm'
        }`}
        title={isComparing ? "Remove from comparison" : "Add to comparison"}
      >
        <Copy size={14} />
      </button>
    </div>
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
      <div className="text-sm font-bold text-dark-navy line-clamp-1 leading-tight">{property.title}</div>
      <div className="flex items-baseline gap-1.5 mt-1">
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
  onPropertyClick,
  onAgentClick,
  favorites,
  compareList,
  toggleCompare
}: { 
  property: any, 
  onBack: () => void,
  isFavorited?: boolean,
  onToggleFavorite?: () => void,
  onOpenCalculator?: () => void,
  onPropertyClick?: (p: any) => void,
  onAgentClick?: (agent: any) => void,
  favorites?: Set<number>,
  compareList?: number[],
  toggleCompare?: (id: number) => void
}) => {
  const images = Array(12).fill(property.image).map((img, i) => 
    i === 0 ? img : `https://images.unsplash.com/photo-${1512917774080 + i}-9991f1c4c750?auto=format&fit=crop&q=60&w=800`
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleTranslate = async () => {
    if (translatedDesc) {
      setShowOriginal(false);
      setErrorStatus(null);
      return;
    }

    setIsTranslating(true);
    setErrorStatus(null);
    try {
      const translation = await translateToSinhala(property.description || "");
      setTranslatedDesc(translation);
      setShowOriginal(false);
    } catch (error: any) {
      console.error("Translation failed:", error);
      setErrorStatus("Service busy. Please try again in 1 minute.");
      setTimeout(() => setErrorStatus(null), 5000);
    } finally {
      setIsTranslating(false);
    }
  };

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
              <span className="flex items-center gap-1.5 peer">
                <motion.span 
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-brand-green"
                />
                <Clock size={12} /> Posted 2 days ago
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5"><Eye size={12} /> 1,245 views</span>
              <span className="text-gray-300">|</span>
              <span>Ref: LP-9402</span>
            </div>
            <h1 className="text-2xl font-bold text-dark-navy leading-tight">{property.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xl font-black text-brand-green">{property.price}</span>
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
            </div>
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
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-dark-navy">About this property</h3>
                  <div className="flex gap-2">
                    {!showOriginal && (
                      <button 
                        onClick={() => setShowOriginal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg hover:bg-gray-200 compact-transition"
                      >
                        Show English
                      </button>
                    )}
                    <button 
                      onClick={handleTranslate}
                      disabled={isTranslating || !showOriginal && !!translatedDesc}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold compact-transition ${
                        !showOriginal && translatedDesc 
                        ? 'bg-brand-green/10 text-brand-green cursor-default' 
                        : 'bg-brand-green text-white hover:bg-brand-green-dark shadow-sm'
                      }`}
                    >
                      {isTranslating ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Languages size={12} />
                          {!showOriginal && translatedDesc ? 'Sinhala View' : 'Translate to Sinhala'}
                        </>
                      )}
                    </button>
                    {errorStatus && (
                      <motion.span 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-full right-0 mt-2 text-[9px] text-red-500 font-bold bg-white px-2 py-1 rounded border border-red-100 shadow-sm whitespace-nowrap z-10"
                      >
                        {errorStatus}
                      </motion.span>
                    )}
                  </div>
                </div>
                
                <div className="prose prose-sm text-gray-600 space-y-4 max-w-none">
                  {showOriginal ? (
                    <p>{property.description || "No description available."}</p>
                  ) : (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-brand-green-dark font-medium whitespace-pre-wrap leading-relaxed"
                    >
                      {translatedDesc}
                    </motion.p>
                  )}
                  
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-medium border-t border-gray-50 pt-4 mt-4">
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
                  isFavorited={favorites?.has(p.id)}
                  onToggleFavorite={() => onToggleFavorite?.()} // This is simplified
                  isComparing={compareList?.includes(p.id)}
                  onToggleCompare={() => toggleCompare?.(p.id)}
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

                <div 
                  onClick={() => {
                    const agent = AGENTS.find(a => a.id === property.agentId) || AGENTS[0];
                    onAgentClick?.(agent);
                  }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 cursor-pointer hover:border-brand-green compact-transition group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      {(() => {
                        const agent = AGENTS.find(a => a.id === property.agentId) || AGENTS[0];
                        return (
                          <>
                            <img src={agent.img} className="w-16 h-16 rounded-full border-2 border-brand-green object-cover group-hover:scale-105 compact-transition" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center text-white border-2 border-white">
                              <Shield size={12} fill="currentColor" />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div>
                      {(() => {
                        const agent = AGENTS.find(a => a.id === property.agentId) || AGENTS[0];
                        return (
                          <>
                            <div className="text-sm font-bold text-dark-navy group-hover:text-brand-green compact-transition">{agent.name}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                              <span className="text-brand-green">{agent.role}</span>
                              <span className="text-gray-300">•</span>
                              <span>Verified Agent</span>
                            </div>
                          </>
                        );
                      })()}
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
          className="hidden"
        >
          View Packages
        </button>
      </div>
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-brand-green/20 rounded-full group-hover:scale-150 compact-transition"></div>
    </div>
  </aside>
);

const Footer = ({ onNavigateHome, onShowContact, onShowAbout, onShowPackages, onShowPromotion, onShowAgentAccess, onShowWanted }: { onNavigateHome: () => void, onShowContact: () => void, onShowAbout: () => void, onShowPackages: () => void, onShowPromotion: () => void, onShowAgentAccess: () => void, onShowWanted: () => void }) => (
  <footer className="bg-[#0c1a2e] text-gray-400 pt-20 pb-10">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigateHome()}>
            <div className="w-12 h-12 bg-brand-green rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-green/20">L</div>
            <h2 className="text-3xl font-black tracking-tighter text-white leading-none">LankaProperty<span className="text-brand-green">.lk</span></h2>
          </div>
          <p className="text-lg font-medium text-gray-400 leading-relaxed max-w-sm">
            Sri Lanka's premier real estate marketplace. Connecting buyers, sellers, and renters with the most trusted properties and agents across the island.
          </p>
          <div className="flex gap-4">
            {[
              { icon: Facebook, color: "text-[#1877F2]", bg: "bg-[#1877F2]/10", hover: "hover:bg-[#1877F2]", url: "https://facebook.com" },
              { icon: Twitter, color: "text-[#1DA1F2]", bg: "bg-[#1DA1F2]/10", hover: "hover:bg-[#1DA1F2]", url: "https://twitter.com" },
              { icon: Instagram, color: "text-[#E4405F]", bg: "bg-[#E4405F]/10", hover: "hover:bg-[#E4405F]", url: "https://instagram.com" },
              { icon: Linkedin, color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/10", hover: "hover:bg-[#0A66C2]", url: "https://linkedin.com" },
              { icon: Youtube, color: "text-[#FF0000]", bg: "bg-[#FF0000]/10", hover: "hover:bg-[#FF0000]", url: "https://youtube.com" },
              { icon: PenTool, color: "text-[#000000]", bg: "bg-white/10", hover: "hover:bg-[#000000]", url: "https://medium.com" }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.a 
                  key={i} 
                  href={item.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ 
                    scale: 1.2, 
                    y: -8, 
                    backgroundColor: item.color.replace('text-', '').replace('[', '').replace(']', ''), 
                    color: "#ffffff",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)"
                  }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 rounded-2xl ${item.bg} border border-white/10 flex items-center justify-center ${item.color} compact-transition shadow-xl hover:border-transparent`}
                >
                  <Icon size={24} />
                </motion.a>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Quick Links</h4>
          <ul className="space-y-4 text-base font-medium">
            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowAbout(); }} className="hover:text-brand-green compact-transition">About</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowWanted(); }} className="hover:text-brand-green compact-transition">Property Wanted</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowContact(); }} className="hover:text-brand-green compact-transition">Contact Support</a></li>
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
          <div 
            onClick={() => onShowPromotion()}
            className="flex items-center gap-3 mt-6 text-xs bg-brand-green/10 border border-brand-green/20 p-4 rounded-xl text-brand-green font-bold cursor-pointer hover:bg-brand-green/20 compact-transition"
          >
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
          <button 
            onClick={onShowAgentAccess}
            className="text-xs font-bold text-brand-green hover:underline uppercase tracking-widest underline-offset-4"
          >
            Agent Access
          </button>
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

const ContactUs = ({ onBack, onAgentClick }: { onBack: () => void, onAgentClick?: (agent: any) => void }) => {
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
                    <h3 className="text-lg font-bold leading-tight">Lion Lalith Ranatunga MAF</h3>
                    <p className="text-xs font-medium opacity-80 uppercase tracking-widest leading-relaxed">Executive Director | Real Estate Agent | Visa Consultant</p>
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
                className="group cursor-pointer"
                onClick={() => onAgentClick?.(agent)}
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
    name: "GOLD PACKAGE",
    price: "Rs. 15,000",
    duration: "12 Months",
    description: "Fully Website Advertising with Fully Social Media Marketing across 10 major platforms.",
    features: [
      "12 Months Duration",
      "Featured Property Status",
      "LankaLand.lk, Ikman.lk, Adsme.lk",
      "LankaProperty.lk, LankaPropertyWeb.lk",
      "Jacktree.lk, LankAdz.lk, House.lk",
      "AdBoom.lk, LankaBuySell.lk",
      "Social Media (WhatsApp, FB, IG, TikTok)"
    ],
    highlight: false,
    color: "bg-amber-50/50",
    textColor: "text-amber-600"
  },
  {
    name: "PLATINUM PACKAGE",
    price: "Rs. 25,000",
    duration: "Until Sold",
    description: "Advertised until sold with premium placement and multi-channel marketing.",
    features: [
      "Advertised Until Sold",
      "Featured on 10 Major Websites",
      "LankaLand.lk, Ikman.lk, Adsme.lk",
      "LankaProperty.lk, LankaPropertyWeb.lk",
      "Jacktree.lk, LankAdz.lk, House.lk",
      "AdBoom.lk, LankaBuySell.lk",
      "Fully Social Media Marketing",
      "Priority Direct Support"
    ],
    highlight: true,
    color: "bg-white",
    textColor: "text-brand-green"
  },
  {
    name: "DIAMOND PACKAGE",
    price: "Rs. 45,000",
    duration: "Until Sold",
    description: "Ultimate exposure with home page banners and priority cross-platform marketing.",
    features: [
      "All Platinum Tier Features",
      "High-Traffic Banner Placement",
      "Priority Listing Diagnostics",
      "Featured Ad on LankaProperty.lk",
      "Premium Web Slider (990x340 px)",
      "Dedicated Account Manager",
      "Global Social Media Boost"
    ],
    highlight: false,
    color: "bg-slate-50/50",
    textColor: "text-dark-navy"
  }
];

const NEW_PACKAGES = [
  {
    name: "STARTER FREE",
    price: "FREE",
    duration: "30 Months",
    description: "Extended free trial for long-term project visibility and early-stage listings.",
    features: [
      "30 Months Extended Free Duration",
      "Standard Property Listing",
      "Basic Search Integration",
      "Public Visibility on Main Portal",
      "Email Support Only",
      "Limited Photo Uploads"
    ],
    highlight: false,
    color: "bg-blue-50/50",
    textColor: "text-blue-600"
  },
  {
    name: "PREMIUM PRO",
    price: "Rs. 4,500",
    duration: "2 Months",
    description: "Performance focused 60-day package with priority placement.",
    features: [
      "2 Months (60 Days) Total Exposure",
      "Featured Position (Top 10)",
      "Multi-Site Syndication",
      "WhatsApp Lead Generation",
      "Direct Inquiry Dashboard",
      "Social Media Basic Boost"
    ],
    highlight: false,
    color: "bg-emerald-50/50",
    textColor: "text-emerald-600"
  },
  {
    name: "ELITE PRO",
    price: "Rs. 8,500",
    duration: "3 Months",
    description: "Three months of premium marketing for quicker property turnaround.",
    features: [
      "3 Months (90 Days) Premium Duration",
      "Top-Shelf Branding Options",
      "360° Virtual Tour Base",
      "Weekly Performance Stats",
      "Verified Seller Badge",
      "Cross-Platform Ad Targeting"
    ],
    highlight: true,
    color: "bg-purple-50/50",
    textColor: "text-purple-600"
  }
];

const ComparisonBar = ({ 
  propertyIds, 
  onCompare, 
  onRemove,
  onClear
}: { 
  propertyIds: number[], 
  onCompare: () => void, 
  onRemove: (id: number) => void,
  onClear: () => void
}) => {
  const properties = FEATURED_PROPERTIES.filter(p => propertyIds.includes(p.id));

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 200 }}
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex justify-center pointer-events-none"
    >
      <div className="bg-dark-navy/95 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-3 flex items-center gap-6 pointer-events-auto max-w-full overflow-hidden">
        <div className="hidden md:flex flex-col pl-4 pr-2 border-r border-white/10">
          <span className="text-white font-black text-sm tracking-tight">Comparison Bar</span>
          <span className="text-brand-green text-[10px] uppercase font-black tracking-widest">{properties.length} / 4 Selected</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {properties.map((p) => (
            <div key={p.id} className="relative group shrink-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-brand-green/30">
                <img src={p.image} className="w-full h-full object-cover" alt="" />
              </div>
              <button 
                onClick={() => onRemove(p.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-dark-navy rounded-full flex items-center justify-center shadow-lg hover:bg-brand-red hover:text-white compact-transition"
              >
                <ArrowUp className="rotate-45" size={10} />
              </button>
            </div>
          ))}
          
          {Array(4 - properties.length).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="w-14 h-14 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/5 shrink-0">
              <Plus size={20} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pr-2">
          <button 
            onClick={onClear}
            className="md:px-4 px-2 py-3 text-white/60 hover:text-white text-xs font-bold compact-transition"
          >
            Clear
          </button>
          <button 
            onClick={onCompare}
            disabled={properties.length < 2}
            className={`px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 compact-transition ${
              properties.length >= 2 
                ? 'bg-brand-green text-white hover:bg-brand-green-dark shadow-xl shadow-brand-green/20' 
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            Compare Now <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ComparisonView = ({ 
  propertyIds, 
  onBack,
  onRemove
}: { 
  propertyIds: number[], 
  onBack: () => void,
  onRemove: (id: number) => void
}) => {
  const properties = FEATURED_PROPERTIES.filter(p => propertyIds.includes(p.id));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="container mx-auto px-6 py-12"
    >
      <div className="flex justify-between items-center mb-10">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-green font-bold hover:translate-x-[-4px] compact-transition group">
          <ChevronLeft size={20} className="group-hover:scale-125" /> Back
        </button>
        <h2 className="text-3xl font-black text-dark-navy tracking-tight">Compare Properties</h2>
        <div className="text-sm font-bold text-gray-400">{properties.length} Properties Selected</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {/* Features Column (Hidden on mobile or handled differently) */}
        <div className="hidden lg:block space-y-24 mt-48">
          <div className="h-20 flex items-center font-bold text-gray-400 uppercase tracking-widest text-[10px]">Basic Details</div>
          <div className="font-bold text-slate-400 text-xs">Price</div>
          <div className="font-bold text-slate-400 text-xs">Location</div>
          <div className="font-bold text-slate-400 text-xs">Property Type</div>
          <div className="font-bold text-slate-400 text-xs">Key Features</div>
          <div className="font-bold text-slate-400 text-xs">Agent</div>
        </div>

        {properties.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl border border-gray-100 shadow-xl p-4 space-y-6 relative group overflow-hidden">
            <button 
              onClick={() => onRemove(p.id)}
              className="absolute top-6 right-6 z-10 p-2 bg-white/90 hover:bg-red-500 hover:text-white rounded-xl shadow-lg compact-transition"
            >
              <ArrowUp className="rotate-45" size={16} />
            </button>

            <div className="space-y-4">
              <div className="h-40 rounded-2xl overflow-hidden relative">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="text-white font-bold text-sm line-clamp-1">{p.title}</div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="pt-4 border-t border-gray-50">
                  <div className="text-brand-green font-black text-xl mb-1">{p.price}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pricing Model</div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <div className="text-dark-navy font-bold text-sm mb-1">{p.location}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Suburb</div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-dark-navy font-bold text-sm mb-1">
                    <Building2 size={16} className="text-brand-green" /> {p.type === 'Sale' ? 'For Sale' : 'For Rent'}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Listing Type</div>
                </div>

                <div className="pt-4 border-t border-gray-50 min-h-[140px]">
                  <div className="flex flex-wrap gap-2 mb-1">
                    <span className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600">3 Bedrooms</span>
                    <span className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600">2 Baths</span>
                    <span className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600">Pool Available</span>
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amenities & Features</div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white text-[10px] font-bold">LR</div>
                    <span className="text-dark-navy font-bold text-xs">Lalith Ratnatunga</span>
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Specialist</div>
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="w-full bg-dark-navy text-white font-bold py-4 rounded-2xl hover:bg-black compact-transition"
              >
                View Full Details
              </motion.button>
            </div>
          </div>
        ))}

        {properties.length < 4 && (
          <div className="bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center opacity-70 h-full min-h-[400px]">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 mb-4 shadow-sm">
              <Building2 size={32} />
            </div>
            <p className="text-gray-400 font-bold text-sm">Add more properties<br/>to compare</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

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
            className={`relative rounded-[32px] p-8 border border-gray-100 flex flex-col h-full ${pkg.color || 'bg-white'} shadow-xl shadow-gray-100/50 compact-transition ${pkg.highlight ? 'ring-2 ring-brand-green' : ''}`}
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
              onClick={() => {
                const message = `Hello, I am interested in the ${pkg.name}. Please provide more details.`;
                window.open(`https://wa.me/94773951560?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide uppercase compact-transition ${pkg.highlight ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20 hover:bg-brand-green-dark' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              LIST YOUR PROPERTY
            </button>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-24 mb-16 space-y-4">
        <h2 className="text-3xl font-extrabold text-dark-navy tracking-tight">
          Direct <span className="text-brand-green">Publishing Plans</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium">
          Choose a plan to instantly publish your property and manage your listings through your owner dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {NEW_PACKAGES.map((pkg, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8 }}
            className={`relative rounded-[32px] p-8 border border-gray-100 flex flex-col h-full ${pkg.color || 'bg-white'} shadow-xl shadow-gray-100/50 compact-transition ${pkg.highlight ? 'ring-2 ring-brand-green' : ''}`}
          >
            {pkg.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-green text-white text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg">
                Best Value
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
              LIST YOUR PROPERTY
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 bg-gray-50 rounded-[40px] p-10 border border-gray-100 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-lg font-black text-dark-navy uppercase tracking-widest">All Packages Include Advertising On:</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Multi-Platform Network Visibility</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            "LankaLand.lk", "Ikman.lk", "Adsme.lk", "LankaProperty.lk", "LankaPropertyWeb.lk",
            "Jacktree.lk", "LankAdz.lk", "House.lk", "AdBoom.lk", "LankaBuySell.lk"
          ].map((site) => (
            <div key={site} className="bg-white px-4 py-4 rounded-2xl border border-gray-100 text-center text-xs font-black text-gray-500 hover:text-brand-green hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/5 compact-transition shadow-sm">
              {site}
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-8 border-t border-gray-200 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green"><Phone size={20} /></div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hotline</div>
              <div className="text-sm font-black text-dark-navy">033 222 9695</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]"><MessageSquare size={20} /></div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp</div>
              <div className="text-sm font-black text-dark-navy">077 395 1560</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red"><Mail size={20} /></div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</div>
              <div className="text-sm font-black text-dark-navy">ceo.lankaland@gmail.com</div>
            </div>
          </div>
        </div>
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

const AuthPage = ({ onBack, onLogin, initialMode = 'login' }: { onBack: () => void, onLogin: (email: string) => void, initialMode?: 'login' | 'signup' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
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

const SRI_LANKA_DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", 
  "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", 
  "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", 
  "Badulla", "Moneragala", "Ratnapura", "Kegalle"
];

const TIER_PRICES = {
  "FREE": 0,
  "PREMIUM PRO": 4500,
  "ELITE PRO": 8500
};

const PublishListingView = ({ onBack, user }: { onBack: () => void, user?: any }) => {
  const [step, setStep] = useState(1);
  const [price, setPrice] = useState<string>("");
  const [title, setTitle] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [listingType, setListingType] = useState("For Sale");
  const [landArea, setLandArea] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [floors, setFloors] = useState("");
  const [rooms, setRooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"FREE" | "PREMIUM PRO" | "ELITE PRO">("FREE");
  const [images, setImages] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const limits = {
    "FREE": 3,
    "PREMIUM PRO": 6,
    "ELITE PRO": 9
  };

  const subtotal = TIER_PRICES[selectedTier];
  const discount = Math.min(appliedDiscount, subtotal);
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = () => {
    setIsApplyingCoupon(true);
    setCouponError("");
    
    // Simulate API call
    setTimeout(() => {
      const code = couponCode.toUpperCase();
      if (code === "WELCOME10") {
        setAppliedDiscount(subtotal * 0.1);
      } else if (code === "SAVE500") {
        setAppliedDiscount(500);
      } else if (code === "LANKAPRO") {
        setAppliedDiscount(subtotal * 0.25);
      } else {
        setCouponError("Invalid or expired coupon code");
        setAppliedDiscount(0);
      }
      setIsApplyingCoupon(false);
    }, 800);
  };

  const handleImageUpload = () => {
    if (images.length < limits[selectedTier]) {
      // Simulate adding an image
      setImages([...images, `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400&h=300&random=${Date.now()}`]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto px-6 py-12 max-w-3xl"
    >
      <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-dark-navy p-10 text-white relative">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h2 className="text-3xl font-black mb-2">Publish Your Property</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Create an impactful listing in minutes</p>
            </div>
            <button onClick={onBack} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 compact-transition">
              <Plus size={24} className="rotate-45" />
            </button>
          </div>
          
          <div className="flex gap-2 relative z-10">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-brand-green' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <div className="p-10 space-y-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-dark-navy">Select Your Package</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(["FREE", "PREMIUM PRO", "ELITE PRO"] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => {
                        setSelectedTier(tier);
                        if (images.length > limits[tier]) {
                          setImages(images.slice(0, limits[tier]));
                        }
                      }}
                      className={`relative px-4 py-6 rounded-[24px] text-[10px] font-black tracking-widest uppercase transition-all border-2 flex flex-col items-center justify-center gap-2 ${
                        selectedTier === tier 
                          ? 'bg-brand-green border-brand-green text-white shadow-xl shadow-brand-green/20 scale-[1.02]' 
                          : 'bg-white border-gray-100 text-gray-400 hover:border-brand-green/30 active:scale-95'
                      }`}
                    >
                      {selectedTier === tier && (
                        <div className="absolute -top-2 -right-2 bg-white text-brand-green p-1 rounded-full shadow-lg">
                          <CheckCircle size={16} />
                        </div>
                      )}
                      <div className="text-[14px] leading-tight">{tier}</div>
                      <div className={`text-[9px] font-bold ${selectedTier === tier ? 'text-white/80' : 'text-gray-300'}`}>
                        Max {limits[tier]} Photos
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-dark-navy">Core Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Listing Type</label>
                    <select 
                      value={listingType}
                      onChange={(e) => setListingType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition"
                    >
                      <option>For Sale</option>
                      <option>For Rent</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Property Category</label>
                    <select 
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition"
                    >
                      <option>Apartment</option>
                      <option>House</option>
                      <option>Land</option>
                      <option>Building</option>
                      <option>Hotel</option>
                      <option>Commercial</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Listing Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Luxury 3BR Apartment" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">Property Specifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Land Area</label>
                    <input 
                      type="text" 
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      placeholder="e.g., 10 Perches" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Floor Area</label>
                    <input 
                      type="text" 
                      value={floorArea}
                      onChange={(e) => setFloorArea(e.target.value)}
                      placeholder="Sq. Ft" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Floors</label>
                    <input 
                      type="number" 
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                      placeholder="0" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Rooms</label>
                    <input 
                      type="number" 
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      placeholder="0" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Bathrooms</label>
                    <input 
                      type="number" 
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      placeholder="0" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Pricing & Location</h4>
                  <button 
                    onClick={() => setIsNegotiable(!isNegotiable)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                      isNegotiable ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isNegotiable ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
                    Negotiable
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">District</label>
                    <select 
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition"
                    >
                      <option value="">Select District</option>
                      {SRI_LANKA_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">City / Suburb</label>
                    <input type="text" placeholder="e.g., Kadawatha" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Price (Rs.)</label>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2 space-y-2">
                        <div className="relative">
                          <input 
                            type="number" 
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Enter amount in LKR" 
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-5 text-xl font-black text-dark-navy focus:ring-2 focus:ring-brand-green/20 outline-none transition-all pr-16" 
                          />
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-black">LKR</div>
                        </div>
                        {price && (
                          <p className="text-xl font-black text-brand-green px-1 mt-1 tracking-tight">
                            ≈ Rs. {Number(price).toLocaleString()} LKR
                          </p>
                        )}
                      </div>

                      <div className="flex flex-row lg:flex-col gap-3">
                        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-brand-green/30">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-lg font-black">$</div>
                          <div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">USD Estimate</div>
                            <div className="text-lg font-black text-dark-navy leading-none">
                              {price ? (Number(price) / USD_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-brand-green/30">
                          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 text-lg font-black">€</div>
                          <div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">EUR Estimate</div>
                            <div className="text-lg font-black text-dark-navy leading-none">
                              {price ? (Number(price) / EUR_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-dark-navy">Upload Media</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">
                    {selectedTier} Plan: {images.length} of {limits[selectedTier]} photos used
                  </p>
                </div>
                {images.length < limits[selectedTier] && (
                  <span className="text-[10px] font-black text-brand-green uppercase bg-brand-green/5 px-2 py-1 rounded-md">
                    {limits[selectedTier] - images.length} Spots Left
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden group border border-gray-200 shadow-sm">
                    <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                    >
                      <Plus size={16} className="rotate-45" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-2 left-2 bg-brand-green text-white text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-lg">
                        Thumbnail
                      </div>
                    )}
                  </div>
                ))}
                
                {images.length < limits[selectedTier] && (
                  <button 
                    onClick={handleImageUpload}
                    className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-4 hover:border-brand-green hover:bg-brand-green/5 transition-all group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-300 mb-2 group-hover:text-brand-green transition-all">
                      <Camera size={20} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Photo</p>
                  </button>
                )}
              </div>

              {images.length === 0 && (
                <div onClick={handleImageUpload} className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center text-center p-8 group cursor-pointer hover:border-brand-green hover:bg-brand-green/5 compact-transition">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 mb-4 group-hover:text-brand-green compact-transition">
                    <Camera size={32} />
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Upload your property photos<br/><span className="text-[10px] font-medium grayscale">Click here to add images ({images.length}/{limits[selectedTier]})</span></p>
                </div>
              )}

              {images.length >= limits[selectedTier] && (
                <div className="bg-brand-green/5 border border-brand-green/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-green">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-dark-navy uppercase tracking-widest">Image Limit Reached</h4>
                    <p className="text-[10px] font-bold text-gray-500">Upgrade to a higher plan to add more photos.</p>
                  </div>
                  <button 
                    onClick={() => setStep(1)}
                    className="ml-auto px-4 py-2 bg-brand-green text-white text-[10px] font-black uppercase rounded-lg shadow-sm"
                  >
                    Upgrade
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 bg-brand-green/5 p-6 rounded-[32px] border border-brand-green/10">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-green shadow-sm">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-navy">Listing Details Verified</h3>
                  <p className="text-sm font-medium text-gray-500">Your information is ready for the final step.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Billing Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-500">Selected Package</span>
                      <span className="text-dark-navy">{selectedTier}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-500">Package Price</span>
                      <span className="text-dark-navy">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm font-bold text-brand-green">
                        <span>Discount Applied</span>
                        <span>- Rs. {discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm font-black text-dark-navy uppercase">Total Payable</span>
                      <span className="text-2xl font-black text-brand-green">Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Apply Promotion</h4>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon Code" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none transition-all uppercase"
                      />
                    </div>
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={!couponCode || isApplyingCoupon}
                      className="px-6 bg-dark-navy text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] font-bold text-red-500 px-1">{couponError}</p>}
                  {appliedDiscount > 0 && <p className="text-[10px] font-bold text-brand-green px-1">Coupon successfully applied!</p>}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 py-4">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-dark-navy">Secure Payment</h3>
                <p className="text-sm font-medium text-gray-500">Complete your transaction to go live instantly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white border-2 border-brand-green rounded-[32px] shadow-xl shadow-brand-green/10 flex flex-col items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center">
                    <CreditCard size={24} />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black text-dark-navy uppercase">Card Payment</div>
                    <div className="text-[10px] font-bold text-gray-400">Visa / Master / Amex</div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border border-gray-100 rounded-[32px] flex flex-col items-center gap-4 hover:border-brand-green/30 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600">
                    <img src="https://img.icons8.com/color/48/bank-transfer.png" alt="Bank" className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black text-dark-navy uppercase">Bank Transfer</div>
                    <div className="text-[10px] font-bold text-gray-400">Manual verification</div>
                  </div>
                </div>
              </div>

              <div className="bg-dark-navy text-white p-8 rounded-[32px] space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest opacity-60">Amount to Pay</span>
                  <span className="text-3xl font-black tracking-tight">Rs. {total.toLocaleString()}</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Card Number</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                      <CreditCard size={18} className="opacity-40" />
                      <input type="text" placeholder="0000 0000 0000 0000" className="bg-transparent outline-none flex-1 font-mono text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Expiry</label>
                      <input type="text" placeholder="MM / YY" className="bg-white/5 border border-white/10 rounded-xl p-4 w-full outline-none font-mono text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">CVC</label>
                      <input type="text" placeholder="***" className="bg-white/5 border border-white/10 rounded-xl p-4 w-full outline-none font-mono text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 py-4">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-brand-green text-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-brand-green/30 transform rotate-6">
                  <CheckCircle size={40} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-dark-navy">Congratulations!</h3>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Your property advertisement is now live</p>
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Listing Appearance Preview</h4>
                <div className="bg-white border-2 border-gray-100 rounded-[40px] overflow-hidden shadow-2xl shadow-gray-200/50">
                  <div className="relative h-64">
                    <img 
                      src={images[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"} 
                      className="w-full h-full object-cover"
                      alt="Property"
                    />
                    <div className="absolute top-6 left-6 flex gap-2">
                      <span className="bg-brand-green text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg">{listingType}</span>
                      {isNegotiable && (
                        <span className="bg-dark-navy text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg">Negotiable</span>
                      )}
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={14} className="text-brand-green" />
                        <span className="text-xs font-black uppercase tracking-widest">{district || "Location"}, Sri Lanka</span>
                      </div>
                      <h3 className="text-2xl font-black text-dark-navy tracking-tight">{title || "Your Property Title"}</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-50">
                      <div className="text-center">
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Rooms</div>
                        <div className="text-lg font-black text-dark-navy">{rooms || "0"}</div>
                      </div>
                      <div className="text-center border-x border-gray-50">
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Baths</div>
                        <div className="text-lg font-black text-dark-navy">{bathrooms || "0"}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Sq. Ft</div>
                        <div className="text-lg font-black text-dark-navy">{floorArea || "0"}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs font-black text-brand-green uppercase tracking-widest">Pricing</div>
                        <div className="text-3xl font-black text-dark-navy tracking-tighter">Rs. {Number(price).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-gray-400 leading-none">$ {(Number(price) / USD_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div className="text-[10px] font-black text-gray-400 leading-none">€ {(Number(price) / EUR_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase px-12 tracking-wide">Listing ID: LANKA-{Math.floor(Math.random()*90000) + 10000} • Level: {selectedTier}</p>
                <div className="flex items-center justify-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-dark-navy font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all">
                    <Share2 size={16} /> Share Ad
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-dark-navy font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all">
                    <Printer size={16} /> Print Ad
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            {step > 1 && step < 5 && (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="px-8 py-4 text-dark-navy font-bold hover:bg-gray-50 rounded-2xl compact-transition"
              >
                Back
              </button>
            )}
            <button 
              onClick={() => {
                if (step < 5) {
                  if (step === 3 && selectedTier === "FREE") {
                    setStep(5); // Free users jump to preview
                  } else {
                    setStep(s => s + 1);
                  }
                } else {
                  onBack();
                }
              }}
              className="ml-auto px-10 py-5 bg-brand-green text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark compact-transition"
            >
              {step === 5 ? 'Done' : step === 4 ? 'Pay Now & Publish' : step === 3 && selectedTier === "FREE" ? 'Publish Now' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SortableImageItem = ({ image, onRemove }: { image: { id: string, url: string }, onRemove: (id: string) => void, key?: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      className={`relative aspect-video rounded-2xl overflow-hidden group border border-gray-200 transition-shadow ${isDragging ? 'shadow-2xl ring-2 ring-brand-green z-50' : ''}`}
    >
      <img src={image.url} alt="Listing" className="w-full h-full object-cover select-none" />
      <div 
        {...listeners} 
        className="absolute inset-0 bg-transparent cursor-grab active:cursor-grabbing z-10" 
      />
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(image.id);
        }}
        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg z-20"
      >
        <Plus size={16} className="rotate-45" />
      </button>
    </div>
  );
};

const AgentPublishListingView = ({ onBack, user }: { onBack: () => void, user: any }) => {
  const [step, setStep] = useState(1);
  const [price, setPrice] = useState<string>("");
  const [title, setTitle] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [listingType, setListingType] = useState("For Sale");
  const [landArea, setLandArea] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [floors, setFloors] = useState("0");
  const [rooms, setRooms] = useState("0");
  const [bathrooms, setBathrooms] = useState("0");
  const [description, setDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [contacts, setContacts] = useState<{ type: 'Mobile' | 'Landline', number: string }[]>([{ type: 'Mobile', number: "" }]);
  const [images, setImages] = useState<{ id: string, url: string }[]>([]);
  const [locationLink, setLocationLink] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAIImport = async () => {
    if (!pastedText.trim()) return;
    setIsExtracting(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract property details from the following text. 
        IMPORTANT: 
        1. Extract ONLY English text for description and additional information. Skip Sinhala translations.
        2. Format numbers clearly.
        3. If a field is not found, leave it as an empty string (or 0 for numbers).
        4. Listing type should be either "For Sale" or "For Rent".
        5. Property Type should be "Apartment", "House", "Land", or "Commercial".
        
        Text to process:
        ${pastedText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              district: { type: Type.STRING },
              city: { type: Type.STRING },
              propertyType: { type: Type.STRING },
              listingType: { type: Type.STRING },
              landArea: { type: Type.STRING },
              floorArea: { type: Type.STRING },
              floors: { type: Type.STRING },
              rooms: { type: Type.STRING },
              bathrooms: { type: Type.STRING },
              isNegotiable: { type: Type.BOOLEAN },
              additionalInfo: { type: Type.STRING },
              locationLink: { type: Type.STRING },
              price: { type: Type.STRING }
            }
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.district) setDistrict(data.district);
      if (data.city) setCity(data.city);
      if (data.propertyType) setPropertyType(data.propertyType);
      if (data.listingType) setListingType(data.listingType);
      if (data.landArea) setLandArea(data.landArea);
      if (data.floorArea) setFloorArea(data.floorArea);
      if (data.floors) setFloors(data.floors);
      if (data.rooms) setRooms(data.rooms);
      if (data.bathrooms) setBathrooms(data.bathrooms);
      if (data.isNegotiable !== undefined) setIsNegotiable(data.isNegotiable);
      if (data.additionalInfo) setAdditionalInfo(data.additionalInfo);
      if (data.locationLink) setLocationLink(data.locationLink);
      if (data.price) setPrice(data.price);

      setShowAIModal(false);
      setPastedText("");
    } catch (error) {
      console.error("AI Extraction failed:", error);
      alert("Failed to extract details. Please check your text and try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const limit = 12;
  const LKR_TO_USD = 1/310;
  const LKR_TO_EUR = 1/335;

  const getEstimate = (val: string, rate: number) => {
    const num = parseFloat(val) || 0;
    return (num * rate).toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 12 - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setImages(prev => [...prev, { id, url: reader.result as string }].slice(0, 12));
      };
      reader.readAsDataURL(file as File);
    });
    // Reset so same file can be chosen if removed
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      const listingData = {
        title,
        price,
        district,
        city,
        property_type: propertyType,
        listing_type: listingType,
        land_area: landArea,
        floor_area: floorArea,
        floors,
        rooms,
        bathrooms,
        description,
        additional_info: additionalInfo,
        is_negotiable: isNegotiable,
        contacts,
        images: images.map(img => img.url), // Store just the base64 URLs
        location_link: locationLink,
        agent_id: user?.uid || 'anonymous',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('listings')
        .insert([listingData]);

      if (error) throw error;
      
      setStep(3);
    } catch (error) {
      console.error("Error publishing listing:", error);
      alert("Failed to publish listing. Please check if your database 'listings' table is ready.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-6 py-12 max-w-4xl"
      >
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-dark-navy p-10 text-white relative">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-3xl font-black mb-2 tracking-tight">Agent Property Portal</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Manager Level Access • Unlimited Listings</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAIModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-green/20 text-brand-green border border-brand-green/30 rounded-xl hover:bg-brand-green/30 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                  <Sparkles size={14} />
                  Quick AI Import
                </button>
                <button onClick={onBack} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 compact-transition">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-2 relative z-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-brand-green' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>

          {/* Hidden File Input */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />

        <div className="p-10 space-y-12">
          {step === 1 && (
            <div className="space-y-12">
              {/* Core Details */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-dark-navy tracking-tight">Core Details</h3>
                
                <div className="space-y-6">
                  <div className="space-y-1.5 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Listing Type</label>
                    <select 
                      value={listingType}
                      onChange={(e) => setListingType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                    >
                      <option>For Sale</option>
                      <option>For Rent</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Property Category</label>
                      <select 
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                      >
                        <option>Apartment</option>
                        <option>House</option>
                        <option>Land</option>
                        <option>Commercial</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Listing Title</label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Luxury 3BR Apartment" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Specifications */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Property Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Land Area</label>
                    <input 
                      type="text" 
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      placeholder="e.g., 10 Pe" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Floor Area</label>
                    <input 
                      type="text" 
                      value={floorArea}
                      onChange={(e) => setFloorArea(e.target.value)}
                      placeholder="Sq. Ft" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Floors</label>
                    <input 
                      type="number" 
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none text-center" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Rooms</label>
                    <input 
                      type="number" 
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none text-center" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Bathrooms</label>
                    <input 
                      type="number" 
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none text-center" 
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Property Narration</h3>
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Property Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detailed overview of the property, features, and surroundings..." 
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition min-h-[150px] resize-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Additional Information</label>
                    <textarea 
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Key highlights, nearby landmarks, or specific agent notes..." 
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition min-h-[100px] resize-none" 
                    />
                  </div>
                </div>
              </div>

              {/* Google Location Link */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Google Maps Location</h3>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-green transition-colors">
                    <MapPin size={18} />
                  </div>
                  <input 
                    type="url"
                    value={locationLink || ""}
                    onChange={(e) => setLocationLink(e.target.value)}
                    placeholder="Paste Google Maps location link here..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div className="flex justify-between items-center pr-1">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Contact Information</h3>
                  <p className="text-[9px] font-bold text-gray-300">Max 3 Numbers</p>
                </div>
                <div className="space-y-4">
                  {contacts.map((contact, idx) => (
                    <div key={idx} className="flex gap-4 items-center animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100">
                        {(['Mobile', 'Landline'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              const newContacts = [...contacts];
                              newContacts[idx].type = t;
                              setContacts(newContacts);
                            }}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                              contact.type === t 
                                ? 'bg-white text-dark-navy shadow-sm' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="relative flex-1">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                          {contact.type === 'Mobile' ? <Smartphone size={16} /> : <Phone size={16} />}
                        </div>
                        <input 
                          type="tel" 
                          value={contact.number}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[idx].number = e.target.value;
                            setContacts(newContacts);
                          }}
                          placeholder={contact.type === 'Mobile' ? "07X XXX XXXX" : "011 XXX XXXX"}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition"
                        />
                      </div>
                      {contacts.length > 1 && (
                        <button 
                          onClick={() => setContacts(contacts.filter((_, i) => i !== idx))}
                          className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        >
                          <Plus size={20} className="rotate-45" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {contacts.length < 3 && (
                    <button 
                      onClick={() => setContacts([...contacts, { type: 'Mobile', number: "" }])}
                      className="w-full py-4 border-2 border-dashed border-gray-100 rounded-3xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-brand-green/30 hover:text-brand-green hover:bg-brand-green/5 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      Add Another Number
                    </button>
                  )}
                </div>
              </div>

              {/* Pricing & Location */}
              <div className="space-y-6">
                <div className="flex justify-between items-center pr-1">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Pricing & Location</h3>
                  <button 
                    onClick={() => setIsNegotiable(!isNegotiable)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest compact-transition border ${
                      isNegotiable ? 'bg-brand-green/10 border-brand-green text-brand-green' : 'bg-gray-50 border-gray-100 text-gray-400'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isNegotiable ? 'bg-brand-green' : 'bg-gray-300'}`} />
                    Negotiable
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">District</label>
                    <select 
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                    >
                      {["Colombo", "Kandy", "Galle", "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"].map(d => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">City / Suburb</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Kadawatha" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Price (Rs.)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter amount in LKR" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-6 pr-16 py-6 text-xl font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition placeholder:text-gray-300" 
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-black text-sm">LKR</span>
                    </div>
                  </div>
                  <div className="md:col-span-1 space-y-3 pt-5.5">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">$</div>
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">USD Estimate</p>
                          <p className="text-lg font-black text-dark-navy tracking-tight">{getEstimate(price, LKR_TO_USD)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-black text-xs">€</div>
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">EUR Estimate</p>
                          <p className="text-lg font-black text-dark-navy tracking-tight">{getEstimate(price, LKR_TO_EUR)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-dark-navy">Property Media</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">Professional manager limit: {images.length} of 12 photos</p>
                </div>
              </div>

              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <SortableContext 
                      items={images.map(img => img.id)}
                      strategy={rectSortingStrategy}
                    >
                      {images.map((img: { id: string, url: string }) => (
                        <SortableImageItem key={img.id} image={img} onRemove={removeImage} />
                      ))}
                    </SortableContext>
                    
                    {Array.from({ length: 12 - images.length }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="relative aspect-video">
                        <button 
                          onClick={handleImageUpload}
                          className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-4 hover:border-brand-green hover:bg-brand-green/5 transition-all group"
                        >
                          <Camera size={24} className="text-gray-300 mb-2 group-hover:text-brand-green transition-colors" />
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest group-hover:text-brand-green transition-colors">Add Photo</p>
                        </button>
                      </div>
                    ))}
              </div>
            </DndContext>
          </div>
        )}

          {step === 3 && (
            <div className="space-y-12 py-10 animate-in fade-in zoom-in duration-700">
              <div className="text-center space-y-8">
                <div className="relative">
                  <div className="w-28 h-28 bg-brand-green text-white rounded-[40px] flex items-center justify-center mx-auto shadow-2xl shadow-brand-green/40 transform rotate-12 relative z-10">
                    <CheckCircle size={56} />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-green/20 rounded-full blur-3xl -z-0"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="inline-block px-4 py-1.5 bg-brand-green/10 text-brand-green rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                    Professional Listing Live
                  </div>
                  <h3 className="text-4xl font-black text-dark-navy tracking-tight leading-tight">Property Advertisement<br />Published Successfully</h3>
                  <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                    As an authorized Manager, your listing is now active on our global network. No fees applied.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            {step < 3 && (
              <button 
                onClick={() => setStep(s => Math.max(1, s - 1))}
                className={`px-8 py-4 text-dark-navy font-bold hover:bg-gray-50 rounded-2xl compact-transition ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                Back
              </button>
            )}
            <button 
              onClick={() => {
                if (step === 1) {
                  setStep(2);
                } else if (step === 2) {
                  handlePublish();
                } else {
                  onBack();
                }
              }}
              disabled={isPublishing}
              className="ml-auto px-10 py-5 bg-brand-green text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark compact-transition flex items-center gap-3"
            >
              {isPublishing ? (
                <>
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                step === 3 ? 'Go to Dashboard' : 'Continue to Publish'
              )}
            </button>
          </div>
        </div>
      </div>

      {showAIModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-navy/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-dark-navy">Quick AI Import</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Paste your property description below</p>
              </div>
              <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-brand-green/5 p-4 rounded-2xl border border-brand-green/10 flex items-start gap-4">
                <div className="p-2 bg-brand-green text-white rounded-xl">
                  <Info size={20} />
                </div>
                <p className="text-xs font-medium text-gray-500 leading-relaxed">
                  Our AI will automatically extract the title, price, location, and specifications from your text. It will filter out any Sinhala translations and keep only the English content.
                </p>
              </div>
              <textarea 
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the description here..."
                className="w-full h-[300px] bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-brand-green/20 outline-none resize-none transition-all"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowAIModal(false)}
                  className="flex-1 py-5 rounded-3xl text-dark-navy font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAIImport}
                  disabled={!pastedText.trim() || isExtracting}
                  className="flex-[2] py-5 bg-brand-green text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Extracting Details...
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} />
                      Import & Auto-Fill
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
    </>
  );
};

const AgentAccessView = ({ onBack, user, onLogin, onNewProperty, onShowInquiries }: { onBack: () => void, user: any, onLogin: (email: string) => void, onNewProperty: () => void, onShowInquiries: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (user) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-20 max-w-4xl"
      >
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={onBack}
            className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 text-gray-500 compact-transition"
          >
            <ArrowRight className="rotate-180" size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-dark-navy">Agent Portal</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Manage your agency and listings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 text-center">
              <div className="w-24 h-24 bg-brand-green mx-auto rounded-3xl flex items-center justify-center text-white text-4xl font-black mb-4 shadow-lg shadow-brand-green/20">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-black text-dark-navy mb-1 line-clamp-1">{user.email.split('@')[0]}</h2>
              <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] mb-6">Certified Agent</p>
              
              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-50">
                <div>
                  <div className="text-lg font-black text-dark-navy">24</div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Active Ads</div>
                </div>
                <div>
                  <div className="text-lg font-black text-dark-navy">1.2k</div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Leads</div>
                </div>
              </div>
            </div>

            <div className="bg-dark-navy p-6 rounded-[32px] text-white space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer compact-transition group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white compact-transition">
                    <User size={20} />
                  </div>
                  <span className="text-sm font-bold">Edit Profile</span>
                </div>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-white compact-transition" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer compact-transition group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white compact-transition">
                    <Shield size={20} />
                  </div>
                  <span className="text-sm font-bold">Security</span>
                </div>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-white compact-transition" />
              </div>
              
              <div className="pt-4 mt-4 border-t border-white/5">
                <button className="w-full py-4 bg-brand-red text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-900/20 hover:bg-red-600 compact-transition">
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-gray-50 border border-gray-100 p-10 rounded-[40px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-300">
                <Building2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-navy">Agency Manager Access</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto font-medium">You have unrestricted access to list unlimited properties with up to 12 high-resolution images per listing.</p>
              <button className="text-xs font-black text-brand-green uppercase tracking-widest hover:underline">View Public Profile</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={onShowInquiries}
                className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:shadow-md compact-transition group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white compact-transition">
                    <MessageSquare size={24} />
                  </div>
                  <span className="bg-gray-100 text-[8px] font-black px-2 py-1 rounded-full text-gray-400">12 NEW</span>
                </div>
                <h4 className="font-bold text-dark-navy">Customer Inquiries</h4>
                <p className="text-xs text-gray-400 mt-1">Manage your incoming leads</p>
              </div>

              <div 
                onClick={onNewProperty}
                className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-sm hover:shadow-xl hover:-translate-y-1 compact-transition group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-[#FFF9ED] text-[#F59E0B] rounded-[24px] flex items-center justify-center group-hover:bg-[#F59E0B] group-hover:text-white compact-transition">
                    <Plus size={28} />
                  </div>
                </div>
                <h4 className="text-lg font-bold text-dark-navy">Add New Property</h4>
                <p className="text-sm text-gray-400 mt-1 font-medium">List a new property for sale/rent</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto px-6 py-20 flex justify-center"
    >
      <div className="w-full max-w-md">
        <div className="bg-dark-navy p-12 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-brand-green mx-auto rounded-2xl flex items-center justify-center text-white mb-6 transform rotate-3">
                <Lock size={32} />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Agent Access</h2>
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Professional Portal Only</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Agent ID / Email</label>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 focus-within:border-brand-green compact-transition">
                  <Mail size={18} className="text-gray-600" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@lankaproperty.lk" 
                    className="bg-transparent outline-none flex-1 text-white text-sm font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between pl-1 pr-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Password</label>
                  <button className="text-[8px] font-black text-brand-green uppercase tracking-widest hover:underline">Forgot?</button>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 focus-within:border-brand-green compact-transition">
                  <Lock size={18} className="text-gray-600" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="bg-transparent outline-none flex-1 text-white text-sm font-medium" 
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  setIsLoggingIn(true);
                  setTimeout(() => {
                    onLogin(email || "agent@lankaproperty.lk");
                    setIsLoggingIn(false);
                  }, 1200);
                }}
                disabled={isLoggingIn}
                className="w-full py-5 bg-brand-green text-white font-black rounded-2xl shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark compact-transition text-sm uppercase tracking-widest mt-4 flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>Secure Login <ArrowRight size={18} /></>
                )}
              </button>
            </div>

            <div className="text-center pt-8 border-t border-white/5">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">Not a registered agent yet?</p>
              <button 
                onClick={onBack}
                className="text-white font-black text-xs hover:text-brand-green compact-transition uppercase tracking-widest"
              >
                Apply to Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AgentsView = ({ onAgentClick, onBack }: { onAgentClick: (agent: any) => void, onBack: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-6 py-20"
    >
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-extrabold text-dark-navy tracking-tight">
          Our Professional <span className="text-brand-green">Agents</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg">
          Connect with the island's most trusted real estate experts. Our agents are verified and committed to excellence.
        </p>
        <div className="w-24 h-1.5 bg-brand-green mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {AGENTS.map((agent, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
            onClick={() => onAgentClick(agent)}
          >
            <div className="relative mb-6 overflow-hidden rounded-[32px] aspect-[4/5] shadow-2xl border border-gray-100">
              <img src={agent.img} alt={agent.name} className="w-full h-full object-cover group-hover:scale-110 compact-transition" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/90 via-dark-navy/20 to-transparent opacity-0 group-hover:opacity-100 compact-transition flex flex-col justify-end p-8">
                <p className="text-white font-medium text-sm leading-relaxed mb-6 line-clamp-3">
                  {agent.bio}
                </p>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand-green compact-transition"><Linkedin size={18} /></div>
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand-green compact-transition"><Facebook size={18} /></div>
                </div>
              </div>
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-xl font-black text-dark-navy group-hover:text-brand-green compact-transition">{agent.name}</h4>
              <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.15em] line-clamp-2 px-4">{agent.role}</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-widest">{agent.experience}</div>
                <div className="px-3 py-1 rounded-full bg-brand-green/10 text-[10px] font-black text-brand-green uppercase tracking-widest">{agent.listings.length} Listings</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-20 p-12 bg-gray-900 rounded-[40px] text-center text-white relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-black">Are you a Real Estate Professional?</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">Join the island's fastest growing property marketplace and reach thousands of verified buyers every day.</p>
          <button className="px-10 py-5 bg-brand-green text-white font-black rounded-2xl hover:bg-brand-green-dark compact-transition shadow-xl shadow-brand-green/20">
            Apply to Join as an Agent
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      </div>
    </motion.div>
  );
};

const AgentProfileView = ({ 
  agent, 
  onBack, 
  onPropertyClick,
  favorites,
  toggleFavorite,
  compareList,
  toggleCompare
}: { 
  agent: any, 
  onBack: () => void, 
  onPropertyClick: (p: any) => void,
  favorites?: Set<number>,
  toggleFavorite?: (id: number) => void,
  compareList?: number[],
  toggleCompare?: (id: number) => void
}) => {
  const agentProperties = FEATURED_PROPERTIES.filter(p => agent.listings.includes(p.id));
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-6 py-12"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-brand-green font-black mb-8 hover:underline uppercase tracking-widest text-xs">
        <ChevronLeft size={18} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Profile Info */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="aspect-[4/5] relative">
              <img src={agent.img} className="w-full h-full object-cover" alt={agent.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="px-3 py-1 bg-brand-green inline-block text-[10px] font-black text-white rounded-full uppercase tracking-widest mb-2">
                  {agent.role}
                </div>
                <h1 className="text-2xl font-black text-white leading-tight">{agent.name}</h1>
                {agent.credentials && (
                  <p className="text-xs font-bold text-white/80 mt-1">{agent.credentials}</p>
                )}
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Experience</div>
                  <div className="text-lg font-black text-dark-navy">{agent.experience}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Listed</div>
                  <div className="text-lg font-black text-dark-navy">{agent.listings.length} Properties</div>
                </div>
              </div>

              <div className="space-y-4">
                <a href={`tel:${agent.phone}`} className="w-full flex items-center justify-center gap-3 bg-brand-green text-white font-black py-4 rounded-2xl hover:bg-brand-green-dark compact-transition text-sm shadow-lg shadow-brand-green/20">
                  <Phone size={18} /> {agent.phone}
                </a>
                <a href={`mailto:${agent.email}`} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-dark-navy font-black py-4 rounded-2xl hover:border-brand-green hover:text-brand-green compact-transition text-sm">
                  <Mail size={18} /> Email Agent
                </a>
              </div>

              <div className="flex gap-4 justify-center pt-4 border-t border-gray-100">
                <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-green hover:text-white compact-transition"><Linkedin size={20} /></a>
                <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-green hover:text-white compact-transition"><Facebook size={20} /></a>
                <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-green hover:text-white compact-transition"><Instagram size={20} /></a>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-dark-navy uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Agent Reviews</h3>
            <div className="space-y-6">
              {agent.reviews.length > 0 ? agent.reviews.map((rev: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-dark-navy">{rev.user}</span>
                    <div className="flex text-orange-400">
                      {[...Array(rev.rating)].map((_, idx) => <Star key={idx} size={10} fill="currentColor" />)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium italic">"{rev.comment}"</p>
                  <div className="text-[10px] text-gray-400 font-bold">{rev.date}</div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Star size={24} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-dark-navy tracking-tight">About {agent.name.split(' ').pop()}</h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">{agent.bio}</p>
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-black text-dark-navy">Active Listings</h3>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Properties managed by {agent.name.split(' ').pop()}</p>
              </div>
              <div className="text-brand-green font-black text-sm">{agentProperties.length} Properties found</div>
            </div>

            {agentProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agentProperties.map(p => (
                  <PropertyCard 
                    key={p.id} 
                    property={p} 
                    onClick={() => onPropertyClick(p)} 
                    isFavorited={favorites?.has(p.id)}
                    onToggleFavorite={() => toggleFavorite?.(p.id)}
                    isComparing={compareList?.includes(p.id)}
                    onToggleCompare={() => toggleCompare?.(p.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-black text-dark-navy">No active listings</h3>
                <p className="text-gray-400 font-medium mt-2">This agent currently has no properties listed for sale or rent.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PromotionView = ({ onBack, onNavigateToAuth, onNavigateToPackages }: { onBack: () => void, onNavigateToAuth: () => void, onNavigateToPackages: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="container mx-auto px-6 py-20 max-w-4xl"
  >
    <button onClick={onBack} className="flex items-center gap-2 text-brand-green font-bold mb-8 hover:underline">
      <ChevronLeft size={20} /> Back to Home
    </button>
    
    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
      <div className="bg-brand-green p-12 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="relative z-10"
        >
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <Percent size={40} strokeWidth={3} />
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter italic">BIG SAVINGS!</h1>
          <p className="text-2xl font-bold opacity-90 max-w-lg mx-auto">Get 10% off your first ever property ad listing on LankaProperty.lk</p>
        </motion.div>
      </div>
      
      <div className="p-12 space-y-12">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Create Account', desc: 'Sign up for a free account in seconds.' },
            { step: '02', title: 'Pick Package', desc: 'Choose any advertising package that fits.' },
            { step: '03', title: 'Auto Discount', desc: '10% will be deducted from your total bill.' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-black text-brand-green/20 mb-2">{item.step}</div>
              <h3 className="text-lg font-bold text-dark-navy mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 rounded-3xl p-8 border border-dashed border-gray-200">
          <h2 className="text-xl font-bold text-dark-navy mb-4 flex items-center gap-2">
            <CheckCircle className="text-brand-green" size={24} /> Why advertise with us?
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {[
              "500,000+ Monthly active buyers",
              "Featured in Google Search results",
              "Professional photography support",
              "Dedicated account management",
              "Advanced listing diagnostics",
              "Global social media reach"
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-600 font-semibold text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            onClick={onNavigateToAuth}
            className="flex-1 py-5 bg-brand-green text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark compact-transition"
          >
            Claim Discount Now
          </button>
          <button 
            onClick={onNavigateToPackages}
            className="flex-1 py-5 bg-dark-navy text-white font-black text-lg rounded-2xl shadow-xl shadow-dark-navy/20 hover:bg-black compact-transition"
          >
            View Packages
          </button>
        </div>
        
        <p className="text-center text-xs text-gray-400 font-medium">
          * Offer valid for new users only. Discount applicable on the first transaction only. Terms and conditions apply.
        </p>
      </div>
    </div>
  </motion.div>
);

const UserProfileView = ({ user, onBack, onLogout, onNewAd }: { user: any, onBack: () => void, onLogout: () => void, onNewAd: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto px-6 py-20 max-w-4xl"
    >
      <div className="flex justify-between items-center mb-12">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-green font-bold hover:translate-x-[-4px] compact-transition group">
          <ChevronLeft size={20} className="group-hover:scale-125" /> Back to Home
        </button>
        
        {/* User Pill from Image */}
        <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-full py-2 px-3 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="text-dark-navy font-bold text-sm truncate max-w-[150px]">
            {user?.email || 'abhishekdewminaa@gmail.com'}
          </span>
          <button 
            onClick={onLogout}
            className="p-1.5 text-gray-400 hover:text-brand-red compact-transition"
            title="Logout"
          >
            <LogOut size={18} className="rotate-180" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-green/5 rounded-bl-full" />
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-brand-green mx-auto rounded-3xl flex items-center justify-center text-white text-4xl font-black mb-4 shadow-lg shadow-brand-green/20">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <h2 className="text-xl font-black text-dark-navy mb-1 line-clamp-1">{user?.email?.split('@')[0]}</h2>
              <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] mb-6">Verified Member</p>
              
              <div className="grid grid-cols-2 gap-3 py-6 border-y border-gray-50">
                <div>
                  <div className="text-lg font-black text-dark-navy">12</div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Listings</div>
                </div>
                <div>
                  <div className="text-lg font-black text-dark-navy">450</div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Inquiries</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-navy p-6 rounded-[32px] text-white space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-brand-green">Account Settings</h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer compact-transition">
                <span className="text-sm font-bold">Edit Profile</span>
                <User size={16} className="text-gray-500" />
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer compact-transition">
                <span className="text-sm font-bold">Security</span>
                <Shield size={16} className="text-gray-500" />
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer compact-transition text-brand-red">
                <span className="text-sm font-bold">Delete Account</span>
                <LogOut size={16} />
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-dark-navy">Your Listings</h3>
              <p className="text-sm text-gray-400 font-medium">Manage and track your active property advertisements</p>
            </div>
            <button 
              onClick={onNewAd}
              className="px-6 py-3 bg-brand-green text-white text-xs font-black rounded-xl hover:bg-brand-green-dark shadow-lg shadow-brand-green/20 uppercase tracking-widest compact-transition"
            >
              + New Ad
            </button>
          </div>

          <div className="space-y-4">
            {FEATURED_PROPERTIES.slice(0, 2).map((property) => (
              <div key={property.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex gap-6 group hover:border-brand-green compact-transition">
                <div className="w-40 h-28 rounded-2xl overflow-hidden shrink-0">
                  <img src={property.image} className="w-full h-full object-cover group-hover:scale-105 compact-transition" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-dark-navy group-hover:text-brand-green compact-transition">{property.title}</h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><MapPin size={12} /> {property.location}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-green font-black">{property.price}</span>
                    <div className="flex gap-2">
                      <button className="px-4 py-1.5 bg-gray-100 text-dark-navy text-[10px] font-bold rounded-lg hover:bg-gray-200">Edit</button>
                      <button className="px-4 py-1.5 bg-brand-red/10 text-brand-red text-[10px] font-bold rounded-lg hover:bg-brand-red hover:text-white">Pause</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-10 rounded-[40px] border border-dashed border-gray-200 text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-gray-300 shadow-sm">
              <Star size={32} />
            </div>
            <div>
              <h4 className="font-black text-dark-navy">Need More Exposure?</h4>
              <p className="text-xs text-gray-400 font-medium mt-1">Upgrade your listings to Gold or Platinum for 10x more leads.</p>
            </div>
            <button className="px-8 py-3 bg-white border border-gray-200 text-dark-navy text-xs font-black rounded-xl hover:border-brand-green compact-transition shadow-sm">
              Explore Plans
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const { properties: supabaseProperties, loading: listingsLoading } = useProperties();
  const [recentFilter, setRecentFilter] = useState<"Sale" | "Rent">("Sale");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentView, setCurrentView] = useState<{ type: 'home' | 'category' | 'detail' | 'contact' | 'about' | 'packages' | 'auth' | 'promotion' | 'agent' | 'agents' | 'compare' | 'publish' | 'profile' | 'agent_access' | 'agent_publish' | 'wanted' | 'inquiries', data?: any }>({ type: 'home' });
  const [user, setUser] = useState<{ email: string } | null>({ email: 'abhishekdewminaa@gmail.com' });
  const [compareList, setCompareList] = useState<number[]>([]);

  const toggleCompare = (id: number) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(item => item !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const removeCompare = (id: number) => {
    setCompareList(prev => prev.filter(item => item !== id));
  };

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

  const displayedProperties = supabaseProperties.length > 0 ? supabaseProperties : FEATURED_PROPERTIES;
  const filteredRecent = displayedProperties.filter(p => p.type === recentFilter);
  const categoryProperties = currentView.type === 'category' 
    ? displayedProperties // Simplified: showing all for demo
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

        <nav className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateHome()}>
            <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-white font-bold text-xl">L</div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold tracking-tight text-dark-navy leading-none">LankaProperty<span className="text-brand-green">.lk</span></h1>
            </div>
          </div>
          <ul className="hidden lg:flex items-center gap-6 text-[15px] font-semibold text-slate-700">
            {["Home", "About", "Property Wanted", "Agents", "Advertising", "Contact"].map((item) => (
              <li key={item}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (item === 'Home') navigateHome();
                    else if (item === 'About') setCurrentView({ type: 'about' });
                    else if (item === 'Advertising') setCurrentView({ type: 'packages' });
                    else if (item === 'Agents') setCurrentView({ type: 'agents' });
                    else if (item === 'Contact') setCurrentView({ type: 'contact' });
                    else if (item === 'Property Wanted') setCurrentView({ type: 'wanted' });
                  }}
                  className={`${(item === 'Home' && currentView.type === 'home' || item === 'About' && currentView.type === 'about' || item === 'Advertising' && currentView.type === 'packages' || item === 'Contact' && currentView.type === 'contact' || item === 'Property Wanted' && currentView.type === 'wanted') ? 'text-brand-green border-b-2 border-brand-green pb-1.5' : 'hover:text-brand-green'} whitespace-nowrap compact-transition`}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-5">
            {user ? (
              <div 
                onClick={() => setCurrentView({ type: 'profile' })}
                className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-full pl-1.5 pr-2 py-1.5 cursor-pointer hover:bg-white hover:shadow-md compact-transition"
              >
                <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="text-sm font-bold text-dark-navy truncate max-w-[140px]">{user.email}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setUser(null); navigateHome(); }} 
                  className="p-1.5 text-gray-400 hover:text-brand-red compact-transition"
                >
                  <LogOut size={18} className="rotate-180" />
                </button>
              </div>
            ) : (
              <motion.button 
                initial={{ backgroundColor: "#00b562" }}
                animate={{ 
                  backgroundColor: ["#00b562", "#00d171", "#00b562"],
                  boxShadow: ["0 10px 15px -3px rgba(0, 181, 98, 0.2)", "0 10px 25px -3px rgba(0, 181, 98, 0.4)", "0 10px 15px -3px rgba(0, 181, 98, 0.2)"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                onClick={() => setCurrentView({ type: 'auth' })}
                className="bg-brand-green text-white font-bold text-sm px-8 py-4 rounded-2xl hover:bg-brand-green-dark compact-transition"
              >
                Sign In
              </motion.button>
            )}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: ["0 0 0 rgba(0, 181, 98, 0)", "0 0 12px rgba(0, 181, 98, 0.5)", "0 0 0 rgba(0, 181, 98, 0)"]
              }}
              transition={{ 
                boxShadow: { duration: 2, repeat: Infinity }
              }}
              onClick={() => {
                if (user) setCurrentView({ type: 'publish' });
                else setCurrentView({ type: 'auth', data: 'signup' });
              }}
              className="px-6 py-3 bg-brand-green text-white rounded-xl text-base font-bold hover:bg-brand-green-dark shadow-lg shadow-brand-green/20 compact-transition"
            >
              Post free ad
            </motion.button>
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
              <div className="container mx-auto px-6 flex justify-center items-center">
                <div className="flex justify-center gap-8 overflow-x-auto pb-4 no-scrollbar w-full">
                  {PROPERTY_CATEGORIES.map((cat, idx) => (
                    <motion.div
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat.name)}
                      initial={{ y: 0 }}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 5, repeat: Infinity, delay: idx * 0.7, ease: "easeInOut" }}
                      whileHover={{ scale: 1.1, y: -12 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-2.5 min-w-[100px] cursor-pointer group"
                    >
                      <div className={`w-16 h-16 ${cat.bg} rounded-full shadow-md flex items-center justify-center border border-gray-100 group-hover:border-brand-green group-hover:shadow-lg group-hover:shadow-brand-green/10 compact-transition`}>
                        <div className={`${cat.color} group-hover:scale-110 compact-transition`}>
                          {cat.icon}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-600 uppercase tracking-widest group-hover:text-brand-green">{cat.name}</span>
                    </motion.div>
                  ))}
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
                      {listingsLoading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                          <Loader2 className="animate-spin" size={32} />
                          <p className="text-sm font-bold uppercase tracking-widest">Loading Listings...</p>
                        </div>
                      ) : (
                        displayedProperties.slice(0,3).map(p => (
                          <PropertyCard 
                            key={p.id} 
                            property={p} 
                            onClick={() => handleDetailClick(p)}
                            isFavorited={favorites.has(p.id)}
                            onToggleFavorite={() => toggleFavorite(p.id)}
                            isComparing={compareList.includes(p.id)}
                            onToggleCompare={() => toggleCompare(p.id)}
                          />
                        ))
                      )}
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
                            isComparing={compareList.includes(p.id)}
                            onToggleCompare={() => toggleCompare(p.id)}
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
                    isComparing={compareList.includes(p.id)}
                    onToggleCompare={() => toggleCompare(p.id)}
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
            onAgentClick={(agent) => setCurrentView({ type: 'agent', data: agent })}
            favorites={favorites}
            compareList={compareList}
            toggleCompare={toggleCompare}
          />
        )}

        {currentView.type === 'contact' && (
          <ContactUs 
            onBack={navigateHome} 
            onAgentClick={(agent) => setCurrentView({ type: 'agent', data: agent })} 
          />
        )}

        {currentView.type === 'about' && (
          <AboutUs onBack={navigateHome} />
        )}

        {currentView.type === 'profile' && (
          <UserProfileView 
            user={user} 
            onBack={navigateHome} 
            onLogout={() => { setUser(null); navigateHome(); }} 
            onNewAd={() => setCurrentView({ type: 'publish' })}
          />
        )}

        {currentView.type === 'packages' && (
          <PricingPackages onBack={navigateHome} onGetStarted={() => setCurrentView({ type: 'auth', data: 'publish' })} />
        )}

        {currentView.type === 'auth' && (
          <AuthPage 
            onBack={navigateHome} 
            initialMode={currentView.data === 'signup' ? 'signup' : 'login'}
            onLogin={(email) => {
              setUser({ email });
              if (currentView.data === 'publish') {
                setCurrentView({ type: 'publish' });
              } else {
                setCurrentView({ type: 'home' });
              }
            }} 
          />
        )}

        {currentView.type === 'publish' && (
          <PublishListingView onBack={navigateHome} user={user} />
        )}

        {currentView.type === 'promotion' && (
          <PromotionView 
            onBack={navigateHome} 
            onNavigateToAuth={() => setCurrentView({ type: 'auth' })} 
            onNavigateToPackages={() => setCurrentView({ type: 'packages' })} 
          />
        )}

        {currentView.type === 'agent' && (
          <AgentProfileView 
            agent={currentView.data} 
            onBack={navigateHome} 
            onPropertyClick={(p) => handleDetailClick(p)} 
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            compareList={compareList}
            toggleCompare={toggleCompare}
          />
        )}

        {currentView.type === 'agent_access' && (
          <AgentAccessView 
            onBack={navigateHome} 
            user={user} 
            onLogin={(email) => setUser({ email })} 
            onNewProperty={() => setCurrentView({ type: 'agent_publish' })}
            onShowInquiries={() => setCurrentView({ type: 'inquiries' })}
          />
        )}

        {currentView.type === 'agent_publish' && (
          <AgentPublishListingView 
            onBack={() => setCurrentView({ type: 'agent_access' })} 
            user={user} 
          />
        )}

        {currentView.type === 'agents' && (
          <AgentsView 
            onAgentClick={(agent) => setCurrentView({ type: 'agent', data: agent })} 
            onBack={navigateHome} 
          />
        )}

        {currentView.type === 'wanted' && (
          <PropertyWanted />
        )}

        {currentView.type === 'inquiries' && (
          <div className="pt-20">
            <button 
              onClick={() => setCurrentView({ type: 'agent_access' })}
              className="fixed top-24 left-6 z-50 p-3 bg-white shadow-xl rounded-2xl hover:bg-gray-50 text-dark-navy flex items-center gap-2 font-black text-xs uppercase tracking-widest compact-transition border border-gray-100"
            >
              <ArrowRight className="rotate-180" size={16} />
              Back to Portal
            </button>
            <CustomerInquiries />
          </div>
        )}

        {currentView.type === 'compare' && (
          <ComparisonView 
            propertyIds={compareList} 
            onBack={navigateHome} 
            onRemove={removeCompare} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {compareList.length > 0 && currentView.type !== 'compare' && (
          <ComparisonBar 
            propertyIds={compareList} 
            onCompare={() => setCurrentView({ type: 'compare' })}
            onRemove={removeCompare}
            onClear={() => setCompareList([])}
          />
        )}
      </AnimatePresence>

      <Footer 
        onNavigateHome={navigateHome} 
        onShowContact={() => setCurrentView({ type: 'contact' })} 
        onShowAbout={() => setCurrentView({ type: 'about' })} 
        onShowPackages={() => setCurrentView({ type: 'packages' })} 
        onShowPromotion={() => setCurrentView({ type: 'promotion' })}
        onShowAgentAccess={() => setCurrentView({ type: 'agent_access' })}
        onShowWanted={() => setCurrentView({ type: 'wanted' })}
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

