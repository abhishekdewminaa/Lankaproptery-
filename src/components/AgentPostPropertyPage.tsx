import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, X, ArrowRight, ArrowLeft, Sparkles, Lock, 
  Camera, Trash2, Info, Eye, ChevronLeft, ChevronRight, 
  Plus, Minus, MapPin, Share2, EyeOff, Loader2, HelpCircle, Laptop, ShieldCheck, Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import { generateDescription } from '../services/geminiService';

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

interface AgentPostPropertyPageProps {
  onNavigate: (view: any) => void;
  onNavigateHome: () => void;
}

// 25 Districts in Sri Lanka
const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Moneragala", "Ratnapura", "Kegalle"
];

const AMENITIES = [
  "Swimming Pool", "Gymnasium", "Fully Air Conditioned", "Hot Water System",
  "24-Hour Security", "Backup Generator System", "Maids Quarters",
  "Roller Shutter Gate", "Elevator System", "Club House", "Cable TV", "Internet"
];

export const AgentPostPropertyPage: React.FC<AgentPostPropertyPageProps> = ({
  onNavigate,
  onNavigateHome
}) => {
  // Current active step: 1 (Details), 2 (Images), 3 (Package), 4 (Account/Payment), 5 (Dashboard)
  const [step, setStep] = useState<number>(1);
  const [isPaymentMode, setIsPaymentMode] = useState<boolean>(false);
  
  // --- STEP 1: Property Details Form State ---
  const [onBehalfOf, setOnBehalfOf] = useState<'My Own Property' | "Client's Property">('My Own Property');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');

  const [title, setTitle] = useState<string>('');
  const [listingType, setListingType] = useState<'For Sale' | 'For Rent' | 'For Lease'>('For Sale');
  const [category, setCategory] = useState<string>('House');
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [floors, setFloors] = useState<number>(2);
  const [landSize, setLandSize] = useState<string>('');
  const [landSizeUnit, setLandSizeUnit] = useState<'Perches' | 'Sqft' | 'Acres'>('Perches');
  const [floorArea, setFloorArea] = useState<string>('');
  const [priceLkr, setPriceLkr] = useState<string>('');
  const [isNegotiable, setIsNegotiable] = useState<boolean>(false);
  const [advanceRequired, setAdvanceRequired] = useState<string>('3 Months');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [district, setDistrict] = useState<string>('Colombo');
  const [city, setCity] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Location Map Coords
  const [lat, setLat] = useState<number>(6.9271);
  const [lng, setLng] = useState<number>(79.8612);
  const [hasPinned, setHasPinned] = useState<boolean>(false);

  // Description & AI Generator
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // --- STEP 2: Photos Form State ---
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoLink, setVideoLink] = useState<string>('');
  const [isVirtualTour, setIsVirtualTour] = useState<boolean>(false);

  // --- STEP 3: Choose Package State ---
  const [selectedPlan, setSelectedPlan] = useState<'starter_free' | 'premium_pro' | 'elite_pro'>('starter_free');

  // --- STEP 4: Create Agent Account & Publish ---
  const [fullName, setFullName] = useState<string>('');
  const [nicNumber, setNicNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Collapsible professional details section
  const [showProfessionalDetails, setShowProfessionalDetails] = useState<boolean>(true);
  const [agencyName, setAgencyName] = useState<string>('');
  const [licenseNo, setLicenseNo] = useState<string>('');
  const [yearsExperience, setYearsExperience] = useState<string>('1-3 years');
  const [specialization, setSpecialization] = useState<string>('Residential');
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [bio, setBio] = useState<string>('');

  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [confirmPro, setConfirmPro] = useState<boolean>(false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdProperty, setCreatedProperty] = useState<any>(null);
  const [createdAgentId, setCreatedAgentId] = useState<string>('');

  // --- STEP 4 (PAID): Payment State ---
  const [cardName, setCardName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvc, setCvc] = useState<string>('');
  const [isAuthorizingPayment, setIsAuthorizingPayment] = useState<boolean>(false);

  // Load state from draft when page loads
  const [showDraftOverlay, setShowDraftOverlay] = useState<boolean>(false);

  useEffect(() => {
    // Synced URL-based routing mock
    const path = window.location.pathname;
    if (path.includes('/agent/post-property/details')) setStep(1);
    if (path.includes('/agent/post-property/images')) setStep(2);
    if (path.includes('/agent/post-property/package')) setStep(3);
    if (path.includes('/agent/post-property/register')) setStep(4);
    if (path.includes('/agent/post-property/payment')) setIsPaymentMode(true);
  }, []);

  // Sync state changes with mock URLs
  const updateUrlForStep = (currentStep: number, inPayment = false) => {
    let url = '/agent/post-property/details';
    if (inPayment) {
      url = `/agent/post-property/payment?plan=${selectedPlan}`;
    } else {
      if (currentStep === 1) url = '/agent/post-property/details';
      if (currentStep === 2) url = '/agent/post-property/images';
      if (currentStep === 3) url = '/agent/post-property/package';
      if (currentStep === 4) url = '/agent/post-property/register';
    }
    window.history.pushState({}, '', url);
  };

  useEffect(() => {
    updateUrlForStep(step, isPaymentMode);
  }, [step, isPaymentMode]);

  // Check for existing draft in localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('lp_agent_listing_draft');
    if (savedDraft) {
      setShowDraftOverlay(true);
    }
  }, []);

  const handleLoadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('lp_agent_listing_draft');
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        setOnBehalfOf(d.onBehalfOf || 'My Own Property');
        setClientName(d.clientName || '');
        setClientPhone(d.clientPhone || '');
        setClientEmail(d.clientEmail || '');
        setTitle(d.title || '');
        setListingType(d.listingType || 'For Sale');
        setCategory(d.category || 'House');
        setBedrooms(d.bedrooms || 3);
        setBathrooms(d.bathrooms || 2);
        setFloors(d.floors || 2);
        setLandSize(d.landSize || '');
        setLandSizeUnit(d.landSizeUnit || 'Perches');
        setFloorArea(d.floorArea || '');
        setPriceLkr(d.priceLkr || '');
        setIsNegotiable(d.isNegotiable || false);
        setAdvanceRequired(d.advanceRequired || '3 Months');
        setDescription(d.description || '');
        setAddress(d.address || '');
        setDistrict(d.district || 'Colombo');
        setCity(d.city || '');
        setSelectedAmenities(d.selectedAmenities || []);
        setLat(d.lat || 6.9271);
        setLng(d.lng || 79.8612);
        setHasPinned(d.hasPinned || false);
        
        // Also load plan if selected
        const savedPlan = localStorage.getItem('lp_agent_plan');
        if (savedPlan) {
          setSelectedPlan(savedPlan as any);
        }

        toast.success("Welcome back! Your property listing draft has been restored.");
      }
      setShowDraftOverlay(false);
    } catch (err) {
      toast.error("Could not load your previous draft.");
      setShowDraftOverlay(false);
    }
  };

  const handleStartFresh = () => {
    localStorage.removeItem('lp_agent_listing_draft');
    localStorage.removeItem('lp_agent_plan');
    
    // Clear state
    setOnBehalfOf('My Own Property');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
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
    setSelectedAmenities([]);
    setLat(6.9271);
    setLng(79.8612);
    setHasPinned(false);
    setImageFiles([]);
    setImageUrls([]);
    setVideoLink('');
    setIsVirtualTour(false);
    setSelectedPlan('starter_free');
    
    toast.success("Starting a fresh professional agent listing draft.");
    setShowDraftOverlay(false);
  };

  // --- STEP 1 ACTIONS: Property Details ---
  const handleSaveDraftStep1 = () => {
    const draftPayload = {
      onBehalfOf,
      clientName,
      clientPhone,
      clientEmail,
      title,
      listingType,
      category,
      bedrooms,
      bathrooms,
      floors,
      landSize,
      landSizeUnit,
      floorArea,
      priceLkr,
      isNegotiable,
      advanceRequired,
      description,
      address,
      district,
      city,
      selectedAmenities,
      lat,
      lng,
      hasPinned
    };
    localStorage.setItem('lp_agent_listing_draft', JSON.stringify(draftPayload));
  };

  const handleAiGenerateText = async () => {
    if (!title.trim()) {
      return toast.error("Please enter a property title first so AI can write a relevant description.");
    }
    
    setIsGeneratingAi(true);
    const professionalPrompt = `Write a professional, formal real estate description for a listing titled: "${title}".
    Located in ${city}, ${district}. Category: ${category}, Type: ${listingType}.
    Featuring ${bedrooms} bedrooms, ${bathrooms} bathrooms, floor area: ${floorArea} sqft, land size: ${landSize} ${landSizeUnit}.
    Make the tone highly professional, precise, authoritative, and formal, suitable for an expert real estate agent.
    Highlight key premium amenities: ${selectedAmenities.join(', ') || 'modern finishings'}.
    Structure it with a elegant introduction, key features list, and clear call-to-action under 160 words. No markdown, just clean text.`;

    try {
      const desc = await generateDescription(professionalPrompt);
      setDescription(desc);
      toast.success("Professional Agent description generated by Gemini AI!");
    } catch (err) {
      toast.error("AI Generation failed. Please try again.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleValidateStep1 = () => {
    if (!title.trim()) return toast.error("Property Title is required");
    if (title.length < 10) return toast.error("Please provide a more descriptive title (at least 10 characters)");
    if (!priceLkr.trim() || isNaN(Number(priceLkr.replace(/,/g, '')))) return toast.error("Valid Price in LKR is required");
    if (!address.trim()) return toast.error("Street Address is required");
    if (!city.trim()) return toast.error("City is required");
    if (!description.trim()) return toast.error("Detailed description is required");

    if (onBehalfOf === "Client's Property") {
      if (!clientName.trim()) return toast.error("Client Name is required for client listing representations");
      if (!clientPhone.trim()) return toast.error("Client Phone is required");
    }

    handleSaveDraftStep1();
    setStep(2);
  };

  // --- STEP 2 ACTIONS: Add Photos ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isUnderSize = file.size <= 10 * 1024 * 1024; // 10MB limit
        if (!isImage) toast.error(`${file.name} is not a valid image format.`);
        if (!isUnderSize) toast.error(`${file.name} exceeds the 10MB size limit.`);
        return isImage && isUnderSize;
      });

      const slotsLeft = 12 - imageFiles.length;
      if (validFiles.length > slotsLeft) {
        toast(`You can only add up to 12 photos. Only the first ${slotsLeft} valid photos were added.`, { icon: '⚠️' });
      }

      const filesToAdd = validFiles.slice(0, slotsLeft);
      const newUrls = filesToAdd.map(file => URL.createObjectURL(file));

      setImageFiles(prev => [...prev, ...filesToAdd]);
      setImageUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleValidateStep2 = () => {
    if (imageFiles.length === 0) {
      return toast.error("Please upload at least 1 photo of the property.");
    }
    setStep(3);
  };

  // --- STEP 3 ACTIONS: Choose Package (OPTIONAL) ---
  const handleSelectPackage = (planType: 'starter_free' | 'premium_pro' | 'elite_pro') => {
    setSelectedPlan(planType);
    localStorage.setItem('lp_agent_plan', planType);
    setStep(4);
  };

  // --- STEP 4 ACTIONS: Register Agent Account & Publish ---
  const handleRegisterAgentAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) return toast.error("Full Name is required");
    if (!email.trim()) return toast.error("Email Address is required");
    if (!phone.trim()) return toast.error("Phone Number is required");
    if (!password) return toast.error("Password is required");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (!agreeTerms) return toast.error("You must agree to the Terms of Service");
    if (!confirmPro) return toast.error("You must confirm you are a real estate professional");

    setIsSubmitting(true);
    try {
      let userId: any = crypto.randomUUID();
      let activeEmail = email.trim();
      let activePhone = phone.trim();
      let activeName = fullName.trim();

      // Create auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: activeEmail,
        password,
        options: {
          data: {
            full_name: activeName,
            role: 'agent',
          }
        }
      });

      if (authError) {
        console.warn("Auth signup error, using UUID fallback for demo testing:", authError);
      } else if (authData?.user) {
        userId = authData.user.id;
      }

      setCreatedAgentId(userId);

      // Write users table details
      const price = selectedPlan === 'starter_free' ? 0 : (selectedPlan === 'premium_pro' ? 4500 : 8500);
      const planName = selectedPlan === 'starter_free' ? 'Starter Free' : (selectedPlan === 'premium_pro' ? 'Premium Pro' : 'Elite Pro');

      const { error: userInsertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          role: 'agent',
          full_name: activeName,
          email: activeEmail,
          phone: activePhone,
          whatsapp: whatsapp.trim() || activePhone,
          created_at: new Date().toISOString(),
          package_type: selectedPlan,
          selected_package: planName,
          package_paid: false,
          package_price: price
        }]);

      if (userInsertError) console.warn("Users insert error:", userInsertError);

      // Write agents table details
      const { error: agentInsertError } = await supabase
        .from('agents')
        .insert([{
          id: userId,
          user_id: userId,
          email: activeEmail,
          name: activeName,
          phone: activePhone,
          agency_name: agencyName || null,
          license_no: licenseNo || null,
          years_experience: yearsExperience,
          specialization,
          service_areas: serviceAreas,
          bio: bio || null,
          is_verified: false,
          created_at: new Date().toISOString()
        }]);

      if (agentInsertError) console.warn("Agents insert error:", agentInsertError);

      // Save agent login session info to localStorage
      localStorage.setItem('agent_logged_in', 'true');
      localStorage.setItem('agent_user_id', userId);
      localStorage.setItem('agent_name', activeName);
      localStorage.setItem('agent_email', activeEmail);
      localStorage.setItem('agent_phone', activePhone);
      localStorage.setItem('agent_agency', agencyName || 'Independent Agent');
      localStorage.setItem('agent_is_verified', 'false');
      localStorage.setItem('user_role', 'agent');
      localStorage.setItem('agent_package_type', selectedPlan);
      localStorage.setItem('agent_show_welcome_banner', 'true');

      const draftDataStr = localStorage.getItem('lp_agent_listing_draft');
      if (!draftDataStr) {
        throw new Error("Could not find draft property data.");
      }
      const draft = JSON.parse(draftDataStr);

      if (selectedPlan === 'starter_free') {
        // Starter Free plan gets agent_packages instantly and gets published!
        const durationDays = 90;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        // Try inserting into agent_packages or fallback
        const { error: packErr } = await supabase
          .from('agent_packages')
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

        if (packErr) console.warn("Agent package insert error:", packErr);

        await publishAgentListing(userId, activeEmail, activePhone, draft);
      } else {
        // Show payment checkout page for paid plans
        setIsPaymentMode(true);
      }

    } catch (err: any) {
      toast.error(err.message || "Authentication & Registration error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- STEP 4 (PAID): PayHere Payment Completion ---
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

      const agentId = localStorage.getItem('agent_user_id') || createdAgentId;
      const agentEmail = localStorage.getItem('agent_email') || email;
      const agentPhone = localStorage.getItem('agent_phone') || phone;

      const draftDataStr = localStorage.getItem('lp_agent_listing_draft');
      if (!draftDataStr) throw new Error("Property listing details not found.");
      const draft = JSON.parse(draftDataStr);

      const price = selectedPlan === 'premium_pro' ? 4500 : 8500;
      const durationDays = selectedPlan === 'premium_pro' ? 60 : 90;
      const orderId = 'payhere_ref_' + Date.now();
      const nowString = new Date().toISOString();
      const expires = new Date();
      expires.setDate(expires.getDate() + durationDays);
      const expiresString = expires.toISOString();

      // 1. Insert into agent_packages
      const { error: packErr } = await supabase
        .from('agent_packages')
        .insert([{
          user_id: agentId,
          package_type: selectedPlan,
          price_lkr: price,
          duration_days: durationDays,
          payment_status: 'paid',
          payment_reference: orderId,
          is_active: true,
          started_at: nowString,
          expires_at: expiresString
        }]);

      if (packErr) console.warn("Agent package insert error:", packErr);

      // 2. Update users table package details
      await supabase
        .from('users')
        .update({
          package_paid: true,
          package_reference: orderId,
          package_expiry: expiresString
        })
        .eq('id', agentId);

      // 3. Insert into payments table
      await supabase
        .from('payments')
        .insert([{
          user_id: agentId,
          amount_lkr: price,
          payment_method: 'credit_card',
          payment_status: 'paid',
          payment_reference: orderId,
          package_tier: selectedPlan,
          created_at: nowString
        }]);

      await publishAgentListing(agentId, agentEmail, agentPhone, draft);

    } catch (err: any) {
      toast.error(err.message || "Failed to process payment gateway transaction.", { id: toastId });
    } finally {
      setIsAuthorizingPayment(false);
    }
  };

  const handleSkipOrCancelPayment = async () => {
    setIsAuthorizingPayment(true);
    const toastId = toast.loading("Saving your listing draft under the Free Starter Plan instead...");

    try {
      const agentId = localStorage.getItem('agent_user_id') || createdAgentId;
      const agentEmail = localStorage.getItem('agent_email') || email;
      const agentPhone = localStorage.getItem('agent_phone') || phone;

      const draftDataStr = localStorage.getItem('lp_agent_listing_draft');
      if (!draftDataStr) throw new Error("Property listing details not found.");
      const draft = JSON.parse(draftDataStr);

      // Reset plan to starter_free
      setSelectedPlan('starter_free');
      localStorage.setItem('agent_package_type', 'starter_free');

      const durationDays = 90;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      await supabase
        .from('agent_packages')
        .insert([{
          user_id: agentId,
          package_type: 'starter_free',
          price_lkr: 0,
          duration_days: durationDays,
          payment_status: 'free',
          payment_reference: 'free_fallback_' + Date.now(),
          is_active: true,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        }]);

      await publishAgentListing(agentId, agentEmail, agentPhone, draft);
      toast.success("Saved! Your listing is registered under the Free Plan. You can always upgrade later.", { id: toastId });

    } catch (err: any) {
      toast.error(err.message || "Failed to convert draft.", { id: toastId });
    } finally {
      setIsAuthorizingPayment(false);
    }
  };

  const publishAgentListing = async (userId: string, userEmail: string, userPhone: string, draft: any) => {
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
        published_by: 'agent',
        owner_email: userEmail,
        agentEmail: userEmail,
        agent_email: userEmail,
        agent_id: userId,
        images: uploadedUrls,
        video_tour_url: videoLink || null,
        has_virtual_tour: selectedPlan === 'elite_pro' ? isVirtualTour : false,
        listing_behalf: onBehalfOf,
        client_name: onBehalfOf === "Client's Property" ? clientName : null,
        client_phone: onBehalfOf === "Client's Property" ? clientPhone : null,
        client_email: onBehalfOf === "Client's Property" ? clientEmail : null,
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

      toast.success("Your property has been indexed and submitted for admin review!", { id: toastId });

      // Clean up localStorage
      localStorage.removeItem('lp_agent_listing_draft');
      localStorage.removeItem('lp_agent_plan');

      // Go directly to Agent Dashboard Step 5
      setIsPaymentMode(false);
      onNavigate({ type: 'agent_dashboard' });

    } catch (err: any) {
      console.error("Publishing error:", err);
      toast.error(err.message || "Failed to publish listing.", { id: toastId });
    }
  };

  const formatPriceComma = (val: string) => {
    const raw = val.replace(/[^0-9.]/g, '');
    if (!raw) return '';
    const num = parseFloat(raw);
    return num.toLocaleString();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const clean = val.replace(/,/g, '');
    if (!isNaN(Number(clean)) || clean === '') {
      setPriceLkr(clean);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };

  const toggleServiceArea = (dist: string) => {
    setServiceAreas(prev => 
      prev.includes(dist) 
        ? prev.filter(d => d !== dist) 
        : [...prev, dist]
    );
  };

  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'bg-neutral-200', pct: 0 };
    if (password.length < 5) return { label: 'Too Weak', color: 'bg-red-500', pct: 25 };
    if (password.length < 8) return { label: 'Weak', color: 'bg-orange-500', pct: 50 };
    let hasLetters = /[a-zA-Z]/.test(password);
    let hasNumbers = /[0-9]/.test(password);
    let hasSpecials = /[^A-Za-z0-9]/.test(password);
    if (hasLetters && hasNumbers && hasSpecials) return { label: 'Very Strong', color: 'bg-emerald-500', pct: 100 };
    if (hasLetters && hasNumbers) return { label: 'Good', color: 'bg-blue-500', pct: 75 };
    return { label: 'Moderate', color: 'bg-amber-500', pct: 60 };
  };

  const strength = getPasswordStrength();

  return (
    <div className="bg-[#FAFBFD] min-h-screen py-10">
      
      {/* Draft Restore Overlay Banner */}
      <AnimatePresence>
        {showDraftOverlay && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-neutral-100 text-center"
            >
              <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-5">
                🏢
              </div>
              <h3 className="text-xl font-black text-neutral-900 font-display">Unfinished Agent Listing Draft</h3>
              <p className="text-xs text-neutral-500 mt-2 font-medium leading-relaxed">
                We found a previously unsaved property draft on your device. Would you like to restore it or start fresh?
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={handleStartFresh}
                  className="py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Start Fresh
                </button>
                <button
                  onClick={handleLoadDraft}
                  className="py-3 px-4 bg-[#1e293b] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-slate-900/20 cursor-pointer"
                >
                  Continue Draft →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* =========================================
            HEADER PROGRESS BAR
            ========================================= */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-xs border border-neutral-200/60 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            {/* Steps Container */}
            <div className="flex items-center justify-between max-w-3xl mx-auto relative mb-4">
              
              {/* Navy Blue Progress Fill Line */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-neutral-200 -z-10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-slate-800" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${((step - 1) / 4) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {[
                { label: 'Details', icon: '🏠' },
                { label: 'Images', icon: '📸' },
                { label: 'Package', icon: '📦' },
                { label: 'Agent Account', icon: '👤' },
                { label: 'Dashboard', icon: '✅' },
              ].map((s, idx) => {
                const stepNum = idx + 1;
                const isCurrent = step === stepNum && !isPaymentMode;
                const isCompleted = step > stepNum;
                
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <motion.div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-black transition-all border shadow-sm select-none ${
                        isCompleted 
                          ? 'bg-slate-800 border-slate-800 text-white' 
                          : isCurrent 
                            ? 'bg-slate-800 border-slate-800 text-white ring-4 ring-slate-800/25' 
                            : 'bg-white border-neutral-200 text-neutral-400'
                      }`}
                      animate={isCurrent ? { scale: 1.1 } : { scale: 1 }}
                    >
                      {isCompleted ? '✓' : s.icon}
                    </motion.div>
                    <span className={`text-[9px] sm:text-xs uppercase tracking-wider mt-2 transition-all font-black select-none text-center max-w-[80px] ${
                      isCurrent ? 'text-slate-800' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}

            </div>

            {/* Sub-progress status */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-neutral-100 pt-4 mt-2">
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                {isPaymentMode ? "Secure Payment Checkout" : `Step ${step} of 5`}
              </span>
              <span className="text-xs font-semibold text-neutral-400 mt-2 sm:mt-0 flex items-center gap-1">
                ⏱️ Professional agent account setup takes about 5 minutes
              </span>
            </div>
          </div>
        </div>

        {/* Badge header */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white font-black text-[10px] tracking-widest uppercase px-4 py-2 rounded-full shadow-xs">
            🏢 AGENT LISTING — Professional Portal
          </span>
        </div>

        {/* =========================================
            ACTIVE STEP VIEWS CONTAINER
            ========================================= */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Property Details */}
          {step === 1 && !isPaymentMode && (
            <motion.div
              key="step-details"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-neutral-200/60 space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">1. Property Representation & Details</h2>
                  <p className="text-xs font-semibold text-neutral-400 mt-1">Provide information about your client or listing delegation details.</p>
                </div>

                {/* Representation detail cards */}
                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 space-y-4">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">Listing delegation representation:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${onBehalfOf === 'My Own Property' ? 'bg-white border-slate-800 shadow-xs' : 'bg-transparent border-neutral-200 hover:bg-white/50'}`}>
                      <input 
                        type="radio" 
                        name="onBehalf" 
                        checked={onBehalfOf === 'My Own Property'} 
                        onChange={() => setOnBehalfOf('My Own Property')}
                        className="accent-slate-800"
                      />
                      <div className="text-left">
                        <span className="text-xs font-extrabold text-neutral-800 block">My Own Property</span>
                        <span className="text-[10px] font-bold text-neutral-400">Direct mandate as listing broker/owner</span>
                      </div>
                    </label>
                    <label className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${onBehalfOf === "Client's Property" ? 'bg-white border-slate-800 shadow-xs' : 'bg-transparent border-neutral-200 hover:bg-white/50'}`}>
                      <input 
                        type="radio" 
                        name="onBehalf" 
                        checked={onBehalfOf === "Client's Property"} 
                        onChange={() => setOnBehalfOf("Client's Property")}
                        className="accent-slate-800"
                      />
                      <div className="text-left">
                        <span className="text-xs font-extrabold text-neutral-800 block">Client's Property</span>
                        <span className="text-[10px] font-bold text-neutral-400">Listing on behalf of a separate landlord client</span>
                      </div>
                    </label>
                  </div>

                  {/* Client private details inputs */}
                  {onBehalfOf === "Client's Property" && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 overflow-hidden"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Client Name *</label>
                        <input 
                          type="text" 
                          placeholder="Client/Owner Name"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Client Phone Number *</label>
                        <input 
                          type="tel" 
                          placeholder="e.g. +94771234567"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Client Email Address (Optional)</label>
                        <input 
                          type="email" 
                          placeholder="client@gmail.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                        />
                      </div>
                      <p className="sm:col-span-3 text-[10px] font-bold text-slate-500 italic flex items-center gap-1.5">
                        <span>🔒 Private info: Client details are encrypted and only visible to you in your dashboard.</span>
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Core Property Specifics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Title */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Property Advertisement Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Luxury 4BR Architect Designed Modern Villa in Colombo 7"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                    />
                    <p className="text-[10px] font-bold text-neutral-400">At least 10 words works best. Keep it informative.</p>
                  </div>

                  {/* Transaction Mode */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Ad Type *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['For Sale', 'For Rent', 'For Lease'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setListingType(type as any)}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider border cursor-pointer transition-all ${listingType === type ? 'bg-slate-800 text-white border-slate-800' : 'bg-transparent border-neutral-200 hover:bg-neutral-50'}`}
                        >
                          {type.replace('For ', '')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Property Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                    >
                      {["House", "Apartment", "Land", "Commercial", "Villa", "Building"].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Price (LKR) *</label>
                    <div className="relative">
                      <span className="absolute left-4 inset-y-0 flex items-center text-xs font-black text-slate-400">LKR</span>
                      <input 
                        type="text" 
                        placeholder="e.g. 45,000,000"
                        value={formatPriceComma(priceLkr)}
                        onChange={handlePriceChange}
                        className="w-full pl-12 pr-20 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                      />
                      <label className="absolute right-4 inset-y-0 flex items-center gap-1.5 text-xs">
                        <input 
                          type="checkbox" 
                          checked={isNegotiable} 
                          onChange={(e) => setIsNegotiable(e.target.checked)}
                          className="accent-slate-800"
                        />
                        <span className="text-[10px] font-black uppercase text-slate-600">Negotiable</span>
                      </label>
                    </div>
                  </div>

                  {/* Conditional Rental advance info */}
                  {listingType !== 'For Sale' ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Advance Required *</label>
                      <select
                        value={advanceRequired}
                        onChange={(e) => setAdvanceRequired(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                      >
                        {["None", "1 Month", "2 Months", "3 Months", "6 Months", "1 Year"].map(adv => (
                          <option key={adv} value={adv}>{adv} Advance</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Floors count</label>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button" 
                          onClick={() => setFloors(prev => Math.max(1, prev - 1))}
                          className="h-9 w-9 border border-neutral-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-neutral-50 cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-black w-8 text-center">{floors}</span>
                        <button 
                          type="button" 
                          onClick={() => setFloors(prev => prev + 1)}
                          className="h-9 w-9 border border-neutral-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-neutral-50 cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bedrooms & Bathrooms (Only if not Land) */}
                  {category !== 'Land' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Bedrooms Count</label>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button" 
                            onClick={() => setBedrooms(prev => Math.max(0, prev - 1))}
                            className="h-9 w-9 border border-neutral-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-neutral-50 cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-black w-8 text-center">{bedrooms}</span>
                          <button 
                            type="button" 
                            onClick={() => setBedrooms(prev => prev + 1)}
                            className="h-9 w-9 border border-neutral-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-neutral-50 cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Bathrooms Count</label>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button" 
                            onClick={() => setBathrooms(prev => Math.max(0, prev - 1))}
                            className="h-9 w-9 border border-neutral-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-neutral-50 cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-black w-8 text-center">{bathrooms}</span>
                          <button 
                            type="button" 
                            onClick={() => setBathrooms(prev => prev + 1)}
                            className="h-9 w-9 border border-neutral-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-neutral-50 cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Size specifics */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Land Area Size</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. 15"
                        value={landSize}
                        onChange={(e) => setLandSize(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                      />
                      <select
                        value={landSizeUnit}
                        onChange={(e) => setLandSizeUnit(e.target.value as any)}
                        className="bg-neutral-100 border border-neutral-200 rounded-xl px-2 text-xs font-bold"
                      >
                        <option value="Perches">Perches</option>
                        <option value="Sqft">Sqft</option>
                        <option value="Acres">Acres</option>
                      </select>
                    </div>
                  </div>

                  {category !== 'Land' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Floor Area (sqft)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2,500"
                        value={floorArea}
                        onChange={(e) => setFloorArea(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                      />
                    </div>
                  )}

                </div>

                {/* Description and Gemini Writer */}
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-neutral-900 font-display">Detailed Listing Description</h3>
                      <p className="text-[10px] font-semibold text-neutral-400">Provide an in-depth breakdown of layouts, deeds and key features.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleAiGenerateText}
                      disabled={isGeneratingAi}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                    >
                      {isGeneratingAi ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          AI is drafting...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} className="text-yellow-400" />
                          Generate Description with AI
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Describe the property here..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 bg-neutral-50/50 border border-neutral-200 rounded-[20px] text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800 leading-relaxed"
                  />
                </div>

                {/* Location Map */}
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900 font-display">Property Location Pin</h3>
                    <p className="text-[10px] font-semibold text-neutral-400">Help buyers find the exact geographic placement of the advertisement.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Street Address *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 24/A, Horton Place"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">District *</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                      >
                        {DISTRICTS.map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">City/Town *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Colombo 7"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                      />
                    </div>
                  </div>

                  {/* Leaflet Clickable Map */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1">
                        <MapPin size={12} /> Interactive Locator Map
                      </label>
                      <span className="text-[10px] font-bold text-neutral-400">
                        {hasPinned ? "🟢 Location Pinned" : "📍 Click map to drop pin"}
                      </span>
                    </div>

                    <div className="h-64 rounded-2xl overflow-hidden border border-neutral-200 relative z-10 shadow-xs">
                      <MapContainer
                        center={[lat, lng]}
                        zoom={11}
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
                          }}
                        />
                        {hasPinned && <Marker position={[lat, lng]} />}
                      </MapContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1.5">
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">Latitude</span>
                        <span className="text-xs font-extrabold text-slate-800">{lat.toFixed(6)}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">Longitude</span>
                        <span className="text-xs font-extrabold text-slate-800">{lng.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities multi-select */}
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900 font-display">Amenities & Facilities</h3>
                    <p className="text-[10px] font-semibold text-neutral-400">Check features that are available on the property.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AMENITIES.map(amenity => {
                      const selected = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center gap-2 cursor-pointer ${selected ? 'bg-slate-800 text-white border-slate-800 shadow-xs' : 'bg-transparent border-neutral-100 text-neutral-600 hover:bg-neutral-50'}`}
                        >
                          <span className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${selected ? 'border-white bg-white text-slate-800' : 'border-neutral-300'}`}>
                            {selected && "✓"}
                          </span>
                          <span>{amenity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Navigation Action */}
              <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-neutral-200/60 shadow-xs">
                <button
                  onClick={onNavigateHome}
                  className="px-6 py-3 border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-wider text-neutral-500 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleValidateStep1}
                  className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center gap-2 cursor-pointer"
                >
                  Continue to Photos <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Add Photos */}
          {step === 2 && !isPaymentMode && (
            <motion.div
              key="step-images"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-neutral-200/60 space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">2. Upload Property Photos & Media</h2>
                  <p className="text-xs font-semibold text-neutral-400 mt-1">High quality photos increase inquiry rates by up to 300%.</p>
                </div>

                {/* Drag and Drop Box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-[24px] bg-slate-50/50 p-8 sm:p-12 text-center cursor-pointer transition-all space-y-4"
                >
                  <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    onChange={handlePhotoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  
                  <div className="h-16 w-16 bg-white shadow-xs rounded-full flex items-center justify-center mx-auto text-neutral-400 border border-neutral-100">
                    <Camera size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-neutral-800">Drag & Drop Property Images Here</h4>
                    <p className="text-xs text-neutral-400 mt-1 font-semibold">Or click to explore folders on your device</p>
                  </div>
                  <div className="flex justify-center gap-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <span>JPEG, PNG formats</span>
                    <span>•</span>
                    <span>Up to 12 Photos</span>
                    <span>•</span>
                    <span>Max 10MB per file</span>
                  </div>
                </div>

                {/* Thumbnails grid */}
                {imageUrls.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Uploaded Photos ({imageUrls.length} / 12)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-neutral-100 relative group shadow-xs">
                          <img src={url} className="h-full w-full object-cover" alt="" />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs shadow-md transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIDEO TOUR LINK input */}
                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 space-y-4 pt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">📹</span>
                    <h4 className="text-sm font-black text-slate-800">Add Video Tour Link (Optional)</h4>
                  </div>
                  <input 
                    type="url"
                    placeholder="https://youtube.com/watch?v=... or Google Drive URL"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                  />
                  <p className="text-[10px] font-bold text-slate-500">
                    💡 Video tours get 5x more inquiries. Add high-quality YouTube walk-throughs or shared Google Drive links.
                  </p>
                </div>

                {/* VIRTUAL TOUR 360 CHECKBOX */}
                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                      <span>🌐 360° Virtual Tour (Elite Pro Feature)</span>
                    </h4>
                    <p className="text-[10px] font-bold text-neutral-500 mt-1">
                      Allow buyers to explore the property interactively. This metadata is only loaded on active Elite packages.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedPlan !== 'elite_pro' && (
                      <span className="text-[9px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                        Requires Elite Package
                      </span>
                    )}
                    <input 
                      type="checkbox"
                      disabled={selectedPlan !== 'elite_pro'}
                      checked={selectedPlan === 'elite_pro' ? isVirtualTour : false}
                      onChange={(e) => setIsVirtualTour(e.target.checked)}
                      className="h-5 w-5 accent-slate-800 disabled:opacity-50"
                    />
                  </div>
                </div>

              </div>

              {/* Navigation Actions */}
              <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-neutral-200/60 shadow-xs">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-wider text-neutral-500 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back to Details
                </button>
                <button
                  onClick={handleValidateStep2}
                  className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center gap-2 cursor-pointer"
                >
                  Continue to Package <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Choose Package (OPTIONAL FOR AGENTS) */}
          {step === 3 && !isPaymentMode && (
            <motion.div
              key="step-package"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-neutral-200/60 space-y-8">
                <div className="text-center max-w-xl mx-auto">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">Boost Your Listing's Visibility</h2>
                  <p className="text-xs font-semibold text-neutral-400 mt-1">
                    Choose a plan or skip — you can always upgrade from your Agent Dashboard anytime later.
                  </p>
                </div>

                {/* SKIP FOR NOW BANNER AT THE TOP */}
                <div className="p-6 rounded-2xl bg-[#eff6ff] border-2 border-dashed border-[#2563eb] text-center space-y-3.5">
                  <div className="flex items-center justify-center gap-2 text-[#2563eb]">
                    <span className="text-lg">🚀</span>
                    <h3 className="text-sm font-black uppercase tracking-wider">In a hurry? No problem!</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
                    You can list your property now for **FREE** and upgrade your subscription tier anytime later from inside your Agent Dashboard dashboard.
                  </p>
                  <div className="pt-1.5">
                    <button
                      onClick={() => handleSelectPackage('starter_free')}
                      className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-xs transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      Skip & Go to Dashboard →
                    </button>
                    <span className="text-[10px] font-bold text-neutral-400 block mt-2">(Your listing will be published free instantly)</span>
                  </div>
                </div>

                {/* THE 3 PACKAGE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* STARTER FREE CARD */}
                  <div className="border border-neutral-200 rounded-[24px] p-6 flex flex-col justify-between h-full hover:border-slate-300 transition-all bg-white relative">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="inline-block bg-slate-100 text-slate-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Standard Entry
                        </span>
                        <h4 className="text-base font-black text-slate-800 font-display">🏠 STARTER FREE</h4>
                        <div className="text-xl font-black text-slate-800">Rs. 0 <span className="text-[10px] font-bold text-neutral-400">/ Per Listing</span></div>
                      </div>
                      
                      <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-xs font-semibold text-slate-600">
                        <p className="flex items-center gap-2">
                          <span className="text-green-500 font-bold">✓</span> Standard Listing
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-green-500 font-bold">✓</span> Basic Search Placement
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-green-500 font-bold">✓</span> Email Support
                        </p>
                        <p className="flex items-center gap-2 text-neutral-400 line-through">
                          <span>✗</span> Featured Position
                        </p>
                        <p className="flex items-center gap-2 text-neutral-400 line-through">
                          <span>✗</span> WhatsApp Lead Alerts
                        </p>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => handleSelectPackage('starter_free')}
                        className="w-full py-2.5 border border-slate-800 text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        List for Free
                      </button>
                    </div>
                  </div>

                  {/* PREMIUM PRO CARD (HIGHLIGHTED) */}
                  <div className="border-2 border-emerald-500 rounded-[24px] p-6 flex flex-col justify-between h-full shadow-md bg-white relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                      ⭐ MOST POPULAR
                    </div>
                    
                    <div className="space-y-4 pt-1">
                      <div className="space-y-1">
                        <span className="inline-block bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Premium Syndication
                        </span>
                        <h4 className="text-base font-black text-emerald-800 font-display">PREMIUM PRO</h4>
                        <div className="text-xl font-black text-slate-800">Rs. 4,500 <span className="text-[10px] font-bold text-neutral-400">/ 2 Months</span></div>
                      </div>
                      
                      <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-xs font-semibold text-slate-600">
                        <p className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> 60 Days Featured
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Top 10 Placement
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Multi-Site Syndication
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> WhatsApp Lead Alerts
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Priority Support
                        </p>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => handleSelectPackage('premium_pro')}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                      >
                        Select Premium Pro
                      </button>
                    </div>
                  </div>

                  {/* ELITE PRO CARD */}
                  <div className="border border-neutral-200 rounded-[24px] p-6 flex flex-col justify-between h-full hover:border-slate-300 transition-all bg-white relative">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="inline-block bg-blue-50 text-blue-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Enterprise Tier
                        </span>
                        <h4 className="text-base font-black text-blue-800 font-display">👑 ELITE PRO</h4>
                        <div className="text-xl font-black text-slate-800">Rs. 8,500 <span className="text-[10px] font-bold text-neutral-400">/ 3 Months</span></div>
                      </div>
                      
                      <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-xs font-semibold text-slate-600">
                        <p className="flex items-center gap-2">
                          <span className="text-blue-500 font-bold">✓</span> 90 Days Premium
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-blue-500 font-bold">✓</span> Top-Shelf Branding
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-blue-500 font-bold">✓</span> 360° Virtual Tour
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-blue-500 font-bold">✓</span> Verified Agent Badge
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-blue-500 font-bold">✓</span> Homepage Slider
                        </p>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => handleSelectPackage('elite_pro')}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Select Elite Pro
                      </button>
                    </div>
                  </div>

                </div>

                <div className="text-center pt-2">
                  <p className="text-xs font-bold text-slate-500">
                    💡 Not sure? Start free and upgrade anytime. Most agents upgrade after their first buyer inquiry.
                  </p>
                </div>

              </div>

              {/* Navigation Action */}
              <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-neutral-200/60 shadow-xs">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-wider text-neutral-500 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back to Photos
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Create Agent Account */}
          {step === 4 && !isPaymentMode && (
            <motion.div
              key="step-register"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Draft Reminder Banner (navy blue) */}
              <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">🏢 Your Listing Draft is Saved</span>
                  <h3 className="text-sm font-extrabold">{title || "Untitled Property Description"}</h3>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-300 font-semibold pt-1">
                    <span>{district}</span>
                    <span>•</span>
                    <span>{category}</span>
                    <span>•</span>
                    <span>LKR {parseFloat(priceLkr).toLocaleString() || "0"}</span>
                  </div>
                </div>
                <span className="inline-block bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0">
                  Plan: {selectedPlan === 'starter_free' ? "Starter Free" : selectedPlan === 'premium_pro' ? "⭐ Premium Pro" : "👑 Elite Pro"}
                </span>
              </div>

              {/* Agent Registration Form */}
              <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-neutral-200/60">
                <form onSubmit={handleRegisterAgentAndPublish} className="space-y-8">
                  
                  {/* Heading */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">Create Your Agent Account</h2>
                    <p className="text-xs font-semibold text-neutral-400 mt-1">Your property draft is saved. Create your professional agent profile to publish and start receiving lead inquiries.</p>
                  </div>

                  {/* GROUP 1 - Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                      <span>👤</span> GROUP 1 — PERSONAL INFORMATION
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Full Name *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Broker/Agent Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                        />
                      </div>

                      {/* NIC */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">NIC Number (National Identity - Optional)</label>
                        <input 
                          type="text"
                          placeholder="e.g. 199012345678"
                          value={nicNumber}
                          onChange={(e) => setNicNumber(e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Email Address *</label>
                        <input 
                          type="email"
                          required
                          placeholder="agent@agency.lk"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Phone Number *</label>
                        <input 
                          type="tel"
                          required
                          placeholder="+94771234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                        />
                      </div>

                      {/* WhatsApp */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">WhatsApp Number (Optional)</label>
                        <input 
                          type="tel"
                          placeholder="+94771234567"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5 relative">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Password *</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 inset-y-0 flex items-center text-neutral-400 hover:text-neutral-600"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1.5 relative">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Confirm Password *</label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 inset-y-0 flex items-center text-neutral-400 hover:text-neutral-600"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Password strength bar */}
                    {password && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-neutral-400">Security Rating</span>
                          <span className={strength.pct > 50 ? "text-emerald-500" : "text-amber-500"}>{strength.label}</span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.pct}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GROUP 2 - Collapsible Professional Info */}
                  <div className="space-y-4 pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setShowProfessionalDetails(!showProfessionalDetails)}
                      className="w-full flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400 pb-2 border-b border-neutral-100 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">💼 GROUP 2 — PROFESSIONAL DETAILS (OPTIONAL)</span>
                      <span>{showProfessionalDetails ? "Collapse ▴" : "Expand ▾"}</span>
                    </button>

                    <AnimatePresence>
                      {showProfessionalDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-4 overflow-hidden pt-2"
                        >
                          <p className="text-[10px] font-bold text-neutral-400">This can be completed or modified inside your agent profile dashboard later.</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Agency / Company Name</label>
                              <input 
                                type="text"
                                placeholder="e.g. Lanka Realty, Prime Estates"
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Real Estate License No.</label>
                              <input 
                                type="text"
                                placeholder="e.g. RE-2026-908"
                                value={licenseNo}
                                onChange={(e) => setLicenseNo(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Years of Experience</label>
                              <select
                                value={yearsExperience}
                                onChange={(e) => setYearsExperience(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                              >
                                {["Less than 1", "1-3 years", "3-5 years", "5-10 years", "10+ years"].map(y => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Primary Specialization</label>
                              <select
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                              >
                                {["Residential", "Commercial", "Land", "Luxury", "Rentals", "Industrial"].map(spec => (
                                  <option key={spec} value={spec}>{spec}</option>
                                ))}
                              </select>
                            </div>

                          </div>

                          {/* Service Districts List */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Service Districts (Select Areas of Operation)</label>
                            <div className="h-32 overflow-y-auto p-4 border border-neutral-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/40">
                              {DISTRICTS.map(dist => {
                                const active = serviceAreas.includes(dist);
                                return (
                                  <label key={dist} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                                    <input 
                                      type="checkbox"
                                      checked={active}
                                      onChange={() => toggleServiceArea(dist)}
                                      className="accent-slate-800 rounded-xs"
                                    />
                                    <span>{dist}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Short Bio */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Short Professional Bio (max 300 characters)</label>
                            <textarea
                              rows={3}
                              maxLength={300}
                              placeholder="Write a brief professional summary about your real estate expertise..."
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              className="w-full p-4 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                            />
                            <div className="text-right text-[10px] font-bold text-neutral-400">
                              {bio.length} / 300 characters
                            </div>
                          </div>

                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Agreement checkboxes */}
                  <div className="space-y-3 pt-4 border-t border-neutral-100 text-xs font-semibold text-neutral-600">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        required
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="accent-slate-800 mt-0.5"
                      />
                      <span>I agree to LankaProperty.lk's Terms of Service and Professional Code of Conduct.*</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        required
                        checked={confirmPro}
                        onChange={(e) => setConfirmPro(e.target.checked)}
                        className="accent-slate-800 mt-0.5"
                      />
                      <span>I confirm that I am a real estate professional or actively work under a licensed brokerage.*</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={notifyWhatsapp}
                        onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                        className="accent-slate-800 mt-0.5"
                      />
                      <span>Notify me of new buyer lead inquiries via WhatsApp instantly (Recommended).</span>
                    </label>
                  </div>

                  {/* LOGIN FALLBACK */}
                  <div className="text-center pt-2">
                    <p className="text-xs font-bold text-neutral-500">
                      Already have an agent account?{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate({ type: 'agent_login' })}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-black"
                      >
                        Login here →
                      </button>
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Processing Account Registration...
                        </>
                      ) : (
                        <>
                          🏢 Create Agent Account & Publish →
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>

              {/* Navigation Actions */}
              <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-neutral-200/60 shadow-xs">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-wider text-neutral-500 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back to Package
                </button>
              </div>

            </motion.div>
          )}

          {/* PAYMENT STEP (For paid plans after account creation) */}
          {isPaymentMode && (
            <motion.div
              key="step-payment"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              
              {/* Left Column - Order Summary */}
              <div className="md:col-span-1 bg-white rounded-[32px] p-6 border border-neutral-200/60 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-800 font-display uppercase tracking-wider">📦 Subscription Summary</h3>
                  <p className="text-[10px] font-semibold text-neutral-400 mt-0.5">LankaProperty.lk Premium Network invoice</p>
                </div>

                <div className="space-y-4 border-t border-b border-neutral-100 py-4 font-semibold text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Plan Selected:</span>
                    <span className="font-black text-slate-800 uppercase">
                      {selectedPlan === 'premium_pro' ? "⭐ Premium Pro" : "👑 Elite Pro"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Duration:</span>
                    <span>{selectedPlan === 'premium_pro' ? "60 Days (2 Months)" : "90 Days (3 Months)"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Benefits Included:</span>
                    <span className="text-right text-[10px] max-w-[150px]">
                      {selectedPlan === 'premium_pro' 
                        ? "Top 10 searches, WhatsApp lead triggers, 60 days active syndication" 
                        : "Homepage feature banner, verified badge overlay, 360 degree virtual tours support"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-100 pt-3 text-sm font-black text-slate-800">
                    <span>Total Price:</span>
                    <span>Rs. {selectedPlan === 'premium_pro' ? '4,500' : '8,500'}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-2.5 items-start">
                  <span className="text-base mt-0.5">📋</span>
                  <div className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    <strong>Listing Status:</strong> After successful checkout payment, your property advertisement details will be indexed, verified and published to search catalogs within 24 hours.
                  </div>
                </div>
              </div>

              {/* Right Column - PayHere Form */}
              <div className="md:col-span-2 bg-white rounded-[32px] p-6 sm:p-10 border border-neutral-200/60 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-800 font-display uppercase tracking-wider">🔒 Secure PayHere Payment Gateway</h3>
                    <p className="text-[10px] font-semibold text-neutral-400 mt-0.5">Fully certified LKR transaction</p>
                  </div>
                  <span className="h-6 w-16 bg-neutral-100 rounded-md border flex items-center justify-center text-[10px] font-black tracking-tighter text-neutral-400">
                    PayHere
                  </span>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3 items-start">
                  <span className="text-lg">🧪</span>
                  <div className="text-xs text-blue-800 font-semibold leading-relaxed">
                    <strong>Sandbox Testing Environment:</strong> Auth details can be dummy values. Clicking authorize will simulate a successful transaction of **Rs. {selectedPlan === 'premium_pro' ? '4,500' : '8,500'}**.
                  </div>
                </div>

                {/* Card input forms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Cardholder Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="As printed on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Card Number *</label>
                    <input 
                      type="text" 
                      placeholder="4111 •••• •••• 1111"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Expiry Date *</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Security Code (CVC) *</label>
                    <input 
                      type="password" 
                      placeholder="•••"
                      maxLength={3}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                    />
                  </div>

                </div>

                {/* Gateway actions */}
                <div className="space-y-3.5 pt-4">
                  <button
                    onClick={handleConfirmPaidPayment}
                    disabled={isAuthorizingPayment}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isAuthorizingPayment ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Authorizing Gateway Funds...
                      </>
                    ) : (
                      <>
                        🔒 Pay Rs. {selectedPlan === 'premium_pro' ? '4,500' : '8,500'} & Activate Plan →
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSkipOrCancelPayment}
                    disabled={isAuthorizingPayment}
                    className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer text-center"
                  >
                    List under standard Free Plan instead
                  </button>
                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
};
