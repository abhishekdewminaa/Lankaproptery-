import React, { useState, useRef, useEffect } from 'react';
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
  GripVertical
} from 'lucide-react';
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
import { GoogleGenAI, Type } from '@google/genai';
import { supabase } from '../../supabaseClient';

interface Property {
  id?: string;
  title: string;
  price: string;
  price_lkr?: number;
  district?: string;
  city?: string;
  propertyType?: string;
  listingType?: string;
  landArea?: string;
  floorArea?: string;
  floors?: number | string;
  rooms?: number | string;
  bathrooms?: number | string;
  description?: string;
  additionalInfo?: string;
  isNegotiable?: boolean;
  contacts?: { type: 'Mobile' | 'Landline', number: string }[];
  images?: string[];
  locationLink?: string;
}

interface AdminListingFormProps {
  user: any;
  initialData?: Property;
  onBack: () => void;
  onRefresh?: () => void;
  onSuccess: (property: any) => void;
}

const DISTRICTS = ["Colombo", "Kandy", "Galle", "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];

interface SortableImageItemProps {
  image: { id: string; url: string };
  onRemove: (id: string) => void;
}

function SortableImageItem({ image, onRemove }: SortableImageItemProps) {
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
    zIndex: isDragging ? 50 : 0
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative aspect-video rounded-2xl overflow-hidden group border border-admin-border shadow-sm h-full ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <img src={image.url} alt="Property" className="w-full h-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
         <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white/50 hover:text-white">
            <GripVertical size={16} />
         </div>
         <button 
           onClick={() => onRemove(image.id)}
           className="w-8 h-8 rounded-lg bg-admin-accent text-white flex items-center justify-center hover:bg-red-700 transition-colors"
         >
           <Trash2 size={14} />
         </button>
      </div>
    </div>
  );
}

export default function AdminListingForm({ user, initialData, onBack, onRefresh, onSuccess }: AdminListingFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Property>({
    title: initialData?.title || "",
    price: initialData?.price?.toString().replace(/[^0-9]/g, '') || "",
    district: initialData?.district || "Colombo",
    city: initialData?.city || "",
    propertyType: initialData?.propertyType || "Apartment",
    listingType: initialData?.listingType || "For Sale",
    landArea: initialData?.landArea || "",
    floorArea: initialData?.floorArea || "",
    floors: initialData?.floors?.toString() || "0",
    rooms: initialData?.rooms?.toString() || "0",
    bathrooms: initialData?.bathrooms?.toString() || "0",
    description: initialData?.description || "",
    additionalInfo: initialData?.additionalInfo || "",
    isNegotiable: initialData?.isNegotiable || false,
    contacts: initialData?.contacts || [{ type: 'Mobile', number: "" }],
    locationLink: initialData?.locationLink || "",
  });

  const [images, setImages] = useState<{ id: string, url: string }[]>(
    initialData?.images?.map(url => ({ id: Math.random().toString(36).substr(2, 9), url })) || []
  );

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
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract property details from the following text into JSON. 
        Listing type: "For Sale" or "For Rent". Property type: "Apartment", "House", "Land", "Commercial".
        Text: ${pastedText}`,
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

      const data = JSON.parse(result.text || "{}");
      setFormData(prev => ({ ...prev, ...data }));
      setShowAIModal(false);
      setPastedText("");
    } catch (error) {
      console.error("AI Extraction failed:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 12 - images.length;
    const filesToProcess = files.slice(0, remaining);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setImages(prev => [...prev, { id, url: reader.result as string }].slice(0, 12));
      };
      reader.readAsDataURL(file as unknown as Blob);
    });
    e.target.value = '';
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const priceVal = parseInt(formData.price) || 0;
      const listingData = {
        listing_title: formData.title,
        price_lkr: priceVal,
        usd_estimate: priceVal / 310,
        eur_estimate: priceVal / 335,
        district: formData.district,
        city: formData.city,
        property_category: formData.propertyType,
        listing_type: formData.listingType,
        land_area: formData.landArea,
        floor_area: formData.floorArea,
        floors: parseInt(formData.floors?.toString() || '0'),
        rooms: parseInt(formData.rooms?.toString() || '0'),
        bathrooms: parseInt(formData.bathrooms?.toString() || '0'),
        property_description: formData.description,
        additional_info: formData.additionalInfo,
        mobile: formData.contacts?.[0]?.number || '',
        landline: formData.contacts?.[1]?.number || '',
        is_negotiable: formData.isNegotiable,
        images: images.map(img => img.url),
        google_maps_link: formData.locationLink,
        agent_id: user?.email || 'ADMIN',
        status: 'active',
        package_tier: 'Admin',
        published_by: 'admin'
      };

      const { data, error } = initialData?.id 
        ? await supabase.from('properties').update(listingData).eq('id', initialData.id).select().single()
        : await supabase.from('properties').insert([listingData]).select().single();

      if (error) throw error;
      onRefresh?.();
      onSuccess(data);
    } catch (error: any) {
      console.error("Publish error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Step Indicator */}
      <div className="bg-white p-8 rounded-[32px] border border-admin-border shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="w-12 h-12 bg-admin-bg rounded-2xl flex items-center justify-center text-admin-text-dark hover:bg-admin-primary hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
               <h2 className="text-2xl font-black text-admin-text-dark">
                 {step === 1 ? 'Property Details' : 'Property Media'}
               </h2>
               <p className="text-xs font-bold text-admin-text-gray uppercase tracking-widest mt-1">
                 Step {step} of 2
               </p>
            </div>
         </div>
         <div className="flex gap-2">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-admin-primary' : 'bg-admin-bg'}`} />
            ))}
         </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* AI Import Bar */}
            <div className="bg-admin-primary p-6 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl shadow-admin-primary/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
               <div className="flex items-center gap-4 relative z-10">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-admin-gold">
                   <Sparkles size={24} />
                 </div>
                 <div>
                    <h4 className="font-black text-lg">Quick AI Import</h4>
                    <p className="text-white/70 text-xs font-medium">Extract property data from any description instantly.</p>
                 </div>
               </div>
               <button 
                 onClick={() => setShowAIModal(true)}
                 className="bg-white text-admin-primary px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-admin-bg transition-colors relative z-10"
               >
                 Paste Description <ArrowRight size={14} className="inline ml-2" />
               </button>
            </div>

            {/* Form Sections */}
            <div className="grid grid-cols-1 gap-8">
               {/* Section 1: Basic Info */}
               <div className="bg-white p-8 rounded-[40px] border border-admin-border shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-lg bg-admin-bg text-admin-primary flex items-center justify-center text-xs font-black">01</span>
                     <h3 className="text-xl font-black text-admin-text-dark">Core Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">Listing Title</label>
                        <input 
                          type="text" 
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          placeholder="e.g. Modern Luxury Villa in Rajagiriya"
                          className="w-full bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 focus:ring-4 focus:ring-admin-primary/5 rounded-2xl p-4 text-sm font-bold transition-all outline-none"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">Property Type</label>
                          <select 
                            value={formData.propertyType}
                            onChange={e => setFormData({...formData, propertyType: e.target.value})}
                            className="w-full bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 rounded-2xl p-4 text-sm font-bold outline-none appearance-none"
                          >
                             {["Apartment", "House", "Land", "Commercial"].map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">Listing Mode</label>
                          <select 
                            value={formData.listingType}
                            onChange={e => setFormData({...formData, listingType: e.target.value})}
                            className="w-full bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 rounded-2xl p-4 text-sm font-bold outline-none appearance-none"
                          >
                             {["For Sale", "For Rent"].map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Section 2: Pricing & Location */}
               <div className="bg-white p-8 rounded-[40px] border border-admin-border shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-lg bg-admin-bg text-admin-primary flex items-center justify-center text-xs font-black">02</span>
                     <h3 className="text-xl font-black text-admin-text-dark">Pricing & Location</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">Price (Rs.)</label>
                        <div className="relative">
                           <input 
                              type="text" 
                              value={formData.price}
                              onChange={e => setFormData({...formData, price: e.target.value.replace(/[^0-9]/g, '')})}
                              placeholder="Price"
                              className="w-full bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 rounded-2xl p-4 pl-12 text-lg font-black outline-none"
                           />
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-gray font-bold text-xs uppercase">Rs</div>
                        </div>
                        <button 
                          onClick={() => setFormData({...formData, isNegotiable: !formData.isNegotiable})}
                          className={`flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors ${formData.isNegotiable ? 'bg-admin-secondary/10 text-admin-secondary' : 'bg-gray-100 text-gray-400'}`}
                        >
                           <div className={`w-1.5 h-1.5 rounded-full ${formData.isNegotiable ? 'bg-admin-secondary' : 'bg-gray-400'}`} />
                           Negotiable Price
                        </button>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">District</label>
                        <select 
                           value={formData.district}
                           onChange={e => setFormData({...formData, district: e.target.value})}
                           className="w-full bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 rounded-2xl p-4 text-sm font-bold outline-none appearance-none"
                        >
                           {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">City / Suburb</label>
                        <input 
                           type="text" 
                           value={formData.city}
                           onChange={e => setFormData({...formData, city: e.target.value})}
                           placeholder="e.g. Nugegoda"
                           className="w-full bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 rounded-2xl p-4 text-sm font-bold outline-none"
                        />
                     </div>
                  </div>
               </div>

               {/* Section 3: Specifications */}
               <div className="bg-white p-8 rounded-[40px] border border-admin-border shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-lg bg-admin-bg text-admin-primary flex items-center justify-center text-xs font-black">03</span>
                     <h3 className="text-xl font-black text-admin-text-dark">Property Specifications</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">Land Area</label>
                        <input type="text" value={formData.landArea} onChange={e => setFormData({...formData, landArea: e.target.value})} placeholder="Pe" className="form-input-admin" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">Floor Area</label>
                        <input type="text" value={formData.floorArea} onChange={e => setFormData({...formData, floorArea: e.target.value})} placeholder="Sq.Ft" className="form-input-admin" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">Rooms</label>
                        <input type="number" value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} className="form-input-admin" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">Baths</label>
                        <input type="number" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} className="form-input-admin" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">Floors</label>
                        <input type="number" value={formData.floors} onChange={e => setFormData({...formData, floors: e.target.value})} className="form-input-admin" />
                     </div>
                  </div>
               </div>

               {/* Section 4: Narration */}
               <div className="bg-white p-8 rounded-[40px] border border-admin-border shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-lg bg-admin-bg text-admin-primary flex items-center justify-center text-xs font-black">04</span>
                     <h3 className="text-xl font-black text-admin-text-dark">Description & Info</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">Listing Description</label>
                        <textarea 
                           value={formData.description}
                           onChange={e => setFormData({...formData, description: e.target.value})}
                           placeholder="Type detailed property overview..."
                           className="w-full bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 rounded-[32px] p-6 text-sm font-medium min-h-[160px] outline-none transition-all resize-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest ml-1">Google Maps Link</label>
                        <div className="relative">
                           <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                           <input 
                              type="url" 
                              value={formData.locationLink}
                              onChange={e => setFormData({...formData, locationLink: e.target.value})}
                              placeholder="Paste share link from Google Maps..."
                              className="w-full bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 rounded-[20px] p-4 pl-14 text-sm font-bold outline-none"
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bottom Bar Footer */}
            <div className="bg-white p-6 rounded-[32px] border border-admin-border shadow-2xl flex justify-between items-center sticky bottom-8 z-20">
               <button 
                 onClick={onBack}
                 className="px-6 py-3 text-admin-text-gray font-black text-xs uppercase tracking-widest hover:text-admin-text-dark transition-colors"
               >
                 Back to Dashboard
               </button>
               <button 
                 onClick={() => setStep(2)}
                 className="bg-admin-primary text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(0,79,49,0.2)] hover:bg-admin-secondary transition-all flex items-center gap-3 group"
               >
                 Continue to Media
                 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="bg-white p-10 rounded-[40px] border border-admin-border shadow-sm space-y-10">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="text-2xl font-black text-admin-text-dark">Upload Property Media</h3>
                    <p className="text-admin-text-gray font-bold mt-1 uppercase tracking-widest text-[10px]">Manager limit: up to 12 professional photos</p>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-admin-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-admin-secondary transition-all flex items-center gap-2"
                  >
                    <Plus size={18} /> Add Photos
                  </button>
               </div>

               <div className="bg-admin-bg p-6 rounded-[32px] border-2 border-dashed border-admin-border/50">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      <SortableContext 
                        items={images.map(img => img.id)}
                        strategy={rectSortingStrategy}
                      >
                        {images.map((img) => (
                          <SortableImageItem 
                            key={img.id} 
                            image={img} 
                            onRemove={(id) => setImages(prev => prev.filter(i => i.id !== id))} 
                          />
                        ))}
                      </SortableContext>
                      
                      {Array.from({ length: Math.max(0, 12 - images.length) }).map((_, idx) => (
                        <div 
                          key={`empty-${idx}`} 
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-video bg-white/50 border border-admin-border rounded-2xl flex flex-col items-center justify-center text-gray-300 hover:border-admin-primary hover:text-admin-primary transition-all cursor-pointer group"
                        >
                          <Camera size={32} className="group-hover:scale-110 transition-transform mb-2" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Available Slot</span>
                        </div>
                      ))}
                    </div>
                  </DndContext>
               </div>

               <div className="p-6 bg-admin-bg rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-admin-gold shrink-0">
                    <Info size={20} />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-admin-text-dark mb-1 uppercase tracking-widest">Media Tips</h5>
                    <p className="text-xs text-admin-text-gray font-medium leading-relaxed">
                      Upload high-resolution landscape photos (16:9) for better conversion. The first photo will be used as the listing thumbnail. You can drag and drop photos to reorder them.
                    </p>
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-admin-border shadow-2xl flex justify-between items-center sticky bottom-8 z-20">
               <button 
                 onClick={() => setStep(1)}
                 className="px-6 py-3 text-admin-text-gray font-black text-xs uppercase tracking-widest hover:text-admin-text-dark transition-colors"
               >
                 Back to Details
               </button>
               <button 
                 onClick={handlePublish}
                 disabled={loading || images.length === 0}
                 className="bg-admin-primary text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(0,79,49,0.2)] hover:bg-admin-secondary transition-all flex items-center gap-3 group disabled:opacity-50"
               >
                 {loading ? <Loader2 className="animate-spin" size={18} /> : (initialData?.id ? 'Update Listing' : 'Publish Listing')}
                 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple accept="image/*" className="hidden" />

      {/* AI Modal */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 px-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAIModal(false)}
               className="absolute inset-0 bg-admin-text-dark/80 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-admin-border"
             >
                <div className="p-8 border-b border-admin-border flex justify-between items-center">
                   <div>
                      <h3 className="text-2xl font-black text-admin-text-dark">Quick AI Import</h3>
                      <p className="text-xs font-bold text-admin-text-gray uppercase tracking-widest mt-1">Paste your property description</p>
                   </div>
                   <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-admin-bg rounded-xl transition-all">
                      <X size={24} className="text-admin-text-gray" />
                   </button>
                </div>
                <div className="p-8 space-y-6">
                   <textarea 
                     value={pastedText}
                     onChange={e => setPastedText(e.target.value)}
                     placeholder="Paste any ad text or property overview here..."
                     className="w-full h-80 bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 rounded-[32px] p-6 text-sm font-medium outline-none resize-none transition-all"
                   />
                   <div className="flex gap-4">
                      <button 
                        onClick={() => setShowAIModal(false)}
                        className="flex-1 py-5 rounded-3xl text-admin-text-dark font-black text-xs uppercase tracking-widest hover:bg-admin-bg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAIImport}
                        disabled={isExtracting || !pastedText.trim()}
                        className="flex-[2] bg-admin-primary text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-admin-primary/20 hover:bg-admin-secondary transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isExtracting ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                        {isExtracting ? 'Extracting...' : 'Extract & Fill'}
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .form-input-admin {
          width: 100%;
          background-color: var(--color-admin-bg);
          border: 1px solid transparent;
          border-radius: 1.25rem;
          padding: 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          outline: none;
          transition: all 0.2s;
        }
        .form-input-admin:focus {
          background-color: white;
          border-color: rgba(0, 79, 49, 0.2);
          box-shadow: 0 0 0 4px rgba(0, 79, 49, 0.05);
        }
      `}</style>
    </div>
  );
}
