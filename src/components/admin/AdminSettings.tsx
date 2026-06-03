import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Shield, 
  CreditCard, 
  Mail, 
  Key, 
  Image as ImageIcon, 
  Sliders,
  CheckCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

interface AdminSettingsProps {
  user?: any;
}

export default function AdminSettings({ user }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [settingsForm, setSettingsForm] = useState({
    site_name: 'LankaProperty.lk',
    contact_email: '',
    contact_phone: '',
    office_address: '',
    site_logo_url: '',
    seo_title: '',
    seo_description: '',
    meta_keywords: '',
    emailjs_service_id: '',
    emailjs_template_id: '',
    emailjs_public_key: '',
    payhere_merchant_id: '',
    payhere_secret: '',
    gemini_api_key: '',
    default_expiry_days: 30,
    max_images_per_listing: 10,
    auto_approve_properties: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecret, setShowSecret] = useState({ payhere: false, gemini: false });

  // Security & System State (dummy for UI)
  const [securityForm, setSecurityForm] = useState({
    current_password: '',
    new_password: '',
    two_factor: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
      if (!error && data) {
        // Merge fetched data with defaults if some columns are missing
        setSettingsForm(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error(e);
      // It's possible the table doesn't exist yet, we will just continue with defaults
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // First check if row exists
      const { data: existing } = await supabase.from('site_settings').select('id').eq('id', 'default').maybeSingle();
      
      let error;
      if (existing) {
         const { error: updateError } = await supabase.from('site_settings').update(settingsForm).eq('id', 'default');
         error = updateError;
      } else {
         const { error: insertError } = await supabase.from('site_settings').insert([{ id: 'default', ...settingsForm }]);
         error = insertError;
      }

      if (error) {
        // If table doesn't exist error code is usually 42P01
        if (error.code === '42P01') {
           throw new Error("The 'site_settings' table does not exist in the database yet.");
        }
        throw error;
      }
      
      toast.success('Settings synchronized successfully!', {
        icon: '✅',
        style: {
          borderRadius: '16px',
          background: '#004F31',
          color: '#fff',
        },
      });
    } catch (error: any) {
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettingsForm(prev => ({ ...prev, [field]: value }));
  };

  const TABS = [
    { id: 'general', label: 'General Info', icon: <SettingsIcon size={18} /> },
    { id: 'seo', label: 'Search Engine SEO', icon: <Globe size={18} /> },
    { id: 'automation', label: 'Automation & Integrations', icon: <Sliders size={18} /> },
    { id: 'rules', label: 'Listing Rules', icon: <ImageIcon size={18} /> },
    { id: 'security', label: 'Security & System', icon: <Shield size={18} /> }
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 w-1/3 bg-gray-200 rounded-2xl"></div>
        <div className="flex gap-8">
           <div className="w-1/4 h-[400px] bg-gray-200 rounded-[24px]"></div>
           <div className="w-3/4 h-[600px] bg-gray-200 rounded-[24px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl sm:text-5xl font-black text-admin-text-dark tracking-tight">System Settings</h2>
          <p className="text-admin-text-gray font-bold mt-2">Manage global platform configurations, integrations, and security.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#10B981]/20 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
          {isSaving ? 'Synchronizing...' : 'Save Settings'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Tabs Navigation */}
        <div className="w-full lg:w-72 flex-shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-6 py-5 rounded-2xl font-bold transition-all whitespace-nowrap lg:whitespace-normal
                ${activeTab === tab.id 
                  ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-[#10B981]' 
                  : 'text-gray-500 hover:bg-white/50 border border-transparent'
                }
              `}
            >
              <div className={`${activeTab === tab.id ? 'scale-110' : ''} transition-transform`}>
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/80 backdrop-blur-[12px] border border-gray-100 rounded-[32px] p-8 sm:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.02)] min-h-[600px]">
          <AnimatePresence mode="wait">
            
            {activeTab === 'general' && (
              <motion.div 
                key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                  <div className="p-3 bg-[#10B981]/10 text-[#10B981] rounded-2xl"><SettingsIcon size={24} /></div>
                  <h3 className="text-2xl font-black text-gray-900">General Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="group relative">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Site Name</label>
                      <input 
                        type="text" 
                        value={settingsForm.site_name}
                        onChange={(e) => handleInputChange('site_name', e.target.value)}
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 transition-all duration-200"
                      />
                    </div>
                    <div className="group relative">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Contact Email</label>
                      <input 
                        type="email" 
                        value={settingsForm.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 transition-all duration-200"
                      />
                    </div>
                    <div className="group relative">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Contact Phone</label>
                      <input 
                        type="tel" 
                        value={settingsForm.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="group relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Site Logo URL</label>
                        <input 
                          type="url" 
                          value={settingsForm.site_logo_url}
                          onChange={(e) => handleInputChange('site_logo_url', e.target.value)}
                          className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 transition-all duration-200"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="mt-4 p-8 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center justify-center min-h-[160px]">
                        {settingsForm.site_logo_url ? (
                          <img src={settingsForm.site_logo_url} alt="Logo Preview" className="max-h-[80px] object-contain drop-shadow-md" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-400">
                             <ImageIcon size={32} />
                             <span className="text-xs font-bold uppercase tracking-widest">No Logo Set</span>
                          </div>
                        )}
                      </div>
                  </div>

                   <div className="md:col-span-2 group relative">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Office Address</label>
                      <textarea 
                        rows={2}
                        value={settingsForm.office_address}
                        onChange={(e) => handleInputChange('office_address', e.target.value)}
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 transition-all duration-200 resize-none"
                      />
                    </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'seo' && (
              <motion.div 
                key="seo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                 <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Globe size={24} /></div>
                  <h3 className="text-2xl font-black text-gray-900">Search Engine SEO</h3>
                </div>

                <div className="space-y-6">
                    <div className="group relative">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">SEO Title</label>
                      <input 
                        type="text" 
                        value={settingsForm.seo_title}
                        onChange={(e) => handleInputChange('seo_title', e.target.value)}
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 transition-all duration-200"
                      />
                    </div>
                    <div className="group relative">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">SEO Description</label>
                      <textarea 
                        rows={3}
                        value={settingsForm.seo_description}
                        onChange={(e) => handleInputChange('seo_description', e.target.value)}
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 transition-all duration-200 resize-none"
                      />
                    </div>
                     <div className="group relative">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Meta Keywords</label>
                      <input 
                        type="text" 
                        value={settingsForm.meta_keywords}
                        onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                        placeholder="Comma separated keywords..."
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 transition-all duration-200"
                      />
                    </div>
                </div>

                {/* Google Search Preview */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-6 block">Google Search Preview</label>
                  <div className="max-w-[600px] bg-white p-6 rounded-[20px] shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs overflow-hidden">
                        {settingsForm.site_logo_url ? <img src={settingsForm.site_logo_url} /> : <Globe size={16} className="text-gray-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#202124] leading-tight">LankaProperty.lk</p>
                        <p className="text-[12px] text-[#4d5156] leading-tight">https://lankaproperty.lk</p>
                      </div>
                    </div>
                    <div className="text-[20px] text-[#1a0dab] cursor-pointer hover:underline mb-1 whitespace-normal leading-tight font-medium" style={{ fontFamily: 'arial, sans-serif' }}>
                      {settingsForm.seo_title || "LankaProperty.lk - Real Estate Portal"}
                    </div>
                    <div className="text-[14px] text-[#4d5156] line-clamp-2 leading-relaxed" style={{ fontFamily: 'arial, sans-serif' }}>
                      {settingsForm.seo_description || "Find the best properties for sale and rent in Sri Lanka."}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'automation' && (
               <motion.div 
                key="automation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                  <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl"><Key size={24} /></div>
                  <h3 className="text-2xl font-black text-gray-900">Automation & API Integrations</h3>
                </div>

                {/* EmailJS */}
                <div className="space-y-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                     <h4 className="text-lg font-black text-gray-900 flex items-center gap-3"><Mail className="text-blue-500" /> EmailJS Configuration</h4>
                     <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${settingsForm.emailjs_public_key ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {settingsForm.emailjs_public_key ? 'Active ✅' : 'Pending ⚠️'}
                     </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">Service ID</label>
                      <input type="text" value={settingsForm.emailjs_service_id} onChange={(e) => handleInputChange('emailjs_service_id', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:border-[#10B981] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">Template ID</label>
                      <input type="text" value={settingsForm.emailjs_template_id} onChange={(e) => handleInputChange('emailjs_template_id', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:border-[#10B981] transition-all" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">Public Key</label>
                       <input type="text" value={settingsForm.emailjs_public_key} onChange={(e) => handleInputChange('emailjs_public_key', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:border-[#10B981] transition-all" />
                    </div>
                  </div>
                </div>

                {/* PayHere */}
                <div className="space-y-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                     <h4 className="text-lg font-black text-gray-900 flex items-center gap-3"><CreditCard className="text-indigo-500" /> PayHere Gateway</h4>
                     <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${settingsForm.payhere_merchant_id && settingsForm.payhere_secret ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {settingsForm.payhere_merchant_id && settingsForm.payhere_secret ? 'Active ✅' : 'Pending ⚠️'}
                     </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">Merchant ID</label>
                      <input type="text" value={settingsForm.payhere_merchant_id} onChange={(e) => handleInputChange('payhere_merchant_id', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:border-[#10B981] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">Merchant Secret</label>
                      <div className="relative">
                        <input type={showSecret.payhere ? "text" : "password"} value={settingsForm.payhere_secret} onChange={(e) => handleInputChange('payhere_secret', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:border-[#10B981] transition-all" />
                        <button onClick={() => setShowSecret(p => ({ ...p, payhere: !p.payhere }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                           {showSecret.payhere ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gemini AI */}
                <div className="space-y-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                     <h4 className="text-lg font-black text-gray-900 flex items-center gap-3">✨ Gemini API Key</h4>
                     <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${settingsForm.gemini_api_key ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {settingsForm.gemini_api_key ? 'Active ✅' : 'Pending ⚠️'}
                     </span>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">API Key</label>
                      <div className="relative">
                        <input type={showSecret.gemini ? "text" : "password"} value={settingsForm.gemini_api_key} onChange={(e) => handleInputChange('gemini_api_key', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:border-[#10B981] transition-all" />
                        <button onClick={() => setShowSecret(p => ({ ...p, gemini: !p.gemini }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                           {showSecret.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'rules' && (
              <motion.div 
                key="rules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><Sliders size={24} /></div>
                  <h3 className="text-2xl font-black text-gray-900">Listing Rules</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">Default Expiry Days</label>
                     <input type="number" min="1" max="365" value={settingsForm.default_expiry_days} onChange={(e) => handleInputChange('default_expiry_days', parseInt(e.target.value))} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-900 outline-none focus:border-[#10B981] transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">Max Images Per Listing</label>
                     <input type="number" min="1" max="30" value={settingsForm.max_images_per_listing} onChange={(e) => handleInputChange('max_images_per_listing', parseInt(e.target.value))} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-900 outline-none focus:border-[#10B981] transition-all" />
                  </div>
                </div>

                <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between mt-8">
                  <div>
                    <h5 className="font-bold text-gray-900">Auto-Approve Properties</h5>
                    <p className="text-sm text-gray-500">Automatically publish listings without manual review.</p>
                  </div>
                  <button 
                    onClick={() => handleInputChange('auto_approve_properties', !settingsForm.auto_approve_properties)}
                    className={`w-14 h-8 rounded-full transition-all relative ${settingsForm.auto_approve_properties ? 'bg-[#10B981]' : 'bg-gray-300'}`}
                  >
                     <motion.div 
                        initial={false}
                        animate={{ x: settingsForm.auto_approve_properties ? 28 : 4 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                     />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                 <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl"><Shield size={24} /></div>
                  <h3 className="text-2xl font-black text-gray-900">Security & System</h3>
                </div>

                <div className="space-y-6">
                   <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Change Admin Password</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">Current Password</label>
                        <input type="password" value={securityForm.current_password} onChange={(e) => setSecurityForm({...securityForm, current_password: e.target.value})} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-3 font-bold text-gray-900 outline-none focus:border-red-400 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">New Password</label>
                        <input type="password" value={securityForm.new_password} onChange={(e) => setSecurityForm({...securityForm, new_password: e.target.value})} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-3 font-bold text-gray-900 outline-none focus:border-red-400 transition-all" />
                      </div>
                   </div>
                   <button onClick={() => toast.success('Password update requested. (Demo view)')} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-colors">
                     Update Password
                   </button>
                </div>

                <div className="pt-8 border-t border-gray-100 space-y-6">
                    <div className="flex items-center justify-between p-6 bg-red-50/50 rounded-2xl border border-red-100">
                      <div>
                        <h5 className="font-bold text-red-900 flex items-center gap-2">Two-Factor Authentication <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest">Recommended</span></h5>
                        <p className="text-sm text-red-700/70 mt-1">Require an extra security code when logging in.</p>
                      </div>
                      <button 
                        onClick={() => setSecurityForm(prev => ({...prev, two_factor: !prev.two_factor}))}
                        className={`w-14 h-8 rounded-full transition-all relative ${securityForm.two_factor ? 'bg-red-500' : 'bg-red-200'}`}
                      >
                         <motion.div 
                            initial={false}
                            animate={{ x: securityForm.two_factor ? 28 : 4 }}
                            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                         />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                       <div>
                         <h5 className="font-bold text-gray-900">Clear System Cache</h5>
                         <p className="text-sm text-gray-500">Force clear all local cached data and refresh application state.</p>
                       </div>
                       <button onClick={() => {toast.success("Cache cleared successfully"); setTimeout(() => window.location.reload(), 1000);}} className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 font-black tracking-widest uppercase text-[10px] rounded-xl transition-all">
                         <AlertTriangle size={14} /> Clear Cache
                       </button>
                    </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
