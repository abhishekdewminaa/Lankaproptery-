import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  Camera, 
  MapPin, 
  Smartphone, 
  Phone, 
  Sparkles, 
  Wand2, 
  Loader2, 
  Info,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  Trash2,
  GripVertical,
  Star,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Home,
  Trees,
  Building2,
  Building,
  Briefcase,
  Palmtree,
  Sprout,
  Hotel,
  Save,
  Globe,
  Settings,
  User,
  FileText,
  Bot,
  Zap,
  RotateCcw
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
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
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

// Leaflet marker fix
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface AdminListingFormProps {
  user: any;
  initialData?: any;
  onBack: () => void;
  onRefresh?: () => void;
  onSuccess: (property: any) => void;
}

const DISTRICTS = ["Colombo", "Kandy", "Galle", "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];

const CATEGORIES = [
  { id: 'House', label: 'House', icon: Home },
  { id: 'Land', label: 'Land', icon: Trees },
  { id: 'Apartment', label: 'Apartment', icon: Building2 },
  { id: 'Building', label: 'Building', icon: Building },
  { id: 'Commercial', label: 'Commercial', icon: Briefcase },
  { id: 'Villa', label: 'Villa', icon: Palmtree },
  { id: 'Farm Land', label: 'Farm Land', icon: Sprout },
  { id: 'Hotel', label: 'Hotel', icon: Hotel },
];

function DraggableMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  const markerRef = useRef<any>(null);
  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition([latLng.lat, latLng.lng]);
        }
      },
    }),
    [setPosition],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

const SortableImageItem: React.FC<{ url: string, onRemove: () => void | Promise<void>, onSetMain: () => void, isMain: boolean }> = ({ url, onRemove, onSetMain, isMain }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative aspect-video rounded-2xl overflow-hidden group border border-admin-border shadow-md bg-white ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <img src={url} alt="Property" className="w-full h-full object-cover" />
      
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
        <div className="flex justify-between items-start">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40">
            <GripVertical size={16} />
          </div>
          <button 
            onClick={onRemove}
            className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors shadow-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        <button 
          onClick={onSetMain}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isMain ? 'bg-admin-gold text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/40'}`}
        >
          <Star size={14} fill={isMain ? "currentColor" : "none"} />
          {isMain ? 'Main Photo' : 'Set as Main'}
        </button>
      </div>

      {isMain && (
        <div className="absolute top-3 left-3 bg-admin-gold text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">
          Main
        </div>
      )}
    </div>
  );
}

export default function AdminListingForm({ user, initialData, onBack, onRefresh, onSuccess }: AdminListingFormProps) {
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(initialData?.updated_at || null);
  const [imageUploadProgress, setImageUploadProgress] = useState<number | null>(null);

  // AI Import State
  const [pastedText, setPastedText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [importResults, setImportResults] = useState<any>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const PROGRESS_MESSAGES = [
    "🔍 Reading property details...",
    "💰 Extracting price...",
    "📱 Finding contact number...",
    "📍 Detecting location...",
    "✨ Filling your form..."
  ];

  useEffect(() => {
    let interval: any;
    if (isImporting) {
      let i = 0;
      setImportProgress(PROGRESS_MESSAGES[0]);
      interval = setInterval(() => {
        i = (i + 1) % PROGRESS_MESSAGES.length;
        setImportProgress(PROGRESS_MESSAGES[i]);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isImporting]);

  const handleQuickImport = async () => {
    if (!pastedText.trim()) {
      toast.error('Please paste some text first');
      return;
    }

    setIsImporting(true);
    setImportSuccess(false);
    setImportResults(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract ALL details from this real estate listing text. Respond ONLY with JSON.

Text: ${pastedText}

Schema:
{
  "listing_title": "string or null",
  "listing_type": "For Sale | For Rent | For Lease",
  "property_category": "House | Land | Apartment | Building | Commercial | Villa | Farm Land | Hotel",
  "district": "string (one of: ${DISTRICTS.join(', ')})",
  "city": "string or null",
  "price_lkr": number or null,
  "is_negotiable": boolean,
  "rooms": number or null,
  "bathrooms": number or null,
  "floors": number or null,
  "land_area": "string or null",
  "floor_area": "string or null",
  "mobile": "string or null",
  "landline": "string or null",
  "property_description": "string or null",
  "additional_info": "string or null",
  "confidence": number (0-100)
}

RULES:
- price_lkr = number only (e.g. 45000000)
- mobile starts with 07
- landline starts with 011
- Translate common Sinhala terms if present`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const extracted = JSON.parse(response.text || '{}');
      fillAllFormFields(extracted);
    } catch (err) {
      console.error(err);
      toast.error('Import failed. Try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const fillAllFormFields = (data: any) => {
    const newFormData = { ...formData };

    if (data.listing_title) newFormData.listing_title = data.listing_title;
    if (data.listing_type) newFormData.listing_type = data.listing_type;
    if (data.property_category) newFormData.property_category = data.property_category;
    if (data.district && DISTRICTS.includes(data.district)) newFormData.district = data.district;
    if (data.city) newFormData.city = data.city;
    if (data.price_lkr) {
      newFormData.price_lkr = data.price_lkr;
      newFormData.usd_estimate = Math.round(data.price_lkr / 300);
    }
    if (data.is_negotiable !== undefined) newFormData.is_negotiable = data.is_negotiable;
    if (data.rooms) newFormData.rooms = data.rooms;
    if (data.bathrooms) newFormData.bathrooms = data.bathrooms;
    if (data.floors) newFormData.floors = data.floors;
    if (data.land_area) newFormData.land_area = data.land_area;
    if (data.floor_area) newFormData.floor_area = data.floor_area;
    if (data.mobile) newFormData.mobile = data.mobile;
    if (data.landline) newFormData.landline = data.landline;
    if (data.property_description) newFormData.description = data.property_description;
    if (data.additional_info) newFormData.additional_info = data.additional_info;

    setFormData(newFormData);
    setImportResults(data);
    setImportSuccess(true);

    // Visual feedback
    setTimeout(() => {
      const inputs = document.querySelectorAll('input:not([type="checkbox"]), textarea');
      inputs.forEach((el: any) => {
        if (el.value) {
          el.style.borderColor = '#004F31';
          el.style.backgroundColor = '#E8F5E9';
          setTimeout(() => {
            el.style.borderColor = '';
            el.style.backgroundColor = '';
          }, 2000);
        }
      });
    }, 300);

    toast.success(`${data.confidence}% confident - Please verify all fields!`);
    
    document.querySelector('.property-images-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Form State
  const [formData, setFormData] = useState({
    listing_type: initialData?.listing_type || 'For Sale',
    property_category: initialData?.property_category || 'Apartment',
    listing_title: initialData?.listing_title || '',
    district: initialData?.district || 'Colombo',
    city: initialData?.city || '',
    price_lkr: initialData?.price_lkr || '',
    usd_estimate: initialData?.usd_estimate || 0,
    is_negotiable: initialData?.is_negotiable || false,
    land_area: initialData?.land_area || '',
    floor_area: initialData?.floor_area || '',
    floors: initialData?.floors || 0,
    rooms: initialData?.rooms || 0,
    bathrooms: initialData?.bathrooms || 0,
    description: initialData?.property_description || '',
    additional_info: initialData?.additional_info || '',
    google_maps_link: initialData?.google_maps_link || '',
    mobile: initialData?.mobile || '',
    landline: initialData?.landline || '',
    status: initialData?.status || 'active',
    package_tier: initialData?.package_tier || 'Starter Free',
    is_featured: initialData?.is_featured || false,
    is_trending: initialData?.is_trending || false,
    allow_inquiries: initialData?.allow_inquiries ?? true,
    price_on_request: initialData?.price_on_request || false,
    admin_notes: initialData?.admin_notes || '',
    images: (initialData?.images as string[]) || [],
    coordinates: (initialData?.coordinates as [number, number]) || [6.9271, 79.8612] // [lat, lng]
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = formData.images.indexOf(active.id as string);
      const newIndex = formData.images.indexOf(over.id as string);
      const newImages = arrayMove(formData.images, oldIndex, newIndex);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  const setAsMain = (url: string) => {
    const newImages = [url, ...formData.images.filter(img => img !== url)];
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const uploadImage = async (file: File) => {
    if (formData.images.length >= 12) {
      toast.error('Maximum 12 photos allowed');
      return null;
    }

    try {
      setImageUploadProgress(10);
      const path = `properties/${initialData?.id || 'new'}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(path, file, { upsert: true });

      if (error) throw error;
      setImageUploadProgress(60);

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(path);

      setImageUploadProgress(100);
      setTimeout(() => setImageUploadProgress(null), 1000);
      return urlData.publicUrl;
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
      setImageUploadProgress(null);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    for (const file of files) {
      const url = await uploadImage(file);
      if (url) {
        setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
      }
    }
    e.target.value = '';
  };

  const deleteImage = async (imageUrl: string) => {
    if (!window.confirm("Remove this photo?")) return;

    const newImages = formData.images.filter(img => img !== imageUrl);
    setFormData(prev => ({ ...prev, images: newImages }));

    // Try to delete from storage if it's our own URL
    try {
      const path = imageUrl.split('property-images/')[1];
      if (path) {
        await supabase.storage.from('property-images').remove([path]);
      }
    } catch (err) {
      console.warn("Could not delete image from storage:", err);
    }
  };

  const saveProperty = useCallback(async (isAutoSave = false) => {
    if (!isAutoSave) setIsSaving(true);
    
    try {
      const priceNum = parseFloat(formData.price_lkr.toString().replace(/[^0-9.]/g, '')) || 0;
      const usdEst = priceNum / 300;

      const payload = {
        listing_type: formData.listing_type,
        property_category: formData.property_category,
        listing_title: formData.listing_title,
        district: formData.district,
        city: formData.city,
        price_lkr: priceNum,
        usd_estimate: usdEst,
        is_negotiable: formData.is_negotiable,
        land_area: formData.land_area,
        floor_area: formData.floor_area,
        floors: parseInt(formData.floors.toString()),
        rooms: parseInt(formData.rooms.toString()),
        bathrooms: parseInt(formData.bathrooms.toString()),
        property_description: formData.description,
        additional_info: formData.additional_info,
        google_maps_link: formData.google_maps_link,
        mobile: formData.mobile,
        landline: formData.landline,
        status: formData.status,
        package_tier: formData.package_tier,
        is_featured: formData.is_featured,
        is_trending: formData.is_trending,
        allow_inquiries: formData.allow_inquiries,
        price_on_request: formData.price_on_request,
        admin_notes: formData.admin_notes,
        images: formData.images,
        coordinates: formData.coordinates,
        updated_at: new Date().toISOString()
      };

      let result;
      if (initialData?.id) {
        result = await supabase.from('properties').update(payload).eq('id', initialData.id);
      } else {
        result = await supabase.from('properties').insert([{ ...payload, agent_id: user?.email }]).select().single();
      }

      if (result.error) throw result.error;

      setLastSaved(new Date().toLocaleTimeString());
      if (!isAutoSave) {
        toast.success(initialData?.id ? 'Property updated successfully!' : 'Property published successfully!');
        if (!initialData?.id) onSuccess(result.data);
      }
    } catch (error: any) {
      if (!isAutoSave) toast.error('Failed to save: ' + error.message);
    } finally {
      if (!isAutoSave) setIsSaving(false);
    }
  }, [formData, initialData, user, onSuccess]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (formData.listing_title) {
        saveProperty(true);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [saveProperty, formData.listing_title]);

  const priceNum = parseFloat(formData.price_lkr.toString().replace(/[^0-9.]/g, '')) || 0;

  return (
    <div className="min-h-screen bg-[#F0F4F0] pb-32 animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-admin-border p-6 sm:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-3 bg-[#F0F4F0] rounded-2xl text-[#004F31] hover:bg-[#004F31] hover:text-white transition-all shadow-sm group"
          >
            <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-[#004F31] tracking-tight">
              {initialData?.id ? `Edit Property #${String(initialData.id).split('-')[0].toUpperCase()}` : 'List New Property'}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400">
                {lastSaved ? `Last saved: ${lastSaved}` : 'Listing Draft'}
              </span>
              {isSaving && (
                <span className="flex items-center gap-2 text-[10px] font-black text-[#004F31] uppercase tracking-widest animate-pulse">
                  <Loader2 size={12} className="animate-spin" /> Saving...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <a 
            href={`/property/${initialData?.id}`} 
            target="_blank"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-admin-border font-black text-xs uppercase tracking-widest text-[#004F31] hover:bg-white transition-all shadow-sm active:scale-95"
          >
            <ExternalLink size={16} /> View Live
          </a>
          <button 
            onClick={() => saveProperty()}
            disabled={isSaving}
            className="flex-[2] sm:flex-none flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-[#004F31] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#004F31]/20 hover:bg-[#003824] transition-all active:scale-95 disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {initialData?.id ? 'Save Changes' : 'Publish Property'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 sm:p-10 space-y-10 mt-6">
        
        {/* QUICK AI IMPORT SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="quick-import-card"
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🤖</span>
            <h3>Quick AI Import</h3>
          </div>
          <p>Paste a property description or URL and AI will fill all fields automatically</p>

          <div className="relative group">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste property description, URL or listing text here...&#10;&#10;Example:&#10;3 bedroom house for sale in Nugegoda, Rs. 45 million, contact 0771234567..."
              className={`import-textarea ${isImporting ? 'bg-gray-50 opacity-60 pointer-events-none' : ''}`}
            />
            {isImporting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-xl z-10">
                <Loader2 size={32} className="text-brand-green animate-spin mb-2" />
                <span className="text-sm font-black text-brand-green uppercase tracking-widest animate-pulse">
                  {importProgress}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button 
              onClick={() => { setPastedText(''); setImportResults(null); setImportSuccess(false); }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#004F31] transition-all"
            >
              <RotateCcw size={14} /> Clear
            </button>
            <button 
              onClick={handleQuickImport}
              disabled={isImporting}
              className="import-btn"
            >
              {isImporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap size={16} className="fill-current" />
                  ✨ Import with AI →
                </>
              )}
            </button>
          </div>

          <div className="import-hints">
            {['Title', 'Price', 'Location', 'Mobile', 'Bedrooms', 'Description'].map(tag => (
              <span key={tag} className="import-hint-badge">✓ {tag}</span>
            ))}
          </div>

          <AnimatePresence>
            {importSuccess && importResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 overflow-hidden"
              >
                <div className="bg-[#F0F4F0] rounded-2xl p-6 border-l-4 border-brand-green">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-black text-brand-green uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={16} /> Import Complete! {importResults.confidence}% confidence
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`flex items-center gap-2 text-xs font-bold ${importResults.listing_title ? 'text-brand-green' : 'text-red-500'}`}>
                      {importResults.listing_title ? '✓' : '✗'} Title
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold ${importResults.price_lkr ? 'text-brand-green' : 'text-red-500'}`}>
                      {importResults.price_lkr ? '✓' : '✗'} Rs. {importResults.price_lkr?.toLocaleString()}
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold ${importResults.district ? 'text-brand-green' : 'text-red-500'}`}>
                      {importResults.district ? '✓' : '✗'} {importResults.district}
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold ${importResults.mobile ? 'text-brand-green' : 'text-red-500'}`}>
                      {importResults.mobile ? '✓' : '✗'} {importResults.mobile}
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold ${importResults.rooms ? 'text-brand-green' : 'text-red-500'}`}>
                      {importResults.rooms ? '✓' : '✗'} {importResults.rooms} Bedrooms
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold ${importResults.bathrooms ? 'text-brand-green' : 'text-red-500'}`}>
                      {importResults.bathrooms ? '✓' : '✗'} {importResults.bathrooms} Bathrooms
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold ${importResults.property_description ? 'text-brand-green' : 'text-red-500'}`}>
                      {importResults.property_description ? '✓' : '✗'} Description
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold ${importResults.land_area ? 'text-brand-green' : 'text-red-500'}`}>
                      {importResults.land_area ? '✓' : '✗'} Land area
                    </div>
                  </div>

                  <p className="mt-6 text-[10px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                    <Info size={12} /> Please verify before publishing
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* SECTION 1: IMAGES */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-admin-border space-y-8 property-images-section"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-2xl font-black text-[#004F31] tracking-tight">Property Images</h3>
              <p className="text-sm font-bold text-gray-400 mt-1">Drag to reorder. First image = main photo. Maximum 12 photos.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{formData.images.length} / 12 photos</span>
              <button 
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={formData.images.length >= 12}
                className="bg-[#004F31] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#003824] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Plus size={16} /> Add More
              </button>
              <input type="file" id="photo-upload" className="hidden" onChange={handleFileChange} multiple accept="image/*" />
            </div>
          </div>

          <AnimatePresence>
            {imageUploadProgress !== null && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#004F31]">
                  <span>Uploading files...</span>
                  <span>{imageUploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#F0F4F0] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${imageUploadProgress}%` }}
                    className="h-full bg-[#004F31]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <SortableContext 
                items={formData.images}
                strategy={rectSortingStrategy}
              >
                {formData.images.map((url, i) => (
                  <SortableImageItem 
                    key={url} 
                    url={url} 
                    onRemove={() => deleteImage(url)} 
                    onSetMain={() => setAsMain(url)}
                    isMain={i === 0}
                  />
                ))}
              </SortableContext>
              
              {formData.images.length < 12 && (
                <button 
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  className="aspect-video bg-[#F0F4F0] border-2 border-dashed border-admin-border/50 rounded-2xl flex flex-col items-center justify-center text-gray-300 hover:border-[#004F31] hover:text-[#004F31] transition-all group"
                >
                  <Camera size={32} className="group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">+ Upload</span>
                </button>
              )}
            </div>
          </DndContext>
        </motion.section>

        {/* SECTION 2: CORE DETAILS */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-admin-border space-y-10"
        >
          <div>
            <h3 className="text-2xl font-black text-[#004F31] tracking-tight">Core Details</h3>
            <p className="text-sm font-bold text-gray-400 mt-1">Basic identification and categorization.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Listing Type</label>
              <div className="flex flex-wrap gap-4">
                {['For Sale', 'For Rent', 'For Lease'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setFormData({...formData, listing_type: type})}
                    className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.listing_type === type ? 'bg-[#004F31] text-white shadow-lg shadow-[#004F31]/20' : 'bg-[#F0F4F0] text-gray-400 hover:bg-gray-100'}`}
                  >
                    {type}
                    {formData.listing_type === type && <CheckCircle size={14} className="inline ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isActive = formData.property_category === cat.id;
                  return (
                    <button 
                      key={cat.id}
                      onClick={() => setFormData({...formData, property_category: cat.id})}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group ${isActive ? 'bg-[#004F31]/5 border-[#004F31] shadow-md' : 'bg-white border-admin-border hover:bg-[#F0F4F0]'}`}
                    >
                      <Icon size={24} className={isActive ? 'text-[#004F31]' : 'text-gray-300 group-hover:text-[#004F31]'} />
                      <span className={`text-[9px] font-black uppercase tracking-widest text-center ${isActive ? 'text-[#004F31]' : 'text-gray-400'}`}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Listing Title</label>
                <span className={`text-[9px] font-black uppercase tracking-widest ${formData.listing_title.length > 140 ? 'text-red-500' : 'text-gray-300'}`}>{formData.listing_title.length} / 150</span>
              </div>
              <input 
                type="text" 
                maxLength={150}
                value={formData.listing_title}
                onChange={e => setFormData({...formData, listing_title: e.target.value})}
                placeholder="Ex: Luxury 3 Bedroom Apartment in Colombo 07"
                className="w-full bg-[#F0F4F0] border-2 border-transparent focus:border-[#004F31]/20 focus:bg-white rounded-xl p-4 text-sm font-bold outline-none transition-all"
              />
            </div>
          </div>
        </motion.section>

        {/* SECTION 3: PRICING & LOCATION */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-admin-border space-y-10"
        >
          <div>
            <h3 className="text-2xl font-black text-[#004F31] tracking-tight">Pricing & Location</h3>
            <p className="text-sm font-bold text-gray-400 mt-1">Define location accuracy and target list price.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {/* Left: Location */}
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">District</label>
                <div className="relative">
                  <select 
                    value={formData.district}
                    onChange={e => setFormData({...formData, district: e.target.value})}
                    className="w-full bg-[#F0F4F0] border-transparent rounded-xl p-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                  >
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City / Suburb</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  placeholder="Ex: Kandana"
                  className="w-full bg-[#F0F4F0] border-transparent rounded-xl p-4 text-sm font-bold outline-none"
                />
              </div>
            </div>

            {/* Right: Pricing */}
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (LKR)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.price_lkr}
                    onChange={e => setFormData({...formData, price_lkr: e.target.value.replace(/[^0-9]/g, '')})}
                    placeholder="Ex: 87,500,000"
                    disabled={formData.price_on_request}
                    className="w-full bg-[#F0F4F0] border-transparent rounded-xl p-4 pl-14 text-lg font-black outline-none disabled:opacity-50"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 uppercase">Rs.</span>
                </div>
                {!formData.price_on_request && (
                  <div className="flex gap-4 px-2">
                    <span className="text-[10px] font-bold text-gray-400">≈ USD ${Math.round(priceNum / 300).toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-gray-400">≈ EUR €{Math.round(priceNum / 325).toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer hidden" 
                      checked={formData.is_negotiable}
                      onChange={() => setFormData({...formData, is_negotiable: !formData.is_negotiable})}
                    />
                    <div className="w-6 h-6 rounded-lg bg-[#F0F4F0] border-2 border-admin-border peer-checked:bg-[#004F31] peer-checked:border-[#004F31] transition-all" />
                    <CheckCircle size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-[#004F31] transition-colors">Price is Negotiable</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer hidden" 
                      checked={formData.price_on_request}
                      onChange={() => setFormData({...formData, price_on_request: !formData.price_on_request})}
                    />
                    <div className="w-6 h-6 rounded-lg bg-[#F0F4F0] border-2 border-admin-border peer-checked:bg-[#004F31] peer-checked:border-[#004F31] transition-all" />
                    <CheckCircle size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-[#004F31] transition-colors">Price on request (hides price)</span>
                </label>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 4: PROPERTY SPECIFICATIONS */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-admin-border space-y-10"
        >
          <div>
            <h3 className="text-2xl font-black text-[#004F31] tracking-tight">Property Specifications</h3>
            <p className="text-sm font-bold text-gray-400 mt-1">Detailed dimensions and spatial information.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Land Area (Perches)</label>
              <input type="text" value={formData.land_area} onChange={e => setFormData({...formData, land_area: e.target.value})} placeholder="Ex: 20" className="w-full bg-[#F0F4F0] rounded-xl p-4 text-sm font-bold outline-none" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Floor Area (Sqft)</label>
              <input type="text" value={formData.floor_area} onChange={e => setFormData({...formData, floor_area: e.target.value})} placeholder="Ex: 2,500" className="w-full bg-[#F0F4F0] rounded-xl p-4 text-sm font-bold outline-none" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Floors</label>
              <input type="number" value={formData.floors} onChange={e => setFormData({...formData, floors: e.target.value})} className="w-full bg-[#F0F4F0] rounded-xl p-4 text-sm font-bold outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rooms</label>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setFormData(p => ({...p, rooms: Math.max(0, parseInt(p.rooms.toString()) - 1)}))}
                  className="w-12 h-12 bg-[#F0F4F0] rounded-xl flex items-center justify-center text-[#004F31] active:scale-95 transition-all text-2xl font-bold"
                >−</button>
                <span className="text-xl font-black text-admin-text-dark min-w-[30px] text-center">{formData.rooms}</span>
                <button 
                  onClick={() => setFormData(p => ({...p, rooms: parseInt(p.rooms.toString()) + 1}))}
                  className="w-12 h-12 bg-[#F0F4F0] rounded-xl flex items-center justify-center text-[#004F31] active:scale-95 transition-all text-2xl font-bold"
                >+</button>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bathrooms</label>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setFormData(p => ({...p, bathrooms: Math.max(0, parseInt(p.bathrooms.toString()) - 1)}))}
                  className="w-12 h-12 bg-[#F0F4F0] rounded-xl flex items-center justify-center text-[#004F31] active:scale-95 transition-all text-2xl font-bold"
                >−</button>
                <span className="text-xl font-black text-admin-text-dark min-w-[30px] text-center">{formData.bathrooms}</span>
                <button 
                  onClick={() => setFormData(p => ({...p, bathrooms: parseInt(p.bathrooms.toString()) + 1}))}
                  className="w-12 h-12 bg-[#F0F4F0] rounded-xl flex items-center justify-center text-[#004F31] active:scale-95 transition-all text-2xl font-bold"
                >+</button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 5: PROPERTY DESCRIPTION */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-admin-border space-y-10"
        >
          <div>
            <h3 className="text-2xl font-black text-[#004F31] tracking-tight">Property Description</h3>
            <p className="text-sm font-bold text-gray-400 mt-1">Write a compelling marketing description.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">{formData.description.length} chars</span>
              </div>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Ex: This stunning 3 bedroom apartment offers panoramic city views..."
                className="w-full bg-[#F0F4F0] border-transparent focus:bg-white focus:border-[#004F31]/20 rounded-2xl p-6 text-sm font-medium min-h-[220px] outline-none transition-all resize-none"
              />
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Additional Information (Optional)</label>
              <textarea 
                value={formData.additional_info}
                onChange={e => setFormData({...formData, additional_info: e.target.value})}
                placeholder="Ex: Security features, school zones, unique features..."
                className="w-full bg-[#F0F4F0] border-transparent focus:bg-white focus:border-[#004F31]/20 rounded-2xl p-6 text-sm font-medium min-h-[120px] outline-none transition-all resize-none"
              />
            </div>
          </div>
        </motion.section>

        {/* SECTION 6: GOOGLE MAPS LOCATION */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-admin-border space-y-10"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-black text-[#004F31] tracking-tight">Property Location</h3>
              <p className="text-sm font-bold text-gray-400 mt-1">Drag pin to exact location.</p>
            </div>
            <button 
              onClick={() => setFormData(p => ({...p, coordinates: [6.9271, 79.8612]}))}
              className="px-4 py-2 bg-[#F0F4F0] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#004F31] hover:bg-white transition-all shadow-sm"
            >
              Center on Property
            </button>
          </div>

          <div className="space-y-6">
            <div className="h-[400px] w-full rounded-[24px] overflow-hidden border border-admin-border relative z-0">
               <MapContainer center={formData.coordinates} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <DraggableMarker position={formData.coordinates} setPosition={(pos) => setFormData(p => ({...p, coordinates: pos}))} />
                  <MapUpdater center={formData.coordinates} />
               </MapContainer>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Google Maps Link</label>
              <div className="relative">
                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="url" 
                  value={formData.google_maps_link}
                  onChange={e => setFormData({...formData, google_maps_link: e.target.value})}
                  placeholder="Paste Google Maps share link here..."
                  className="w-full bg-[#F0F4F0] border-transparent rounded-xl p-4 pl-14 text-sm font-bold outline-none"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 7: CONTACT INFORMATION */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-admin-border space-y-10"
        >
          <div>
            <h3 className="text-2xl font-black text-[#004F31] tracking-tight">Contact Information</h3>
            <p className="text-sm font-bold text-gray-400 mt-1">Manage numbers shown on the listing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone 1 (Primary)</label>
              <div className="flex gap-3">
                <div className="relative shrink-0">
                   <select className="bg-[#F0F4F0] rounded-xl px-4 py-4 text-xs font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                      <option>Mobile</option>
                      <option>Off</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
                <input 
                  type="text" 
                  value={formData.mobile}
                  onChange={e => setFormData({...formData, mobile: e.target.value})}
                  placeholder="Ex: 077 123 4567"
                  className="flex-grow bg-[#F0F4F0] rounded-xl p-4 text-sm font-bold outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone 2 (Secondary)</label>
              <div className="flex gap-3">
                <div className="relative shrink-0">
                   <select className="bg-[#F0F4F0] rounded-xl px-4 py-4 text-xs font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                      <option>Mobile</option>
                      <option>Landline</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
                <input 
                  type="text" 
                  value={formData.landline}
                  onChange={e => setFormData({...formData, landline: e.target.value})}
                  placeholder="Ex: 011 234 5678"
                  className="flex-grow bg-[#F0F4F0] rounded-xl p-4 text-sm font-bold outline-none"
                />
              </div>
            </div>
          </div>
          
          <button className="text-[10px] font-black text-[#004F31] uppercase tracking-widest hover:underline">+ Add another number</button>
        </motion.section>

        {/* SECTION 8: LISTING SETTINGS */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-admin-border space-y-10"
        >
          <div>
            <h3 className="text-2xl font-black text-[#004F31] tracking-tight">Listing Settings</h3>
            <p className="text-sm font-bold text-gray-400 mt-1">Admin level visibility and status controls.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-10">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { id: 'active', label: 'Active', color: 'bg-[#00B67A]' },
                    { id: 'pending', label: 'Pending', color: 'bg-orange-500' },
                    { id: 'expired', label: 'Expired', color: 'bg-red-500' },
                    { id: 'paused', label: 'Paused', color: 'bg-gray-400' }
                  ].map(stat => (
                    <button 
                      key={stat.id}
                      onClick={() => setFormData({...formData, status: stat.id})}
                      className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.status === stat.id ? 'bg-[#004F31] text-white shadow-lg' : 'bg-[#F0F4F0] text-gray-400'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                      {stat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Package Tier</label>
                <div className="flex flex-col gap-3">
                  {[
                    { id: 'Starter Free', label: 'Starter Free', desc: 'Basic listing access' },
                    { id: 'Premium Pro', label: 'Premium Pro', desc: 'Better exposure & features' },
                    { id: 'Elite Pro', label: 'Elite Pro', desc: 'Maximum reach & VIP support' }
                  ].map(tier => (
                    <button 
                      key={tier.id}
                      onClick={() => setFormData({...formData, package_tier: tier.id})}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${formData.package_tier === tier.id ? 'bg-[#004F31]/5 border-[#004F31]' : 'border-admin-border bg-white hover:bg-gray-50'}`}
                    >
                      <div className="text-left">
                        <div className={`text-xs font-black uppercase tracking-widest ${formData.package_tier === tier.id ? 'text-[#004F31]' : 'text-admin-text-dark'}`}>{tier.label}</div>
                        <div className="text-[10px] font-bold text-gray-400">{tier.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.package_tier === tier.id ? 'border-[#004F31]' : 'border-gray-200'}`}>
                         {formData.package_tier === tier.id && <div className="w-2.5 h-2.5 rounded-full bg-[#004F31]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-6">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visibility Toggles</label>
                 <div className="space-y-4">
                    {[
                      { id: 'is_featured', label: 'Show on homepage featured' },
                      { id: 'is_trending', label: 'Mark as Trending' },
                      { id: 'allow_inquiries', label: 'Allow inquiries' }
                    ].map(toggle => (
                      <label key={toggle.id} className="flex items-center justify-between p-4 bg-[#F0F4F0] rounded-2xl cursor-pointer group">
                         <span className="text-xs font-black text-admin-text-dark uppercase tracking-widest">{toggle.label}</span>
                         <div className="relative">
                            <input 
                              type="checkbox" 
                              className="peer hidden" 
                              checked={(formData as any)[toggle.id]}
                              onChange={() => setFormData(p => ({...p, [toggle.id]: !(p as any)[toggle.id]}))}
                            />
                            <div className="w-12 h-6 bg-gray-300 rounded-full transition-colors peer-checked:bg-[#00B67A]" />
                            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
                         </div>
                      </label>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Published By</label>
                 <div className="flex items-center gap-4 p-4 bg-white border border-admin-border rounded-2xl">
                    <div className="w-10 h-10 bg-[#F0F4F0] rounded-full flex items-center justify-center text-[#004F31]">
                       <User size={18} />
                    </div>
                    <div>
                       <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Agent</div>
                       <div className="text-sm font-bold text-admin-text-dark">{user?.email || 'Admin'}</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 9: ADMIN NOTES */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-admin-border space-y-10"
        >
          <div>
            <h3 className="text-2xl font-black text-[#004F31] tracking-tight">Admin Notes (Internal)</h3>
            <p className="text-sm font-bold text-gray-400 mt-1">These notes are only visible to admins.</p>
          </div>

          <textarea 
            value={formData.admin_notes}
            onChange={e => setFormData({...formData, admin_notes: e.target.value})}
            placeholder="Type private admin notes here..."
            className="w-full bg-[#F0F4F0] border-transparent focus:bg-white focus:border-[#004F31]/20 rounded-2xl p-6 text-sm font-medium min-h-[160px] outline-none transition-all resize-none"
          />
        </motion.section>

        {/* BOTTOM SAVE BAR */}
        <div className="bg-white p-6 rounded-[32px] border border-admin-border shadow-[0_-20px_40px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row justify-between items-center gap-6 sticky bottom-8 z-[100]">
           <button 
             onClick={onBack}
             className="px-6 py-3 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-[#004F31] transition-colors"
           >
             Cancel & Back
           </button>
           <div className="flex items-center gap-6 w-full sm:w-auto">
              <span className="hidden sm:inline text-[10px] font-black text-gray-300 uppercase tracking-widest">Listing Status: <span className="text-[#00B67A]">{formData.status}</span></span>
              <button 
                onClick={() => saveProperty()}
                disabled={isSaving}
                className="flex-grow sm:flex-none flex items-center justify-center gap-3 px-12 py-5 rounded-2xl bg-[#004F31] text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#004F31]/30 hover:bg-[#003824] transition-all active:scale-95 disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                {initialData?.id ? 'Update Property' : 'Publish Property'}
              </button>
           </div>
        </div>
      </main>

      <style>{`
        input::placeholder, textarea::placeholder {
          color: #D1D5DB;
        }
        .leaflet-container {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
