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
  RotateCcw,
  Languages
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  extractPropertyDetails, 
  translateDescription,
  getMarketAnalysis 
} from '../../services/geminiService';
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
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

const Speedometer = ({ position = 50 }) => {
  const angle = (position / 100) * 180 - 90;
  
  const needleX = 150 + 100 * Math.cos((angle - 90) * Math.PI / 180);
  const needleY = 150 + 100 * Math.sin((angle - 90) * Math.PI / 180);

  return (
    <svg viewBox="0 0 300 170" width="300" height="170">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EF4444"/>
          <stop offset="25%" stopColor="#F59E0B"/>
          <stop offset="50%" stopColor="#10B981"/>
          <stop offset="75%" stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#EF4444"/>
        </linearGradient>
      </defs>
      <path
        d="M 20 150 A 130 130 0 0 1 280 150"
        fill="none"
        stroke="url(#gaugeGrad)"
        strokeWidth="25"
        strokeLinecap="round"
      />
      <line
        x1="150"
        y1="150"
        x2={needleX}
        y2={needleY}
        stroke="#1F2937"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ transition: 'x2 1s ease, y2 1s ease' }}
      />
      <circle cx="150" cy="150" r="8" fill="#1F2937" />
      <text x="10" y="168" fontSize="10" fill="#6B7280" fontWeight="700">Too Low</text>
      <text x="55" y="130" fontSize="10" fill="#6B7280" fontWeight="700">Low</text>
      <text x="138" y="115" fontSize="10" fill="#6B7280" fontWeight="700">Fair</text>
      <text x="210" y="130" fontSize="10" fill="#6B7280" fontWeight="700">High</text>
      <text x="240" y="168" fontSize="10" fill="#6B7280" fontWeight="700">Too High</text>
    </svg>
  );
};

const verdictConfig = {
  too_low: {
    color: '#EF4444',
    bg: '#FEE2E2',
    icon: '⬇️',
    text: 'Too Low',
    advice: 'Consider raising your price'
  },
  low: {
    color: '#F59E0B',
    bg: '#FEF3C7',
    icon: '↙️',
    text: 'Below Market',
    advice: 'Price is slightly below market'
  },
  fair: {
    color: '#10B981',
    bg: '#D1FAE5',
    icon: '✅',
    text: 'Fair Price',
    advice: 'Great price for this market'
  },
  high: {
    color: '#F59E0B',
    bg: '#FEF3C7',
    icon: '↗️',
    text: 'Above Market',
    advice: 'Price is slightly above market'
  },
  too_high: {
    color: '#EF4444',
    bg: '#FEE2E2',
    icon: '⬆️',
    text: 'Too High',
    advice: 'Consider reducing your price'
  }
};

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

interface SortablePhotoSlotProps {
  slot: { id: string, order: number, url: string | null };
  index: number;
  onUpload: (file: File, index: number) => void;
  onRemove: (index: number) => void;
}

const SortablePhotoSlot: React.FC<SortablePhotoSlotProps> = ({ 
  slot, index, onUpload, onRemove 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleClick = () => {
    if (!slot.url) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) onUpload(file, index);
      };
      input.click();
    }
  };

  const isMain = index === 0;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`relative aspect-[4/3] rounded-xl overflow-hidden group border-2 transition-all ${
        slot.url ? 'border-[#004F31]' : 'border-dashed border-gray-200 bg-gray-50'
      } cursor-pointer`}
      onClick={handleClick}
    >
      {/* Number Badge */}
      <div className="absolute top-[6px] left-[6px] bg-black/50 text-white rounded-[4px] px-[6px] py-[2px] text-[11px] font-bold z-10" style={{ background: isMain ? '#004F31' : 'rgba(0,0,0,0.5)' }}>
        {isMain ? 'MAIN' : index + 1}
      </div>

      {slot.url ? (
        <>
          <img src={slot.url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover select-none" />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-grab active:cursor-grabbing photo-overlay z-10">
            <div className="flex flex-col items-center gap-1">
              <span className="text-white text-[12px]">⠿ Drag to reorder</span>
            </div>

            {/* Remove Button */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="absolute top-[6px] right-[6px] w-[24px] h-[24px] bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors flex items-center justify-center shadow-lg"
            >
              ✕
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
          <Camera size={28} />
          <span className="text-[12px] font-medium uppercase">Add Photo</span>
        </div>
      )}
      
      {/* Draggable listeners only when URL exists */}
      {slot.url && (
        <div 
          {...attributes}
          {...listeners}
          className="absolute inset-0 z-0"
        />
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
  const [isTranslating, setIsTranslating] = useState<string | null>(null);

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
      setImportProgress("🤖 Gemini is thinking...");
      const extracted = await extractPropertyDetails(pastedText);
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
    if (data.land_area) newFormData.land_area = data.land_area;
    if (data.floor_area) newFormData.floor_area = data.floor_area;
    if (data.property_description) newFormData.description = data.property_description;

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
    rooms: initialData?.rooms || 0,
    bathrooms: initialData?.bathrooms || 0,
    description: initialData?.property_description || '',
    status: initialData?.status || 'active',
    price_on_request: initialData?.price_on_request || false,
  });

  const [images, setImages] = useState<{ id: string, order: number, url: string | null, file: File | null }[]>(
    Array(12).fill(null).map((_, i) => ({
      id: `slot-${i + 1}`,
      order: i + 1,
      url: initialData?.images?.[i] || null,
      file: null
    }))
  );

  const [calculating, setCalculating] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);

  const calculateMarketValue = async () => {
    if (!formData.district || !formData.property_category || !formData.price_lkr) return;
    
    setCalculating(true);
    try {
      const result = await getMarketAnalysis(formData);
      if (result) setMarketData(result);
    } catch (err) {
      console.error('Calculation failed:', err);
      toast.error('Market analysis failed');
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (formData.district && formData.property_category && formData.price_lkr && parseFloat(formData.price_lkr.toString()) > 0) {
      const timer = setTimeout(() => {
        calculateMarketValue();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [
    formData.district,
    formData.property_category,
    formData.price_lkr,
    formData.rooms,
    formData.land_area,
    formData.floor_area
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages(prev => {
      const oldIndex = prev.findIndex(img => img.id === active.id);
      const newIndex = prev.findIndex(img => img.id === over.id);
      
      const reordered = arrayMove(prev, oldIndex, newIndex);
      
      return reordered.map((img: { id: string, order: number, url: string | null, file: File | null }, idx: number) => ({
        ...img,
        order: idx + 1
      }));
    });
    toast.success('Photos reordered');
  };

  const handleUpload = async (file: File, slotIndex: number) => {
    const position = slotIndex + 1;
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const newName = `${position}.${ext}`;
    
    // Create renamed file
    const renamedFile = new File([file], newName, { type: file.type });
    
    // Show preview
    const previewUrl = URL.createObjectURL(file);
    
    setImages(prev => prev.map((img, idx) => 
      idx === slotIndex ? { ...img, url: previewUrl, file: renamedFile } : img
    ));

    // Upload to Supabase if editing
    if (initialData?.id) {
      const path = `properties/${initialData.id}/${newName}`;
      try {
        setImageUploadProgress(50);
        await supabase.storage
          .from('property-images')
          .upload(path, renamedFile, { upsert: true });
        setImageUploadProgress(100);
        setTimeout(() => setImageUploadProgress(null), 1000);
        toast.success(`Photo ${position} uploaded`);
      } catch (error) {
        console.error("Upload error:", error);
        setImageUploadProgress(null);
        toast.error("Failed to upload to storage");
      }
    } else {
      toast.success(`Photo added to slot ${position}`);
    }
  };

  const handleRemove = (slotIndex: number) => {
    setImages(prev => prev.map((img, idx) => 
      idx === slotIndex ? { ...img, url: null, file: null } : img
    ));
    toast.success('Photo removed');
  };

  const photoCount = images.filter(img => img.url !== null).length;

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
        rooms: parseInt(formData.rooms.toString()),
        bathrooms: parseInt(formData.bathrooms.toString()),
        property_description: formData.description,
        status: formData.status,
        images: images.map(img => img.url).filter(url => url !== null),
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-2xl font-black text-[#004F31] tracking-tight">Property Images</h3>
              <p className="text-sm font-bold text-gray-400 mt-1">Drag to reorder. First image = main photo. Maximum 12 photos.</p>
            </motion.div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{photoCount} / 12 photos</span>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
              <SortableContext 
                items={images.map(img => img.id)}
                strategy={rectSortingStrategy}
              >
                {images.map((slot, index) => (
                  <SortablePhotoSlot 
                    key={slot.id} 
                    slot={slot} 
                    index={index}
                    onUpload={handleUpload}
                    onRemove={handleRemove}
                  />
                ))}
              </SortableContext>
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

        {/* MARKET PRICE ANALYSIS SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-admin-border space-y-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <h3 className="text-2xl font-black text-[#004F31] tracking-tight">Market Price Analysis</h3>
              </div>
              <p className="text-sm font-bold text-gray-400 mt-1">See how your price compares to current market value.</p>
            </div>
            {marketData && (
              <button 
                onClick={calculateMarketValue}
                disabled={calculating}
                className="flex items-center gap-2 px-4 py-2 bg-[#F0F4F0] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#004F31] hover:bg-white transition-all shadow-sm"
              >
                <RotateCcw size={14} className={calculating ? 'animate-spin' : ''} />
                Recalculate
              </button>
            )}
          </div>

          {!formData.district || !formData.property_category || !formData.price_lkr ? (
            <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
              <p className="text-sm font-medium text-gray-400 italic">Fill in property type, location and price above to see market analysis</p>
            </div>
          ) : calculating ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 size={40} className="text-[#004F31] animate-spin" />
              <p className="text-xs font-black text-[#004F31] uppercase tracking-widest animate-pulse">Analyzing market data...</p>
            </div>
          ) : marketData ? (
            <div className="space-y-10">
              <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-3xl relative overflow-hidden">
                <div className="text-center mb-4">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Market Position</p>
                </div>
                <Speedometer position={marketData.gauge_position} />
                <div className="mt-4 text-center">
                  <span 
                    className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm"
                    style={{ 
                      backgroundColor: verdictConfig[marketData.rating as keyof typeof verdictConfig]?.bg || '#F3F4F6',
                      color: verdictConfig[marketData.rating as keyof typeof verdictConfig]?.color || '#6B7280'
                    }}
                  >
                    {verdictConfig[marketData.rating as keyof typeof verdictConfig]?.icon} {verdictConfig[marketData.rating as keyof typeof verdictConfig]?.text}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Market Range</p>
                  <p className="text-sm font-black text-[#004F31]">Rs. {(marketData.market_min / 1000000).toFixed(1)}M - {(marketData.market_max / 1000000).toFixed(1)}M</p>
                  <p className="text-[9px] font-bold text-gray-400 mt-1">Similar properties</p>
                </div>
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Price</p>
                  <p className="text-sm font-black" style={{ color: verdictConfig[marketData.rating as keyof typeof verdictConfig]?.color }}>
                    Rs. {parseInt(formData.price_lkr.toString()).toLocaleString()}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 mt-1">Listing price</p>
                </div>
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Verdict</p>
                  <p className="text-sm font-black text-gray-800">{marketData.verdict}</p>
                  <p className="text-[9px] font-bold text-gray-400 mt-1">AI Recommendation</p>
                </div>
              </div>

              <div className="p-6 bg-[#D1FAE5] rounded-2xl flex items-start gap-4">
                <span className="text-xl">💡</span>
                <p className="text-sm font-medium text-[#004F31] leading-relaxed">
                  {marketData.advice}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
               <button onClick={calculateMarketValue} className="px-8 py-3 bg-[#004F31] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Start Analysis</button>
            </div>
          )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Land Area (Perches)</label>
              <input type="text" value={formData.land_area} onChange={e => setFormData({...formData, land_area: e.target.value})} placeholder="Ex: 20" className="w-full bg-[#F0F4F0] rounded-xl p-4 text-sm font-bold outline-none" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Floor Area (Sqft)</label>
              <input type="text" value={formData.floor_area} onChange={e => setFormData({...formData, floor_area: e.target.value})} placeholder="Ex: 2,500" className="w-full bg-[#F0F4F0] rounded-xl p-4 text-sm font-bold outline-none" />
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
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      if (!formData.description) return;
                      setIsTranslating('sinhala');
                      const trans = await translateDescription(formData.description, 'sinhala');
                      if (trans) setFormData({ ...formData, description: formData.description + "\n\n(Sinhala Translation):\n" + trans });
                      setIsTranslating(null);
                    }}
                    disabled={!!isTranslating}
                    className="flex items-center gap-1.5 px-3 py-1 bg-brand-green/5 text-brand-green text-[10px] font-black uppercase rounded-lg hover:bg-brand-green hover:text-white transition-all disabled:opacity-50"
                  >
                    {isTranslating === 'sinhala' ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                    To Sinhala
                  </button>
                  <button 
                    onClick={async () => {
                      if (!formData.description) return;
                      setIsTranslating('tamil');
                      const trans = await translateDescription(formData.description, 'tamil');
                      if (trans) setFormData({ ...formData, description: formData.description + "\n\n(Tamil Translation):\n" + trans });
                      setIsTranslating(null);
                    }}
                    disabled={!!isTranslating}
                    className="flex items-center gap-1.5 px-3 py-1 bg-brand-green/5 text-brand-green text-[10px] font-black uppercase rounded-lg hover:bg-brand-green hover:text-white transition-all disabled:opacity-50"
                  >
                    {isTranslating === 'tamil' ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                    To Tamil
                  </button>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">{formData.description.length} chars</span>
              </div>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Ex: This stunning 3 bedroom apartment offers panoramic city views..."
                className="w-full bg-[#F0F4F0] border-transparent focus:bg-white focus:border-[#004F31]/20 rounded-2xl p-6 text-sm font-medium min-h-[220px] outline-none transition-all resize-none"
              />
            </div>
          </div>
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
            </div>
          </div>
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
