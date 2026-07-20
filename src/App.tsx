import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Phone, 
  Mail, 
  MessageSquare, 
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
  Clock, 
  Eye, 
  Copy, 
  Wifi, 
  Tv, 
  Wind, 
  Shield, 
  Check, 
  Trash2, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Activity, 
  Trees, 
  Save, 
  LogOut, 
  X, 
  Info,
  Building2,
  Building,
  LandPlot,
  Hotel
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Toaster, toast } from 'react-hot-toast';
import { Navbar } from "./components/home/Navbar";
import { Footer } from "./components/home/Footer";
import { HomeRedesign } from "./components/home/HomeRedesign";
import { PropertyDetail } from "./components/PropertyDetail";
import AdminPortal from "./components/admin/AdminPortal";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdvertisedPackages } from "./components/AdvertisedPackages";
import PropertyWanted from "./components/PropertyWanted";
import { Feedback } from "./components/Feedback";
import CategoryPage from "./components/CategoryPage";
import AgentPage from "./components/AgentPage";
import { LandsPortfolio } from "./components/home/LandsPortfolio";
import { PostPropertyPage } from "./components/PostPropertyPage";
import { AgentPostPropertyPage } from "./components/AgentPostPropertyPage";
import { AgentRegisterPage } from "./components/AgentRegisterPage";
import { AgentLoginPage } from "./components/AgentLoginPage";
import { AgentDashboardPage } from "./components/AgentDashboardPage";
import { OwnerRegisterPage } from "./components/OwnerRegisterPage";
import { OwnerLoginPage } from "./components/OwnerLoginPage";
import { OwnerPaymentPage } from "./components/OwnerPaymentPage";
import { OwnerPaymentSuccessPage } from "./components/OwnerPaymentSuccessPage";
import { OwnerDashboardPage } from "./components/OwnerDashboardPage";
import PublicBlog from "./components/public/PublicBlog";
import PublicBlogPost from "./components/public/PublicBlogPost";
import { supabase } from "./supabaseClient";
import { removeSinhala, slugify, safeLocalStorage } from "./utils/safeUtils";

// --- MOCK CONSTANTS & STABILIZED UTILS ---
const LKR_USD_RATE = 300;
const LKR_EUR_RATE = 325;

const formatPerchOrSqft = (size: string, category: string) => {
  if (category.toLowerCase() === "land") {
    return size.toLowerCase().includes("perch") ? size : `${size} Perches`;
  }
  return size.toLowerCase().includes("sqft") || size.toLowerCase().includes("sq ft") ? size : `${size} sqft`;
};

const formatPriceLKR = (amount: number) => {
  if (amount >= 10000000) {
    return `Rs. ${(amount / 10000000).toFixed(2)} Crore`;
  } else if (amount >= 100000) {
    return `Rs. ${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `Rs. ${amount.toLocaleString()}`;
};

// Map Districts by Province for elegant selector grouping
const SRI_LANKA_DISTRICTS = [
  { name: 'Colombo', province: 'Western' },
  { name: 'Gampaha', province: 'Western' }, 
  { name: 'Kalutara', province: 'Western' },
  { name: 'Kandy', province: 'Central' },
  { name: 'Matale', province: 'Central' },
  { name: 'Nuwara Eliya', province: 'Central' },
  { name: 'Galle', province: 'Southern' },
  { name: 'Matara', province: 'Southern' },
  { name: 'Hambantota', province: 'Southern' },
  { name: 'Jaffna', province: 'Northern' },
  { name: 'Kilinochchi', province: 'Northern' },
  { name: 'Mannar', province: 'Northern' },
  { name: 'Vavuniya', province: 'Northern' },
  { name: 'Mullaitivu', province: 'Northern' },
  { name: 'Batticaloa', province: 'Eastern' },
  { name: 'Ampara', province: 'Eastern' },
  { name: 'Trincomalee', province: 'Eastern' },
  { name: 'Kurunegala', province: 'North Western' },
  { name: 'Puttalam', province: 'North Western' },
  { name: 'Anuradhapura', province: 'North Central' },
  { name: 'Polonnaruwa', province: 'North Central' },
  { name: 'Badulla', province: 'Uva' },
  { name: 'Monaragala', province: 'Uva' },
  { name: 'Ratnapura', province: 'Sabaragamuwa' },
  { name: 'Kegalle', province: 'Sabaragamuwa' }
];

const INITIAL_PROPERTIES = [
  {
    id: 1,
    title: "Luxury Oceanfront Horizon Penthouse",
    location: "Kollupitiya, Colombo 03",
    district: "Colombo",
    city: "Colombo 03",
    priceLkr: 145000000,
    type: "Sale",
    category: "Apartment",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800"
    ],
    bedrooms: 3,
    bathrooms: 3,
    size: "2,200 sqft",
    description: "Step into modern luxury. This architecturally masterpieced oceanfront penthouse on the 18th floor defines luxury coastal living. Complete with smart automation, infinity balconies with sweeping views over the Indian Ocean, premium Italian granite finishings, and high-speed multi-zone centralized air conditioning. Enjoy the highly coveted golden hours of Colombo in ultimate serenity.",
    views: 1845,
    isFeatured: true,
    agentName: "Deshani Kaushalya",
    agentPhone: "+94 71 555 1234",
    agentEmail: "deshani@lankaproperty.lk",
    agentImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    amenities: ["24/7 Security", "Swimming Pool", "High-Speed Wifi", "Air Conditioning", "Parking Area", "Smart TV", "Hot Water", "Gym Access"],
    createdAt: "2026-06-18T10:00:00.000Z"
  },
  {
    id: 2,
    title: "Prime Residential Land Plot",
    location: "Kahahena Road, Malabe",
    district: "Colombo",
    city: "Malabe",
    priceLkr: 1850000, // per perch
    type: "Sale",
    category: "Land",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800"
    ],
    size: "15 Perches",
    description: "Highly valuable residential land located in the rapidly growing technology zone of Malabe. This prime plot is situated within an upscale gated residential community with a wide carpeted 30-foot roadway access. Fully secured with pipe-borne water, three-phase electricity, and complete clearance documents on hand. Minutes away from SLIIT, Horizon College, and the Outer Circular Expressway interchange.",
    views: 1290,
    isFeatured: true,
    agentName: "Lion Lalith Ranatunga",
    agentPhone: "+94 77 395 1560",
    agentEmail: "lalith@lankaproperty.lk",
    agentImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
    amenities: ["24/7 Security", "Electricity Infrastructure", "Carpeted Roads", "Drainage Systems"],
    createdAt: "2026-06-20T14:30:00.000Z"
  },
  {
    id: 3,
    title: "Colonial Holiday Hills Bungalow",
    location: "Gregory's Road, Nuwara Eliya",
    district: "Nuwara Eliya",
    city: "Nuwara Eliya",
    priceLkr: 78000000,
    type: "Sale",
    category: "House",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800"
    ],
    bedrooms: 4,
    bathrooms: 3,
    size: "3,200 sqft",
    description: "Immerse yourself in Nuwara Eliya's iconic cool climate inside this beautifully preserved British-style colonial bungalow. Perched alongside the scenic border of Lake Gregory, this timeless property features dynamic open fireplaces, pristine polished teak floorboards, beautifully landscaped private gardens with hydrangeas, and wide multi-elevation glass windows displaying endless tea plantation views. Fully fitted to serve as an boutique luxury guest house or high-yield holiday retreat.",
    views: 940,
    isFeatured: false,
    agentName: "Lion Lalith Ranatunga",
    agentPhone: "+94 77 395 1560",
    agentEmail: "lalith@lankaproperty.lk",
    agentImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
    amenities: ["Hot Water", "Fireplace", "High-Speed Wifi", "Parking Area", "Smart TV", "Private Garden Area"],
    createdAt: "2026-06-15T08:15:00.000Z"
  },
  {
    id: 4,
    title: "Beachfront Bliss Private Villa",
    location: "Unawatuna Coastline, Galle",
    district: "Galle",
    city: "Galle",
    priceLkr: 125000000,
    type: "Sale",
    category: "Villa",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"
    ],
    bedrooms: 5,
    bathrooms: 5,
    size: "4,500 sqft",
    description: "An exceptional ultra-luxury beachfront sanctuary located on the golden sandy beaches of Galle. Designed by a world-recognized Sri Lankan architect, this masterpiece seamlessly blends interior comfort with outdoor tropical vistas. Features include a private 40ft oceanview swimming pool, vast open-air lounge pavilions, modern chef's kitchen, private solar array energy infrastructure, and private access gate leading onto the beach. Exceptional rental history as a luxury destination rental.",
    views: 2470,
    isFeatured: true,
    agentName: "Chamath Wickramasooriya",
    agentPhone: "+94 77 123 4567",
    agentEmail: "chamath@lankaproperty.lk",
    agentImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    amenities: ["24/7 Security", "Swimming Pool", "High-Speed Wifi", "Air Conditioning", "Private Beach Access", "Hot Water", "Solar Powered Grid", "Parking Area"],
    createdAt: "2026-06-22T05:00:00.000Z"
  },
  {
    id: 5,
    title: "Spacious Multi-Level Family Residence",
    location: "Yakkala Rd, Gampaha",
    district: "Gampaha",
    city: "Gampaha",
    priceLkr: 38500000,
    type: "Sale",
    category: "House",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=80&w=800"
    ],
    bedrooms: 4,
    bathrooms: 3,
    size: "2,500 sqft",
    description: "Stylishly completed two-story modern house sitting on 12 perches of valuable land in the heart of Gampaha. Built utilizing premium materials and double-layer thermal bricks. It features a spacious open roof terrace with city views, secure automatic double roller doors, a contemporary pantry set with mahogany cupboards, and an advanced security alarm system. Ideal layout for families seeking security, spacious yards, and direct proximity to premier schools.",
    views: 750,
    isFeatured: false,
    agentName: "Deshani Kaushalya",
    agentPhone: "+94 71 555 1234",
    agentEmail: "deshani@lankaproperty.lk",
    agentImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    amenities: ["24/7 Security", "Home Security Alarms", "Parking Area", "Mahogany Pantry", "Hot Water", "Roof Deck"],
    createdAt: "2026-06-19T11:45:00.000Z"
  },
  {
    id: 6,
    title: "Luxury Beachfront Guest House for Rent",
    location: "Ocean Pathway, Negombo",
    district: "Gampaha",
    city: "Negombo",
    priceLkr: 450000, // per month
    type: "Rent",
    category: "Hotel",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800"
    ],
    bedrooms: 8,
    bathrooms: 8,
    size: "6,000 sqft",
    description: "Fully operational boutique beachfront guesthouse with 8 fully air-conditioned, beautifully furnished guest rooms. Located on the bustling tourist strip of Negombo beach road. Fitted with a stylish lobby lounge, functional commercial kitchen, rooftop infinity view bar, and swimming pool. This offers a magnificent ready-to-run turn-key commercial lease option for seasoned hospitality operators.",
    views: 1110,
    isFeatured: true,
    agentName: "Barnad Fernando",
    agentPhone: "+94 77 987 6543",
    agentEmail: "barnad@lankaproperty.lk",
    agentImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    amenities: ["24/7 Security", "Swimming Pool", "High-Speed Wifi", "Air Conditioning", "Commercial Kitchen", "Hot Water", "Bar Area", "Full Licensing Support"],
    createdAt: "2026-06-21T09:20:00.000Z"
  },
  {
    id: 7,
    title: "Vast High-Ceiling Warehouse Facility",
    location: "Mabola Industrial Ave, Wattala",
    district: "Gampaha",
    city: "Wattala",
    priceLkr: 250000, // per month
    type: "Lease",
    category: "Building",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800"
    ],
    size: "8,500 sqft",
    description: "Premium industrial grade warehouse space boasting 28ft height clearances. Architecturally designed to simplify container loading, heavy machine assembly, and bulk cargo distribution. Equipped with 3-phase high amperage power connections, fully built management offices on a mezzanine floor, 24-hour video surveillance systems, and robust reinforced concrete multi-ton load flooring. Situated perfectly with fast highway connections to both Colombo Harbour and Katunayake Bandaranaike Airport.",
    views: 520,
    isFeatured: false,
    agentName: "Barnad Fernando",
    agentPhone: "+94 77 987 6543",
    agentEmail: "barnad@lankaproperty.lk",
    agentImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    amenities: ["24/7 Watch Guard", "3-Phase Power System", "Container Loading Dock", "CCTV Cameras Monitoring", "Spacious Mezzanine Office"],
    createdAt: "2026-06-12T13:10:00.000Z"
  }
];

const AMENITIES_POOL = [
  "24/7 Security", "Swimming Pool", "High-Speed Wifi", "Air Conditioning", 
  "Parking Area", "Smart TV", "Hot Water", "Solar Power Grid", "CCTV Monitoring"
];

const resolveDuplicateSlugs = (props: any[]) => {
  const slugCounts: { [key: string]: number } = {};
  return props.map(p => {
    let slug = p.slug || slugify(p.title || p.listing_title || "property");
    if (!slug) slug = "property";
    
    if (slugCounts[slug] !== undefined) {
      slugCounts[slug]++;
      p.slug = `${slug}-${slugCounts[slug]}`;
    } else {
      slugCounts[slug] = 1;
      p.slug = slug;
    }
    return p;
  });
};

const unifyProperty = (p: any) => {
  const title = removeSinhala(p.listing_title || p.title || "");
  const price = Number(p.price_lkr || p.priceLkr || p.price || 0);
  const type = p.listing_type === 'For Rent' || p.type === 'Rent' ? 'Rent' : 'Sale';
  const category = p.property_category || p.category || "House";
  const bedrooms = p.rooms !== undefined ? p.rooms : (p.bedrooms !== undefined ? p.bedrooms : 0);
  const imagesArray = Array.isArray(p.images) ? p.images : (p.images ? [p.images] : (p.image ? [p.image] : []));
  const image = imagesArray[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
  const size = p.land_area || p.floor_area || p.size || 'N/A';
  const desc = removeSinhala(p.property_description || p.description || '');
  const slug = p.slug || slugify(title);

  return {
    ...p,
    id: p.id,
    title,
    listing_title: title,
    slug,
    location: p.location || (p.city && p.district ? `${p.city}, ${p.district}` : ''),
    district: p.district || 'Colombo',
    city: p.city || 'Colombo 03',
    priceLkr: price,
    price_rkr: price,
    price_lkr: price,
    type,
    listing_type: type === 'Rent' ? 'For Rent' : 'For Sale',
    category,
    property_category: category,
    image,
    images: imagesArray.length > 0 ? imagesArray : [image],
    bedrooms,
    rooms: bedrooms,
    bathrooms: p.bathrooms || 0,
    size,
    land_area: size,
    description: desc,
    property_description: desc,
    views: p.views_count || p.views || 75,
    views_count: p.views_count || p.views || 75,
    isFeatured: p.is_featured !== undefined ? p.is_featured : (p.isFeatured || false),
    is_featured: p.is_featured !== undefined ? p.is_featured : (p.isFeatured || false),
    agentName: p.agentName || "LankaProperty.lk Agent Cluster",
    agentPhone: p.mobile || p.agentPhone || "+94 77 111 0000",
    agentEmail: p.agentEmail || "agents@lankaproperty.lk",
    agentImage: p.agentImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    amenities: p.amenities || ["24/7 Security", "Parking Space"],
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
    created_at: p.created_at || p.createdAt || new Date().toISOString()
  };
};

export default function App() {
  // --- STATE SYSTEM ---
  const [currentTab, setCurrentTab] = useState<"explore" | "category" | "dashboard" | "publish" | "ai" | "packages" | "wanted" | "feedback" | "agents" | "lands" | "sell" | "agent_sell" | "agent_register" | "agent_dashboard" | "agent_login" | "owner_register" | "owner_login" | "owner_payment" | "owner_payment_success" | "owner_dashboard" | "property-detail" | "blog" | "blog-detail">("explore");
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [isAgentLoggedIn, setIsAgentLoggedIn] = useState(() => {
    return safeLocalStorage.getItem('agent_logged_in') === 'true';
  });
  const [agentUser, setAgentUser] = useState<any>(() => {
    if (safeLocalStorage.getItem('agent_logged_in') === 'true') {
      return {
        id: safeLocalStorage.getItem('agent_user_id') || '',
        name: safeLocalStorage.getItem('agent_name') || '',
        email: safeLocalStorage.getItem('agent_email') || '',
        phone: safeLocalStorage.getItem('agent_phone') || '',
        agency: safeLocalStorage.getItem('agent_agency') || '',
        image: safeLocalStorage.getItem('agent_image') || '',
        is_verified: safeLocalStorage.getItem('agent_is_verified') === 'true'
      };
    }
    return null;
  });
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const [compareList, setCompareList] = useState<number[]>([]);
  const toggleCompare = (id: number) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  };
  const [selectedAdPackage, setSelectedAdPackage] = useState<string | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [properties, setProperties] = useState(() => resolveDuplicateSlugs(INITIAL_PROPERTIES.map(unifyProperty)));
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [propertyDetailId, setPropertyDetailId] = useState<number | string | null>(null);
  
  // Search parameters
  const [searchStatus, setSearchStatus] = useState<"Sale" | "Rent" | "Lease">("Sale");
  const [searchCategory, setSearchCategory] = useState("All Categories");
  const [searchDistrict, setSearchDistrict] = useState("All Districts");
  const [searchText, setSearchText] = useState("");
  const [searchBeds, setSearchBeds] = useState("Any Beds");
  const [minPrice, setMinPrice] = useState<number | "Any">("Any");
  const [maxPrice, setMaxPrice] = useState<number | "Any">("Any");

  // Agent page initial selected agent name
  const [agentPageInitialAgentName, setAgentPageInitialAgentName] = useState<string | null>(null);

  // Map Filter Status
  const [mapSelectedDistrict, setMapSelectedDistrict] = useState<string | null>(null);

  // Mortgage Calculator variables
  const [loanAmount, setLoanAmount] = useState<number>(30000000);
  const [interestRate, setInterestRate] = useState<number>(12);
  const [loanTermYears, setLoanTermYears] = useState<number>(20);
  const [downPayment, setDownPayment] = useState<number>(5000000);

  // Active Image Gallery Index inside the detail modal & brochure downloading status
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [downloadingBrochure, setDownloadingBrochure] = useState<boolean>(false);

  // Custom client inquiries database
  const [inquiries, setInquiries] = useState<any[]>([
    { id: 1, propertyName: "Luxury Oceanfront Horizon Penthouse", clientName: "Hiran Perera", clientEmail: "hiran@gmail.com", clientPhone: "+94 77 555 4910", message: "Hello, I am highly interested in setting up an physical inspection of this penthouse. Please let me know your tour availability.", status: "New", date: "2026-06-22T17:15:00.000Z" },
    { id: 2, propertyName: "Prime Residential Land Plot", clientName: "Ruwan Wickramasinghe", clientEmail: "ruwan_wick@gmail.com", clientPhone: "+94 72 888 1239", message: "Is the title deed clear? Can you confirm if bank loans are pre-approved for this gated community plot?", status: "Contacted", date: "2026-06-21T11:30:00.000Z" },
    { id: 3, propertyName: "Colonial Holiday Hills Bungalow", clientName: "Sarah Jenkins", clientEmail: "sarahj@outlook.com", clientPhone: "+44 7911 123456", message: "Inquiring about this colonial hills property on behalf of an international resort hotel client.", status: "New", date: "2026-06-23T06:40:00.000Z" }
  ]);

  // Direct Inquiry State within Detail View
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);

  // Listing creation state
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newDistrict, setNewDistrict] = useState("Colombo");
  const [newPrice, setNewPrice] = useState("");
  const [newType, setNewType] = useState<"Sale" | "Rent" | "Lease">("Sale");
  const [newCategory, setNewCategory] = useState("House");
  const [newBedrooms, setNewBedrooms] = useState("3");
  const [newBathrooms, setNewBathrooms] = useState("2");
  const [newSize, setNewSize] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAmenities, setNewAmenities] = useState<string[]>([]);
  const [newImage, setNewImage] = useState("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800");

  // AI Assistant Chat state
  const [aiInput, setAiInput] = useState("");
  const [aiConversation, setAiConversation] = useState<any[]>([
    { sender: "ai", text: "Ayubowan! 🙏 Welcome to LankaProperty.lk Smart Assistant. I can recommend properties based on areas, evaluate mortgages, or answer queries about property buying in Sri Lanka. Try asking: 'Recommend luxury apartments in Colombo' or 'How much is 1.5 Crores in USD?'" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Statistics for CRM / Analytics
  const [visitorTraffic, setVisitorTraffic] = useState(1402);

  const handlePropertySelect = (p: any) => {
    if (!p) {
      setPropertyDetailId(null);
      setCurrentTab("explore");
      window.history.pushState(null, '', '/');
      return;
    }
    const slug = p.slug || slugify(p.title || p.listing_title || "");
    const idOrSlug = slug || p.id;
    setPropertyDetailId(idOrSlug);
    setCurrentTab("property-detail");
    window.history.pushState(null, '', `/properties/${idOrSlug}`);
  };

  // Check initial URL pathname and popstate for routes
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const propMatch = path.match(/^\/properties\/([^/]+)/) || path.match(/^\/property\/([^/]+)/);
      
      if (propMatch) {
        const slugOrId = propMatch[1];
        const parsedId = isNaN(Number(slugOrId)) ? slugOrId : Number(slugOrId);
        setPropertyDetailId(parsedId);
        setCurrentTab("property-detail");
      } else if (path === "/agent/register" || path.includes("/agent/register")) {
        setCurrentTab("agent_register");
      } else if (path === "/agent/dashboard" || path.includes("/agent/dashboard")) {
        if (safeLocalStorage.getItem('agent_logged_in') === 'true') {
          setCurrentTab("agent_dashboard");
        } else {
          setCurrentTab("agent_login");
        }
      } else if (path === "/agent/login" || path.includes("/agent/login")) {
        setCurrentTab("agent_login");
      } else if (path === "/sell" || path.includes("/sell")) {
        setCurrentTab("sell");
      } else if (path === "/owner/register" || path.includes("/owner/register")) {
        setCurrentTab("owner_register");
      } else if (path === "/owner/login" || path.includes("/owner/login")) {
        setCurrentTab("owner_login");
      } else if (path === "/owner/payment/success" || path.includes("/owner/payment/success")) {
        setCurrentTab("owner_payment_success");
      } else if (path === "/owner/payment" || path.includes("/owner/payment")) {
        setCurrentTab("owner_payment");
      } else if (path === "/owner/dashboard" || path.includes("/owner/dashboard")) {
        if (safeLocalStorage.getItem('owner_logged_in') === 'true') {
          setCurrentTab("owner_dashboard");
        } else {
          setCurrentTab("owner_login");
          toast.error("Please login to access your property dashboard.");
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();

    const interval = setInterval(() => {
      setVisitorTraffic(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3));
    }, 4000);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(interval);
    };
  }, []);

  // Sync mortgage parameters and active gallery image when a property is selected
  useEffect(() => {
    if (selectedProperty) {
      setLoanAmount(selectedProperty.priceLkr);
      setDownPayment(Math.round(selectedProperty.priceLkr * 0.2));
      setActiveImageIndex(0);
    }
  }, [selectedProperty]);

  // Fetch live properties from Supabase
  useEffect(() => {
    const fetchLiveProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active');
        
        if (error) {
          console.warn("Supabase live properties query failed (using local database):", error.message || error);
          // Set properties to initial static list
          setProperties(resolveDuplicateSlugs(INITIAL_PROPERTIES.map(unifyProperty)));
          return;
        }

        const liveMapped = resolveDuplicateSlugs((data || [])
          .map(unifyProperty))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        if (liveMapped.length > 0) {
          setProperties(liveMapped);
        } else {
          setProperties(resolveDuplicateSlugs(INITIAL_PROPERTIES.map(unifyProperty)));
        }
      } catch (err) {
        console.warn("Supabase live properties fetch exception (using local database):", err);
        // Set properties to initial static list
        setProperties(resolveDuplicateSlugs(INITIAL_PROPERTIES.map(unifyProperty)));
      }
    };

    if (currentTab === "explore") {
      fetchLiveProperties();
    }
  }, [currentTab]);

  // --- FILTER ENGINE ---
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // 1. Status Check
      if (prop.type !== searchStatus) return false;

      // 2. Category Check
      if (searchCategory !== "All Categories") {
        if (prop.category.toLowerCase() !== searchCategory.toLowerCase()) return false;
      }

      // 3. District Option Selector Search
      if (searchDistrict !== "All Districts") {
        if (prop.district.toLowerCase() !== searchDistrict.toLowerCase()) return false;
      }

      // 4. District Map Filter (Overriding Priority if Clicked)
      if (mapSelectedDistrict) {
        if (prop.district.toLowerCase() !== mapSelectedDistrict.toLowerCase()) return false;
      }

      // 5. Text query search (ref no, city, title, location)
      if (searchText.trim() !== "") {
        const query = searchText.toLowerCase();
        const matchesTitle = prop.title.toLowerCase().includes(query);
        const matchesLocation = prop.location.toLowerCase().includes(query);
        const matchesCity = prop.city.toLowerCase().includes(query);
        const matchesRef = `lp00${prop.id}`.includes(query) || `lp${prop.id}`.includes(query);
        
        if (!matchesTitle && !matchesLocation && !matchesCity && !matchesRef) return false;
      }

      // 6. Beds check
      if (searchBeds !== "Any Beds") {
        const requiredBeds = parseInt(searchBeds, 10);
        if (!prop.bedrooms || prop.bedrooms < requiredBeds) return false;
      }

      // 7. Price min-max check
      if (minPrice !== "Any") {
        if (prop.priceLkr < minPrice) return false;
      }
      if (maxPrice !== "Any") {
        if (prop.priceLkr > maxPrice) return false;
      }

      return true;
    });
  }, [properties, searchStatus, searchCategory, searchDistrict, mapSelectedDistrict, searchText, searchBeds, minPrice, maxPrice]);

  // Mortgage Payment formula calculation
  const calculatedMortgage = useMemo(() => {
    const loanAmt = Math.max(0, loanAmount - downPayment);
    const monthlyRate = (interestRate / 100) / 12;
    const totalPayments = loanTermYears * 12;

    if (loanAmt <= 0) return { monthly: 0, totalPay: 0, interestPay: 0 };
    if (monthlyRate === 0) {
      const m = loanAmt / totalPayments;
      return { monthly: m, totalPay: loanAmt, interestPay: 0 };
    }

    const monthlyPayment = (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    const totalPay = monthlyPayment * totalPayments;
    const interestPay = totalPay - loanAmt;

    return {
      monthly: Math.round(monthlyPayment),
      totalPay: Math.round(totalPay),
      interestPay: Math.round(interestPay)
    };
  }, [loanAmount, downPayment, interestRate, loanTermYears]);

  // Handle direct inquiry sending
  const handleInquiryPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryPhone) {
      toast.error("Please fill all required builder fields!");
      return;
    }

    setSendingInquiry(true);
    setTimeout(() => {
      // Create new inquiry record
      const record = {
        id: inquiries.length + 1,
        propertyName: selectedProperty?.title || "General Inquiry",
        clientName: inquiryName,
        clientEmail: inquiryEmail,
        clientPhone: inquiryPhone,
        message: inquiryMessage || "Default interest request.",
        status: "New",
        date: new Date().toISOString()
      };

      setInquiries([record, ...inquiries]);
      setSendingInquiry(false);
      toast.success(`Inquiry sent to ${selectedProperty?.agentName}! We will contact you soon.`);
      
      // Clean up fields
      setInquiryName("");
      setInquiryEmail("");
      setInquiryPhone("");
      setInquiryMessage("");
    }, 1500);
  };

  // Handle new listing submission
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLocation || !newPrice || !newSize || !newDescription) {
      toast.error("All mandatory fields must be completed.");
      return;
    }

    const priceNum = parseFloat(newPrice.replace(/,/g, ''));
    if (isNaN(priceNum)) {
      toast.error("Please enter a valid numeric price");
      return;
    }

    const newProperty = {
      id: properties.length + 1,
      title: newTitle,
      location: newLocation,
      district: newDistrict,
      city: newCity || newLocation.split(',')[0].trim(),
      priceLkr: priceNum,
      type: newType,
      category: newCategory,
      image: newImage,
      images: [newImage],
      bedrooms: newCategory.toLowerCase() !== 'land' ? parseInt(newBedrooms, 10) : undefined,
      bathrooms: newCategory.toLowerCase() !== 'land' ? parseInt(newBathrooms, 10) : undefined,
      size: formatPerchOrSqft(newSize, newCategory),
      description: newDescription,
      views: 75,
      isFeatured: false,
      agentName: "LankaProperty.lk Agent Cluster",
      agentPhone: "+94 77 111 0000",
      agentEmail: "agents@lankaproperty.lk",
      agentImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      amenities: newAmenities.length > 0 ? newAmenities : ["24/7 Security", "Parking Space"],
      createdAt: new Date().toISOString()
    };

    setProperties([newProperty, ...properties]);
    toast.success("Successfully Published on LankaProperty.lk Live Market!");
    
    // Reset listing states
    setNewTitle("");
    setNewLocation("");
    setNewCity("");
    setNewPrice("");
    setNewSize("");
    setNewDescription("");
    setNewAmenities([]);
    
    // Shift view back to explore
    setCurrentTab("explore");
  };

  // AI Chat simulation or actual Call (Failsafe setup to `/api/ai/chat`)
  const handleSendMessageToAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput;
    setAiInput("");
    setAiConversation(prev => [...prev, { sender: "user", text: userMsg }]);
    setAiLoading(true);

    try {
      // Call standard environment proxy
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          instructions: "You are the primary smart assistant of LankaProperty.lk, Sri Lanka's largest portal."
        })
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let currentAiText = "";
          
          // Append empty placeholder for real-time streaming effect
          setAiConversation(prev => [...prev, { sender: "ai", text: "" }]);

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            
            // Format chunks of stream: SSE strings starts as data: {...}
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataText = line.substring(6).trim();
                if (dataText === "[DONE]") continue;
                try {
                  const cleanedJson = JSON.parse(dataText);
                  if (cleanedJson.text) {
                    currentAiText += cleanedJson.text;
                    setAiConversation(prev => {
                      const updated = [...prev];
                      updated[updated.length - 1].text = currentAiText;
                      return updated;
                    });
                  }
                } catch {
                  // Catch silent malformed buffers
                }
              }
            }
          }
          setAiLoading(false);
          return;
        }
      }
      
      throw new Error("Proceeding with stable local response model mapping");

    } catch (err) {
      console.warn("Dev Stream API fallback initiated:", err);
      // Simulated dynamic high-fidelity responses matching keywords
      setTimeout(() => {
        let reply = "I am looking into that for you. Sri Lanka is currently experiencing high property demand in Colombo 03, Colombo 05, and Malabe. Could you specify your budget limit?";
        const inputLower = userMsg.toLowerCase();

        if (inputLower.includes("luxury") || inputLower.includes("colombo")) {
          reply = "Colombo has exceptional luxury options. I highly suggest looking at [PROPERTY: 1] ('Luxury Oceanfront Horizon Penthouse' in Kollupitiya). It features full Indian Ocean views and 3 sprawling bedrooms priced at Rs. 14.5 Crore LKR.";
        } else if (inputLower.includes("land") || inputLower.includes("malabe") || inputLower.includes("gampaha")) {
          reply = "We have highly valuable plots available. Specifically, look at [PROPERTY: 2] ('Prime Residential Land Plot' in Malabe, Colombo at Rs. 18.5 Lakhs per Perch) in a pristine gated housing community.";
        } else if (inputLower.includes("villa") || inputLower.includes("beach") || inputLower.includes("galle")) {
          reply = "For incredible ocean sunsets, see [PROPERTY: 4] ('Beachfront Bliss Private Villa' in Galle) which offers pristine direct access right to Unawatuna’s golden sands, custom swimming pool, and pristine solar power grid infrastructure.";
        } else if (inputLower.includes("mortgage") || inputLower.includes("calculate") || inputLower.includes("loan")) {
          reply = "Of course! Let's analyze. If you secure a home loan of Rs. 3 Crores (30,000,000 LKR) with an average 12% interest for 20 years, your estimated monthly installment is approximately Rs. 275,260. You can experiment directly on our Mortgage Tool in the Property Detail view!";
        } else if (inputLower.includes("usd") || inputLower.includes("dollar") || inputLower.includes("crore")) {
          reply = "Certainly! 1 Crore LKR displays as 10 Million Rupees. At modern exchange rates (1 USD = 300 LKR), 1 Crore LKR evaluates roughly to $33,333 USD. For example, our 14.5 Crore Kollupitiya Penthouse translates directly to ~$483,333 USD.";
        }

        setAiConversation(prev => [...prev, { sender: "ai", text: reply }]);
        setAiLoading(false);
      }, 1000);
    }
  };

  const handleNavigate = (view: any) => {
    if (!view) return;
    if (view.type === "home") {
      setCurrentTab("explore");
      setSelectedProperty(null);
      setMapSelectedDistrict(null);
      setSearchText("");
      setSearchCategory("All Categories");
      setSearchDistrict("All Districts");
      setSearchBeds("Any Beds");
      setMinPrice("Any");
      setMaxPrice("Any");
    } else if (view.type === "sell") {
      setCurrentTab("sell");
      setSelectedProperty(null);
    } else if (view.type === "agent_sell") {
      setCurrentTab("agent_sell");
      setSelectedProperty(null);
    } else if (view.type === "agent_register") {
      setCurrentTab("agent_register");
      setSelectedProperty(null);
    } else if (view.type === "agent_dashboard") {
      if (safeLocalStorage.getItem('agent_logged_in') === 'true') {
        setCurrentTab("agent_dashboard");
      } else {
        setCurrentTab("agent_login");
      }
      setSelectedProperty(null);
    } else if (view.type === "agent_login") {
      setCurrentTab("agent_login");
      setSelectedProperty(null);
    } else if (view.type === "owner_register") {
      setCurrentTab("owner_register");
      setSelectedProperty(null);
    } else if (view.type === "owner_login") {
      setCurrentTab("owner_login");
      setSelectedProperty(null);
    } else if (view.type === "owner_payment") {
      setCurrentTab("owner_payment");
      setSelectedProperty(null);
    } else if (view.type === "owner_payment_success") {
      setCurrentTab("owner_payment_success");
      setSelectedProperty(null);
    } else if (view.type === "owner_dashboard") {
      if (safeLocalStorage.getItem('owner_logged_in') === 'true') {
        setCurrentTab("owner_dashboard");
      } else {
        setCurrentTab("owner_login");
        toast.error("Please login to access your property dashboard.");
      }
      setSelectedProperty(null);
    } else if (view.type === "publish") {
      setCurrentTab("sell");
      setSelectedProperty(null);
    } else if (view.type === "packages") {
      setCurrentTab("packages");
      setSelectedProperty(null);
    } else if (view.type === "wanted") {
      setCurrentTab("wanted");
      setSelectedProperty(null);
    } else if (view.type === "feedback") {
      setCurrentTab("feedback");
      setSelectedProperty(null);
    } else if (view.type === "dashboard" || view.type === "admin") {
      setCurrentTab("dashboard");
      setSelectedProperty(null);
    } else if (view.type === "ai" || view.type === "chat") {
      setCurrentTab("ai");
      setSelectedProperty(null);
    } else if (view.type === "search_results") {
      setCurrentTab("explore");
      setSelectedProperty(null);
      if (view.data) {
        if (view.data.category) setSearchCategory(view.data.category);
        if (view.data.district) setSearchDistrict(view.data.district);
        if (view.data.status) setSearchStatus(view.data.status);
        if (view.data.text) setSearchText(view.data.text);
        if (view.data.beds) setSearchBeds(view.data.beds);
        if (view.data.minPrice) setMinPrice(view.data.minPrice);
        if (view.data.maxPrice) setMaxPrice(view.data.maxPrice);
      }
    } else if (view.type === "detail") {
      const prop = view.data;
      if (prop) {
        const found = properties.find(p => p.id === prop.id) || prop;
        handlePropertySelect(found);
      }
    } else if (view.type === "category") {
      setCurrentTab("category");
      setSelectedProperty(null);
      if (view.data) {
        if (view.data.category) setSearchCategory(view.data.category);
        if (view.data.mode) setSearchStatus(view.data.mode === "rent" ? "Rent" : "Sale");
      }
    } else if (view.type === "agents") {
      setCurrentTab("agents");
      setSelectedProperty(null);
      if (view.data && view.data.agentName) {
        setAgentPageInitialAgentName(view.data.agentName);
      } else {
        setAgentPageInitialAgentName(null);
      }
    } else if (view.type === "lands") {
      setCurrentTab("lands");
      setSelectedProperty(null);
    } else if (view.type === "blog") {
      setCurrentTab("blog");
      setSelectedProperty(null);
    } else if (view.type === "blog-detail") {
      setCurrentTab("blog-detail");
      setSelectedBlogSlug(view.data);
      setSelectedProperty(null);
    }
  };

  const handleSelectPackage = (packageName: string) => {
    setSelectedAdPackage(packageName);
    let planKey = 'starter_free';
    if (packageName.toLowerCase().includes('pro')) {
      planKey = packageName.toLowerCase().includes('elite') ? 'elite_pro' : 'premium_pro';
    }
    safeLocalStorage.setItem('lp_selected_plan', planKey);
    setCurrentTab("sell");
    toast.success(`Selected ${packageName}! Let's start with your property details.`, {
      icon: '💎',
      duration: 5000,
    });
  };

  const handleContactAgency = () => {
    toast.success("Thank you! Our Enterprise Solutions Team will contact you within 2 hours.", {
      icon: '🏢',
      duration: 5000,
    });
  };

  const isSearching = useMemo(() => {
    return (
      mapSelectedDistrict !== null ||
      searchCategory !== "All Categories" ||
      searchDistrict !== "All Districts" ||
      searchText !== "" ||
      searchBeds !== "Any Beds" ||
      minPrice !== "Any" ||
      maxPrice !== "Any"
    );
  }, [mapSelectedDistrict, searchCategory, searchDistrict, searchText, searchBeds, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-[#004f31] selection:text-white antialiased">
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
          success: {
            iconTheme: {
              primary: '#1A5E2A',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* --- REDESIGNED BRAND NAVIGATION --- */}
      {currentTab !== "dashboard" && (
        <Navbar 
          onPostAd={() => handleNavigate({ type: "publish" })}
          onNavigateHome={() => handleNavigate({ type: "home" })}
          onAdminAccess={() => handleNavigate({ type: "dashboard" })}
          onNavigate={handleNavigate}
          currentView={currentTab}
        />
      )}

      {/* --- TAB VIEWPORTS --- */}
      <main className="w-full">
        
        {/* =======================================
            VIEWPORT: PROPERTY DETAIL PAGE
            ======================================= */}
        {currentTab === "property-detail" && (
          <PropertyDetail
            propertyId={propertyDetailId || ""}
            onBack={() => {
              window.history.pushState(null, '', '/');
              setCurrentTab("explore");
              setPropertyDetailId(null);
            }}
            onPropertyClick={handlePropertySelect}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            isAdmin={isAdminLoggedIn}
          />
        )}
        
        {/* =======================================
            VIEWPORT: MARKET EXPLORER & PROPERTIES
            ======================================= */}

        {currentTab === "category" && (
          <CategoryPage
            category={searchCategory === "All Categories" ? "House" : searchCategory}
            mode={searchStatus === "Rent" ? "rent" : "buy"}
            onBack={() => handleNavigate({ type: "home" })}
            onPropertyClick={handlePropertySelect}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            compareList={compareList}
            toggleCompare={toggleCompare}
            isAdmin={isAdminLoggedIn}
            onPostAd={() => handleNavigate({ type: "publish" })}
            onNavigateHome={() => handleNavigate({ type: "home" })}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === "agents" && (
          <AgentPage
            properties={properties}
            onPropertyClick={handlePropertySelect}
            onBack={() => handleNavigate({ type: "home" })}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onNavigate={handleNavigate}
            initialAgentName={agentPageInitialAgentName}
          />
        )}

        {currentTab === "lands" && (
          <LandsPortfolio
            properties={properties}
            onPropertyClick={handlePropertySelect}
            onNavigateHome={() => handleNavigate({ type: "home" })}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === "blog" && (
          <PublicBlog 
            onNavigatePost={(slug) => handleNavigate({ type: "blog-detail", data: slug })} 
          />
        )}

        {currentTab === "blog-detail" && (
          <PublicBlogPost 
            slug={selectedBlogSlug || ""} 
            onBack={() => handleNavigate({ type: "blog" })} 
          />
        )}

        {currentTab === "explore" && !isSearching && (
          <HomeRedesign 
            propertyCount={properties.length} 
            featuredProperties={properties.filter(p => p.isFeatured)} 
            properties={properties}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === "explore" && isSearching && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-8">
            
            {/* Custom Interactive Jumbotron */}
            <div className="relative rounded-3xl overflow-hidden bg-emerald-950 text-white p-6 sm:p-10 shadow-2xl border border-emerald-900">
              <div className="absolute inset-x-0 bottom-0 top-0 opacity-15 overflow-hidden mix-blend-overlay pointer-events-none">
                <div className="absolute -top-10 -left-10 h-64 w-64 bg-emerald-400 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -right-10 h-72 w-72 bg-yellow-400 rounded-full blur-3xl" />
              </div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-12 xl:col-span-7 space-y-4 text-center lg:text-left">
                  <span className="inline-block bg-emerald-800 text-[#a8ffd5] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    🌴 Sri Lanka’s Premier Real Estate Engine
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                    Secure Your Dream Home in <span className="text-emerald-400">Sri Lanka</span>
                  </h2>
                  <p className="text-xs sm:text-base text-emerald-100 max-w-xl font-medium leading-relaxed">
                    Verify live properties directly from certified agents, list instantly, and convert prices in LKR, USD, or EUR in real time. Filter seamlessly utilizing our intuitive visual district navigator below.
                  </p>
                </div>
              </div>

              {/* FLOATING FILTER CONSOLE BAR */}
              <div className="bg-white/95 rounded-2xl p-4 sm:p-6 shadow-xl border border-neutral-100 mt-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 select-none text-neutral-800 relative z-30">
                
                {/* 1. Buy/Rent/Lease Tab switcher */}
                <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Search Type</label>
                  <div className="grid grid-cols-3 bg-neutral-100 p-1 rounded-lg">
                    {["Sale", "Rent", "Lease"].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setSearchStatus(st as any);
                          setMapSelectedDistrict(null);
                        }}
                        className={`py-1.5 rounded text-[11px] font-extrabold uppercase tracking-wide transition-all ${searchStatus === st ? "bg-[#004f31] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Category Dropdown */}
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Property Category</label>
                  <div className="relative">
                    <select
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none appearance-none"
                    >
                      <option>All Categories</option>
                      <option value="Apartment">🏢 Apartment</option>
                      <option value="House">🏠 House</option>
                      <option value="Land">🌿 Land plot</option>
                      <option value="Villa">🏖️ Holiday Villa</option>
                      <option value="Hotel">🏨 Guesthouse/Hotel</option>
                      <option value="Building">🏗️ Warehouse/Building</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                {/* 3. District Dropdown */}
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">District Area</label>
                  <div className="relative">
                    <select
                      value={searchDistrict}
                      onChange={(e) => {
                        setSearchDistrict(e.target.value);
                        setMapSelectedDistrict(null);
                      }}
                      className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none appearance-none"
                    >
                      <option>All Districts</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Galle">Galle</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Nuwara Eliya">Nuwara Eliya</option>
                      <option value="Jaffna">Jaffna</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                {/* 4. Bedrooms check */}
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Rooms/Bedrooms</label>
                  <div className="relative">
                    <select
                      value={searchBeds}
                      onChange={(e) => setSearchBeds(e.target.value)}
                      className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none appearance-none"
                    >
                      <option>Any Beds</option>
                      <option value="1">1+ Beds</option>
                      <option value="2">2+ Beds</option>
                      <option value="3">3+ Beds</option>
                      <option value="4">4+ Beds</option>
                      <option value="5">5+ Beds</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                {/* 5. Custom price boundaries */}
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Max Budget Limit</label>
                  <div className="relative">
                    <select
                      value={maxPrice === "Any" ? "Any" : maxPrice.toString()}
                      onChange={(e) => setMaxPrice(e.target.value === "Any" ? "Any" : parseInt(e.target.value, 10))}
                      className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none appearance-none"
                    >
                      <option value="Any">Any Price</option>
                      <option value="500000">Rs. 5 Lakhs</option>
                      <option value="2500000">Rs. 25 Lakhs</option>
                      <option value="10000000">Rs. 1 Crore</option>
                      <option value="50000000">Rs. 5 Crores</option>
                      <option value="100000000">Rs. 10 Crores</option>
                      <option value="150000000">Rs. 15 Crores</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                {/* Text query bar stretching whole row underneath */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-2 md:col-span-4 lg:col-span-6 w-full">
                  <div className="relative md:col-span-9">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
                      <Search size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search ref ID (e.g. LP001), exact cities (Malabe, Kollupitiya), keyword matches..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none"
                    />
                    {searchText && (
                      <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  
                  {/* Results Count Summary */}
                  <div className="md:col-span-3 flex items-center justify-center md:justify-end gap-2 px-1">
                    <span className="text-[10px] font-black text-[#004f31] uppercase tracking-wide bg-emerald-100 px-3 py-2 rounded-lg flex items-center gap-1.5 w-full justify-center">
                      <Activity size={12} className="animate-pulse" />
                      {filteredProperties.length} Properties Match
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* INTERACTIVE COMPREHENSIVE REGION SELECTION MAP */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white p-6 sm:p-8 rounded-3xl border border-neutral-150 shadow-md">
              
              {/* Left Column: Hand-drawn SVG Map of Sri Lanka for 100% stable regional filtration */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="text-center mb-6">
                  <h3 className="text-sm font-black uppercase text-[#004f31] tracking-wider mb-1 flex items-center gap-1.5 justify-center">
                    <MapPin size={16} /> Interactive Districts Map
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-bold">Select a key real estate hub on the map to filter listings instantly</p>
                </div>
                
                <div className="relative w-full max-w-[280px] aspect-[1/2] flex items-center justify-center bg-neutral-50/50 rounded-2xl p-4 border border-neutral-100">
                  <svg 
                    viewBox="0 0 200 400" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-full h-full stroke-emerald-950/20 stroke-1 select-none"
                  >
                    {/* Jaffna Hub (Northern) */}
                    <g 
                      onClick={() => setMapSelectedDistrict(mapSelectedDistrict === "jaffna" ? null : "jaffna")} 
                      className={`cursor-pointer transition-all ${mapSelectedDistrict === "jaffna" ? "fill-emerald-600 hover:fill-emerald-700" : "fill-neutral-200 hover:fill-neutral-300"}`}
                    >
                      <path d="M70,30 C80,20 85,15 90,30 L110,40 C105,45 100,50 90,45 C80,42 75,38 70,30 Z" />
                      <text x="88" y="27" className="text-[8px] font-black text-emerald-950 stroke-none pointer-events-none">JAFFNA</text>
                    </g>

                    {/* Anuradhapura Hub (North Central) */}
                    <g 
                      onClick={() => setMapSelectedDistrict(mapSelectedDistrict === "anuradhapura" ? null : "anuradhapura")} 
                      className={`cursor-pointer transition-all ${mapSelectedDistrict === "anuradhapura" ? "fill-emerald-600 hover:fill-emerald-700" : "fill-neutral-200 hover:fill-neutral-300"}`}
                    >
                      <path d="M85,80 C110,65 125,70 135,90 L125,120 L90,110 C80,105 75,95 85,80 Z" />
                      <text x="94" y="96" className="text-[8px] font-black text-emerald-950 stroke-none pointer-events-none">ANURADHAPURA</text>
                    </g>

                    {/* Kandy (Central Peaklands) */}
                    <g 
                      onClick={() => setMapSelectedDistrict(mapSelectedDistrict === "kandy" ? null : "kandy")} 
                      className={`cursor-pointer transition-all ${mapSelectedDistrict === "kandy" ? "fill-emerald-600 hover:fill-emerald-700" : "fill-neutral-200 hover:fill-neutral-300"}`}
                    >
                      <path d="M100,165 C120,150 145,150 135,185 L120,200 L95,190 C85,185 85,175 100,165 Z" />
                      <text x="106" y="176" className="text-[8px] font-black text-emerald-950 stroke-none pointer-events-none">KANDY</text>
                    </g>

                    {/* Nuwara Eliya (Deep Central Hills) */}
                    <g 
                      onClick={() => setMapSelectedDistrict(mapSelectedDistrict === "nuwara eliya" ? null : "nuwara eliya")} 
                      className={`cursor-pointer transition-all ${mapSelectedDistrict === "nuwara eliya" ? "fill-emerald-600 hover:fill-emerald-700" : "fill-neutral-200 hover:fill-neutral-300"}`}
                    >
                      <path d="M105,202 C120,195 130,205 135,215 L120,235 C115,230 100,225 105,202 Z" />
                      <text x="100" y="214" className="text-[7px] font-black text-emerald-950 stroke-none pointer-events-none">N. ELIYA</text>
                    </g>

                    {/* Colombo Corridor (Western Hub) */}
                    <g 
                      onClick={() => setMapSelectedDistrict(mapSelectedDistrict === "colombo" ? null : "colombo")} 
                      className={`cursor-pointer transition-all ${mapSelectedDistrict === "colombo" ? "fill-emerald-600 hover:fill-emerald-700" : "fill-neutral-200 hover:fill-neutral-300"}`}
                    >
                      <path d="M70,210 C85,210 95,210 95,230 L85,255 L65,245 C60,235 60,220 70,210 Z" strokeWidth="1.5" className={mapSelectedDistrict === "colombo" ? "stroke-emerald-300" : "stroke-neutral-300"} />
                      <text x="50" y="228" className="text-[8px] font-black text-emerald-950 stroke-none pointer-events-none">COLOMBO</text>
                    </g>

                    {/* Galle Hub (Southern Coast) */}
                    <g 
                      onClick={() => setMapSelectedDistrict(mapSelectedDistrict === "galle" ? null : "galle")} 
                      className={`cursor-pointer transition-all ${mapSelectedDistrict === "galle" ? "fill-emerald-600 hover:fill-emerald-700" : "fill-neutral-200 hover:fill-neutral-300"}`}
                    >
                      <path d="M75,285 C95,280 115,285 110,310 L95,315 L70,300 C68,295 70,290 75,285 Z" />
                      <text x="82" y="299" className="text-[8px] font-black text-emerald-950 stroke-none pointer-events-none">GALLE</text>
                    </g>

                    {/* Surrounding background lines indicating Indian Ocean waters */}
                    <text x="10" y="360" className="text-[10px] font-bold text-neutral-300 block tracking-widest pointer-events-none">INDIAN OCEAN</text>
                  </svg>
                  
                  {/* Floating active selection badge */}
                  {mapSelectedDistrict && (
                    <div className="absolute top-2 right-2 bg-emerald-900 border border-emerald-700 text-[#a8ffd5] text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#a8ffd5] inline-block animate-pulse" />
                      Refining: {mapSelectedDistrict}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic Properties Catalog */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Header indicators */}
                <div className="flex justify-between items-center bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-400">Filtering under:</span>
                    <span className="bg-[#004f31] text-[#a8ffd5] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                      {searchStatus} / {searchCategory}
                    </span>
                    {mapSelectedDistrict && (
                      <span className="bg-emerald-900 text-white text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded flex items-center gap-1.5">
                        📍 Hub: {mapSelectedDistrict}
                        <button onClick={() => setMapSelectedDistrict(null)} className="hover:text-red-400">×</button>
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setSearchStatus("Sale");
                      setSearchCategory("All Categories");
                      setSearchDistrict("All Districts");
                      setSearchBeds("Any Beds");
                      setMinPrice("Any");
                      setMaxPrice("Any");
                      setSearchText("");
                      setMapSelectedDistrict(null);
                      toast.success("Filters completely reset!");
                    }}
                    className="text-[10px] font-bold text-neutral-400 hover:text-red-500 uppercase tracking-widest"
                  >
                    Clear All
                  </button>
                </div>

                {/* Properties Cards List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredProperties.length > 0 ? (
                      filteredProperties.map(prop => (
                        <motion.div
                          key={prop.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => handlePropertySelect(prop)}
                          className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/80 hover:border-[#004f31] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col relative"
                        >
                          {/* Banner image representation */}
                          <div className="relative h-44 w-full bg-neutral-200 overflow-hidden">
                            <img 
                              src={prop.image} 
                              alt={prop.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                            />
                            {prop.isFeatured && (
                              <div className="absolute top-2.5 left-2.5 bg-yellow-400 border border-yellow-500 text-neutral-900 text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-lg shadow-sm">
                                ⭐ Elite
                              </div>
                            )}
                            <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-lg">
                              Ref ID: LP00{prop.id}
                            </div>
                            <div className="absolute bottom-2.5 left-2.5 bg-[#004f31] text-white text-[9.5px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-xl shadow-md">
                              For {prop.type}
                            </div>
                          </div>

                          {/* Detail body */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">🏡 {prop.category} in {prop.district}</span>
                              <h4 className="text-sm font-black text-neutral-800 line-clamp-1 group-hover:text-[#004f31] transition-colors">{prop.title}</h4>
                              <p className="text-[10.5px] text-neutral-500 font-semibold flex items-center gap-1.5 mt-1">
                                <MapPin size={11} className="text-[#004f31]" />
                                {prop.location}
                              </p>
                            </div>

                            {/* Specifications Row */}
                            <div className="flex items-center gap-4 py-2 border-y border-neutral-100">
                              {prop.category.toLowerCase() !== "land" && (
                                <>
                                  <span className="text-[10px] font-bold text-neutral-600 flex items-center gap-1">
                                    <Bed size={13} className="text-neutral-400" /> {prop.bedrooms} Beds
                                  </span>
                                  <span className="text-[10px] font-bold text-neutral-600 flex items-center gap-1">
                                    <Bath size={13} className="text-neutral-400" /> {prop.bathrooms} Baths
                                  </span>
                                </>
                              )}
                              <span className="text-[10px] font-bold text-neutral-600 flex items-center gap-1">
                                <Maximize size={13} className="text-neutral-400" /> {prop.size}
                              </span>
                            </div>

                            {/* Dual Price Segment: Real Converter Display */}
                            <div className="flex justify-between items-center pt-2">
                              <div>
                                <p className="text-neutral-400 text-[9px] uppercase font-bold tracking-widest">Pricing LKR</p>
                                <p className="text-[#004f31] font-black text-sm">
                                  {formatPriceLKR(prop.priceLkr)}
                                  {prop.type === "Rent" && <span className="text-[10px] font-semibold text-neutral-500"> /mo</span>}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-neutral-400 text-[9px] uppercase font-bold tracking-widest">USD Display</p>
                                <p className="text-neutral-600 font-bold text-xs">
                                  ${Math.round(prop.priceLkr / LKR_USD_RATE).toLocaleString()}
                                </p>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-16 bg-neutral-100 rounded-3xl border border-dashed border-neutral-200">
                        <Info size={32} className="mx-auto text-neutral-400 mb-3" />
                        <h4 className="text-neutral-700 font-bold text-sm uppercase tracking-wide">No Properties Match Selection</h4>
                        <p className="text-[11px] text-neutral-500 max-w-sm mx-auto mt-1">Please try modifying your selected filters, clearing text parameter search, or zooming out of specific map regions.</p>
                        <button 
                          onClick={() => {
                            setSearchStatus("Sale");
                            setSearchCategory("All Categories");
                            setSearchDistrict("All Districts");
                            setSearchBeds("Any Beds");
                            setMinPrice("Any");
                            setMaxPrice("Any");
                            setSearchText("");
                            setMapSelectedDistrict(null);
                          }}
                          className="mt-4 px-4 py-2 bg-[#004f31] hover:bg-emerald-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          Reset Filters Console
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =======================================
            VIEWPORT: CRM INPATIENT & ANALYTICS
            ======================================= */}
        {currentTab === "dashboard" && (
          isAdminLoggedIn ? (
            <AdminPortal 
              user={adminUser}
              onLogout={() => {
                setIsAdminLoggedIn(false);
                setAdminUser(null);
                setCurrentTab("explore");
              }}
              onRefresh={() => {}}
              onAgentAccessBack={() => {
                setCurrentTab("explore");
              }}
            />
          ) : (
            <AdminLogin 
              onLoginSuccess={(email) => {
                setIsAdminLoggedIn(true);
                setAdminUser({ email });
              }}
              onBackToHome={() => {
                setCurrentTab("explore");
              }}
            />
          )
        )}

        {/* =======================================
            VIEWPORT: PUBLISH NEW PROPERTY LISTING
            ======================================= */}
        {currentTab === "publish" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-neutral-250 p-6 sm:p-10 shadow-xl space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="text-xl font-black text-[#004f31] uppercase tracking-wider">List New Property</h3>
              <p className="text-xs text-neutral-500 font-bold">Advertise your property instantly on LankaProperty.lk. All fields marked with * are strictly mandatory.</p>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-6">
              
              {selectedAdPackage && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
                  <div>
                    <p className="text-[10px] font-black uppercase text-[#004f31] tracking-widest">Selected Ad Package</p>
                    <p className="text-sm font-black text-emerald-900">{selectedAdPackage}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedAdPackage(null)}
                    className="text-xs font-black uppercase tracking-wider text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Change Package
                  </button>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Ad Listing Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spacious 4-Bedroom Architect Designed House on Prime Acre"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Property Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none"
                  >
                    <option value="House">🏠 House / Home</option>
                    <option value="Apartment">🏢 Apartment Complex</option>
                    <option value="Land">🌿 Land Plot</option>
                    <option value="Villa">🏖️ Vacation Villa</option>
                    <option value="Hotel">🏨 Corporate Hotel/Guesthouse</option>
                    <option value="Building">🏗️ Warehouse / Commercial Facility</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Transaction Offer *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none"
                  >
                    <option value="Sale">Sale (Outright Transfer)</option>
                    <option value="Rent">Rent (Lease Period Contract)</option>
                    <option value="Lease">Lease Options Only</option>
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Province District Hub *</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none"
                  >
                    <option>Colombo</option>
                    <option>Gampaha</option>
                    <option>Kalutara</option>
                    <option>Galle</option>
                    <option>Kandy</option>
                    <option>Nuwara Eliya</option>
                    <option>Jaffna</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">City Suburb Area *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kollupitiya, Malabe, Weligama"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Specific Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 54 Ocean Pathway, Colombo 03"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Price (LKR) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 35000000 or 150000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Perch or Sqft Area *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 perches / 2200 sqft"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Layout Bedrooms *</label>
                  <select
                    disabled={newCategory === "Land"}
                    value={newBedrooms}
                    onChange={(e) => setNewBedrooms(e.target.value)}
                    className={`w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none ${newCategory === "Land" && "opacity-50"}`}
                  >
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4 Bedrooms</option>
                    <option value="5">5+ Bedrooms</option>
                  </select>
                </div>

              </div>

              {/* Photo Input (Muted preview) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Property Showcase URL Image *</label>
                <input
                  type="text"
                  required
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none"
                />
                
                {/* Drag Sandbox Sim */}
                <div className="h-28 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 flex flex-col items-center justify-center p-4">
                  <Camera size={24} className="text-[#004f31] mb-1.5" />
                  <p className="text-[10.5px] font-black uppercase text-[#004f31]">Simulate Add More Photos</p>
                  <p className="text-[9px] text-neutral-400 font-bold">Drag & drop additional high-resolution images files to load on gallery</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Detailed Description proposal *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline clear property traits, nearby premium educational/commercial centers, title status descriptions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none resize-none"
                />
              </div>

              {/* Amenities checkboxes */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Include Standard Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITIES_POOL.map((amenity) => {
                    const isChecked = newAmenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => {
                          if (isChecked) {
                            setNewAmenities(newAmenities.filter(a => a !== amenity));
                          } else {
                            setNewAmenities([...newAmenities, amenity]);
                          }
                        }}
                        className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 ${isChecked ? "bg-[#004f31]/5 border-[#004f31] text-[#004f31]" : "bg-neutral-50 border-neutral-200 text-neutral-600"}`}
                      >
                        <span className={`h-4 w-4 rounded border flex items-center justify-center ${isChecked ? "bg-[#004f31] border-[#004f31] text-white" : "border-neutral-300 bg-white"}`}>
                          {isChecked && <Check size={11} />}
                        </span>
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit panel */}
              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCurrentTab("explore")}
                  className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#004f31] hover:bg-emerald-950 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/25 transition-colors"
                >
                  Publish Listing Now
                </button>
              </div>

            </form>
          </div>
          </div>
        )}

        {/* =======================================
            VIEWPORT: POST YOUR PROPERTY LANDING PAGE
            ======================================= */}
        {currentTab === "sell" && (
          <PostPropertyPage 
            onNavigate={handleNavigate}
            onNavigateHome={() => handleNavigate({ type: "home" })}
          />
        )}

        {/* =======================================
            VIEWPORT: AGENT POST YOUR PROPERTY FLOW
            ======================================= */}
        {currentTab === "agent_sell" && (
          <AgentPostPropertyPage 
            onNavigate={handleNavigate}
            onNavigateHome={() => handleNavigate({ type: "home" })}
          />
        )}

        {/* =======================================
            VIEWPORT: OWNER REGISTRATION PAGE
            ======================================= */}
        {currentTab === "owner_register" && (
          <OwnerRegisterPage 
            onNavigate={handleNavigate}
            onNavigateHome={() => handleNavigate({ type: "home" })}
          />
        )}

        {/* =======================================
            VIEWPORT: OWNER PORTAL LOGIN
            ======================================= */}
        {currentTab === "owner_login" && (
          <OwnerLoginPage 
            onNavigate={handleNavigate}
            onNavigateHome={() => handleNavigate({ type: "home" })}
          />
        )}

        {/* =======================================
            VIEWPORT: OWNER PORTAL PAYMENT
            ======================================= */}
        {currentTab === "owner_payment" && (
          <OwnerPaymentPage 
            onNavigate={handleNavigate}
            onLogout={() => {
              safeLocalStorage.removeItem('owner_logged_in');
              safeLocalStorage.removeItem('owner_id');
              safeLocalStorage.removeItem('owner_name');
              safeLocalStorage.removeItem('owner_email');
              safeLocalStorage.removeItem('user_role');
              setCurrentTab("explore");
              toast.success("Logged out from direct owner session.");
            }}
          />
        )}

        {/* =======================================
            VIEWPORT: OWNER PAYMENT SUCCESS PAGE
            ======================================= */}
        {currentTab === "owner_payment_success" && (
          <OwnerPaymentSuccessPage 
            onNavigate={handleNavigate}
          />
        )}

        {/* =======================================
            VIEWPORT: OWNER PORTAL DASHBOARD
            ======================================= */}
        {currentTab === "owner_dashboard" && (
          <OwnerDashboardPage 
            onNavigate={handleNavigate}
            onLogout={() => {
              safeLocalStorage.removeItem('owner_logged_in');
              safeLocalStorage.removeItem('owner_id');
              safeLocalStorage.removeItem('owner_name');
              safeLocalStorage.removeItem('owner_email');
              safeLocalStorage.removeItem('user_role');
              setCurrentTab("explore");
              toast.success("Logged out from direct owner session.");
            }}
          />
        )}

        {/* =======================================
            VIEWPORT: AGENT REGISTRATION PAGE
            ======================================= */}
        {currentTab === "agent_register" && (
          <AgentRegisterPage 
            onNavigate={handleNavigate}
            onNavigateHome={() => handleNavigate({ type: "home" })}
          />
        )}

        {/* =======================================
            VIEWPORT: AGENT PORTAL LOGIN
            ======================================= */}
        {currentTab === "agent_login" && (
          <AgentLoginPage 
            onLoginSuccess={(agentData) => {
              setIsAgentLoggedIn(true);
              setAgentUser(agentData);
              setCurrentTab("agent_dashboard");
            }}
            onBackToHome={() => handleNavigate({ type: "home" })}
            onNavigateToRegister={() => handleNavigate({ type: "agent_register" })}
            onNavigate={handleNavigate}
          />
        )}

        {/* =======================================
            VIEWPORT: AGENT PORTAL DASHBOARD
            ======================================= */}
        {currentTab === "agent_dashboard" && agentUser && (
          <AgentDashboardPage 
            agent={agentUser}
            onNavigate={handleNavigate}
            onLogout={() => {
              safeLocalStorage.removeItem('agent_logged_in');
              safeLocalStorage.removeItem('agent_user_id');
              safeLocalStorage.removeItem('agent_name');
              safeLocalStorage.removeItem('agent_email');
              safeLocalStorage.removeItem('agent_phone');
              safeLocalStorage.removeItem('agent_agency');
              safeLocalStorage.removeItem('agent_image');
              safeLocalStorage.removeItem('agent_is_verified');
              setIsAgentLoggedIn(false);
              setAgentUser(null);
              setCurrentTab("explore");
              toast.success("Successfully logged out from Agent Portal.");
            }}
          />
        )}

        {/* =======================================
            VIEWPORT: SMART AI HELPER CHATPORT
            ======================================= */}
        {currentTab === "ai" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-neutral-250 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[550px]">
            
            {/* Left helper info rail */}
            <div className="md:col-span-4 bg-emerald-950 text-white p-6 justify-between flex flex-col space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-emerald-800 text-[#a8ffd5] rounded-xl flex items-center justify-center font-bold">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wide">LP Smart Brain</h3>
                    <p className="text-[10px] text-emerald-300 font-bold">Semantic Search Assistant</p>
                  </div>
                </div>
                
                <div className="text-[10.5px] leading-relaxed text-emerald-100/80 space-y-3 font-semibold">
                  <p>Our intelligent system evaluates natural questions to highlight match coordinates, analyze local mortgage rates, or compare sizes.</p>
                  <p>Try sending:</p>
                  <div className="space-y-2 text-emerald-300 pt-2 font-mono text-[9.5px]">
                    <p className="cursor-pointer hover:underline" onClick={() => setAiInput("Show beachfront villas in Galle")}>👉 'Show beachfront villas in Galle'</p>
                    <p className="cursor-pointer hover:underline" onClick={() => setAiInput("Recommend properties under 5 Crore LKR")}>👉 'Properties under 5 Crore LKR'</p>
                    <p className="cursor-pointer hover:underline" onClick={() => setAiInput("How much is 450,000 LKR in US Dollars?")}>👉 '450k LKR in USD'</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-900 border border-emerald-800 rounded-2xl text-[9px] text-[#a8ffd5] font-black uppercase tracking-widest text-center">
                🤖 Powered by Gemini Flash
              </div>
            </div>

            {/* Chat message viewport */}
            <div className="md:col-span-8 flex flex-col justify-between h-full bg-neutral-50">
              
              {/* Message scroll container */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 max-h-[460px]">
                {aiConversation.map((msg, index) => {
                  const isAi = msg.sender === "ai";
                  
                  // Helper function to extract and render property link cards if AI recommended them
                  const renderTextWithCards = (text: string) => {
                    const propertyRegex = /\[PROPERTY:\s*(\d+)\]/i;
                    const match = text.match(propertyRegex);
                    
                    if (match && match[1]) {
                      const propId = parseInt(match[1], 10);
                      const targetProp = properties.find(p => p.id === propId);
                      const cleanedText = text.replace(propertyRegex, "");

                      return (
                        <div className="space-y-3">
                          <p className="leading-relaxed">{cleanedText}</p>
                          {targetProp && (
                            <div 
                              onClick={() => handlePropertySelect(targetProp)}
                              className="bg-white border border-neutral-250 p-3 rounded-2xl flex gap-3 shadow-md hover:border-[#004f31] cursor-pointer transition-colors"
                            >
                              <img src={targetProp.image} className="w-20 h-16 object-cover rounded-xl" alt="" />
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">{targetProp.category} · {targetProp.district}</span>
                                <h4 className="text-xs font-black text-neutral-800 truncate">{targetProp.title}</h4>
                                <p className="text-emerald-800 font-extrabold text-xs mt-1">{formatPriceLKR(targetProp.priceLkr)}</p>
                              </div>
                              <ArrowRight size={16} className="text-[#004f31] self-center" />
                            </div>
                          )}
                        </div>
                      );
                    }

                    return <p className="leading-relaxed">{text}</p>;
                  };

                  return (
                    <div key={index} className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[85%] rounded-2xl p-3 text-xs font-semibold leading-relaxed shadow-sm ${isAi ? "bg-white text-neutral-800 border border-neutral-200" : "bg-[#004f31] text-white"}`}>
                        {renderTextWithCards(msg.text)}
                      </div>
                    </div>
                  );
                })}

                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-neutral-800 border border-neutral-200 rounded-2xl p-3 text-xs flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#004f31] inline-block animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-[#004f31] inline-block animate-bounce [animation-delay:0.2s]" />
                      <span className="h-2 w-2 rounded-full bg-[#004f31] inline-block animate-bounce [animation-delay:0.4s]" />
                      <span className="text-neutral-400">Assistant is evaluating data...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Entry box */}
              <form onSubmit={handleSendMessageToAI} className="p-3 bg-white border-t border-neutral-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask any real-estate questions about listed properties, mortgages, or USD rates..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#004f31] focus:border-[#004f31] outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#004f31] hover:bg-emerald-950 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  Ask Brain
                </button>
              </form>

            </div>

          </div>
          </div>
        )}

        {currentTab === "packages" && (
          <AdvertisedPackages 
            onSelectPackage={handleSelectPackage}
            onContactAgency={handleContactAgency}
          />
        )}

        {currentTab === "wanted" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PropertyWanted />
          </div>
        )}

        {currentTab === "feedback" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Feedback onBack={() => handleNavigate({ type: 'home' })} />
          </div>
        )}

      </main>

      {/* --- IN-DEPTH DETAILED MODAL OVERLAY --- */}
      <AnimatePresence>
        {selectedProperty && (() => {
          // Prepare gallery images safely
          const galleryImages = selectedProperty.images && selectedProperty.images.length > 0 
            ? selectedProperty.images 
            : [selectedProperty.image];
          const activeImg = galleryImages[activeImageIndex] || selectedProperty.image;

          // Neighborhood landmark calculator based on real locations
          const landmarks = (() => {
            const city = selectedProperty.city?.toLowerCase() || "";
            const district = selectedProperty.district?.toLowerCase() || "";
            
            if (district === "galle" || city.includes("galle") || city.includes("unawatuna") || city.includes("weligama")) {
              return [
                { name: "Unawatuna Golden Sandy Beach Resort", distance: "3 mins drive (850m)" },
                { name: "Historic Galle Fort (UNESCO World Heritage Site)", distance: "10 mins drive (4.2 km)" },
                { name: "Southern Expressway Interchange (Pinnaduwa)", distance: "12 mins drive (6.5 km)" },
                { name: "Galle International Cricket Stadium Hub", distance: "11 mins drive" },
                { name: "Arpico Supercentre & Keells Retail Outlets", distance: "8 mins drive" }
              ];
            }
            if (district === "nuwara eliya" || city.includes("eliya")) {
              return [
                { name: "Scenic Lake Gregory Recreation Complex", distance: "2 mins walk (200m)" },
                { name: "Timeless Nuwara Eliya Golf Club", distance: "6 mins drive (2.1 km)" },
                { name: "Historic Queen Victoria Botanical Park Area", distance: "5 mins drive" },
                { name: "Grand Hotel & High Tea plantation sites", distance: "7 mins drive" },
                { name: "Nanu Oya Colonial Railway Station Hub", distance: "15 mins drive" }
              ];
            }
            if (city.includes("malabe") || city.includes("kothalawala")) {
              return [
                { name: "SLIIT & Horizon International Campus Sites", distance: "5 mins drive (1.5 km)" },
                { name: "Outer Circular Expressway Interchange (Kothalawala)", distance: "3 mins drive (900m)" },
                { name: "Nevindee Private Hospital & Emergency Care", distance: "6 mins drive" },
                { name: "Dr. Neville Fernando Teaching Hospital Hub", distance: "8 mins drive" },
                { name: "Kaduwela main bus depot & Expressway access portal", distance: "10 mins drive" }
              ];
            }
            return [
              { name: "Colombo Outer Circular Highway Interchange Corridor", distance: "15 mins drive" },
              { name: "Colombo 03 / Kollupitiya Central Business District", distance: "12 mins drive" },
              { name: "Galle Face Green Beachfront & Port City Boulevard", distance: "15 mins drive" },
              { name: "Uptown Keells, Cargills & Spar Supermarket Hubs", distance: "4 mins walk (300m)" },
              { name: "Colombo National Hospital & Premium Specialty Clinics", distance: "14 mins drive" }
            ];
          })();

          // Local Sri Lankan bank comparison list
          const lankanBanks = [
            { name: "Commercial Bank", rate: 11.50, description: "Special package with low premium rates" },
            { name: "Hatton National Bank (HNB)", rate: 12.00, description: "Highly flexible repayments & custom plans" },
            { name: "Sampath Bank", rate: 11.75, description: "Rapid fast-tracked digital approval" },
            { name: "Seylan Bank", rate: 12.50, description: "Reduced initial equity entry margins" }
          ];

          // Download a virtual detailed text report prospectus safely in iframe
          const triggerDownloadBrochure = () => {
            setDownloadingBrochure(true);
            setTimeout(() => {
              setDownloadingBrochure(false);
              try {
                const element = document.createElement("a");
                const file = new Blob([`
==================================================================
LANKAPROPERTY.LK - CERTIFIED VERIFIED REAL ESTATE PROSPECTUS
==================================================================
Reference Ref ID: LP00${selectedProperty.id}
Listing Title:    ${selectedProperty.title}
Address/Location: ${selectedProperty.location}
Administrative Hub: ${selectedProperty.district} District, Sri Lanka
Appraisal Value:  Rs. ${selectedProperty.priceLkr.toLocaleString()} LKR

KEY PROPERTY SPECIFICATIONS
---------------------------
Listing Category: ${selectedProperty.category}
Transaction Type: For ${selectedProperty.type}
Total Area Sizing: ${selectedProperty.size}
Verified Bedrooms: ${selectedProperty.bedrooms || 'Not Applicable'}
Verified Bathrooms: ${selectedProperty.bathrooms || 'Not Applicable'}

LEGAL & UTILITY PARTICULARS
---------------------------
Zoning Classification: Residential Zone 1 (High density)
Ownership / Deed Registry: Freehold (Absolute Clear Deed Registry verified)
Electrical Connection: Three-phase 30-Amp Ceylon Electricity Board utility line
Water Source: Main pipe-borne National Water Supply Board line
Road Width Access: 20ft carpeted municipal public roadway access

PROPERTY DETAILS DESCRIPTION
----------------------------
${selectedProperty.description}

STANDARD RECORDED AMENITIES
---------------------------
${selectedProperty.amenities.join(', ')}

OFFICIALLY LICENSED PROPERTY AGENT
----------------------------------
Certified Agent:  ${selectedProperty.agentName}
Hotline Contact:  ${selectedProperty.agentPhone}
Official E-mail:  ${selectedProperty.agentEmail}

------------------------------------------------------------------
Disclaimer: Generated automatically by LankaProperty.lk. All credentials 
and deed entries are officially verified by our administrative desk.
==================================================================
                `], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = `LankaProperty_Listing_LP00${selectedProperty.id}.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                toast.success(`Prospectus brochure for LP00${selectedProperty.id} generated and downloaded successfully!`);
              } catch (e) {
                toast.error("Failed to compile prospectus download file.");
              }
            }, 1200);
          };

          const triggerCopyLink = () => {
            const link = `${window.location.origin}/?property=LP00${selectedProperty.id}`;
            navigator.clipboard.writeText(link);
            toast.success("Listing share link copied to clipboard!");
          };

          // Calculate percentage principal vs interest
          const loanPrincipal = Math.max(0, loanAmount - downPayment);
          const totalPaid = calculatedMortgage.totalPay;
          const totalInterest = calculatedMortgage.interestPay;
          const principalPct = totalPaid > 0 ? (loanPrincipal / totalPaid) * 100 : 0;
          const interestPct = totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 overflow-y-auto backdrop-blur-md">
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[32px] overflow-hidden border border-neutral-200 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col relative"
              >
                
                {/* Close float button */}
                <button 
                  onClick={() => setSelectedProperty(null)}
                  className="absolute top-4 right-4 z-30 bg-black/75 hover:bg-black text-white h-10 w-10 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-md shadow-black/20"
                >
                  <X size={20} />
                </button>

                {/* Scrollable details wrapper */}
                <div id="property-detail-scroller" className="overflow-y-auto flex-1">
                  
                  {/* Hero showcase picture slider */}
                  <div className="relative h-72 sm:h-[400px] w-full bg-neutral-900 overflow-hidden group">
                    <img src={activeImg} className="w-full h-full object-cover transition-all duration-700" alt="" />
                    
                    {/* Dark gradient vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 pointer-events-none" />

                    {/* Floating gallery thumbnails */}
                    {galleryImages.length > 1 && (
                      <div className="absolute bottom-6 right-6 z-20 flex gap-2 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                        {galleryImages.map((imgUrl, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`relative h-12 w-16 sm:h-14 sm:w-20 rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                              activeImageIndex === index 
                                ? 'border-[#00D27B] scale-105 shadow-lg' 
                                : 'border-white/20 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Floating Specs overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white flex flex-col justify-end pointer-events-none">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-[#004f31] text-[#a8ffd5] text-[9.5px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm shadow-black/20 border border-[#a8ffd5]/20">
                          ⭐ Verified Elite Listing
                        </span>
                        <span className="bg-[#00D27B]/20 text-[#00D27B] text-[9.5px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-[#00D27B]/30 backdrop-blur-sm">
                          For {selectedProperty.type}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md text-white max-w-3xl leading-tight">
                        {selectedProperty.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-300 font-bold flex items-center gap-1.5 mt-2 drop-shadow">
                        <MapPin size={15} className="text-[#00D27B]" />
                        {selectedProperty.location}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left segment specs */}
                    <div className="lg:col-span-7 space-y-8">
                      
                      {/* Primary specs grid */}
                      <div className="grid grid-cols-3 gap-3 text-center bg-neutral-50 border border-neutral-150 p-4 rounded-2xl shadow-sm">
                        {selectedProperty.category.toLowerCase() !== "land" && (
                          <>
                            <div className="space-y-1 py-1">
                              <span className="text-neutral-400 text-[10px] uppercase font-black block tracking-wider">Bedrooms</span>
                              <span className="font-extrabold text-neutral-800 text-sm sm:text-base flex items-center justify-center gap-1.5">
                                <Bed size={17} className="text-[#004f31]" />
                                {selectedProperty.bedrooms} Beds
                              </span>
                            </div>
                            <div className="space-y-1 py-1 border-x border-neutral-200">
                              <span className="text-neutral-400 text-[10px] uppercase font-black block tracking-wider">Bathrooms</span>
                              <span className="font-extrabold text-neutral-800 text-sm sm:text-base flex items-center justify-center gap-1.5">
                                <Bath size={17} className="text-[#004f31]" />
                                {selectedProperty.bathrooms} Baths
                              </span>
                            </div>
                          </>
                        )}
                        <div className="space-y-1 py-1">
                          <span className="text-neutral-400 text-[10px] uppercase font-black block tracking-wider">Property Size</span>
                          <span className="font-extrabold text-neutral-800 text-sm sm:text-base flex items-center justify-center gap-1.5">
                            <Maximize size={17} className="text-[#004f31]" />
                            {selectedProperty.size}
                          </span>
                        </div>
                      </div>

                      {/* KEY PROPERTY PARTICULARS (VERIFIED REAL DETAILS) */}
                      <div className="bg-white border border-neutral-150 rounded-2xl p-5 shadow-sm space-y-4">
                        <h4 className="text-xs font-black uppercase text-neutral-800 tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-2">
                          <Shield size={15} className="text-[#004f31]" /> Key Property Particulars (Verified Entries)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs font-medium">
                          <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                            <span className="text-neutral-400">Property Ref ID</span>
                            <span className="font-bold text-neutral-800 font-mono">LP-00{selectedProperty.id}</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                            <span className="text-neutral-400">Ownership / Deed Registry</span>
                            <span className="font-bold text-[#004f31]">Freehold (Absolute Clear Title)</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                            <span className="text-neutral-400">Access Road Width</span>
                            <span className="font-bold text-neutral-800">20ft Carpeted municipal road</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                            <span className="text-neutral-400">Zoning Classification</span>
                            <span className="font-bold text-neutral-800">Residential Zone 1</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-50 pb-1.5 sm:border-0 sm:pb-0">
                            <span className="text-neutral-400">Electrical Grid</span>
                            <span className="font-bold text-neutral-800">Three-phase 30-Amp CEB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Primary Water Source</span>
                            <span className="font-bold text-neutral-800">Pipe-borne NWSDB line</span>
                          </div>
                        </div>
                      </div>

                      {/* Description Proposal text */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider">Property Overview & Features</h4>
                        <p className="text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed whitespace-pre-line bg-neutral-50 p-5 rounded-2xl border border-neutral-150">
                          {selectedProperty.description}
                        </p>
                      </div>

                      {/* Landmark Proximity Calculator */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-2">
                          <MapPin size={14} className="text-[#004f31]" /> Neighborhood & Travel Landmarks
                        </h4>
                        <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-4 sm:p-5 space-y-3">
                          <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">Calculated Drive Times</p>
                          <div className="space-y-2 text-xs font-bold text-neutral-700">
                            {landmarks.map((landmark, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white border border-neutral-150 px-4 py-2.5 rounded-xl">
                                <span className="flex items-center gap-2 text-neutral-800">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#00D27B]" />
                                  {landmark.name}
                                </span>
                                <span className="text-neutral-500 text-[11px] font-mono whitespace-nowrap bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100">{landmark.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Map & Amenities list */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider">Property & Building Amenities</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-neutral-700">
                          {selectedProperty.amenities.map((amenity: string, idx: number) => (
                            <span key={idx} className="flex items-center gap-2 bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-neutral-150 hover:bg-neutral-100 transition-colors">
                              <CheckCircle size={14} className="text-emerald-600" />
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* ADVANCED LOAN MORTGAGE CALCULATOR GAUGE TOOL */}
                      <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-3xl space-y-6">
                        <div className="border-b border-neutral-200 pb-3 flex gap-2 items-center">
                          <Calculator size={18} className="text-[#004f31]" />
                          <div>
                            <h4 className="text-xs font-black uppercase text-neutral-800 tracking-wider">Monthly Mortgage Tool</h4>
                            <p className="text-[10px] text-neutral-500 font-bold">Calculate mortgage loans & interest ratios instantly</p>
                          </div>
                        </div>

                        {/* Interactive Bank Selection list */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Compare Sri Lankan Home Loans</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {lankanBanks.map((bank) => (
                              <button
                                key={bank.name}
                                type="button"
                                onClick={() => {
                                  setInterestRate(bank.rate);
                                  toast.success(`Updated rate to ${bank.rate}% for ${bank.name} Home Loans!`);
                                }}
                                className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between ${
                                  interestRate === bank.rate
                                    ? 'bg-[var(--lp-green-light)] border-[var(--lp-green)] text-[var(--lp-green)]'
                                    : 'bg-white border-neutral-150 hover:border-neutral-300'
                                  }`}
                              >
                                <div>
                                  <p className="text-[9.5px] font-black leading-tight truncate">{bank.name}</p>
                                  <p className="text-[8px] text-neutral-400 mt-0.5 leading-snug line-clamp-2">{bank.description}</p>
                                </div>
                                <p className="text-xs font-black mt-2 font-mono">{bank.rate.toFixed(2)}%</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Inputs parameters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-neutral-400">Purchase Ad Price (LKR)</label>
                            <input 
                              type="number" 
                              value={loanAmount} 
                              onChange={(e) => setLoanAmount(parseInt(e.target.value, 10))}
                              className="w-full bg-white px-3 py-2 border border-neutral-200 rounded-lg text-xs font-bold outline-none focus:border-[var(--lp-green)]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-neutral-400">Equity Down Payment (LKR)</label>
                            <input 
                              type="number" 
                              value={downPayment} 
                              onChange={(e) => setDownPayment(parseInt(e.target.value, 10))}
                              className="w-full bg-white px-3 py-2 border border-neutral-200 rounded-lg text-xs font-bold outline-none focus:border-[var(--lp-green)]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-neutral-400">Interest rate (%)</label>
                            <input 
                              type="number" 
                              step="0.5"
                              value={interestRate} 
                              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                              className="w-full bg-white px-3 py-2 border border-neutral-200 rounded-lg text-xs font-bold outline-none focus:border-[var(--lp-green)]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-neutral-400">Repayment Period (Years)</label>
                            <input 
                              type="number" 
                              value={loanTermYears} 
                              onChange={(e) => setLoanTermYears(parseInt(e.target.value, 10))}
                              className="w-full bg-white px-3 py-2 border border-neutral-200 rounded-lg text-xs font-bold outline-none focus:border-[var(--lp-green)]"
                            />
                          </div>

                        </div>

                        {/* Visual Repayment Ratio Bar */}
                        {calculatedMortgage.monthly > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-neutral-200">
                            <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400">
                              <span>Ratio: Loan Principal ({principalPct.toFixed(0)}%)</span>
                              <span>Total Interest ({interestPct.toFixed(0)}%)</span>
                            </div>
                            <div className="h-2.5 w-full bg-neutral-200 rounded-full overflow-hidden flex">
                              <div className="bg-[var(--lp-green)] h-full" style={{ width: `${principalPct}%` }} title="Principal portion" />
                              <div className="bg-amber-500 h-full" style={{ width: `${interestPct}%` }} title="Interest portion" />
                            </div>
                          </div>
                        )}

                        {/* Payment output displays */}
                        <div className="bg-[var(--lp-green-light)] text-[var(--lp-green)] p-5 rounded-2xl flex justify-between items-center shadow-sm border border-[var(--lp-green)]/10">
                          <div>
                            <p className="text-[var(--lp-green-mid)] text-[9.5px] uppercase tracking-widest font-black">Estimated Monthly Payment</p>
                            <p className="text-xl sm:text-2xl font-black font-mono text-[var(--lp-green)]">Rs. {calculatedMortgage.monthly.toLocaleString()} <span className="text-xs font-medium text-[var(--lp-green-mid)]">/mo</span></p>
                          </div>
                          <div className="text-right border-l border-[var(--lp-green-mid)]/20 pl-4 sm:pl-6">
                            <p className="text-[var(--lp-green-mid)] text-[8.5px] uppercase tracking-wide font-bold">Total Interest Paid</p>
                            <p className="font-bold text-xs sm:text-sm font-mono text-[var(--lp-red)]">Rs. {calculatedMortgage.interestPay.toLocaleString()}</p>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Right segment agent action card */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Dynamic Price Display summary */}
                      <div className="bg-[var(--lp-green-light)] border border-[var(--lp-green)]/20 p-6 rounded-3xl text-center space-y-4">
                        <div>
                          <span className="text-neutral-400 text-[10px] uppercase font-black tracking-widest block">Valuation Total</span>
                          <p className="text-3xl font-extrabold text-[var(--lp-green)] tracking-tight">{formatPriceLKR(selectedProperty.priceLkr)}</p>
                        </div>
                        
                        {/* Currency Conversions Segment */}
                        <div className="pt-4 border-t border-[var(--lp-green)]/10 grid grid-cols-2 text-xs font-bold text-neutral-600 gap-3 bg-white p-3 rounded-2xl">
                          <div className="border-r border-neutral-100">
                            <p className="text-[9px] text-neutral-400 uppercase tracking-widest">USD Estimate</p>
                            <p className="text-neutral-800 text-sm font-mono mt-0.5">${Math.round(selectedProperty.priceLkr / LKR_USD_RATE).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-neutral-400 uppercase tracking-widest">EUR Estimate</p>
                            <p className="text-neutral-800 text-sm font-mono mt-0.5">€{Math.round(selectedProperty.priceLkr / LKR_EUR_RATE).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* BROCHURE & SHARING ACTIONS PANEL */}
                      <div className="bg-white border border-neutral-150 p-5 rounded-3xl shadow-sm space-y-3">
                        <h4 className="text-xs font-black uppercase text-neutral-800 tracking-wider mb-1">Prospectus Actions</h4>
                        
                        <button
                          type="button"
                          onClick={triggerDownloadBrochure}
                          disabled={downloadingBrochure}
                          className="w-full bg-[var(--lp-green)] hover:bg-[var(--lp-green-dark)] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] border-none"
                        >
                          {downloadingBrochure ? (
                            <>
                              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Compiling Prospectus...
                            </>
                          ) : (
                            <>
                              <Shield size={14} /> Download Verified Brochure
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={triggerCopyLink}
                          className="w-full bg-white border border-neutral-250 text-neutral-700 hover:bg-neutral-50 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                        >
                          <Share2 size={14} className="text-neutral-500" /> Share Property Listing Link
                        </button>
                      </div>

                      {/* Agent metadata profile */}
                      <div 
                        onClick={() => handleNavigate({ type: "agents", data: { agentName: selectedProperty.agentName } })}
                        className="bg-white border border-neutral-250 p-5 rounded-3xl shadow-sm space-y-4 cursor-pointer hover:border-[#004f31]/40 hover:shadow-md transition-all group"
                      >
                        
                        <div className="flex gap-4 items-center">
                          <img src={selectedProperty.agentImage} className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 shadow-sm group-hover:scale-105 transition-all" alt="" />
                          <div>
                            <span className="text-[9px] bg-[#004f31] text-[#a8ffd5] px-2.5 py-0.5 rounded-lg uppercase tracking-widest font-black">Verified Officer</span>
                            <h4 className="text-sm font-black text-neutral-800 group-hover:text-[#004f31] transition-colors mt-0.5">{selectedProperty.agentName}</h4>
                            <p className="text-[10px] text-neutral-400 font-bold">Licensed Agency Manager</p>
                          </div>
                        </div>
                        
                        <div className="text-[11px] text-neutral-600 space-y-2.5 border-t border-neutral-100 pt-3 font-semibold">
                          <p className="flex items-center gap-2.5 text-neutral-700">📞 <strong className="text-neutral-900">{selectedProperty.agentPhone}</strong></p>
                          <p className="flex items-center gap-2.5 text-neutral-700">✉️ <strong className="text-neutral-900">{selectedProperty.agentEmail}</strong></p>
                        </div>

                      </div>

                      {/* Direct Contact Message form */}
                      <form onSubmit={handleInquiryPublish} className="bg-white border border-neutral-255 p-5 rounded-3xl shadow-md space-y-3">
                        <h4 className="text-xs font-black uppercase text-neutral-800 tracking-wider">Fast Agent Inquiry</h4>
                        
                        <input 
                          type="text" 
                          required
                          placeholder="Your full name *"
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004f31]"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="email" 
                            required
                            placeholder="Email *"
                            value={inquiryEmail}
                            onChange={(e) => setInquiryEmail(e.target.value)}
                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004f31]"
                          />
                          <input 
                            type="text" 
                            required
                            placeholder="Phone *"
                            value={inquiryPhone}
                            onChange={(e) => setInquiryPhone(e.target.value)}
                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004f31]"
                          />
                        </div>

                        <textarea 
                          rows={3}
                          placeholder={`Hello, I am interested in ${selectedProperty.title} (Ref: LP-00${selectedProperty.id})...`}
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none resize-none focus:ring-1 focus:ring-[#004f31]"
                        />

                        <button
                          type="submit"
                          disabled={sendingInquiry}
                          className="w-full bg-[#004f31] hover:bg-[#003923] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
                        >
                          {sendingInquiry ? (
                            <>
                              <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Transmitting Message...
                            </>
                          ) : (
                            <>Send Message Proposal</>
                          )}
                        </button>
                      </form>

                    </div>

                  </div>

                </div>

              </motion.div>

            </div>
          );
        })()}
      </AnimatePresence>

      {/* --- REDESIGNED FOOTER --- */}
      {currentTab !== "dashboard" && currentTab !== "sell" && (
        <Footer 
          onAdminClick={() => setCurrentTab("dashboard")} 
          onHomeClick={() => handleNavigate({ type: "home" })}
        />
      )}

    </div>
  );
}
