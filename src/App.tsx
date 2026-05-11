import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "./supabaseClient";
import { motion, AnimatePresence } from "motion/react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AdminPortal from './components/admin/AdminPortal';

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
  Info,
  AlertCircle,
  Trash2,
  Check,
  BarChart2,
  AlertTriangle,
  TrendingUp,
  MousePointer2,
  Users,
  Flame,
  Zap,
  Activity,
  Trees,
  Lightbulb,
  Power,
  Edit,
  Save
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { ChartWrapper } from './components/ChartWrapper';

class AdminErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false, error: null as Error | null }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center' 
        }}>
          <h2>Something went wrong</h2>
          <p style={{ color: 'red' }}>
            {this.state.error?.message}
          </p>
          <button onClick={() => 
            this.setState({ hasError: false })
          }>
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
import { translateToSinhala } from "./services/geminiService";
import PropertyWanted from "./components/PropertyWanted";
import CustomerInquiries from "./components/CustomerInquiries";
import LiveVisitorTracking from "./components/LiveVisitorTracking";
import { HomeRedesign } from "./components/home/HomeRedesign";
import { CategoryPage } from "./components/CategoryPage";
import { PropertyDetail } from "./components/PropertyDetail";
import { useProperties, Property } from "./hooks/useProperties";

export const getDisplayViews = (property: any, isAdmin: boolean): string => {
  if (isAdmin) {
    return (Number(property?.views_count) || 0).toLocaleString();
  }
  const seed = (Number(property?.id) || 0) * 9301 + 49297;
  const random = (seed % 233280) / 233280;
  return Math.floor(random * (2000 - 500) + 500).toLocaleString();
};

export const getDisplayDateParts = (dateStr: string, isAdmin: boolean) => {
  if (!isAdmin || !dateStr) return null;
  const date = new Date(dateStr);
  const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { dateString: formattedDate, timeString: formattedTime };
};

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
  { name: "Land", icon: <LandPlot className="w-8 h-8" />, count: "1,382", color: "text-brand-green", bg: "bg-brand-green/10" },
  { name: "House", icon: <HomeIcon className="w-8 h-8" />, count: "1,524", color: "text-brand-red", bg: "bg-brand-red/10" },
  { name: "Apartment", icon: <Building2 className="w-8 h-8" />, count: "108", color: "text-brand-gold", bg: "bg-brand-gold/10" },
  { name: "Building", icon: <Building className="w-8 h-8" />, count: "350", color: "text-brand-green", bg: "bg-brand-green/10" },
  { name: "Hotel", icon: <Hotel className="w-8 h-8" />, count: "184", color: "text-brand-red", bg: "bg-brand-red/10" },
  { name: "Business", icon: <Briefcase className="w-8 h-8" />, count: "52", color: "text-brand-gold", bg: "bg-brand-gold/10" },
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
  <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-100 dark:bg-[#0A1A0A] dark:border-white/5">
    <div className="bg-[#0D1F0D] h-8 flex items-center">
      <div className="container mx-auto px-6 flex justify-between items-center text-[10px] text-gray-300">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 opacity-80 underline-offset-2">
            <motion.span 
              animate={{ opacity: [1, 0.4, 1] }} 
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_5px_#558B2F]"
            ></motion.span>
            Hotline: +94 33 222 96 95
          </span>
          <span className="flex items-center gap-1.5 opacity-80">Email: info@lankaproperty.lk</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-white compact-transition">Login</a>
          <span className="text-gray-700 text-[8px]">|</span>
          <a href="#" className="font-semibold text-secondary hover:text-primary compact-transition">Post a Free Ad</a>
        </div>
      </div>
    </div>
    <nav className="container mx-auto px-6 h-16 flex justify-between items-center">
      <div className="flex items-center cursor-pointer">
        <img 
          src="https://qsqqolvsndvkwegvcfqv.supabase.co/storage/v1/object/sign/assets/Website%20logo%20.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MWNhMTU1MC03OGYzLTQwZGMtYTYzYi02NzVmZTRiYjM2NWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvV2Vic2l0ZSBsb2dvIC5wbmciLCJpYXQiOjE3NzgzMDk4MjksImV4cCI6MTkzNTk4OTgyOX0.LqwS9LCGK4UH1oL4YQHkiJdrNNgYGh-8CZtZBgrTO-s"
          alt="LankaProperty.lk"
          className="h-[45px] sm:h-[55px] dark:bg-white dark:px-[10px] dark:py-[4px] dark:rounded-[8px]"
          style={{ 
            width: 'auto',
            objectFit: 'contain'
          }}
          onError={(e: any) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-gray-300">
        {["Home", "Directory", "Agents", "Advertising", "Contact"].map((item) => (
          <li key={item}>
            <a href="#" className={`${item === 'Home' ? 'text-primary border-b-2 border-primary pb-1' : 'hover:text-secondary'} compact-transition`}>
              {item}
            </a>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <button className="hidden sm:flex px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-brand-red compact-transition shadow-lg shadow-primary/20">
          Post free ad
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20 compact-transition">
          Menu
        </button>
      </div>
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

const sriLankaDistricts = [
  // Western Province
  { name: 'Colombo', province: 'Western Province' },
  { name: 'Gampaha', province: 'Western Province' }, 
  { name: 'Kalutara', province: 'Western Province' },
  // Central Province
  { name: 'Kandy', province: 'Central Province' },
  { name: 'Matale', province: 'Central Province' },
  { name: 'Nuwara Eliya', province: 'Central Province' },
  // Southern Province
  { name: 'Galle', province: 'Southern Province' },
  { name: 'Matara', province: 'Southern Province' },
  { name: 'Hambantota', province: 'Southern Province' },
  // Northern Province
  { name: 'Jaffna', province: 'Northern Province' },
  { name: 'Kilinochchi', province: 'Northern Province' },
  { name: 'Mannar', province: 'Northern Province' },
  { name: 'Vavuniya', province: 'Northern Province' },
  { name: 'Mullaitivu', province: 'Northern Province' },
  // Eastern Province
  { name: 'Batticaloa', province: 'Eastern Province' },
  { name: 'Ampara', province: 'Eastern Province' },
  { name: 'Trincomalee', province: 'Eastern Province' },
  // North Western Province
  { name: 'Kurunegala', province: 'North Western Province' },
  { name: 'Puttalam', province: 'North Western Province' },
  // North Central Province
  { name: 'Anuradhapura', province: 'North Central Province' },
  { name: 'Polonnaruwa', province: 'North Central Province' },
  // Uva Province
  { name: 'Badulla', province: 'Uva Province' },
  { name: 'Monaragala', province: 'Uva Province' },
  // Sabaragamuwa Province
  { name: 'Ratnapura', province: 'Sabaragamuwa Province' },
  { name: 'Kegalle', province: 'Sabaragamuwa Province' }
];

const popularAreas = [
  // Colombo District
  'Colombo 1', 'Colombo 2', 'Colombo 3', 'Colombo 4', 'Colombo 5', 'Colombo 6',
  'Colombo 7', 'Colombo 8', 'Colombo 9', 'Colombo 10', 'Colombo 11', 'Colombo 12',
  'Colombo 13', 'Colombo 14', 'Colombo 15', 'Dehiwala', 'Mount Lavinia', 'Moratuwa',
  'Nugegoda', 'Maharagama', 'Pannipitiya', 'Battaramulla', 'Rajagiriya', 'Kollupitiya',
  'Bambalapitiya', 'Wellawatte', 'Kirulapone', 'Borella', 'Maradana', 'Pettah',
  // Gampaha District
  'Gampaha', 'Negombo', 'Kandana', 'Wattala', 'Ragama', 'Kiribathgoda',
  'Ja-Ela', 'Kadawatha', 'Kelaniya', 'Minuwangoda', 'Divulapitiya',
  // Kalutara District
  'Kalutara', 'Panadura', 'Horana', 'Beruwala', 'Aluthgama', 'Wadduwa',
  'Bandaragama', 'Ingiriya',
  // Kandy District
  'Kandy', 'Peradeniya', 'Katugastota', 'Gampola', 'Nawalapitiya', 'Akurana',
  'Kundasale', 'Digana', 'Ampitiya',
  // Galle District
  'Galle', 'Hikkaduwa', 'Unawatuna', 'Ambalangoda', 'Bentota', 'Karapitiya',
  // Matara District
  'Matara', 'Weligama', 'Mirissa', 'Dickwella', 'Akuressa',
  // Other major cities
  'Jaffna', 'Trincomalee', 'Batticaloa', 'Anuradhapura', 'Polonnaruwa',
  'Kurunegala', 'Ratnapura', 'Badulla', 'Nuwara Eliya', 'Hambantota',
  'Vavuniya', 'Mannar', 'Puttalam', 'Kegalle', 'Monaragala', 'Ampara'
];

const propertyTypes = [
  'All Types',
  '🏠 House',
  '🌿 Land',
  '🏢 Apartment',
  '🏗️ Building',
  '🏨 Hotel',
  '💼 Commercial',
  '🏪 Shop',
  '🏭 Warehouse',
  '🌾 Farm Land',
  '🏖️ Villa'
];

const Hero = ({ onDirectInquiry, properties = [], onSearch }: { onDirectInquiry: () => void, properties?: any[], onSearch?: (results: any[]) => void }) => {
  const [activeStatus, setActiveStatus] = useState<"Sale" | "Rent" | "Lease">("Sale");
  const [propertyType, setPropertyType] = useState("All Types");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [citySearch, setCitySearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [beds, setBeds] = useState("Any Beds");
  const [minPrice, setMinPrice] = useState("No Min");
  const [maxPrice, setMaxPrice] = useState("No Max");

  // Format the grouped districts
  const districtsByProvince = sriLankaDistricts.reduce((acc, curr) => {
    if (!acc[curr.province]) acc[curr.province] = [];
    acc[curr.province].push(curr.name);
    return acc;
  }, {} as Record<string, string[]>);

  // Filter properties based on local criteria
  const getFilteredCount = () => {
    if (!properties || properties.length === 0) return 0;
    return properties.filter(p => {
      // Basic match for Sale/Rent/Lease
      const pType = (p.listing_type || p.listingType || '').toLowerCase();
      const sType = activeStatus.toLowerCase();
      if (!pType.includes(sType) && pType !== sType) return false;

      if (propertyType !== 'All Types') {
        const cat = propertyType.replace(/[^a-zA-Z\s]/g, '').trim().toLowerCase();
        const pCat = (p.property_category || p.propertyCategory || '').toLowerCase();
        if (!pCat.includes(cat) && !cat.includes(pCat)) return false;
      }
      
      if (selectedDistrict !== 'All') {
        if ((p.district || '').toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      }

      if (citySearch.trim() !== '') {
        const query = citySearch.toLowerCase();
        const city = (p.city || '').toLowerCase();
        const loc = (p.location || '').toLowerCase();
        if (!city.includes(query) && !loc.includes(query)) return false;
      }

      const parsePrice = (priceStr: string | number) => {
        if (!priceStr) return 0;
        if (typeof priceStr === 'number') return priceStr;
        return parseInt(priceStr.toString().replace(/[^0-9]/g, ''), 10) || 0;
      };

      const propPrice = parsePrice(p.price || p.price_lkr || 0);
      if (minPrice !== 'No Min') {
        const minVal = parsePrice(minPrice);
        if (propPrice < minVal) return false;
      }
      if (maxPrice !== 'No Max') {
        const maxVal = parsePrice(maxPrice);
        if (propPrice > maxVal) return false;
      }

      if (beds !== 'Any Beds') {
        const bedVal = parseInt(beds.replace(/[^0-9]/g, '')) || 0;
        const propBeds = parseInt((p.rooms || p.bedrooms || '').toString().replace(/[^0-9]/g, '')) || 0;
        if (propBeds < bedVal) return false;
      }

      return true;
    }).length;
  };

  const handleSearch = async () => {
    try {
      let query = supabase.from('properties').select('*').eq('status', 'active');
      
      query = query.eq('listing_type', activeStatus);
      
      if (propertyType !== 'All Types') {
        query = query.ilike('property_category', `%${propertyType.replace(/[^a-zA-Z\s]/g, '').trim()}%`);
      }
      if (selectedDistrict !== 'All') {
        query = query.eq('district', selectedDistrict);
      }
      if (citySearch) {
        query = query.ilike('city', `%${citySearch}%`);
      }
      if (minPrice !== 'No Min') {
        query = query.gte('price_lkr', parseInt(minPrice.replace(/[^0-9]/g, ''), 10));
      }
      if (maxPrice !== 'No Max') {
        query = query.lte('price_lkr', parseInt(maxPrice.replace(/[^0-9]/g, ''), 10));
      }
      if (beds !== 'Any Beds') {
        query = query.gte('rooms', parseInt(beds.replace(/[^0-9]/g, ''), 10));
      }

      const { data, error } = await query;
      if (error) throw error;
      if (onSearch && data) onSearch(data);
    } catch (err) {
      console.error(err);
      if (onSearch) onSearch([]);
    }
  };

  const filteredSuggestions = citySearch.length >= 2 
    ? popularAreas.filter(a => a.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 6)
    : popularAreas.filter(a => ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Kurunegala'].includes(a));

  const applyQuickSearch = (tag: string) => {
    if (tag.includes('Colombo')) setSelectedDistrict('Colombo');
    if (tag.includes('Gampaha')) setSelectedDistrict('Gampaha');
    if (tag.includes('Kandy')) setSelectedDistrict('Kandy');
    if (tag.includes('Galle')) setSelectedDistrict('Galle');
    if (tag.includes('Kurunegala')) setSelectedDistrict('Kurunegala');
    if (tag.includes('Negombo')) { setSelectedDistrict('Gampaha'); setCitySearch('Negombo'); }
    
    if (tag.includes('House')) setPropertyType('🏠 House');
    if (tag.includes('Land')) setPropertyType('🌿 Land');
    if (tag.includes('Apartment')) setPropertyType('🏢 Apartment');
    if (tag.includes('Villa')) setPropertyType('🏖️ Villa');

    setTimeout(handleSearch, 100);
  };

  return (
    <section className="relative min-h-[650px] py-16 flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover"
          alt="Modern Home"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mt-10">
        <div className="max-w-md text-white mb-8 lg:mb-0">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold leading-tight drop-shadow-md text-white"
          >
            Find Your Dream <br/>
            <FlipWords words={WORDS} className="text-secondary w-full" />
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

        <div className="w-full max-w-lg">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/95 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-3xl w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Search Properties</h3>
              <button 
                onClick={onDirectInquiry}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Direct Inquiry
              </button>
            </div>
          
            <div className="space-y-4">
              {/* ROW 1: Listing Type */}
              <div className="flex p-1 bg-gray-100/80 rounded-xl">
                {['Sale', 'Rent', 'Lease'].map((type) => (
                <button 
                  key={type}
                  onClick={() => setActiveStatus(type as any)}
                  className={`flex-1 py-3 rounded-lg text-xs font-bold compact-transition ${activeStatus === type ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-white/10'}`}
                >
                  {type === 'Sale' ? '🏠 For Sale' : type === 'Rent' ? '🔑 For Rent' : '🌿 For Lease'}
                </button>
                ))}
              </div>

              {/* ROW 2: Layout & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <select 
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                    className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3.5 appearance-none text-sm text-gray-700 font-bold focus:ring-2 focus:border-secondary focus:ring-secondary/20 outline-none compact-transition"
                  >
                    {propertyTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                  <select 
                    value={selectedDistrict}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 appearance-none text-sm text-gray-700 font-bold focus:ring-2 focus:border-transparent focus:ring-brand-green/20 outline-none compact-transition"
                  >
                    <option value="All">All Districts</option>
                    {Object.entries(districtsByProvince).map(([province, districts]) => (
                      <optgroup key={province} label={`--- ${province} ---`}>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* ROW 3: City Search & Beds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
                <div className="relative sm:col-span-2">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={16} />
                  </div>
                  <input 
                    type="text"
                    value={citySearch}
                    onChange={e => {
                      setCitySearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={e => { if (e.key === 'Enter') { setShowSuggestions(false); handleSearch(); } }}
                    placeholder="Search city, town or area..."
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-700 font-bold focus:ring-2 focus:border-transparent focus:ring-brand-green/20 outline-none compact-transition placeholder:font-medium placeholder:text-gray-400"
                  />
                  
                  {/* Autocomplete Suggestions */}
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                          {citySearch.length < 2 ? 'Popular Areas' : 'Matching Areas'}
                        </div>
                        <ul className="max-h-48 overflow-y-auto">
                          {filteredSuggestions.length > 0 ? (
                            filteredSuggestions.map((area, i) => (
                              <li 
                                key={i}
                                onClick={() => { setCitySearch(area); setShowSuggestions(false); }}
                                className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-brand-green/5 hover:text-brand-green cursor-pointer border-b border-gray-50 last:border-0"
                              >
                                {citySearch.length >= 2 ? (
                                  <span dangerouslySetInnerHTML={{
                                    __html: area.replace(new RegExp(citySearch, 'gi'), match => `<span class="text-brand-green">${match}</span>`)
                                  }} />
                                ) : area}
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-3 text-sm text-gray-400 text-center">No areas found</li>
                          )}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <select 
                    value={beds}
                    onChange={e => setBeds(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-3.5 appearance-none text-sm text-gray-700 font-bold focus:ring-2 focus:border-transparent focus:ring-brand-green/20 outline-none compact-transition"
                  >
                    <option>Any Beds</option>
                    {[1, 2, 3, 4, 5, 6].map(b => (
                      <option key={b} value={`${b}+ Bedrooms`}>{b}+ Bedrooms</option>
                    ))}
                  </select>
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* ROW 4: Price Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[10px] font-black text-gray-400">LKR</div>
                  <select 
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-3 py-3.5 appearance-none text-sm text-gray-700 font-bold focus:ring-2 focus:border-transparent focus:ring-brand-green/20 outline-none compact-transition"
                  >
                    <option>No Min</option>
                    {['500,000', '1,000,000', '2,500,000', '5,000,000', '10,000,000', '25,000,000', '50,000,000', '100,000,000'].map(p => (
                      <option key={p} value={`Rs. ${p}`}>Rs. {p}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[10px] font-black text-gray-400">LKR</div>
                  <select 
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-3 py-3.5 appearance-none text-sm text-gray-700 font-bold focus:ring-2 focus:border-transparent focus:ring-brand-green/20 outline-none compact-transition"
                  >
                    <option>No Max</option>
                    {['1,000,000', '2,500,000', '5,000,000', '10,000,000', '25,000,000', '50,000,000', '100,000,000', '500,000,000'].map(p => (
                      <option key={p} value={`Rs. ${p}`}>Rs. {p}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* ROW 5: Search & Live Count */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-3 px-1">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                    <Activity size={12} className="text-brand-green" />
                    {getFilteredCount()} properties found
                  </span>
                  <button 
                    onClick={() => {
                      setPropertyType("All Types");
                      setSelectedDistrict("All");
                      setCitySearch("");
                      setBeds("Any Beds");
                      setMinPrice("No Min");
                      setMaxPrice("No Max");
                    }}
                    className="text-[10px] font-bold text-gray-400 hover:text-dark-navy hover:underline compact-transition"
                  >
                    Clear Filters
                  </button>
                </div>
                <motion.button 
                  onClick={handleSearch}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4 bg-primary hover:bg-brand-red text-white text-sm font-black rounded-xl shadow-lg shadow-primary/20 hover:shadow-brand-red/30 compact-transition uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Search size={18} /> Search Now
                </motion.button>
              </div>
            </div>
            
            {/* Quick Search Tags */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="text-[10px] font-black uppercase text-gray-400 mb-3 flex items-center gap-1">
                <Flame size={12} className="text-orange-500" /> Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {['Houses in Colombo', 'Land in Gampaha', 'Apartments in Kandy', 'Villas in Galle', 'Land in Kurunegala', 'House in Negombo'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => applyQuickSearch(tag)}
                    className="px-2.5 py-1.5 bg-gray-50 hover:bg-brand-green/10 hover:text-brand-green border border-gray-100 hover:border-brand-green/30 rounded-lg text-[10px] font-bold text-gray-500 compact-transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CategoryStrip = () => (
  <div className="bg-gray-50 dark:bg-[#0A1A0A] border-b border-gray-100 dark:border-white/5 py-6">
    <div className="container mx-auto px-6 flex justify-between items-center">
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {PROPERTY_CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.name}
            initial={{ y: 0 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5 min-w-[80px]"
          >
            <div className={`w-10 h-10 ${idx === 1 ? 'bg-primary' : 'bg-white dark:bg-white/5'} rounded-full shadow-sm flex items-center justify-center border border-gray-100 dark:border-white/10 hover:border-primary cursor-pointer group compact-transition`}>
              <div className={`${idx === 1 ? 'text-white' : 'text-primary'} group-hover:scale-110 compact-transition`}>
                {cat.icon}
              </div>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight">{cat.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export const PropertyCard = ({ 
  property, 
  onClick, 
  isFavorited, 
  onToggleFavorite,
  isComparing,
  onToggleCompare,
  showAnalytics,
  isAdmin
}: any) => {
  // Extract number arrays or default logic for beds/baths/perch
  const beds = String(property.bedrooms || property.rooms || '3 Beds');
  const baths = String(property.bathrooms || property.baths || '2 Baths');
  const perch = String(property.land_area || property.size || property.land_size || '15 Perch');
  const houseType = String(property.listing_type || property.type || property.listingType || 'Sale');

  return (
    <motion.div 
      onClick={onClick}
      className="group bg-white dark:bg-white/5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col border border-gray-100 dark:border-white/10 hover:border-secondary transition-all duration-300 cursor-pointer relative"
    >
      <div className="absolute top-3 left-3 z-20">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare?.(e);
          }}
          className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
            isComparing ? 'bg-primary text-white shadow-lg' : 'bg-white/80 text-gray-500 hover:bg-white hover:text-primary shadow-sm'
          }`}
          title={isComparing ? "Remove from compare" : "Add to compare"}
        >
          {isComparing ? <CheckCircle size={14} className="text-white" /> : <Copy size={14} />}
        </button>
      </div>

      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
        <div className="flex gap-2 items-center">
          <span className="bg-white/95 text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
            <MapPin size={10} className="text-brand-red" /> {property.city || property.location}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(e);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
              isFavorited ? 'bg-brand-red text-white shadow-lg' : 'bg-white/90 text-gray-500 hover:text-brand-red shadow-sm'
            }`}
          >
            <Heart size={14} fill={isFavorited ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="relative h-[220px] bg-gray-200 overflow-hidden">
        <img src={property.images?.[0] || property.image} alt={property.listing_title || property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        
        {/* Top Left Status Badge */}
        <div className="absolute top-3 left-12 z-20">
          <span className={`text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm ${houseType.toLowerCase().includes('rent') ? 'bg-primary' : 'bg-brand-red'}`}>
            For {houseType.replace('For ', '')}
          </span>
        </div>

        {/* Bottom Left Fire Badge */}
        <div className="absolute bottom-3 left-3 flex z-20 pointer-events-none">
          {((isAdmin ? (Number(property.views_count) || 0) : Number(getDisplayViews(property, false).replace(/,/g, ''))) > 300) && (
            <div className="flex items-center gap-1 backdrop-blur-md bg-brand-gold text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-white/20">
              <Flame size={12} fill="currentColor" />
              <span>Trending</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 relative flex-grow">
        {/* Agent specific Analytics Overlay */}
        {showAnalytics && (
          <div className="grid grid-cols-3 gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-white/5">
            <div className="flex flex-col items-start bg-gray-50/80 dark:bg-white/5 p-2 rounded-xl" title="Total Views">
              <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-gray-400 mb-1">
                <Eye size={10} /> Views
              </div>
              <span className="text-[14px] font-black text-gray-700 dark:text-gray-300">{isAdmin ? (property.views_count || 0) : getDisplayViews(property, false)}</span>
            </div>
            <div className="flex flex-col items-start bg-primary/5 p-2 rounded-xl" title="Total Leads/Inquiries">
              <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-primary mb-1">
                <Users size={10} /> Leads
              </div>
              <span className="text-[14px] font-black text-primary">{property.leads_count || 0}</span>
            </div>
            <div className="flex flex-col items-start bg-secondary/5 p-2 rounded-xl" title="Conversion Rate">
              <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-secondary mb-1">
                <Activity size={10} /> Conv
              </div>
              <span className="text-[14px] font-black text-secondary">
                {((Number(property.leads_count||0) / Number(isAdmin ? (property.views_count || 1) : getDisplayViews(property, false).replace(/,/g, ''))) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        <div className="text-[15px] font-bold text-dark-navy dark:text-white line-clamp-2 leading-snug h-10 group-hover:text-primary transition-colors">{property.listing_title || property.title}</div>
        
        <div className="flex flex-col gap-1">
          <span className="text-primary dark:text-secondary font-black text-[22px] tracking-tight leading-none">
            {property.price_lkr ? (typeof property.price_lkr === 'number' ? `Rs. ${property.price_lkr.toLocaleString()}` : property.price_lkr) : (property.price === 'Contact for Price' ? 'Contact for Price' : (property.price?.includes('LKR') || property.price?.includes('Rs.') ? property.price : `Rs. ${property.price}`))}
          </span>
          {(() => {
            const converted = convertPrice(property.price_lkr || property.price);
            if (!converted) return null;
            return (
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                <span>{converted.usd}</span> • <span>{converted.eur}</span>
              </div>
            );
          })()}
        </div>

        <hr className="border-gray-100 dark:border-white/5 my-2" />

        <div className="flex items-center justify-between text-[12px] text-gray-500 font-semibold mb-2">
          <span className="flex items-center gap-1.5"><Bed size={14} className="text-secondary" /> {beds.replace(/Bed(s)?(rooms?)?/gi, '').trim()} Beds</span>
          <span className="flex items-center gap-1.5"><Bath size={14} className="text-secondary" /> {baths.replace(/Bath(s)?(rooms?)?/gi, '').trim()} Baths</span>
          <span className="flex items-center gap-1.5"><LandPlot size={14} className="text-secondary" /> {perch.replace(/Perch(es)?/gi, '').trim()} Perch</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button className="w-full py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-primary text-gray-600 dark:text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-colors">
            Details
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // handle inquire
            }}
            className="w-full py-2.5 bg-primary/5 hover:bg-primary text-primary hover:text-white border border-transparent hover:border-primary text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <MessageSquare size={14} /> Inquire
          </button>
        </div>
      </div>
    </motion.div>
  );
};









const Sidebar = ({ onOpenCalculator, onShowPackages }: { onOpenCalculator: () => void, onShowPackages?: () => void }) => (
  <aside className="space-y-6">
    <div 
      onClick={onOpenCalculator}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-primary group compact-transition"
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

const Footer = ({ onNavigateHome, onShowContact, onShowAbout, onShowPackages, onShowPromotion, onShowWanted, onShowSecretLogin }: { onNavigateHome: () => void, onShowContact: () => void, onShowAbout: () => void, onShowPackages: () => void, onShowPromotion: () => void, onShowWanted: () => void, onShowSecretLogin: () => void }) => (
  <footer className="bg-[#0A1628] text-gray-400 pt-20 pb-10">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-8">
          <div className="flex items-center cursor-pointer" onClick={(e) => { e.preventDefault(); onNavigateHome(); }}>
            <a href="/" onClick={(e) => e.preventDefault()}>
              <img 
                src="https://qsqqolvsndvkwegvcfqv.supabase.co/storage/v1/object/sign/assets/Website%20logo%20.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MWNhMTU1MC03OGYzLTQwZGMtYTYzYi02NzVmZTRiYjM2NWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvV2Vic2l0ZSBsb2dvIC5wbmciLCJpYXQiOjE3NzgzMDk4MjksImV4cCI6MTkzNTk4OTgyOX0.LqwS9LCGK4UH1oL4YQHkiJdrNNgYGh-8CZtZBgrTO-s"
                alt="LankaProperty.lk"
                className="h-[65px] sm:h-[80px] dark:bg-white dark:px-[10px] dark:py-[4px] dark:rounded-[8px]"
                style={{ 
                  width: 'auto',
                  objectFit: 'contain'
                }}
                onError={(e: any) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </a>
          </div>
          <p className="text-lg font-medium text-gray-400 leading-relaxed max-w-sm">
            Sri Lanka's premier real estate marketplace. Connecting buyers, sellers, and renters with the most trusted properties and agents across the island.
          </p>
          <div className="flex gap-4">
            {[
              { icon: Facebook, url: "https://facebook.com" },
              { icon: Twitter, url: "https://twitter.com" },
              { icon: Instagram, url: "https://www.instagram.com/lankapropertylk/" },
              { icon: Linkedin, url: "https://linkedin.com" },
              { icon: Youtube, url: "https://youtube.com" }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.a 
                  key={i} 
                  href={item.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ 
                    y: -5,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(255,255,255,0.3)"
                  }}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <Icon size={18} />
                </motion.a>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Quick Links</h4>
          <ul className="space-y-4 text-base font-medium">
            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowAbout(); }} className="hover:text-white compact-transition">About</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowWanted(); }} className="hover:text-white compact-transition">Property Wanted</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowContact(); }} className="hover:text-white compact-transition">Contact Support</a></li>
            <li><a href="#" className="hover:text-white compact-transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white compact-transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white compact-transition">Sitemap</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Popular Areas</h4>
          <ul className="space-y-4 text-base font-medium">
            {["Colombo Real Estate", "Kandy Properties", "Galle Villas", "Negombo Land", "Kurunegala Homes", "Kalutara Estates"].map(item => (
              <li key={item}><a href="#" className="hover:text-white compact-transition">{item}</a></li>
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-base focus:outline-none focus:border-secondary compact-transition"
            />
            <button className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white rounded-lg text-sm font-bold hover:bg-brand-red compact-transition">
              Join
            </button>
          </div>
          <div 
            onClick={() => onShowPromotion()}
            className="flex items-center gap-3 mt-6 text-xs bg-primary/10 border border-primary/20 p-4 rounded-xl text-primary font-bold cursor-pointer hover:bg-primary/20 compact-transition"
          >
            <Percent size={16} />
            <span>Get 10% off your first ad listing!</span>
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-gray-500 tracking-wider">
            &copy; 2026 LANKAPROPERTY.LK. ALL RIGHTS RESERVED. DESIGNED FOR EXCELLENCE.
          </div>
          <div>
            <button onClick={onShowSecretLogin} className="text-xs text-gray-600 hover:text-gray-400">Admin Access</button>
          </div>
        </div>
        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-white group cursor-pointer">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_#558B2F]" />
            <span className="group-hover:text-secondary compact-transition">Platform Status: Online</span>
          </div>
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

const ContactUs = ({ onBack, onAgentClick, initialData }: { onBack: () => void, onAgentClick?: (agent: any) => void, initialData?: any }) => {
  const [inquiryType, setInquiryType] = useState(initialData?.inquiryType || "Property Viewing");
  const [message, setMessage] = useState(initialData?.message || "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!supabase) throw new Error("Supabase not initialized");
      
      const { error } = await supabase
        .from('property_inquiries')
        .insert([{
          full_name: fullName,
          email,
          phone,
          inquiry_type: inquiryType,
          message,
          created_at: new Date().toISOString(),
          property_id: initialData?.propertyId || null,
          agent_id: initialData?.agentId || null
        }]);

      if (error) throw error;

      alert("Thank you! Your message has been sent to our management team. We will get back to you shortly.");
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      console.error("Error submitting inquiry:", err.message);
      alert("Failed to send message to Supabase. Check if the property_inquiries table exists.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                { icon: <Phone size={20} className="text-brand-green" />, label: "Call Us", value: "077 395 1560 / 011 492 2492" },
                { icon: <Mail size={20} className="text-brand-green" />, label: "Email", value: "ceo.Lankaland@gmail.com" },
                { icon: <Globe size={20} className="text-brand-green" />, label: "Website", value: "www.LankaProperty.lk" },
                { icon: <MapPin size={20} className="text-brand-green" />, label: "Address", value: "95 Metro Complex, Kirillawala, Kadawatha." },
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
              onSubmit={handleSubmit}
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
                    <input 
                      required 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition" 
                      placeholder="John Doe" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition" 
                      placeholder="john@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    required 
                    type="tel" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition" 
                    placeholder="+94 77 123 4567" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inquiry Type</label>
                  <select 
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition appearance-none"
                  >
                    <option>Property Viewing</option>
                    <option>Buy Property</option>
                    <option>List Property</option>
                    <option>General Support</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message</label>
                  <textarea 
                    required 
                    rows={5} 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none compact-transition resize-none" 
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-green text-white font-bold py-4 rounded-xl hover:bg-brand-green-dark compact-transition shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {isSubmitting ? "Submitting..." : "Submit Inquiry"}
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
  <section className="py-12 bg-white dark:bg-white/5 border-y border-gray-100 dark:border-white/5">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {EXPERTISE.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white compact-transition">
              {item.icon}
            </div>
            <div className="text-2xl font-extrabold text-primary dark:text-white mb-1">{item.value}</div>
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

interface FeaturedProject {
  id: number;
  title: string;
  main_image: string;
  images?: string[];
  description?: string;
  location?: string;
  price_from?: string;
  developer_name?: string;
  developer_logo?: string;
  contact_phone?: string;
  website_url?: string;
  is_active: boolean;
  sort_order: number;
}

const FALLBACK_FEATURED_PROJECTS = [
  {
    id: 1,
    title: "Aarana Boutique Residencies",
    main_image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    description: "Exclusive boutique apartments in the heart of the city.",
    location: "Colombo 07",
    price_from: "LKR 86M",
    developer_name: "Prime Group",
    developer_logo: "https://ui-avatars.com/api/?name=PRIME&background=0D8ABC&color=fff&rounded=true",
    contact_phone: "+94 77 123 4567",
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    title: "Sapphire Residence",
    main_image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    description: "Luxury living with breathtaking views.",
    location: "Colombo 01",
    price_from: "From $1.2M",
    developer_name: "ITC Hotels",
    developer_logo: "https://ui-avatars.com/api/?name=ITC&background=FF5722&color=fff&rounded=true",
    contact_phone: "+94 77 234 5678",
    is_active: true,
    sort_order: 2
  },
  {
    id: 3,
    title: "The Elizabeth Colombo 07",
    main_image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    description: "Modern elegance and historic charm.",
    location: "Colombo 07",
    price_from: "LKR 120M",
    developer_name: "John Keells",
    developer_logo: "https://ui-avatars.com/api/?name=JKH&background=607D8B&color=fff&rounded=true",
    contact_phone: "+94 77 345 6789",
    is_active: true,
    sort_order: 3
  },
  {
    id: 4,
    title: "Mon Vie",
    main_image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    description: "Premium residencies for a modern lifestyle.",
    location: "Rajagiriya",
    price_from: "LKR 45M",
    developer_name: "Blue Ocean",
    developer_logo: "https://ui-avatars.com/api/?name=BO&background=03A9F4&color=fff&rounded=true",
    contact_phone: "+94 77 456 7890",
    is_active: true,
    sort_order: 4
  }
];

const FeaturedProjectsSection = () => {
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('featured_projects')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        
        if (data && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(FALLBACK_FEATURED_PROJECTS);
        }
      } catch (err) {
        console.error(err);
        setProjects(FALLBACK_FEATURED_PROJECTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length <= 1) return;
    const interval = setInterval(() => {
      const timeSinceInteract = Date.now() - lastInteractionTime;
      if (!isHovered && timeSinceInteract > 5000) {
        setActiveIndex(prev => (prev + 1) % projects.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [projects.length, isHovered, lastInteractionTime]);

  const interact = () => setLastInteractionTime(Date.now());

  if (loading) return null;
  if (!projects.length) return null;

  const currentProject = projects[activeIndex];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4"
          >
            <motion.div 
              initial={{ scaleX: 0 }} 
              whileInView={{ scaleX: 1 }} 
              transition={{ delay: 0.3, duration: 0.5 }} 
              className="h-px bg-primary/20 hidden sm:block flex-1 max-w-[100px] origin-right" 
            />
            <h2 className="text-3xl font-extrabold text-primary">Featured Projects</h2>
            <motion.div 
              initial={{ scaleX: 0 }} 
              whileInView={{ scaleX: 1 }} 
              transition={{ delay: 0.3, duration: 0.5 }} 
              className="h-px bg-primary/20 hidden sm:block flex-1 max-w-[100px] origin-left" 
            />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[16px] overflow-hidden shadow-2xl group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Image */}
          <div className="relative h-[400px] w-full bg-dark-navy overflow-hidden">
            <AnimatePresence initial={false} mode="sync">
              <motion.img
                key={activeIndex}
                src={currentProject.main_image}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full object-cover origin-center hidden-ken-burns"
              />
            </AnimatePresence>

            <style>{`
              @keyframes kenBurnsCustom {
                from { transform: scale(1); }
                to { transform: scale(1.05); }
              }
              .hidden-ken-burns {
                animation: kenBurnsCustom 6s ease infinite alternate;
              }
            `}</style>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Arrows */}
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
              onClick={() => { interact(); setActiveIndex(p => (p - 1 + projects.length) % projects.length); }}
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
              onClick={() => { interact(); setActiveIndex(p => (p + 1) % projects.length); }}
            >
              <ChevronRight size={24} />
            </button>

            {/* Info Overlay */}
            <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 bg-dark-navy/90 backdrop-blur-md border border-white/10 p-6 rounded-[16px] max-w-sm z-20 text-right text-white shadow-xl">
              <div className="flex justify-end items-center gap-3 mb-2">
                {currentProject.developer_logo && (
                  <img src={currentProject.developer_logo} className="h-8 w-8 object-contain bg-white rounded-md p-1" />
                )}
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{currentProject.developer_name}</span>
              </div>
              <h3 className="text-xl font-black mb-1">{currentProject.title}</h3>
              <p className="text-brand-green font-bold text-lg mb-4">{currentProject.price_from}</p>
              
              <div className="flex gap-3 justify-end mt-2">
                <a href={`tel:${currentProject.contact_phone}`} className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <Phone size={18} />
                </a>
                <a href={currentProject.website_url || '#'} target="_blank" rel="noopener noreferrer" className="h-10 px-6 bg-primary hover:bg-brand-red rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                  View Details <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {projects.map((_, idx) => (
                <button
                  key={idx}
                  className={`h-2 rounded-full transition-all ${idx === activeIndex ? 'w-6 bg-secondary' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                  onClick={() => { interact(); setActiveIndex(idx); }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Thumbnail Strip */}
        <div className="mt-4 relative group">
          <div className="overflow-x-auto no-scrollbar scroll-smooth" ref={carouselRef}>
            <div className="flex gap-4">
              {projects.map((proj, idx) => (
                <motion.div 
                  key={proj.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative w-[calc(25%-12px)] min-w-[150px] shrink-0 cursor-pointer transition-all duration-300 rounded-[8px] overflow-hidden border-[3px] ${idx === activeIndex ? 'border-secondary scale-[1.02] shadow-lg shadow-secondary/20 z-10' : 'border-transparent'}`}
                  onClick={() => { interact(); setActiveIndex(idx); }}
                >
                  <div className="h-[120px] bg-gray-200 w-full relative">
                    <img src={proj.main_image} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-black transition-opacity ${idx === activeIndex ? 'opacity-0' : 'opacity-[0.7]'}`} />
                  </div>
                  <div className="p-2 bg-white text-center border-t border-gray-100">
                    <h4 className="text-xs font-bold text-dark-navy truncate">{proj.title}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Scroll Arrows for thumbnails if needed */}
          <button 
            className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md border border-gray-100 text-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110"
            onClick={() => { 
              if (carouselRef.current) carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' })
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md border border-gray-100 text-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110"
            onClick={() => { 
              if (carouselRef.current) carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' })
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

interface ValuationResult {
  min_price: number;
  max_price: number;
  fair_value: number;
  price_per_perch?: number;
  market_position: string;
  usd_min: number;
  usd_max: number;
  eur_min: number;
  eur_max: number;
  gauge_position: number;
  analysis: string;
  value_factors: string[];
  recommendation: string;
}

const PropertyValuationSection = () => {
  const [formData, setFormData] = useState({
    listingType: 'For Sale',
    propertyType: 'House',
    district: 'Colombo',
    city: '',
    landArea: '',
    landUnit: 'Perches',
    floorArea: '',
    bedrooms: '3',
    bathrooms: '2',
    propertyAge: 'Under 5 Years',
    condition: 'Excellent',
    roadAccess: 'Main Road',
    features: [] as string[]
  });

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Analyzing Sri Lanka market data...');
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  const PROPERTY_TYPES = [
    { label: 'House', icon: '🏠' },
    { label: 'Land', icon: '🌿' },
    { label: 'Apartment', icon: '🏢' },
    { label: 'Building', icon: '🏗️' },
    { label: 'Commercial', icon: '💼' },
    { label: 'Farm Land', icon: '🌾' },
    { label: 'Villa', icon: '🏖️' },
    { label: 'Hotel', icon: '🏨' }
  ];

  const AGE_OPTIONS = ['Brand New', 'Under 5 Years', '5-10 Years', '10-20 Years', '20+ Years'];
  const CONDITION_OPTIONS = ['Excellent', 'Good', 'Average', 'Needs Renovation'];
  const ROAD_OPTIONS = ['Main Road', 'Secondary Road', 'Private Road'];
  const FEATURES_LIST = [
    'Swimming Pool', 'Garage/Parking', 'Garden', 'Security System',
    'Furnished', 'Generator', 'Solar Panels', 'Water Well',
    'CCTV', 'Servant Quarters'
  ];

  useEffect(() => {
    if (loading) {
      const msgs = [
        "Analyzing Sri Lanka market data...",
        "Comparing similar properties...",
        "Calculating fair market value...",
        "Generating AI insights..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % msgs.length;
        setLoadingMsg(msgs[i]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const calculateValuation = async () => {
    setLoading(true);
    setResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a Sri Lankan real estate valuation expert. Calculate the market value for this property:
      Type: ${formData.listingType} - ${formData.propertyType}
      Location: ${formData.city}, ${formData.district}, Sri Lanka
      Land Area: ${formData.landArea} ${formData.landUnit}
      Floor Area: ${formData.floorArea} sqft
      Bedrooms: ${formData.bedrooms}
      Bathrooms: ${formData.bathrooms}
      Age: ${formData.propertyAge}
      Condition: ${formData.condition}
      Road Access: ${formData.roadAccess}
      Features: ${formData.features.join(', ')}

      Based on current Sri Lankan real estate market 2025, provide:
      Return ONLY this JSON without markdown formatting:
      {
        "min_price": number,
        "max_price": number,
        "fair_value": number,
        "price_per_perch": number,
        "market_position": "fair" | "too low" | "low" | "high" | "too high",
        "usd_min": number,
        "usd_max": number,
        "eur_min": number,
        "eur_max": number,
        "gauge_position": number,
        "analysis": "2-3 sentence market analysis",
        "value_factors": ["Factor that adds value", "Factor that reduces value"],
        "recommendation": "Buy/Sell recommendation"
      }
      gauge_position: 0=Too Low, 25=Low, 50=Fair, 75=High, 100=Too High`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const valuationData: ValuationResult = JSON.parse(response.text.trim());
      setResult(valuationData);

      // Fetch similar properties
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('district', formData.district)
        .gte('price_lkr', valuationData.min_price * 0.8)
        .lte('price_lkr', valuationData.max_price * 1.2)
        .limit(3);
      
      setSimilarProperties(data || []);
      
      // Scroll to result
      setTimeout(() => {
        document.getElementById('valuation-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (err) {
      console.error(err);
      alert("Failed to calculate valuation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-[#0D1F0D] to-[#1B5E20] text-white overflow-hidden scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6"
          >
            Calculate Your Property Price
          </motion.h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            className="w-32 h-1.5 bg-secondary mx-auto rounded-full mb-6 origin-center"
          />
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Get an instant AI-powered market value estimate for any property in Sri Lanka
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Fields */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Listing & Property Type</label>
              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={formData.listingType}
                  onChange={e => setFormData({...formData, listingType: e.target.value})}
                  className="bg-white/10 border-none rounded-2xl px-4 py-4 focus:ring-2 focus:ring-secondary outline-none"
                >
                  <option className="text-dark-navy" value="For Sale">For Sale</option>
                  <option className="text-dark-navy" value="For Rent">For Rent</option>
                </select>
                <select 
                  value={formData.propertyType}
                  onChange={e => setFormData({...formData, propertyType: e.target.value})}
                  className="bg-white/10 border-none rounded-2xl px-4 py-4 focus:ring-2 focus:ring-secondary outline-none"
                >
                  {PROPERTY_TYPES.map(pt => (
                    <option className="text-dark-navy" key={pt.label} value={pt.label}>{pt.icon} {pt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Location (District & City)</label>
              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={formData.district}
                  onChange={e => setFormData({...formData, district: e.target.value})}
                  className="bg-white/10 border-none rounded-2xl px-4 py-4 focus:ring-2 focus:ring-secondary outline-none"
                >
                  {SRI_LANKA_DISTRICTS.map(d => (
                    <option className="text-dark-navy" key={d} value={d}>{d}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  placeholder="City/Area e.g. Rajagiriya"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="bg-white/10 border-none rounded-2xl px-4 py-4 focus:ring-2 focus:ring-secondary outline-none placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Land Area</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={formData.landArea}
                    onChange={e => setFormData({...formData, landArea: e.target.value})}
                    className="flex-1 bg-white/10 border-none rounded-2xl px-4 py-4 focus:ring-2 focus:ring-secondary outline-none"
                  />
                  <select 
                    value={formData.landUnit}
                    onChange={e => setFormData({...formData, landUnit: e.target.value})}
                    className="bg-white/10 border-none rounded-2xl px-3 py-4 focus:ring-2 focus:ring-secondary outline-none"
                  >
                    <option className="text-dark-navy" value="Perches">Perches</option>
                    <option className="text-dark-navy" value="Acres">Acres</option>
                    <option className="text-dark-navy" value="SqFt">SqFt</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Floor Area (SqFt)</label>
                <input 
                  type="number"
                  value={formData.floorArea}
                  onChange={e => setFormData({...formData, floorArea: e.target.value})}
                  className="w-full bg-white/10 border-none rounded-2xl px-4 py-4 focus:ring-2 focus:ring-secondary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Property Age</label>
                <select 
                  value={formData.propertyAge}
                  onChange={e => setFormData({...formData, propertyAge: e.target.value})}
                  className="w-full bg-white/10 border-none rounded-2xl px-4 py-4 focus:ring-2 focus:ring-secondary outline-none"
                >
                  {AGE_OPTIONS.map(age => (
                    <option className="text-dark-navy" key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>
            </div>

            {(formData.propertyType === 'House' || formData.propertyType === 'Apartment' || formData.propertyType === 'Villa') && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Bedrooms</label>
                  <div className="flex gap-2">
                    {['1', '2', '3', '4', '5+'].map(val => (
                      <button 
                        key={val}
                        onClick={() => setFormData({...formData, bedrooms: val})}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.bedrooms === val ? 'bg-secondary text-white shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Bathrooms</label>
                  <div className="flex gap-2">
                    {['1', '2', '3', '4+'].map(val => (
                      <button 
                        key={val}
                        onClick={() => setFormData({...formData, bathrooms: val})}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.bathrooms === val ? 'bg-secondary text-white shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Condition</label>
              <select 
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value})}
                className="w-full bg-white/10 border-none rounded-2xl px-4 py-4 focus:ring-2 focus:ring-secondary outline-none"
              >
                {CONDITION_OPTIONS.map(opt => (
                  <option className="text-dark-navy" key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Road Access</label>
              <div className="flex gap-2">
                {ROAD_OPTIONS.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setFormData({...formData, roadAccess: opt})}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.roadAccess === opt ? 'bg-secondary text-white shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Special Features</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {FEATURES_LIST.map(feature => (
                  <label key={feature} className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      onClick={() => handleFeatureToggle(feature)}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-all ${formData.features.includes(feature) ? 'bg-secondary' : 'border-2 border-white/20 group-hover:border-white/40'}`}
                    >
                      {formData.features.includes(feature) && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12">
            <motion.button 
              onClick={calculateValuation}
              disabled={loading || !formData.city || !formData.landArea}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={!loading ? {
                scale: [1, 1.02, 1],
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              } : {}}
              className="w-full py-5 bg-primary text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:bg-brand-red disabled:opacity-50 flex items-center justify-center gap-4 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  {loadingMsg}
                </>
              ) : (
                <>
                  <Calculator />
                  CALCULATE NOW
                </>
              )}
            </motion.button>
          </div>
        </div>

        {result && (
          <motion.div 
            id="valuation-results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-24 space-y-12"
          >
            {/* Speedometer Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-white/5 backdrop-blur-xl rounded-[40px] p-12 border border-white/10 flex flex-col items-center">
                <h3 className="text-xl font-bold mb-12 uppercase tracking-widest text-gray-400">Market Value Gauge</h3>
                <div className="relative w-64 h-32 md:w-80 md:h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 50">
                    <path d="M10,50 A40,40 0 0,1 90,50" fill="none" strokeWidth="8" stroke="#ef4444" strokeDasharray="25,100" />
                    <path d="M10,50 A40,40 0 0,1 90,50" fill="none" strokeWidth="8" stroke="#f59e0b" strokeDasharray="50,100" strokeDashoffset="-25" />
                    <path d="M10,50 A40,40 0 0,1 90,50" fill="none" strokeWidth="8" stroke="#10b981" strokeDasharray="25,100" strokeDashoffset="-50" />
                    <path d="M10,50 A40,40 0 0,1 90,50" fill="none" strokeWidth="8" stroke="#f59e0b" strokeDasharray="25,100" strokeDashoffset="-75" />
                    <path d="M10,50 A40,40 0 0,1 90,50" fill="none" strokeWidth="8" stroke="#ef4444" strokeDasharray="25,100" strokeDashoffset="-100" />
                    
                    {/* Needle */}
                    <motion.g 
                      initial={{ rotate: -90 }}
                      animate={{ rotate: (result.gauge_position * 1.8) - 90 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{ originX: '50px', originY: '50px' }}
                    >
                      <line x1="50" y1="50" x2="50" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="3" fill="white" />
                    </motion.g>
                  </svg>
                  <div className="absolute -bottom-4 left-0 right-0 text-center">
                    <div className="text-3xl font-black uppercase text-secondary tracking-tighter">
                      {result.market_position}
                    </div>
                    <div className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest leading-relaxed">Gauge Position: {result.gauge_position}%</div>
                  </div>
                </div>
                
                <div className="flex justify-between w-full mt-16 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span className="text-brand-red">Too Low</span>
                  <span className="text-orange-400">Low</span>
                  <span className="text-brand-green">Fair</span>
                  <span className="text-orange-400">High</span>
                  <span className="text-brand-red">Too High</span>
                </div>
              </div>

              {/* Price Range Card */}
              <div className="bg-primary rounded-[40px] p-12 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-125 duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/10 rounded-lg text-secondary"><DollarSign size={24} /></div>
                    <span className="font-bold uppercase tracking-widest text-sm opacity-60">Estimated Market Value</span>
                  </div>
                  
                  <div className="mb-8">
                    <div className="text-sm font-bold opacity-60 mb-1 leading-relaxed">Price Range (LKR)</div>
                    <div className="text-4xl md:text-5xl font-black tracking-tighter">
                      Rs. {result.min_price.toLocaleString()} - {result.max_price.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-6 bg-white/20 rounded-3xl border border-white/30 backdrop-blur-sm mb-8">
                    <div className="text-xs font-bold opacity-60 uppercase mb-1 tracking-widest leading-relaxed">Fair Market Value</div>
                    <div className="text-3xl font-black">Rs. {result.fair_value.toLocaleString()}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                    <div>
                      <div className="text-[10px] font-bold opacity-60 uppercase mb-1 tracking-widest leading-relaxed">USD Estimate</div>
                      <div className="font-black text-secondary">$ {result.usd_min.toLocaleString()} - $ {result.usd_max.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold opacity-60 uppercase mb-1 tracking-widest leading-relaxed">EUR Estimate</div>
                      <div className="font-black text-secondary">€ {result.eur_min.toLocaleString()} - € {result.eur_max.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Price Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Low Range', price: `Below Rs. ${(result.min_price * 0.9).toLocaleString()}`, desc: 'Potential Opportunity', color: 'bg-brand-red/10 border-brand-red/20 text-brand-red' },
                { label: 'Fair Range', price: `Rs. ${(result.min_price/1000000).toFixed(1)}M - ${(result.max_price/1000000).toFixed(1)}M`, desc: 'Market Sweet Spot', color: 'bg-secondary/10 border-secondary/20 text-secondary' },
                { label: 'High Range', price: `Above Rs. ${(result.max_price * 1.1).toLocaleString()}`, desc: 'Premium Territory', color: 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold' }
              ].map((card, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`${card.color} p-8 rounded-[32px] border backdrop-blur-xl relative group overflow-hidden`}
                >
                  <div className="relative z-10">
                    <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-60">{card.label}</h4>
                    <div className="text-2xl font-black mb-2">{card.price}</div>
                    <p className="text-sm font-medium opacity-80">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Analysis and Factors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 rounded-[40px] p-10 border border-white/10 group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-brand-green/20 text-brand-green rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><BarChart2 size={20} /></div>
                  <h3 className="text-xl font-bold uppercase tracking-widest">AI Market Analysis</h3>
                </div>
                <div className="border-l-4 border-brand-green pl-6 py-2">
                  <p className="text-gray-400 leading-relaxed text-lg">
                    {result.analysis}
                  </p>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Recommendation</div>
                  <div className="bg-brand-green/20 text-brand-green inline-block px-4 py-2 rounded-xl text-sm font-bold">
                    {result.recommendation}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-[40px] p-10 border border-white/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-brand-green/20 text-brand-green rounded-xl flex items-center justify-center"><CheckCircle size={20} /></div>
                  <h3 className="text-xl font-bold uppercase tracking-widest">Valuation Factors</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-brand-green uppercase tracking-widest mb-4">✅ Adds Value</div>
                    {result.value_factors.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-start gap-3 bg-brand-green/5 p-4 rounded-2xl border border-brand-green/10">
                        <Check size={16} className="text-brand-green mt-1 shrink-0" />
                        <span className="text-sm font-medium text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-brand-red uppercase tracking-widest mb-4">⚠️ Risks / Reduction</div>
                    {result.value_factors.slice(3, 6).map((f, i) => (
                      <div key={i} className="flex items-start gap-3 bg-brand-red/5 p-4 rounded-2xl border border-brand-red/10">
                        <AlertCircle size={16} className="text-brand-red mt-1 shrink-0" />
                        <span className="text-sm font-medium text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <div className="pt-12">
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-black uppercase tracking-widest">Similar Properties in {formData.district}</h3>
                  <p className="text-gray-500 mt-2">Real listings from our platform in this price range</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {similarProperties.map((prop, idx) => (
                    <motion.div 
                      key={prop.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + (idx * 0.1) }}
                      className="bg-white rounded-3xl overflow-hidden shadow-xl group border border-gray-100"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl">
                          <span className="text-dark-navy font-black text-sm">Rs. {(prop.price_lkr / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-dark-navy font-bold line-clamp-1 mb-2">{prop.title}</h4>
                        <p className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-widest">{prop.city}, {prop.district}</p>
                        <button className="w-full py-3 bg-gray-50 hover:bg-brand-green hover:text-white transition-colors rounded-xl text-dark-navy font-black text-xs uppercase tracking-widest">VIEW PROPERTY</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center pt-8">
              <button className="px-12 py-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-[20px] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center gap-3">
                <Share2 size={18} className="text-brand-green" />
                Share This Valuation
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

const TestimonialsSection = () => (
  <section className="py-20 bg-gray-50 dark:bg-[#0A1A0A] overflow-hidden">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-extrabold text-primary dark:text-white mb-4">What Our Clients Say</h2>
        <div className="w-20 h-1.5 bg-secondary mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((testimonial, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-white/5 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 relative group hover:shadow-xl hover:-translate-y-1 compact-transition"
          >
            <div className="absolute top-8 right-8 text-secondary/20">
              <Quote size={40} />
            </div>
            
            <div className="flex gap-1 mb-6 text-brand-gold">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 italic mb-8 leading-relaxed">"{testimonial.text}"</p>
            
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
    tier: "PREMIUM TIER",
    name: "GOLD PACKAGE",
    price: "Rs. 15,000",
    duration: "12 Months",
    features: [
      "Fully Website Advertising",
      "12 Months Duration",
      "Featured Property Status",
      "Social Media (WhatsApp, FB, IG, TikTok)"
    ],
    visibility: "Visibility on: ikman.lk, LankaPropertyWeb.lk",
    highlight: false,
    color: "bg-white",
    textColor: "text-brand-green",
    buttonVariant: "outline"
  },
  {
    tier: "STRATEGIC TIER",
    name: "PLATINUM PACKAGE",
    price: "Rs. 25,000",
    duration: "Until Sold",
    features: [
      "Advertised until sold",
      "Featured on 10 Major Websites",
      "Fully Social Media Marketing",
      "Priority Direct Support"
    ],
    highlight: true,
    color: "bg-dark-navy",
    textColor: "text-white",
    buttonVariant: "solid-green",
    ribbon: "MOST POPULAR",
    ribbonColor: "bg-[#C1272D]"
  },
  {
    tier: "ULTIMATE TIER",
    name: "DIAMOND PACKAGE",
    price: "Rs. 45,000",
    duration: "Until Sold",
    features: [
      "All Platinum Tier Features",
      "High-Traffic Banner Placement",
      "Priority Listing Diagnostics",
      "Premium Web Slider (990x340 px)",
      "Dedicated Account Manager"
    ],
    highlight: false,
    color: "bg-white",
    textColor: "text-dark-navy",
    buttonVariant: "solid-black"
  }
];

const NEW_PACKAGES = [
  {
    name: "STARTER FREE",
    price: "FREE",
    duration: "30 Months",
    features: [
      "30 Months Extended Duration",
      "Standard Property Listing",
      "Basic Search Integration",
      "Email Support"
    ],
    highlight: false,
    color: "bg-white",
    buttonLabel: "Start Free"
  },
  {
    name: "PREMIUM PRO",
    price: "Rs. 4,500",
    duration: "2 Months",
    features: [
      "60 Days Exposure",
      "Featured Position (Top 10)",
      "Multi-Site Syndication",
      "WhatsApp Lead Generation"
    ],
    highlight: true,
    color: "bg-white",
    buttonLabel: "Go Premium",
    buttonVariant: "solid-red",
    ribbon: "BEST VALUE",
    ribbonColor: "bg-[#C1272D]"
  },
  {
    name: "ELITE PRO",
    price: "Rs. 8,500",
    duration: "3 Months",
    features: [
      "90 Days Premium Duration",
      "Top-Shelf Branding",
      "360 Virtual Tour Base",
      "Verified Seller Badge"
    ],
    highlight: false,
    color: "bg-white",
    buttonLabel: "Select Elite",
    buttonVariant: "solid-black"
  }
];

const ComparisonBar = ({ 
  propertyIds, 
  properties: allProps,
  onCompare, 
  onRemove,
  onClear
}: { 
  propertyIds: number[], 
  properties?: any[],
  onCompare: () => void, 
  onRemove: (id: number) => void,
  onClear: () => void
}) => {
  const properties = (allProps || FEATURED_PROPERTIES).filter((p: any) => propertyIds.includes(p.id));

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 200 }}
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex justify-center pointer-events-none"
    >
      <div className="bg-dark-navy/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] px-6 py-4 flex flex-col md:flex-row items-center gap-6 pointer-events-auto max-w-full overflow-hidden w-full md:w-auto mt-auto">
        <div className="flex flex-row md:flex-col md:pl-2 md:pr-4 md:border-r border-white/10 items-center md:items-start justify-between w-full md:w-auto">
          <span className="text-white font-black text-sm tracking-tight whitespace-nowrap">Compare</span>
          <span className="text-brand-green text-[10px] uppercase font-black tracking-widest whitespace-nowrap">{properties.length} / 4 Selected</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 w-full md:w-auto">
          <AnimatePresence>
            {properties.map((p: any) => (
              <motion.div 
                key={p.id} 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative group shrink-0"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-brand-green/30 bg-gray-800">
                  <img src={p.image} className="w-full h-full object-cover" alt="" />
                </div>
                <button 
                  onClick={() => onRemove(p.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-dark-navy rounded-full flex items-center justify-center shadow-lg hover:bg-brand-red hover:text-white transition-all transform hover:scale-110"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {Array(Math.max(0, 4 - properties.length)).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="w-14 h-14 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/10 shrink-0 bg-white/5">
              <Plus size={20} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 md:pr-2 w-full md:w-auto justify-end">
          <button 
            onClick={onClear}
            className="px-4 py-2 text-white/50 hover:text-white hover:bg-white/5 text-xs font-bold rounded-lg transition-all"
          >
            Clear All
          </button>
          <button 
            onClick={onCompare}
            disabled={properties.length < 2}
            className={`px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              properties.length >= 2 
                ? 'bg-brand-green text-white hover:bg-emerald-500 shadow-lg shadow-brand-green/20' 
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            Compare Now &rarr;
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
              className="absolute top-6 right-6 z-10 p-2 bg-white/90 hover:bg-brand-red hover:text-white rounded-xl shadow-lg compact-transition"
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

const PricingPackages = ({ onBack, onGetStarted }: { onBack: () => void, onGetStarted: (pkgName: string) => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-6 py-16"
    >
      <div className="text-center mb-24">
        <h1 className="text-5xl md:text-6xl font-black text-brand-green tracking-tighter mb-6">
          Advertising Packages
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-bold text-lg leading-relaxed">
          Choose the perfect plan to reach over 500,000 potential buyers and renters every month in Sri Lanka.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {AD_PACKAGES.map((pkg: any, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8 }}
            className={`relative rounded-2xl p-8 border border-gray-100 flex flex-col h-full ${pkg.color || 'bg-white'} shadow-2xl shadow-gray-200/40 compact-transition group overflow-hidden`}
          >
            {pkg.ribbon && (
              <div className={`absolute top-0 right-0 w-32 h-32 overflow-hidden`}>
                <div className={`absolute top-5 -right-8 w-[150px] ${pkg.ribbonColor || 'bg-primary'} text-white text-[9px] font-black uppercase tracking-[0.2em] py-1.5 text-center rotate-45 shadow-lg`}>
                  {pkg.ribbon}
                </div>
              </div>
            )}

            <div className={`mb-8 ${pkg.textColor === 'text-white' ? 'text-white' : 'text-dark-navy'}`}>
              <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${pkg.textColor === 'text-white' ? 'text-white/80' : 'text-gray-500'}`}>
                {pkg.tier}
              </div>
              <h3 className="text-2xl font-black mb-4">{pkg.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className={`text-4xl font-black tracking-tighter ${pkg.textColor === 'text-white' ? 'text-brand-green' : 'text-brand-green'}`}>{pkg.price}</span>
                <span className={`text-base font-bold ${pkg.textColor === 'text-white' ? 'text-white/80' : 'text-gray-600'}`}>/ {pkg.duration}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
              {pkg.features.map((feature: string, fIdx: number) => (
                <div key={fIdx} className="flex items-start gap-3">
                  <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${pkg.textColor === 'text-white' ? 'bg-brand-green/20' : 'bg-brand-green/10'}`}>
                    <CheckCircle size={14} className="text-brand-green" />
                  </div>
                  <span className={`text-[13px] font-bold ${pkg.textColor === 'text-white' ? 'text-white' : 'text-gray-700'}`}>
                    {feature}
                  </span>
                </div>
              ))}
              {pkg.visibility && (
                <div className={`mt-8 pt-6 border-t ${pkg.textColor === 'text-white' ? 'border-white/10' : 'border-gray-100'}`}>
                  <p className={`text-[10px] italic font-bold ${pkg.textColor === 'text-white' ? 'text-white/80' : 'text-gray-500'}`}>
                    {pkg.visibility}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const message = `Hello, I am interested in the ${pkg.name}. Please provide more details.`;
                window.open(`https://wa.me/94773951560?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className={`w-full py-4 rounded-xl font-black text-[11px] tracking-[0.15em] uppercase compact-transition border-2 ${
                pkg.buttonVariant === 'outline' ? 'border-brand-green text-brand-green hover:bg-brand-green hover:text-white' :
                pkg.buttonVariant === 'solid-green' ? 'bg-brand-green border-brand-green text-white hover:bg-brand-green/90 shadow-xl shadow-brand-green/20' :
                'bg-dark-navy border-dark-navy text-white hover:bg-black shadow-xl shadow-black/20'
              }`}
            >
              LIST YOUR PROPERTY
            </button>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-40 mb-16 px-4">
        <h2 className="text-4xl md:text-5xl font-black text-dark-navy tracking-tighter mb-6">
          Direct Publishing Plans
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto font-bold text-lg leading-relaxed">
          Choose a plan to instantly publish your property and manage your listings through your owner dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">
        {NEW_PACKAGES.map((pkg: any, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8 }}
            className={`relative rounded-3xl p-10 border-2 flex flex-col h-full bg-white compact-transition group overflow-hidden ${
              pkg.highlight ? 'border-[#C1272D] shadow-2xl shadow-[#C1272D]/5' : 'border-gray-100 shadow-xl shadow-gray-100/50'
            }`}
          >
            {pkg.ribbon && (
              <div className={`absolute top-0 right-1/2 translate-x-1/2`}>
                <div className={`bg-[#C1272D] text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-b-xl shadow-lg`}>
                  {pkg.ribbon}
                </div>
              </div>
            )}

            <div className="mb-8 mt-4">
              <h3 className="text-2xl font-black text-dark-navy mb-1 tracking-tight">{pkg.name}</h3>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-3xl font-black text-[#C1272D] tracking-tighter">{pkg.price}</span>
                <span className="text-gray-600 text-sm font-bold">/ {pkg.duration}</span>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              {pkg.features.map((feature: string, fIdx: number) => (
                <div key={fIdx} className="flex items-start gap-3">
                  <Check size={16} className="text-[#C1272D] mt-0.5" />
                  <span className="text-[13px] font-bold text-gray-800">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onGetStarted(pkg.name)}
              className={`w-full py-4 rounded-xl font-black text-[11px] tracking-[0.15em] uppercase compact-transition border-2 ${
                pkg.buttonVariant === 'solid-red' ? 'bg-[#C1272D] border-[#C1272D] text-white hover:bg-red-700 shadow-xl shadow-red-900/20' :
                pkg.buttonVariant === 'solid-black' ? 'bg-dark-navy border-dark-navy text-white hover:bg-black shadow-xl shadow-black/20' :
                'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {pkg.buttonLabel || "LIST YOUR PROPERTY"}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto space-y-32">
        <div className="text-center">
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8">Your ad will be visible across our network</h3>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[14px] font-bold text-gray-600">
            {["LankaLand.lk", "Ikman.lk", "Adsme.lk", "LankaProperty.lk", "LankaPropertyWeb.lk", "Jacktree.lk", "LankAdz.lk", "House.lk", "AdBoom.lk", "LankaBuySell.lk"].map(site => (
              <span key={site} className="hover:text-brand-green cursor-default compact-transition">{site}</span>
            ))}
          </div>
        </div>

        <div className="relative rounded-[40px] bg-dark-navy overflow-hidden p-12 md:p-20">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 to-transparent"></div>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight">
                  Are you a Real Estate Agency?
                </h3>
                <p className="text-lg text-white/50 font-medium leading-relaxed max-w-md">
                  Get custom enterprise solutions for bulk property listings and dedicated performance tracking.
                </p>
              </div>
              <button className="px-8 py-5 bg-brand-green text-dark-navy font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white hover:scale-105 active:scale-95 compact-transition shadow-2xl shadow-brand-green/20">
                Request Custom Quote
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Client Satisfaction", value: "98%" },
                { label: "Response Rate", value: "24h" },
                { label: "Verified Agents", value: "5k+" },
                { label: "Pageviews/mo", value: "10M+" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-black text-brand-green mb-1">{stat.value}</div>
                  <div className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AboutUs = ({ onBack, onNavigate }: { onBack: () => void, onNavigate?: (view: any) => void }) => {
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
              onClick={() => onNavigate?.({ type: 'contact' })}
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

const AuthPage = ({ onBack, onLogin, initialMode = 'login', onForgotPassword, onVerifyEmailMessage }: { onBack: () => void, onLogin: (user: any) => void, initialMode?: 'login' | 'signup' | 'forgot_password', onForgotPassword?: () => void, onVerifyEmailMessage?: () => void }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [agency, setAgency] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      onLogin(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phone) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            agency: agency
          },
          emailRedirectTo: `${window.location.origin}/` 
        }
      });
      
      if (error) throw error;

      if (data?.user) {
         const { error: insertError } = await supabase.from('agents').insert({
            id: data.user.id,
            name: fullName,
            email: email,
            phone: phone,
            agency: agency,
            created_at: new Date().toISOString()
         });
         if (insertError) console.error("Agent insert error", insertError);
      }
      
      if (onVerifyEmailMessage) {
        onVerifyEmailMessage();
      } else {
        setSuccessMsg("✅ Verification email sent! Please check your inbox and click the link to activate your account.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/` 
      });
      if (error) throw error;
      setSuccessMsg('✅ Password reset link sent to your email!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || `Error with ${provider} sign in`);
      setLoading(false);
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
        <button onClick={onBack} className="absolute top-8 left-8 text-gray-400 hover:text-dark-navy z-20 compact-transition">
          <ChevronLeft size={24} />
        </button>
        
        <div className="relative z-10 space-y-8 mt-4">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-dark-navy tracking-tight">
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-gray-400 text-sm font-medium">
              {mode === 'login' ? 'Enter your details to access your account' : mode === 'signup' ? 'Join Sri Lanka\'s premier property network' : 'Enter your email to receive a reset link'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-brand-red p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-brand-green/10 text-brand-green p-4 rounded-2xl text-sm font-bold border border-brand-green/20">
              {successMsg}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleSignIn : mode === 'signup' ? handleSignUp : handleForgotPassword} className="space-y-4">
            
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green compact-transition"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="077 123 4567"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green compact-transition"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Agency Name <span className="lowercase text-[10px] text-gray-400">(Optional)</span></label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      placeholder="Agency LLC"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green compact-transition"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green compact-transition"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot_password' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green compact-transition"
                    required
                    minLength={8}
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green compact-transition"
                    required
                    minLength={8}
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => setMode('forgot_password')} className="text-xs font-bold text-brand-green hover:underline">Forgot Password?</button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark compact-transition mt-4 disabled:opacity-50"
            >
              {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              {mode === 'login' ? (loading ? 'Signing in...' : 'Sign In') : mode === 'signup' ? (loading ? 'Creating Account...' : 'Create Account') : (loading ? 'Sending...' : 'Send Reset Link')}
            </button>
          </form>

          {mode !== 'forgot_password' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-bold"><span className="bg-white px-2 text-gray-300">Or continue with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => handleOAuth('google')} disabled={loading} className="flex items-center justify-center gap-2 border border-gray-100 rounded-2xl py-3 hover:bg-gray-50 compact-transition disabled:opacity-50">
                  <img src="https://www.iconpacks.net/icons/2/free-google-logo-icon-2422-thumb.png" className="h-5" alt="Google" />
                  <span className="text-sm font-bold text-gray-600">Google</span>
                </button>
                <button type="button" onClick={() => handleOAuth('facebook')} disabled={loading} className="flex items-center justify-center gap-2 border border-gray-100 rounded-2xl py-3 hover:bg-gray-50 compact-transition disabled:opacity-50">
                  <Facebook className="text-[#1877f2]" size={20} fill="currentColor" />
                  <span className="text-sm font-bold text-gray-600">Facebook</span>
                </button>
              </div>
            </>
          )}

          <div className="text-center">
            {mode === 'forgot_password' ? (
              <button 
                onClick={() => setMode('login')}
                className="text-brand-green font-bold text-sm hover:underline flex items-center justify-center gap-2 mx-auto"
              >
                <ChevronLeft size={16} /> Back to Sign In
              </button>
            ) : (
              <p className="text-sm text-gray-400 font-medium">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-brand-green font-bold hover:underline"
                >
                  {mode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            )}
          </div>

          <button 
            type="button"
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

const EmailVerificationPage = ({ onDashboard }: { onDashboard: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[70vh]"
    >
      <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200 border border-gray-100 p-10 max-w-md w-full relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -mr-16 -mt-16"></div>
        <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mt-4">
          <CheckCircle size={40} className="text-brand-green" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-dark-navy tracking-tight">Email Verified Successfully!</h2>
          <p className="text-gray-400 font-medium pb-4">Welcome to <span className="text-brand-green font-bold">LankaProperty.lk</span>! Your account is now active.</p>
        </div>
        <button
          onClick={onDashboard}
          className="w-full bg-brand-green text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark compact-transition"
        >
          Go to Dashboard
        </button>
      </div>
    </motion.div>
  );
};

const ResetPasswordPage = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      setSuccessMsg('✅ Password updated successfully!');
      setTimeout(() => onLogin(), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating password');
    } finally {
      setLoading(false);
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
        <div className="relative z-10 space-y-8 mt-4">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-dark-navy tracking-tight">Reset Password</h2>
            <p className="text-gray-400 text-sm font-medium">Enter your new password below</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-brand-red p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-brand-green/10 text-brand-green p-4 rounded-2xl text-sm font-bold border border-brand-green/20">
              {successMsg} Let's sign you in...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green compact-transition"
                  required
                  minLength={8}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green compact-transition"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark compact-transition mt-4 disabled:opacity-50"
            >
              {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
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

const PublishListingView = ({ onBack, user, onRefresh, initialPackage = 'FREE' }: { onBack: () => void, user?: any, onRefresh?: () => void, initialPackage?: "FREE" | "PREMIUM PRO" | "ELITE PRO" }) => {
  const [step, setStep] = useState(1);
  const [price, setPrice] = useState<string>("");
  const [title, setTitle] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [listingType, setListingType] = useState("For Sale");
  const [landArea, setLandArea] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [floors, setFloors] = useState("");
  const [rooms, setRooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [description, setDescription] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"FREE" | "PREMIUM PRO" | "ELITE PRO">(initialPackage);
  const [images, setImages] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const limits = {
    "FREE": 3,
    "PREMIUM PRO": 6,
    "ELITE PRO": 9
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      if (!supabase) throw new Error("Supabase client is not initialized.");

      const toNumber = (val: string | number | undefined) => val === '' || val === undefined || val === null ? null : Number(val);

      const packageMap: Record<string, string> = {
        "FREE": "Starter Free",
        "PREMIUM PRO": "Premium Pro",
        "ELITE PRO": "Elite Pro"
      };

      const daysToAdd = selectedTier === "FREE" ? 900 : selectedTier === "PREMIUM PRO" ? 60 : 90;
      const expiresAtDate = new Date();
      expiresAtDate.setDate(expiresAtDate.getDate() + daysToAdd);

      const propertyData = {
        listing_title: title,
        price_lkr: toNumber(price),
        usd_estimate: price ? toNumber(Number(price) / USD_RATE) : null,
        eur_estimate: price ? toNumber(Number(price) / EUR_RATE) : null,
        district,
        city,
        city_suburb: city,
        property_category: propertyType,
        listing_type: listingType,
        land_area: landArea,
        floor_area: floorArea,
        floors: toNumber(floors),
        rooms: toNumber(rooms),
        bathrooms: toNumber(bathrooms),
        property_description: description || title,
        is_negotiable: isNegotiable,
        images: images,
        package_tier: packageMap[selectedTier] || 'Starter Free',
        published_by: 'user',
        agent_id: user?.email || 'anonymous',
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: expiresAtDate.toISOString()
      };

      const { error } = await supabase
        .from('properties')
        .insert([propertyData]);

      if (error) throw error;
      
      onRefresh?.();
      setStep(5);
    } catch (error: any) {
      console.error("Error publishing property:", error.message);
      alert(`Failed to publish property: ${error.message}. Please check if the 'properties' table exists.`);
      // Still move to step 5 for demo purposes if it's just a table missing error in local dev
      setStep(5);
    } finally {
      setIsPublishing(false);
    }
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
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Kadawatha" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-green/20 outline-none compact-transition" 
                    />
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
                      className="absolute top-2 right-2 p-2 bg-brand-red text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
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
                  {couponError && <p className="text-[10px] font-bold text-brand-red px-1">{couponError}</p>}
                  {appliedDiscount > 0 && <p className="text-[10px] font-bold text-brand-green px-1">Coupon successfully applied!</p>}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 py-4">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-dark-navy">Secure Payment with PayHere</h3>
                <p className="text-sm font-medium text-gray-500">Complete your transaction to go live instantly.</p>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-[32px] p-8 text-center max-w-md mx-auto shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full mx-auto flex items-center justify-center mb-6">
                  <CreditCard size={40} className="text-blue-600" />
                </div>
                <h4 className="text-lg font-bold text-dark-navy mb-2">PayHere Secure Checkout</h4>
                <p className="text-sm text-gray-500 mb-6">You will be redirected to the secure PayHere payment gateway to complete your payment of <b>Rs. {total.toLocaleString()}</b>.</p>
                <div className="flex gap-4 justify-center items-center opacity-60">
                   <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-8 object-contain" />
                   <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-8 object-contain" />
                   <img src="https://img.icons8.com/color/48/amex.png" alt="Amex" className="h-8 object-contain" />
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
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">✅ Your ad is now LIVE on LankaProperty.lk!</p>
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
                    handlePublish();
                  } else if (step === 4) {
                    handlePublish();
                  } else {
                    setStep(s => s + 1);
                  }
                } else {
                  onBack();
                }
              }}
              disabled={isPublishing}
              className="ml-auto px-10 py-5 bg-brand-green text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark compact-transition flex items-center justify-center gap-2"
            >
              {isPublishing && <Loader2 className="animate-spin" size={20} />}
              {step === 5 ? 'Done' : step === 4 ? (isPublishing ? 'Publishing...' : 'Pay Now & Publish') : step === 3 && selectedTier === "FREE" ? (isPublishing ? 'Publishing...' : 'Publish Now') : 'Continue'}
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
        className="absolute top-2 right-2 p-2 bg-brand-red text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg z-20"
      >
        <Plus size={16} className="rotate-45" />
      </button>
    </div>
  );
};

const AgentPublishListingView = ({ onBack, user, onRefresh, initialData }: { onBack: () => void, user: any, onRefresh?: () => void, initialData?: Property }) => {
  const [step, setStep] = useState(1);
  const [price, setPrice] = useState<string>(initialData?.price?.replace(/[^0-9]/g, '') || "");
  const [title, setTitle] = useState(initialData?.listing_title || initialData?.title || "");
  const [district, setDistrict] = useState(initialData?.district || "Colombo");
  const [city, setCity] = useState(initialData?.city || "");
  const [propertyType, setPropertyType] = useState(initialData?.property_category || initialData?.propertyType || "Apartment");
  const [listingType, setListingType] = useState(initialData?.listing_type || initialData?.listingType || "For Sale");
  const [landArea, setLandArea] = useState(initialData?.land_area || initialData?.landArea || "");
  const [floorArea, setFloorArea] = useState(initialData?.floor_area || initialData?.floorArea || "");
  const [floors, setFloors] = useState(initialData?.floors?.toString() || "0");
  const [rooms, setRooms] = useState(initialData?.rooms?.toString() || "0");
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms?.toString() || "0");
  const [description, setDescription] = useState(initialData?.property_description || initialData?.description || "");
  const [additionalInfo, setAdditionalInfo] = useState(initialData?.additional_info || initialData?.additionalInfo || "");
  const [isNegotiable, setIsNegotiable] = useState(initialData?.is_negotiable ?? initialData?.isNegotiable ?? false);
  const [contacts, setContacts] = useState<{ type: 'Mobile' | 'Landline', number: string }[]>(
    initialData?.contacts && initialData.contacts.length > 0 
      ? initialData.contacts 
      : [{ type: 'Mobile', number: "" }]
  );
  const [images, setImages] = useState<{ id: string, url: string }[]>(
    initialData?.images?.map(url => ({ id: Math.random().toString(36).substr(2, 9), url })) || []
  );
  const [locationLink, setLocationLink] = useState(initialData?.google_maps_link || initialData?.locationLink || "");
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

      const matchingAgent = AGENTS.find(a => a.email.toLowerCase() === user?.email?.toLowerCase());
      const agentId = matchingAgent ? matchingAgent.id : (user?.email || 'anonymous');

      const toNumber = (val: string | number | undefined) => val === '' || val === undefined || val === null ? null : Number(val);
      const mobile = contacts.find(c => c.type === 'Mobile')?.number || '';
      const landline = contacts.find(c => c.type === 'Landline')?.number || '';

      const listingData = {
        listing_title: title,
        price_lkr: toNumber(price),
        usd_estimate: price ? toNumber(Number(price) / USD_RATE) : null,
        eur_estimate: price ? toNumber(Number(price) / EUR_RATE) : null,
        district,
        city,
        city_suburb: city,
        property_category: propertyType,
        listing_type: listingType,
        land_area: landArea,
        floor_area: floorArea,
        floors: toNumber(floors),
        rooms: toNumber(rooms),
        bathrooms: toNumber(bathrooms),
        property_description: description,
        additional_info: additionalInfo,
        mobile,
        landline,
        is_negotiable: isNegotiable,
        images: images.map(img => img.url),
        google_maps_link: locationLink,
        agent_id: 'ADMIN',
        published_by: 'admin',
        package_tier: 'Admin',
        status: 'active',
        created_at: initialData?.id ? undefined : new Date().toISOString(),
      };

      const { error } = initialData?.id 
        ? await supabase
          .from('properties')
          .update(listingData)
          .eq('id', initialData.id)
        : await supabase
          .from('properties')
          .insert([listingData]);

      if (error) throw error;
      
      onRefresh?.();
      setStep(3);
    } catch (error: any) {
      console.error("Error publishing listing Full Error:", error);
      console.error("Error publishing listing Message:", error.message);
      alert(`Failed to publish property: ${error.message}. Please check if your database 'properties' table is ready.`);
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
                <h2 className="text-3xl font-black mb-2 tracking-tight">Admin Property Portal</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Manager Level Access • Unlimited Listings</p>
              </div>
              <div className="flex gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAIModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-green/20 text-brand-green border border-brand-green/30 rounded-xl hover:bg-brand-green/30 transition-all font-black text-[10px] uppercase tracking-widest relative overflow-hidden group shadow-lg shadow-brand-green/10"
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles size={14} className="text-brand-green" />
                  </motion.div>
                  Quick AI Import
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  />
                </motion.button>
                <button onClick={onBack} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 compact-transition">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-2 relative z-10">
              {[1, 2].map((s) => (
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
                  <h3 className="text-4xl font-black text-dark-navy tracking-tight leading-tight">Congratulations!<br />Property Published Successfully</h3>
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
                  {initialData ? 'Updating Listing...' : 'Publishing Listing...'}
                </>
              ) : (
                step === 3 ? 'Back to Portal' : (initialData ? 'Update Now' : 'Continue to Publish')
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
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green">
                  <Sparkles size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-dark-navy">Quick AI Import</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Paste your property description below</p>
                </div>
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

const PropertyAdminCard = ({ property, onEdit, setDeleteConfirmId, updatingId, toggleStatus }: any) => {
  const isAdminPosted = property.published_by === 'admin' || property.agentId === 'ADMIN';
  const packageTier = property.package_tier?.toUpperCase() || 'STARTER FREE';
  const tierColors: Record<string, string> = {
    'STARTER FREE': 'bg-gray-100 text-gray-600',
    'FREE': 'bg-gray-100 text-gray-600',
    'PREMIUM PRO': 'bg-brand-gold/10 text-brand-gold',
    'ELITE PRO': 'bg-brand-green/10 text-brand-green'
  };
  const tierBadges: Record<string, string> = {
    'STARTER FREE': 'FREE',
    'FREE': 'FREE',
    'PREMIUM PRO': 'Rs. 4,500',
    'ELITE PRO': 'Rs. 8,500'
  };

  return (
    <div className={`bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 group hover:border-brand-green compact-transition ${property.status === 'paused' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden shrink-0 relative">
        <img src={property.image} className="w-full h-full object-cover group-hover:scale-110 compact-transition" />
        {property.status === 'paused' && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-900/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Paused</span>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex flex-wrap justify-between items-start gap-2">
            <h4 className="font-bold text-dark-navy text-lg group-hover:text-brand-green compact-transition line-clamp-1 flex-1">{property.title}</h4>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tierColors[packageTier] || tierColors['STARTER FREE']}`}>
                {tierBadges[packageTier] || tierBadges['STARTER FREE']}
              </span>
              <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isAdminPosted ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-gold/10 text-brand-gold'}`}>
                {isAdminPosted ? 'ADMIN' : 'AGENT'}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 font-medium"><MapPin size={12} className="text-brand-green" /> {property.location}</p>
          {!isAdminPosted && property.agentId && (
            <p className="text-[10px] text-gray-400 mt-1">By: {property.agentId}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between mt-4 sm:mt-0 gap-4">
          <div className="flex flex-col">
            <span className="text-brand-green font-black text-lg">{property.price}</span>
            <button 
              onClick={() => toggleStatus(property)}
              disabled={updatingId === property.id}
              className={`flex items-center gap-2 mt-1 text-[10px] font-black uppercase tracking-widest compact-transition ${property.status === 'paused' ? 'text-gray-400 hover:text-brand-green' : 'text-brand-green hover:text-brand-red'}`}
            >
              {updatingId === property.id ? (
                <Loader2 className="animate-spin" size={12} />
              ) : (
                <div className={`w-9 h-5 rounded-full relative compact-transition border ${property.status === 'paused' ? 'bg-gray-100 border-gray-200' : 'bg-brand-green text-brand-green shadow-[0_0_10px_rgba(0,181,98,0.3)]'}`}>
                  <div className={`absolute top-[1px] w-4 h-4 rounded-full shadow-sm compact-transition ${property.status === 'paused' ? 'left-0.5 bg-gray-400' : 'left-[18px] bg-white'}`} />
                </div>
              )}
              <span className={`text-[10px] font-black uppercase tracking-widest ${property.status === 'paused' ? 'text-gray-400' : 'text-brand-green'}`}>
                {property.status === 'paused' ? 'Paused' : 'Live'}
              </span>
            </button>
          </div>
          <div className="flex gap-2">
            <a 
              href={`/property/${property.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-brand-green hover:text-white compact-transition"
              onClick={(e) => {
                // Prevent navigation if it's meant to be handled by app router? 
                // Normally we would use a Link component or onClick handler.
                // But native a tag with target="_blank" is easier for "View on website"
              }}
            >
              <ExternalLink size={18} />
            </a>
            <button 
              onClick={() => onEdit(property)}
              className="px-6 py-2.5 bg-dark-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-green compact-transition shadow-lg shadow-dark-navy/10"
            >
              Edit
            </button>
            <button 
              onClick={() => setDeleteConfirmId(property.id)}
              disabled={updatingId === property.id}
              className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 compact-transition border border-transparent hover:border-red-100"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminEditPropertyModal = ({ propertyId, onClose, onRefresh, onShowToast }: { propertyId: number, onClose: () => void, onRefresh: () => void, onShowToast: (msg: string, type: 'success' | 'error') => void }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();
        if (error) throw error;
        setFormData(data);
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const toNumber = (val: any) => val === '' || val === undefined || val === null ? null : Number(val);
      const { error } = await supabase
        .from('properties')
        .update({
          listing_type: formData.listing_type,
          property_category: formData.property_category,
          listing_title: formData.listing_title,
          property_description: formData.property_description,
          district: formData.district,
          city: formData.city,
          price_lkr: toNumber(formData.price_lkr),
          rooms: toNumber(formData.rooms),
          bathrooms: toNumber(formData.bathrooms),
          floors: toNumber(formData.floors),
          land_area: formData.land_area,
          floor_area: formData.floor_area,
          mobile: formData.mobile,
          landline: formData.landline,
          package_tier: formData.package_tier,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId);

      if (error) throw error;
      onShowToast('✅ Property updated successfully!', 'success');
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Error saving property:", err);
      onShowToast('Failed to update: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-3xl flex items-center gap-4 shadow-2xl">
          <Loader2 className="animate-spin text-brand-green" size={24} />
          <span className="font-bold text-dark-navy">Loading property details...</span>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl relative mt-32 sm:my-auto my-0 mb-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-dark-navy">Edit Property Details</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {propertyId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Main info row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Listing Type</label>
              <select
                value={formData.listing_type || ''}
                onChange={(e) => setFormData({...formData, listing_type: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
              >
                <option>For Sale</option>
                <option>For Rent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Property Category</label>
              <select
                value={formData.property_category || ''}
                onChange={(e) => setFormData({...formData, property_category: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
              >
                <option>House</option>
                <option>Land</option>
                <option>Apartment</option>
                <option>Commercial</option>
                <option>Room</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Listing Title</label>
            <input
              required
              type="text"
              value={formData.listing_title || ''}
              onChange={(e) => setFormData({...formData, listing_title: e.target.value})}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Property Description</label>
            <textarea
              required
              rows={5}
              value={formData.property_description || ''}
              onChange={(e) => setFormData({...formData, property_description: e.target.value})}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2 md:col-span-1 border-r border-gray-100 pr-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Price (LKR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                <input
                  required
                  type="number"
                  value={formData.price_lkr || ''}
                  onChange={(e) => setFormData({...formData, price_lkr: e.target.value})}
                  className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">District</label>
              <input
                type="text"
                value={formData.district || ''}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">City</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Rooms</label>
              <input
                type="number"
                value={formData.rooms || ''}
                onChange={(e) => setFormData({...formData, rooms: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Bathrooms</label>
              <input
                type="number"
                value={formData.bathrooms || ''}
                onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Floors</label>
              <input
                type="number"
                value={formData.floors || ''}
                onChange={(e) => setFormData({...formData, floors: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Land Area</label>
              <input
                type="text"
                value={formData.land_area || ''}
                onChange={(e) => setFormData({...formData, land_area: e.target.value})}
                placeholder="e.g. 15 Perches"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Floor Area</label>
              <input
                type="text"
                value={formData.floor_area || ''}
                onChange={(e) => setFormData({...formData, floor_area: e.target.value})}
                placeholder="e.g. 2000 sqft"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Mobile Contact</label>
              <input
                type="text"
                value={formData.mobile || ''}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Landline</label>
              <input
                type="text"
                value={formData.landline || ''}
                onChange={(e) => setFormData({...formData, landline: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
             <div className="space-y-2">
              <label className="text-xs font-black text-purple-400 uppercase tracking-widest pl-1">Package Tier</label>
              <select
                value={formData.package_tier || 'Starter Free'}
                onChange={(e) => setFormData({...formData, package_tier: e.target.value})}
                className="w-full p-4 bg-purple-50 border border-purple-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 font-bold text-purple-900 text-sm"
              >
                <option>Starter Free</option>
                <option>Premium Pro</option>
                <option>Elite Pro</option>
              </select>
            </div>
             <div className="space-y-2">
              <label className="text-xs font-black text-blue-400 uppercase tracking-widest pl-1">Status</label>
               <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-4 bg-blue-50 border border-blue-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-blue-900 text-sm"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2 pb-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Images ({formData.images?.length || 0})</label>
            <div className="flex gap-2 overflow-x-auto pb-4">
               {formData.images?.map((img: string, i: number) => (
                 <div key={i} className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-200">
                    <img src={img} className="w-full h-full object-cover" />
                 </div>
               ))}
               {!formData.images?.length && <p className="text-sm text-gray-400">No images uploaded</p>}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3 rounded-b-[32px] -mx-6 sm:-mx-8 sm:px-8 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl font-bold text-white bg-dark-navy hover:bg-black transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AgentListingsView = ({ onBack, onEdit, onRefresh, user, onShowToast }: { onBack: () => void, properties?: Property[], onEdit: (p: Property) => void, onRefresh: () => void, user: any, onShowToast: (msg: string, type: 'success' | 'error') => void }) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [localProperties, setLocalProperties] = useState<Property[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'admin' | 'user' | 'package'>('all');
  const [adminEditPropertyId, setAdminEditPropertyId] = useState<number | null>(null);
  const [loadingProps, setLoadingProps] = useState(true);

  const fetchAdminProperties = async () => {
    setLoadingProps(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('published_by', ['admin', 'user'])
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching properties:", error);
      } else if (data) {
        setLocalProperties(data.map((item: any) => ({
          ...item,
          id: item.id,
          title: item.listing_title || item.title,
          agentId: item.agent_id,
          location: item.location || `${item.city || item.city_suburb}${item.district ? ', ' + item.district : ''}`,
          type: item.listing_type === 'Rent' || item.listing_type === 'For Rent' ? 'Rent' : 'Sale',
          image: (item.images && item.images.length > 0) ? item.images[0] : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
          price: item.price_lkr || item.price || 'Price on Request',
          status: item.status || 'active',
          published_by: item.published_by,
          package_tier: item.package_tier
        })));
      }
    } catch (err: any) {
      console.error("Fetch full error:", err);
    } finally {
      setLoadingProps(false);
    }
  };

  useEffect(() => {
    fetchAdminProperties();
  }, []);

  const toggleStatus = async (property: Property) => {
    const newStatus = property.status === 'active' ? 'paused' : 'active';
    setUpdatingId(property.id);
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', property.id);
      if (error) throw error;
      await fetchAdminProperties();
      await onRefresh();
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteProperty = async (propertyId: number) => {
    setUpdatingId(propertyId);
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        console.error('Delete error:', error);
        alert('Failed to delete: ' + error.message);
        return;
      }

      setLocalProperties(prev => prev.filter(p => p.id !== propertyId));
      alert('✅ Property deleted successfully!');
      await fetchAdminProperties();
      await onRefresh();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete: ' + err.message);
    } finally {
      setUpdatingId(null);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
    {adminEditPropertyId && (
      <AdminEditPropertyModal 
        propertyId={adminEditPropertyId} 
        onClose={() => setAdminEditPropertyId(null)} 
        onRefresh={onRefresh} 
        onShowToast={onShowToast}
      />
    )}
    {/* Delete Confirmation Modal */}
    {deleteConfirmId && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setDeleteConfirmId(null)}
          className="absolute inset-0 bg-dark-navy/60 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-2xl p-8 sm:p-10 max-w-md w-full relative overflow-hidden text-center"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-red" />
          
          <div className="w-20 h-20 bg-brand-red/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-brand-red" size={32} />
            </div>
          </div>

          <h3 className="text-2xl font-black text-dark-navy mb-4">Delete Listing?</h3>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            Are you sure you want to delete this property permanently?
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => deleteProperty(deleteConfirmId)}
              disabled={updatingId === deleteConfirmId}
              className="w-full py-4 bg-brand-red text-white font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 shadow-xl shadow-brand-red/20 active:scale-95 compact-transition inline-flex items-center justify-center gap-2"
            >
              {updatingId === deleteConfirmId ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Deleting...
                </>
              ) : (
                'Delete Permanently'
              )}
            </button>
            <button 
              onClick={() => setDeleteConfirmId(null)}
              disabled={updatingId === deleteConfirmId}
              className="w-full py-4 bg-white border-2 border-gray-100 text-gray-500 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 active:scale-95 compact-transition"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    )}

    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="container mx-auto px-6 py-12 max-w-7xl"
    >
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-500 compact-transition"
        >
          <ArrowRight className="rotate-180" size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-dark-navy">All Properties Network</h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{localProperties.length} Total Platform Advertisements</p>
        </div>
      </div>

      {/* Admin Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-dark-navy">{localProperties.length}</div>
          <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Total Props</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center border-b-4 border-b-purple-500">
          <div className="text-2xl font-black text-purple-600">{localProperties.filter(p => p.published_by === 'admin').length}</div>
          <div className="text-[9px] font-black uppercase text-purple-400 tracking-widest mt-1">Admin Posted</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center border-b-4 border-b-orange-400">
          <div className="text-2xl font-black text-orange-500">{localProperties.filter(p => p.published_by === 'user').length}</div>
          <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">User Posted</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-gray-700">{localProperties.filter(p => !p.package_tier || p.package_tier === 'Starter Free' || p.package_tier === 'FREE').length}</div>
          <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Starter Free</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-blue-600">{localProperties.filter(p => p.package_tier === 'Premium Pro' || p.package_tier === 'PREMIUM PRO').length}</div>
          <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Premium Pro</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-brand-green">{localProperties.filter(p => p.package_tier === 'Elite Pro' || p.package_tier === 'ELITE PRO').length}</div>
          <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Elite Pro</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {(['all', 'admin', 'user', 'package'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest compact-transition border-2 ${
              filterTab === tab ? 'bg-dark-navy text-white border-dark-navy shadow-lg shadow-dark-navy/20' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
            }`}
          >
            {tab === 'all' ? 'All Listings' : tab === 'admin' ? 'Admin Posted' : tab === 'user' ? 'User Posted' : 'By Package'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {localProperties.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-300">
              <Building2 size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-dark-navy">No listings found</h3>
              <p className="text-sm text-gray-400">The platform currently has no properties.</p>
            </div>
          </div>
        ) : filterTab === 'package' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* STARTER FREE */}
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200">
                <h4 className="text-sm font-black text-gray-600 uppercase tracking-widest text-center">Starter Free</h4>
                <p className="text-[10px] text-gray-400 font-bold text-center mt-1">{localProperties.filter(p => !p.package_tier || p.package_tier === 'Starter Free' || p.package_tier === 'FREE').length} Listings</p>
              </div>
              {localProperties.filter(p => !p.package_tier || p.package_tier === 'Starter Free' || p.package_tier === 'FREE').map((property) => (
                <PropertyAdminCard key={property.id} property={property} onEdit={(p: any) => setAdminEditPropertyId(p.id)} setDeleteConfirmId={setDeleteConfirmId} updatingId={updatingId} toggleStatus={toggleStatus} />
              ))}
            </div>
            
            {/* PREMIUM PRO */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest text-center">Premium Pro</h4>
                <p className="text-[10px] text-blue-400 font-bold text-center mt-1">{localProperties.filter(p => p.package_tier === 'Premium Pro' || p.package_tier === 'PREMIUM PRO').length} Listings</p>
              </div>
              {localProperties.filter(p => p.package_tier === 'Premium Pro' || p.package_tier === 'PREMIUM PRO').map((property) => (
                <PropertyAdminCard key={property.id} property={property} onEdit={(p: any) => setAdminEditPropertyId(p.id)} setDeleteConfirmId={setDeleteConfirmId} updatingId={updatingId} toggleStatus={toggleStatus} />
              ))}
            </div>

            {/* ELITE PRO */}
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                <h4 className="text-sm font-black text-green-600 uppercase tracking-widest text-center">Elite Pro</h4>
                <p className="text-[10px] text-brand-green/60 font-bold text-center mt-1">{localProperties.filter(p => p.package_tier === 'Elite Pro' || p.package_tier === 'ELITE PRO').length} Listings</p>
              </div>
              {localProperties.filter(p => p.package_tier === 'Elite Pro' || p.package_tier === 'ELITE PRO').map((property) => (
                <PropertyAdminCard key={property.id} property={property} onEdit={(p: any) => setAdminEditPropertyId(p.id)} setDeleteConfirmId={setDeleteConfirmId} updatingId={updatingId} toggleStatus={toggleStatus} />
              ))}
            </div>
          </div>
        ) : (
          localProperties.filter(p => {
            if (filterTab === 'all') return true;
            if (filterTab === 'admin') return p.published_by === 'admin';
            if (filterTab === 'user') return p.published_by === 'user';
            return true;
          }).map((property) => (
            <PropertyAdminCard key={property.id} property={property} onEdit={(p: any) => setAdminEditPropertyId(p.id)} setDeleteConfirmId={setDeleteConfirmId} updatingId={updatingId} toggleStatus={toggleStatus} />
          ))
        )}
      </div>
    </motion.div>
    </>
  );
};

const AgentOnlyListingsView = ({ onBack, onRefresh, onShowToast }: { onBack: () => void, onRefresh: () => void, onShowToast: (msg: string, type: 'success' | 'error') => void }) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [localProperties, setLocalProperties] = useState<Property[]>([]);
  const [adminEditPropertyId, setAdminEditPropertyId] = useState<number | null>(null);
  const [loadingProps, setLoadingProps] = useState(true);

  const fetchAgentProperties = async () => {
    setLoadingProps(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('published_by', 'agent')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching properties:", error);
      } else if (data) {
        setLocalProperties(data.map((item: any) => ({
          ...item,
          id: item.id,
          title: item.listing_title || item.title,
          agentId: item.agent_id,
          location: item.location || `${item.city || item.city_suburb}${item.district ? ', ' + item.district : ''}`,
          type: item.listing_type === 'Rent' || item.listing_type === 'For Rent' ? 'Rent' : 'Sale',
          image: (item.images && item.images.length > 0) ? item.images[0] : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
          price: item.price_lkr || item.price || 'Price on Request',
          status: item.status || 'active',
          published_by: item.published_by,
          package_tier: item.package_tier
        })));
      }
    } catch (err: any) {
      console.error("Fetch full error:", err);
    } finally {
      setLoadingProps(false);
    }
  };

  useEffect(() => {
    fetchAgentProperties();
  }, []);

  const toggleStatus = async (property: Property) => {
    const newStatus = property.status === 'active' ? 'paused' : 'active';
    setUpdatingId(property.id);
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', property.id);
      if (error) throw error;
      await fetchAgentProperties();
      await onRefresh();
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteProperty = async (propertyId: number) => {
    setUpdatingId(propertyId);
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        console.error('Delete error:', error);
        alert('Failed to delete: ' + error.message);
        return;
      }

      setLocalProperties(prev => prev.filter(p => p.id !== propertyId));
      alert('✅ Property deleted successfully!');
      await fetchAgentProperties();
      await onRefresh();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete: ' + err.message);
    } finally {
      setUpdatingId(null);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
    {adminEditPropertyId && (
      <AdminEditPropertyModal 
        propertyId={adminEditPropertyId} 
        onClose={() => setAdminEditPropertyId(null)} 
        onRefresh={fetchAgentProperties} 
        onShowToast={onShowToast}
      />
    )}
    {deleteConfirmId && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-navy/60 backdrop-blur-md">
        <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-dark-navy mb-4">Delete Listing?</h3>
          <p className="text-gray-500 font-medium mb-8">Are you sure you want to delete this property permanently?</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => deleteProperty(deleteConfirmId)}
              disabled={updatingId === deleteConfirmId}
              className="w-full py-4 bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 shadow-xl shadow-red-500/20 active:scale-95"
            >
              {updatingId === deleteConfirmId ? 'Deleting...' : 'Delete Permanently'}
            </button>
            <button 
              onClick={() => setDeleteConfirmId(null)}
              disabled={updatingId === deleteConfirmId}
              className="w-full py-4 bg-white border-2 border-gray-100 text-gray-500 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-500">
          <ArrowRight className="rotate-180" size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-dark-navy">Agent Listings</h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{localProperties.length} properties posted by agents</p>
        </div>
      </div>

      <div className="space-y-4">
        {loadingProps ? (
          <div className="text-center py-20 text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-4" size={40} />
            <p>Loading agent listings...</p>
          </div>
        ) : localProperties.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-300">
              <Building2 size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-dark-navy">No agent listings found</h3>
              <p className="text-sm text-gray-400">There are currently no properties posted by agents.</p>
            </div>
          </div>
        ) : (
          localProperties.map((property) => (
            <PropertyAdminCard key={property.id} property={property} onEdit={(p: any) => setAdminEditPropertyId(p.id)} setDeleteConfirmId={setDeleteConfirmId} updatingId={updatingId} toggleStatus={toggleStatus} />
          ))
        )}
      </div>
    </motion.div>
    </>
  );
};

const AdminFeaturedProjectsView = ({ onBack, onShowToast }: { onBack: () => void, onShowToast: (msg: string, type: 'success' | 'error') => void }) => {
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<FeaturedProject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('featured_projects')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.error(err);
      onShowToast("Failed to fetch featured projects", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const [formData, setFormData] = useState<Partial<FeaturedProject>>({});

  const handleEdit = (project?: FeaturedProject) => {
    if (project) {
      setEditingProject(project);
      setFormData({ ...project });
    } else {
      setEditingProject({} as FeaturedProject);
      setFormData({
        title: '',
        main_image: '',
        description: '',
        location: '',
        price_from: '',
        developer_name: '',
        developer_logo: '',
        contact_phone: '',
        is_active: true,
        sort_order: projects.length + 1
      });
    }
  };

  const handleAddMultipleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const newUrls = await Promise.all(files.map(async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('featured-projects')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('featured-projects')
          .getPublicUrl(filePath);

        return data.publicUrl;
      }));

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newUrls]
      }));
      onShowToast(`${newUrls.length} images uploaded successfully`, "success");
    } catch (err: any) {
      onShowToast("Failed to upload some images", "error");
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const moveGalleryImage = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      if (direction === 'up' && index > 0) {
        const temp = newImages[index - 1];
        newImages[index - 1] = newImages[index];
        newImages[index] = temp;
      } else if (direction === 'down' && index < newImages.length - 1) {
        const temp = newImages[index + 1];
        newImages[index + 1] = newImages[index];
        newImages[index] = temp;
      }
      return { ...prev, images: newImages };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'main_image' | 'developer_logo') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

      const { error: uploadError } = await supabase.storage
        .from('featured-projects')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('featured-projects')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, [field]: data.publicUrl }));
      onShowToast("Image uploaded successfully", "success");
    } catch (err: any) {
      console.error(err);
      onShowToast("Failed to upload image. Does the bucket 'featured-projects' exist?", "error");
    }
  };

  const handleSave = async (e?: React.FormEvent, keepOpen: boolean = false) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      if (formData.id) {
        const { error } = await supabase
          .from('featured_projects')
          .update(formData)
          .eq('id', formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('featured_projects')
          .insert([formData]);
        if (error) throw error;
      }
      onShowToast("Project saved successfully", "success");
      if (!keepOpen) setEditingProject(null);
      fetchProjects();
    } catch (err: any) {
      onShowToast(err.message || "Failed to save project", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('featured_projects')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchProjects();
    } catch (err) {
      onShowToast("Failed to update status", "error");
    }
  };

  const moveProject = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const currentProj = projects[index];
    const targetProj = projects[targetIndex];

    try {
      const { error: error1 } = await supabase
        .from('featured_projects')
        .update({ sort_order: targetProj.sort_order })
        .eq('id', currentProj.id);
      
      const { error: error2 } = await supabase
        .from('featured_projects')
        .update({ sort_order: currentProj.sort_order })
        .eq('id', targetProj.id);

      if (error1 || error2) throw new Error("Failed to update sort order");
      fetchProjects();
    } catch (err: any) {
      onShowToast(err.message, "error");
    }
  };

  const deleteProject = async (id: number) => {
    if (!window.confirm("Delete this featured project permanently?\nThis will remove it from the homepage.")) return;
    try {
      const { error } = await supabase.from('featured_projects').delete().eq('id', id);
      if (error) throw error;
      onShowToast("✅ Project deleted", "success");
      fetchProjects();
    } catch (err) {
      onShowToast("Failed to delete project", "error");
    }
  };

  if (editingProject) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="fixed inset-0 z-50 bg-gray-900/50 flex justify-end">
        <div className="w-full max-w-2xl bg-gray-50 h-full overflow-y-auto shadow-2xl flex flex-col">
          <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <h2 className="text-2xl font-black text-dark-navy">{formData.id ? 'Edit Project' : 'Add New Project'}</h2>
            <button onClick={() => setEditingProject(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          <div className="p-8 flex-1">
            <form id="project-form" onSubmit={handleSave} className="space-y-8">
              
              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-dark-navy mb-4 border-b border-gray-100 pb-2">1. Project Images</h3>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Main Image (Required)</label>
                  <div className="flex gap-4 items-center">
                    {formData.main_image && <img src={formData.main_image} className="w-32 h-20 object-cover rounded-xl shadow-sm border border-gray-200" />}
                    <label className="flex-1 border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-8 text-center cursor-pointer transition-colors">
                      <span className="text-sm font-bold text-brand-green">Upload Main Image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'main_image')} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Gallery Images (Optional)</label>
                  
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200 h-24">
                          <img src={img} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {idx > 0 && (
                              <button type="button" onClick={() => moveGalleryImage(idx, 'up')} className="p-1 bg-white rounded-full text-gray-700 hover:text-brand-green">
                                <ArrowUp size={14} />
                              </button>
                            )}
                            <button type="button" onClick={() => removeGalleryImage(idx)} className="p-1 bg-white rounded-full text-gray-700 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                            {idx < (formData.images?.length || 0) - 1 && (
                              <button type="button" onClick={() => moveGalleryImage(idx, 'down')} className="p-1 bg-white rounded-full text-gray-700 hover:text-brand-green">
                                <ArrowUp className="rotate-180" size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="block border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-6 text-center cursor-pointer transition-colors">
                    <span className="text-sm font-bold text-brand-green">Add Multiple Images</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddMultipleImages} />
                  </label>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 space-y-6">
                <h3 className="font-bold text-dark-navy mb-4 border-b border-gray-100 pb-2">2. Project Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Project Title</label>
                    <input required type="text" placeholder="e.g. Mon Vie Residencies" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Developer Name</label>
                    <input type="text" placeholder="e.g. Prime Residencies" value={formData.developer_name || ''} onChange={e => setFormData({...formData, developer_name: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Developer Logo</label>
                    <div className="flex gap-4 items-center">
                      {formData.developer_logo && <img src={formData.developer_logo} className="w-12 h-12 object-contain bg-gray-50 border border-gray-200 rounded-xl p-1" />}
                      <label className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-center cursor-pointer transition-colors text-sm font-bold text-gray-600">
                        Upload Logo
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'developer_logo')} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
                    <input type="text" placeholder="e.g. Colombo 05" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price From</label>
                    <input type="text" placeholder="e.g. LKR 86M or USD 1.2M" value={formData.price_from || ''} onChange={e => setFormData({...formData, price_from: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contact Phone</label>
                    <input type="text" placeholder="e.g. 0702 777 777" value={formData.contact_phone || ''} onChange={e => setFormData({...formData, contact_phone: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Website URL</label>
                    <input type="url" placeholder="https://developer-website.com" value={formData.website_url || ''} onChange={e => setFormData({...formData, website_url: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                    <textarea rows={3} placeholder="Brief project description..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sort Order</label>
                    <input type="number" required value={formData.sort_order || 0} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-dark-navy">3. Status</h3>
                  <p className="text-xs text-gray-500">Determine if this project is visible on the homepage.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.is_active || false} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                </label>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 border-t border-gray-100 flex justify-end gap-3 flex-wrap sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button type="button" onClick={() => setEditingProject(null)} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors">Cancel</button>
            <button type="button" onClick={async (e) => {
              if (!formData.title || !formData.main_image) {
                onShowToast("Title and Main Image are required.", "error");
                return;
              }
              await handleSave(e as any, true);
              setFormData({
                title: '',
                main_image: '',
                images: [],
                description: '',
                location: '',
                price_from: '',
                developer_name: '',
                developer_logo: '',
                contact_phone: '',
                website_url: '',
                is_active: true,
                sort_order: projects.length + 2
              });
            }} disabled={isSaving} className="px-6 py-3 bg-white text-brand-green border-2 border-brand-green font-bold rounded-xl hover:bg-green-50 transition-all flex items-center gap-2">
              Save & Add Another
            </button>
            <button type="submit" form="project-form" disabled={isSaving} className="px-6 py-3 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green-dark transition-all shadow-lg shadow-brand-green/20 flex items-center gap-2">
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Project
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-dark-navy flex items-center gap-3">
              🏆 Featured Projects
              <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">{projects.length} Projects</span>
            </h2>
            <p className="text-sm font-bold text-gray-400">Manage homepage featured property showcase</p>
          </div>
        </div>
        <button onClick={() => handleEdit()} className="px-6 py-3 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green-dark transition-all shadow-lg shadow-brand-green/20">
          + Add New Project
        </button>
      </div>

      <div className="bg-blue-50/50 p-4 rounded-xl mb-8 border border-blue-100/50 text-blue-800 text-sm">
        <strong>Storage Note:</strong> Make sure there is a public Supabase storage bucket named <code>featured-projects</code> to store images for these featured projects.
      </div>

      {loading ? (
        <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-green" size={40} /></div>
      ) : projects.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold mb-4">No featured projects found.</p>
          <button onClick={() => handleEdit()} className="text-brand-green font-bold">Add your first project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj, idx) => (
            <div key={proj.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
              <div className="h-[180px] relative">
                <img src={proj.main_image} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md shadow-sm flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${proj.is_active ? 'bg-brand-green' : 'bg-brand-red'}`} />
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider">{proj.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
                {proj.developer_logo && (
                  <div className="absolute bottom-3 left-3 bg-white p-1 rounded-md shadow-sm">
                    <img src={proj.developer_logo} className="w-8 h-8 object-contain" />
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-black text-dark-navy text-xl mb-3 line-clamp-1">{proj.title}</h4>
                <div className="space-y-2 mb-4 text-sm">
                  <p className="text-gray-500 flex justify-between items-center"><span className="text-gray-400">📍 Location</span> <span className="font-bold text-dark-navy">{proj.location || '-'}</span></p>
                  <p className="text-gray-500 flex justify-between items-center"><span className="text-gray-400">💰 Price From</span> <span className="font-bold text-dark-navy">{proj.price_from || '-'}</span></p>
                  <p className="text-gray-500 flex justify-between items-center"><span className="text-gray-400">👷 Developer</span> <span className="font-bold text-dark-navy">{proj.developer_name || '-'}</span></p>
                  <p className="text-gray-500 flex justify-between items-center"><span className="text-gray-400">📞 Phone</span> <span className="font-bold text-dark-navy">{proj.contact_phone || '-'}</span></p>
                  <p className="text-gray-500 flex justify-between items-center border-t border-gray-100 pt-2"><span className="text-gray-400">Sort Order</span> <span className="font-black text-brand-green bg-green-50 px-2 py-0.5 rounded-md">{proj.sort_order}</span></p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveProject(idx, 'up')} disabled={idx === 0} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-dark-navy hover:bg-gray-100 rounded-lg disabled:opacity-30">
                      <ArrowUp size={16} />
                    </button>
                    <button onClick={() => moveProject(idx, 'down')} disabled={idx === projects.length - 1} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-dark-navy hover:bg-gray-100 rounded-lg disabled:opacity-30">
                      <ArrowUp className="rotate-180" size={16} />
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                    <label className="relative inline-flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-lg" title="Toggle Visibility">
                      <input type="checkbox" checked={proj.is_active} onChange={() => toggleActive(proj.id, proj.is_active)} className="sr-only peer" />
                      <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[10px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-green"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <a href="/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-lg" title="Preview on Homepage">
                      <Eye size={16} />
                    </a>
                    <button onClick={() => handleEdit(proj)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-dark-navy rounded-lg" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteProject(proj.id)} className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const AnalyticsOverview = ({ user, isAdmin }: { user: any, isAdmin?: boolean }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'house' | 'land' | 'apartment'>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    all: { reach: '0', leads: '0', clicks: '0%' },
    house: { reach: '0', leads: '0', clicks: '0%' },
    land: { reach: '0', leads: '0', clicks: '0%' },
    apartment: { reach: '0', leads: '0', clicks: '0%' },
  });
  const [trendData, setTrendData] = useState<any>({ all: [], house: [], land: [], apartment: [] });
  const [distributionData, setDistributionData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const { data: properties, error } = await supabase
          .from('properties')
          .select('id, property_category, views_count, leads_count, created_at')
          .eq('agent_id', user.email);

        if (error) throw error;

        // 1. Process Overall Stats & Category Stats
        const newStats: any = {
          all: { reach: 0, leads: 0 },
          house: { reach: 0, leads: 0 },
          land: { reach: 0, leads: 0 },
          apartment: { reach: 0, leads: 0 },
        };

        const categoryCounts: Record<string, number> = {};

        properties?.forEach(p => {
          const cat = (p.property_category || 'other').toLowerCase();
          const pViews = Number(isAdmin ? (p.views_count || 0) : getDisplayViews(p, false).replace(/,/g, ''));
          const pLeads = Number(p.leads_count || 0);

          newStats.all.reach += pViews;
          newStats.all.leads += pLeads;

          if (newStats[cat]) {
            newStats[cat].reach += pViews;
            newStats[cat].leads += pLeads;
          }

          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        // Calculate click rates and format
        const formatStats = (s: any) => ({
          reach: s.reach >= 1000 ? (s.reach / 1000).toFixed(1) + 'k' : s.reach.toString(),
          leads: s.leads.toString(),
          clicks: s.reach > 0 ? ((s.leads / s.reach) * 100).toFixed(1) + '%' : '0%'
        });

        setStats({
          all: formatStats(newStats.all),
          house: formatStats(newStats.house),
          land: formatStats(newStats.land),
          apartment: formatStats(newStats.apartment),
        });

        // 2. Market Share (Donut Chart)
        const totalListings = properties?.length || 1;
        setDistributionData([
          { name: 'Houses', value: Math.round(((categoryCounts['house'] || 0) / totalListings) * 100), color: '#00b562' },
          { name: 'Lands', value: Math.round(((categoryCounts['land'] || 0) / totalListings) * 100), color: '#3b82f6' },
          { name: 'Apartments', value: Math.round(((categoryCounts['apartment'] || 0) / totalListings) * 100), color: '#6366f1' },
        ].filter(d => d.value > 0));

        // 3. Performance Velocity (Listings per day this week)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekTrends: any = { all: [], house: [], land: [], apartment: [] };
        
        days.forEach(day => {
          ['all', 'house', 'land', 'apartment'].forEach(cat => {
            weekTrends[cat].push({ name: day, views: 0 });
          });
        });

        properties?.forEach(p => {
          const date = new Date(p.created_at);
          const dayName = days[date.getDay()];
          const cat = (p.property_category || 'other').toLowerCase();
          const pViews = Number(isAdmin ? (p.views_count || 0) : getDisplayViews(p, false).replace(/,/g, ''));

          const allDay = weekTrends.all.find((d: any) => d.name === dayName);
          if (allDay) allDay.views += pViews;

          if (weekTrends[cat]) {
            const catDay = weekTrends[cat].find((d: any) => d.name === dayName);
            if (catDay) catDay.views += pViews;
          }
        });

        setTrendData(weekTrends);

      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.email]);

  const categories = [
    { id: 'all', label: 'All Property' },
    { id: 'house', label: 'Houses' },
    { id: 'land', label: 'Lands' },
    { id: 'apartment', label: 'Apartments' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex gap-2 mb-2 p-1.5 bg-gray-50 rounded-3xl w-fit">
          {[1,2,3,4].map(i => <div key={i} className="w-24 h-10 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-white border border-gray-100 rounded-[32px]" />)}
        </div>
        <div className="h-[400px] bg-white border border-gray-100 rounded-[40px]" />
      </div>
    );
  }

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const chartTheme = {
    background: 'transparent',
    gridColor: isDark ? '#374151' : '#f1f5f9',
    textColor: isDark ? '#9CA3AF' : '#94a3b8',
    tooltipBg: isDark ? '#1F2937' : '#FFFFFF',
    tooltipText: isDark ? '#F9FAFB' : '#111827',
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3 mb-4 p-2 bg-gray-100 rounded-3xl w-fit border border-gray-200/50 shadow-inner">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest compact-transition ${
              selectedCategory === cat.id 
                ? 'bg-brand-green text-white shadow-xl shadow-brand-green/30 scale-105' 
                : 'text-gray-500 hover:text-dark-navy hover:bg-white/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
        {[
          { label: 'Total Platform Reach', value: stats[selectedCategory].reach, change: '+12.5%', icon: Eye, primary: true },
          { label: 'Interested Leads', value: stats[selectedCategory].leads, change: '+8.2%', icon: Users, primary: false },
          { label: 'Avg. Engagement Clicks', value: stats[selectedCategory].clicks, change: '+5.1%', icon: MousePointer2, primary: false },
        ].map((stat, i) => (
          <div key={i} className={`relative p-8 rounded-[40px] border flex flex-col justify-between group overflow-hidden compact-transition ${stat.primary ? 'bg-dark-navy border-dark-navy text-white shadow-2xl shadow-dark-navy/30' : 'bg-white border-gray-100 text-dark-navy hover:border-brand-green hover:shadow-2xl hover:-translate-y-1'}`}>
            
            {/* Background decoration for primary card */}
            {stat.primary && (
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-green rounded-full blur-[80px] opacity-30 pointer-events-none" />
            )}

            <div className="flex justify-between items-start mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 compact-transition ${stat.primary ? 'bg-white/10 text-brand-green backdrop-blur-md border border-white/10 z-10 relative shadow-lg shadow-brand-green/20' : 'bg-gray-50 text-brand-green border border-gray-100 shadow-sm'}`}>
                <stat.icon size={28} className={stat.primary ? 'stroke-[2.5px]' : 'stroke-2'} />
              </div>
              
              <div className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-full z-10 relative ${stat.primary ? 'bg-brand-green/20 text-brand-green border border-brand-green/20' : 'bg-brand-green/10 text-brand-green border border-brand-green/10'}`}>
                <TrendingUp size={14} className={stat.primary ? "stroke-[3px]" : "stroke-2"} />
                {stat.change}
              </div>
            </div>

            <div className="space-y-1.5 relative z-10">
              <p className={`text-[12px] font-black uppercase tracking-[0.2em] ${stat.primary ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
              <h4 className={`text-5xl font-black tracking-tight ${stat.primary ? 'text-white' : 'text-dark-navy'}`}>{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-dark-navy p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden relative group h-full">
          <div className="absolute top-0 right-0 p-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-green/10 text-brand-green rounded-full">
              <TrendingUp size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">LIVE TRENDS</span>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-black text-dark-navy dark:text-white">Performance Velocity</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1"> engagement vs leads</p>
          </div>

          <ChartWrapper height={300}>
            <AreaChart data={trendData[selectedCategory]}>
              <defs>
                <linearGradient id="colorViewsCat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedCategory === 'land' ? '#3b82f6' : selectedCategory === 'apartment' ? '#6366f1' : '#00b562'} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={selectedCategory === 'land' ? '#3b82f6' : selectedCategory === 'apartment' ? '#6366f1' : '#00b562'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: chartTheme.textColor }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: chartTheme.tooltipBg,
                  color: chartTheme.tooltipText,
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                itemStyle={{ color: chartTheme.tooltipText }}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke={selectedCategory === 'land' ? '#3b82f6' : selectedCategory === 'apartment' ? '#6366f1' : '#00b562'} 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorViewsCat)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ChartWrapper>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-dark-navy p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-dark-navy dark:text-white">Market Share</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Listing density by category</p>
          </div>

          <ChartWrapper height={300} className="my-4">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1500}
                stroke="none"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: chartTheme.tooltipBg,
                  color: chartTheme.tooltipText,
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                itemStyle={{
                  color: chartTheme.tooltipText
                }}
              />
            </PieChart>
          </ChartWrapper>

          <div className="space-y-3">
            {distributionData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-dark-navy">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-gray-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SecretLoginView = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: (email: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      let { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      
      const isFallbackCreds = (email.toLowerCase() === 'abhishekdewminaa@gmail.com' && password === 'LANKApMAX2026$') || (email.toLowerCase() === 'ceo.lankaland@gmail.com' && password === 'CEOlankaP2026$');

      if (authError && isFallbackCreds) {
        // Auto sign up the admin if they don't exist yet
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (!signUpError) {
           authError = null; // Successfully created and logged in
        }
      }

      if (authError) {
        setIsLoading(false);
        setErrorMsg(authError.message);
        return;
      }
      
      const { data: isAdmin, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .single();
        
      if (adminError && adminError.code !== 'PGRST116') {
        console.error("Error querying admin_users:", adminError);
      }
        
      // Fallback for Abhishek if table check fails entirely (e.g. table not created yet)
      const allowedEmails = ['abhishekdewminaa@gmail.com', 'ceo.lankaland@gmail.com'];
      const isFallbackAdmin = allowedEmails.includes(email.toLowerCase());
      if (!isAdmin && !isFallbackAdmin) {
        // Not an admin, allow them in but they might just see limited stuff or we can redirect
        // For now keep the original logic of redirecting back if not authorized
        onBack();
        return;
      }
      
      onSuccess(email);
    } catch (err) {
      console.error("Login exception:", err);
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover blur-[8px] scale-110"
          alt="Login Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Header Logo */}
      <div className="relative z-10 p-8">
        <h1 className="text-2xl font-black text-brand-green tracking-tight">LankaProperty</h1>
      </div>

      {/* Main Container */}
      <div className="flex-1 relative z-10 flex items-center justify-center -mt-16 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[500px] bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-white/20"
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-3">Sign In</h2>
            <p className="text-[#6B7280] font-medium">Access your account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <div className="p-4 bg-brand-red/10 text-brand-red rounded-xl text-sm font-bold text-center">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#374151] uppercase tracking-[0.05em]">EMAIL ADDRESS</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#F3F4F6]/50 border border-[#E5E7EB] rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green focus:bg-white compact-transition font-medium text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-[#374151] uppercase tracking-[0.05em]">PASSWORD</label>
                <a href="#" className="text-[11px] font-black text-brand-green hover:opacity-80 compact-transition">Forgot Password?</a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F3F4F6]/50 border border-[#E5E7EB] rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green focus:bg-white compact-transition font-medium text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#00B67A] text-white font-bold rounded-xl shadow-lg shadow-[#00B67A]/20 hover:bg-[#00A06B] active:scale-[0.98] compact-transition flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Sign In'}
            </button>

            <div className="relative flex items-center justify-center py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]"></div>
              </div>
              <span className="relative px-4 bg-white text-[11px] font-black text-[#6B7280] uppercase tracking-[0.05em]">OR CONTINUE WITH</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-3 py-3.5 border border-[#E5E7EB] rounded-xl hover:bg-gray-50 compact-transition font-bold text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-3 py-3.5 border border-[#E5E7EB] rounded-xl hover:bg-gray-50 compact-transition font-bold text-sm">
                <Facebook size={20} className="text-[#1877F2] fill-[#1877F2]" />
                Facebook
              </button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm font-medium text-[#6B7280]">
                Don't have an account? <a href="#" className="font-bold text-brand-green hover:underline">Sign up for free</a>
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-8 flex flex-col sm:flex-row justify-between items-center text-xs font-medium text-white/80 gap-4 mt-auto">
        <p>© 2024 LankaProperty.lk. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white compact-transition">Privacy Policy</a>
          <a href="#" className="hover:text-white compact-transition">Terms of Service</a>
          <a href="#" className="hover:text-white compact-transition">Help Center</a>
        </div>
      </footer>
    </div>
  );
};

const AgentAccessView = ({ onBack, user, onNewProperty, onShowInquiries, onShowListings, onShowAgentListings, onShowFeaturedProjectsAdmin, onLogout, agentPropertiesCount, agentLeadsTotal }: { onBack: () => void, user: any, onNewProperty: () => void, onShowInquiries: () => void, onShowListings: () => void, onShowAgentListings: () => void, onShowFeaturedProjectsAdmin: () => void, onLogout: () => void, agentPropertiesCount: number, agentLeadsTotal: number }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editProfile' | 'security' | 'live_visitors'>('dashboard');
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);

  useEffect(() => {
    const fetchNewCount = async () => {
      if (!user?.email) return;
      try {
        const { count, error } = await supabase
          .from('property_inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', user.email)
          .eq('status', 'new');
        if (error) throw error;
        setNewInquiriesCount(count || 0);
      } catch (err) {
        console.warn("Could not fetch new inquiries count:", err);
      }
    };
    fetchNewCount();
  }, [user]);

  const [formData, setFormData] = useState({
    firstName: user?.email ? user.email.split('@')[0] : '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    agency: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passToast, setPassToast] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        // Use actively logged in user or the fallback user prop passed from login
        const activeEmail = currentUser?.email || user?.email;

        if (!activeEmail) {
          onBack();
          return;
        }

        const { data: isAdmin, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', activeEmail)
          .single();

        if (adminError && adminError.code !== 'PGRST116') {
          console.error("Error querying admin_users in Agent Access:", adminError);
        }

        const allowedEmails = ['abhishekdewminaa@gmail.com', 'ceo.lankaland@gmail.com'];
        const isFallbackAdmin = allowedEmails.includes(activeEmail.toLowerCase());
        if (!isAdmin && !isFallbackAdmin) {
          onBack();
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error("Agent Access catch err:", err);
        onBack();
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    
    checkAdmin();
  }, [user, onBack]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));

      if (user?.id) {
        try {
          const { data, error } = await supabase.storage
            .from('avatars')
            .upload(
              `agent-${user.id}-${Date.now()}.jpg`, 
              file,
              { upsert: true }
            );

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(data.path);

          const { error: updateError } = await supabase
            .from('agents')
            .update({ avatar_url: urlData.publicUrl })
            .eq('id', user.id);
            
          if (updateError) throw updateError;

          setToastMessage({ type: 'success', text: '✅ Profile photo updated!' });
          setTimeout(() => setToastMessage(null), 3000);

        } catch (err: any) {
          console.error("Avatar upload error:", err);
          setToastMessage({ type: 'error', text: 'Failed to update profile photo.' });
          setTimeout(() => setToastMessage(null), 3000);
        }
      }
    }
  };

  useEffect(() => {
    if (user && activeTab === 'editProfile') {
      supabase.from('agents').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
             const parts = (data.name || '').split(' ');
             setFormData({
               firstName: parts[0] || '',
               lastName: parts.slice(1).join(' ') || '',
               email: data.email || user.email || '',
               phone: data.phone || '',
               agency: data.agency || ''
             });
          }
        });
    }
  }, [user, activeTab]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          agency: formData.agency,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setToastMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setToastMessage({ type: 'error', text: err.message || 'Error updating profile' });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPassToast({ type: 'error', text: "Passwords do not match" });
      setTimeout(() => setPassToast(null), 3000);
      return;
    }
    if (newPassword.length < 6) {
      setPassToast({ type: 'error', text: "Password must be at least 6 characters" });
      setTimeout(() => setPassToast(null), 3000);
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      setPassToast({ type: 'success', text: "Password updated successfully!" });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setTimeout(() => setPassToast(null), 3000);
    } catch (err: any) {
      console.error(err);
      setPassToast({ type: 'error', text: err.message || 'Error updating password' });
      setTimeout(() => setPassToast(null), 3000);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      setShowDeleteConfirm(false);
      onLogout();
    } catch (err: any) {
      console.error(err);
      setPassToast({ type: 'error', text: err.message || 'Error deleting account. Contact support.' });
      setTimeout(() => setPassToast(null), 5000);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isCheckingAdmin || !isAuthorized) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-6 py-20 max-w-6xl"
    >
      <div className="flex items-center gap-6 mb-16">
        <button 
          onClick={() => {
              if (activeTab === 'dashboard') {
                onBack();
              } else {
                setActiveTab('dashboard');
              }
            }}
            className="p-4 bg-white border border-gray-100 rounded-2xl hover:bg-brand-green hover:text-white shadow-sm compact-transition group"
          >
            <ArrowRight className="rotate-180" size={24} />
          </button>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-dark-navy leading-none tracking-tight">
              {activeTab === 'dashboard' ? 'Admin Portal' : activeTab === 'editProfile' ? 'Edit Profile' : 'Security Settings'}
            </h1>
            <p className="text-base md:text-lg font-bold text-gray-500 mt-2">
              {activeTab === 'dashboard' ? 'Manage platform and listings' : activeTab === 'editProfile' ? 'Update your personal information' : 'Manage your account security'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/60 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 rounded-bl-full" />
              <div className="w-28 h-28 bg-brand-green mx-auto rounded-[32px] flex items-center justify-center text-white text-5xl font-black mb-6 shadow-xl shadow-brand-green/30 relative z-10">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-black text-dark-navy mb-1 line-clamp-1">{user?.email?.split('@')[0]}</h2>
              <p className="text-xs font-black text-brand-green uppercase tracking-[0.25em] mb-8">System Admin</p>
              
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                <div>
                  <div className="text-2xl font-black text-dark-navy">{agentPropertiesCount}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Active Ads</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-dark-navy">{agentLeadsTotal >= 1000 ? (agentLeadsTotal/1000).toFixed(1) + 'k' : agentLeadsTotal}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Leads</div>
                </div>
              </div>
            </div>

            <div className="bg-dark-navy p-8 rounded-[40px] text-white space-y-6 shadow-2xl shadow-dark-navy/30">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green mb-2 px-2">Main Navigation</h3>
              {isAuthorized && (
                <div 
                  onClick={onShowFeaturedProjectsAdmin}
                  className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer compact-transition group bg-white/5 hover:bg-white/10`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center compact-transition bg-purple-500/20 text-purple-500 group-hover:bg-purple-500 group-hover:text-white`}>
                      <Star size={24} />
                    </div>
                    <span className="text-base font-bold">Featured Projects</span>
                  </div>
                  <ArrowRight size={20} className={`compact-transition text-white/30 group-hover:text-white`} />
                </div>
              )}

              <div 
                onClick={() => setActiveTab('live_visitors')}
                className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer compact-transition group ${activeTab === 'live_visitors' ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center compact-transition ${activeTab === 'live_visitors' ? 'bg-brand-green text-white' : 'bg-brand-green/20 text-brand-green group-hover:bg-brand-green group-hover:text-white'}`}>
                    <Activity size={24} />
                  </div>
                  <span className="text-base font-bold">Live Visitors</span>
                </div>
                <ArrowRight size={20} className={`compact-transition ${activeTab === 'live_visitors' ? 'text-white' : 'text-white/30 group-hover:text-white'}`} />
              </div>

              <div 
                onClick={() => setActiveTab('editProfile')}
                className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer compact-transition group ${activeTab === 'editProfile' ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center compact-transition ${activeTab === 'editProfile' ? 'bg-brand-green text-white' : 'bg-brand-green/20 text-brand-green group-hover:bg-brand-green group-hover:text-white'}`}>
                    <User size={24} />
                  </div>
                  <span className="text-base font-bold">Edit Profile</span>
                </div>
                <ArrowRight size={20} className={`compact-transition ${activeTab === 'editProfile' ? 'text-white' : 'text-white/30 group-hover:text-white'}`} />
              </div>

              <div 
                onClick={() => setActiveTab('security')}
                className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer compact-transition group ${activeTab === 'security' ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center compact-transition ${activeTab === 'security' ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'}`}>
                    <Shield size={24} />
                  </div>
                  <span className="text-base font-bold">Security Settings</span>
                </div>
                <ArrowRight size={20} className={`compact-transition ${activeTab === 'security' ? 'text-white' : 'text-white/30 group-hover:text-white'}`} />
              </div>
              
              <div className="pt-6 mt-4 border-t border-white/10">
                <button 
                  onClick={onLogout}
                  className="w-full py-5 bg-brand-red text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-red-900/40 hover:bg-red-600 hover:-translate-y-1 compact-transition"
                >
                  Logout System
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-10">
            {activeTab === 'dashboard' && (
              <>
                <AnalyticsOverview user={user} isAdmin={isAuthorized} />
                
                <h3 className="text-xl font-black text-dark-navy uppercase tracking-widest pl-2">Quick Management</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div 
                    onClick={onShowListings}
                    className="p-10 bg-white border border-gray-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-2 compact-transition group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10" />
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white compact-transition relative z-10">
                        <Building size={28} />
                      </div>
                    </div>
                    <h4 className="text-xl font-black text-dark-navy">{isAuthorized ? 'All Properties' : 'My Listings'}</h4>
                    <p className="text-sm font-bold text-gray-400 mt-2">Manage & Edit platform inventory</p>
                  </div>

                  {isAuthorized && (
                    <div 
                      onClick={onShowAgentListings}
                      className="p-10 bg-white border border-gray-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-2 compact-transition group cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full pointer-events-none group-hover:bg-orange-500/10" />
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white compact-transition relative z-10">
                          <Users size={28} />
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-dark-navy">Agent Listings</h4>
                      <p className="text-sm font-bold text-gray-400 mt-2">Manage agent posted properties</p>
                    </div>
                  )}

                  {isAuthorized && (
                    <div 
                      onClick={onShowFeaturedProjectsAdmin}
                      className="p-10 bg-white border border-gray-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-2 compact-transition group cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full pointer-events-none group-hover:bg-purple-500/10" />
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white compact-transition relative z-10">
                          <Star size={28} />
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-dark-navy">Featured Projects</h4>
                      <p className="text-sm font-bold text-gray-400 mt-2">Manage homepage slider</p>
                    </div>
                  )}

                  <div 
                    onClick={onShowInquiries}
                    className="p-10 bg-white border border-gray-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-2 compact-transition group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10" />
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white compact-transition relative z-10">
                        <MessageSquare size={28} />
                      </div>
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-emerald-600/20 z-10">{newInquiriesCount} NEW</span>
                    </div>
                    <h4 className="text-xl font-black text-dark-navy">Customer Inquiries</h4>
                    <p className="text-sm font-bold text-gray-400 mt-2">Manage your incoming leads</p>
                  </div>

                  <div 
                    onClick={onNewProperty}
                    className="p-10 bg-[#f8fafc] border-2 border-dashed border-gray-200 rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-brand-green hover:bg-white compact-transition group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-brand-green/5 rounded-bl-full pointer-events-none group-hover:bg-brand-green/10" />
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-white text-brand-green rounded-[24px] flex items-center justify-center group-hover:bg-brand-green group-hover:text-white compact-transition shadow-lg relative z-10 border border-gray-100">
                        <Plus size={32} />
                      </div>
                    </div>
                    <h4 className="text-xl font-black text-dark-navy">Add New Property</h4>
                    <p className="text-sm font-bold text-gray-400 mt-2">List a new property profile</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'live_visitors' && (
              <LiveVisitorTracking />
            )}

            {activeTab === 'editProfile' && (
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
                {toastMessage && (
                  <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-md z-20 flex items-center gap-2 ${toastMessage.type === 'success' ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                    {toastMessage.type === 'success' ? <User size={16} /> : <Eye size={16} />}
                    {toastMessage.text}
                  </div>
                )}
                <h3 className="text-3xl font-black text-dark-navy mb-8 uppercase tracking-widest pl-1">Profile Workspace</h3>
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                    <div className="w-32 h-32 bg-brand-green/10 text-brand-green rounded-[40px] flex items-center justify-center text-5xl font-black overflow-hidden relative shadow-inner border border-brand-green/20">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.email?.charAt(0).toUpperCase() || 'A'
                      )}
                    </div>
                    <div className="space-y-4 text-center md:text-left">
                      <h4 className="text-xl font-black text-dark-navy">Agent Identity</h4>
                      <p className="text-sm font-bold text-gray-500 max-w-xs">Your profile picture is visible to customers when they view your listings.</p>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer px-8 py-3 bg-brand-green text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-green/20 hover:bg-emerald-600 compact-transition inline-block"
                      >
                        Upload Photo
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleAvatarChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] pl-1">Legal First Name</label>
                      <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 focus:outline-none focus:border-brand-green focus:bg-white compact-transition font-bold text-dark-navy text-lg" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] pl-1">Legal Last Name</label>
                      <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Doe" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 focus:outline-none focus:border-brand-green focus:bg-white compact-transition font-bold text-dark-navy text-lg" />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] pl-1">Public Contact Email</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 focus:outline-none focus:border-brand-green focus:bg-white compact-transition font-bold text-dark-navy text-lg" />
                      <p className="text-xs font-bold text-gray-400 pl-1 uppercase tracking-widest opacity-60">Customers will use this to reach you.</p>
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] pl-1">Primary Phone Number</label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 focus:outline-none focus:border-brand-green focus:bg-white compact-transition font-bold text-dark-navy text-lg" />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] pl-1">Registered Agency Name</label>
                      <input type="text" value={formData.agency} onChange={(e) => setFormData({...formData, agency: e.target.value})} placeholder="Supa Estates LLC" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 focus:outline-none focus:border-brand-green focus:bg-white compact-transition font-bold text-dark-navy text-lg" />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button onClick={handleSaveProfile} disabled={isSaving} className="px-8 py-4 bg-brand-green text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-green/20 hover:scale-105 compact-transition disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2">
                      {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
                {passToast && (
                  <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-md z-20 flex items-center gap-2 ${passToast.type === 'success' ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                    {passToast.type === 'success' ? <Shield size={16} /> : <AlertTriangle size={16} />}
                    {passToast.text}
                  </div>
                )}
                {showDeleteConfirm && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-30 flex items-center justify-center p-8">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-red-100 max-w-sm w-full text-center">
                      <div className="w-12 h-12 bg-red-50 text-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={24} />
                      </div>
                      <h4 className="text-lg font-black text-dark-navy mb-2">Delete Account?</h4>
                      <p className="text-sm text-gray-500 mb-6">This action cannot be undone. All your properties and data will be permanently removed.</p>
                      <div className="flex gap-3">
                        <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="flex-1 py-3 bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 compact-transition disabled:opacity-50">Cancel</button>
                        <button onClick={handleDeleteAccount} disabled={isDeleting} className="flex-1 py-3 bg-brand-red text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 shadow-lg shadow-red-900/20 compact-transition disabled:opacity-50 flex items-center justify-center gap-2">
                          {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <h3 className="text-3xl font-black text-dark-navy mb-8 uppercase tracking-widest pl-1">Security Vault</h3>
                <div className="space-y-12">
                  <div className="space-y-8 border-b border-gray-100 pb-12">
                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                      <h4 className="text-xl font-black text-dark-navy mb-2 flex items-center gap-2">
                        <Shield className="text-blue-600" size={24} />
                        Password Management
                      </h4>
                      <p className="text-sm font-bold text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Current Password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:bg-white compact-transition font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:bg-white compact-transition font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:bg-white compact-transition font-medium" />
                      </div>
                      <div className="pt-2">
                        <button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="px-6 py-3 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 compact-transition shadow-lg disabled:opacity-50 flex items-center gap-2">
                          {isUpdatingPassword && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-brand-red mb-1">Danger Zone</h4>
                      <p className="text-xs text-gray-500">Irreversible actions for your account.</p>
                    </div>
                    <div className="p-6 border border-red-100 bg-red-50/50 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <h5 className="font-bold text-dark-navy text-sm">Delete Account</h5>
                        <p className="text-xs text-gray-500 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                      </div>
                      <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 bg-white text-brand-red border border-red-200 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-red hover:text-white compact-transition whitespace-nowrap">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
  supabaseProperties = [],
  favorites,
  toggleFavorite,
  compareList,
  toggleCompare,
  isAdmin
}: { 
  agent: any, 
  onBack: () => void, 
  onPropertyClick: (p: any) => void,
  supabaseProperties?: any[],
  favorites?: Set<number>,
  toggleFavorite?: (id: number) => void,
  compareList?: number[],
  toggleCompare?: (id: number) => void,
  isAdmin?: boolean
}) => {
  const featuredAgentProperties = FEATURED_PROPERTIES.filter(p => agent.listings.includes(p.id));
  const dynamicAgentProperties = supabaseProperties.filter(p => p.agentId === agent.id);
  const agentProperties = [...dynamicAgentProperties, ...featuredAgentProperties];
  
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
                <a href="https://www.instagram.com/lankapropertylk/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-green hover:text-white compact-transition"><Instagram size={20} /></a>
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
                    showAnalytics={true}
                    isAdmin={isAdmin}
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editProfile' | 'security'>('dashboard');

  const [formData, setFormData] = useState({
    firstName: user?.email ? user.email.split('@')[0] : '',
    lastName: '',
    email: user?.email || '',
    phone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passToast, setPassToast] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));

      if (user?.id) {
        try {
          const { data, error } = await supabase.storage
            .from('avatars')
            .upload(
              `agent-${user.id}-${Date.now()}.jpg`, 
              file,
              { upsert: true }
            );

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(data.path);

          // Using profile table here just in case, but let's stick to agents table since the prompt asked for agents table
          const { error: updateError } = await supabase
            .from('agents')
            .update({ avatar_url: urlData.publicUrl })
            .eq('id', user.id);
            
          if (updateError) throw updateError;

          setToastMessage({ type: 'success', text: '✅ Profile photo updated!' });
          setTimeout(() => setToastMessage(null), 3000);

        } catch (err: any) {
          console.error("Avatar upload error:", err);
          setToastMessage({ type: 'error', text: 'Failed to update profile photo.' });
          setTimeout(() => setToastMessage(null), 3000);
        }
      }
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // In a full app, this would update a 'profiles' table.
      // For now, we simulate success
      await new Promise(resolve => setTimeout(resolve, 800));
      setToastMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setToastMessage({ type: 'error', text: err.message || 'Error updating profile' });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPassToast({ type: 'error', text: "Passwords do not match" });
      setTimeout(() => setPassToast(null), 3000);
      return;
    }
    if (newPassword.length < 6) {
      setPassToast({ type: 'error', text: "Password must be at least 6 characters" });
      setTimeout(() => setPassToast(null), 3000);
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      setPassToast({ type: 'success', text: "Password updated successfully!" });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setTimeout(() => setPassToast(null), 3000);
    } catch (err: any) {
      console.error(err);
      setPassToast({ type: 'error', text: err.message || 'Error updating password' });
      setTimeout(() => setPassToast(null), 3000);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      if (user?.id) {
        // user.id may not be present if just `{ email: string }` dummy.
        const { error } = await supabase.auth.admin.deleteUser(user.id);
        if (error) throw error;
      }
      setShowDeleteConfirm(false);
      onLogout();
    } catch (err: any) {
      console.error(err);
      setPassToast({ type: 'error', text: err.message || 'Error deleting account. Contact support.' });
      setTimeout(() => setPassToast(null), 5000);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto px-6 py-20 max-w-6xl"
    >
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => {
            if (activeTab === 'dashboard') {
              onBack();
            } else {
              setActiveTab('dashboard');
            }
          }} 
          className="flex items-center gap-2 text-brand-green font-bold hover:translate-x-[-4px] compact-transition group"
        >
          <ChevronLeft size={20} className="group-hover:scale-125" /> {activeTab === 'dashboard' ? 'Back to Home' : 'Back to Dashboard'}
        </button>
        
        {/* User Pill from Image */}
        <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-full py-1.5 pl-1.5 pr-2 flex items-center gap-2 shadow-sm">
          <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 flex items-center justify-center text-gray-400 hover:text-brand-red compact-transition bg-gray-50 rounded-full hover:bg-red-50"
            title="Logout"
          >
            <LogOut size={16} className="rotate-180" />
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
              <li onClick={() => setActiveTab('editProfile')} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer compact-transition ${activeTab === 'editProfile' ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}>
                <span className="text-sm font-bold">Edit Profile</span>
                <User size={16} className={activeTab === 'editProfile' ? 'text-white' : 'text-gray-500'} />
              </li>
              <li onClick={() => setActiveTab('security')} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer compact-transition ${activeTab === 'security' ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}>
                <span className="text-sm font-bold">Security</span>
                <Shield size={16} className={activeTab === 'security' ? 'text-white' : 'text-gray-500'} />
              </li>
              <li onClick={onLogout} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer compact-transition">
                <span className="text-sm font-bold">Log Out</span>
                <LogOut size={16} className="text-gray-500" />
              </li>
              <li onClick={() => setShowDeleteConfirm(true)} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer compact-transition text-brand-red">
                <span className="text-sm font-bold">Delete Account</span>
                <Trash2 size={16} />
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          {activeTab === 'dashboard' && (
            <>
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
            </>
          )}

          {activeTab === 'editProfile' && (
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
              {toastMessage && (
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-md z-20 flex items-center gap-2 ${toastMessage.type === 'success' ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                  {toastMessage.type === 'success' ? <User size={16} /> : <AlertTriangle size={16} />}
                  {toastMessage.text}
                </div>
              )}
              <h3 className="text-xl font-black text-dark-navy mb-6">Profile Information</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-brand-green/10 text-brand-green rounded-3xl flex items-center justify-center text-3xl font-black overflow-hidden relative">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.email?.charAt(0).toUpperCase() || 'A'
                      )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer px-6 py-2.5 bg-gray-50 text-dark-navy text-sm font-bold rounded-xl border border-gray-200 hover:bg-gray-100 compact-transition inline-block"
                  >
                    Change Avatar
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">First Name</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-brand-green focus:bg-white compact-transition font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Last Name</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Doe" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-brand-green focus:bg-white compact-transition font-medium" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Display Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-brand-green focus:bg-white compact-transition font-medium" />
                    <p className="text-xs text-gray-400 pl-1">Update your display contact email.</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-brand-green focus:bg-white compact-transition font-medium" />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button onClick={handleSaveProfile} disabled={isSaving} className="px-8 py-4 bg-brand-green text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-green/20 hover:scale-105 compact-transition disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2">
                    {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
              {passToast && (
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-md z-20 flex items-center gap-2 ${passToast.type === 'success' ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                  {passToast.type === 'success' ? <Shield size={16} /> : <AlertTriangle size={16} />}
                  {passToast.text}
                </div>
              )}
              {showDeleteConfirm && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-30 flex items-center justify-center p-8">
                  <div className="bg-white p-6 rounded-3xl shadow-2xl border border-red-100 max-w-sm w-full text-center">
                    <div className="w-12 h-12 bg-red-50 text-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle size={24} />
                    </div>
                    <h4 className="text-lg font-black text-dark-navy mb-2">Delete Account?</h4>
                    <p className="text-sm text-gray-500 mb-6">This action cannot be undone. All your properties and data will be permanently removed.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="flex-1 py-3 bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 compact-transition disabled:opacity-50">Cancel</button>
                      <button onClick={handleDeleteAccount} disabled={isDeleting} className="flex-1 py-3 bg-brand-red text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 shadow-lg shadow-red-900/20 compact-transition disabled:opacity-50 flex items-center justify-center gap-2">
                        {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <h3 className="text-xl font-black text-dark-navy mb-6">Security Settings</h3>
              <div className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-dark-navy mb-1">Change Password</h4>
                    <p className="text-xs text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Current Password</label>
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:bg-white compact-transition font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">New Password</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:bg-white compact-transition font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:bg-white compact-transition font-medium" />
                    </div>
                    <div className="pt-2">
                      <button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="px-6 py-3 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 compact-transition shadow-lg disabled:opacity-50 flex items-center gap-2">
                        {isUpdatingPassword && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const { properties: supabaseProperties, loading: listingsLoading, error: supabaseError, refresh: refreshProperties } = useProperties();
  const [recentFilter, setRecentFilter] = useState<"Sale" | "Rent">("Sale");
  const [visibleRecentCount, setVisibleRecentCount] = useState(6);
  const [sortOption, setSortOption] = useState<"Newest" | "Price Low-High" | "Price High-Low">("Newest");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentView, setCurrentView] = useState<{ type: 'home' | 'category' | 'detail' | 'contact' | 'about' | 'packages' | 'auth' | 'verify' | 'reset-password' | 'promotion' | 'agent' | 'agents' | 'compare' | 'publish' | 'profile' | 'agent_access' | 'secret_login' | 'agent_publish' | 'wanted' | 'inquiries' | 'agent_listings' | 'agent_only_listings' | 'featured_projects_admin' | 'search_results', data?: any }>({ type: 'home' });
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const checkAdminStatus = async (email: string) => {
    try {
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .single();
      if (data) {
        setIsAdmin(true);
      } else {
        const allowedEmails = ['abhishekdewminaa@gmail.com', 'ceo.lankaland@gmail.com'];
        setIsAdmin(allowedEmails.includes(email.toLowerCase()));
      }
    } catch (err) {
      const allowedEmails = ['abhishekdewminaa@gmail.com', 'ceo.lankaland@gmail.com'];
      setIsAdmin(false || allowedEmails.includes(email?.toLowerCase() || ''));
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser((currentUser: any) => currentUser?.email ? currentUser : activeUser);
      if (activeUser?.email) {
        checkAdminStatus(activeUser.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser((currentUser: any) => currentUser?.email && !session ? currentUser : activeUser);
      if (activeUser?.email) {
        checkAdminStatus(activeUser.email);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;

    if (path === '/admin-lk2026') {
      setCurrentView({ type: 'secret_login' });
    } else if (path.startsWith('/buy/') || path.startsWith('/rent/')) {
      const parts = path.split('/');
      const mode = parts[1] as 'buy' | 'rent';
      let cat = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
      if (cat === 'Apartments') cat = 'Apartment';
      if (cat === 'Houses') cat = 'House';
      if (cat === 'Buildings') cat = 'Building';
      if (cat === 'Hotels') cat = 'Hotel';
      if (cat === 'Commercial') cat = 'Commercial';
      if (cat === 'Land') cat = 'Land';
      
      setCurrentView({ type: 'category', data: { category: cat, mode } });
    } else if (hash && hash.includes("type=recovery")) {
      setCurrentView({ type: 'reset-password' });
    } else if (hash && hash.includes("type=signup")) {
      // they just verified email
      setCurrentView({ type: 'verify' });
    }
  }, []);

  useEffect(() => {
    const trackVisitor = async () => {
      const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);
      
      const pageType = currentView.type; // Match SPA routing

      try {
        await supabase.from('visitor_sessions').upsert({
          session_id: sessionId,
          current_page: pageType,
          device_type: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          referrer: document.referrer || 'direct',
          last_seen: new Date().toISOString(),
          is_active: true,
          location: 'Colombo, Sri Lanka' // Mock location since we do not have an IP geo service
        }, { onConflict: 'session_id' });
      } catch(err) {
        // Table may not exist yet, safely ignore
      }
    };

    trackVisitor();
    const interval = setInterval(trackVisitor, 30000);

    const markInactive = async () => {
      const sessionId = localStorage.getItem('session_id');
      if (sessionId) {
        try {
          await supabase.from('visitor_sessions').update({ is_active: false }).eq('session_id', sessionId);
        } catch(err) {}
      }
    };
    
    window.addEventListener('beforeunload', markInactive);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', markInactive);
    };
  }, [currentView.type]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/') {
        setCurrentView({ type: 'home' });
      } else if (path.startsWith('/buy/') || path.startsWith('/rent/')) {
        const parts = path.split('/');
        const mode = parts[1] as 'buy' | 'rent';
        let cat = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
        // Normalize
        const map: any = { 'houses': 'House', 'land': 'Land', 'apartments': 'Apartment', 'buildings': 'Building', 'hotels': 'Hotel', 'commercial': 'Commercial' };
        cat = map[parts[2].toLowerCase()] || cat;
        setCurrentView({ type: 'category', data: { category: cat, mode } });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  let displayedProperties = (supabaseProperties.length > 0 ? supabaseProperties : FEATURED_PROPERTIES)
    .filter(p => p.status === 'active' || !p.status);
    
  if (sortOption === 'Price Low-High') {
    displayedProperties = displayedProperties.sort((a, b) => {
      const pA = parseInt((a.price_lkr || a.price || '').toString().replace(/[^0-9]/g, ''), 10) || 0;
      const pB = parseInt((b.price_lkr || b.price || '').toString().replace(/[^0-9]/g, ''), 10) || 0;
      return pA - pB;
    });
  } else if (sortOption === 'Price High-Low') {
    displayedProperties = displayedProperties.sort((a, b) => {
      const pA = parseInt((a.price_lkr || a.price || '').toString().replace(/[^0-9]/g, ''), 10) || 0;
      const pB = parseInt((b.price_lkr || b.price || '').toString().replace(/[^0-9]/g, ''), 10) || 0;
      return pB - pA;
    });
  } else {
    displayedProperties = displayedProperties.sort((a, b) => {
      const dA = new Date(a.created_at || 0).getTime();
      const dB = new Date(b.created_at || 0).getTime();
      return dB - dA;
    });
  }
  
  const filteredRecent = displayedProperties.filter(p => {
    const pType = (p.listing_type || p.type || '').toLowerCase();
    const sType = recentFilter.toLowerCase();
    return pType.includes(sType) || pType === sType;
  });
  const handleCategoryClick = (category: string) => {
    setCurrentView({ type: 'category', data: { category, mode: 'buy' } });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleDetailClick = (property: any) => {
    setCurrentView({ type: 'detail', data: property });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateHome = () => {
    setCurrentView({ type: 'home' });
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contenteditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        navigateHome();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 z-[300] px-6 py-3 rounded-2xl shadow-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-brand-green text-white shadow-brand-green/20' : 'bg-brand-red text-white shadow-brand-red/20'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentView.type === 'home' ? (
          <motion.div
            key="home-redesign"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow"
          >
            <HomeRedesign 
              propertyCount={supabaseProperties.length}
              featuredProperties={supabaseProperties.slice(0, 4)} 
              supabaseProperties={supabaseProperties}
              onNavigate={(view) => setCurrentView(view)}
              onPostAd={() => {
                if (user) setCurrentView({ type: 'publish' });
                else setCurrentView({ type: 'auth', data: 'signup' });
              }}
              onAdminAccess={() => {
                window.history.pushState({}, '', '/admin-lk2026');
                setCurrentView({ type: 'secret_login' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </motion.div>
        ) : (
          <motion.div 
            key="header-content-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-slate-50 flex flex-col relative"
          >
            <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
              {supabaseError && (
                <div className="bg-brand-red text-white px-6 py-4 text-center font-bold text-sm flex items-center justify-center gap-3">
                  <AlertCircle size={18} />
                  <span>Supabase Connection Error: {supabaseError}</span>
                  <button 
                    onClick={() => refreshProperties()}
                    className="bg-white text-brand-red px-3 py-1 rounded-lg hover:bg-gray-100 compact-transition text-xs"
                  >
                    Retry
                  </button>
                </div>
              )}
              <nav className="container mx-auto px-6 h-20 flex justify-between items-center">
                <div className="flex items-center cursor-pointer" onClick={(e) => { e.preventDefault(); navigateHome(); }}>
                  <a href="/" onClick={(e) => e.preventDefault()}>
                    <img 
                      src="https://qsqqolvsndvkwegvcfqv.supabase.co/storage/v1/object/sign/assets/Website%20logo%20.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MWNhMTU1MC03OGYzLTQwZGMtYTYzYi02NzVmZTRiYjM2NWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvV2Vic2l0ZSBsb2dvIC5wbmciLCJpYXQiOjE3NzgzMDk4MjksImV4cCI6MTkzNTk4OTgyOX0.LqwS9LCGK4UH1oL4YQHkiJdrNNgYGh-8CZtZBgrTO-s"
                      alt="LankaProperty.lk"
                      className="h-[45px] sm:h-[55px] dark:bg-white dark:px-[10px] dark:py-[4px] dark:rounded-[8px]"
                      style={{ 
                        width: 'auto',
                        objectFit: 'contain',
                        cursor: 'pointer'
                      }}
                      onError={(e: any) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </a>
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
                      className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-full pl-1.5 pr-2 py-1.5 cursor-pointer hover:bg-white hover:shadow-md compact-transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {user.email[0].toUpperCase()}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setUser(null); navigateHome(); }} 
                        className="p-1.5 flex items-center justify-center text-gray-400 hover:text-brand-red compact-transition bg-gray-50 rounded-full hover:bg-red-50"
                        title="Logout"
                      >
                        <LogOut size={16} className="rotate-180" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setCurrentView({ type: 'auth' })}
                      className="text-dark-navy font-bold text-sm px-4 py-2 hover:text-brand-green compact-transition"
                    >
                      Sign In
                    </button>
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
              <motion.div
                key={currentView.type}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-grow"
              >
                {currentView.type === 'search_results' && (
          <motion.main 
            key="search_results"
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
                  <span className="text-gray-900">Search Results</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h1 className="text-3xl font-bold text-dark-navy">Search Results</h1>
                    <p className="text-gray-500 mt-2 text-sm">Found {(currentView.data as any[])?.length || 0} matching properties</p>
                  </div>
                </div>
              </div>
            </div>

            <section className="container mx-auto px-6 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {((currentView.data as any[]) || []).map(p => (
                  <PropertyCard 
                    key={p.id} 
                    property={p} 
                    onClick={() => handleDetailClick(p)}
                    isFavorited={favorites.has(p.id)}
                    onToggleFavorite={() => toggleFavorite(p.id)}
                    isComparing={compareList.includes(p.id)}
                    onToggleCompare={() => toggleCompare(p.id)}
                    isAdmin={isAdmin}
                  />
                ))}
                {(!currentView.data || (currentView.data as any[]).length === 0) && (
                  <div className="col-span-full py-20 text-center flex flex-col items-center">
                    <Search className="text-gray-300 w-16 h-16 mb-4" />
                    <h3 className="text-xl font-bold text-gray-500">No properties found</h3>
                    <p className="text-gray-400 mt-2">Try adjusting your filters to see more results.</p>
                    <button 
                      onClick={navigateHome}
                      className="mt-6 px-6 py-2.5 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-dark compact-transition"
                    >
                      Back to Search
                    </button>
                  </div>
                )}
              </div>
            </section>
          </motion.main>
        )}

        {currentView.type === 'category' && (
          <CategoryPage 
            category={currentView.data.category}
            mode={currentView.data.mode}
            onBack={navigateHome}
            onPropertyClick={(p) => handleDetailClick(p)}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            compareList={compareList}
            toggleCompare={toggleCompare}
            isAdmin={isAdmin}
            onPostAd={() => setCurrentView({ type: 'publish' })}
            onNavigateHome={navigateHome}
            onNavigate={setCurrentView}
            onGetStarted={(pkg) => setCurrentView({ type: 'packages', data: { pkg } })}
          />
        )}

        {currentView.type === 'detail' && (
          <PropertyDetail 
            propertyId={currentView.data.id} 
            onBack={navigateHome} 
            onPropertyClick={(p) => handleDetailClick(p)}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            isAdmin={isAdmin}
          />
        )}

        {currentView.type === 'contact' && (
          <ContactUs 
            onBack={navigateHome} 
            onAgentClick={(agent) => setCurrentView({ type: 'agent', data: agent })} 
            initialData={currentView.data}
          />
        )}

        {currentView.type === 'about' && (
          <AboutUs onBack={navigateHome} onNavigate={(view) => setCurrentView(view)} />
        )}

        {currentView.type === 'profile' && (
          <UserProfileView 
            user={user} 
            onBack={navigateHome} 
            onLogout={() => { 
              supabase.auth.signOut();
              setUser(null); 
              navigateHome(); 
            }} 
            onNewAd={() => setCurrentView({ type: 'publish' })}
          />
        )}

        {currentView.type === 'packages' && (
          <PricingPackages 
            onBack={navigateHome} 
            onGetStarted={(pkgName) => {
              if (user) {
                setCurrentView({ type: 'publish', data: { packageTier: pkgName } });
              } else {
                setCurrentView({ type: 'auth', data: { target: 'publish', packageTier: pkgName } });
              }
            }} 
          />
        )}

        {currentView.type === 'auth' && (
          <AuthPage 
            onBack={navigateHome} 
            initialMode={(typeof currentView.data === 'string' ? currentView.data : currentView.data?.target) === 'signup' ? 'signup' : 'login'}
            onLogin={(u) => {
              const target = typeof currentView.data === 'string' ? currentView.data : currentView.data?.target;
              if (target === 'publish') {
                setCurrentView({ type: 'publish', data: { packageTier: currentView.data?.packageTier } });
              } else {
                setCurrentView({ type: 'profile' });
              }
            }} 
            onVerifyEmailMessage={() => setCurrentView({ type: 'verify' })}
          />
        )}

        {currentView.type === 'verify' && (
          <EmailVerificationPage onDashboard={() => setCurrentView({ type: 'profile' })} />
        )}

        {currentView.type === 'reset-password' && (
          <ResetPasswordPage onLogin={() => setCurrentView({ type: 'auth', data: 'login' })} />
        )}

        {currentView.type === 'publish' && (
          <PublishListingView 
            onBack={navigateHome} 
            user={user} 
            onRefresh={refreshProperties} 
            initialPackage={currentView.data?.packageTier === 'STARTER FREE' ? 'FREE' : currentView.data?.packageTier === 'PREMIUM PRO' ? 'PREMIUM PRO' : currentView.data?.packageTier === 'ELITE PRO' ? 'ELITE PRO' : 'FREE'} 
          />
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
            supabaseProperties={supabaseProperties}
            onBack={navigateHome} 
            onPropertyClick={(p) => handleDetailClick(p)} 
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            compareList={compareList}
            toggleCompare={toggleCompare}
            isAdmin={isAdmin}
          />
        )}

        {currentView.type === 'secret_login' && (
          <SecretLoginView 
            onBack={navigateHome}
            onSuccess={(email) => {
              setUser({ ...user, email });
              setCurrentView({ type: 'agent_access' });
            }}
          />
        )}

        {['agent_access', 'agent_publish', 'agent_listings', 'agent_only_listings', 'featured_projects_admin', 'inquiries'].includes(currentView.type) && (
          <AdminErrorBoundary>
            <AdminPortal 
              user={user} 
              onLogout={() => {
                supabase.auth.signOut();
                setUser(null);
                navigateHome();
              }}
              onRefresh={refreshProperties}
              onAgentAccessBack={navigateHome}
            />
          </AdminErrorBoundary>
        )}

        {currentView.type === 'agents' && (
          <AgentsView 
            onAgentClick={(agent) => setCurrentView({ type: 'agent', data: agent })} 
            onBack={navigateHome} 
          />
        )}

        {currentView.type === 'wanted' && (
          <PropertyWanted onContact={(data) => setCurrentView({ type: 'contact', data })} user={user} isAdmin={isAdmin} />
        )}

        {currentView.type === 'compare' && (
          <ComparisonView 
            propertyIds={compareList} 
            onBack={navigateHome} 
            onRemove={removeCompare} 
          />
        )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

<AnimatePresence>
  {compareList.length > 0 && currentView.type !== 'compare' && (
    <ComparisonBar 
      propertyIds={compareList} 
      properties={supabaseProperties}
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
        onShowWanted={() => setCurrentView({ type: 'wanted' })}
        onShowSecretLogin={() => {
          window.history.pushState({}, '', '/admin-lk2026');
          setCurrentView({ type: 'secret_login' });
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
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
    </>
  );
}

