import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  ClipboardList, 
  MessageSquare, 
  Settings, 
  LayoutDashboard, 
  Plus, 
  LogOut 
} from 'lucide-react';

interface AdminSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
}

export default function AdminSidebar({ activePage, onNavigate, user, onLogout }: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'listings', label: 'My Listings', icon: <ClipboardList size={20} /> },
    { id: 'enquiries', label: 'Enquiries', icon: <MessageSquare size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-72 bg-white h-screen flex flex-col border-r border-admin-border sticky top-0 overflow-y-auto hidden lg:flex">
      {/* Top Header */}
      <div className="p-8 pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-admin-primary leading-none">LankaProperty</h1>
          <p className="text-[10px] uppercase tracking-widest text-admin-text-gray font-bold mt-1">
            Admin Portal / Manage inventory
          </p>
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center py-6 border-y border-admin-border/50">
          <div className="w-20 h-20 rounded-full bg-admin-bg p-1 border-2 border-admin-primary/20 mb-3 flex items-center justify-center overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Admin" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full bg-admin-primary text-white flex items-center justify-center text-2xl font-black rounded-full">
                {user?.email?.[0].toUpperCase()}
              </div>
            )}
          </div>
          <h3 className="text-base font-black text-admin-text-dark">{user?.email?.split('@')[0]}</h3>
          <p className="text-[11px] font-bold text-admin-text-gray uppercase tracking-widest mt-0.5">Senior Administrator</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold text-sm transition-all relative group ${
              activePage === item.id 
                ? 'bg-admin-bg text-admin-primary' 
                : 'text-admin-text-gray hover:bg-gray-50'
            }`}
          >
            {activePage === item.id && (
              <motion.div 
                layoutId="sidebar-active"
                className="absolute left-0 top-3 bottom-3 w-1.5 bg-admin-primary rounded-r-full"
              />
            )}
            <span className={`${activePage === item.id ? 'text-admin-primary' : 'text-gray-400 group-hover:text-admin-primary transition-colors'}`}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 space-y-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('publish')}
          className="w-full bg-admin-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-admin-primary/20 hover:bg-admin-secondary transition-all"
        >
          <Plus size={18} />
          Post Property
        </motion.button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-6 py-3 text-admin-text-gray hover:text-admin-accent font-bold text-sm transition-colors group"
        >
          <LogOut size={18} className="text-gray-400 group-hover:text-admin-accent transition-colors" />
          Sign Out
        </button>

        <div className="pt-6 border-t border-admin-border flex justify-center">
           <img 
            src="https://qsqqolvsndvkwegvcfqv.supabase.co/storage/v1/object/sign/assets/Website%20logo%20.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MWNhMTU1MC03OGYzLTQwZGMtYTYzYi02NzVmZTRiYjM2NWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvV2Vic2l0ZSBsb2dvIC5wbmciLCJpYXQiOjE3NzgzMDk4MjksImV4cCI6MTkzNTk4OTgyOX0.LqwS9LCGK4UH1oL4YQHkiJdrNNgYGh-8CZtZBgrTO-s" 
            alt="Logo" 
            className="h-10 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer"
          />
        </div>
      </div>
    </aside>
  );
}
