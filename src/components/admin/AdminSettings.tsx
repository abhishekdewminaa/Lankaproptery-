import React, { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Shield, 
  Globe, 
  Bell, 
  Moon, 
  Sun, 
  Camera,
  CheckCircle2,
  Lock,
  ChevronDown,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminSettingsProps {
  user: any;
}

export default function AdminSettings({ user }: AdminSettingsProps) {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState({
    leads: true,
    updates: true,
    team: false
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-5xl font-black text-admin-text-dark tracking-tight">Account Settings</h2>
          <p className="text-admin-text-gray font-bold mt-2">Manage your administrative profile and platform preferences.</p>
        </div>
        <div className="flex items-center gap-6">
           <button className="text-admin-text-gray font-black text-xs uppercase tracking-widest hover:text-admin-text-dark transition-colors">Help</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Profile & Preferences */}
        <div className="xl:col-span-2 space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-[40px] border border-admin-border p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <User size={20} />
              </div>
              <h3 className="text-2xl font-black text-admin-text-dark">Profile Information</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-10">
              {/* Avatar Upload */}
              <div className="relative group">
                <div className="w-40 h-48 bg-admin-bg rounded-3xl overflow-hidden border border-admin-border">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-admin-primary text-white text-4xl font-black">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-3 right-3 w-10 h-10 bg-admin-primary text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform">
                  <Camera size={18} />
                </button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={user?.name || "Arjun Ratnayake"}
                      className="w-full bg-admin-bg border border-admin-border rounded-xl px-5 py-4 font-bold text-admin-text-dark outline-none focus:ring-2 focus:ring-admin-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email || "arjun.r@lankaproperty.lk"}
                      className="w-full bg-admin-bg border border-admin-border rounded-xl px-5 py-4 font-bold text-admin-text-dark outline-none focus:ring-2 focus:ring-admin-primary/10 transition-all opacity-80"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Bio / Designation</label>
                  <textarea 
                    rows={4}
                    defaultValue="Senior Platform Administrator for Southern Region property clusters."
                    className="w-full bg-admin-bg border border-admin-border rounded-xl px-5 py-4 font-bold text-admin-text-dark outline-none focus:ring-2 focus:ring-admin-primary/10 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Platform Preferences */}
          <div className="bg-white rounded-[40px] border border-admin-border p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Globe size={20} />
              </div>
              <h3 className="text-2xl font-black text-admin-text-dark">Platform Preferences</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Interface Language</label>
                  <div className="relative">
                    <select className="w-full bg-admin-bg border border-admin-border rounded-xl px-5 py-4 font-bold text-admin-text-dark outline-none appearance-none cursor-pointer">
                      <option>English (International)</option>
                      <option>Sinhala</option>
                      <option>Tamil</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-admin-text-gray pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Theme Mode</label>
                  <div className="flex p-1 bg-admin-bg rounded-2xl border border-admin-border">
                    <button 
                      onClick={() => setThemeMode('light')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        themeMode === 'light' ? 'bg-white text-admin-primary shadow-sm' : 'text-admin-text-gray'
                      }`}
                    >
                      <Sun size={14} /> Light
                    </button>
                    <button 
                      onClick={() => setThemeMode('dark')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        themeMode === 'dark' ? 'bg-white text-admin-primary shadow-sm' : 'text-admin-text-gray'
                      }`}
                    >
                      <Moon size={14} /> Dark
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Notification Toggles</label>
                <div className="space-y-4">
                  {[
                    { id: 'leads', label: 'New Property Leads', state: notifications.leads },
                    { id: 'updates', label: 'Platform Updates', state: notifications.updates },
                    { id: 'team', label: 'Team Communications', state: notifications.team },
                  ].map((toggle) => (
                    <div key={toggle.id} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-admin-text-dark">{toggle.label}</span>
                      <button 
                        onClick={() => setNotifications(prev => ({ ...prev, [toggle.id]: !prev[toggle.id as keyof typeof notifications] }))}
                        className={`w-12 h-6 rounded-full transition-all relative ${toggle.state ? 'bg-[#006644]' : 'bg-gray-200'}`}
                      >
                        <motion.div 
                          animate={{ x: toggle.state ? 24 : 4 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Status */}
        <div className="space-y-8">
          {/* Security */}
          <div className="bg-white rounded-[40px] border border-admin-border p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <Shield size={20} />
              </div>
              <h3 className="text-2xl font-black text-admin-text-dark">Security</h3>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-admin-bg border border-admin-border rounded-xl px-5 py-4 font-bold text-admin-text-dark outline-none focus:ring-2 focus:ring-admin-primary/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">New Password</label>
                <input 
                  type="password" 
                  placeholder="Min 8 characters"
                  className="w-full bg-admin-bg border border-admin-border rounded-xl px-5 py-4 font-bold text-admin-text-dark outline-none focus:ring-2 focus:ring-admin-primary/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="Repeat new password"
                  className="w-full bg-admin-bg border border-admin-border rounded-xl px-5 py-4 font-bold text-admin-text-dark outline-none focus:ring-2 focus:ring-admin-primary/10 transition-all"
                />
              </div>
              <button className="w-full py-4 border-2 border-red-500 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95">
                Update Password
              </button>
            </form>
          </div>

          {/* Access Level */}
          <div className="bg-white rounded-[40px] border border-admin-border p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <SettingsIcon size={120} className="text-admin-primary" />
            </div>
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="w-10 h-10 bg-admin-bg text-admin-text-dark rounded-xl flex items-center justify-center">
                <Lock size={20} />
              </div>
              <h3 className="text-2xl font-black text-admin-text-dark">Access Level</h3>
            </div>

            <div className="bg-[#EBFDF5] p-8 rounded-3xl mb-8 relative z-10">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Current Role</p>
                <span className="bg-[#006644] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em]">Super Admin</span>
              </div>
              <p className="text-xs font-bold text-admin-text-dark leading-relaxed">
                Full access to property listings, user management, and financial analytics.
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              <p className="text-[10px] font-black text-admin-text-gray uppercase tracking-widest">Your Permissions</p>
              {[
                'Edit Global Configurations',
                'Approve High-Value Listings',
                'Access Financial Reports',
                'Manage Staff Accounts',
              ].map((perm, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#00B67A]" />
                  <span className="text-xs font-bold text-admin-text-dark">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-10 flex flex-col sm:flex-row justify-end items-center gap-6 border-t border-admin-border">
         <button className="text-admin-text-gray font-black text-sm uppercase tracking-widest hover:text-admin-text-dark transition-colors">Cancel</button>
         <button className="px-12 py-5 bg-[#00B67A] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#00A06B] transition-all shadow-xl shadow-[#00B67A]/20 active:scale-95">
           Save Changes
         </button>
      </div>
    </div>
  );
}
