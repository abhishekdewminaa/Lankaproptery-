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
    <div id="admin-lands-manager" className="p-6 space-y-6 text-left text-neutral-800 dark:text-neutral-100">
      <Toaster position="bottom-center" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-[#1B5E20] flex items-center gap-2">
            <Compass className="text-[#1B5E20]" size={28} />
            Lands Portfolio Manager
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
            Update and curate the official "Lands Portfolio" page slider, pricing, and project details
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleResetToDefaults}
            className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 border border-transparent hover:border-red-100"
          >
            <RotateCcw size={14} />
            Reset to Defaults
          </button>

          <button
            onClick={handleStartAdd}
            className="px-4 py-2 bg-[#1B5E20] hover:bg-[#124115] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#1B5E20]/10"
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
          className="bg-white dark:bg-neutral-900 border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-xl"
        >
          <h3 className="text-lg font-black text-[#1B5E20] border-b border-gray-100 dark:border-neutral-800 pb-3 mb-6">
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
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B5E20]"
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
                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B5E20]"
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
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B5E20]"
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
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B5E20]"
              />
            </div>

            {/* District dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">District</label>
              <select
                value={formDistrict}
                onChange={(e) => setFormDistrict(e.target.value)}
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B5E20]"
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
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B5E20]"
              />
            </div>

            {/* Category dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Land Type Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B5E20]"
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
                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl px-4 py-2.5 pl-10 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B5E20]"
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
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B5E20]"
              />
            </div>

            {/* Features & metadata */}
            <div className="col-span-1 md:col-span-2 flex flex-wrap gap-6 items-center bg-gray-50 dark:bg-neutral-800/55 p-4 rounded-2xl">
              <label className="flex items-center gap-2.5 text-xs font-extrabold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20] h-4 w-4 cursor-pointer"
                />
                <span>Feature in Top Carousel Slider</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Views Counter Seed</label>
                <input
                  type="number"
                  value={formViews}
                  onChange={(e) => setFormViews(Number(e.target.value))}
                  className="w-20 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-center text-xs font-bold"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2 border-t border-gray-100 dark:border-neutral-800 pt-4 mt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1B5E20] hover:bg-[#124115] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-[#1B5E20]/15"
              >
                <Save size={14} />
                Save Project
              </button>
            </div>

          </form>
        </motion.div>
      )}

      {/* --- REAL-TIME STATS SUMMARY GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block">Total Land Projects</span>
            <span className="text-2xl font-black text-gray-800 dark:text-white block mt-1">{lands.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/45 flex items-center justify-center text-[#1B5E20]">
            <Layers size={20} />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block">Featured Slider Items</span>
            <span className="text-2xl font-black text-[#1B5E20] block mt-1">
              {lands.filter(l => l.isFeatured).length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-950/45 flex items-center justify-center text-amber-500">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block">Unique Districts</span>
            <span className="text-2xl font-black text-gray-800 dark:text-white block mt-1">
              {new Set(lands.map(l => l.district)).size}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/45 flex items-center justify-center text-blue-500">
            <MapPin size={20} />
          </div>
        </div>
      </div>

      {/* --- MAIN LANDS LIST --- */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-800/50">
          <h3 className="font-extrabold text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Current Lands Inventory
          </h3>
          <span className="text-xs font-bold text-gray-400">
            Click on headings to edit or manage sliders instantly
          </span>
        </div>

        {lands.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            {lands.map((land) => (
              <div 
                key={land.id}
                className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex gap-4 items-center flex-1">
                  {/* Thumbnail */}
                  <img
                    src={land.image}
                    alt={land.title}
                    className="w-16 h-16 rounded-xl object-cover border dark:border-neutral-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-gray-800 dark:text-white leading-tight">
                        {land.title}
                      </h4>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[9px] font-bold rounded">
                        {land.category}
                      </span>
                      {land.isFeatured && (
                        <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 text-[9px] font-black uppercase tracking-wider rounded flex items-center gap-0.5">
                          <Sparkles size={8} /> Featured
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                      <MapPin size={12} />
                      {land.location}
                    </div>

                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 pt-1">
                      <span>Size: <span className="text-gray-700 dark:text-gray-300 font-extrabold">{land.size}</span></span>
                      <span>District: <span className="text-gray-700 dark:text-gray-300 font-extrabold">{land.district}</span></span>
                      <span>Views: <span className="text-gray-700 dark:text-gray-300 font-extrabold">{land.views}</span></span>
                    </div>
                  </div>
                </div>

                {/* Pricing & quick action switches */}
                <div className="flex items-center gap-4 sm:self-center shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block">Price Per Perch</span>
                    <span className="text-sm font-black text-[#1B5E20] dark:text-[#52c159] block">
                      Rs. {land.priceLkr.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Featured switch toggle button */}
                    <button
                      onClick={() => toggleFeatured(land.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                        land.isFeatured
                          ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/30'
                          : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:border-neutral-700'
                      }`}
                      title={land.isFeatured ? 'Click to unfeature' : 'Click to feature in Home Slider'}
                    >
                      {land.isFeatured ? 'Slider ON' : 'Slider OFF'}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => handleStartEdit(land)}
                      className="p-2 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-gray-500 transition-colors border border-gray-100/50 cursor-pointer dark:bg-neutral-800 dark:border-neutral-700"
                      title="Edit details"
                    >
                      <FileText size={14} />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(land.id)}
                      className="p-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400 transition-colors border border-gray-100/50 cursor-pointer dark:bg-neutral-800 dark:border-neutral-700"
                      title="Delete development"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <Compass className="animate-spin-slow mx-auto text-gray-300" size={36} />
            <p className="text-sm font-bold">No Lands currently exist in your customized inventory.</p>
            <button
              onClick={handleStartAdd}
              className="px-4 py-2 bg-[#1B5E20] hover:bg-[#124115] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Add Your First Land Project
            </button>
          </div>
        )}
      </div>

      {/* Helper guide */}
      <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 flex gap-3 text-left">
        <AlertCircle className="text-[#1B5E20] shrink-0" size={20} />
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold text-[#1B5E20]">Quick Publishing Sync Guide</h4>
          <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
            All additions and modifications here are applied instantly to the guest-facing "Lands Portfolio" page view on this portal. They run completely on the fast offline state engine with perfect synchronization. Any land property created as a general property in the regular Properties form (with category set to "Land") will also be automatically detected and integrated into this list.
          </p>
        </div>
      </div>

    </div>
  );
}
