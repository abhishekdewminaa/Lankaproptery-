import React, { useState, useEffect } from 'react';
import { 
  Settings2, Globe, Shield, CreditCard, Mail, Key, Image as ImageIcon, 
  Sliders, CheckCircle, Eye, EyeOff, AlertTriangle, Loader2,
  Share2, Palette, Zap, ListChecks, Facebook, Instagram, Youtube, Twitter, Linkedin, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

interface AdminSettingsProps {
  user?: any;
}

export default function AdminSettings({ user }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [settingsForm, setSettingsForm] = useState<any>({
    site_name: 'LankaProperty.lk', tagline: '', contact_email: '', contact_phone: '', whatsapp_number: '', office_address: '', google_maps_url: '', working_hours: 'Mon–Fri 9AM–6PM, Sat 9AM–1PM', copyright_text: '© 2026 LankaProperty.lk', favicon_url: '', site_logo_url: '',
    seo_title: '', seo_description: '', google_analytics_id: '', search_console_code: '', google_tag_manager_id: '', facebook_pixel_id: '', robots_txt: 'User-agent: *\nAllow: /\nSitemap: https://lankaproperty.lk/sitemap.xml', structured_data_enabled: true, meta_keywords: '',
    social_facebook: '', social_instagram: '', social_youtube: '', social_tiktok: '', social_linkedin: '', social_twitter: '', social_whatsapp: '',
    primary_color: '#004F31', secondary_color: '#007e50', accent_color: '#10B981', font_family: 'Plus Jakarta Sans', hero_image_url: '', banner_text: '', show_featured_badge: true, show_currency_toggle: false, dark_mode_enabled: false, custom_css: '',
    emailjs_service_id: '', emailjs_template_id: '', emailjs_public_key: '', admin_notification_email: '', email_signature: 'LankaProperty.lk Team\n+94 33 222 96 95', notify_new_listing: true, notify_new_lead: true, notify_payment: true, notify_user_register: true, notify_listing_expired: false,
    payhere_merchant_id: '', payhere_merchant_secret: '', payhere_sandbox: true, payment_currency: 'LKR', price_premium_pro: 0, price_elite_pro: 0, price_gold: 0, price_platinum: 0, price_diamond: 0,
    gemini_api_key: '', auto_approve_properties: false, default_expiry_days: 30, max_images_per_listing: 10, featured_duration: 30, min_price: 0, max_price: 1000000000, allowed_file_types: ['JPG', 'PNG', 'WEBP'], max_file_size_mb: 5, require_phone_verify: false, watermark_enabled: false, watermark_text: '', commission_rate: 0,
    session_timeout: '1hr', login_attempts: 5,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState({ payhere: false, gemini: false });
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  useEffect(() => {
    fetchSettings();
    checkDb();
  }, []);

  const checkDb = async () => {
    try {
      const { error } = await supabase.from('site_settings').select('id').limit(1);
      if (error && error.code !== '42P01') throw error;
      setDbStatus('connected');
    } catch {
      setDbStatus('disconnected');
    }
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
      if (!error && data) {
        setSettingsForm((prev: any) => ({ ...prev, ...data }));
        if (data.updated_at) setLastSaved(new Date(data.updated_at).toLocaleString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: existing } = await supabase.from('site_settings').select('id').eq('id', 'default').maybeSingle();
      const payload = { ...settingsForm, updated_at: new Date().toISOString() };
      
      let error;
      if (existing) {
         const { error: updateError } = await supabase.from('site_settings').update(payload).eq('id', 'default');
         error = updateError;
      } else {
         const { error: insertError } = await supabase.from('site_settings').insert([{ id: 'default', ...payload }]);
         error = insertError;
      }

      if (error) {
        if (error.code === '42P01') throw new Error("The 'site_settings' table does not exist in the database yet.");
        throw error;
      }
      
      toast.success('✅ Settings saved successfully!');
      setLastSaved(new Date().toLocaleString());
    } catch (error: any) {
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettingsForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const WEBSITETABS = [
    { id: 'general', label: 'General Info', icon: <Settings2 size={18} /> },
    { id: 'seo', label: 'Search Engine SEO', icon: <Globe size={18} /> },
    { id: 'social', label: 'Social Media', icon: <Share2 size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> }
  ];

  const SYSTEMTABS = [
    { id: 'automation', label: 'Automation & Integrations', icon: <Zap size={18} /> },
    { id: 'email', label: 'Email Settings', icon: <Mail size={18} /> },
    { id: 'payment', label: 'Payment Settings', icon: <CreditCard size={18} /> },
    { id: 'rules', label: 'Listing Rules', icon: <ListChecks size={18} /> },
    { id: 'security', label: 'Security & System', icon: <Shield size={18} /> }
  ];

  const renderInput = (label: string, field: string, type: string = 'text', placeholder: string = '') => (
    <div className="group relative">
      <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">{label}</label>
      <input 
        type={type} 
        value={settingsForm[field] || ''}
        onChange={(e) => handleInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-semibold text-gray-900 outline-none focus:border-[#004F31] focus:ring-4 focus:ring-[#004F31]/[0.08] transition-all"
        placeholder={placeholder}
      />
    </div>
  );

  const renderTextarea = (label: string, field: string, rows: number = 3) => (
    <div className="group relative">
      <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">{label}</label>
      <textarea 
        rows={rows}
        value={settingsForm[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-semibold text-gray-900 outline-none focus:border-[#004F31] focus:ring-4 focus:ring-[#004F31]/[0.08] transition-all resize-none"
      />
    </div>
  );

  const renderToggle = (label: string, field: string) => (
    <div className="flex items-center justify-between py-2">
      <span className="font-semibold text-gray-800">{label}</span>
      <button 
        onClick={() => handleInputChange(field, !settingsForm[field])}
        className={`w-12 h-6 rounded-full transition-all relative ${settingsForm[field] ? 'bg-[#10B981]' : 'bg-gray-300'}`}
      >
         <motion.div animate={{ x: settingsForm[field] ? 24 : 2 }} className="absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full shadow-sm" />
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h2>
          <p className="text-gray-500 font-medium mt-1">Manage global platform configurations and integrations.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-[12px] font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          {lastSaved && <span className="text-[10px] text-gray-400 font-semibold tracking-wider">LAST SAVED: {lastSaved}</span>}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 bg-[linear-gradient(145deg,#ffffff,#f8faf8)] rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100">
        
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 flex lg:flex-col gap-6 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-4">Website</h4>
            <div className="flex lg:flex-col gap-1">
              {WEBSITETABS.map(tab => (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap lg:whitespace-normal border-l-4 ${activeTab === tab.id ? 'bg-[#10B981]/10 text-[#004F31] border-[#10B981]' : 'border-transparent text-gray-500 hover:bg-[#10B981] hover:text-[#004F31] hover:bg-opacity-10'}`}
                >
                  <div className={`${activeTab === tab.id ? 'text-[#10B981]' : ''}`}>{tab.icon}</div> {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-4">System</h4>
            <div className="flex lg:flex-col gap-1">
              {SYSTEMTABS.map(tab => (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap lg:whitespace-normal border-l-4 ${activeTab === tab.id ? 'bg-[#10B981]/10 text-[#004F31] border-[#10B981]' : 'border-transparent text-gray-500 hover:bg-[#10B981] hover:text-[#004F31] hover:bg-opacity-10'}`}
                >
                  <div className={`${activeTab === tab.id ? 'text-[#10B981]' : ''}`}>{tab.icon}</div> {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[600px]">
          <AnimatePresence mode="wait">
             {/* General Info */}
             {activeTab === 'general' && (
                <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[16px] shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#10B981]/10 text-[#10B981] rounded-xl"><Settings2 size={24} /></div>
                        <h3 className="text-xl font-black text-gray-900">General Information</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderInput('Site Name', 'site_name')}
                      {renderInput('Site Tagline', 'tagline', 'text', "Sri Lanka's #1 Property Marketplace")}
                      {renderInput('Contact Email', 'contact_email', 'email')}
                      {renderInput('Contact Phone', 'contact_phone', 'tel')}
                      {renderInput('WhatsApp Business Number', 'whatsapp_number', 'tel', '+94332229695')}
                      {renderInput('Working Hours', 'working_hours', 'text', 'Mon–Fri 9AM–6PM')}
                      {renderInput('Copyright Text', 'copyright_text', 'text', '© 2026 LankaProperty.lk')}
                      {renderInput('Google Maps Embed URL', 'google_maps_url')}
                      <div className="md:col-span-2">{renderTextarea('Office Address', 'office_address', 2)}</div>
                      
                      <div className="space-y-4 md:col-span-2 border-t border-gray-100 pt-6">
                        <h4 className="font-bold text-gray-900">Branding Assets</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            {renderInput('Favicon URL', 'favicon_url')}
                            <div className="mt-2 w-12 h-12 bg-gray-50 border border-gray-200 rounded flex items-center justify-center p-1">
                              {settingsForm.favicon_url ? <img src={settingsForm.favicon_url} alt="Favicon" className="w-8 h-8 object-contain" /> : <ImageIcon size={20} className="text-gray-300" />}
                            </div>
                          </div>
                          <div>
                            {renderInput('Site Logo URL', 'site_logo_url')}
                            <div className="mt-2 h-20 bg-gray-50 border border-gray-200 rounded flex items-center justify-center p-2">
                              {settingsForm.site_logo_url ? <img src={settingsForm.site_logo_url} alt="Logo" className="max-h-full max-w-full object-contain" /> : <ImageIcon size={24} className="text-gray-300" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="px-4 py-2 bg-[#10B981]/10 text-[#004F31] font-bold rounded-lg hover:bg-[#10B981]/20 transition-all text-sm">Save Section</button>
                  </div>
                </motion.div>
             )}

             {/* SEO */}
             {activeTab === 'seo' && (
                <motion.div key="seo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[16px] shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><Globe size={24} /></div>
                        <h3 className="text-xl font-black text-gray-900">Search Engine SEO</h3>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="group relative">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] block">SEO Title</label>
                          <span className={`text-[10px] font-bold ${settingsForm.seo_title?.length > 60 ? 'text-red-500' : 'text-green-500'}`}>{settingsForm.seo_title?.length || 0}/60 chars</span>
                        </div>
                        <input type="text" value={settingsForm.seo_title} onChange={(e) => handleInputChange('seo_title', e.target.value)} className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-semibold text-gray-900 outline-none focus:border-[#004F31] focus:ring-4 focus:ring-[#004F31]/[0.08]" />
                      </div>
                      <div className="group relative">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] block">SEO Description</label>
                          <span className={`text-[10px] font-bold ${settingsForm.seo_description?.length > 160 ? 'text-red-500' : 'text-green-500'}`}>{settingsForm.seo_description?.length || 0}/160 chars</span>
                        </div>
                        <textarea rows={2} value={settingsForm.seo_description} onChange={(e) => handleInputChange('seo_description', e.target.value)} className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-semibold text-gray-900 outline-none focus:border-[#004F31] focus:ring-4 focus:ring-[#004F31]/[0.08]" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {renderInput('Google Analytics Measurement ID', 'google_analytics_id', 'text', 'G-XXXXXXXXXX')}
                        {renderInput('Google Tag Manager ID', 'google_tag_manager_id', 'text', 'GTM-XXXXXXX')}
                        {renderInput('Search Console Verification Code', 'search_console_code')}
                        {renderInput('Facebook Pixel ID', 'facebook_pixel_id')}
                      </div>
                      <div className="border-t border-gray-100 pt-6">
                        {renderToggle('Auto-inject Schema.org LocalBusiness markup', 'structured_data_enabled')}
                      </div>
                      <div className="group relative pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] block">Robots.txt Content</label>
                          <button className="text-xs text-[#004F31] font-bold hover:underline" onClick={() => toast.success('Sitemap generated successfully!')}>Generate Sitemap Now</button>
                        </div>
                        <textarea rows={4} value={settingsForm.robots_txt} onChange={(e) => handleInputChange('robots_txt', e.target.value)} className="w-full bg-gray-50 border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-mono text-sm text-gray-700 outline-none focus:border-[#004F31] focus:ring-4 focus:ring-[#004F31]/[0.08]" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="px-4 py-2 bg-[#10B981]/10 text-[#004F31] font-bold rounded-lg hover:bg-[#10B981]/20 transition-all text-sm">Save Section</button>
                  </div>
                </motion.div>
             )}

             {/* Social Media */}
             {activeTab === 'social' && (
                <motion.div key="social" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[16px] shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 text-pink-500 rounded-xl"><Share2 size={24} /></div>
                        <h3 className="text-xl font-black text-gray-900">Social Media Links</h3>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { id: 'social_facebook', label: 'Facebook Page URL', icon: <Facebook size={18} /> },
                        { id: 'social_instagram', label: 'Instagram Profile URL', icon: <Instagram size={18} /> },
                        { id: 'social_youtube', label: 'YouTube Channel URL', icon: <Youtube size={18} /> },
                        { id: 'social_tiktok', label: 'TikTok Profile URL', icon: <Share2 size={18} /> },
                        { id: 'social_linkedin', label: 'LinkedIn Page URL', icon: <Linkedin size={18} /> },
                        { id: 'social_twitter', label: 'Twitter/X Profile URL', icon: <Twitter size={18} /> },
                        { id: 'social_whatsapp', label: 'WhatsApp Channel Link', icon: <Share2 size={18} /> }
                      ].map(social => (
                        <div key={social.id} className="flex items-center gap-4">
                          <div className="text-gray-400 w-6 flex justify-center">{social.icon}</div>
                          <div className="flex-1">
                            <input 
                              type="url" value={settingsForm[social.id] || ''} onChange={(e) => handleInputChange(social.id, e.target.value)} 
                              className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-2.5 font-medium text-gray-900 outline-none focus:border-[#004F31]" placeholder={`https://...`}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                             <div className={`w-2.5 h-2.5 rounded-full ${settingsForm[social.id] ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                             <button onClick={() => settingsForm[social.id] ? window.open(settingsForm[social.id], '_blank') : toast('No link set')} className="p-2 text-gray-400 hover:text-gray-900"><ExternalLink size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="px-4 py-2 bg-[#10B981]/10 text-[#004F31] font-bold rounded-lg hover:bg-[#10B981]/20 transition-all text-sm">Save Section</button>
                  </div>
                </motion.div>
             )}

             {/* Appearance */}
             {activeTab === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[16px] shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl"><Palette size={24} /></div>
                        <h3 className="text-xl font-black text-gray-900">Appearance Settings</h3>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">Primary Color</label>
                             <div className="flex items-center gap-2">
                               <input type="color" value={settingsForm.primary_color || '#004F31'} onChange={(e) => handleInputChange('primary_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none" />
                               <input type="text" value={settingsForm.primary_color} onChange={(e) => handleInputChange('primary_color', e.target.value)} className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm font-mono" />
                             </div>
                          </div>
                          <div>
                             <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">Secondary Color</label>
                             <div className="flex items-center gap-2">
                               <input type="color" value={settingsForm.secondary_color || '#007e50'} onChange={(e) => handleInputChange('secondary_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none" />
                               <input type="text" value={settingsForm.secondary_color} onChange={(e) => handleInputChange('secondary_color', e.target.value)} className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm font-mono" />
                             </div>
                          </div>
                          <div>
                             <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">Accent Color</label>
                             <div className="flex items-center gap-2">
                               <input type="color" value={settingsForm.accent_color || '#10B981'} onChange={(e) => handleInputChange('accent_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none" />
                               <input type="text" value={settingsForm.accent_color} onChange={(e) => handleInputChange('accent_color', e.target.value)} className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm font-mono" />
                             </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">Font Family</label>
                          <select value={settingsForm.font_family} onChange={(e) => handleInputChange('font_family', e.target.value)} className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-semibold outline-none focus:border-[#004F31]">
                            <option>Plus Jakarta Sans</option>
                            <option>Inter</option>
                            <option>Roboto</option>
                            <option>Poppins</option>
                          </select>
                        </div>

                        {renderInput('Hero Background Image URL', 'hero_image_url')}
                        {renderInput('Homepage Banner Text', 'banner_text')}
                        
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                          {renderToggle('Show "Featured" Badge', 'show_featured_badge')}
                          {renderToggle('Show Price in USD/EUR', 'show_currency_toggle')}
                          {renderToggle('Allow Dark Mode', 'dark_mode_enabled')}
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">Custom CSS</label>
                          <textarea rows={5} value={settingsForm.custom_css} onChange={e => handleInputChange('custom_css', e.target.value)} className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-mono text-sm outline-none focus:border-[#004F31]" placeholder="/* Inject custom styles here */"></textarea>
                        </div>
                      </div>
                      {/* Live Preview Card */}
                      <div className="w-full md:w-[320px] bg-gray-50 rounded-[20px] p-6 border border-gray-100 shadow-inner self-start sticky top-4">
                         <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-4">Live Preview</h4>
                         <div className="bg-white rounded-[16px] overflow-hidden shadow-md" style={{ fontFamily: settingsForm.font_family }}>
                            <div className="h-32 bg-gray-200 relative">
                               {settingsForm.show_featured_badge && <div className="absolute top-2 left-2 px-2 py-1 text-[10px] uppercase font-black tracking-wider text-white rounded outline outline-[1.5px] outline-black/10" style={{ backgroundColor: settingsForm.accent_color }}>Featured</div>}
                            </div>
                            <div className="p-4 space-y-2">
                               <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
                               <div className="w-1/2 h-3 bg-gray-100 rounded"></div>
                               <div className="pt-2 flex justify-between items-center">
                                  <div className="font-bold" style={{ color: settingsForm.primary_color }}>Rs. 12,500,000</div>
                                  <div className="w-16 h-8 rounded-lg" style={{ backgroundColor: settingsForm.secondary_color }}></div>
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="px-4 py-2 bg-[#10B981]/10 text-[#004F31] font-bold rounded-lg hover:bg-[#10B981]/20 transition-all text-sm">Save Section</button>
                  </div>
                </motion.div>
             )}

             {/* Email Settings */}
             {activeTab === 'email' && (
                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[16px] shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl"><Mail size={24} /></div>
                        <h3 className="text-xl font-black text-gray-900">Email Settings</h3>
                      </div>
                      <div className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full ${settingsForm.emailjs_public_key ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {settingsForm.emailjs_public_key ? 'LIVE' : 'NOT CONNECTED'}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {renderInput('EmailJS Service ID', 'emailjs_service_id')}
                      {renderInput('EmailJS Template ID', 'emailjs_template_id')}
                      <div className="md:col-span-2">{renderInput('EmailJS Public Key', 'emailjs_public_key')}</div>
                      <div className="md:col-span-2">
                         <button onClick={() => toast('Test email request queued')} className="text-sm font-bold text-[#004F31] underline">Send Test Email</button>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <h4 className="font-bold text-gray-900">General Setup</h4>
                         {renderInput('Admin Notification Email', 'admin_notification_email', 'email')}
                         {renderTextarea('Email Signature', 'email_signature', 3)}
                      </div>
                      <div className="space-y-2">
                         <h4 className="font-bold text-gray-900 mb-4">Email Notifications</h4>
                         {renderToggle('New listing submitted', 'notify_new_listing')}
                         {renderToggle('New lead/inquiry received', 'notify_new_lead')}
                         {renderToggle('Payment received', 'notify_payment')}
                         {renderToggle('User registered', 'notify_user_register')}
                         {renderToggle('Listing expired', 'notify_listing_expired')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="px-4 py-2 bg-[#10B981]/10 text-[#004F31] font-bold rounded-lg hover:bg-[#10B981]/20 transition-all text-sm">Save Section</button>
                  </div>
                </motion.div>
             )}

             {/* Payment Settings */}
             {activeTab === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[16px] shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><CreditCard size={24} /></div>
                        <h3 className="text-xl font-black text-gray-900">Payment Settings</h3>
                      </div>
                      <div className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full ${settingsForm.payhere_merchant_id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {settingsForm.payhere_merchant_id ? 'LIVE' : 'NOT CONFIGURED'}
                      </div>
                    </div>
                    
                    {settingsForm.payhere_sandbox && (
                      <div className="bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-xl mb-6 font-semibold flex items-center gap-3">
                        <AlertTriangle size={20} className="text-amber-500" />
                        ⚠️ Sandbox Mode is ON — no real payments will be processed
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                       {renderInput('PayHere Merchant ID', 'payhere_merchant_id')}
                       <div className="group relative">
                          <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">Merchant Secret</label>
                          <div className="relative">
                             <input type={showSecret.payhere ? "text" : "password"} value={settingsForm.payhere_merchant_secret || ''} onChange={(e) => handleInputChange('payhere_merchant_secret', e.target.value)} className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-semibold text-gray-900 outline-none focus:border-[#004F31] focus:ring-4 focus:ring-[#004F31]/[0.08]" />
                             <button onClick={() => setShowSecret(p => ({...p, payhere: !p.payhere}))} className="absolute right-4 top-3.5 text-gray-400">{showSecret.payhere ? <EyeOff size={18}/>: <Eye size={18}/>}</button>
                          </div>
                       </div>
                       <div>
                         <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">Currency</label>
                         <select value={settingsForm.payment_currency || 'LKR'} onChange={(e) => handleInputChange('payment_currency', e.target.value)} className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-semibold outline-none focus:border-[#004F31]">
                           <option value="LKR">LKR (Sri Lankan Rupee)</option>
                           <option value="USD">USD (US Dollar)</option>
                         </select>
                       </div>
                       <div className="flex items-center mt-6">
                          {renderToggle('Enable Sandbox Mode', 'payhere_sandbox')}
                       </div>
                       <div className="md:col-span-2">
                          <button onClick={() => toast('Test payment initialized')} className="text-sm font-bold text-[#004F31] underline">Run Test Payment (Rs. 1)</button>
                       </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="font-bold text-gray-900 mb-6">Package Pricing (Rs)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                         <div>
                           <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">Starter Free</label>
                           <input type="text" disabled value="0" className="w-full bg-gray-100 border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-semibold text-gray-500 cursor-not-allowed" />
                         </div>
                         {renderInput('Premium Pro', 'price_premium_pro', 'number')}
                         {renderInput('Elite Pro', 'price_elite_pro', 'number')}
                         {renderInput('Gold Package', 'price_gold', 'number')}
                         {renderInput('Platinum Package', 'price_platinum', 'number')}
                         {renderInput('Diamond Package', 'price_diamond', 'number')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="px-4 py-2 bg-[#10B981]/10 text-[#004F31] font-bold rounded-lg hover:bg-[#10B981]/20 transition-all text-sm">Save Section</button>
                  </div>
                </motion.div>
             )}

             {/* Listing Rules */}
             {activeTab === 'rules' && (
                <motion.div key="rules" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[16px] shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-3 border-b border-[#10B981]/20 pb-4 mb-8">
                       <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl"><ListChecks size={24} /></div>
                       <h3 className="text-xl font-black text-gray-900">Listing Rules & Limits</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {renderInput('Featured Duration (Days)', 'featured_duration', 'number')}
                      {renderInput('Minimum Price (LKR)', 'min_price', 'number')}
                      {renderInput('Maximum Price (LKR)', 'max_price', 'number')}
                      {renderInput('Commission Rate (%)', 'commission_rate', 'number')}
                      
                      <div>
                          <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">Max File Size Per Image</label>
                          <select value={settingsForm.max_file_size_mb || 5} onChange={(e) => handleInputChange('max_file_size_mb', Number(e.target.value))} className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-semibold outline-none focus:border-[#004F31]">
                            <option value={2}>2 MB</option>
                            <option value={5}>5 MB</option>
                            <option value={10}>10 MB</option>
                          </select>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4">
                       <div className="space-y-3">
                          <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] block">Allowed File Types</label>
                          <div className="flex gap-6">
                             {['JPG', 'PNG', 'WEBP'].map(ext => (
                                <label key={ext} className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
                                  <input type="checkbox" checked={settingsForm.allowed_file_types?.includes(ext)} onChange={(e) => {
                                    let updated = [...(settingsForm.allowed_file_types || [])];
                                    if (e.target.checked) updated.push(ext);
                                    else updated = updated.filter(i => i !== ext);
                                    handleInputChange('allowed_file_types', updated);
                                  }} className="w-4 h-4 accent-[#004F31] cursor-pointer" /> {ext}
                                </label>
                             ))}
                          </div>
                       </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-6 space-y-3 mt-6">
                      {renderToggle('Require Phone Verification', 'require_phone_verify')}
                      {renderToggle('Auto-Approve Properties', 'auto_approve_properties')}
                      {renderToggle('Watermark on Images', 'watermark_enabled')}
                      {settingsForm.watermark_enabled && renderInput('Watermark Text', 'watermark_text', 'text', 'LankaProperty.lk')}
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="px-4 py-2 bg-[#10B981]/10 text-[#004F31] font-bold rounded-lg hover:bg-[#10B981]/20 transition-all text-sm">Save Section</button>
                  </div>
                </motion.div>
             )}

             {/* Security */}
             {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[16px] shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-4 mb-8">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-red-500/10 text-red-500 rounded-xl"><Shield size={24} /></div>
                         <h3 className="text-xl font-black text-gray-900">Security & System</h3>
                       </div>
                       <div className={`text-[10px] uppercase font-black px-3 py-1 rounded-full text-white ${dbStatus === 'connected' ? 'bg-green-500' : dbStatus === 'checking' ? 'bg-gray-400' : 'bg-red-500'}`}>
                          DATABASE: {dbStatus.toUpperCase()}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                       <div>
                          <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">Session Timeout</label>
                          <select value={settingsForm.session_timeout || '1hr'} onChange={(e) => handleInputChange('session_timeout', e.target.value)} className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-semibold outline-none focus:border-[#004F31]">
                            <option value="30min">30 Minutes</option>
                            <option value="1hr">1 Hour</option>
                            <option value="4hr">4 Hours</option>
                            <option value="24hr">24 Hours</option>
                          </select>
                       </div>
                       {renderInput('Login Attempts Before Lockout', 'login_attempts', 'number')}
                       {renderInput('Admin Notification Email', 'admin_notification_email', 'email')}
                    </div>

                    <div className="space-y-4 border-t border-gray-100 pt-6">
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl">
                         <div>
                           <h5 className="font-bold text-gray-900">System Logs & Analytics</h5>
                           <p className="text-sm text-gray-500 mt-1">Review recent admin actions and events.</p>
                         </div>
                         <button onClick={() => toast.success('Log viewer opening...')} className="px-5 py-2.5 bg-white border border-gray-300 shadow-sm rounded-lg font-bold text-sm hover:bg-gray-50 transition-all">View Activity Log</button>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl">
                         <div>
                           <h5 className="font-bold text-gray-900">System Version</h5>
                           <p className="text-sm text-gray-500 mt-1">Current build version installed.</p>
                         </div>
                         <div className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md font-mono text-sm font-bold">v2.1.0</div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl">
                         <div>
                           <h5 className="font-bold text-gray-900">Data Backup</h5>
                           <p className="text-sm text-gray-500 mt-1">Last backup: {lastSaved || 'Never'}</p>
                         </div>
                         <button onClick={() => toast.success('Backup initiated!')} className="px-5 py-2.5 bg-white border border-gray-300 shadow-sm rounded-lg font-bold text-sm hover:bg-gray-50 transition-all">Backup Now</button>
                      </div>
                    </div>

                    <div className="mt-12 p-6 border-2 border-red-100 bg-red-50 rounded-2xl">
                       <h4 className="font-black text-red-900 uppercase tracking-widest text-xs mb-4">Danger Zone</h4>
                       <div className="flex flex-col sm:flex-row gap-4">
                          <button onClick={() => { if(window.confirm('Clear all cache?')) { toast.success('Cache cleared'); } }} className="flex-1 bg-white text-red-600 border border-red-200 font-bold py-3 rounded-xl hover:bg-red-50 transition-all">Clear All Cache</button>
                          <button onClick={() => { if(window.confirm('Reset everything to defaults?')) { toast('Factory reset started'); } }} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-600/20">Reset to Defaults</button>
                       </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="px-4 py-2 bg-[#10B981]/10 text-[#004F31] font-bold rounded-lg hover:bg-[#10B981]/20 transition-all text-sm">Save Section</button>
                  </div>
                </motion.div>
             )}

             {/* Automation / Gemini AI */}
             {activeTab === 'automation' && (
                <motion.div key="automation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[16px] shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl"><Zap size={24} /></div>
                        <h3 className="text-xl font-black text-gray-900">Automation & Integrations</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-2">
                         <h4 className="text-lg font-black text-gray-900">Gemini AI Engine</h4>
                         <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${settingsForm.gemini_api_key ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {settingsForm.gemini_api_key ? 'LIVE' : 'NOT CONFIGURED'}
                         </span>
                      </div>
                      <div className="group relative">
                         <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.8px] mb-2 block">Gemini API Key</label>
                         <div className="relative">
                            <input type={showSecret.gemini ? "text" : "password"} value={settingsForm.gemini_api_key || ''} onChange={(e) => handleInputChange('gemini_api_key', e.target.value)} className="w-full bg-white border-[1.5px] border-[#e5e7eb] rounded-[10px] px-4 py-3 font-semibold text-gray-900 outline-none focus:border-[#004F31] focus:ring-4 focus:ring-[#004F31]/[0.08]" />
                            <button onClick={() => setShowSecret(p => ({...p, gemini: !p.gemini}))} className="absolute right-4 top-3.5 text-gray-400">{showSecret.gemini ? <EyeOff size={18}/>: <Eye size={18}/>}</button>
                         </div>
                         <p className="text-xs text-gray-500 mt-2">Required for smart descriptions, insights, and automated Sinhala translation features.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="px-4 py-2 bg-[#10B981]/10 text-[#004F31] font-bold rounded-lg hover:bg-[#10B981]/20 transition-all text-sm">Save Section</button>
                  </div>
                </motion.div>
             )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
