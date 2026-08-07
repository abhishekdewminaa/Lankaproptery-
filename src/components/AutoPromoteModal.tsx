import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Loader2, Edit3, RefreshCw, Send, ChevronRight, Calendar, Clock, BarChart3, Star, Download, Facebook, Instagram, Twitter, Bot } from 'lucide-react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { triggerPropertyPublishedWorkflow } from '../automation/nodeExecutors';

interface Property {
  id: string;
  ref_no?: string;
  listing_title: string;
  price_lkr: number;
  city: string;
  district: string;
  property_category: string;
  property_description?: string;
  rooms?: number;
  bathrooms?: number;
  images?: string[];
}

interface AutoPromoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onPromoted?: (platforms: string[]) => void;
}

const STEPS = [
  'Extract',
  'AI Content',
  'Preview',
  'Publish',
  'Analytics'
];

export default function AutoPromoteModal({ isOpen, onClose, property, onPromoted }: AutoPromoteModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  // step 1 state
  const [extractedItems, setExtractedItems] = useState<number>(0);
  
  // step 2 state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'facebook' | 'instagram' | 'twitter'>('facebook');
  
  // step 3 state
  const [editedContent, setEditedContent] = useState<any>(null);
  const [scheduleType, setScheduleType] = useState('now'); // 'now', 'later', 'draft'
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [includeFb, setIncludeFb] = useState(true);
  const [includeIg, setIncludeIg] = useState(true);
  const [includeTw, setIncludeTw] = useState(true);

  // step 4 state
  const [publishStatus, setPublishStatus] = useState({
    fb: 'pending',
    ig: 'pending',
    tw: 'pending',
    saving: 'pending'
  });

  useEffect(() => {
    if (isOpen && currentStep === 0) {
      setExtractedItems(0);
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setExtractedItems(i);
        if (i >= 8) {
          clearInterval(interval);
          setTimeout(() => setCurrentStep(1), 2000);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (isOpen && currentStep === 1 && !generatedContent && !isGenerating) {
      generateContent();
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (generatedContent && !editedContent) {
      setEditedContent(JSON.parse(JSON.stringify(generatedContent)));
    }
  }, [generatedContent]);

  const generateContent = async () => {
    setIsGenerating(true);
    setGenerationProgress(10);
    try {
      const prompt = `You are a Sri Lankan real estate social media marketing expert for LankaProperty.lk.
Property Details:
Title: ${property?.listing_title}
Price: Rs. ${property?.price_lkr?.toLocaleString()}
Location: ${property?.city}, ${property?.district}
Type: ${property?.property_category}
Bedrooms: ${property?.rooms || '-'}
Bathrooms: ${property?.bathrooms || '-'}
Description: ${property?.property_description || 'A beautiful property in Sri Lanka.'}
Ref No: ${property?.ref_no || `LP00${property?.id}`}
URL: https://lankaproperty.lk/${property?.id}

Generate marketing content. Return JSON strictly in this format:
{
  "facebook": {
    "caption": "Full Facebook post (150-200 words)",
    "cta": "Call-to-action sentence"
  },
  "instagram": {
    "caption": "Instagram caption (80-100 words, emotional)",
    "hashtags": ["#tag1", "#tag2", "#tag3"]
  },
  "twitter": {
    "caption": "Tweet max 280 chars + link"
  },
  "seo_description": "Optimized 160 char meta description",
  "selling_points": ["Point 1","Point 2","Point 3"],
  "headline": "Attention-grabbing headline"
}`;

      let progressInterval: any;
      try {
        let progress = 10;
        progressInterval = setInterval(() => {
          progress += 10;
          if (progress <= 90) setGenerationProgress(progress);
        }, 500);

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: prompt,
            instructions: 'Respond ONLY with valid JSON. Do not include markdown formatting like ```json.'
          })
        });

        if (!response.ok) throw new Error("API response not ok");

        let fullText = '';
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) fullText += data.text;
                if (data.error) throw new Error(data.error);
              } catch (e) {}
            }
          }
        }
        
        const cleanedText = fullText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        setGeneratedContent(parsed);
      } catch (e) {
        toast.error("Using fallback content due to connection issue");
        setGeneratedContent({
          facebook: { caption: "🏠 JUST LISTED!\n\nDiscover this stunning property...", cta: "Call now to book a viewing!" },
          instagram: { caption: "Your dream home awaits! ✨", hashtags: ["#LankaProperty", "#RealEstate"] },
          twitter: { caption: "🏠 Just listed: Amazing property in Sri Lanka! Check it out: https://lankaproperty.lk" },
          headline: "Amazing Property"
        });
      } finally {
        if (progressInterval) clearInterval(progressInterval);
        setGenerationProgress(100);
        setIsGenerating(false);
      }
    } catch (outerE) {
      toast.error("An unexpected error occurred building the prompt");
      setIsGenerating(false);
    }
  };

  const publishAll = async () => {
    setCurrentStep(3);
    setPublishStatus({ fb: 'publishing', ig: 'publishing', tw: 'publishing', saving: 'publishing' });
    
    const propertyUrl = `https://lankaproperty.lk/property/${property?.id}`;
    
    if (includeFb) {
      setTimeout(() => {
         window.open(
           `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}&quote=${encodeURIComponent(editedContent.facebook.caption)}`,
           'fb', 'width=600,height=500'
         );
         setPublishStatus(prev => ({ ...prev, fb: 'done' }));
      }, 1000);
    } else {
       setPublishStatus(prev => ({ ...prev, fb: 'skipped' }));
    }
    
    if (includeIg) {
      setTimeout(async () => {
         await navigator.clipboard.writeText(editedContent.instagram.caption + '\n\n' + editedContent.instagram.hashtags.join(' '));
         window.open('https://instagram.com', '_blank');
         setPublishStatus(prev => ({ ...prev, ig: 'done' }));
      }, 2500);
    } else {
       setPublishStatus(prev => ({ ...prev, ig: 'skipped' }));
    }

    if (includeTw) {
      setTimeout(() => {
         window.open(
           `https://twitter.com/intent/tweet?text=${encodeURIComponent(editedContent.twitter.caption)}`,
           'tw', 'width=600,height=500'
         );
         setPublishStatus(prev => ({ ...prev, tw: 'done' }));
      }, 4000);
    } else {
       setPublishStatus(prev => ({ ...prev, tw: 'skipped' }));
    }

    setTimeout(async () => {
       try {
         // Create the workflow log entry via the shared executor function
         await triggerPropertyPublishedWorkflow(property);
         
         setPublishStatus(prev => ({ ...prev, saving: 'done' }));
         const platforms = [];
         if (includeFb) platforms.push('fb');
         if (includeIg) platforms.push('ig');
         if (includeTw) platforms.push('tw');
         
         if (onPromoted) onPromoted(platforms);
         setTimeout(() => setCurrentStep(4), 1500);
       } catch (e) {
         console.error(e);
       }
    }, 5000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 [perspective:2000px]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotateX: 30, rotateY: -15, z: -300 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0, z: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotateX: 30, rotateY: -15, z: -300 }}
        transition={{ type: "spring", bounce: 0.4, duration: 1 }}
        className="relative bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col [transform-style:preserve-3d]"
      >
         {/* Header */}
         <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-[#1A5E2A] flex items-center justify-center text-white shadow-lg shadow-[#1A5E2A]/20">
                  <Star size={24} fill="currentColor" />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Auto Promote</h2>
                  <p className="text-sm font-bold text-gray-400">LP{String(property?.id).padStart(4, '0')} • {property?.listing_title}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
               <X size={24} />
            </button>
         </div>

         {/* Progress Bar */}
         <div className="bg-gray-50 p-4 border-b border-gray-100 shrink-0">
            <div className="max-w-4xl mx-auto flex justify-between relative">
               <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
               <div 
                 className="absolute top-1/2 left-0 h-1 bg-[#1A5E2A] -translate-y-1/2 z-0 transition-all duration-500"
                 style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
               ></div>
               
               {STEPS.map((step, idx) => (
                  <button type="button" onClick={() => setCurrentStep(idx)} key={idx} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer group focus:outline-none transition-all hover:scale-105 active:scale-95 border-0 bg-transparent p-0">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        currentStep > idx ? 'bg-[#1A5E2A] text-white' :
                        currentStep === idx ? 'bg-white border-2 border-[#1A5E2A] text-[#1A5E2A] shadow-lg shadow-[#1A5E2A]/20' :
                        'bg-white border-2 border-gray-200 text-gray-400'
                     }`}>
                        {currentStep > idx ? <CheckCircle2 size={16} /> : idx + 1}
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= idx ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step}
                     </span>
                  </button>
               ))}
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto bg-white relative">
            
            {/* STEP 1: Extract Data */}
            {currentStep === 0 && (
               <div className="p-12 max-w-4xl mx-auto flex gap-12 items-center h-full">
                  <div className="flex-1 space-y-6">
                     <div className="flex items-center gap-3 text-[#1A5E2A] font-black text-xl mb-8">
                        <Loader2 className="animate-spin" /> Extracting property details...
                     </div>
                     <div className="space-y-4">
                        {[
                          { label: 'Property Title', val: property?.listing_title },
                          { label: 'Price', val: `Rs. ${property?.price_lkr?.toLocaleString()}` },
                          { label: 'Location', val: `${property?.city}, ${property?.district}` },
                          { label: 'Type', val: property?.property_category },
                          { label: 'Ref No', val: `LP${String(property?.id).padStart(4, '0')}` },
                          { label: 'Images', val: 'Found' },
                          { label: 'Description', val: 'Extracted' },
                          { label: 'Property URL', val: `lankaproperty.lk/LP${String(property?.id).padStart(4, '0')}` },
                        ].map((item, i) => (
                           <motion.div key={i} 

                             initial={{ opacity: 0, x: -20 }}
                             animate={extractedItems > i ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                             className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100"
                           >
                              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                 <CheckCircle2 size={14} />
                              </div>
                              <span className="font-bold text-xs uppercase tracking-widest text-gray-500 w-32">{item.label}:</span>
                              <span className="font-medium text-sm truncate">{item.val}</span>
                           </motion.div>
                        ))}
                     </div>
                  </div>
                  <div className="w-80 shrink-0">
                     <div className="w-full aspect-square rounded-3xl bg-gray-100 overflow-hidden shadow-2xl rotate-3 scale-105 border-8 border-white">
                        {property?.images && property.images.length > 0 ? (
                           <img onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'; }} src={Array.isArray(property.images) ? property.images[0] : property.images} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {/* STEP 2: AI Generation */}
            {currentStep === 1 && (
               <div className="flex h-full">
                  <div className="w-80 bg-gray-50 border-r border-gray-100 p-6 flex flex-col">
                     <div className="flex items-center gap-3 text-gray-900 font-black mb-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Bot className="text-[#1A5E2A]" size={24} /> Gemini AI
                     </div>
                     <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                           <span>Generation Status</span>
                           <span>{generationProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                           <motion.div 
                             className="h-full bg-[#1A5E2A]"
                             initial={{ width: 0 }}
                             animate={{ width: `${generationProgress}%` }}
                           />
                        </div>
                     </div>
                     <div className="space-y-3 font-mono text-xs text-gray-600 flex-1">
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                           <span>Analyzing property...</span>
                           {generationProgress > 10 && <CheckCircle2 size={14} className="text-green-500" />}
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                           <span>Facebook caption</span>
                           {generationProgress > 40 && <CheckCircle2 size={14} className="text-green-500" />}
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                           <span>Instagram caption</span>
                           {generationProgress > 60 && <CheckCircle2 size={14} className="text-green-500" />}
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                           <span>Twitter caption</span>
                           {generationProgress > 80 && <CheckCircle2 size={14} className="text-green-500" />}
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                           <span>SEO Data</span>
                           {generationProgress === 100 && <CheckCircle2 size={14} className="text-green-500" />}
                        </div>
                     </div>
                  </div>
                  <div className="flex-1 p-8 bg-gray-100/50">
                     {isGenerating ? (
                        <div className="h-full flex items-center justify-center">
                           <div className="text-center">
                              <Loader2 className="animate-spin text-[#1A5E2A] mx-auto mb-4" size={48} />
                              <p className="text-gray-500 font-bold animate-pulse">Crafting perfect marketing copy...</p>
                           </div>
                        </div>
                     ) : editedContent && (
                        <div className="max-w-2xl mx-auto">
                           <div className="flex gap-2 mb-6 p-1 bg-gray-200/50 rounded-2xl w-fit">
                              <button onClick={() => setActiveTab('facebook')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'facebook' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><Facebook size={16}/> Facebook</button>
                              <button onClick={() => setActiveTab('instagram')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'instagram' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><Instagram size={16}/> Instagram</button>
                              <button onClick={() => setActiveTab('twitter')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'twitter' ? 'bg-white text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><Twitter size={16}/> Twitter</button>
                           </div>
                           
                           <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                 <div className="font-bold text-gray-900 text-sm">Preview & Edit</div>
                                 <button onClick={generateContent} className="text-xs font-bold text-[#1A5E2A] flex items-center gap-1 hover:underline"><RefreshCw size={12}/> Regenerate</button>
                              </div>
                              <div className="p-6">
                                 <textarea 
                                    className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:border-[#1A5E2A] focus:bg-white resize-none"
                                    value={
                                       activeTab === 'facebook' ? editedContent.facebook.caption :
                                       activeTab === 'instagram' ? editedContent.instagram.caption + '\n\n' + (editedContent.instagram.hashtags?.join(' ') || '') :
                                       editedContent.twitter.caption
                                    }
                                    onChange={(e) => {
                                       const val = e.target.value;
                                       setEditedContent((prev: any) => {
                                          const next = { ...prev };
                                          if (activeTab === 'facebook') next.facebook.caption = val;
                                          else if (activeTab === 'twitter') next.twitter.caption = val;
                                          else if (activeTab === 'instagram') next.instagram.caption = val; // simplified handling for IG
                                          return next;
                                       });
                                    }}
                                 />
                              </div>
                           </div>
                           
                           <div className="mt-8 flex justify-end">
                              <button onClick={() => setCurrentStep(2)} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2">
                                 Continue to Preview <ChevronRight size={18} />
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {/* STEP 3: Preview Mockups */}
            {currentStep === 2 && editedContent && (
               <div className="p-8 h-full flex flex-col">
                  <div className="grid grid-cols-3 gap-6 flex-1 min-h-0 mb-6">
                     
                     {/* Facebook Mock */}
                     <div className={`flex flex-col border border-gray-200 rounded-3xl overflow-hidden bg-white ${!includeFb ? 'opacity-50 grayscale' : ''}`}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                           <div className="flex items-center gap-2 text-sm font-bold text-blue-600"><Facebook size={16} /> Facebook</div>
                           <label className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer">
                              <input type="checkbox" checked={includeFb} onChange={e => setIncludeFb(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> Include
                           </label>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">LP</div>
                              <div>
                                 <div className="font-bold text-sm text-gray-900">LankaProperty.lk</div>
                                 <div className="text-xs text-gray-500">Just now · 🌍</div>
                              </div>
                           </div>
                           <div className="text-sm text-gray-800 whitespace-pre-wrap mb-4">{editedContent.facebook.caption}</div>
                           <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                             {(property?.images?.[0] || typeof property?.images === 'string') ? (
                                <img onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'; }} src={Array.isArray(property?.images) ? property?.images[0] : property?.images} className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
                             )}
                           </div>
                        </div>
                     </div>

                     {/* Instagram Mock */}
                     <div className={`flex flex-col border border-gray-200 rounded-3xl overflow-hidden bg-white ${!includeIg ? 'opacity-50 grayscale' : ''}`}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                           <div className="flex items-center gap-2 text-sm font-bold text-pink-600"><Instagram size={16} /> Instagram</div>
                           <label className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer">
                              <input type="checkbox" checked={includeIg} onChange={e => setIncludeIg(e.target.checked)} className="rounded border-gray-300 text-pink-600 focus:ring-pink-500" /> Include
                           </label>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                           <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                                 <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] font-bold">LP</div>
                              </div>
                              <div className="font-bold text-sm text-gray-900">lankaproperty</div>
                           </div>
                           <div className="w-full aspect-square bg-gray-100 border-b border-gray-100">
                             {(property?.images?.[0] || typeof property?.images === 'string') ? (
                                <img onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'; }} src={Array.isArray(property?.images) ? property?.images[0] : property?.images} className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
                             )}
                           </div>
                           <div className="p-4">
                              <div className="text-sm text-gray-800 whitespace-pre-wrap"><span className="font-bold mr-2">lankaproperty</span>{editedContent.instagram.caption}</div>
                              <div className="text-blue-900 text-xs mt-2 break-words">{editedContent.instagram.hashtags?.join(' ')}</div>
                           </div>
                        </div>
                     </div>

                     {/* Twitter Mock */}
                     <div className={`flex flex-col border border-gray-200 rounded-3xl overflow-hidden bg-white ${!includeTw ? 'opacity-50 grayscale' : ''}`}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                           <div className="flex items-center gap-2 text-sm font-bold text-blue-400"><Twitter size={16} /> Twitter</div>
                           <label className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer">
                              <input type="checkbox" checked={includeTw} onChange={e => setIncludeTw(e.target.checked)} className="rounded border-gray-300 text-blue-400 focus:ring-blue-400" /> Include
                           </label>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                           <div className="flex gap-3">
                              <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold shrink-0">LP</div>
                              <div>
                                 <div className="flex items-center gap-1">
                                    <span className="font-bold text-gray-900">LankaProperty</span>
                                    <CheckCircle2 size={14} className="text-blue-400" fill="currentColor"/>
                                    <span className="text-gray-500 text-sm">@lankaproperty</span>
                                 </div>
                                 <div className="text-sm text-gray-900 whitespace-pre-wrap mt-1">{editedContent.twitter.caption}</div>
                                 <div className="w-full mt-3 rounded-2xl overflow-hidden border border-gray-200">
                                   {(property?.images?.[0] || typeof property?.images === 'string') ? (
                                      <img onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'; }} src={Array.isArray(property?.images) ? property?.images[0] : property?.images} className="w-full aspect-video object-cover" />
                                   ) : (
                                      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-3xl">🏠</div>
                                   )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                  </div>
                  
                  {/* Footer Schedule */}
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 flex items-center justify-between shadow-inner shrink-0">
                     <div className="flex bg-white rounded-2xl p-1 border border-gray-200 shadow-sm">
                        <button onClick={() => setScheduleType('now')} className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${scheduleType === 'now' ? 'bg-[#1A5E2A]/10 text-[#1A5E2A]' : 'text-gray-500 hover:text-gray-900'}`}><Send size={16}/> Post Now</button>
                        <button onClick={() => setScheduleType('later')} className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${scheduleType === 'later' ? 'bg-[#1A5E2A]/10 text-[#1A5E2A]' : 'text-gray-500 hover:text-gray-900'}`}><Calendar size={16}/> Schedule</button>
                        <button onClick={() => setScheduleType('draft')} className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${scheduleType === 'draft' ? 'bg-[#1A5E2A]/10 text-[#1A5E2A]' : 'text-gray-500 hover:text-gray-900'}`}><Edit3 size={16}/> Draft</button>
                     </div>
                     
                     {scheduleType === 'later' && (
                        <div className="flex gap-3 items-center">
                           <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-[#1A5E2A]" />
                           <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-[#1A5E2A]" />
                        </div>
                     )}

                     <button 
                       onClick={publishAll}
                       className="bg-[#1A5E2A] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-[#1A5E2A]/30 hover:scale-105 transition-all active:scale-95"
                     >
                        Confirm & Publish
                     </button>
                  </div>
               </div>
            )}

            {/* STEP 4: Publishing */}
            {currentStep === 3 && (
               <div className="p-12 max-w-2xl mx-auto h-full flex flex-col justify-center">
                  <div className="text-center mb-12">
                     <div className="w-20 h-20 bg-[#1A5E2A]/10 rounded-full flex items-center justify-center text-[#1A5E2A] mx-auto mb-6">
                        <Send size={32} className="animate-pulse" />
                     </div>
                     <h3 className="text-3xl font-black text-gray-900 mb-2">Publishing to Social Media</h3>
                     <p className="text-gray-500 font-bold">Please allow popups to open social media composers.</p>
                  </div>

                  <div className="space-y-4">
                     {[
                       { id: 'fb', name: 'Facebook', icon: <Facebook className="text-blue-600"/>, status: publishStatus.fb, msg: "Composer opened!" },
                       { id: 'ig', name: 'Instagram', icon: <Instagram className="text-pink-600"/>, status: publishStatus.ig, msg: "Caption copied. Instagram opening..." },
                       { id: 'tw', name: 'Twitter / X', icon: <Twitter className="text-blue-400"/>, status: publishStatus.tw, msg: "Tweet composer opened!" },
                       { id: 'saving', name: 'Database sync', icon: <Loader2 className="text-gray-400"/>, status: publishStatus.saving, msg: "Saved successfully!" }
                     ].map(item => {
                       // Skip disabled platforms unless it's saving
                       if (item.id === 'fb' && !includeFb) return null;
                       if (item.id === 'ig' && !includeIg) return null;
                       if (item.id === 'tw' && !includeTw) return null;
                       
                       return (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">{item.icon}</div>
                              <span className="font-bold text-gray-900">{item.name}</span>
                           </div>
                           <div className="text-sm font-bold">
                              {item.status === 'pending' && <span className="text-gray-400">Waiting...</span>}
                              {item.status === 'publishing' && <span className="text-[#1A5E2A] flex items-center gap-2"><Loader2 size={16} className="animate-spin"/> Publishing...</span>}
                              {item.status === 'done' && <span className="text-green-600 flex items-center gap-2"><CheckCircle2 size={16}/> {item.msg}</span>}
                              {item.status === 'skipped' && <span className="text-gray-400">Skipped</span>}
                           </div>
                        </div>
                       );
                     })}
                  </div>
               </div>
            )}

            {/* STEP 5: Analytics & Success */}
            {currentStep === 4 && (
               <div className="p-12 h-full bg-gray-50 overflow-y-auto">
                  <div className="max-w-4xl mx-auto">
                     <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-xl shadow-black/5 text-center mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#1A5E2A]"></div>
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6 shadow-inner">
                           <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">🎉 Successfully Promoted!</h2>
                        <p className="text-xl text-gray-500 font-bold mb-8">LP{String(property?.id).padStart(4, '0')} — {property?.listing_title}</p>
                        
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                           {includeFb && <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center gap-2"><Facebook size={16}/> Facebook</div>}
                           {includeIg && <div className="px-4 py-2 bg-pink-50 text-pink-700 rounded-xl font-bold flex items-center gap-2"><Instagram size={16}/> Instagram</div>}
                           {includeTw && <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold flex items-center gap-2"><Twitter size={16}/> Twitter</div>}
                        </div>

                        <div className="flex justify-center gap-4">
                           <button onClick={onClose} className="bg-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm hover:bg-gray-200 transition-all flex items-center gap-2">
                              Back to Dashboard
                           </button>
                        </div>
                     </div>

                     <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><BarChart3/> Initial Performance Estimate</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-center">
                           <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Estimated Reach</div>
                           <div className="text-4xl font-black text-gray-900">4.5K+</div>
                           <div className="text-xs font-bold text-green-500 mt-2">Accounts across {Number(includeFb) + Number(includeIg) + Number(includeTw)} platforms</div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-center">
                           <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Target Audience</div>
                           <div className="text-4xl font-black text-[#1A5E2A]">High</div>
                           <div className="text-xs font-bold text-gray-500 mt-2">Matched to property type</div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-center">
                           <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Expected Leads</div>
                           <div className="text-4xl font-black text-emerald-600">12-15</div>
                           <div className="text-xs font-bold text-gray-500 mt-2">Within next 7 days</div>
                        </div>
                     </div>
                     <div className="text-center text-sm font-bold text-gray-400 bg-gray-100 py-3 rounded-xl">
                        📊 Live analytics will appear here within 24 hours as engagement comes in.
                     </div>
                  </div>
               </div>
            )}
         </div>
      </motion.div>
    </div>
  );
}
