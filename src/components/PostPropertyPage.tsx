import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, X, ArrowRight, ArrowLeft, Sparkles, Lock, 
  Camera, Trash2, Info, Eye, ChevronLeft, ChevronRight, 
  Plus, Minus, MapPin, Share2, EyeOff, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import { generateDescription } from '../services/geminiService';
import { slugify } from '../utils/safeUtils';

// Fix Leaflet Default Icon asset paths so they don't break in dev/prod
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Map click listener component
function MapClickEvents({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    }
  });
  return null;
}

interface PostPropertyPageProps {
  onNavigate: (view: any) => void;
  onNavigateHome: () => void;
}

// 25 Districts in Sri Lanka
const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle"
];

// Province-wise groupings for Districts
const PROVINCE_DISTRICTS = [
  {
    province: "Western Province",
    districts: ["Colombo", "Gampaha", "Kalutara"]
  },
  {
    province: "Central Province",
    districts: ["Kandy", "Matale", "Nuwara Eliya"]
  },
  {
    province: "Southern Province",
    districts: ["Galle", "Matara", "Hambantota"]
  },
  {
    province: "Northern Province",
    districts: ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"]
  },
  {
    province: "Eastern Province",
    districts: ["Batticaloa", "Ampara", "Trincomalee"]
  },
  {
    province: "North Western Province",
    districts: ["Kurunegala", "Puttalam"]
  },
  {
    province: "North Central Province",
    districts: ["Anuradhapura", "Polonnaruwa"]
  },
  {
    province: "Uva Province",
    districts: ["Badulla", "Monaragala"]
  },
  {
    province: "Sabaragamuwa Province",
    districts: ["Ratnapura", "Kegalle"]
  }
];

// Popular Sri Lankan Cities Autocomplete List
const POPULAR_CITIES = [
  { city: "Colombo 01 (Fort)", district: "Colombo" },
  { city: "Colombo 03 (Kollupitiya)", district: "Colombo" },
  { city: "Colombo 04 (Bambalapitiya)", district: "Colombo" },
  { city: "Colombo 05 (Havelock Town)", district: "Colombo" },
  { city: "Colombo 07 (Cinnamon Gardens)", district: "Colombo" },
  { city: "Borella", district: "Colombo" },
  { city: "Dehiwala", district: "Colombo" },
  { city: "Mount Lavinia", district: "Colombo" },
  { city: "Nugegoda", district: "Colombo" },
  { city: "Kotte", district: "Colombo" },
  { city: "Malabe", district: "Colombo" },
  { city: "Battaramulla", district: "Colombo" },
  { city: "Kottawa", district: "Colombo" },
  { city: "Maharagama", district: "Colombo" },
  { city: "Kaduwela", district: "Colombo" },
  { city: "Piliyandala", district: "Colombo" },
  { city: "Moratuwa", district: "Colombo" },
  { city: "Talawatugoda", district: "Colombo" },
  { city: "Yakkala", district: "Gampaha" },
  { city: "Gampaha Town", district: "Gampaha" },
  { city: "Negombo", district: "Gampaha" },
  { city: "Kadawatha", district: "Gampaha" },
  { city: "Kiribathgoda", district: "Gampaha" },
  { city: "Wattala", district: "Gampaha" },
  { city: "Ja-Ela", district: "Gampaha" },
  { city: "Kelaniya", district: "Gampaha" },
  { city: "Kalutara Town", district: "Kalutara" },
  { city: "Panadura", district: "Kalutara" },
  { city: "Horana", district: "Kalutara" },
  { city: "Aluthgama", district: "Kalutara" },
  { city: "Kandy City", district: "Kandy" },
  { city: "Peradeniya", district: "Kandy" },
  { city: "Katugastota", district: "Kandy" },
  { city: "Matale Town", district: "Matale" },
  { city: "Dambulla", district: "Matale" },
  { city: "Nuwara Eliya Town", district: "Nuwara Eliya" },
  { city: "Galle Fort", district: "Galle" },
  { city: "Hikkaduwa", district: "Galle" },
  { city: "Karapitiya", district: "Galle" },
  { city: "Yakkalamulla", district: "Galle" },
  { city: "Matara Town", district: "Matara" },
  { city: "Mirissa", district: "Matara" },
  { city: "Hambantota Town", district: "Hambantota" },
  { city: "Jaffna Town", district: "Jaffna" },
  { city: "Kilinochchi Town", district: "Kilinochchi" },
  { city: "Mannar Town", district: "Mannar" },
  { city: "Vavuniya Town", district: "Vavuniya" },
  { city: "Mullaitivu Town", district: "Mullaitivu" },
  { city: "Batticaloa Town", district: "Batticaloa" },
  { city: "Ampara Town", district: "Ampara" },
  { city: "Trincomalee Town", district: "Trincomalee" },
  { city: "Kurunegala Town", district: "Kurunegala" },
  { city: "Puttalam Town", district: "Puttalam" },
  { city: "Chilaw", district: "Puttalam" },
  { city: "Anuradhapura Town", district: "Anuradhapura" },
  { city: "Polonnaruwa Town", district: "Polonnaruwa" },
  { city: "Badulla Town", district: "Badulla" },
  { city: "Ella", district: "Badulla" },
  { city: "Monaragala Town", district: "Monaragala" },
  { city: "Ratnapura Town", district: "Ratnapura" },
  { city: "Kegalle Town", district: "Kegalle" },
  { city: "Mawanella", district: "Kegalle" }
];

// Grouped amenities structure
const AMENITY_GROUPS = [
  {
    title: "🏠 Indoor Features",
    amenities: ["Air Conditioning", "Hot Water System", "Fully Air Conditioned", "Elevator/Lift", "Built-in Wardrobes", "Modern Kitchen"]
  },
  {
    title: "🔐 Security",
    amenities: ["24-Hour CCTV", "Security Guards", "Electric Fence", "Gated Community", "Alarm System", "Intercom"]
  },
  {
    title: "⚡ Utilities",
    amenities: ["Solar Power", "Backup Generator", "Three-Phase Electricity", "Borehole/Well Water", "City Water Supply", "Fiber Internet Ready"]
  },
  {
    title: "🌿 Outdoor & Recreation",
    amenities: ["Swimming Pool", "Private Garden", "Rooftop Terrace", "BBQ Area", "Children's Play Area", "Sports Court"]
  },
  {
    title: "🚗 Parking",
    amenities: ["Garage (Single)", "Garage (Double)", "Open Parking", "Covered Parking"]
  },
  {
    title: "📍 Location Advantages",
    amenities: ["Near Main Road", "Near Highway", "Near School", "Near Hospital", "Near Shopping", "Near Beach", "Sea View", "Mountain View", "City View"]
  },
  {
    title: "📋 Legal & Documents",
    amenities: ["Clear Title Deed", "Survey Plan Ready", "No Legal Issues", "Undivided Property", "Condominium Title"]
  }
];

// Standard Amenities Pool (flat list for backward compatibility)
const AMENITIES = [
  "Swimming Pool", "Gymnasium", "Fully Air Conditioned", "Hot Water System",
  "Solar Power Energy", "24 Hours CCTV & Security", "Generous Rooftop Terrace",
  "Backup Generator System", "Maids Quarters", "Roller Shutter Gate",
  "Private Landscaped Garden", "Double Parking Port"
];

export const PostPropertyPage: React.FC<PostPropertyPageProps> = ({ onNavigate, onNavigateHome }) => {
  // Current active step: 1 (Details), 2 (Images), 3 (Package), 4 (Account/Payment), 5 (Done)
  const [step, setStep] = useState<number>(1);
  const [showDraftOverlay, setShowDraftOverlay] = useState<boolean>(false);

  // --- STEP 1: Property Details Form State ---
  const [title, setTitle] = useState<string>('');
  const [listingType, setListingType] = useState<string>('For Sale');
  const [category, setCategory] = useState<string>('House');
  
  // Specifications
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [floors, setFloors] = useState<number>(2);
  const [landSize, setLandSize] = useState<string>('');
  const [landSizeUnit, setLandSizeUnit] = useState<string>('Perches');
  const [floorArea, setFloorArea] = useState<string>('');
  
  // Price & Terms
  const [priceLkr, setPriceLkr] = useState<string>('');
  const [isNegotiable, setIsNegotiable] = useState<boolean>(false);
  const [advanceRequired, setAdvanceRequired] = useState<string>('3 Months');

  // Description & AI Generator
  const [description, setDescription] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Location
  const [address, setAddress] = useState<string>('');
  const [district, setDistrict] = useState<string>('Colombo');
  const [city, setCity] = useState<string>('');
  const [lat, setLat] = useState<number>(6.9271); // Default Colombo Lat
  const [lng, setLng] = useState<number>(79.8612); // Default Colombo Lng
  const [hasPinned, setHasPinned] = useState<boolean>(false);

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Redesign Extra States
  const [contactName, setContactName] = useState<string>(() => localStorage.getItem('owner_name') || '');
  const [contactPhone, setContactPhone] = useState<string>(() => localStorage.getItem('owner_phone') || '');
  const [contactWhatsapp, setContactWhatsapp] = useState<string>('');
  const [sameAsPhone, setSameAsPhone] = useState<boolean>(true);
  const [displayPreference, setDisplayPreference] = useState<string>('Both phone and WhatsApp');
  const [responseTime, setResponseTime] = useState<string>('Within a few hours');
  const [activeSection, setActiveSection] = useState<'category' | 'specs' | 'description' | 'location' | 'amenities' | 'contact'>('category');
  const [descLanguage, setDescLanguage] = useState<'en' | 'si' | 'ta'>('en');
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);

  // Step 1 Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Search, popover, and geocoding helper states
  const [districtSearch, setDistrictSearch] = useState<string>('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchingMap, setIsSearchingMap] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string>('');
  const [cityFocus, setCityFocus] = useState<boolean>(false);

  // --- STEP 2: Images State ---
  interface PhotoSlot {
    name: string;
    size: number;
    url: string;
    file?: File;
    isStale?: boolean;
  }

  const [images, setImages] = useState<Array<PhotoSlot | null>>(() => {
    try {
      const savedImages = localStorage.getItem('lp_listing_images');
      if (savedImages) {
        const parsed = JSON.parse(savedImages);
        const slots = Array(12).fill(null);
        if (Array.isArray(parsed)) {
          parsed.forEach((item, index) => {
            if (item && typeof item === 'object' && 'slot' in item) {
              const slotIndex = item.slot;
              if (slotIndex >= 0 && slotIndex < 12) {
                slots[slotIndex] = {
                  name: item.name,
                  size: item.size || 0,
                  url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
                  isStale: true
                };
              }
            } else if (typeof item === 'string') {
              slots[index] = {
                name: item,
                size: 0,
                url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
                isStale: true
              };
            }
          });
          return slots;
        }
      }
    } catch (e) {
      console.error("Error parsing saved images", e);
    }
    return Array(12).fill(null);
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
  const [showNoPhotosModal, setShowNoPhotosModal] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  // Sync imageFiles with images array whenever images change
  useEffect(() => {
    const files = images
      .filter((img): img is PhotoSlot => img !== null && img.file !== undefined)
      .map(img => img.file as File);
    setImageFiles(files);
  }, [images]);

  // --- STEP 3: Package State ---
  const [selectedPlan, setSelectedPlan] = useState<string>('starter_free');

  // --- STEP 4: Account Creation & Auth ---
  const [isLoginMode, setIsLoginMode] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [whatsappInquiries, setWhatsappInquiries] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- STEP 4 (PAID): Payment State ---
  const [isPaymentMode, setIsPaymentMode] = useState<boolean>(false);
  const [cardName, setCardName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvc, setCvc] = useState<string>('');
  const [isAuthorizingPayment, setIsAuthorizingPayment] = useState<boolean>(false);

  // --- STEP 5: Success & Publishing Outcomes ---
  const [createdProperty, setCreatedProperty] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(15);

  // --- RECOVERY ON MOUNT ---
  useEffect(() => {
    // Check if there is an existing draft
    const savedDraft = localStorage.getItem('lp_listing_draft');
    const savedPlan = localStorage.getItem('lp_selected_plan');
    const savedImages = localStorage.getItem('lp_listing_images');

    if (savedDraft || savedPlan || savedImages) {
      setShowDraftOverlay(true);
    }

    // Determine starting step based on URL path if any
    const path = window.location.pathname;
    if (path.includes('/post-property/details')) setStep(1);
    else if (path.includes('/post-property/images')) setStep(2);
    else if (path.includes('/post-property/package')) setStep(3);
    else if (path.includes('/post-property/register')) setStep(4);
    else if (path.includes('/post-property/payment')) {
      setStep(4);
      setIsPaymentMode(true);
    }
    else if (path.includes('/post-property/success')) setStep(5);
  }, []);

  // Sync URL when step changes
  useEffect(() => {
    let url = '/sell';
    if (step === 1) url = '/post-property/details';
    else if (step === 2) url = '/post-property/images';
    else if (step === 3) url = '/post-property/package';
    else if (step === 4) {
      url = isPaymentMode ? '/post-property/payment' : '/post-property/register';
    }
    else if (step === 5) url = '/post-property/success';

    window.history.pushState(null, '', url);
  }, [step, isPaymentMode]);

  // Handle countdown to auto-redirect
  useEffect(() => {
    if (step === 5) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Go to owner dashboard
            localStorage.removeItem('lp_listing_draft');
            localStorage.removeItem('lp_listing_images');
            localStorage.removeItem('lp_selected_plan');
            onNavigate({ type: 'owner_dashboard' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, onNavigate]);

  // Load draft data from localStorage
  const handleLoadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('lp_listing_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || '');
        setListingType(draft.listingType || 'For Sale');
        setCategory(draft.category || 'House');
        setBedrooms(draft.bedrooms || 3);
        setBathrooms(draft.bathrooms || 2);
        setFloors(draft.floors || 2);
        setLandSize(draft.landSize || '');
        setLandSizeUnit(draft.landSizeUnit || 'Perches');
        setFloorArea(draft.floorArea || '');
        setPriceLkr(draft.priceLkr || '');
        setIsNegotiable(draft.isNegotiable || false);
        setAdvanceRequired(draft.advanceRequired || '3 Months');
        setDescription(draft.description || '');
        setAddress(draft.address || '');
        setDistrict(draft.district || 'Colombo');
        setCity(draft.city || '');
        setLat(draft.lat || 6.9271);
        setLng(draft.lng || 79.8612);
        setHasPinned(draft.hasPinned || false);
        setSelectedAmenities(draft.selectedAmenities || []);
        setContactName(draft.contactName || localStorage.getItem('owner_name') || '');
        setContactPhone(draft.contactPhone || localStorage.getItem('owner_phone') || '');
        setContactWhatsapp(draft.contactWhatsapp || '');
        setSameAsPhone(draft.sameAsPhone !== undefined ? draft.sameAsPhone : true);
        setDisplayPreference(draft.displayPreference || 'Both phone and WhatsApp');
        setResponseTime(draft.responseTime || 'Within a few hours');
      }

      const savedPlan = localStorage.getItem('lp_selected_plan');
      if (savedPlan) {
        setSelectedPlan(savedPlan);
      }

      const savedImages = localStorage.getItem('lp_listing_images');
      if (savedImages) {
        try {
          const parsed = JSON.parse(savedImages);
          const slots = Array(12).fill(null);
          if (Array.isArray(parsed)) {
            parsed.forEach((item, index) => {
              if (item && typeof item === 'object' && 'slot' in item) {
                const slotIndex = item.slot;
                if (slotIndex >= 0 && slotIndex < 12) {
                  slots[slotIndex] = {
                    name: item.name,
                    size: item.size || 0,
                    url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
                    isStale: true
                  };
                }
              } else if (typeof item === 'string') {
                slots[index] = {
                  name: item,
                  size: 0,
                  url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
                  isStale: true
                };
              }
            });
            setImages(slots);
          }
        } catch (e) {
          console.error("Failed to parse saved images from draft", e);
        }
      }

      setShowDraftOverlay(false);
      toast.success("Welcome back! Your property draft has been recovered.");
    } catch (err) {
      console.error("Failed to parse draft details", err);
      toast.error("Could not load your previous draft.");
      setShowDraftOverlay(false);
    }
  };

  // Start draft from scratch
  const handleStartFresh = () => {
    localStorage.removeItem('lp_listing_draft');
    localStorage.removeItem('lp_listing_images');
    localStorage.removeItem('lp_selected_plan');
    
    // Clear state
    setTitle('');
    setListingType('For Sale');
    setCategory('House');
    setBedrooms(3);
    setBathrooms(2);
    setFloors(2);
    setLandSize('');
    setLandSizeUnit('Perches');
    setFloorArea('');
    setPriceLkr('');
    setIsNegotiable(false);
    setAdvanceRequired('3 Months');
    setDescription('');
    setAddress('');
    setDistrict('Colombo');
    setCity('');
    setLat(6.9271);
    setLng(79.8612);
    setHasPinned(false);
    setSelectedAmenities([]);
    setImages(Array(12).fill(null));
    setImageFiles([]);
    setSelectedPlan('starter_free');
    setContactName(localStorage.getItem('owner_name') || '');
    setContactPhone(localStorage.getItem('owner_phone') || '');
    setContactWhatsapp('');
    setSameAsPhone(true);
    setDisplayPreference('Both phone and WhatsApp');
    setResponseTime('Within a few hours');
    
    setShowDraftOverlay(false);
    toast.success("Draft cleared. Let's start a fresh listing!");
  };

  // --- AUTO-SAVE EFFECT ---
  useEffect(() => {
    if (!title && !description && !priceLkr && !city && !address) return;
    const draftData = {
      title, listingType, category, bedrooms, bathrooms, floors,
      landSize, landSizeUnit, floorArea, priceLkr, isNegotiable,
      advanceRequired, description, address, district, city,
      lat, lng, hasPinned, selectedAmenities,
      contactName, contactPhone, contactWhatsapp, sameAsPhone,
      displayPreference, responseTime
    };
    localStorage.setItem('lp_listing_draft', JSON.stringify(draftData));
    
    setIsAutoSaving(true);
    const t = setTimeout(() => setIsAutoSaving(false), 800);
    return () => clearTimeout(t);
  }, [
    title, listingType, category, bedrooms, bathrooms, floors,
    landSize, landSizeUnit, floorArea, priceLkr, isNegotiable,
    advanceRequired, description, address, district, city,
    lat, lng, hasPinned, selectedAmenities,
    contactName, contactPhone, contactWhatsapp, sameAsPhone,
    displayPreference, responseTime
  ]);

  // --- STEP 1 ACTIONS: Property Details ---
  const handleSpecChange = (field: 'bedrooms' | 'bathrooms' | 'floors', type: 'inc' | 'dec') => {
    const valMap = { bedrooms, bathrooms, floors };
    const setterMap = { bedrooms: setBedrooms, bathrooms: setBathrooms, floors: setFloors };
    
    const current = valMap[field];
    const setter = setterMap[field];
    
    if (type === 'inc') {
      setter(current + 1);
    } else if (type === 'dec' && current > 0) {
      setter(current - 1);
    }
  };

  const handleAiGenerateText = async () => {
    if (!title) {
      toast.error("Please enter a property title first so AI can write a relevant description.");
      return;
    }
    setIsGeneratingAi(true);
    
    let languageRequirement = "Write the description in English.";
    if (descLanguage === 'si') languageRequirement = "Write the description in Sinhala (සිංහල).";
    else if (descLanguage === 'ta') languageRequirement = "Write the description in Tamil (தமிழ்).";

    const prompt = `Write a compelling, professional property listing description for a ${category} ${listingType === 'For Rent' ? 'for Rent' : 'for Sale'} located at "${address || city || district}", Sri Lanka. 
    Title: "${title}". 
    Price: Rs. ${priceLkr} LKR${isNegotiable ? ' (Negotiable)' : ''}.
    ${bedrooms ? `Bedrooms: ${bedrooms}.` : ''} 
    ${bathrooms ? `Bathrooms: ${bathrooms}.` : ''} 
    ${floors ? `Floors: ${floors}.` : ''} 
    ${landSize ? `Land Size: ${landSize} ${landSizeUnit}.` : ''} 
    ${floorArea ? `Floor Area: ${floorArea} sqft.` : ''} 
    Included Amenities: ${selectedAmenities.join(', ')}.
    ${languageRequirement}
    Keep it engaging, highlight key selling points, and structure it with a brief intro, key features, and a call-to-action under 150 words. Do not use markdown tags, just plain text.`;
    
    try {
      const desc = await generateDescription(prompt);
      
      // Typewriter effect
      let currentLength = 0;
      setDescription('');
      
      const interval = setInterval(() => {
        if (currentLength < desc.length) {
          setDescription(desc.slice(0, currentLength + 2));
          currentLength += 2;
        } else {
          clearInterval(interval);
          setIsGeneratingAi(false);
          toast.success("Description generated! Feel free to edit it.");
        }
      }, 15);
      
    } catch (error) {
      console.error(error);
      toast.error("AI Generation failed. Please try again.");
      setIsGeneratingAi(false);
    }
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = "Ad title is required";
    else if (title.length > 100) newErrors.title = "Title cannot exceed 100 characters";

    if (!priceLkr) newErrors.priceLkr = "Price is required";
    else if (isNaN(Number(priceLkr.replace(/,/g, '')))) newErrors.priceLkr = "Price must be a valid number";

    if (!description.trim()) newErrors.description = "Detailed description is required";
    else if (description.length < 50) newErrors.description = "Description must be at least 50 characters";

    if (!address.trim()) newErrors.address = "Specific street address or junction is required";
    if (!city.trim()) newErrors.city = "City / Suburb name is required";

    if (!contactName.trim()) newErrors.contactName = "Contact name is required";
    if (displayPreference !== 'Email only (hide phone)' && !contactPhone.trim()) {
      newErrors.contactPhone = "Contact phone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) {
      // Save data
      const draftData = {
        title, listingType, category, bedrooms, bathrooms, floors,
        landSize, landSizeUnit, floorArea, priceLkr, isNegotiable,
        advanceRequired, description, address, district, city,
        lat, lng, hasPinned, selectedAmenities,
        contactName, contactPhone, contactWhatsapp, sameAsPhone,
        displayPreference, responseTime
      };
      localStorage.setItem('lp_listing_draft', JSON.stringify(draftData));
      setStep(2);
    } else {
      toast.error("Please fill in all required fields marked in red.");
    }
  };

  // --- STEP 2 ACTIONS: Images Adding ---
  const saveImagesToLocalStorage = (updatedImages: Array<PhotoSlot | null>) => {
    const metadata = updatedImages
      .map((img, idx) => img ? { name: img.name, size: img.size, slot: idx } : null)
      .filter((item): item is { name: string; size: number; slot: number } => item !== null);
    localStorage.setItem('lp_listing_images', JSON.stringify(metadata));
  };

  const findNextEmptySlot = (currentSlots: Array<PhotoSlot | null>, startFrom: number, maxPhotos: number) => {
    for (let k = startFrom; k < maxPhotos; k++) {
      if (currentSlots[k] === null) {
        return k;
      }
    }
    return -1;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFilesAtSlot(Array.from(e.target.files), selectedSlotIndex);
    }
  };

  const addFilesAtSlot = (files: File[], slotIndex: number) => {
    const plan = localStorage.getItem('lp_selected_plan') || selectedPlan || 'starter_free';
    const photoLimits: Record<string, number> = {
      'starter_free': 6,
      'premium_pro': 9,
      'elite_pro': 12
    };
    const maxPhotos = photoLimits[plan] || 6;

    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
                          /\.(jpe?g|png|webp)$/i.test(file.name);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast.error("Only JPG, PNG and WEBP files allowed.");
      }
      if (!isValidSize) {
        toast.error(`Photo ${file.name} is too large. Max size is 5MB.`);
      }
      
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    const newSlots = [...images];
    let currentTargetIndex = slotIndex;

    for (const file of validFiles) {
      if (currentTargetIndex === -1 || currentTargetIndex >= maxPhotos) {
        toast.error(`No more empty photo slots available on your plan.`);
        break;
      }
      
      // Revoke old object URL if any is replaced
      const oldSlot = newSlots[currentTargetIndex];
      if (oldSlot && oldSlot.url.startsWith('blob:')) {
        URL.revokeObjectURL(oldSlot.url);
      }

      newSlots[currentTargetIndex] = {
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        file: file
      };

      // Find next empty slot for subsequent files
      currentTargetIndex = findNextEmptySlot(newSlots, currentTargetIndex + 1, maxPhotos);
    }

    setImages(newSlots);
    saveImagesToLocalStorage(newSlots);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const firstEmpty = findNextEmptySlot(images, 0, 12);
      addFilesAtSlot(Array.from(e.dataTransfer.files), firstEmpty !== -1 ? firstEmpty : 0);
    }
  };

  const removeImage = (index: number) => {
    const imgToRemove = images[index];
    if (imgToRemove && imgToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imgToRemove.url);
    }

    const updatedImages = [...images];
    updatedImages[index] = null;

    setImages(updatedImages);
    saveImagesToLocalStorage(updatedImages);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < 12) {
      const updatedImages = [...images];
      const temp = updatedImages[index];
      updatedImages[index] = updatedImages[targetIndex];
      updatedImages[targetIndex] = temp;
      setImages(updatedImages);
      saveImagesToLocalStorage(updatedImages);
    }
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (images[index] === null) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOverSlot = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDropSlot = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (sourceIndexStr === '') return;
    const sourceIndex = parseInt(sourceIndexStr);
    if (isNaN(sourceIndex) || sourceIndex === index) return;

    const updatedImages = [...images];
    const temp = updatedImages[sourceIndex];
    updatedImages[sourceIndex] = updatedImages[index];
    updatedImages[index] = temp;

    setImages(updatedImages);
    saveImagesToLocalStorage(updatedImages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getProgressStatus = (count: number, max: number) => {
    if (count === 0) {
      return { color: 'bg-red-500', text: '⚠️ Add at least 1 photo' };
    }
    if (count === max) {
      return { color: 'bg-emerald-600', text: '⭐ Perfect! All slots filled!' };
    }
    if (count <= 2) {
      return { color: 'bg-orange-500', text: '📸 Add more for better results' };
    }
    return { color: 'bg-yellow-500', text: '👍 Good! More photos = more leads' };
  };

  const handleNextStep2 = () => {
    const photosCount = images.filter(img => img !== null).length;
    if (photosCount === 0) {
      setShowNoPhotosModal(true);
      return;
    }
    setStep(3);
  };

  // --- STEP 3 ACTIONS: Packages ---
  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    localStorage.setItem('lp_selected_plan', plan);
  };

  const handleNextStep3 = () => {
    // If owner is already logged in, we can skip register step and go straight to publish/checkout!
    const isLoggedIn = localStorage.getItem('owner_logged_in') === 'true';
    if (isLoggedIn) {
      const ownerEmail = localStorage.getItem('owner_email') || '';
      const ownerPhone = localStorage.getItem('owner_phone') || '+94771234567';
      const ownerId = localStorage.getItem('owner_id') || crypto.randomUUID();
      
      if (selectedPlan === 'starter_free') {
        const draftDataStr = localStorage.getItem('lp_listing_draft');
        if (draftDataStr) {
          const draft = JSON.parse(draftDataStr);
          publishListing(ownerId, ownerEmail, ownerPhone, draft);
        } else {
          toast.error("Property details draft not found.");
        }
      } else {
        // Proceed to payment checkout in step 4
        setStep(4);
        setIsPaymentMode(true);
      }
    } else {
      setStep(4);
      setIsPaymentMode(false);
    }
  };

  // --- STEP 4 ACTIONS: Register & Payment Auth ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoginMode) {
      // Validate Register fields
      if (!fullName.trim()) return toast.error("Full Name is required");
      if (!email.trim()) return toast.error("Email is required");
      if (!phone.trim()) return toast.error("Phone Number is required");
      if (!password) return toast.error("Password is required");
      if (password.length < 8) return toast.error("Password must be at least 8 characters");
      if (password !== confirmPassword) return toast.error("Passwords do not match");
      if (!agreeTerms) return toast.error("You must agree to the Terms of Service");
    } else {
      if (!email.trim()) return toast.error("Email is required");
      if (!password) return toast.error("Password is required");
    }

    setIsSubmitting(true);
    try {
      let userId: any = crypto.randomUUID();
      let activeEmail = email.trim();
      let activePhone = phone || '+94771234567';
      let activeName = fullName || 'Property Owner';

      if (!isLoginMode) {
        // Create auth signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: activeEmail,
          password,
          options: {
            data: {
              full_name: activeName,
              role: 'owner',
            }
          }
        });

        if (authError) {
          console.warn("Auth signup error, using UUID fallback for demo testing:", authError);
        } else if (authData?.user) {
          userId = authData.user.id;
        }

        // Write users table details
        const price = selectedPlan === 'starter_free' ? 0 : (selectedPlan === 'premium_pro' ? 4500 : 8500);
        const planName = selectedPlan === 'starter_free' ? 'Starter Free' : (selectedPlan === 'premium_pro' ? 'Premium Pro' : 'Elite Pro');

        const { error: userInsertError } = await supabase
          .from('users')
          .insert([{
            id: userId,
            role: 'owner',
            full_name: activeName,
            email: activeEmail,
            phone: activePhone,
            whatsapp: whatsapp || activePhone,
            created_at: new Date().toISOString(),
            package_type: selectedPlan,
            selected_package: planName,
            package_paid: selectedPlan === 'starter_free' ? false : false,
            package_price: price
          }]);

        if (userInsertError) console.warn("Users insert error:", userInsertError);

      } else {
        // Log in auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: activeEmail,
          password,
        });

        if (authError) {
          console.warn("Auth signin failed, searching database users table for fallback:", authError.message);
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('email', activeEmail)
            .maybeSingle();

          if (userProfile) {
            userId = userProfile.id;
            activeName = userProfile.full_name;
            activePhone = userProfile.phone;
          } else {
            throw new Error("Invalid login credentials.");
          }
        } else if (authData?.user) {
          userId = authData.user.id;
          activeName = authData.user.user_metadata?.full_name || 'Owner';
        }
      }

      // Save owner login session info to localStorage
      localStorage.setItem('owner_logged_in', 'true');
      localStorage.setItem('owner_id', userId);
      localStorage.setItem('owner_name', activeName);
      localStorage.setItem('owner_email', activeEmail);
      localStorage.setItem('user_role', 'owner');

      const draftDataStr = localStorage.getItem('lp_listing_draft');
      if (!draftDataStr) {
        throw new Error("Could not find draft property data.");
      }
      const draft = JSON.parse(draftDataStr);

      if (selectedPlan === 'starter_free') {
        // Starter Free plan gets owner_packages instantly and gets published!
        const durationDays = 900;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        await supabase
          .from('owner_packages')
          .insert([{
            user_id: userId,
            package_type: 'starter_free',
            price_lkr: 0,
            duration_days: durationDays,
            payment_status: 'free',
            payment_reference: 'free_plan_' + Date.now(),
            is_active: true,
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString()
          }]);

        await publishListing(userId, activeEmail, activePhone, draft);
      } else {
        // Show payment checkout screen
        setIsPaymentMode(true);
      }

    } catch (err: any) {
      toast.error(err.message || "Authentication error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPaidPayment = async () => {
    if (!cardName.trim()) return toast.error("Cardholder name is required");
    if (!cardNumber.trim()) return toast.error("Card number is required");
    if (!expiryDate.trim()) return toast.error("Expiry date MM/YY is required");
    if (!cvc.trim() || cvc.length < 3) return toast.error("Security CVC code is invalid");

    setIsAuthorizingPayment(true);
    const toastId = toast.loading("Processing PayHere gateway authorization...");

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const ownerId = localStorage.getItem('owner_id') || crypto.randomUUID();
      const ownerEmail = localStorage.getItem('owner_email') || '';
      const ownerPhone = localStorage.getItem('owner_phone') || '+94771234567';

      const draftDataStr = localStorage.getItem('lp_listing_draft');
      if (!draftDataStr) throw new Error("Property listing details not found.");
      const draft = JSON.parse(draftDataStr);

      const price = selectedPlan === 'premium_pro' ? 4500 : 8500;
      const durationDays = selectedPlan === 'premium_pro' ? 60 : 90;
      const orderId = 'payhere_ref_' + Date.now();
      const nowString = new Date().toISOString();
      const expires = new Date();
      expires.setDate(expires.getDate() + durationDays);
      const expiresString = expires.toISOString();

      // 1. Insert into owner_packages
      await supabase
        .from('owner_packages')
        .insert([{
          user_id: ownerId,
          package_type: selectedPlan,
          price_lkr: price,
          duration_days: durationDays,
          payment_status: 'paid',
          payment_reference: orderId,
          is_active: true,
          started_at: nowString,
          expires_at: expiresString
        }]);

      // 2. Update users table details
      await supabase
        .from('users')
        .update({
          package_type: selectedPlan,
          package_started_at: nowString,
          package_expires_at: expiresString,
          package_paid: true,
          package_price: price,
          selected_package: selectedPlan === 'premium_pro' ? 'Premium Pro' : 'Elite Pro'
        })
        .eq('id', ownerId);

      // 3. Insert into payments table
      await supabase
        .from('payments')
        .insert([{
          user_id: ownerId,
          amount_lkr: price,
          amount: price,
          currency: 'LKR',
          status: 'paid',
          payment_method: 'payhere',
          reference: orderId,
          paid_at: nowString,
          created_at: nowString
        }]);

      // 4. Publish listing!
      toast.success("Payment authorized successfully!", { id: toastId });
      await publishListing(ownerId, ownerEmail, ownerPhone, draft);

    } catch (err: any) {
      toast.error(err.message || "An error occurred during payment.", { id: toastId });
    } finally {
      setIsAuthorizingPayment(false);
    }
  };

  const publishListing = async (userId: string, userEmail: string, userPhone: string, draft: any) => {
    const toastId = toast.loading("Uploading photos and indexing your listing...");
    try {
      const propertyId = 'prop_' + Math.floor(100000 + Math.random() * 900000);
      const uploadedUrls: string[] = [];

      // Upload image files if any
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${userId}/${propertyId}/${Date.now()}_${i + 1}.${ext}`;
        
        try {
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(path, file, { upsert: true });

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('property-images')
              .getPublicUrl(path);
            uploadedUrls.push(urlData.publicUrl);
          } else {
            console.warn(`Failed uploading file ${file.name}:`, uploadError);
          }
        } catch (uploadErr) {
          console.warn(`Upload exception for ${file.name}:`, uploadErr);
        }
      }

      // Add default if no images loaded
      if (uploadedUrls.length === 0) {
        uploadedUrls.push("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80");
      }

      const priceNum = parseFloat(draft.priceLkr.toString().replace(/[^0-9.]/g, '')) || 0;
      const usdEst = priceNum / 300;

      const payload = {
        listing_title: draft.title,
        slug: slugify(draft.title),
        listing_type: draft.listingType === 'For Rent' ? 'Rent' : 'Sale',
        property_category: draft.category,
        price_lkr: priceNum,
        usd_estimate: usdEst,
        is_negotiable: draft.isNegotiable,
        land_area: draft.landSize ? `${draft.landSize} ${draft.landSizeUnit}` : null,
        floor_area: draft.floorArea ? `${draft.floorArea} sqft` : null,
        rooms: parseInt(draft.bedrooms || '0'),
        bathrooms: parseInt(draft.bathrooms || '0'),
        property_description: draft.description,
        district: draft.district,
        city: draft.city,
        google_maps_link: `https://www.google.com/maps?q=${lat},${lng}`,
        additional_info: draft.selectedAmenities ? draft.selectedAmenities.join(', ') : '',
        status: 'pending', // Under Review
        package_tier: selectedPlan,
        mobile: userPhone,
        published_by: 'owner',
        owner_email: userEmail,
        agentEmail: userEmail,
        agent_email: userEmail,
        agent_id: userEmail,
        images: uploadedUrls,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: insertedProp, error: insertError } = await supabase
        .from('properties')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        console.warn("Table insert error, retrying without ID details:", insertError);
        const { error: insertErrorAlt, data: insertedPropAlt } = await supabase
          .from('properties')
          .insert([{ ...payload }])
          .select()
          .single();
          
        if (insertErrorAlt) throw insertErrorAlt;
        setCreatedProperty(insertedPropAlt);
      } else {
        setCreatedProperty(insertedProp);
      }

      toast.success("Your property has been indexed and submitted for review!", { id: toastId });

      // Clean up localStorage
      localStorage.removeItem('lp_listing_draft');
      localStorage.removeItem('lp_listing_images');
      localStorage.removeItem('lp_selected_plan');

      // Go to Step 5 (Done)
      setIsPaymentMode(false);
      setStep(5);

    } catch (err: any) {
      console.error("Publishing error:", err);
      toast.error(err.message || "Failed to publish listing.", { id: toastId });
    }
  };

  // --- RENDERING PARALLEL UTILS ---
  const formatPriceComma = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    if (!raw) return '';
    return Number(raw).toLocaleString('en-US');
  };

  const getUsdEstimate = () => {
    const num = parseFloat(priceLkr.replace(/,/g, '')) || 0;
    return (num / 300).toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  // Redesign Step 1 Redux Helpers
  const getListingStrength = () => {
    let strength = 15; // default starting with Category selection
    const items: string[] = [];
    
    if (title.trim().length >= 10) {
      strength += 15;
    } else {
      items.push("Title (at least 10 characters)");
    }
    
    if (priceLkr.trim() && !isNaN(Number(priceLkr.replace(/,/g, '')))) {
      strength += 15;
    } else {
      items.push("Valid LKR price");
    }
    
    if (description.trim().length >= 50) {
      strength += 15;
    } else {
      items.push("Detailed description (min 50 chars)");
    }
    
    if (city.trim() && address.trim()) {
      strength += 15;
    } else {
      items.push("City & street address");
    }
    
    if (hasPinned) {
      strength += 10;
    } else {
      items.push("Pin exact map location");
    }
    
    if (selectedAmenities.length >= 3) {
      strength += 10;
    } else {
      items.push("Select at least 3 amenities");
    }
    
    if (contactName.trim() && contactPhone.trim()) {
      strength += 5;
    } else {
      items.push("Contact details");
    }
    
    return { strength, pending: items };
  };

  const getSectionAdvice = () => {
    switch (activeSection) {
      case 'category':
        return {
          title: "Select the Perfect Category",
          tips: [
            "Verify your property type to ensure it reaches targeted buyers.",
            "Choose 'Apartment' if it's a multi-unit high-rise residence, or 'House / Villa' for standalone homes.",
            "If listing Land, specification filters will auto-adapt to hide bedroom count variables."
          ],
          highlight: "💡 Apartments are currently in high demand in Colombo 3 & Colombo 7!"
        };
      case 'specs':
        return {
          title: "Optimize Key Specs",
          tips: [
            "Use standard LKR prices. Our helper automatically displays Millions or Crores to match Sri Lankan standards.",
            "Convert land sizes to Perches or Acres (1 Acre = 160 Perches).",
            "Be precise with floors and layouts to build trust with buyers."
          ],
          highlight: "💡 Keeping your price-per-perch inline with regional averages drives 3x more inquiries."
        };
      case 'description':
        return {
          title: "Generate a Captivating Description",
          tips: [
            "Mention nearby schools, hospitals, or highway entrance proximity.",
            "Use our Gemini AI assistant to write a professional 150-word description.",
            "Choose English, Sinhala, or Tamil generator options to target different local segments."
          ],
          highlight: "💡 Phrases like 'clear deeds' or 'gated community' increase user interest by 40%!"
        };
      case 'location':
        return {
          title: "Drop an Accurate Pin",
          tips: [
            "Drag and drop the custom pin precisely onto your plot or building entrance.",
            "Add landmark descriptions in the address field (e.g. 'Opposite Food City').",
            "Use GPS Geolocate or map search to center the layout automatically."
          ],
          highlight: "💡 Verified pins prevent confusion during physical site visits."
        };
      case 'amenities':
        return {
          title: "Highlight Amenities",
          tips: [
            "Check key parameters like 24-Hour security, CCTV, backup generators, or hot water.",
            "Toggle entire groups of modern utilities to stand out in filters.",
            "Selecting more amenities boosts your listing's ranking score!"
          ],
          highlight: "💡 Properties with active backup generators find buyers 2x faster."
        };
      case 'contact':
        return {
          title: "Provide Contact Details",
          tips: [
            "Provide both phone and WhatsApp numbers for the fastest lead response.",
            "Specify your response speed to build trust with incoming buyers.",
            "We pre-fill your registered account name to keep things convenient."
          ],
          highlight: "💡 Over 70% of potential buyers prefer contacting via WhatsApp message!"
        };
      default:
        return {
          title: "Ready to Post Your Property?",
          tips: [
            "Make sure all fields highlighted in red are completed.",
            "No pressure: your draft is auto-saved on this browser.",
            "Next: proceed to upload high-quality photos."
          ],
          highlight: "💡 Complete listings get verified and go live within minutes!"
        };
    }
  };

  const getLandConversionLabel = () => {
    const val = parseFloat(landSize);
    if (!val || isNaN(val)) return '';
    if (landSizeUnit === 'Perches') {
      const acres = val / 160;
      const sqft = val * 272.25;
      return `≈ ${acres.toFixed(2)} Acres | ${sqft.toLocaleString('en-US', { maximumFractionDigits: 0 })} sqft`;
    } else if (landSizeUnit === 'Acres') {
      const perches = val * 160;
      const sqft = val * 43560;
      return `≈ ${perches.toLocaleString('en-US', { maximumFractionDigits: 0 })} Perches | ${sqft.toLocaleString('en-US', { maximumFractionDigits: 0 })} sqft`;
    } else {
      const perches = val / 272.25;
      return `≈ ${perches.toFixed(2)} Perches`;
    }
  };

  const getPricePerPerchLabel = () => {
    const priceVal = parseFloat(priceLkr.replace(/,/g, ''));
    const sizeVal = parseFloat(landSize);
    if (!priceVal || !sizeVal || isNaN(priceVal) || isNaN(sizeVal)) return '';
    
    let perches = sizeVal;
    if (landSizeUnit === 'Acres') {
      perches = sizeVal * 160;
    } else if (landSizeUnit === 'Sq Ft') {
      perches = sizeVal / 272.25;
    }
    
    if (perches <= 0) return '';
    const pricePerPerch = priceVal / perches;
    return `💰 Rs. ${pricePerPerch.toLocaleString('en-US', { maximumFractionDigits: 0 })} LKR per perch`;
  };

  const getFormattedPriceWord = () => {
    const val = parseFloat(priceLkr.replace(/,/g, ''));
    if (!val || isNaN(val)) return '';
    if (val >= 10000000) { // 1 Crore
      const crores = val / 10000000;
      const millions = val / 1000000;
      return `Rs. ${crores.toFixed(2)} Crores (Rs. ${millions.toFixed(1)} Million)`;
    } else if (val >= 1000000) { // 1 Million
      const millions = val / 1000000;
      return `Rs. ${millions.toFixed(2)} Million`;
    } else if (val >= 100000) { // 1 Lakh
      const lakhs = val / 100000;
      return `Rs. ${lakhs.toFixed(2)} Lakhs`;
    }
    return `Rs. ${val.toLocaleString('en-US')}`;
  };

  const getFilteredCities = () => {
    return POPULAR_CITIES.filter(c => 
      c.district === district && 
      c.city.toLowerCase().includes(city.toLowerCase())
    );
  };

  const handleLocateAddress = async () => {
    const query = searchQuery.trim() || city.trim() || address.trim();
    if (!query) {
      toast.error("Please type a road, city, or landmark to search.");
      return;
    }
    setIsSearchingMap(true);
    setGpsAccuracy('Searching map nodes...');
    try {
      const formattedQuery = encodeURIComponent(`${query}, ${district}, Sri Lanka`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${formattedQuery}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);
        setLat(newLat);
        setLng(newLng);
        setHasPinned(true);
        setGpsAccuracy(`Verified Location: ${result.display_name.split(',')[0]} (Node: ${result.osm_id.toString().slice(0, 6)})`);
        toast.success(`Centered on: ${result.display_name.split(',')[0]}`);
      } else {
        const fallbackQuery = encodeURIComponent(`${query}, Sri Lanka`);
        const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${fallbackQuery}&limit=1`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData.length > 0) {
          const result = fallbackData[0];
          const newLat = parseFloat(result.lat);
          const newLng = parseFloat(result.lon);
          setLat(newLat);
          setLng(newLng);
          setHasPinned(true);
          setGpsAccuracy("Accuracy: Moderate (Region Level)");
          toast.success(`Centered on fallback: ${result.display_name.split(',')[0]}`);
        } else {
          setGpsAccuracy('Location not found. Pin manually.');
          toast.error("Location not found. Drop a custom pin manually.");
        }
      }
    } catch (err) {
      console.error(err);
      setGpsAccuracy('Lookup failed. Pin manually.');
      toast.error("Map query failed. Pin manually.");
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleGPSGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error("GPS not supported on this device.");
      return;
    }
    setGpsAccuracy("Acquiring GPS fix...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setHasPinned(true);
        setGpsAccuracy(`Accuracy: ±${position.coords.accuracy.toFixed(0)}m (High Precision GPS)`);
        toast.success("Successfully pinned your GPS coordinates!");
      },
      (err) => {
        console.error(err);
        setGpsAccuracy("GPS permission denied.");
        toast.error("Could not read location. Enable GPS permissions.");
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const getNearbyLandmarks = () => {
    const list = [];
    if (city) {
      list.push(`🚉 ${city} Railway Station`);
      list.push(`🏫 ${city} Secondary School & Academy`);
      list.push(`🛒 Keells / Cargill's Supermarket`);
    } else {
      list.push("🚉 Public Transit Railway & Bus Terminal");
      list.push("🏫 Primary & Secondary Schools");
      list.push("🛒 Commercial Supermarket Outlets");
    }
    list.push("🏥 District General Hospital Complex");
    list.push("🛣️ Highway Access Entrance Interchange");
    return list;
  };

  function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMapEvents({});
    useEffect(() => {
      map.setView([lat, lng], 14);
    }, [lat, lng, map]);
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAF8] pt-24 pb-16 font-sans">
      
      {/* 🏠 Recovery draft modal overlay */}
      <AnimatePresence>
        {showDraftOverlay && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] max-w-md w-full p-8 shadow-2xl border border-neutral-100"
            >
              <div className="text-center space-y-4">
                <div className="h-16 w-16 bg-[#004F31]/10 text-[#004F31] rounded-full flex items-center justify-center mx-auto text-2xl">
                  🏠
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-neutral-900">Restore Property Draft?</h3>
                  <p className="text-xs text-neutral-500 font-semibold mt-1">We found a saved property listing draft on your browser from a previous session.</p>
                </div>
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleStartFresh}
                    className="py-3 px-4 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Start Fresh
                  </button>
                  <button
                    onClick={handleLoadDraft}
                    className="py-3 px-4 bg-[#004F31] hover:bg-emerald-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                  >
                    Continue Draft →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* =========================================
            HEADER PROGRESS BAR (Visible on all steps)
            ========================================= */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-neutral-200/60 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            {/* Steps Container */}
            <div className="flex items-center justify-between max-w-3xl mx-auto relative mb-4">
              
              {/* Segmented Progress Lines behind circles */}
              <div className="absolute top-5 left-6 right-6 h-0.5 -z-10 flex justify-between items-center pointer-events-none">
                {[1, 2, 3, 4].map((segmentNum) => {
                  const isSegmentCompleted = step > segmentNum;
                  return (
                    <div 
                      key={segmentNum} 
                      className={`h-0.5 flex-1 transition-all duration-300 mx-2 ${
                        isSegmentCompleted 
                          ? 'bg-[#004F31]' 
                          : 'border-t border-dashed border-neutral-300'
                      }`}
                    />
                  );
                })}
              </div>

              {[
                { label: 'Details', icon: '🏠' },
                { label: 'Images', icon: '📸' },
                { label: 'Package', icon: '💳' },
                { label: 'Account', icon: '👤' },
                { label: 'Done', icon: '✅' },
              ].map((s, idx) => {
                const stepNum = idx + 1;
                const isCurrent = step === stepNum;
                const isCompleted = step > stepNum;
                
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <motion.div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-base transition-all border shadow-sm select-none ${
                        isCompleted 
                          ? 'bg-[#004F31] border-[#004F31] text-white font-bold' 
                          : isCurrent 
                            ? 'bg-[#004F31] border-[#004F31] text-white font-extrabold ring-4 ring-[#004F31]/20 scale-110' 
                            : 'bg-neutral-100 border-neutral-200 text-neutral-400 font-semibold'
                      }`}
                      animate={isCurrent ? { scale: 1.1 } : { scale: 1 }}
                    >
                      {isCompleted ? '✓' : s.icon}
                    </motion.div>
                    <span className={`text-[10px] sm:text-xs uppercase mt-2.5 transition-all select-none ${
                      isCurrent 
                        ? 'text-[#004F31] font-extrabold tracking-wider' 
                        : isCompleted 
                          ? 'text-neutral-700 font-bold' 
                          : 'text-neutral-400 font-medium'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}

            </div>

            {/* Sub-progress status */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-neutral-100 pt-4 mt-2">
              <span className="text-xs font-bold text-[#004F31] bg-[#004F31]/5 px-3 py-1 rounded-full uppercase tracking-widest">
                Step {step} of 5
              </span>
              <span className="text-xs font-semibold text-neutral-400 mt-2 sm:mt-0 flex items-center gap-2">
                ⏱️ Takes about 5 minutes to go live
                <span className="text-neutral-300">|</span>
                {isAutoSaving ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                    <Loader2 size={11} className="animate-spin" /> Saving draft...
                  </span>
                ) : (
                  <span className="text-neutral-400 font-medium">
                    💾 Draft Auto-Saved
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================
            ACTIVE STEP VIEWS CONTAINER
            ========================================= */}
        <AnimatePresence mode="wait">

          {/* STEP 1: Property Details */}
          {step === 1 && (
            <motion.div
              key="step-details"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Details Form Grid */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Category selector */}
                <div 
                  className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-4 cursor-pointer"
                  onClick={() => setActiveSection('category')}
                >
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900">What category is your property?</h3>
                    <p className="text-xs text-neutral-500 font-semibold mt-0.5">Select a category below. Each category has optimized search filters.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { type: 'House', icon: '🏠', label: 'House / Villa', desc: 'Single-family homes, villas, bungalows' },
                      { type: 'Apartment', icon: '🏢', label: 'Apartment', desc: 'Luxury units, flats, penthouses' },
                      { type: 'Land', icon: '🌿', label: 'Land Plot', desc: 'Residential, agricultural or commercial plots' },
                      { type: 'Commercial', icon: '🏗️', label: 'Commercial', desc: 'Offices, retail spaces, warehouses' },
                      { type: 'Villa', icon: '🏖️', label: 'Bungalow', desc: 'Holiday homes and traditional villas' },
                      { type: 'Other', icon: '✨', label: 'Other Type', desc: 'Co-living spaces, rooms, guest houses' },
                    ].map((c) => (
                      <button
                        key={c.type}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategory(c.type);
                          setActiveSection('category');
                        }}
                        className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group ${
                          category === c.type 
                            ? 'bg-[#004F31]/5 border-[#004F31] ring-2 ring-[#004F31]/5' 
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <span className="text-2xl transition-transform group-hover:scale-110">{c.icon}</span>
                        <span className={`text-xs font-extrabold ${category === c.type ? 'text-[#004F31]' : 'text-neutral-700'}`}>
                          {c.label}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-medium leading-tight hidden sm:block">
                          {c.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Core Information */}
                <div 
                  className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-6"
                  onClick={() => setActiveSection('specs')}
                >
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900">Core Listing Specifications</h3>
                    <p className="text-xs text-neutral-500 font-semibold mt-0.5">Provide specifications to help buyers filter and match with your property.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Listing Title *</label>
                        <span className={`text-[10px] font-bold ${title.length > 100 ? 'text-red-500' : 'text-neutral-400'}`}>
                          {title.length}/100
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Elegant 4-Bedroom House in Colombo 03 with Pool"
                        value={title}
                        onFocus={() => setActiveSection('specs')}
                        onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                        className={`w-full px-4 py-3 bg-[#F8FAF8] border rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31] ${
                          errors.title ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                        }`}
                      />
                      {errors.title && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.title}</p>}
                      <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">
                        ⚠️ <strong>Rule-based Advice:</strong> Keep titles under 100 characters. Avoid emojis, block caps, or phone numbers. Mention bedroom count, suburb and key selling points.
                      </p>
                    </div>

                    {/* Offer Type Toggle Button */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Offer Transaction *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['For Sale', 'For Rent'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setListingType(type);
                              setActiveSection('specs');
                            }}
                            className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider border transition-all text-center ${
                              listingType === type 
                                ? 'bg-[#004F31] border-[#004F31] text-white shadow-md shadow-emerald-950/15' 
                                : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-600'
                            }`}
                          >
                            {type === 'For Sale' ? '🏠 Sell outright' : '🔑 rent / lease'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size and Unit Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Land Area Size</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. 15"
                            value={landSize}
                            onFocus={() => setActiveSection('specs')}
                            onChange={(e) => setLandSize(e.target.value)}
                            className="w-1/2 px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31]"
                          />
                          <select
                            value={landSizeUnit}
                            onChange={(e) => setLandSizeUnit(e.target.value)}
                            className="w-1/2 px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31]"
                          >
                            <option>Perches</option>
                            <option>Acres</option>
                            <option>Sq Ft</option>
                          </select>
                        </div>
                        {getLandConversionLabel() && (
                          <p className="text-[10px] text-neutral-400 font-bold bg-[#F8FAF8] p-1.5 rounded border border-neutral-100">
                            {getLandConversionLabel()}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Floor Area (Sq Ft)</label>
                        <input
                          type="text"
                          placeholder="e.g. 3200"
                          value={floorArea}
                          onFocus={() => setActiveSection('specs')}
                          onChange={(e) => setFloorArea(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31]"
                        />
                      </div>

                    </div>

                    {/* Bed / Bath / Floor Steppers (Hidden if category is Land) */}
                    {category !== 'Land' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        
                        <div className="space-y-1 bg-[#F8FAF8] p-3 rounded-2xl border border-neutral-200/60">
                          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block text-center">Bedrooms</label>
                          <div className="flex items-center justify-between mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                handleSpecChange('bedrooms', 'dec');
                                setActiveSection('specs');
                              }}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-extrabold text-neutral-800">
                              {bedrooms === 0 ? "Studio (0)" : bedrooms}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                handleSpecChange('bedrooms', 'inc');
                                setActiveSection('specs');
                              }}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 bg-[#F8FAF8] p-3 rounded-2xl border border-neutral-200/60">
                          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block text-center">Bathrooms</label>
                          <div className="flex items-center justify-between mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                handleSpecChange('bathrooms', 'dec');
                                setActiveSection('specs');
                              }}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-extrabold text-neutral-800">{bathrooms}</span>
                            <button
                              type="button"
                              onClick={() => {
                                handleSpecChange('bathrooms', 'inc');
                                setActiveSection('specs');
                              }}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 bg-[#F8FAF8] p-3 rounded-2xl border border-neutral-200/60">
                          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block text-center">Total Floors</label>
                          <div className="flex items-center justify-between mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                handleSpecChange('floors', 'dec');
                                setActiveSection('specs');
                              }}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-extrabold text-neutral-800">
                              {floors === 0 ? "Ground (0)" : floors}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                handleSpecChange('floors', 'inc');
                                setActiveSection('specs');
                              }}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Pricing details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                          {listingType === 'For Rent' ? 'Monthly Rental Price (LKR) *' : 'Asking Price (LKR) *'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-xs font-bold text-neutral-400">Rs.</span>
                          <input
                            type="text"
                            placeholder="e.g. 45,000,000"
                            value={priceLkr}
                            onFocus={() => setActiveSection('specs')}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/,/g, '');
                              setPriceLkr(formatPriceComma(cleaned));
                            }}
                            className={`w-full pl-11 pr-4 py-3 bg-[#F8FAF8] border rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31] ${
                              errors.priceLkr ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                            }`}
                          />
                        </div>
                        {errors.priceLkr && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.priceLkr}</p>}
                        
                        {getFormattedPriceWord() && (
                          <div className="text-[10px] text-[#004F31] font-bold mt-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 space-y-0.5">
                            <p>📈 Local Scale: {getFormattedPriceWord()}</p>
                            <p className="text-neutral-500">🌍 USD Equivalent: ${getUsdEstimate()} USD</p>
                            {getPricePerPerchLabel() && <p className="text-neutral-600 font-extrabold">{getPricePerPerchLabel()}</p>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 flex flex-col justify-end">
                        <div className="p-3.5 bg-[#F8FAF8] rounded-xl border border-neutral-200 flex items-center justify-between h-[46px]">
                          <label className="text-xs font-extrabold text-neutral-700 cursor-pointer select-none" htmlFor="negotiable">
                            🤝 Price is Negotiable
                          </label>
                          <input
                            id="negotiable"
                            type="checkbox"
                            checked={isNegotiable}
                            onChange={(e) => setIsNegotiable(e.target.checked)}
                            className="h-4.5 w-4.5 accent-[#004F31] rounded"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Lease Advance / Deposit requirement (Hidden if transaction is For Sale) */}
                    {listingType === 'For Rent' && (
                      <div className="space-y-1 pt-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Lease Key Money Advance *</label>
                        <select
                          value={advanceRequired}
                          onChange={(e) => setAdvanceRequired(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31]"
                        >
                          <option>None (No Advance)</option>
                          <option>1 Month</option>
                          <option>3 Months</option>
                          <option>6 Months</option>
                          <option>12 Months</option>
                        </select>
                      </div>
                    )}

                  </div>
                </div>

                {/* 3. Description & AI generation */}
                <div 
                  className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-4"
                  onClick={() => setActiveSection('description')}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-neutral-900 font-display">Detailed Listing Description</h3>
                      <p className="text-xs text-neutral-500 font-semibold mt-0.5">Describe your property. Buyers search by words in description.</p>
                    </div>
                  </div>

                  {/* Language Selection Tabs for Generator */}
                  <div className="flex items-center justify-between bg-neutral-50 p-1 rounded-xl border border-neutral-200/60">
                    <span className="text-[10px] font-black uppercase text-neutral-400 pl-2">Generator Language:</span>
                    <div className="flex gap-1">
                      {[
                        { code: 'en', label: 'English' },
                        { code: 'si', label: 'සිංහල' },
                        { code: 'ta', label: 'தமிழ்' }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setDescLanguage(lang.code as any)}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                            descLanguage === lang.code 
                              ? 'bg-[#004F31] text-white' 
                              : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rich Typewriter Generator Button */}
                  <button
                    type="button"
                    onClick={handleAiGenerateText}
                    disabled={isGeneratingAi}
                    className="w-full py-3 bg-[#004F31] hover:bg-emerald-950 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-950/15 cursor-pointer select-none transition-all"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Gemini AI is crafting description...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        Generate Professional Description with Gemini AI
                      </>
                    )}
                  </button>

                  <div className="space-y-2">
                    <textarea
                      rows={6}
                      placeholder="e.g. Beautiful architect-designed two-story home located in a highly residential, quiet neighborhood. Built with premium materials including mahogany doors and luxury tiles. Features a spacious landscaped garden, double carport, and stunning roof deck. Walking distance to supermarkets, international schools, and transport options."
                      value={description}
                      onFocus={() => setActiveSection('description')}
                      onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                      className={`w-full p-4 bg-[#F8FAF8] border rounded-2xl text-xs font-bold leading-relaxed outline-none focus:ring-1 focus:ring-[#004F31] resize-none ${
                        errors.description ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                      }`}
                    />
                    
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 font-extrabold uppercase">
                      <span>Min 50 / Max 2,000 chars</span>
                      <span className={`px-2 py-0.5 rounded font-black ${
                        description.length < 50 
                          ? 'text-orange-500 bg-orange-50' 
                          : description.length < 150 
                            ? 'text-[#004F31] bg-emerald-50' 
                            : 'text-emerald-700 bg-emerald-100'
                      }`}>
                        {description.length < 50 ? "⚠️ Short" : description.length < 400 ? "🟢 Good" : "✨ Rich Description"} ({description.length} chars)
                      </span>
                    </div>
                    {errors.description && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.description}</p>}
                  </div>
                </div>

                {/* 4. Location Details & Map */}
                <div 
                  className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-6"
                  onClick={() => setActiveSection('location')}
                >
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900">Pinpoint the Exact Location</h3>
                    <p className="text-xs text-neutral-500 font-semibold mt-0.5">Let buyers find your property easily. Center your location and drop a pin.</p>
                  </div>

                  <div className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Searchable Province District Hub Popover */}
                      <div className="relative space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Province District Hub *</label>
                        <div 
                          onClick={() => {
                            setShowDistrictDropdown(!showDistrictDropdown);
                            setActiveSection('location');
                          }}
                          className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none cursor-pointer flex justify-between items-center hover:border-neutral-300 transition-colors"
                        >
                          <span>{district}</span>
                          <span className="text-neutral-400 text-[10px]">▼</span>
                        </div>
                        
                        {showDistrictDropdown && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto p-3 space-y-3">
                            <input
                              type="text"
                              placeholder="Search districts..."
                              value={districtSearch}
                              onChange={(e) => setDistrictSearch(e.target.value)}
                              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31] bg-[#F8FAF8]"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="space-y-3">
                              {PROVINCE_DISTRICTS.map((prov) => {
                                const filteredDistricts = prov.districts.filter(d => 
                                  d.toLowerCase().includes(districtSearch.toLowerCase())
                                );
                                if (filteredDistricts.length === 0) return null;
                                return (
                                  <div key={prov.province} className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-[#004F31] tracking-widest bg-[#004F31]/5 px-2 py-0.5 rounded">
                                      {prov.province}
                                    </span>
                                    <div className="grid grid-cols-2 gap-1 pt-1">
                                      {filteredDistricts.map((d) => (
                                        <button
                                          type="button"
                                          key={d}
                                          onClick={() => {
                                            setDistrict(d);
                                            setCity(''); // Clear city on district change
                                            setShowDistrictDropdown(false);
                                            setDistrictSearch('');
                                          }}
                                          className={`px-2 py-1.5 rounded-lg text-left text-xs font-bold transition-all ${
                                            district === d 
                                              ? 'bg-[#004F31] text-white' 
                                              : 'hover:bg-neutral-50 text-neutral-700'
                                          }`}
                                        >
                                          {d}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* City/Suburb with focus suggestion autocomplete list */}
                      <div className="relative space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">City / Suburb Town *</label>
                        <input
                          type="text"
                          placeholder="e.g. Kollupitiya, Malabe, Kottawa"
                          value={city}
                          onFocus={() => {
                            setCityFocus(true);
                            setActiveSection('location');
                          }}
                          onBlur={() => setTimeout(() => setCityFocus(false), 200)}
                          onChange={(e) => setCity(e.target.value)}
                          className={`w-full px-4 py-3 bg-[#F8FAF8] border rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31] ${
                            errors.city ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                          }`}
                        />
                        {errors.city && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.city}</p>}
                        
                        {cityFocus && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-40 max-h-48 overflow-y-auto">
                            {getFilteredCities().length > 0 ? (
                              getFilteredCities().map((c) => (
                                <button
                                  type="button"
                                  key={c.city}
                                  onClick={() => {
                                    setCity(c.city);
                                    setCityFocus(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 text-xs font-bold text-neutral-700 border-b border-neutral-100 last:border-0"
                                >
                                  📍 {c.city}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-[10px] text-neutral-400 font-bold uppercase">
                                Custom City Name Entered
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Street Address / Landmark *</label>
                      <input
                        type="text"
                        placeholder="e.g. 124 Galle Road (Near Prime Junction)"
                        value={address}
                        onFocus={() => setActiveSection('location')}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full px-4 py-3 bg-[#F8FAF8] border rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31] ${
                          errors.address ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                        }`}
                      />
                      {errors.address && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.address}</p>}
                    </div>

                    {/* Interactive map panel with geocoding search directly above */}
                    <div className="space-y-2 pt-2">
                      <div className="flex flex-col sm:flex-row items-stretch gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Type town or road name (e.g. Galle Road, Kollupitiya)..."
                            value={searchQuery}
                            onFocus={() => setActiveSection('location')}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31]"
                          />
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleLocateAddress}
                            disabled={isSearchingMap}
                            className="px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {isSearchingMap ? <Loader2 size={12} className="animate-spin" /> : "📍 Locate"}
                          </button>
                          <button
                            type="button"
                            onClick={handleGPSGeolocate}
                            className="px-4 py-2.5 bg-emerald-50 text-[#004F31] border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            🛰️ Live GPS
                          </button>
                        </div>
                      </div>

                      {gpsAccuracy && (
                        <p className="text-[9px] font-black uppercase tracking-wider text-[#004F31] bg-[#004F31]/5 p-2 rounded-lg border border-[#004F31]/10">
                          🧭 {gpsAccuracy}
                        </p>
                      )}

                      <div className="h-64 rounded-2xl overflow-hidden border border-neutral-200 relative z-10 shadow-sm">
                        <MapContainer
                          center={[lat, lng]}
                          zoom={13}
                          style={{ height: "100%", width: "100%" }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <MapClickEvents
                            onClick={(latlng) => {
                              setLat(latlng.lat);
                              setLng(latlng.lng);
                              setHasPinned(true);
                              setGpsAccuracy(`Pinned manually (Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)})`);
                            }}
                          />
                          <RecenterMap lat={lat} lng={lng} />
                          {hasPinned && (
                            <Marker 
                              position={[lat, lng]} 
                              draggable={true}
                              eventHandlers={{
                                dragend: (e) => {
                                  const marker = e.target;
                                  const position = marker.getLatLng();
                                  setLat(position.lat);
                                  setLng(position.lng);
                                  setHasPinned(true);
                                  setGpsAccuracy(`Draggable verified coordinate adjust: (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)})`);
                                },
                              }}
                            />
                          )}
                        </MapContainer>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="bg-[#F8FAF8] border border-neutral-100 p-2 rounded-xl text-center">
                          <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">Latitude</span>
                          <span className="text-xs font-extrabold text-[#004F31]">{lat.toFixed(6)}</span>
                        </div>
                        <div className="bg-[#F8FAF8] border border-neutral-100 p-2 rounded-xl text-center">
                          <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">Longitude</span>
                          <span className="text-xs font-extrabold text-[#004F31]">{lng.toFixed(6)}</span>
                        </div>
                      </div>

                      {/* Detected Nearby Landmarks checklist */}
                      <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/60 space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#004F31] block">
                          ⚡ Auto-detected nearby landmarks
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-bold text-neutral-600">
                          {getNearbyLandmarks().map((landmark, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-neutral-200/40">
                              <span className="text-emerald-600">✓</span>
                              <span>{landmark}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>

                {/* 5. Amenities checklist */}
                {category !== 'Land' && (
                  <div 
                    className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-6"
                    onClick={() => setActiveSection('amenities')}
                  >
                    <div>
                      <h3 className="text-base font-extrabold text-neutral-900 font-display">Special Amenities Pool</h3>
                      <p className="text-xs text-neutral-500 font-semibold mt-0.5">Highlight specific features to stand out in search filter results.</p>
                    </div>

                    <div className="space-y-6">
                      {AMENITY_GROUPS.map((grp) => {
                        const activeInGroup = grp.amenities.filter(a => selectedAmenities.includes(a));
                        const isAllSelected = activeInGroup.length === grp.amenities.length;
                        
                        return (
                          <div key={grp.title} className="space-y-2.5">
                            <div className="flex justify-between items-center bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-100">
                              <h4 className="text-xs font-black uppercase text-neutral-800 tracking-wider">
                                {grp.title} <span className="text-[10px] text-neutral-400">({activeInGroup.length}/{grp.amenities.length})</span>
                              </h4>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSection('amenities');
                                  if (isAllSelected) {
                                    // Deselect all
                                    setSelectedAmenities(selectedAmenities.filter(a => !grp.amenities.includes(a)));
                                  } else {
                                    // Select all
                                    const union = Array.from(new Set([...selectedAmenities, ...grp.amenities]));
                                    setSelectedAmenities(union);
                                  }
                                }}
                                className="text-[10px] font-black uppercase text-[#004F31] hover:underline"
                              >
                                {isAllSelected ? "Deselect All" : "Select All Group"}
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {grp.amenities.map((amenity) => {
                                const isChecked = selectedAmenities.includes(amenity);
                                return (
                                  <button
                                    type="button"
                                    key={amenity}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSection('amenities');
                                      if (isChecked) {
                                        setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                                      } else {
                                        setSelectedAmenities([...selectedAmenities, amenity]);
                                      }
                                    }}
                                    className={`p-2.5 border rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2 ${
                                      isChecked 
                                        ? 'bg-[#004F31]/5 border-[#004F31] text-[#004F31]' 
                                        : 'bg-white border-neutral-200/80 text-neutral-600 hover:border-neutral-300'
                                    }`}
                                  >
                                    <span className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                                      isChecked ? 'bg-[#004F31] border-[#004F31] text-white' : 'border-neutral-300 bg-white'
                                    }`}>
                                      {isChecked && '✓'}
                                    </span>
                                    <span className="truncate">{amenity}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. Contact Details for Inquiries */}
                <div 
                  className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-6"
                  onClick={() => setActiveSection('contact')}
                >
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900">Contact details for Inquiries</h3>
                    <p className="text-xs text-neutral-500 font-semibold mt-0.5">Let buyers know who to contact when inquiring about this listing.</p>
                  </div>

                  <div className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Contact Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Ashan Perera"
                          value={contactName}
                          onFocus={() => setActiveSection('contact')}
                          onChange={(e) => setContactName(e.target.value)}
                          className={`w-full px-4 py-3 bg-[#F8FAF8] border rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31] ${
                            errors.contactName ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                          }`}
                        />
                        {errors.contactName && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.contactName}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Contact Phone Number *</label>
                        <input
                          type="text"
                          placeholder="e.g. 0771234567"
                          value={contactPhone}
                          onFocus={() => setActiveSection('contact')}
                          onChange={(e) => {
                            setContactPhone(e.target.value);
                            if (sameAsPhone) {
                              setContactWhatsapp(e.target.value);
                            }
                          }}
                          className={`w-full px-4 py-3 bg-[#F8FAF8] border rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31] ${
                            errors.contactPhone ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                          }`}
                        />
                        {errors.contactPhone && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.contactPhone}</p>}
                      </div>

                    </div>

                    <div className="p-4 bg-[#F8FAF8] border border-neutral-200/80 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-neutral-700 cursor-pointer select-none" htmlFor="sameAsPhone">
                          💬 WhatsApp is same as phone number
                        </label>
                        <input
                          id="sameAsPhone"
                          type="checkbox"
                          checked={sameAsPhone}
                          onChange={(e) => {
                            setSameAsPhone(e.target.checked);
                            if (e.target.checked) {
                              setContactWhatsapp(contactPhone);
                            }
                          }}
                          className="h-4.5 w-4.5 accent-[#004F31] rounded"
                        />
                      </div>

                      {!sameAsPhone && (
                        <div className="space-y-1 pt-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">WhatsApp Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 0771234567"
                            value={contactWhatsapp}
                            onFocus={() => setActiveSection('contact')}
                            onChange={(e) => setContactWhatsapp(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Display Preference</label>
                        <select
                          value={displayPreference}
                          onChange={(e) => setDisplayPreference(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31]"
                        >
                          <option>Both phone and WhatsApp</option>
                          <option>Phone call only</option>
                          <option>WhatsApp chat only</option>
                          <option>Email only (hide phone)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Typical Response Time</label>
                        <select
                          value={responseTime}
                          onChange={(e) => setResponseTime(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31]"
                        >
                          <option>Within a few minutes</option>
                          <option>Within a few hours</option>
                          <option>Within 24 hours</option>
                          <option>Flexible (Response varies)</option>
                        </select>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Next Button Step 1 */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={handleStartFresh}
                    className="text-xs text-red-600 hover:text-red-800 font-extrabold uppercase tracking-widest cursor-pointer hover:underline"
                  >
                    🗑️ Clear & Start Fresh
                  </button>
                  <button
                    onClick={handleNextStep1}
                    className="w-full sm:w-auto py-4 px-10 bg-[#004F31] hover:bg-emerald-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-950/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    Next: Add Photos <ArrowRight size={14} />
                  </button>
                </div>

              </div>

              {/* Sticky Top-24 Visual Helper Card and Listing Strength Meter */}
              <div className="lg:col-span-1 space-y-6">
                <div className="sticky top-24 space-y-6">
                  
                  {/* Visual Strength Meter Card */}
                  <div className="bg-white rounded-[32px] p-6 border border-neutral-200 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#004F31]">Listing Strength</h4>
                      <p className="text-[11px] text-neutral-400 font-bold mt-0.5">Maximize strength to secure 3x faster verification!</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-neutral-800">
                          {getListingStrength().strength}% Complete
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          getListingStrength().strength < 50 
                            ? 'bg-amber-50 text-amber-600' 
                            : getListingStrength().strength < 80 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-emerald-100 text-[#004F31]'
                        }`}>
                          {getListingStrength().strength < 50 ? "Weak" : getListingStrength().strength < 80 ? "Moderate" : "Excellent"}
                        </span>
                      </div>

                      {/* Percentage Bar */}
                      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#004F31]"
                          initial={{ width: '15%' }}
                          animate={{ width: `${getListingStrength().strength}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>

                    {/* Pending Items checklist */}
                    {getListingStrength().pending.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                          Remaining Checklist ({getListingStrength().pending.length})
                        </span>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {getListingStrength().pending.map((item) => (
                            <div key={item} className="flex items-center gap-2 text-[11px] font-bold text-neutral-500">
                              <span className="h-2 w-2 rounded-full bg-neutral-300" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 text-[#004F31] p-3 rounded-2xl border border-emerald-100 text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                        ✨ listing is 100% optimized!
                      </div>
                    )}
                  </div>

                  {/* Section Contextual Advice card (Switches text live based on activeSection) */}
                  <div className="bg-[#004F31] text-white rounded-[32px] p-6 sm:p-7 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-800/30 rounded-full blur-xl" />
                    
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-900 text-emerald-200 px-2.5 py-1 rounded-full">
                        Contextual Advice
                      </span>
                      <h4 className="text-sm font-extrabold font-display leading-tight pt-1.5">
                        {getSectionAdvice().title}
                      </h4>
                    </div>

                    <ul className="space-y-3 text-xs text-emerald-100 font-semibold">
                      {getSectionAdvice().tips.map((tip, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-emerald-300">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="bg-[#003822] rounded-2xl p-3.5 border border-emerald-800/60 text-[11px] leading-relaxed text-emerald-150 font-extrabold">
                      {getSectionAdvice().highlight}
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* STEP 2: Images Upload */}
          {step === 2 && (
            <motion.div
              key="step-images"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 max-w-5xl mx-auto"
            >
              {/* Hidden file input (ONE input, reused) */}
              <input
                type="file"
                id="photo-picker"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                style={{ display: 'none' }}
              />

              {/* Page Header */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-display">Add Property Photos</h2>
                <p className="text-xs sm:text-sm text-neutral-500 font-semibold max-w-xl mx-auto">
                  Great photos get 3× more inquiries from serious buyers.
                </p>
              </div>

              {/* Plan Badge */}
              {(() => {
                const plan = localStorage.getItem('lp_selected_plan') || selectedPlan || 'starter_free';
                if (plan === 'starter_free') {
                  return (
                    <div className="bg-slate-100 border border-slate-200 rounded-[24px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-sm font-black text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                          🏠 Free Plan — Up to 6 Photos
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold">Want to upload more showcase images of your property?</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="py-2.5 px-5 bg-[#004F31] hover:bg-emerald-950 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-emerald-950/15 transition-all flex items-center gap-1.5 cursor-pointer border-0"
                      >
                        Upgrade for up to 12 photos →
                      </button>
                    </div>
                  );
                } else if (plan === 'premium_pro') {
                  return (
                    <div className="bg-[#f0fdf4] border border-emerald-100 rounded-[24px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-sm font-black text-[#004F31] flex items-center justify-center sm:justify-start gap-1.5">
                          ⭐ Premium Pro — Up to 9 Photos
                        </h4>
                        <p className="text-xs text-emerald-700/80 font-semibold">Unlock maximum listing capacity for wider coverage.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="py-2.5 px-5 bg-[#004F31] hover:bg-emerald-950 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-emerald-950/15 transition-all flex items-center gap-1.5 cursor-pointer border-0"
                      >
                        👑 Upgrade to Elite Pro →
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-[#f0f4ff] border border-blue-100 rounded-[24px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-sm font-black text-blue-900 flex items-center justify-center sm:justify-start gap-1.5">
                          👑 Elite Pro — Up to 12 Photos ✅
                        </h4>
                        <p className="text-xs text-blue-700/80 font-semibold">Maximum photo slots unlocked! Fill them to get premium buyers.</p>
                      </div>
                    </div>
                  );
                }
              })()}

              {/* Photo Count Bar */}
              {(() => {
                const plan = localStorage.getItem('lp_selected_plan') || selectedPlan || 'starter_free';
                const photoLimits: Record<string, number> = {
                  'starter_free': 6,
                  'premium_pro': 9,
                  'elite_pro': 12
                };
                const maxPhotos = photoLimits[plan] || 6;
                const photosCount = images.filter(img => img !== null).length;
                const progressPct = Math.min((photosCount / maxPhotos) * 100, 100);

                const status = getProgressStatus(photosCount, maxPhotos);

                return (
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                      <span className="text-neutral-500">Photos added: {photosCount} / {maxPhotos}</span>
                      <span className={`${
                        photosCount === 0 ? 'text-red-500' :
                        photosCount === maxPhotos ? 'text-emerald-600' :
                        photosCount <= 2 ? 'text-orange-500' : 'text-yellow-600'
                      }`}>{status.text}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                      <motion.div
                        className={`h-full ${status.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Photo Grid */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white border border-neutral-200/60 rounded-[32px] shadow-sm relative"
              >
                {Array.from({ length: 12 }).map((_, idx) => {
                  const plan = localStorage.getItem('lp_selected_plan') || selectedPlan || 'starter_free';
                  const photoLimits: Record<string, number> = {
                    'starter_free': 6,
                    'premium_pro': 9,
                    'elite_pro': 12
                  };
                  const maxPhotos = photoLimits[plan] || 6;
                  const isLocked = idx >= maxPhotos;
                  const photo = images[idx];

                  if (isLocked) {
                    return (
                      <div
                        key={idx}
                        onClick={() => setShowUpgradeModal(true)}
                        className="relative w-full h-[200px] rounded-2xl bg-slate-100 border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 hover:bg-slate-200/40 opacity-35 select-none"
                      >
                        {/* Number Badge with lock */}
                        <div className="absolute top-[10px] left-[10px] bg-[#334155] text-white text-[11px] font-bold px-2 py-0.5 rounded-[6px] flex items-center gap-1 z-10 shadow">
                          <span>{idx + 1}</span>
                          <Lock size={9} />
                        </div>

                        <div className="space-y-2 flex flex-col items-center">
                          <Lock size={28} className="text-slate-400" />
                          <div className="text-[11px] font-black uppercase tracking-[2px] text-slate-500">
                            LOCKED
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (photo) {
                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOverSlot(e, idx)}
                        onDrop={(e) => handleDropSlot(e, idx)}
                        onDragEnd={handleDragEnd}
                        className="relative w-full h-[200px] rounded-2xl overflow-hidden group border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center select-none"
                      >
                        {/* Drag indicator overlay on hover */}
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-grab active:cursor-grabbing flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 shadow-sm">
                          <span>⠿</span>
                          <span>DRAG</span>
                        </div>

                        {/* Delete button (✕) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteIndex(idx);
                          }}
                          className="absolute top-2.5 right-2.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors cursor-pointer z-20 shadow-sm text-xs font-bold border-0"
                        >
                          ✕
                        </button>

                        {/* Image element */}
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover rounded-2xl"
                          referrerPolicy="no-referrer"
                        />

                        {/* Number Badge */}
                        {idx === 0 ? (
                          <div className="absolute top-[10px] left-[10px] bg-[#004F31] text-white text-[11px] font-black uppercase px-2 py-1 rounded-[6px] z-10 shadow">
                            MAIN
                          </div>
                        ) : (
                          <div className="absolute top-[10px] left-[10px] bg-[#334155] text-white text-[11px] font-bold px-2 py-0.5 rounded-[6px] z-10 shadow">
                            {idx + 1}
                          </div>
                        )}

                        {/* Stale Draft Notice (Requires upload) */}
                        {photo.isStale && (
                          <div className="absolute inset-0 bg-slate-900/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 z-10">
                            <Camera size={24} className="text-amber-400 animate-bounce" />
                            <p className="text-[10px] text-amber-200 font-extrabold uppercase leading-snug">
                              📸 Please re-add your photos
                            </p>
                            <p className="text-[9px] text-slate-300 font-semibold leading-normal">
                              Browser security requires a fresh file upload on refresh.
                            </p>
                          </div>
                        )}

                        {/* Hover click to replace overlay */}
                        {!photo.isStale && confirmDeleteIndex !== idx && (
                          <div
                            onClick={() => {
                              setSelectedSlotIndex(idx);
                              setTimeout(() => {
                                document.getElementById('photo-picker')?.click();
                              }, 50);
                            }}
                            className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-2xl cursor-pointer z-10"
                          >
                            <span className="text-white text-[11px] font-black uppercase tracking-wider bg-slate-900/85 px-3 py-1.5 rounded-full shadow-sm">
                              📷 Click to Replace
                            </span>
                          </div>
                        )}

                        {/* Delete confirmation overlay */}
                        {confirmDeleteIndex === idx && (
                          <div className="absolute inset-0 bg-slate-900/95 rounded-2xl flex flex-col items-center justify-center p-3 text-center space-y-2 z-30">
                            <span className="text-white text-[11px] font-bold">Remove this photo?</span>
                            <div className="flex gap-2 w-full justify-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(idx);
                                  setConfirmDeleteIndex(null);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-transform border-0"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteIndex(null);
                                }}
                                className="bg-slate-700 hover:bg-slate-600 text-white font-black text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-transform border-0"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Active Empty slot (clickable)
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedSlotIndex(idx);
                        setTimeout(() => {
                          document.getElementById('photo-picker')?.click();
                        }, 50);
                      }}
                      className="relative w-full h-[200px] rounded-2xl bg-slate-50/50 border-2 border-dashed border-slate-300 hover:border-[#004F31] hover:bg-[#f0fdf4] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 group select-none"
                    >
                      {/* Number Badge */}
                      {idx === 0 ? (
                        <div className="absolute top-[10px] left-[10px] bg-[#004F31] text-white text-[11px] font-black uppercase px-2 py-1 rounded-[6px] shadow-sm">
                          MAIN
                        </div>
                      ) : (
                        <div className="absolute top-[10px] left-[10px] bg-[#334155] text-white text-[11px] font-bold px-2 py-0.5 rounded-[6px] shadow-sm">
                          {idx + 1}
                        </div>
                      )}

                      <div className="space-y-2 flex flex-col items-center">
                        <Camera size={32} className="text-slate-400 group-hover:text-[#004F31] transition-colors duration-200" />
                        <div className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 group-hover:text-[#004F31] transition-colors duration-200">
                          ADD PHOTO
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drag explanation text */}
              <div className="text-center">
                <p className="text-xs text-neutral-500 font-bold italic">
                  🔄 Drag photos to reorder. The first photo is your cover image.
                </p>
              </div>

              {/* Photo Tips section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#004F31] text-center">📸 Photo Tips for Serious Leads</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center space-y-1.5 shadow-sm">
                    <span className="text-xl">☀️</span>
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Good Lighting</h5>
                    <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">Take photos in daylight for best results</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center space-y-1.5 shadow-sm">
                    <span className="text-xl">🏠</span>
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Show the Front First</h5>
                    <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">Box 1 (MAIN) is what buyers see first</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center space-y-1.5 shadow-sm">
                    <span className="text-xl">📱</span>
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Landscape Mode</h5>
                    <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">Turn phone sideways for wider shots</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center space-y-1.5 shadow-sm">
                    <span className="text-xl">🧹</span>
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Clean & Tidy</h5>
                    <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">Remove clutter before taking photos</p>
                  </div>
                </div>
              </div>

              {/* AI Notice */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-[24px] p-6 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-100/40 rounded-full blur-lg" />
                <h4 className="text-xs sm:text-sm font-black text-[#004F31] flex items-center gap-1.5">
                  ✨ AI Photo Enhancement — FREE
                </h4>
                <div className="space-y-1.5 pl-0.5">
                  <p className="text-[11px] font-bold text-emerald-800/95 leading-relaxed">
                    All your photos are automatically enhanced by our AI:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px] font-extrabold text-emerald-700">
                    <li className="flex items-center gap-1">✓ Brightness corrected</li>
                    <li className="flex items-center gap-1">✓ Sharpness improved</li>
                    <li className="flex items-center gap-1">✓ Colors optimized</li>
                  </ul>
                  <p className="text-[9.5px] font-semibold text-emerald-600/80 pt-1">
                    Your original photos are always saved.
                  </p>
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="flex flex-col items-center gap-3 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto py-3.5 px-6 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft size={13} /> Back to Details
                  </button>
                  <button
                    onClick={handleNextStep2}
                    className="w-full sm:w-auto py-3.5 px-8 bg-[#004F31] hover:bg-emerald-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-950/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border-0"
                  >
                    Next: Choose Your Plan →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-[11px] font-black uppercase tracking-wider text-[#004F31] hover:underline cursor-pointer block text-center border-0 bg-transparent mt-2"
                >
                  Skip photos for now →
                </button>
              </div>

              {/* 1. NO PHOTOS WARNING MODAL */}
              {showNoPhotosModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-100">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-neutral-100 space-y-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                        ⚠️
                      </div>
                      <div className="space-y-1 text-left">
                        <h4 className="text-base font-extrabold text-neutral-900 leading-snug">
                          You haven't added any photos yet
                        </h4>
                        <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                          Listings with photos get 10× more views. Are you sure you want to continue without photos?
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNoPhotosModal(false)}
                        className="py-3 px-5 border border-neutral-200 text-neutral-600 font-black text-[10.5px] uppercase tracking-widest rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        Add Photos
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNoPhotosModal(false);
                          setStep(3);
                        }}
                        className="py-3 px-5 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10.5px] uppercase tracking-widest rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-amber-600/10 border-0"
                      >
                        Continue Anyway <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* 2. UPGRADE TO UNLOCK PHOTOS MODAL */}
              {showUpgradeModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-100">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-neutral-100 space-y-6 relative"
                  >
                    <button
                      type="button"
                      onClick={() => setShowUpgradeModal(false)}
                      className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer border-0 bg-transparent"
                    >
                      ✕
                    </button>

                    <div className="space-y-1 text-left">
                      <h4 className="text-base sm:text-lg font-extrabold text-neutral-900 flex items-center gap-1.5 font-display">
                        🔒 More Photos Available
                      </h4>
                      <p className="text-xs text-neutral-500 font-semibold">
                        Your current plan allows up to{' '}
                        {(() => {
                          const plan = localStorage.getItem('lp_selected_plan') || selectedPlan || 'starter_free';
                          return plan === 'starter_free' ? '6' : '9';
                        })()}{' '}
                        photos.
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-2 text-left">
                      <div className="border border-neutral-100 rounded-2xl p-4 bg-emerald-50/10 flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-[#004F31] px-2.5 py-0.5 rounded-full">
                            ⭐ Premium Pro
                          </span>
                          <p className="text-[11px] font-semibold text-neutral-500">Up to 9 high-quality photos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-neutral-900">Rs. 4,500</p>
                          <p className="text-[10px] font-bold text-neutral-400">/ 2 Months</p>
                        </div>
                      </div>

                      <div className="border border-neutral-100 rounded-2xl p-4 bg-blue-50/10 flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-full">
                            👑 Elite Pro
                          </span>
                          <p className="text-[11px] font-semibold text-neutral-500">Up to 12 maximum slots unlocked</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-neutral-900">Rs. 8,500</p>
                          <p className="text-[10px] font-bold text-neutral-400">/ 3 Months</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowUpgradeModal(false)}
                        className="py-3 px-5 border border-neutral-200 text-neutral-600 font-black text-[10.5px] uppercase tracking-widest rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        Not Now
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowUpgradeModal(false);
                          setStep(3);
                        }}
                        className="py-3 px-5 bg-[#004F31] hover:bg-emerald-950 text-white font-black text-[10.5px] uppercase tracking-widest rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/15 border-0"
                      >
                        Upgrade My Plan <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

            </motion.div>
          )}

          {/* STEP 3: Package Selection */}
          {step === 3 && (
            <motion.div
              key="step-package"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <h3 className="text-xl font-extrabold text-neutral-900 font-display">Choose an Ad Marketing Package</h3>
                <p className="text-xs text-neutral-500 font-semibold leading-relaxed">Boost your listing exposure and reach premium buyers instantly across Sri Lanka.</p>
              </div>

              {/* Package cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Starter Free */}
                <div
                  onClick={() => handleSelectPlan('starter_free')}
                  className={`bg-white rounded-[32px] p-8 border transition-all flex flex-col justify-between relative cursor-pointer group ${
                    selectedPlan === 'starter_free' 
                      ? 'border-[#004F31] ring-2 ring-[#004F31]/10 scale-[1.02]' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="space-y-5">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-100 text-neutral-500 px-3 py-1 rounded-full border border-neutral-200">
                        Starter Free
                      </span>
                      {selectedPlan === 'starter_free' && (
                        <span className="h-5 w-5 rounded-full bg-[#004F31] text-white flex items-center justify-center text-xs">✓</span>
                      )}
                    </div>
                    <div>
                      <span className="text-2xl font-black text-neutral-900">Rs. 0</span>
                      <span className="text-neutral-400 text-xs font-bold block mt-0.5">30 Months Exposure</span>
                    </div>
                    <ul className="space-y-3.5 text-xs text-neutral-600 font-bold border-t border-neutral-100 pt-5">
                      <li className="flex gap-2">✅ Standard search placement</li>
                      <li className="flex gap-2">✅ Email support queue</li>
                      <li className="flex gap-2 text-neutral-400 line-through">❌ Featured Position Top 10</li>
                      <li className="flex gap-2 text-neutral-400 line-through">❌ WhatsApp Instant Lead Alerts</li>
                    </ul>
                  </div>
                  <div className="pt-8">
                    <button
                      type="button"
                      className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        selectedPlan === 'starter_free' 
                          ? 'bg-[#004F31] text-white shadow-lg shadow-emerald-950/25' 
                          : 'bg-neutral-100 text-neutral-600 hover:bg-[#004F31] hover:text-white'
                      }`}
                    >
                      {selectedPlan === 'starter_free' ? 'Plan Selected' : 'Choose Starter'}
                    </button>
                  </div>
                </div>

                {/* 2. Premium Pro (Popular) */}
                <div
                  onClick={() => handleSelectPlan('premium_pro')}
                  className={`bg-white rounded-[32px] p-8 border transition-all flex flex-col justify-between relative cursor-pointer group ${
                    selectedPlan === 'premium_pro' 
                      ? 'border-[#004F31] ring-2 ring-[#004F31]/10 scale-[1.02]' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#004F31] text-white text-[9px] font-black uppercase rounded-full tracking-widest shadow-md">
                    Most Popular Choice
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-start pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-[#004F31] px-3 py-1 rounded-full border border-emerald-100">
                        Premium Pro
                      </span>
                      {selectedPlan === 'premium_pro' && (
                        <span className="h-5 w-5 rounded-full bg-[#004F31] text-white flex items-center justify-center text-xs">✓</span>
                      )}
                    </div>
                    <div>
                      <span className="text-2xl font-black text-neutral-900">Rs. 4,500</span>
                      <span className="text-neutral-400 text-xs font-bold block mt-0.5">60 Days Exposure Limit</span>
                    </div>
                    <ul className="space-y-3.5 text-xs text-neutral-600 font-bold border-t border-neutral-100 pt-5">
                      <li className="flex gap-2">✨ Featured Position (Top 10 listings)</li>
                      <li className="flex gap-2">✨ Multi-Site Auto Syndication</li>
                      <li className="flex gap-2">✨ WhatsApp Lead Notifications</li>
                      <li className="flex gap-2">✨ Priority VIP placement</li>
                    </ul>
                  </div>
                  <div className="pt-8">
                    <button
                      type="button"
                      className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        selectedPlan === 'premium_pro' 
                          ? 'bg-[#004F31] text-white shadow-lg shadow-emerald-950/25' 
                          : 'bg-neutral-100 text-neutral-600 hover:bg-[#004F31] hover:text-white'
                      }`}
                    >
                      {selectedPlan === 'premium_pro' ? 'Plan Selected' : 'Choose Premium'}
                    </button>
                  </div>
                </div>

                {/* 3. Elite Pro */}
                <div
                  onClick={() => handleSelectPlan('elite_pro')}
                  className={`bg-white rounded-[32px] p-8 border transition-all flex flex-col justify-between relative cursor-pointer group ${
                    selectedPlan === 'elite_pro' 
                      ? 'border-[#004F31] ring-2 ring-[#004F31]/10 scale-[1.02]' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="space-y-5">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full border border-yellow-200">
                        Elite Pro
                      </span>
                      {selectedPlan === 'elite_pro' && (
                        <span className="h-5 w-5 rounded-full bg-[#004F31] text-white flex items-center justify-center text-xs">✓</span>
                      )}
                    </div>
                    <div>
                      <span className="text-2xl font-black text-neutral-900">Rs. 8,500</span>
                      <span className="text-neutral-400 text-xs font-bold block mt-0.5">90 Days Full Exposure</span>
                    </div>
                    <ul className="space-y-3.5 text-xs text-neutral-600 font-bold border-t border-neutral-100 pt-5">
                      <li className="flex gap-2">🌟 Top-Shelf Branding Banner</li>
                      <li className="flex gap-2">🌟 360° virtual tour creator support</li>
                      <li className="flex gap-2">🌟 Verified Seller golden badge</li>
                      <li className="flex gap-2">🌟 Homepage slider exposure</li>
                    </ul>
                  </div>
                  <div className="pt-8">
                    <button
                      type="button"
                      className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        selectedPlan === 'elite_pro' 
                          ? 'bg-[#004F31] text-white shadow-lg shadow-emerald-950/25' 
                          : 'bg-neutral-100 text-neutral-600 hover:bg-[#004F31] hover:text-white'
                      }`}
                    >
                      {selectedPlan === 'elite_pro' ? 'Plan Selected' : 'Choose Elite'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Order Summary box updates dynamically */}
              <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm max-w-2xl mx-auto space-y-4">
                
                {selectedPlan === 'starter_free' ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3">
                    <span className="text-lg">✅</span>
                    <div>
                      <h4 className="text-xs font-black uppercase text-[#004F31] tracking-wider">Free plan selected</h4>
                      <p className="text-[11px] text-emerald-800 font-semibold leading-normal mt-0.5">
                        No payment required! Continue to quickly save your details and go live.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Plan Selected</span>
                        <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mt-0.5">
                          {selectedPlan === 'premium_pro' ? 'Premium Pro' : 'Elite Pro'}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Subtotal</span>
                        <h4 className="text-sm font-black text-[#004F31] mt-0.5">
                          Rs. {selectedPlan === 'premium_pro' ? '4,500' : '8,500'} LKR
                        </h4>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-semibold text-neutral-500">
                      <span>💳 Payment Gateway:</span>
                      <span className="font-extrabold text-neutral-700">PayHere Sandbox Gate</span>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex gap-3">
                      <span className="text-sm mt-0.5">⚠️</span>
                      <p className="text-[11px] text-yellow-800 font-semibold leading-normal">
                        Create your account in the next step first, then complete checkout to unlock premium features.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Back / Next panel */}
              <div className="flex justify-between pt-4 max-w-2xl mx-auto">
                <button
                  onClick={() => setStep(2)}
                  className="py-4 px-6 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2"
                >
                  <ArrowLeft size={13} /> Back to Photos
                </button>
                <button
                  onClick={handleNextStep3}
                  className="py-4 px-10 bg-[#004F31] hover:bg-emerald-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-950/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  Continue: Create Account <ArrowRight size={14} />
                </button>
              </div>

            </motion.div>
          )}

          {/* STEP 4: Create Account & Payment Flow */}
          {step === 4 && (
            <motion.div
              key="step-auth"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              
              {/* Draft reminder banner */}
              <div className="bg-[#004F31] text-white rounded-[24px] p-5 shadow-md flex justify-between items-center relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] font-black bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700 uppercase tracking-widest">
                    Draft Saved
                  </span>
                  <h4 className="text-xs font-extrabold line-clamp-1">{title || 'Untitled Property'}</h4>
                  <p className="text-[10px] text-emerald-100 font-semibold">
                    {district} • {category} • Rs. {formatPriceComma(priceLkr) || '0'}
                  </p>
                </div>
                <div className="text-right shrink-0 relative z-10">
                  <span className="text-[9px] font-black text-emerald-200 block">SELECTED PLAN</span>
                  <span className="text-xs font-black uppercase tracking-wide text-yellow-400">
                    ⭐ {selectedPlan === 'starter_free' ? 'Starter Free' : selectedPlan === 'premium_pro' ? 'Premium Pro' : 'Elite Pro'}
                  </span>
                </div>
                <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-800/20 rounded-full blur-lg" />
              </div>

              {/* Toggle Login Mode inside Wizard */}
              {!isPaymentMode && (
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-6">
                  
                  <div className="text-center">
                    <h3 className="text-lg font-black text-neutral-900 font-display">
                      {isLoginMode ? 'Login to Publish Listing' : 'Almost Done! Create Your Account'}
                    </h3>
                    <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                      {isLoginMode ? 'Sign in with your credentials to link your new draft property.' : 'Your details are safe. Create a free seller account to go live.'}
                    </p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    
                    {!isLoginMode && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Deshani Kaushalya"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Email Address *</label>
                      <input
                        type="email"
                        placeholder="e.g. owner@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>

                    {!isLoginMode && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Phone Number *</label>
                          <input
                            type="tel"
                            placeholder="e.g. +94771234567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">WhatsApp Number (Optional)</label>
                          <input
                            type="tel"
                            placeholder="e.g. +94771234567"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Password *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Min 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-neutral-400 hover:text-neutral-600"
                          >
                            <EyeOff size={14} />
                          </button>
                        </div>
                        {password && password.length < 8 && (
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider">Password must be at least 8 chars</p>
                        )}
                      </div>

                      {!isLoginMode && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Confirm Password *</label>
                          <input
                            type="password"
                            placeholder="Match your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                          />
                          {confirmPassword && password !== confirmPassword && (
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">Passwords do not match</p>
                          )}
                        </div>
                      )}
                    </div>

                    {!isLoginMode && (
                      <div className="space-y-3 pt-2">
                        <label className="flex items-start gap-2 text-xs font-semibold text-neutral-500 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={() => setAgreeTerms(!agreeTerms)}
                            className="mt-0.5 rounded accent-[#004F31]"
                          />
                          <span>I agree to LankaProperty.lk's Terms of Service and Privacy Policy.</span>
                        </label>
                        <label className="flex items-start gap-2 text-xs font-semibold text-neutral-500 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={whatsappInquiries}
                            onChange={() => setWhatsappInquiries(!whatsappInquiries)}
                            className="mt-0.5 rounded accent-[#004F31]"
                          />
                          <span>Send me direct customer inquiries instantly via WhatsApp Alerts.</span>
                        </label>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[#004F31] hover:bg-emerald-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-99 mt-4"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Processing Account credentials...
                        </>
                      ) : (
                        <>
                          {isLoginMode ? 'Login & Link Draft' : 'Create Account & Publish'}
                        </>
                      )}
                    </button>

                  </form>

                  <div className="text-center border-t border-neutral-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsLoginMode(!isLoginMode)}
                      className="text-xs font-black uppercase text-[#004F31] hover:underline"
                    >
                      {isLoginMode ? "Don't have an account? Sign up instead →" : "Already have an account? Login here →"}
                    </button>
                  </div>

                </div>
              )}

              {/* PayHere Gateway Checkout Module */}
              {isPaymentMode && (
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-12 bg-[#004F31] rounded flex items-center justify-center text-[10px] font-black text-white">
                        Pay<span className="text-yellow-400">Here</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">
                        Sandbox Mode
                      </span>
                    </div>
                    <span className="text-xs font-black text-neutral-400">SECURE BILLING GATEWAY</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-neutral-900">Authorize PayHere Checkout</h3>
                    <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
                      You are subscribing to <strong>{selectedPlan === 'premium_pro' ? 'Premium Pro' : 'Elite Pro'}</strong>. 
                      Please enter your simulated payment credentials to publish instantly.
                    </p>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Subtotal Due</span>
                      <p className="text-base font-black text-[#004F31]">
                        Rs. {selectedPlan === 'premium_pro' ? '4,500' : '8,500'} LKR
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Package Expiry</span>
                      <p className="text-xs font-extrabold text-neutral-700">
                        {selectedPlan === 'premium_pro' ? '60 Days' : '90 Days'} Active Duration
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Deshani Kaushalya"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Card Number</label>
                      <input
                        type="text"
                        placeholder="4111 1111 1111 1111"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">CVC / Security CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-yellow-800 font-semibold">
                    <span className="text-lg">⚠️</span>
                    <p>
                      <strong>Sandbox Testing ON:</strong> Auth details can be dummy values. Clicking authorize will simulate a successful transaction of Rs. {selectedPlan === 'premium_pro' ? '4,500' : '8,500'}.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPaymentMode(false)}
                      className="py-4 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-black uppercase tracking-wider rounded-2xl"
                    >
                      Cancel Payment
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPaidPayment}
                      disabled={isAuthorizingPayment}
                      className="py-4 bg-[#004F31] hover:bg-emerald-950 text-white text-xs font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/15"
                    >
                      {isAuthorizingPayment ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Lock size={12} /> Confirm & Pay Securely
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

              {/* Back button */}
              {!isPaymentMode && (
                <div className="flex justify-start">
                  <button
                    onClick={() => setStep(3)}
                    className="py-4 px-6 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-black text-xs uppercase tracking-widest rounded-2xl"
                  >
                    Back to Package
                  </button>
                </div>
              )}

            </motion.div>
          )}

          {/* STEP 5: Successcelebration */}
          {step === 5 && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto space-y-8 text-center relative"
            >
              
              {/* Confetti simulation overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-[99]">
                {[...Array(25)].map((_, i) => {
                  const delay = Math.random() * 2;
                  const duration = 2 + Math.random() * 3;
                  const left = Math.random() * 100;
                  const colors = ['bg-[#004F31]', 'bg-yellow-400', 'bg-emerald-400', 'bg-red-400', 'bg-indigo-400'];
                  const color = colors[Math.floor(Math.random() * colors.length)];
                  
                  return (
                    <motion.div
                      key={i}
                      className={`absolute h-2.5 w-1.5 rounded-sm opacity-80 ${color}`}
                      style={{ left: `${left}%`, top: '-20px' }}
                      animate={{
                        y: ['0vh', '100vh'],
                        x: [0, Math.sin(i) * 30],
                        rotate: [0, 360 * duration],
                      }}
                      transition={{
                        delay,
                        duration,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  );
                })}
              </div>

              {/* Success celebration graphic */}
              <div className="space-y-4 relative z-10">
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                  className="h-20 w-20 bg-emerald-100 text-[#004F31] rounded-full flex items-center justify-center mx-auto border-4 border-[#004F31] shadow-lg"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.4 }}
                    transition={{ delay: 0.3 }}
                    className="font-black text-xl"
                  >
                    ✓
                  </motion.span>
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-neutral-950 font-display">
                    {selectedPlan === 'starter_free' ? 'Your Property is Live! 🎉' : 'Payment Done! Publishing in 24 Hours 🎉'}
                  </h3>
                  <p className="text-xs text-neutral-400 font-semibold max-w-md mx-auto leading-relaxed">
                    {selectedPlan === 'starter_free' 
                      ? 'Congratulations! Your listing has been published under our free starter plan and is accessible right now.' 
                      : 'Thank you! Your transaction cleared successfully. Our editorial review team is formatting your premium features.'}
                  </p>
                </div>
              </div>

              {/* Property summary card */}
              <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm text-left max-w-lg mx-auto flex gap-4">
                <div className="h-20 w-24 rounded-xl overflow-hidden shrink-0 border border-neutral-100">
                  <img
                    src={(createdProperty?.images && createdProperty.images[0]) || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80"}
                    alt="cover"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1 justify-center flex flex-col">
                  <span className="text-[9px] font-black uppercase text-yellow-600 tracking-wider">
                    {selectedPlan === 'starter_free' ? '⭐ Starter Free' : selectedPlan === 'premium_pro' ? '⭐ Premium Pro' : '⭐ Elite Pro'}
                  </span>
                  <h4 className="text-xs font-black text-neutral-900 line-clamp-1">{title || 'Premium Mansion Sri Lanka'}</h4>
                  <p className="text-[10px] text-neutral-400 font-bold">{district} • {category}</p>
                  <div className="flex justify-between items-center pt-1 gap-4">
                    <span className="text-xs font-black text-[#004F31]">Rs. {formatPriceComma(priceLkr) || '0'}</span>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded">
                      🟡 Under Review
                    </span>
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="bg-white rounded-[32px] p-6 border border-neutral-200/60 shadow-sm text-left max-w-lg mx-auto space-y-4">
                <h4 className="text-xs font-black uppercase text-[#004F31] tracking-wider">What happens next:</h4>
                <div className="space-y-3.5 text-xs text-neutral-600 font-bold">
                  <div className="flex gap-3">
                    <span className="h-5 w-5 bg-[#004F31]/10 text-[#004F31] rounded-full flex items-center justify-center text-[10px] shrink-0 font-black">1</span>
                    <p className="mt-0.5">Our moderation team reviews your listing contents (within 24 hours).</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="h-5 w-5 bg-[#004F31]/10 text-[#004F31] rounded-full flex items-center justify-center text-[10px] shrink-0 font-black">2</span>
                    <p className="mt-0.5">Your property listing goes active in organic and smart filters searches.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="h-5 w-5 bg-[#004F31]/10 text-[#004F31] rounded-full flex items-center justify-center text-[10px] shrink-0 font-black">3</span>
                    <p className="mt-0.5">Verified buyers contact your phone and WhatsApp lines directly.</p>
                  </div>
                </div>
              </div>

              {/* Three action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2 z-10 relative">
                
                <button
                  onClick={() => { onNavigate({ type: 'owner_dashboard' }); }}
                  className="py-3 px-4 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  📊 Go Dashboard
                </button>

                <button
                  onClick={() => {
                    if (createdProperty?.id) {
                      onNavigate({ type: 'explore' }); // fallback preview on explore
                    } else {
                      onNavigate({ type: 'explore' });
                    }
                  }}
                  className="py-3 px-4 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  👁️ Preview Ad
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `I just listed my property on LankaProperty.lk!\n🏠 ${title}\n📍 ${district}\n💰 Rs. ${formatPriceComma(priceLkr)}\nView it here: https://lankaproperty.lk`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all text-center shadow-md shadow-green-600/10 flex items-center justify-center gap-1.5"
                >
                  <Share2 size={12} /> Share Ad
                </a>

              </div>

              {/* Redirect timer */}
              <div className="pt-4 text-xs font-semibold text-neutral-400">
                ⏳ Taking you to your dashboard in <strong className="text-[#004F31] font-black">{countdown}s</strong>...
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
};
