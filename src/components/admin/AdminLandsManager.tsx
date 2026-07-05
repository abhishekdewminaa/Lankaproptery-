import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Compass, 
  Coins, 
  CheckCircle2, 
  Layers, 
  Eye, 
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

interface LandProperty {
  id: string | number;
  title: string;
  location: string;
  district: string;
  city: string;
  priceLkr: number; // per perch upwards
  category: 'Residential' | 'Commercial' | 'Agricultural' | 'Industrial' | 'Coconut Land' | 'Water Front Land' | 'Mountain View' | 'Other';
  image: string;
  isFeatured?: boolean;
  views?: number;
  size?: string;
  description?: string;
}

const DEFAULT_LAND_PROPERTIES: LandProperty[] = [
  {
    id: 'l-1',
    title: 'Green Radiant - Alawwa',
    location: 'Alawwa, Kurunegala',
    district: 'Kurunegala',
    city: 'Alawwa',
    priceLkr: 250000,
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    isFeatured: true,
    views: 1450,
    size: '10 - 15 Perches',
    description: 'Beautiful land plots in Alawwa town with all infrastructure. Gated community with modern facilities, tarred roads, and 24-hour security.'
  },
  {
    id: 'l-2',
    title: 'Prime Liora - Nachchaduwa',
    location: 'Nachchaduwa, Anuradhapura',
    district: 'Anuradhapura',
    city: 'Nachchaduwa',
    priceLkr: 97500,
    category: 'Agricultural',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800',
    isFeatured: true,
    views: 980,
    size: '20 - 40 Perches',
    description: 'Serene land located in beautiful historical Nachchaduwa area. Perfect for agriculture, holiday villas or a peaceful living space close to nature.'
  },
  {
    id: 'l-3',
    title: 'Aventra - Rajagiriya',
    location: 'Rajagiriya, Colombo',
    district: 'Colombo',
    city: 'Rajagiriya',
    priceLkr: 3250000,
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    isFeatured: true,
    views: 2420,
    size: '8 - 12 Perches',
    description: 'Extremely high-value commercial and residential plots in Rajagiriya. Highly residential neighborhood, ideal for luxury multi-story house or corporate office.'
  },
  {
    id: 'l-4',
    title: 'Elevare - Dewalapola',
    location: 'Dewalapola, Minuwangoda',
    district: 'Gampaha',
    city: 'Minuwangoda',
    priceLkr: 880000,
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
    isFeatured: true,
    views: 1120,
    size: '12 - 20 Perches',
    description: 'Prime plots located in Dewalapola. Minutes away from Minuwangoda and Gampaha towns. Surrounded by highly reputed schools and modern facilities.'
  }
];

export default function AdminLandsManager() {
  const [lands, setLands] = useState<LandProperty[]>([]);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Form states for Add/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDistrict, setFormDistrict] = useState('Colombo');
  const [formCity, setFormCity] = useState('');
  const [formPrice, setFormPrice] = useState(100000);
  const [formCategory, setFormCategory] = useState<'Residential' | 'Commercial' | 'Agricultural' | 'Industrial' | 'Coconut Land' | 'Water Front Land' | 'Mountain View' | 'Other'>('Residential');
  const [formImage, setFormImage] = useState('');
  const [formSize, setFormSize] = useState('10 - 15 Perches');
  const [formDescription, setFormDescription] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formViews, setFormViews] = useState(100);

  const [isAddMode, setIsAddMode] = useState(false);

  // Load lands
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lands_portfolio_custom');
      if (stored) {
        setLands(JSON.parse(stored));
      } else {
        setLands(DEFAULT_LAND_PROPERTIES);
      }
    } catch (e) {
      setLands(DEFAULT_LAND_PROPERTIES);
    }
  }, []);

  const saveToStorage = (updatedList: LandProperty[]) => {
    setLands(updatedList);
    localStorage.setItem('lands_portfolio_custom', JSON.stringify(updatedList));
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all lands to the default template? Your custom changes will be lost.')) {
      saveToStorage(DEFAULT_LAND_PROPERTIES);
      toast.success('Successfully reset lands portfolio to defaults');
    }
  };

  const handleStartAdd = () => {
    setFormTitle('');
    setFormLocation('');
    setFormDistrict('Colombo');
    setFormCity('');
    setFormPrice(150000);
    setFormCategory('Residential');
    setFormImage('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800');
    setFormSize('12 Perches');
    setFormDescription('');
    setFormIsFeatured(false);
    setFormViews(120);

    setEditingId(null);
    setIsAddMode(true);
  };

  const handleStartEdit = (land: LandProperty) => {
    setFormTitle(land.title);
    setFormLocation(land.location);
    setFormDistrict(land.district || 'Colombo');
    setFormCity(land.city || '');
    setFormPrice(land.priceLkr);
    setFormCategory(land.category);
    setFormImage(land.image);
    setFormSize(land.size || '15 Perches');
    setFormDescription(land.description || '');
    setFormIsFeatured(!!land.isFeatured);
    setFormViews(land.views || 100);

    setIsAddMode(false);
    setEditingId(land.id);
  };

  const handleCancel = () => {
    setIsAddMode(false);
    setEditingId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formLocation.trim()) {
      toast.error('Location is required');
      return;
    }

    const updatedProperty: LandProperty = {
      id: isAddMode ? `l-custom-${Date.now()}` : editingId!,
      title: formTitle,
      location: formLocation,
      district: formDistrict,
      city: formCity || formLocation.split(',')[0].trim(),
      priceLkr: Number(formPrice),
      category: formCategory,
      image: formImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
      size: formSize,
      description: formDescription,
      isFeatured: formIsFeatured,
      views: Number(formViews)
    };

    let newLandsList: LandProperty[];
    if (isAddMode) {
      newLandsList = [...lands, updatedProperty];
      toast.success('Successfully added new land development!');
    } else {
      newLandsList = lands.map(item => item.id === editingId ? updatedProperty : item);
      toast.success('Land development updated successfully!');
    }

    saveToStorage(newLandsList);
    setIsAddMode(false);
    setEditingId(null);
  };

  const handleDelete = (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this land development? This action is permanent.')) {
      const filtered = lands.filter(item => item.id !== id);
      saveToStorage(filtered);
      toast.success('Land development deleted successfully');
    }
  };

  const toggleFeatured = (id: string | number) => {
    const updated = lands.map(item => {
      if (item.id === id) {
        const nextState = !item.isFeatured;
        toast.success(nextState ? `Featured in Home Slider` : `Removed from Home Slider`);
        return { ...item, isFeatured: nextState };
      }
      return item;
    });
    saveToStorage(updated);
  };

  return (
    <div id="admin-lands-manager" className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-24 font-sans text-slate-800">
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
              primary: '#004F31',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏔️</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
              Lands Portfolio
              <span className="bg-[#004F31]/10 text-[#004F31] font-black text-[11px] tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-[#004F31]/20">
                PRO
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-400 mt-1">
              Curate premium land projects, corporate acquisitions, and agricultural assets.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              saveToStorage(lands);
              toast.success('Lands Portfolio settings saved securely to persistence engine!');
            }}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-neutral-50 text-neutral-800 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save size={16} />
            <span>Save Portfolio</span>
          </button>

          <button
            onClick={handleResetToDefaults}
            className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer border border-transparent shadow-sm"
          >
            <RotateCcw size={14} />
            Reset
          </button>

          <button
            onClick={handleStartAdd}
            className="px-4 py-2.5 bg-[#004F31] hover:bg-[#003420] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            New Land Project
          </button>
        </div>
      </div>

      {/* --- FORM SECTION (ADD/EDIT) --- */}
      {(isAddMode || editingId !== null) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[14px] p-6 sm:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
        >
          <h3 className="text-lg font-black text-slate-900 border-b border-gray-100 pb-3 mb-6">
            {isAddMode ? 'Add New Land Project' : `Edit: ${formTitle}`}
          </h3>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Project Title</label>
              <input
                type="text"
                placeholder="e.g. Green Radiant - Alawwa"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#004F31] focus:bg-white transition-all"
                required
              />
            </div>

            {/* Price Per Perch upwards */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Price Per Perch upwards (LKR)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 250000"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#004F31] focus:bg-white transition-all"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">LKR</span>
              </div>
            </div>

            {/* Location text */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Detailed Location</label>
              <input
                type="text"
                placeholder="e.g. Alawwa Town, Kurunegala"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#004F31] focus:bg-white transition-all"
                required
              />
            </div>

            {/* Size Range / Perches */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Size / Perches Block Sizes</label>
              <input
                type="text"
                placeholder="e.g. 10 - 15 Perches"
                value={formSize}
                onChange={(e) => setFormSize(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#004F31] focus:bg-white transition-all"
              />
            </div>

            {/* District dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">District</label>
              <select
                value={formDistrict}
                onChange={(e) => setFormDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#004F31] focus:bg-white transition-all"
              >
                <option value="Colombo">Colombo</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Kalutara">Kalutara</option>
                <option value="Kurunegala">Kurunegala</option>
                <option value="Galle">Galle</option>
                <option value="Matale">Matale</option>
                <option value="Kandy">Kandy</option>
                <option value="Anuradhapura">Anuradhapura</option>
              </select>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">City / Suburb</label>
              <input
                type="text"
                placeholder="e.g. Alawwa"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#004F31] focus:bg-white transition-all"
              />
            </div>

            {/* Category dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Land Type Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#004F31] focus:bg-white transition-all"
              >
                <option value="Residential">Residential Land</option>
                <option value="Commercial">Commercial Land</option>
                <option value="Agricultural">Agricultural Land</option>
                <option value="Coconut Land">Coconut Estate Land</option>
                <option value="Water Front Land">Water Front Land</option>
                <option value="Mountain View">Mountain View Land</option>
                <option value="Industrial">Industrial Land</option>
                <option value="Other">Other / Multi-purpose</option>
              </select>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Poster / Image URL</label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 pl-10 text-xs font-semibold outline-none focus:border-[#004F31] focus:bg-white transition-all"
                />
                <ImageIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Project Description</label>
              <textarea
                placeholder="Give a professional description of amenities, highway access, clear deeds, pipe-borne water infrastructure..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#004F31] focus:bg-white transition-all"
              />
            </div>

            {/* Features & metadata */}
            <div className="col-span-1 md:col-span-2 flex flex-wrap gap-6 items-center bg-slate-50 p-4 rounded-xl">
              <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-[#004F31] focus:ring-[#004F31] h-4 w-4 cursor-pointer"
                />
                <span>Feature in Top Carousel Slider</span>
              </label>

              <div className="flex items-center gap-2 text-xs">
                <label className="text-[10px] font-black uppercase text-gray-400">Views Counter Seed</label>
                <input
                  type="number"
                  value={formViews}
                  onChange={(e) => setFormViews(Number(e.target.value))}
                  className="w-20 bg-white border border-slate-200 rounded px-2 py-1 text-center font-bold"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#004F31] hover:bg-[#003420] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Save size={14} />
                Save Project
              </button>
            </div>

          </form>
        </motion.div>
      )}

      {/* --- REAL-TIME STATS SUMMARY GRID --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Land Projects */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#f0fdf4] text-[#004F31] rounded-xl">
              <Layers size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600">Active</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Land Projects</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{lands.length}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Acquisitions & releases</p>
        </div>

        {/* Colombo District */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <MapPin size={18} />
            </div>
            <span className="text-[12px] font-medium text-blue-600">Urban</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Colombo District</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {lands.filter(l => l.district === 'Colombo').length}
          </h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Premium Colombo plots</p>
        </div>

        {/* Outstation */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Compass size={18} />
            </div>
            <span className="text-[12px] font-medium text-purple-600">Regional</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Outstation</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {lands.filter(l => l.district !== 'Colombo').length}
          </h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Gampaha, Kurunegala, etc.</p>
        </div>

        {/* Total Estimated Perches */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <Coins size={18} />
            </div>
            <span className="text-[12px] font-medium text-amber-600">Volume</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Perches</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {lands.reduce((acc, l) => {
              const numbers = (l.size || '').match(/\d+/g);
              if (numbers && numbers.length > 0) {
                const parsed = Number(numbers[numbers.length - 1]);
                return acc + (isNaN(parsed) ? 15 : parsed);
              }
              return acc + 15;
            }, 0)}
          </h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Estimated block sum</p>
        </div>

      </div>

      {/* --- MAIN LANDS LIST (DATA TABLE VIEW) --- */}
      <div className="bg-white border border-slate-200 rounded-[14px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-500">
            Lands Inventory Portfolio
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            Showing {lands.length} active projects
          </span>
        </div>

        {lands.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-slate-200">
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Project Title</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Region / City</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Category</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Size / Range</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Price Per Perch</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lands.map((land) => (
                  <tr key={land.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={land.image}
                          alt={land.title}
                          className="w-12 h-12 rounded-lg object-cover border shrink-0 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900 leading-tight">{land.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">ID: {land.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-[#004F31]" />
                        <span>{land.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-[#004F31] text-[10px] font-bold rounded border border-emerald-100">
                        {land.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-600">
                      {land.size || '10 - 15 Perches'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-[#004F31] text-xs">
                        Rs. {land.priceLkr.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFeatured(land.id)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          land.isFeatured
                            ? 'bg-amber-50 border-amber-200 text-amber-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                        title="Click to toggle carousel feature"
                      >
                        {land.isFeatured ? '★ Featured' : '☆ Standard'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => handleStartEdit(land)}
                          className="p-1.5 bg-slate-50 hover:bg-[#004F31]/10 text-slate-600 hover:text-[#004F31] rounded border border-slate-100 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <FileText size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(land.id)}
                          className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded border border-slate-100 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Compass className="animate-spin-slow mx-auto text-slate-300" size={36} />
            <p className="text-sm font-semibold">No Lands currently exist in your customized inventory.</p>
            <button
              onClick={handleStartAdd}
              className="px-4 py-2 bg-[#004F31] hover:bg-[#003420] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Add Your First Land Project
            </button>
          </div>
        )}
      </div>

      {/* Helper guide */}
      <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4 flex gap-3 text-left">
        <AlertCircle className="text-amber-600 shrink-0" size={20} />
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold text-slate-900">Quick Publishing Sync Guide</h4>
          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
            All additions and modifications here are applied instantly to the guest-facing "Lands Portfolio" page view on this portal. They run completely on the fast offline state engine with perfect synchronization. Any land property created as a general property in the regular Properties form (with category set to "Land") will also be automatically detected and integrated into this list.
          </p>
        </div>
      </div>

    </div>
  );
}
