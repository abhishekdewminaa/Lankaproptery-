import React, { useState, useEffect } from 'react';
import { AutomationsNode } from './types';
import { X, Settings, TestTube, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function NodeConfigPanel({ node, onClose, onUpdate }: { node: AutomationsNode | null, onClose: () => void, onUpdate: (id: string, conf: any) => void }) {
  const [localConfig, setLocalConfig] = useState<any>({});

  useEffect(() => {
    if (node) {
      setLocalConfig(node.data.config || {});
    }
  }, [node]);

  const handleChange = (key: string, value: any) => {
    const newConf = { ...localConfig, [key]: value };
    setLocalConfig(newConf);
    if (node) onUpdate(node.id, newConf);
  };

  if (!node) return null;

  const { type, label, category, icon } = node.data;

  const renderConfigFields = () => {
    switch (label) {
      case 'Scheduled Time (cron)':
        return (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Frequency</label>
              <select value={localConfig.frequency || ''} onChange={e => handleChange('frequency', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]">
                <option value="">Select frequency...</option>
                <option value="15min">Every 15 minutes</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom Cron</option>
              </select>
            </div>
            {localConfig.frequency === 'custom' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cron Expression</label>
                <input type="text" placeholder="0 9 * * *" value={localConfig.cron || ''} onChange={e => handleChange('cron', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]" />
              </div>
            )}
          </>
        );
      
      case 'New Property Published':
        return (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Filter by District</label>
              <select value={localConfig.district || ''} onChange={e => handleChange('district', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]">
                <option value="All">All Districts</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Property Type</label>
              <select value={localConfig.propType || ''} onChange={e => handleChange('propType', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]">
                <option value="All">All Types</option>
                <option value="House">House</option>
                <option value="Land">Land</option>
                <option value="Apartment">Apartment</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Min Price (LKR)</label>
              <input type="number" placeholder="0" value={localConfig.minPrice || ''} onChange={e => handleChange('minPrice', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]" />
            </div>
          </>
        );

      case 'Post to Facebook':
        return (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Page/Profile URL</label>
              <input type="text" placeholder="https://facebook.com/..." value={localConfig.pageUrl || ''} onChange={e => handleChange('pageUrl', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex justify-between">
                <span>Caption Template</span>
                <span className="text-gray-400">{'{{vars}} allowed'}</span>
              </label>
              <textarea rows={4} placeholder="Check out this new property: {{property.title}} for {{property.price_lkr}}!" value={localConfig.caption || ''} onChange={e => handleChange('caption', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20] resize-none" />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-700 font-medium">
               Note: Opens Facebook composer with pre-filled data. Cannot publish automatically without user approval.
            </div>
            <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-1.5 mt-2">
               <TestTube size={14} /> Test This Action
            </button>
          </>
        );
        
      case 'Generate AI Caption (Gemini)':
        return (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Platform</label>
              <select value={localConfig.platform || ''} onChange={e => handleChange('platform', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]">
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter/X</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tone</label>
              <select value={localConfig.tone || ''} onChange={e => handleChange('tone', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]">
                <option value="Professional">Professional</option>
                <option value="Casual">Casual</option>
                <option value="Luxury">Luxury</option>
                <option value="Urgent">Urgent / Exciting</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Language</label>
              <select value={localConfig.language || ''} onChange={e => handleChange('language', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]">
                <option value="English">English</option>
                <option value="Sinhala">Sinhala</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" checked={localConfig.hashtags || false} onChange={e => handleChange('hashtags', e.target.checked)} className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]" />
              <span className="text-xs font-bold text-gray-700">Include relevant hashtags</span>
            </label>
            <div className="space-y-1 mt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Output Variable Name</label>
              <input type="text" placeholder="ai_caption" value={localConfig.outputVar || ''} onChange={e => handleChange('outputVar', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono text-gray-700 outline-none focus:border-[#1B5E20]" />
            </div>
          </>
        );

      case 'Send Email':
        return (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">To Email</label>
              <input type="text" placeholder="{{lead.email}}" value={localConfig.to_email || ''} onChange={e => handleChange('to_email', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Subject</label>
              <input type="text" placeholder="New inquiry for {{property.ref_no}}" value={localConfig.subject || ''} onChange={e => handleChange('subject', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Body</label>
              <textarea rows={4} placeholder="Hi {{lead.name}},\nThanks for your interest..." value={localConfig.body || ''} onChange={e => handleChange('body', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20] resize-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">EmailJS Service ID</label>
              <input type="text" placeholder="service_..." value={localConfig.serviceId || ''} onChange={e => handleChange('serviceId', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">EmailJS Template ID</label>
              <input type="text" placeholder="template_..." value={localConfig.templateId || ''} onChange={e => handleChange('templateId', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]" />
            </div>
          </>
        );

      case 'If/Else':
        return (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Field</label>
              <input type="text" placeholder="property.price_lkr" value={localConfig.field || ''} onChange={e => handleChange('field', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono text-gray-700 outline-none focus:border-[#1B5E20]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Operator</label>
              <select value={localConfig.operator || ''} onChange={e => handleChange('operator', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]">
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="gt">Greater Than (&gt;)</option>
                <option value="lt">Less Than (&lt;)</option>
                <option value="exists">Exists</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Value</label>
              <input type="text" placeholder="10000000" value={localConfig.value || ''} onChange={e => handleChange('value', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-[#1B5E20]" />
            </div>
          </>
        );

      default:
        return (
          <div className="text-xs text-gray-400 font-medium italic">
            Configuration fields for this node will appear here.
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-[300px] h-full bg-[#fafafa] border-l border-gray-200 shadow-2xl absolute right-0 top-0 z-30 flex flex-col"
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
           <div className="flex items-center gap-2 text-gray-800">
             <Settings size={18} />
             <h3 className="text-sm font-black uppercase tracking-widest">Configuration</h3>
           </div>
           <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
              <X size={16} />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
           <div>
              <div className="flex justify-center mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-2xl">
                   {icon}
                 </div>
              </div>
              <h4 className="text-center text-base font-black text-gray-900 leading-tight mb-1">{label}</h4>
              <div className="text-center">
                 <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                   category === 'trigger' ? 'bg-blue-100 text-blue-700' :
                   category === 'action' ? 'bg-green-100 text-green-700' :
                   category === 'condition' ? 'bg-amber-100 text-amber-700' :
                   'bg-purple-100 text-purple-700'
                 }`}>
                   {category.toUpperCase()} NODE
                 </span>
              </div>
           </div>

           <div className="space-y-4">
              {renderConfigFields()}
           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
