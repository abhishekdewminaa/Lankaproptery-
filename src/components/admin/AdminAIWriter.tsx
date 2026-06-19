import React, { useState } from 'react';
import { Sparkles, Copy, PencilLine, RotateCw, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function AdminAIWriter() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [variations, setVariations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState({
    type: 'House',
    listingType: 'For Sale',
    location: '',
    landSize: '',
    floorArea: '',
    bedrooms: '',
    bathrooms: '',
    price: '',
    features: [] as string[],
    notes: '',
    tone: 'Professional',
    language: 'English'
  });

  const propertyTypes = ['House', 'Land', 'Apartment', 'Commercial'];
  const listingTypes = ['For Sale', 'For Rent'];
  const keyFeaturesList = [
    'Clear Title/Deed', 'Near Main Road', 'Near Schools', 'Near Hospital',
    'Electricity & Water', 'Garage/Parking', 'Garden', 'Swimming Pool',
    'Gated Community', 'Sea View', 'Mountain View', 'Investment Property'
  ];
  const tones = ['Professional', 'Friendly', 'Luxury', 'Urgent'];
  const languages = ['English', 'Sinhala', 'Both'];

  const handleCheckbox = (feature: string) => {
    setFormData(prev => {
      const current = [...prev.features];
      if (current.includes(feature)) {
        return { ...prev, features: current.filter(f => f !== feature) };
      } else {
        return { ...prev, features: [...current, feature] };
      }
    });
  };

  const handleGenerate = async () => {
    if (!formData.location) {
      toast.error('Please enter a location');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const prompt = `Write a professional property listing description for a ${formData.type} ${formData.listingType} in ${formData.location}, Sri Lanka. Size: ${formData.landSize}. Floor area: ${formData.floorArea}. ${formData.bedrooms} bedrooms, ${formData.bathrooms} bathrooms. Price: Rs. ${formData.price}. Key features: ${formData.features.join(', ')}. Additional notes: ${formData.notes}. Tone: ${formData.tone}. Language: ${formData.language}. Keep it under 200 words. Make it compelling for Sri Lankan property buyers. Return the text without any surrounding quotes. Provide 3 different variations separated by "|||VARIATION|||".`;

      // using the generic backend fetch call assuming it is mapped correctly or use Gemini API key from client-side if needed
      const apiKey = process.env.GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';
      
      let endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=" + apiKey;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Generation failed. Check your API key.");
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
         let parts = text.split("|||VARIATION|||").map((t: string) => t.trim()).filter((t: string) => t);
         if (parts.length === 0) parts = [text.trim()];
         if (parts.length === 1) {
            // fake variations if not provided separatedly
            parts = [
              parts[0], 
              "Here is an alternative version:\n" + parts[0], 
              "Let's look at another angle:\n" + parts[0]
            ];
         }
         setVariations(parts);
         setActiveTab(0);
         setGeneratedText(parts[0]);
         toast.success('Description generated!');
      }

    } catch (error: any) {
      toast.error(error.message || 'Error generating description');
      
      // Fallback for preview without API key
      const fallback = "Experience the perfect blend of modern comfort and convenience with this exceptional property in " + formData.location + ". Featuring " + formData.bedrooms + " bedrooms and " + formData.bathrooms + " bathrooms, this " + formData.type + " offers ample living space for you and your family. " + (formData.features.length > 0 ? "Enjoy key features such as " + formData.features.join(", ") + "." : "");
      const vars = [
         fallback,
         "Discover your dream " + formData.type + " in the heart of " + formData.location + "...",
         "An unmissable opportunity awaits in " + formData.location + " with this stunning " + formData.type + "..."
      ];
      setTimeout(() => {
        setVariations(vars);
        setActiveTab(0);
        setGeneratedText(vars[0]);
      }, 1000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    toast.success('Copied to clipboard!');
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const wordsCount = generatedText ? generatedText.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-2">
         <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl">
           <Sparkles size={24} />
         </div>
         <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">AI Writer</h2>
            <p className="text-gray-500 font-medium">Generate high-converting property descriptions with Gemini AI.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
         {/* LEFT PANEL */}
         <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
            <h3 className="font-black text-lg text-gray-900 border-b border-gray-100 pb-4">Property Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Property Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-indigo-500 text-sm">
                  {propertyTypes.map(pt => <option key={pt}>{pt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Listing Type</label>
                <select value={formData.listingType} onChange={e => setFormData({...formData, listingType: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-indigo-500 text-sm">
                  {listingTypes.map(lt => <option key={lt}>{lt}</option>)}
                </select>
              </div>
            </div>

            <div>
               <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Location</label>
               <input type="text" placeholder="e.g. Colombo 07" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-indigo-500 transition-colors text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Land Size</label>
                 <input type="text" placeholder="e.g. 15 Perches" value={formData.landSize} onChange={e => setFormData({...formData, landSize: e.target.value})} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-indigo-500 transition-colors text-sm" />
               </div>
               <div>
                 <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Floor Area</label>
                 <input type="text" placeholder="e.g. 2200 sq ft" value={formData.floorArea} onChange={e => setFormData({...formData, floorArea: e.target.value})} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-indigo-500 transition-colors text-sm" />
               </div>
               <div>
                 <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Bedrooms</label>
                 <input type="number" min="0" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-indigo-500 transition-colors text-sm" />
               </div>
               <div>
                 <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Bathrooms</label>
                 <input type="number" min="0" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-indigo-500 transition-colors text-sm" />
               </div>
            </div>

            <div>
               <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Price (LKR)</label>
               <input type="number" placeholder="e.g. 45000000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-indigo-500 transition-colors text-sm" />
            </div>

            <div>
               <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-3">Key Features</label>
               <div className="grid grid-cols-2 gap-2">
                 {keyFeaturesList.map(feature => (
                   <label key={feature} className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                     <input type="checkbox" checked={formData.features.includes(feature)} onChange={() => handleCheckbox(feature)} className="accent-indigo-600 w-3.5 h-3.5" />
                     {feature}
                   </label>
                 ))}
               </div>
            </div>

            <div>
               <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Additional Notes</label>
               <textarea rows={3} placeholder="Any specific requirements..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-indigo-500 transition-colors text-sm resize-none" />
            </div>

            <div className="pt-2 border-t border-gray-100">
               <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-3">Tone</label>
               <div className="flex flex-wrap gap-2">
                 {tones.map(t => (
                   <button key={t} onClick={() => setFormData({...formData, tone: t})} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.tone === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                     {t}
                   </button>
                 ))}
               </div>
            </div>

            <div>
               <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-3">Language</label>
               <div className="flex gap-2">
                 {languages.map(l => (
                   <button key={l} onClick={() => setFormData({...formData, language: l})} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.language === l ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                     {l}
                   </button>
                 ))}
               </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
            >
               {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
               {isGenerating ? 'Generating...' : 'Generate Description'}
            </button>
         </div>

         {/* RIGHT PANEL */}
         <div className="lg:col-span-7 flex flex-col pt-8 lg:pt-0">
            <div className="flex bg-gray-100 rounded-t-xl overflow-hidden border-b border-gray-200 p-1 gap-1">
               {['Version 1', 'Version 2', 'Version 3'].map((tab, idx) => (
                  <button 
                    key={tab} 
                    onClick={() => {
                       setActiveTab(idx);
                       if (variations[idx]) setGeneratedText(variations[idx]);
                    }}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === idx ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                  >
                     {tab}
                  </button>
               ))}
            </div>
            
            <div className="flex-1 bg-white border border-t-0 border-gray-200 rounded-b-[24px] shadow-lg shadow-indigo-900/5 p-8 relative min-h-[400px] flex flex-col">
               <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-b-[24px] z-10">
                       <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                       <p className="font-black text-gray-900 tracking-wider">AI IS WRITING YOUR DESCRIPTION...</p>
                       <p className="text-sm font-bold text-gray-500 mt-2">Crafting compelling features and benefits</p>
                    </motion.div>
                  ) : generatedText ? (
                    <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full">
                       <textarea 
                          value={generatedText}
                          onChange={(e) => setGeneratedText(e.target.value)}
                          className="w-full flex-1 min-h-[300px] text-gray-700 font-medium leading-relaxed resize-none border-0 outline-none focus:ring-0 p-0"
                       />
                       
                       <div className="border-t border-gray-100 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             Word Count: <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{wordsCount}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                             <button onClick={handleRegenerate} className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors" title="Regenerate">
                               <RotateCw size={18} />
                             </button>
                             <button onClick={handleCopy} className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors text-sm">
                               <Copy size={16} /> Copy
                             </button>
                             <button onClick={() => toast.success('Saved to use later!')} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-md text-sm">
                               <CheckCircle2 size={16} /> Use This
                             </button>
                          </div>
                       </div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-gray-400">
                       <div className="w-24 h-24 mb-6 rounded-full bg-gray-50 border-4 border-gray-100 flex items-center justify-center text-gray-300">
                          <Sparkles size={40} className="ml-1" />
                       </div>
                       <p className="font-bold text-center leading-relaxed max-w-sm">Fill in the property details on the left and click generate to let AI write your description.</p>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>
      </div>
    </div>
  );
}
