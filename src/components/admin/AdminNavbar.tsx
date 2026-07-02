import React from 'react';
import { Search, Bell, Settings, Plus, Menu } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminNavbarProps {
  user: any;
  onPostAd: () => void;
  onOpenSidebar: () => void;
}

export default function AdminNavbar({ user, onPostAd, onOpenSidebar }: AdminNavbarProps) {
  return (
    <header className="h-[60px] bg-white border-b border-[#e5e7eb] flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu size={24} className="text-[#004F31]" />
        </button>
        <h2 className="text-lg font-bold text-[#004F31] hidden sm:block">
          LankaProperty.lk Admin
        </h2>
      </div>

      <div className="flex-grow max-w-xl mx-8 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] group-focus-within:text-[#004F31] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search inquiries..."
            className="w-full bg-[#f3f4f6] border border-[#e5e7eb] focus:bg-white focus:border-[#004F31] focus:ring-4 focus:ring-[#004F31]/5 rounded-xl py-2 pl-12 pr-4 text-sm font-medium transition-all outline-none text-[#111827]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-1 sm:gap-3 mr-2 sm:mr-4 border-r border-[#e5e7eb] pr-4 sm:pr-6">
          <button className="p-2.5 text-[#6b7280] hover:bg-gray-100 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#dc2626] rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2.5 text-[#6b7280] hover:bg-gray-100 rounded-xl transition-all">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 ml-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 p-0.5 border border-[#e5e7eb] overflow-hidden">
            {user?.avatar_url ? (
              <img onError={(e) => { e.currentTarget.src = '/placeholder-property.jpg' }} src={user.avatar_url} alt="User" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full bg-[#004F31] text-white flex items-center justify-center text-sm font-black rounded-full">
                {user?.email?.[0].toUpperCase() || 'C'}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
