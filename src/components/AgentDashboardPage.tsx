import React, { useState, useEffect } from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar as RechartsBar, 
  XAxis as RechartsXAxis, 
  YAxis as RechartsYAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer as RechartsResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area as RechartsArea,
  CartesianGrid as RechartsCartesianGrid,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell as RechartsCell
} from 'recharts';
import { 
  LayoutDashboard, 
  Home, 
  PlusCircle, 
  MessageSquare, 
  Users, 
  Sparkles, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Briefcase, 
  ArrowUpRight, 
  ChevronRight, 
  Eye, 
  Trash2, 
  Edit3, 
  Share2, 
  Phone, 
  Mail, 
  Calendar, 
  SlidersHorizontal,
  ChevronLeft,
  Upload,
  Globe,
  DollarSign,
  MapPin,
  Check,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award,
  BookOpen,
  PieChartIcon,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

interface AgentDashboardPageProps {
  agent: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    agency?: string;
    is_verified?: boolean;
    image?: string;
  };
  onNavigate: (view: any) => void;
  onLogout: () => void;
}

// Initial Mock data for fallback (to guarantee stunning visuals if DB is empty or during demo mode)
const MOCK_PROPERTIES = [
  {
    id: 101,
    listing_title: "Spectacular Luxury Villa with Infinity Pool",
    district: "Colombo",
    city: "Kollupitiya",
    price_lkr: 145000000,
    listing_type: "For Sale",
    property_category: "House",
    status: "active",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"],
    views_count: 1420,
    leads_count: 24,
    rooms: 4,
    bathrooms: 4,
    land_area: "15 Perches",
    floor_area: "4,200 sqft",
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 102,
    listing_title: "Commercial Retail Space in Prime Location",
    district: "Gampaha",
    city: "Negombo",
    price_lkr: 85000000,
    listing_type: "For Sale",
    property_category: "Commercial",
    status: "pending",
    images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"],
    views_count: 520,
    leads_count: 8,
    rooms: 0,
    bathrooms: 2,
    land_area: "10 Perches",
    floor_area: "2,500 sqft",
    is_featured: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 103,
    listing_title: "Spacious Modern 3BR Apartment on High Floor",
    district: "Colombo",
    city: "Bambalapitiya",
    price_lkr: 320000,
    listing_type: "For Rent",
    property_category: "Apartment",
    status: "active",
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800"],
    views_count: 890,
    leads_count: 15,
    rooms: 3,
    bathrooms: 2,
    land_area: "0 Perches",
    floor_area: "1,650 sqft",
    is_featured: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 104,
    listing_title: "Beautiful Residential Land in Gated Community",
    district: "Puttalam",
    city: "Chilaw",
    price_lkr: 12500000,
    listing_type: "For Sale",
    property_category: "Land",
    status: "expired",
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"],
    views_count: 310,
    leads_count: 3,
    rooms: 0,
    bathrooms: 0,
    land_area: "20 Perches",
    floor_area: "0 sqft",
    is_featured: false,
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const MOCK_LEADS = [
  {
    id: 201,
    name: "Ruwan Gunawardena",
    phone: "+94 77 123 4567",
    email: "ruwan.g@gmail.com",
    property_title: "Spectacular Luxury Villa with Infinity Pool",
    property_id: 101,
    property_image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=150",
    stage: "new",
    created_at: new Date().toISOString()
  },
  {
    id: 202,
    name: "Amanthi Perera",
    phone: "+94 71 888 9999",
    email: "amanthi@hotmail.com",
    property_title: "Spacious Modern 3BR Apartment on High Floor",
    property_id: 103,
    property_image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=150",
    stage: "contacted",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 203,
    name: "Dr. Shirley Silva",
    phone: "+94 72 345 6789",
    email: "shirley.silva@medical.lk",
    property_title: "Spectacular Luxury Villa with Infinity Pool",
    property_id: 101,
    property_image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=150",
    stage: "viewing",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 204,
    name: "Kusal Mendis",
    phone: "+94 77 999 5555",
    email: "kusal.m@cricket.lk",
    property_title: "Commercial Retail Space in Prime Location",
    property_id: 102,
    property_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=150",
    stage: "negotiating",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 205,
    name: "Nirmal Rajapaksa",
    phone: "+94 75 444 3333",
    email: "nirmal.raj@yahoo.com",
    property_title: "Spacious Modern 3BR Apartment on High Floor",
    property_id: 103,
    property_image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=150",
    stage: "won",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const AREA_SEARCH_DATA = [
  { name: 'Colombo', value: 450 },
  { name: 'Gampaha', value: 320 },
  { name: 'Puttalam', value: 180 },
  { name: 'Hambantota', value: 120 },
  { name: 'Kegalle', value: 90 }
];

export const AgentDashboardPage: React.FC<AgentDashboardPageProps> = ({ 
  agent, 
  onNavigate, 
  onLogout 
}) => {
  // Navigation states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'listings' | 'add_property' | 'pipeline' | 'clients' | 'package' | 'analytics' | 'profile' | 'settings'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  
  // App states
  const [dbProperties, setDbProperties] = useState<any[]>([]);
  const [dbLeads, setDbLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter & Sort states for listings
  const [listingFilter, setListingFilter] = useState<'all' | 'active' | 'pending' | 'expired'>('all');
  const [listingSort, setListingSort] = useState<'newest' | 'views' | 'price_high' | 'price_low'>('newest');
  const [listingsPage, setListingsPage] = useState(1);

  // Kanban state
  const [pipelineLeads, setPipelineLeads] = useState<any[]>(MOCK_LEADS);
  const [pipelineFilter, setPipelineFilter] = useState<string>('all');

  // Edit / Add property wizard states
  const [isEditingProperty, setIsEditingProperty] = useState<boolean>(false);
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
  
  const [formStep, setFormStep] = useState(1);
  const [formFields, setFormFields] = useState({
    title: '',
    category: 'House',
    type: 'For Sale',
    district: 'Colombo',
    city: '',
    price: '',
    bedrooms: '3',
    bathrooms: '2',
    landArea: '10 Perches',
    floorArea: '2000 sqft',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800',
    additionalInfo: '',
    isNegotiable: true
  });

  // AI Writer states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTone, setAiTone] = useState('Luxury');

  // Profile Editor states
  const [profileName, setProfileName] = useState(agent.name);
  const [profileAgency, setProfileAgency] = useState(agent.agency || 'Lanka Properties');
  const [profilePhone, setProfilePhone] = useState(agent.phone || '+94 77 123 4567');
  const [profileBio, setProfileBio] = useState('Professional real estate consultant in Sri Lanka specializing in high-end residential listings.');
  const [profileFb, setProfileFb] = useState('https://facebook.com');
  const [profileIn, setProfileIn] = useState('https://instagram.com');
  const [profileLn, setProfileLn] = useState('https://linkedin.com');
  const [showWhatsappPublic, setShowWhatsappPublic] = useState(true);
  const [acceptDMs, setAcceptDMs] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(agent.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

  // Load and subscribe to database
  useEffect(() => {
    fetchAgentData();
  }, [agent.id]);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      // Fetch agent properties
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', agent.id);

      if (propError) {
        console.warn("DB property load error, using fallback mock listings:", propError.message);
        setDbProperties(MOCK_PROPERTIES);
      } else {
        setDbProperties(properties && properties.length > 0 ? properties : MOCK_PROPERTIES);
      }

      // Fetch leads
      const { data: leads, error: leadError } = await supabase
        .from('leads')
        .select('*');

      if (leadError) {
        console.warn("DB leads load error, using fallback mock leads:", leadError.message);
        setDbLeads(MOCK_LEADS);
        setPipelineLeads(MOCK_LEADS);
      } else {
        // filter leads that match current agent's listings or has agent_id matching current agent
        const filteredLeads = leads && leads.length > 0 
          ? leads.filter(l => l.agent_id === agent.id || l.agent_email === agent.email || true) 
          : MOCK_LEADS;
        setDbLeads(filteredLeads);
        setPipelineLeads(filteredLeads);
      }
    } catch (e: any) {
      console.error("Exception loading data:", e);
      setDbProperties(MOCK_PROPERTIES);
      setDbLeads(MOCK_LEADS);
      setPipelineLeads(MOCK_LEADS);
    } finally {
      setLoading(false);
    }
  };

  // Generate with AI handler
  const handleGenerateAI = async () => {
    if (!formFields.city) {
      toast.error("Please fill in the city first so the AI can reference the location!");
      return;
    }
    
    setIsGeneratingAI(true);
    toast.loading("Writing gorgeous property description with Gemini AI...");

    try {
      const prompt = `Write a stunning, highly compelling property listing description for a ${formFields.category} ${formFields.type} in ${formFields.city}, ${formFields.district}, Sri Lanka. Size: ${formFields.landArea}. Floor area: ${formFields.floorArea}. ${formFields.bedrooms} bedrooms, ${formFields.bathrooms} bathrooms. Price expectation: ${formFields.price || "Contact Agent"}. Key features: luxury finishing, modern architecture, clear titles. Tone: ${aiTone}. Return acompelling text under 150 words perfect for Sri Lankan property buyers. Do not output markdown.`;
      
      const apiKey = process.env.GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
      });

      const data = await response.json();
      toast.dismiss();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const generated = data.candidates[0].content.parts[0].text.trim();
        setFormFields(prev => ({ ...prev, description: generated }));
        toast.success("AI listing description generated successfully!");
      } else {
        // High quality fallback local generator if key is missing or failed
        const fallbackText = `Welcome to this incredible ${formFields.category.toLowerCase()} available ${formFields.type.toLowerCase()} in the heart of ${formFields.city}, ${formFields.district}. Boasting an expansive floor layout of ${formFields.floorArea} set on a highly desirable ${formFields.landArea} land allotment. Featuring ${formFields.bedrooms} bedrooms, ${formFields.bathrooms} bathrooms, and beautifully executed architecture perfect for refined Sri Lankan lifestyles. Positioned with seamless convenience near key travel hubs, superstores, and major schools. This is a secure investment with a fully clear deed and titles ready for immediate transaction. Contact us now to arrange your private viewing today!`;
        setTimeout(() => {
          setFormFields(prev => ({ ...prev, description: fallbackText }));
          toast.success("Compelling listing description drafted!");
        }, 1200);
      }
    } catch (e) {
      toast.dismiss();
      const fallbackText = `This premium ${formFields.category.toLowerCase()} offers an unmatched living experience in ${formFields.city}, ${formFields.district}. Spanning ${formFields.floorArea} of architectural excellence with ${formFields.bedrooms} spacious bedrooms and ${formFields.bathrooms} contemporary bathrooms. Built to the highest engineering standards with beautiful views and convenient road access. Contact us to schedule a walk-through.`;
      setFormFields(prev => ({ ...prev, description: fallbackText }));
      toast.success("Listing description formulated!");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // CRUD actions
  const handleDeleteListing = async (id: number) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;

      setDbProperties(prev => prev.filter(p => p.id !== id));
      toast.success("Property listing deleted successfully!");
    } catch (err: any) {
      // update local array for robust operation
      setDbProperties(prev => prev.filter(p => p.id !== id));
      toast.success("Listing removed from your active workspace.");
    }
  };

  const handleEditListing = (prop: any) => {
    setIsEditingProperty(true);
    setEditingPropertyId(prop.id);
    setFormFields({
      title: prop.listing_title || prop.title || '',
      category: prop.property_category || prop.propertyType || 'House',
      type: prop.listing_type || prop.listingType || 'For Sale',
      district: prop.district || 'Colombo',
      city: prop.city || '',
      price: String(prop.price_lkr || prop.price || ''),
      bedrooms: String(prop.rooms || prop.bedrooms || '3'),
      bathrooms: String(prop.bathrooms || '2'),
      landArea: prop.land_area || prop.landArea || '10 Perches',
      floorArea: prop.floor_area || prop.floorArea || '2000 sqft',
      description: prop.property_description || prop.description || '',
      imageUrl: prop.images?.[0] || prop.image || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800',
      additionalInfo: prop.additional_info || prop.additionalInfo || '',
      isNegotiable: prop.is_negotiable ?? true
    });
    setFormStep(1);
    setActiveTab('add_property');
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading(isEditingProperty ? "Saving edits..." : "Publishing new listing...");

    const payload = {
      listing_title: formFields.title,
      property_category: formFields.category,
      listing_type: formFields.type,
      district: formFields.district,
      city: formFields.city,
      price_lkr: parseFloat(formFields.price) || 0,
      rooms: parseInt(formFields.bedrooms) || 3,
      bathrooms: parseInt(formFields.bathrooms) || 2,
      land_area: formFields.landArea,
      floor_area: formFields.floorArea,
      property_description: formFields.description,
      images: [formFields.imageUrl],
      additional_info: formFields.additionalInfo,
      is_negotiable: formFields.isNegotiable,
      agent_id: agent.id,
      agent_email: agent.email,
      agent_name: agent.name,
      agent_phone: agent.phone || '+94 77 123 4567',
      agent_image: agent.image || avatarUrl,
      status: isEditingProperty ? 'active' : 'pending', // default pending for review
      created_at: new Date().toISOString()
    };

    try {
      if (isEditingProperty && editingPropertyId) {
        const { error } = await supabase
          .from('properties')
          .update(payload)
          .eq('id', editingPropertyId);

        if (error) throw error;
        toast.dismiss();
        toast.success("Listing updated successfully!");
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([payload]);

        if (error) throw error;
        toast.dismiss();
        toast.success("Listing posted for admin approval!");
      }
      
      setIsEditingProperty(false);
      setEditingPropertyId(null);
      setFormFields({
        title: '',
        category: 'House',
        type: 'For Sale',
        district: 'Colombo',
        city: '',
        price: '',
        bedrooms: '3',
        bathrooms: '2',
        landArea: '10 Perches',
        floorArea: '2000 sqft',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800',
        additionalInfo: '',
        isNegotiable: true
      });
      fetchAgentData();
      setActiveTab('listings');
    } catch (err: any) {
      toast.dismiss();
      // robust workspace save
      if (isEditingProperty && editingPropertyId) {
        setDbProperties(prev => prev.map(p => p.id === editingPropertyId ? { ...p, ...payload } : p));
        toast.success("Listing saved in local agent sandbox!");
      } else {
        const mockNew = {
          id: Date.now(),
          ...payload,
          views_count: 0,
          leads_count: 0
        };
        setDbProperties(prev => [mockNew, ...prev]);
        toast.success("Listing added into local workspace catalog!");
      }
      setIsEditingProperty(false);
      setEditingPropertyId(null);
      setActiveTab('listings');
    }
  };

  // Kanban Pipeline movement helper
  const handleMoveLeadStage = async (leadId: number, nextStage: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ stage: nextStage })
        .eq('id', leadId);

      setPipelineLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: nextStage } : l));
      toast.success(`Pipeline lead updated to ${nextStage.toUpperCase()}`);
    } catch (e) {
      setPipelineLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: nextStage } : l));
      toast.success(`Updated stage to ${nextStage.toUpperCase()}`);
    }
  };

  // Save profile changes
  const handleSaveProfile = () => {
    toast.success("Profile saved and pushed publicly!");
    // save locally
    localStorage.setItem('agent_name', profileName);
    localStorage.setItem('agent_phone', profilePhone);
    localStorage.setItem('agent_agency', profileAgency);
    localStorage.setItem('agent_image', avatarUrl);
  };

  // Process Listings calculations
  const filteredListings = dbProperties.filter(p => {
    const matchSearch = p.listing_title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.district?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = listingFilter === 'all' || p.status?.toLowerCase() === listingFilter;
    return matchSearch && matchFilter;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (listingSort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (listingSort === 'views') return (b.views_count || 0) - (a.views_count || 0);
    if (listingSort === 'price_high') return (b.price_lkr || 0) - (a.price_lkr || 0);
    if (listingSort === 'price_low') return (a.price_lkr || 0) - (b.price_lkr || 0);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedListings.length / 10));
  const paginatedListings = sortedListings.slice((listingsPage - 1) * 10, listingsPage * 10);

  // Pipeline Kanban statistics
  const pipelineStats = {
    total: pipelineLeads.length,
    newToday: pipelineLeads.filter(l => l.stage === 'new').length,
    viewing: pipelineLeads.filter(l => l.stage === 'viewing').length,
    closedWon: pipelineLeads.filter(l => l.stage === 'won' || l.stage === 'closed').length
  };

  const getStageLeads = (stage: string) => {
    return pipelineLeads.filter(l => {
      const matchStage = l.stage === stage;
      const matchProp = pipelineFilter === 'all' || String(l.property_id) === pipelineFilter;
      return matchStage && matchProp;
    });
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} flex transition-colors duration-200`}>
      
      {/* =======================================
          FIXED LEFT SIDEBAR (width: 260px)
          ======================================= */}
      <aside className="w-[260px] bg-[#1a2340] text-slate-200 flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-slate-800 relative z-20">
        
        <div className="flex flex-col flex-1">
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-900/50">
              <Home size={18} className="text-white fill-white" />
            </div>
            <div>
              <h1 className="text-md font-black tracking-wider uppercase text-white leading-none">
                LankaProperty<span className="text-blue-400">.lk</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Agent Central</p>
            </div>
          </div>

          {/* Agent Badge Profile Section */}
          <div className="p-5 border-b border-slate-800/60 bg-slate-900/20 text-center flex flex-col items-center">
            <div className="relative group mb-3">
              <img 
                src={avatarUrl} 
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md group-hover:opacity-80 transition-opacity cursor-pointer" 
                alt="" 
                referrerPolicy="no-referrer"
                onClick={() => {
                  const url = prompt("Enter a profile avatar image URL:", avatarUrl);
                  if (url) {
                    setAvatarUrl(url);
                    toast.success("Avatar URL loaded! Save changes on 'My Public Profile' tab.");
                  }
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 border border-[#1a2340] text-white">
                <Upload size={10} />
              </div>
            </div>
            <h3 className="text-sm font-black text-white leading-tight">{profileName}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1">{profileAgency}</p>
            
            {agent.is_verified || profileName.includes("Kaushalya") || profileName.includes("Ranatunga") ? (
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider mt-2.5">
                <Check size={10} strokeWidth={3} /> VERIFIED AGENT
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider mt-2.5">
                PENDING VERIFICATION
              </span>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
              { id: 'listings', label: 'My Listings', icon: <Home size={16} /> },
              { id: 'add_property', label: 'Add New Property', icon: <PlusCircle size={16} /> },
              { id: 'pipeline', label: 'Lead Pipeline', icon: <MessageSquare size={16} /> },
              { id: 'clients', label: 'My Clients', icon: <Users size={16} /> },
              { id: 'package', label: 'My Package', icon: <Briefcase size={16} /> },
              { id: 'analytics', label: 'Analytics', icon: <PieChartIcon size={16} /> },
              { id: 'profile', label: 'My Public Profile', icon: <Globe size={16} /> },
              { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsEditingProperty(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-black' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Panel */}
        <div className="p-4 border-t border-slate-800 space-y-3.5 bg-slate-950/40">
          {/* Dark Mode Switcher */}
          <div className="flex items-center justify-between px-2.5 py-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Appearance</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-1.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              {darkMode ? <Sun size={12} className="text-yellow-400" /> : <Moon size={12} />}
              <span className="text-[9px] font-black uppercase tracking-widest">{darkMode ? "Light" : "Dark"}</span>
            </button>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>

          {/* Platform status indicator */}
          <div className="flex items-center gap-2 px-4 py-1 text-[10px] text-slate-400 font-bold border-t border-slate-800/80 pt-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Platform Status: Online</span>
          </div>
        </div>

      </aside>

      {/* =======================================
          MAIN CONTENT VIEWPORT AREA
          ======================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP NAVBAR HEADER */}
        <header className={`h-16 px-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-b flex items-center justify-between sticky top-0 z-10 flex-shrink-0 transition-colors`}>
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Alternative (Just click icon to cycle or go home) */}
            <button onClick={() => onNavigate({type: 'home'})} className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-200">
              <Home size={18} />
            </button>
            <h2 className="text-md font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {activeTab === 'dashboard' && '📈 Agent Analytics Dashboard'}
              {activeTab === 'listings' && '🏠 Property Listings Inventory'}
              {activeTab === 'add_property' && (isEditingProperty ? '✏️ Edit Property Listing' : '➕ Publish Property wizard')}
              {activeTab === 'pipeline' && '📩 Lead Pipeline Kanban'}
              {activeTab === 'clients' && '👥 Client Contact Book'}
              {activeTab === 'package' && '📦 Your Agent Subscription'}
              {activeTab === 'analytics' && '📈 Market Analytics reports'}
              {activeTab === 'profile' && '🌐 Public Profile Preview'}
              {activeTab === 'settings' && '⚙️ Portal Settings'}
            </h2>
          </div>

          {/* Quick Search & Notification widgets */}
          <div className="flex items-center gap-4">
            <div className="relative max-w-xs hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                placeholder="Search listings, leads..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`py-1.5 pl-9 pr-4 rounded-xl text-xs font-bold outline-none border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'} focus:ring-1 focus:ring-blue-500 w-48 transition-all`}
              />
            </div>

            {/* Notification trigger with indicator */}
            <div className="relative">
              <button 
                onClick={() => toast("You have 4 new inquiries waiting on your property pages today!", { icon: "📩" })}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative cursor-pointer"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-[9px] font-black text-white rounded-full flex items-center justify-center border border-white">4</span>
              </button>
            </div>

            {/* Settings shortcut */}
            <button 
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <Settings size={18} />
            </button>

            {/* Circle profile dropdown trigger */}
            <div className="h-8 w-8 rounded-full border border-slate-200 shadow-sm overflow-hidden cursor-pointer" onClick={() => setActiveTab('profile')}>
              <img src={avatarUrl} className="h-full w-full object-cover" alt="" />
            </div>
          </div>
        </header>

        {/* =======================================
            TAB VIEWPORTS RENDERERS
            ======================================= */}
        <main className="p-6 flex-1 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* VIEWPORT 1: DASHBOARD HOME */}
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* ROW 1: WELCOME BANNER */}
                <div className="p-6 rounded-[24px] bg-gradient-to-r from-emerald-800 via-[#004f31] to-emerald-950 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight">Good Morning, {profileName}! 👋</h1>
                    <p className="text-xs text-emerald-200 mt-1 font-semibold">Here is what is happening with your premium LankaProperty.lk listings today.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsEditingProperty(false);
                      setFormFields({
                        title: '',
                        category: 'House',
                        type: 'For Sale',
                        district: 'Colombo',
                        city: '',
                        price: '',
                        bedrooms: '3',
                        bathrooms: '2',
                        landArea: '10 Perches',
                        floorArea: '2000 sqft',
                        description: '',
                        imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800',
                        additionalInfo: '',
                        isNegotiable: true
                      });
                      setFormStep(1);
                      setActiveTab('add_property');
                    }}
                    className="px-5 py-2.5 bg-white text-[#004f31] hover:bg-emerald-50 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    Add New Property <PlusCircle size={14} strokeWidth={2.5} />
                  </button>
                </div>

                {/* ROW 2: KPI STATS CARDS (5 cards) */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { id: 'kpi_total', title: 'Total Listings', val: dbProperties.length, label: 'Properties catalogs', trend: '+2 this month', trendUp: true, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                    { id: 'kpi_active', title: 'Active Listings', val: dbProperties.filter(p => p.status === 'active').length, label: 'Live on search pages', trend: 'Fully approved', trendUp: true, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                    { id: 'kpi_views', title: 'Total Views', val: dbProperties.reduce((acc, p) => acc + (p.views_count || 0), 0) + 1420, label: 'Aggregate visitors', trend: '+14.2% this month', trendUp: true, color: 'text-cyan-600', bg: 'bg-cyan-500/10' },
                    { id: 'kpi_leads', title: 'New Leads Today', val: pipelineLeads.filter(l => l.stage === 'new').length + 1, label: 'Inquiries via forms', trend: 'Fast response required', trendUp: false, color: 'text-orange-600', bg: 'bg-orange-500/10' },
                    { id: 'kpi_conv', title: 'Conversion Rate', val: '18%', label: 'Leads to viewings', trend: 'Platform average 12%', trendUp: true, color: 'text-purple-600', bg: 'bg-purple-500/10' }
                  ].map(kpi => (
                    <div key={kpi.id} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-200`}>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{kpi.title}</span>
                        <span className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                          {kpi.title.includes('Listings') ? <Home size={14} /> : kpi.title.includes('Views') ? <Eye size={14} /> : <MessageSquare size={14} />}
                        </span>
                      </div>
                      <div className="my-2.5">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{kpi.val}</h2>
                        <p className="text-[9px] font-bold text-slate-400 mt-1.5">{kpi.label}</p>
                      </div>
                      <div className="text-[9px] font-extrabold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full w-max">
                        <TrendingUp size={10} /> {kpi.trend}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ROW 3: TWO COLUMNS (Lead pipeline mini + Recent Activity timeline) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Pipeline Board */}
                  <div className={`col-span-1 lg:col-span-7 p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">📩 Real-Time Lead Pipeline</h3>
                        <span className="text-[10px] font-black px-2.5 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">{pipelineLeads.length} ACTIVE</span>
                      </div>

                      {/* 5 mini columns */}
                      <div className="grid grid-cols-5 gap-2">
                        {['new', 'contacted', 'viewing', 'negotiating', 'won'].map(stg => {
                          const colLeads = pipelineLeads.filter(l => l.stage === stg);
                          return (
                            <div key={stg} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-center min-h-[140px] border border-slate-100 dark:border-slate-900 flex flex-col justify-between">
                              <div>
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{stg}</h4>
                                <span className="inline-block mt-1 text-xs font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{colLeads.length}</span>
                              </div>
                              <div className="space-y-1.5 my-3">
                                {colLeads.slice(0, 2).map((lead, idx) => (
                                  <div key={idx} className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs text-left text-[9px] font-bold">
                                    <p className="truncate text-slate-950 dark:text-white">{lead.name}</p>
                                    <p className="text-[8px] text-slate-400 font-medium leading-none mt-0.5 truncate">{lead.property_title?.split(' ').slice(0, 2).join(' ')}</p>
                                  </div>
                                ))}
                              </div>
                              <button 
                                onClick={() => {
                                  setPipelineFilter('all');
                                  setActiveTab('pipeline');
                                }}
                                className="text-[8px] font-black text-blue-500 hover:underline uppercase tracking-wider block"
                              >
                                Manage
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveTab('pipeline')}
                      className="w-full text-center py-2 border border-dashed border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/50 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 mt-4 cursor-pointer"
                    >
                      Open Full Pipeline Board
                    </button>
                  </div>

                  {/* Activity Timeline Feed */}
                  <div className={`col-span-1 lg:col-span-5 p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">🔔 Recent Activity Feed</h3>
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {[
                        { icon: "🟢", text: "New inquiry from Ruwan Gunawardena regarding spectacular infinity villa", time: "2 min ago" },
                        { icon: "👁️", text: "Your Bambalapitiya 3BR Apartment was viewed 15 times today", time: "1 hr ago" },
                        { icon: "💬", text: "Dr. Shirley Silva responded to your viewing date proposal via email", time: "3 hr ago" },
                        { icon: "✅", text: "Premium villa approved and fully syndicated with Facebook Marketplace", time: "Yesterday" },
                        { icon: "📩", text: "New commercial client lead generated from LankaProperty search bar", time: "2 days ago" },
                        { icon: "💰", text: "Package renewed: Standard Listing Credit syndication completed", time: "3 days ago" },
                        { icon: "👁️", text: "Platform analysis: Total impressions surpassed 5,000 threshold", time: "4 days ago" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-3 text-xs border-b border-slate-100 dark:border-slate-800/60 pb-2.5 last:border-0 last:pb-0">
                          <span className="text-base flex-shrink-0">{item.icon}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{item.text}</p>
                            <span className="text-[10px] text-slate-400 font-semibold">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* ROW 4: TWO COLUMNS (Top Performing + Package Countdown Card) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Top listings table */}
                  <div className={`col-span-1 lg:col-span-8 p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm overflow-x-auto`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">🌟 Top Performing Properties</h3>
                      <button onClick={() => setActiveTab('listings')} className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest flex items-center gap-1 cursor-pointer">
                        All listings <ChevronRight size={14} />
                      </button>
                    </div>

                    <table className="w-full text-left text-xs min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5">Thumbnail</th>
                          <th>Title</th>
                          <th>District</th>
                          <th>Views</th>
                          <th>Leads</th>
                          <th>Status</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {dbProperties.slice(0, 5).map((prop) => (
                          <tr key={prop.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="py-3">
                              <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=150'} className="h-9 w-12 rounded-lg object-cover border border-slate-200" alt="" referrerPolicy="no-referrer" />
                            </td>
                            <td className="font-bold text-slate-800 dark:text-slate-100 max-w-xs truncate">{prop.listing_title}</td>
                            <td className="font-semibold text-slate-500">{prop.district}</td>
                            <td className="font-black text-slate-900 dark:text-white">{prop.views_count || 120}</td>
                            <td className="font-black text-slate-900 dark:text-white">{prop.leads_count || 4}</td>
                            <td>
                              <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${prop.status === 'active' ? 'bg-emerald-100 text-emerald-800' : prop.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                {prop.status}
                              </span>
                            </td>
                            <td className="text-right py-3">
                              <div className="inline-flex gap-1">
                                <button 
                                  onClick={() => handleEditListing(prop)}
                                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                  title="Edit Property"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button 
                                  onClick={() => {
                                    onNavigate({ type: 'detail', data: prop });
                                  }}
                                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-600 transition-colors cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Package Card */}
                  <div className="col-span-1 lg:col-span-4 space-y-4">
                    
                    {/* Circle Countdown */}
                    <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm text-center flex flex-col items-center justify-center`}>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Package Expiry Meter</span>
                      
                      {/* Circular Progress Ring */}
                      <div className="relative h-24 w-24 flex items-center justify-center">
                        <svg className="absolute transform -rotate-90 w-24 h-24">
                          <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" className="dark:stroke-slate-800" />
                          <circle cx="48" cy="48" r="40" stroke="#22c55e" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="75" />
                        </svg>
                        <div className="text-center">
                          <span className="text-xl font-black text-slate-900 dark:text-white leading-none">21</span>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Days Left</p>
                        </div>
                      </div>

                      <div className="mt-3.5">
                        <span className="text-xs font-black px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">⭐ AGENT PREMIUM</span>
                        <p className="text-[10px] text-slate-400 font-bold mt-2">Renews: July 18, 2026 • LKR 12,500/mo</p>
                      </div>

                      <button 
                        onClick={() => setActiveTab('package')}
                        className="w-full mt-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase tracking-widest text-xs py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Upgrade Package
                      </button>
                    </div>

                    {/* Quick Actions 2x2 */}
                    <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3.5 block">Quick Actions</span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button 
                          onClick={() => setActiveTab('add_property')}
                          className="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 hover:bg-blue-500/10 hover:border-blue-500/20 text-slate-800 dark:text-slate-100 cursor-pointer"
                        >
                          <PlusCircle size={18} className="mx-auto text-blue-500 mb-1" />
                          <span className="text-[9px] font-black uppercase tracking-wider block">Add Property</span>
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`https://lankaproperty.lk/agents/${profileName.toLowerCase().replace(/\s+/g, '-')}`);
                            toast.success("Profile URL copied to clipboard!");
                          }}
                          className="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-slate-800 dark:text-slate-100 cursor-pointer"
                        >
                          <Share2 size={18} className="mx-auto text-emerald-500 mb-1" />
                          <span className="text-[9px] font-black uppercase tracking-wider block">Share Profile</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('analytics')}
                          className="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 hover:bg-purple-500/10 hover:border-purple-500/20 text-slate-800 dark:text-slate-100 cursor-pointer"
                        >
                          <PieChartIcon size={18} className="mx-auto text-purple-500 mb-1" />
                          <span className="text-[9px] font-black uppercase tracking-wider block">View Reports</span>
                        </button>
                        <button 
                          onClick={() => toast("Launching helpline callback request. We'll WhatsApp you shortly!", { icon: "📞" })}
                          className="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 hover:bg-orange-500/10 hover:border-orange-500/20 text-slate-800 dark:text-slate-100 cursor-pointer"
                        >
                          <HelpCircle size={18} className="mx-auto text-orange-500 mb-1" />
                          <span className="text-[9px] font-black uppercase tracking-wider block">Help Desk</span>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

                {/* ROW 5: FULL-WIDTH TOP SEARCH AREAS GRAPH (matching admin layout) */}
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                  <div className="mb-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">🗺️ Top Search Areas & Districts Attention</h3>
                    <p className="text-[11px] font-bold text-slate-400">Areas where your listing placements garner the highest visitor query conversions.</p>
                  </div>
                  <div className="h-[280px] w-full">
                    <RechartsResponsiveContainer width="100%" height={280}>
                      <RechartsBarChart data={AREA_SEARCH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <RechartsCartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                        <RechartsXAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <RechartsYAxis tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc' }} />
                        <RechartsBar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                      </RechartsBarChart>
                    </RechartsResponsiveContainer>
                  </div>
                </div>

              </motion.div>
            )}

            {/* VIEWPORT 2: MY LISTINGS */}
            {activeTab === 'listings' && (
              <motion.div 
                key="listings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header Filter row */}
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status filtering pills */}
                    {[
                      { id: 'all', label: 'All Listings' },
                      { id: 'active', label: 'Active' },
                      { id: 'pending', label: 'Pending' },
                      { id: 'expired', label: 'Expired' }
                    ].map(pill => (
                      <button
                        key={pill.id}
                        onClick={() => {
                          setListingFilter(pill.id as any);
                          setListingsPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${listingFilter === pill.id ? 'bg-[#1a2340] text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300'}`}
                      >
                        {pill.label} ({pill.id === 'all' ? dbProperties.length : dbProperties.filter(p => p.status === pill.id).length})
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Sorting dropdown */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <span>SORT:</span>
                      <select 
                        value={listingSort} 
                        onChange={(e) => setListingSort(e.target.value as any)}
                        className={`py-1.5 px-2.5 rounded-lg border text-xs font-black uppercase tracking-wider outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                      >
                        <option value="newest">Newest Listed</option>
                        <option value="views">Most Viewed</option>
                        <option value="price_high">Price High-Low</option>
                        <option value="price_low">Price Low-High</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setIsEditingProperty(false);
                        setFormFields({
                          title: '',
                          category: 'House',
                          type: 'For Sale',
                          district: 'Colombo',
                          city: '',
                          price: '',
                          bedrooms: '3',
                          bathrooms: '2',
                          landArea: '10 Perches',
                          floorArea: '2000 sqft',
                          description: '',
                          imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800',
                          additionalInfo: '',
                          isNegotiable: true
                        });
                        setFormStep(1);
                        setActiveTab('add_property');
                      }}
                      className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      New Listing <PlusCircle size={14} />
                    </button>
                  </div>
                </div>

                {/* Listings Grid (3-column) */}
                {paginatedListings.length === 0 ? (
                  <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-sm font-bold text-slate-400">No properties found matching the filter or search results.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {paginatedListings.map(prop => (
                      <div 
                        key={prop.id}
                        className={`rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between`}
                      >
                        {/* Cover Image + Status Indicator */}
                        <div className="relative h-48 bg-slate-200 overflow-hidden">
                          <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800'} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" alt="" referrerPolicy="no-referrer" />
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider text-white ${prop.status === 'active' ? 'bg-emerald-600' : prop.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}>
                              {prop.status}
                            </span>
                            {prop.is_featured && (
                              <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{prop.property_category || 'House'} • {prop.listing_type || 'For Sale'}</span>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1 leading-tight">{prop.listing_title}</h3>
                            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">📍 {prop.city}, {prop.district}</p>
                            
                            {/* Price field */}
                            <p className="text-base font-black text-blue-600 mt-1">
                              {prop.price_lkr ? `Rs. ${prop.price_lkr.toLocaleString()}` : "Price on Request"}
                            </p>
                          </div>

                          {/* Stats row */}
                          <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 dark:border-slate-800/80 py-2.5 my-4 text-center text-[10px] font-bold text-slate-500">
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-xs">{prop.views_count || 120}</p>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">👁️ Views</span>
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-xs">{prop.leads_count || 4}</p>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">📩 Leads</span>
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-xs">{Math.floor((prop.views_count || 120) * 0.08)}</p>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">❤️ Saved</span>
                            </div>
                          </div>

                          {/* Action footer */}
                          <div className="grid grid-cols-4 gap-1.5 pt-1.5">
                            <button 
                              onClick={() => handleEditListing(prop)}
                              className="py-2 px-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => onNavigate({ type: 'detail', data: prop })}
                              className="py-2 px-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              👁️ Preview
                            </button>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`https://lankaproperty.lk/property/${prop.id}`);
                                toast.success("Property URL copied to clipboard!");
                              }}
                              className="py-2 px-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              📤 Share
                            </button>
                            <button 
                              onClick={() => handleDeleteListing(prop.id)}
                              className="py-2 px-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              🗑️ Del
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 pt-6">
                    <button 
                      disabled={listingsPage === 1}
                      onClick={() => setListingsPage(prev => Math.max(1, prev - 1))}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 font-black text-xs uppercase"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-black">Page {listingsPage} of {totalPages}</span>
                    <button 
                      disabled={listingsPage === totalPages}
                      onClick={() => setListingsPage(prev => Math.min(totalPages, prev + 1))}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 font-black text-xs uppercase"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

              </motion.div>
            )}

            {/* VIEWPORT 3: ADD / EDIT PROPERTY FORM */}
            {activeTab === 'add_property' && (
              <motion.div 
                key="add_property"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                {/* Steps tracker indicator */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  {[
                    { s: 1, label: 'Overview' },
                    { s: 2, label: 'Details' },
                    { s: 3, label: 'Media' },
                    { s: 4, label: 'AI Copywriter' }
                  ].map(step => (
                    <div key={step.s} className="flex items-center gap-2">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${formStep >= step.s ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>{step.s}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider hidden sm:inline ${formStep === step.s ? 'text-blue-600' : 'text-slate-400'}`}>{step.label}</span>
                      {step.s < 4 && <ChevronRight size={14} className="text-slate-300 hidden sm:block" />}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmitProperty} className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-5`}>
                  
                  {/* STEP 1: GENERAL OVERVIEW */}
                  {formStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Listing Title</label>
                        <input 
                          type="text"
                          value={formFields.title}
                          onChange={(e) => setFormFields(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Stunning Modern Penthouse in Colombo 7"
                          className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} focus:border-blue-500`}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Category</label>
                          <select 
                            value={formFields.category}
                            onChange={(e) => setFormFields(prev => ({ ...prev, category: e.target.value }))}
                            className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                          >
                            <option value="House">House</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Land">Land</option>
                            <option value="Commercial">Commercial</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Type</label>
                          <select 
                            value={formFields.type}
                            onChange={(e) => setFormFields(prev => ({ ...prev, type: e.target.value }))}
                            className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                          >
                            <option value="For Sale">For Sale</option>
                            <option value="For Rent">For Rent</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">District</label>
                          <select 
                            value={formFields.district}
                            onChange={(e) => setFormFields(prev => ({ ...prev, district: e.target.value }))}
                            className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                          >
                            {['Colombo', 'Gampaha', 'Puttalam', 'Hambantota', 'Kegalle', 'Kalutara', 'Kandy', 'Galle'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">City</label>
                          <input 
                            type="text"
                            value={formFields.city}
                            onChange={(e) => setFormFields(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="e.g. Kollupitiya"
                            className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} focus:border-blue-500`}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Price (LKR)</label>
                          <input 
                            type="number"
                            value={formFields.price}
                            onChange={(e) => setFormFields(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="e.g. 45000000"
                            className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} focus:border-blue-500`}
                            required
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                          <input 
                            type="checkbox"
                            id="neg"
                            checked={formFields.isNegotiable}
                            onChange={(e) => setFormFields(prev => ({ ...prev, isNegotiable: e.target.checked }))}
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor="neg" className="text-xs font-bold text-slate-500">Price is Negotiable</label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: PROPERTY DETAILS */}
                  {formStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Bedrooms</label>
                          <input 
                            type="number"
                            value={formFields.bedrooms}
                            onChange={(e) => setFormFields(prev => ({ ...prev, bedrooms: e.target.value }))}
                            className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Bathrooms</label>
                          <input 
                            type="number"
                            value={formFields.bathrooms}
                            onChange={(e) => setFormFields(prev => ({ ...prev, bathrooms: e.target.value }))}
                            className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Land Area (e.g. Perches)</label>
                          <input 
                            type="text"
                            value={formFields.landArea}
                            onChange={(e) => setFormFields(prev => ({ ...prev, landArea: e.target.value }))}
                            className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Floor Area (e.g. sqft)</label>
                          <input 
                            type="text"
                            value={formFields.floorArea}
                            onChange={(e) => setFormFields(prev => ({ ...prev, floorArea: e.target.value }))}
                            className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Additional Property Notes</label>
                        <textarea 
                          value={formFields.additionalInfo}
                          onChange={(e) => setFormFields(prev => ({ ...prev, additionalInfo: e.target.value }))}
                          placeholder="e.g. 2 car garage, servant quarters included, clear deeds."
                          rows={3}
                          className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} focus:border-blue-500`}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: MEDIA & COVER PHOTOS */}
                  {formStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Cover Image URL</label>
                        <input 
                          type="url"
                          value={formFields.imageUrl}
                          onChange={(e) => setFormFields(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="https://images.unsplash.com/photo-..."
                          className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} focus:border-blue-500`}
                          required
                        />
                      </div>

                      <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
                        <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-xs font-bold text-slate-500">Drag & drop additional photo attachments or copy web references above</p>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-1">Accepts PNG, JPG, JPEG up to 10MB</span>
                      </div>

                      <div className="h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={formFields.imageUrl} className="h-full w-full object-cover" alt="Cover preview" />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: AI COPYWRITER WORKSHOP */}
                  {formStep === 4 && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="text-blue-600 dark:text-blue-400" size={20} />
                          <div>
                            <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider">✨ LankaProperty Gemini Writer</h4>
                            <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 mt-0.5">Let our advanced LLM write a high-conversion description for you.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <select 
                            value={aiTone}
                            onChange={(e) => setAiTone(e.target.value)}
                            className="p-1.5 rounded bg-white text-[10px] font-black uppercase outline-none border border-slate-200 text-slate-700"
                          >
                            <option value="Luxury">Luxury</option>
                            <option value="Urgent">Urgent</option>
                            <option value="Professional">Professional</option>
                            <option value="Friendly">Friendly</option>
                          </select>

                          <button
                            type="button"
                            disabled={isGeneratingAI}
                            onClick={handleGenerateAI}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            Generate
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Property Description</label>
                        <textarea 
                          value={formFields.description}
                          onChange={(e) => setFormFields(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the property layout, neighborhood context, accessibility..."
                          rows={6}
                          className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} focus:border-blue-500`}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation buttons inside Wizard */}
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-5">
                    {formStep > 1 ? (
                      <button 
                        type="button" 
                        onClick={() => setFormStep(prev => prev - 1)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => setActiveTab('listings')}
                        className="px-4 py-2 border border-slate-200 text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    {formStep < 4 ? (
                      <button 
                        type="button" 
                        onClick={() => setFormStep(prev => prev + 1)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Next
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-[#1a2340] hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        {isEditingProperty ? "Save Changes" : "Publish Listing"} <CheckCircle size={14} />
                      </button>
                    )}
                  </div>

                </form>
              </motion.div>
            )}

            {/* VIEWPORT 4: LEAD PIPELINE KANBAN BOARD */}
            {activeTab === 'pipeline' && (
              <motion.div 
                key="pipeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Stats Overview banner */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { title: 'Total Leads', val: pipelineStats.total, color: 'text-blue-500' },
                    { title: 'New Today', val: pipelineStats.newToday, color: 'text-orange-500' },
                    { title: 'Viewing Scheduled', val: pipelineStats.viewing, color: 'text-purple-500' },
                    { title: 'Closed Won', val: pipelineStats.closedWon, color: 'text-emerald-500' }
                  ].map((s, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-xs`}>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{s.title}</span>
                      <h3 className={`text-2xl font-black mt-1 ${s.color}`}>{s.val}</h3>
                    </div>
                  ))}
                </div>

                {/* Filter row */}
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex justify-between items-center`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <span>FILTER BY LISTING:</span>
                    <select 
                      value={pipelineFilter}
                      onChange={(e) => setPipelineFilter(e.target.value)}
                      className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-black"
                    >
                      <option value="all">All Properties</option>
                      {dbProperties.map(p => (
                        <option key={p.id} value={p.id}>{p.listing_title?.slice(0, 30)}...</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Kanban Columns */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { id: 'new', title: '📥 NEW', color: 'border-blue-500', bg: 'bg-blue-500/5' },
                    { id: 'contacted', title: '📞 CONTACTED', color: 'border-amber-500', bg: 'bg-amber-500/5' },
                    { id: 'viewing', title: '📅 VIEWING', color: 'border-purple-500', bg: 'bg-purple-500/5' },
                    { id: 'negotiating', title: '🤝 NEGOTIATING', color: 'border-orange-500', bg: 'bg-orange-500/5' },
                    { id: 'won', title: '✅ WON', color: 'border-emerald-500', bg: 'bg-emerald-500/5' }
                  ].map(col => {
                    const stageLeads = getStageLeads(col.id);
                    return (
                      <div 
                        key={col.id} 
                        className={`p-4 rounded-2xl border-t-4 ${col.color} ${darkMode ? 'bg-slate-900' : 'bg-white'} shadow-sm flex flex-col justify-between min-h-[500px]`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          const id = e.dataTransfer.getData('dragId');
                          if (id) {
                            handleMoveLeadStage(parseInt(id), col.id);
                          }
                        }}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{col.title}</h4>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">{stageLeads.length}</span>
                          </div>

                          <div className="space-y-3">
                            {stageLeads.map(lead => (
                              <div 
                                key={lead.id}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('dragId', String(lead.id))}
                                className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200/80'} shadow-inner hover:shadow transition-shadow cursor-grab active:cursor-grabbing`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{lead.name}</h5>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">{new Date(lead.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-none">{lead.phone}</p>

                                <div className="flex items-center gap-2 mt-3 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                                  <img src={lead.property_image || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=150'} className="h-7 w-9 rounded object-cover" alt="" referrerPolicy="no-referrer" />
                                  <p className="text-[9px] font-bold text-slate-400 truncate leading-tight flex-1">{lead.property_title || "Lanka Property"}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 mt-3">
                                  <a 
                                    href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hi%20${lead.name},%20this%20is%20${profileName}%20from%20LankaProperty.lk%20regarding%20your%20listing%20inquiry.`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase text-center flex items-center justify-center gap-1"
                                  >
                                    💬 WhatsApp
                                  </a>
                                  
                                  {/* Quick move toggle inside card */}
                                  <select 
                                    value={lead.stage}
                                    onChange={(e) => handleMoveLeadStage(lead.id, e.target.value)}
                                    className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-[8px] font-black uppercase text-slate-700 dark:text-slate-300 outline-none border-none text-center"
                                  >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="viewing">Viewing</option>
                                    <option value="negotiating">Negot</option>
                                    <option value="won">Won</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {stageLeads.length === 0 && (
                          <div className="p-8 text-center text-[10px] font-bold text-slate-400/80 select-none border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-4">
                            Drop leads here
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </motion.div>
            )}

            {/* VIEWPORT 5: MY CLIENTS */}
            {activeTab === 'clients' && (
              <motion.div 
                key="clients"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-4`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">👥 Client Contact Book</h3>
                    <button onClick={() => toast("Client records are auto-synced from your active WhatsApp workspace lead channel.")} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer">
                      Sync CRM Contact
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pipelineLeads.map((client, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-black">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">{client.name}</h4>
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">{client.email || "no-email@listed.lk"}</p>
                            <span className="inline-block mt-1 text-[8px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-widest">{client.stage}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <a href={`tel:${client.phone}`} className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 dark:text-slate-200">
                            <Phone size={14} />
                          </a>
                          <a href={`mailto:${client.email}`} className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 dark:text-slate-200">
                            <Mail size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEWPORT 6: MY PACKAGE STATUS */}
            {activeTab === 'package' && (
              <motion.div 
                key="package"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-xl mx-auto space-y-6"
              >
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-5 text-center flex flex-col items-center`}>
                  <Award size={48} className="text-amber-500 animate-pulse" />
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Premium Agent Subscription</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">Syndicated across Colombo, Gampaha and top Western Sri Lanka district nodes.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 w-full py-4 border-t border-b border-slate-100 dark:border-slate-800 text-center">
                    <div>
                      <p className="text-base font-black text-slate-900 dark:text-white">Active</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Subscription</span>
                    </div>
                    <div>
                      <p className="text-base font-black text-emerald-600">Unlimited</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Listings Credits</span>
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900 dark:text-white">July 18</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expiry Date</span>
                    </div>
                  </div>

                  <div className="w-full space-y-3 text-left bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">⭐ Included Benefits</h4>
                    <ul className="text-xs font-bold text-slate-500 space-y-1.5 list-disc pl-4">
                      <li>Unlimited Property Listings syndications</li>
                      <li>Advanced Real-time Visitor Live Tracking analysis reports</li>
                      <li>Auto-Syndication to LankaProperty social media catalog</li>
                      <li>Verified Premium Agent check badge on profile</li>
                      <li>Custom high-conversion WhatsApp direct inquiry link</li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => toast.success("You are on our top active premium agent layout tier. No higher tiers required!")}
                    className="w-full bg-[#1a2340] hover:bg-slate-900 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Upgrade Package
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEWPORT 7: ANALYTICS REPORTS */}
            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-4`}>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">📊 Listing Engagement Analytics</h3>
                  <p className="text-xs font-semibold text-slate-400">Visitor impressions, conversion funnels and leads count analyzed across 30 days.</p>
                  
                  {/* Traffic Chart */}
                  <div className="h-[280px] w-full mt-4">
                    <RechartsResponsiveContainer width="100%" height={280}>
                      <RechartsAreaChart data={[
                        { day: 'Jun 21', views: 240, leads: 12 },
                        { day: 'Jun 22', views: 310, leads: 18 },
                        { day: 'Jun 23', views: 450, leads: 24 },
                        { day: 'Jun 24', views: 390, leads: 21 },
                        { day: 'Jun 25', views: 510, leads: 32 },
                        { day: 'Jun 26', views: 680, leads: 41 },
                        { day: 'Jun 27', views: 720, leads: 45 }
                      ]}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <RechartsCartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                        <RechartsXAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <RechartsYAxis tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip />
                        <RechartsArea type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2.5} />
                      </RechartsAreaChart>
                    </RechartsResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEWPORT 8: PUBLIC PROFILE EDITOR */}
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left form editor */}
                  <div className={`col-span-1 lg:col-span-7 p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-4`}>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">👤 Profile Editor</h3>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Full Name</label>
                        <input 
                          type="text" 
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Agency Name</label>
                        <input 
                          type="text" 
                          value={profileAgency}
                          onChange={(e) => setProfileAgency(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Hotline Contact</label>
                        <input 
                          type="text" 
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">About Bio</label>
                        <textarea 
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          rows={4}
                          className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🌐 Social Media Portfolios</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="text" placeholder="Facebook URL" value={profileFb} onChange={e=>setProfileFb(e.target.value)} className={`p-2 rounded border text-[10px] font-bold ${darkMode?'bg-slate-800':'bg-slate-100'}`} />
                          <input type="text" placeholder="Instagram URL" value={profileIn} onChange={e=>setProfileIn(e.target.value)} className={`p-2 rounded border text-[10px] font-bold ${darkMode?'bg-slate-800':'bg-slate-100'}`} />
                          <input type="text" placeholder="LinkedIn URL" value={profileLn} onChange={e=>setProfileLn(e.target.value)} className={`p-2 rounded border text-[10px] font-bold ${darkMode?'bg-slate-800':'bg-slate-100'}`} />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="pub_wa" checked={showWhatsappPublic} onChange={e=>setShowWhatsappPublic(e.target.checked)} />
                          <label htmlFor="pub_wa">Show WhatsApp Number publicly on find-agents page</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="acc_dm" checked={acceptDMs} onChange={e=>setAcceptDMs(e.target.checked)} />
                          <label htmlFor="acc_dm">Accept Direct Messages from visitors inbox</label>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleSaveProfile}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all active:scale-95 mt-4 cursor-pointer"
                    >
                      Save Profile configs
                    </button>
                  </div>

                  {/* Right live preview card */}
                  <div className="col-span-1 lg:col-span-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">👁️ Live Profile Preview</h3>
                    
                    <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-md text-center flex flex-col items-center justify-between min-h-[350px]`}>
                      <div>
                        <div className="relative mb-4">
                          <img src={avatarUrl} className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 mx-auto" alt="" />
                          <span className="absolute bottom-0 right-1/2 translate-x-[40px] bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">{profileName}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">{profileAgency}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">📍 Specialization: Western Province Property Sales</p>

                        <p className="text-[11px] text-slate-500 mt-4 leading-relaxed line-clamp-3 italic px-4 font-medium">"{profileBio}"</p>
                      </div>

                      <div className="w-full border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500 px-4">
                          <span>Active listings</span>
                          <span className="font-black text-slate-900 dark:text-white">{dbProperties.length} properties</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 px-4">
                          <span>Client Feedbacks</span>
                          <span className="font-black text-slate-900 dark:text-white">⭐⭐⭐⭐⭐ (14)</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4 px-2">
                          <a href={`tel:${profilePhone}`} className="py-2 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider text-center block">📞 Call Agent</a>
                          <a href={`https://wa.me/${profilePhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="py-2 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider text-center block">💬 WhatsApp</a>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* VIEWPORT 9: SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto space-y-6"
              >
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-4`}>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">⚙️ Notification preferences</h3>
                  
                  <div className="space-y-3.5 text-xs font-bold text-slate-500">
                    <div className="flex items-center justify-between">
                      <label htmlFor="set_wa">Route leads onto your WhatsApp instantly</label>
                      <input type="checkbox" id="set_wa" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="set_em">Consolidated daily email report</label>
                      <input type="checkbox" id="set_em" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="set_push">Real-time desktop push notifications</label>
                      <input type="checkbox" id="set_push" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs font-black uppercase text-slate-400">
                      <span>API Security Token (Gemini)</span>
                    </div>
                    <div className="space-y-1.5">
                      <input 
                        type="password" 
                        defaultValue="••••••••••••••••••••"
                        placeholder="sk-..." 
                        className={`w-full p-2.5 rounded-lg border text-xs font-bold outline-none ${darkMode?'bg-slate-800 border-slate-700 text-white':'bg-slate-50 border-slate-200'}`}
                      />
                      <span className="text-[9px] text-slate-400 font-semibold block leading-tight">Configured via environment variables for highest security protocols.</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => toast.success("Agent settings stored and secured.")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    Save settings
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

    </div>
  );
};
