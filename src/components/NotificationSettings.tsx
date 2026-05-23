import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { triggerNotification } from '../services/notificationService';
import { 
  Bell, 
  Mail, 
  Phone, 
  CheckCircle, 
  Loader2, 
  MessageSquare, 
  Settings, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

interface NotificationSettingsProps {
  user: any;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Preference States
  const [preferences, setPreferences] = useState({
    notify_email: true,
    notify_whatsapp: false,
    notify_browser: true,
    whatsapp_api_key: '',
    phone: '',
    notify_summary: false,
    notify_weekly: false,
  });

  const [testingWhatsapp, setTestingWhatsapp] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.email) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .or(`id.eq."${user.id}",email.eq."${user.email}"`)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPreferences({
            notify_email: data.notify_email !== false, // default true
            notify_whatsapp: !!data.notify_whatsapp,
            notify_browser: data.notify_browser !== false, // default true
            whatsapp_api_key: data.whatsapp_api_key || '',
            phone: data.phone || '',
            notify_summary: !!data.notify_summary,
            notify_weekly: !!data.notify_weekly,
          });
        }
      } catch (err) {
        console.error('Failed to load notification preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key: keyof typeof preferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSavePreferences = async () => {
    if (!user?.email) return;
    setSaving(true);
    setSuccess(false);

    try {
      // First, check if agent record exists to update or insert
      const { data: agentExists } = await supabase
        .from('agents')
        .select('id')
        .or(`id.eq."${user.id}",email.eq."${user.email}"`)
        .maybeSingle();

      const upsertPayload = {
        notify_email: preferences.notify_email,
        notify_whatsapp: preferences.notify_whatsapp,
        notify_browser: preferences.notify_browser,
        whatsapp_api_key: preferences.whatsapp_api_key,
        phone: preferences.phone,
        notify_summary: preferences.notify_summary,
        notify_weekly: preferences.notify_weekly,
        updated_at: new Date().toISOString()
      };

      let error;
      if (agentExists) {
        const updateResult = await supabase
          .from('agents')
          .update(upsertPayload)
          .or(`id.eq."${user.id}",email.eq."${user.email}"`);
        error = updateResult.error;
      } else {
        const insertResult = await supabase
          .from('agents')
          .insert([{ 
            id: user.id, 
            email: user.email, 
            name: user.email.split('@')[0],
            ...upsertPayload 
          }]);
        error = insertResult.error;
      }

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!preferences.phone || !preferences.whatsapp_api_key) {
      setTestSuccess('Please configure your Phone Number and WhatsApp API Key first.');
      return;
    }

    setTestingWhatsapp(true);
    setTestSuccess(null);

    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'new_inquiry',
          data: {
            property_title: '🔑 Test Property Connection',
            district: 'Colombo',
            city: 'Colombo 03',
            price_lkr: '45,000,000',
            client_name: 'LankaProperty.lk system',
            client_phone: '0771234567',
            client_email: user?.email || 'test@client.com',
            message: 'Congratulations! Your WhatsApp lead routing setup works perfectly with CallMeBot! 🎉',
            agent_phone: preferences.phone,
            agent_whatsapp_key: preferences.whatsapp_api_key
          }
        })
      });

      if (response.ok) {
        setTestSuccess('✅ Test WhatsApp alert dispatched successfully! Check your phone.');
      } else {
        setTestSuccess('❌ Send failed. Verify your CallMeBot API key and activated number.');
      }
    } catch (err) {
      setTestSuccess('❌ Connection error to notification API endpoint.');
    } finally {
      setTestingWhatsapp(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-green mx-auto mb-4" size={40} />
          <p className="text-sm font-bold text-gray-500">Loading Notification Preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-150">
        <div>
          <h3 className="text-xl font-black text-dark-navy">Inquiries & Alerts CRM</h3>
          <p className="text-xs text-gray-400 font-medium mt-1">Configure instantly routed customer lead alerts</p>
        </div>
        <div className="p-3 bg-brand-green/10 text-brand-green rounded-2xl">
          <Bell size={20} />
        </div>
      </div>

      {/* Main Form content */}
      <div className="space-y-8">
        
        {/* Email Alerts */}
        <div className="flex items-start justify-between gap-4 p-5 bg-gray-50/50 hover:bg-gray-50 rounded-3xl transition-all border border-gray-100/30">
          <div className="flex gap-4">
            <div className="p-3 bg-white text-brand-green rounded-2xl border border-gray-100">
              <Mail size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-dark-navy">Email Lead Notifications</h4>
              <p className="text-xs text-gray-400 font-medium mt-0.5 max-w-md">
                Receive comprehensive email breakdowns of client names, locations, and tailored messages immediately on inquiry submissions.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('notify_email')}
            className={`w-12 h-6 pl-1 pr-1 rounded-full transition-colors relative outline-none flex items-center ${
              preferences.notify_email ? 'bg-brand-green justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>

        {/* WhatsApp Real-time Alerts */}
        <div className="p-5 bg-gray-50/50 hover:bg-gray-50 rounded-3xl transition-all border border-gray-100/30 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="p-3 bg-white text-emerald-600 rounded-2xl border border-gray-100">
                <MessageSquare size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-dark-navy">WhatsApp Alerts (via CallMeBot)</h4>
                <p className="text-xs text-gray-400 font-medium mt-0.5 max-w-sm">
                  Route verified leads instantly onto your WhatsApp chat. Activated only after configuring free API keys.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('notify_whatsapp')}
              className={`w-12 h-6 pl-1 pr-1 rounded-full transition-colors relative outline-none flex items-center shrink-0 ${
                preferences.notify_whatsapp ? 'bg-brand-green justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <span className="w-4 h-4 bg-white rounded-full shadow" />
            </button>
          </div>

          {/* Conditional settings for WhatsApp */}
          {preferences.notify_whatsapp && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 mt-2 space-y-4">
              <h5 className="text-xs font-black text-dark-navy uppercase tracking-wider">WhatsApp Activation Detail</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Agent Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +94771234567"
                    value={preferences.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-green/20 outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 font-bold">Include country code (e.g., +94 for Sri Lanka)</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    CallMeBot API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Enter bot integration apikey"
                    value={preferences.whatsapp_api_key}
                    onChange={(e) => handleInputChange('whatsapp_api_key', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-green/20 outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 font-bold">Paste the activation apikey retrieved from CallMeBot</p>
                </div>
              </div>

              {/* Activation Guides */}
              <div className="bg-brand-green/5 p-4 rounded-xl border border-brand-green/10 text-xs text-emerald-800 space-y-2">
                <p className="font-bold border-b border-brand-green/15 pb-1 flex items-center gap-1.5">
                  <Smartphone size={14} />
                  How to trigger CallMeBot Setup:
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Add <b>+34 644 66 21 54</b> to your phone contacts.</li>
                  <li>Send a WhatsApp message: <b>"I allow callmebot to send me messages"</b></li>
                  <li>Wait for the reply containing your unique <b>apikey</b>.</li>
                  <li>Fill in your details above, save, and hit the test alert trigger!</li>
                </ol>
              </div>

              {/* Test WhatsApp trigger */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  disabled={testingWhatsapp}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-dark-navy hover:bg-gray-100 hover:border-gray-300 text-xs font-black rounded-xl cursor-pointer transition-colors flex items-center gap-2"
                >
                  {testingWhatsapp ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-brand-green" />
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <MessageSquare size={14} className="text-emerald-500" />
                      Test Connection
                    </>
                  )}
                </button>
                {testSuccess && (
                  <p className="text-xs font-bold text-emerald-700 animate-fade-in">{testSuccess}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Browser Push alerts */}
        <div className="flex items-start justify-between gap-4 p-5 bg-gray-50/50 hover:bg-gray-50 rounded-3xl transition-all border border-gray-100/30">
          <div className="flex gap-4">
            <div className="p-3 bg-white text-blue-600 rounded-2xl border border-gray-100">
              <Settings size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-dark-navy">Browser Push Alerts</h4>
              <p className="text-xs text-gray-400 font-medium mt-0.5 max-w-md">
                Show real-time notifications on your desktop or phone browser, accompanied by sound alerts immediately on any inquiry entry!
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('notify_browser')}
            className={`w-12 h-6 pl-1 pr-1 rounded-full transition-colors relative outline-none flex items-center ${
              preferences.notify_browser ? 'bg-brand-green justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>

        {/* Daily Summary Email */}
        <div className="flex items-start justify-between gap-4 p-5 bg-gray-50/50 hover:bg-gray-50 rounded-3xl transition-all border border-gray-100/30">
          <div className="flex gap-4">
            <div className="p-3 bg-white text-indigo-600 rounded-2xl border border-gray-100">
              <Mail size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-dark-navy">Daily Digest Summary Email</h4>
              <p className="text-xs text-gray-400 font-medium mt-0.5 max-w-md">
                Receive a single, clean consolidated daily email report gathering all leads, and general status conversions for simple bookkeeping.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('notify_summary')}
            className={`w-12 h-6 pl-1 pr-1 rounded-full transition-colors relative outline-none flex items-center ${
              preferences.notify_summary ? 'bg-brand-green justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>

        {/* Weekly Report Email */}
        <div className="flex items-start justify-between gap-4 p-5 bg-gray-50/50 hover:bg-gray-50 rounded-3xl transition-all border border-gray-100/30">
          <div className="flex gap-4">
            <div className="p-3 bg-white text-orange-600 rounded-2xl border border-gray-100">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-dark-navy">Weekly Platform Report</h4>
              <p className="text-xs text-gray-400 font-medium mt-0.5 max-w-md">
                Get weekly analysis of views, impressions, clicks, lead volumes, and overall rank within LankaProperty.lk's agent matrix.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('notify_weekly')}
            className={`w-12 h-6 pl-1 pr-1 rounded-full transition-colors relative outline-none flex items-center ${
              preferences.notify_weekly ? 'bg-brand-green justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>

      </div>

      {/* Persistence Bar */}
      <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-4 flex-wrap">
        <button
          onClick={handleSavePreferences}
          disabled={saving}
          className="px-8 py-3.5 bg-brand-green text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-700 shadow-xl shadow-brand-green/15 cursor-pointer disabled:bg-gray-300 transition-all flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin text-white" />
              Saving settings...
            </>
          ) : (
            <>
              <Check size={14} />
              Save Preferences
            </>
          )}
        </button>
        
        {success && (
          <div className="p-3 bg-brand-green/10 text-brand-green rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 animate-fade-in">
            <CheckCircle size={14} />
            Settings saved successfully!
          </div>
        )}
      </div>

    </div>
  );
};
