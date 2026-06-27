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

// Standard Amenities Pool
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

  // Step 1 Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // --- STEP 2: Images State ---
  const [images, setImages] = useState<Array<{ name: string; url: string; file?: File }>>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      }

      const savedPlan = localStorage.getItem('lp_selected_plan');
      if (savedPlan) {
        setSelectedPlan(savedPlan);
      }

      const savedImages = localStorage.getItem('lp_listing_images');
      if (savedImages) {
        const names = JSON.parse(savedImages);
        // Pre-populate previews using standard placeholder or previous filenames
        const previews = names.map((name: string) => ({
          name,
          url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80"
        }));
        setImages(previews);
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
    setImages([]);
    setImageFiles([]);
    setSelectedPlan('starter_free');
    
    setShowDraftOverlay(false);
    toast.success("Draft cleared. Let's start a fresh listing!");
  };

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
    const prompt = `Write a compelling, professional property listing description for a ${category} ${listingType === 'For Rent' ? 'for Rent' : 'for Sale'} located at "${address || city || district}", Sri Lanka. 
    Title: "${title}". 
    Price: Rs. ${priceLkr} LKR${isNegotiable ? ' (Negotiable)' : ''}.
    ${bedrooms ? `Bedrooms: ${bedrooms}.` : ''} 
    ${bathrooms ? `Bathrooms: ${bathrooms}.` : ''} 
    ${floors ? `Floors: ${floors}.` : ''} 
    ${landSize ? `Land Size: ${landSize} ${landSizeUnit}.` : ''} 
    ${floorArea ? `Floor Area: ${floorArea} sqft.` : ''} 
    Included Amenities: ${selectedAmenities.join(', ')}.
    Keep it engaging, highlight key selling points, and structure it with a brief intro, key features, and a call-to-action under 150 words. Do not use markdown tags, just plain text.`;
    
    try {
      const desc = await generateDescription(prompt);
      setDescription(desc);
      toast.success("Professional description generated by Gemini AI!");
    } catch (error) {
      console.error(error);
      toast.error("AI Generation failed. Please try again.");
    } finally {
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
        lat, lng, hasPinned, selectedAmenities
      };
      localStorage.setItem('lp_listing_draft', JSON.stringify(draftData));
      setStep(2);
    } else {
      toast.error("Please fill in all required fields marked in red.");
    }
  };

  // --- STEP 2 ACTIONS: Images Adding ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) toast.error(`${file.name} is not a valid JPG, PNG, or WEBP image.`);
      if (!isValidSize) toast.error(`${file.name} exceeds the 5MB size limit.`);
      
      return isValidType && isValidSize;
    });

    const slotsLeft = 12 - images.length;
    if (validFiles.length > slotsLeft) {
      toast(`You can only add up to 12 photos. Only the first ${slotsLeft} valid photos were added.`, { icon: '⚠️' });
    }

    const filesToAdd = validFiles.slice(0, slotsLeft);
    const newPreviews = filesToAdd.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file
    }));

    const updatedImages = [...images, ...newPreviews];
    const updatedFiles = [...imageFiles, ...filesToAdd];

    setImages(updatedImages);
    setImageFiles(updatedFiles);

    // Save filenames to localStorage
    localStorage.setItem('lp_listing_images', JSON.stringify(updatedImages.map(img => img.name)));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (index: number) => {
    const imgToRemove = images[index];
    if (imgToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imgToRemove.url);
    }

    const updatedImages = images.filter((_, i) => i !== index);
    const updatedFiles = imageFiles.filter((_, i) => i !== index); // Note: file removal assumes matches preview array index

    setImages(updatedImages);
    setImageFiles(updatedFiles);
    localStorage.setItem('lp_listing_images', JSON.stringify(updatedImages.map(img => img.name)));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images];
    const newFiles = [...imageFiles];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < images.length) {
      // Swap elements
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      if (newFiles[index] && newFiles[targetIndex]) {
        [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      }
      setImages(newImages);
      setImageFiles(newFiles);
      localStorage.setItem('lp_listing_images', JSON.stringify(newImages.map(img => img.name)));
    }
  };

  const handleNextStep2 = () => {
    if (images.length === 0) {
      toast.error("Please add at least 1 photo to showcase your property.");
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
              
              {/* Green Progress Fill Line */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-neutral-200 -z-10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#004F31]" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${((step - 1) / 4) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
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
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-black transition-all border shadow-sm select-none ${
                        isCompleted 
                          ? 'bg-[#004F31] border-[#004F31] text-white' 
                          : isCurrent 
                            ? 'bg-[#004F31] border-[#004F31] text-white ring-4 ring-[#004F31]/25' 
                            : 'bg-white border-neutral-200 text-neutral-400'
                      }`}
                      animate={isCurrent ? { scale: 1.1 } : { scale: 1 }}
                    >
                      {isCompleted ? '✓' : s.icon}
                    </motion.div>
                    <span className={`text-[10px] sm:text-xs uppercase tracking-wider mt-2 transition-all font-black select-none ${
                      isCurrent ? 'text-[#004F31]' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'
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
              <span className="text-xs font-semibold text-neutral-400 mt-2 sm:mt-0 flex items-center gap-1">
                ⏱️ Takes about 5 minutes to go live
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
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900">What category is your property?</h3>
                    <p className="text-xs text-neutral-500 font-semibold mt-0.5">Choose the listing category that best represents your real estate asset.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { type: 'House', icon: '🏠', label: 'House / Villa' },
                      { type: 'Apartment', icon: '🏢', label: 'Apartment' },
                      { type: 'Land', icon: '🌿', label: 'Land Plot' },
                      { type: 'Commercial', icon: '🏗️', label: 'Commercial' },
                      { type: 'Villa', icon: '🏖️', label: 'Bungalow' },
                      { type: 'Other', icon: '✨', label: 'Other Type' },
                    ].map((c) => (
                      <button
                        key={c.type}
                        onClick={() => setCategory(c.type)}
                        className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group ${
                          category === c.type 
                            ? 'bg-[#004F31]/5 border-[#004F31] ring-2 ring-[#004F31]/5' 
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <span className="text-2xl transition-transform group-hover:scale-110">{c.icon}</span>
                        <span className={`text-xs font-extrabold ${category === c.type ? 'text-[#004F31]' : 'text-neutral-700'}`}>
                          {c.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Core Information */}
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900">Core Listing Specifications</h3>
                    <p className="text-xs text-neutral-500 font-semibold mt-0.5">Let buyers know the size, layout, and transaction rules of your property.</p>
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
                        onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                        className={`w-full px-4 py-3 bg-[#F8FAF8] border rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31] ${
                          errors.title ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                        }`}
                      />
                      {errors.title && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.title}</p>}
                    </div>

                    {/* Offer Type & Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Offer Transaction *</label>
                        <select
                          value={listingType}
                          onChange={(e) => setListingType(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31]"
                        >
                          <option value="For Sale">Sale (Outright Transfer)</option>
                          <option value="For Rent">Rent / Lease Duration</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Land Area Size</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. 15"
                            value={landSize}
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
                            <option>Sq. Feet</option>
                            <option>Sq. Meters</option>
                          </select>
                        </div>
                      </div>

                    </div>

                    {/* Steppers & Floors */}
                    {category !== 'Land' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-100 pt-4">
                        
                        {/* Bedrooms */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Bedrooms</label>
                          <div className="flex items-center justify-between bg-[#F8FAF8] border border-neutral-200 rounded-xl p-1.5">
                            <button
                              type="button"
                              onClick={() => handleSpecChange('bedrooms', 'dec')}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg flex items-center justify-center text-xs font-bold"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-xs font-extrabold text-neutral-800">{bedrooms}</span>
                            <button
                              type="button"
                              onClick={() => handleSpecChange('bedrooms', 'inc')}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg flex items-center justify-center text-xs font-bold"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Bathrooms */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Bathrooms</label>
                          <div className="flex items-center justify-between bg-[#F8FAF8] border border-neutral-200 rounded-xl p-1.5">
                            <button
                              type="button"
                              onClick={() => handleSpecChange('bathrooms', 'dec')}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg flex items-center justify-center text-xs font-bold"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-xs font-extrabold text-neutral-800">{bathrooms}</span>
                            <button
                              type="button"
                              onClick={() => handleSpecChange('bathrooms', 'inc')}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg flex items-center justify-center text-xs font-bold"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Floors */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Floors</label>
                          <div className="flex items-center justify-between bg-[#F8FAF8] border border-neutral-200 rounded-xl p-1.5">
                            <button
                              type="button"
                              onClick={() => handleSpecChange('floors', 'dec')}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg flex items-center justify-center text-xs font-bold"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-xs font-extrabold text-neutral-800">{floors}</span>
                            <button
                              type="button"
                              onClick={() => handleSpecChange('floors', 'inc')}
                              className="h-8 w-8 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg flex items-center justify-center text-xs font-bold"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                    {category !== 'Land' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Built-up Floor Area (Sq. Feet)</label>
                        <input
                          type="text"
                          placeholder="e.g. 2400"
                          value={floorArea}
                          onChange={(e) => setFloorArea(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31]"
                        />
                      </div>
                    )}

                    {/* Price and negotiation details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-100 pt-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Expectation Price (LKR) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-3.5 text-xs font-extrabold text-[#004F31]">Rs.</span>
                          <input
                            type="text"
                            placeholder="e.g. 35,000,000"
                            value={formatPriceComma(priceLkr)}
                            onChange={(e) => setPriceLkr(e.target.value.replace(/[^0-9]/g, ''))}
                            className={`w-full pl-12 pr-4 py-3 bg-[#F8FAF8] border rounded-xl text-xs font-extrabold outline-none focus:ring-1 focus:ring-[#004F31] ${
                              errors.priceLkr ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                            }`}
                          />
                        </div>
                        {errors.priceLkr && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.priceLkr}</p>}
                        
                        {priceLkr && (
                          <div className="flex items-center justify-between text-[11px] font-extrabold text-[#004F31] px-1 bg-[#004F31]/5 py-1.5 rounded-lg mt-1">
                            <span>💵 Est. USD Value:</span>
                            <span>${getUsdEstimate()} USD</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-end space-y-2 pb-2">
                        <button
                          type="button"
                          onClick={() => setIsNegotiable(!isNegotiable)}
                          className={`px-4 py-3 border rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                            isNegotiable ? 'bg-[#004F31]/5 border-[#004F31] text-[#004F31]' : 'bg-[#F8FAF8] border-neutral-200 text-neutral-500'
                          }`}
                        >
                          <span className={`h-4 w-4 rounded flex items-center justify-center border ${
                            isNegotiable ? 'bg-[#004F31] border-[#004F31] text-white' : 'border-neutral-300 bg-white'
                          }`}>
                            {isNegotiable && '✓'}
                          </span>
                          Price is Negotiable
                        </button>
                      </div>

                    </div>

                    {listingType === 'For Rent' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Key Money Advance Required</label>
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
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-extrabold text-neutral-900 font-display">Detailed Listing Description</h3>
                      <p className="text-xs text-neutral-500 font-semibold mt-0.5">Introduce your property to buyers. Highlight nearby hospitals, highways, or schools.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAiGenerateText}
                      disabled={isGeneratingAi}
                      className="px-4 py-2 bg-[#004F31] hover:bg-emerald-950 text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/15 cursor-pointer select-none"
                    >
                      {isGeneratingAi ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          AI is drafting...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          Generate with AI
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={6}
                      placeholder="e.g. Beautiful architect designed two story home located in a highly residential, quiet neighborhood. Built with high quality materials including mahogany doors and luxury tiles. Features a spacious landscaped garden, double carport, and stunning roof-deck. Walking distance to supermarkets, international schools, and local transport options."
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                      className={`w-full p-4 bg-[#F8FAF8] border rounded-2xl text-xs font-bold leading-relaxed outline-none focus:ring-1 focus:ring-[#004F31] resize-none ${
                        errors.description ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                      }`}
                    />
                    
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 font-extrabold uppercase">
                      <span>Min 50 / Max 2,000 chars</span>
                      <span className={description.length < 50 ? 'text-orange-500' : 'text-neutral-500'}>
                        {description.length} chars
                      </span>
                    </div>
                    {errors.description && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.description}</p>}
                  </div>
                </div>

                {/* 4. Location Details & Map */}
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900">Pinpoint the Exact Location</h3>
                    <p className="text-xs text-neutral-500 font-semibold mt-0.5">Let buyers find you easily. Drop a pin on the map below.</p>
                  </div>

                  <div className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Province District Hub *</label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAF8] border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31]"
                        >
                          {DISTRICTS.map((d) => (
                            <option key={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">City / Suburb Town *</label>
                        <input
                          type="text"
                          placeholder="e.g. Kollupitiya, Malabe, Kottawa"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={`w-full px-4 py-3 bg-[#F8FAF8] border rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31] ${
                            errors.city ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                          }`}
                        />
                        {errors.city && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.city}</p>}
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Street Address / Landmark *</label>
                      <input
                        type="text"
                        placeholder="e.g. 124 Galle Road (Near Prime Junction)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full px-4 py-3 bg-[#F8FAF8] border rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#004F31] ${
                          errors.address ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200'
                        }`}
                      />
                      {errors.address && <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{errors.address}</p>}
                    </div>

                    {/* Leaflet Interactive click map */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-[#004F31] tracking-wider flex items-center gap-1">
                          <MapPin size={12} /> Interactive Locator Map
                        </label>
                        <span className="text-[10px] font-bold text-neutral-400">
                          {hasPinned ? "🟢 Location Pinned" : "📍 Click map to drop pin"}
                        </span>
                      </div>
                      
                      <div className="h-64 rounded-2xl overflow-hidden border border-neutral-200 relative z-10 shadow-sm">
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
                        <div className="bg-[#F8FAF8] border border-neutral-100 p-2.5 rounded-xl text-center">
                          <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">Latitude</span>
                          <span className="text-xs font-extrabold text-[#004F31]">{lat.toFixed(6)}</span>
                        </div>
                        <div className="bg-[#F8FAF8] border border-neutral-100 p-2.5 rounded-xl text-center">
                          <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">Longitude</span>
                          <span className="text-xs font-extrabold text-[#004F31]">{lng.toFixed(6)}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 5. Amenities checklist */}
                {category !== 'Land' && (
                  <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-base font-extrabold text-neutral-900 font-display">Special Amenities Pool</h3>
                      <p className="text-xs text-neutral-500 font-semibold mt-0.5">Toggle amenities and special assets included with this property.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {AMENITIES.map((amenity) => {
                        const isChecked = selectedAmenities.includes(amenity);
                        return (
                          <button
                            type="button"
                            key={amenity}
                            onClick={() => {
                              if (isChecked) {
                                setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                              } else {
                                setSelectedAmenities([...selectedAmenities, amenity]);
                              }
                            }}
                            className={`p-3 border rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                              isChecked 
                                ? 'bg-[#004F31]/5 border-[#004F31] text-[#004F31]' 
                                : 'bg-[#F8FAF8] border-neutral-200/80 text-neutral-600 hover:border-neutral-300'
                            }`}
                          >
                            <span className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-[#004F31] border-[#004F31] text-white' : 'border-neutral-300 bg-white'
                            }`}>
                              {isChecked && '✓'}
                            </span>
                            {amenity}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Next Button Step 1 */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNextStep1}
                    className="py-4 px-10 bg-[#004F31] hover:bg-emerald-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-950/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    Next: Add Photos <ArrowRight size={14} />
                  </button>
                </div>

              </div>

              {/* Step 1 Tips Panel */}
              <div className="space-y-6">
                <div className="bg-emerald-900 text-white rounded-[32px] p-6 sm:p-8 shadow-sm space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-800/30 rounded-full blur-xl" />
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-800 text-emerald-200 px-2.5 py-1 rounded-full">
                      Guide
                    </span>
                    <h4 className="text-base font-extrabold font-display leading-tight">Write Compelling Titles to Attract 3x Inquiries</h4>
                  </div>
                  <ul className="space-y-3.5 text-xs text-emerald-100 font-semibold">
                    <li className="flex gap-2">
                      <span className="text-sm">✓</span>
                      <span>Include bedroom count and property category</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-sm">✓</span>
                      <span>Mention valuable landmarks (e.g., Near Highway, Sea View)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-sm">✓</span>
                      <span>Provide pricing expectation context clearly</span>
                    </li>
                  </ul>
                  <div className="bg-emerald-955 rounded-2xl p-4 border border-emerald-800/60 text-[11px] leading-relaxed text-emerald-100 font-bold">
                    💡 <strong>Pro-Tip:</strong> Buyers filter heavily by district, price, and number of bedrooms. Keep specifications 100% accurate.
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
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              
              <div className="lg:col-span-2 space-y-6">
                
                {/* Image upload widget */}
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900 font-display">Add Showcase Property Images</h3>
                    <p className="text-xs text-neutral-500 font-semibold mt-0.5">Properties with photos receive 8x higher buyer traffic than text-only ads.</p>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#004F31]/30 hover:border-[#004F31] bg-[#F8FAF8] hover:bg-emerald-50/10 rounded-[24px] p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <div className="h-14 w-14 bg-[#004F31]/10 text-[#004F31] rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110">
                      <Camera size={24} />
                    </div>
                    <p className="text-xs font-black uppercase text-[#004F31] tracking-wider">Drag & Drop Property Photos Here</p>
                    <p className="text-[11px] text-neutral-400 font-bold mt-1">or click to browse your local system</p>
                    <p className="text-[9.5px] text-neutral-400 font-semibold mt-2 bg-white px-3 py-1 rounded-full border border-neutral-100">
                      JPG, PNG, WEBP • Max 5MB each • Up to 12 Photos
                    </p>
                  </div>

                  {/* Thumbnails grid */}
                  {images.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                        <span className="text-[11px] font-black uppercase text-[#004F31] tracking-wider">Loaded Previews Gallery</span>
                        <span className="text-[11px] font-black uppercase text-neutral-400">First image is cover</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 shadow-sm group bg-neutral-50">
                            
                            {/* square cover fit */}
                            <img
                              src={img.url}
                              alt={`preview-${idx}`}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />

                            {/* Overlay Badge */}
                            {idx === 0 ? (
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#004F31] text-white text-[9px] font-black uppercase rounded tracking-widest border border-white/20 shadow">
                                Cover Photo
                              </span>
                            ) : null}

                            {/* hover controls */}
                            <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              {/* top controls */}
                              <div className="flex justify-between items-start">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                  className="p-1 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer ml-auto"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>

                              {/* bottom swap/order controls */}
                              <div className="flex justify-between gap-1 mt-auto">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={(e) => { e.stopPropagation(); moveImage(idx, 'left'); }}
                                  className={`p-1 bg-white hover:bg-neutral-100 text-[#004F31] rounded-lg transition-all cursor-pointer ${
                                    idx === 0 && 'opacity-40 cursor-not-allowed'
                                  }`}
                                >
                                  <ChevronLeft size={12} />
                                </button>
                                <span className="text-[9px] font-black text-white bg-[#004F31] px-1.5 py-0.5 rounded">
                                  #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  disabled={idx === images.length - 1}
                                  onClick={(e) => { e.stopPropagation(); moveImage(idx, 'right'); }}
                                  className={`p-1 bg-white hover:bg-neutral-100 text-[#004F31] rounded-lg transition-all cursor-pointer ${
                                    idx === images.length - 1 && 'opacity-40 cursor-not-allowed'
                                  }`}
                                >
                                  <ChevronRight size={12} />
                                </button>
                              </div>

                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-neutral-400 font-extrabold uppercase text-center mt-2">
                        💡 Tip: Reorder photos using arrows so the best photo is listed as cover first!
                      </p>
                    </div>
                  )}

                </div>

                {/* Back / Next panel */}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="py-4 px-6 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2"
                  >
                    <ArrowLeft size={13} /> Back to Details
                  </button>
                  <button
                    onClick={handleNextStep2}
                    className="py-4 px-10 bg-[#004F31] hover:bg-emerald-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-950/25 transition-all flex items-center gap-2"
                  >
                    Choose Package <ArrowRight size={14} />
                  </button>
                </div>

              </div>

              {/* Step 2 Sidebar */}
              <div className="space-y-6">
                
                {/* Photo tips panel */}
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-neutral-900 font-display">📸 Showcase Photo Tips</h4>
                    <p className="text-[11px] text-neutral-400 font-bold mt-0.5">Follow local guidelines to get better inquiry rates.</p>
                  </div>
                  <ul className="space-y-3.5 text-xs text-neutral-600 font-semibold">
                    <li className="flex gap-2">
                      <span className="text-[#004F31]">✓</span>
                      <span>Capture photos in bright daylight. Avoid night-shots.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#004F31]">✓</span>
                      <span>Show the front elevation of the building first.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#004F31]">✓</span>
                      <span>Include garden, car-park, kitchens and master bedrooms.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#004F31]">✓</span>
                      <span>We highly recommend uploading at least 5 photos.</span>
                    </li>
                  </ul>
                </div>

                {/* Image progress widget */}
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-sm space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase text-neutral-500 tracking-wider">
                    <span>Photos Added</span>
                    <span className="text-[#004F31]">{images.length} / 12</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#004F31]" 
                      initial={{ width: '0%' }}
                      animate={{ width: `${(images.length / 12) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => { setStep(3); }}
                    className="text-[10.5px] font-black uppercase tracking-wider text-[#004F31] hover:underline block text-center pt-2"
                  >
                    Skip photos for now →
                  </button>
                </div>

              </div>

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
