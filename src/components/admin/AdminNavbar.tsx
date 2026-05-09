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
    <header className="h-20 bg-white border-b border-admin-border flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu size={24} className="text-admin-text-dark" />
        </button>
        <h2 className="text-lg font-black text-admin-text-dark hidden sm:block">
          LankaProperty.lk <span className="text-admin-primary">Admin</span>
        </h2>
      </div>

      <div className="flex-grow max-w-xl mx-8 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-admin-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search inquiries..."
            className="w-full bg-admin-bg border-transparent focus:bg-white focus:border-admin-primary/20 focus:ring-4 focus:ring-admin-primary/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-1 sm:gap-3 mr-2 sm:mr-4 border-r border-admin-border pr-4 sm:pr-6">
          <button className="p-2.5 text-admin-text-gray hover:bg-admin-bg rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-admin-accent rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2.5 text-admin-text-gray hover:bg-admin-bg rounded-xl transition-all">
            <Settings size={20} />
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPostAd}
          className="hidden sm:flex items-center gap-2 bg-[#006644] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-[#006644]/10 hover:bg-[#005533] transition-all"
        >
          Post Free Ad
        </motion.button>

        <div className="flex items-center gap-3 ml-2">
          <div className="w-10 h-10 rounded-full bg-admin-bg p-0.5 border border-admin-border overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="User" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full bg-admin-primary text-white flex items-center justify-center text-sm font-black rounded-full">
                {user?.email?.[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
