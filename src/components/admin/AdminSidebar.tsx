import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3,
  ClipboardList,
  MessageSquare,
  Settings2,
  LayoutDashboard,
  Plus,
  LogOut,
  Megaphone,
  Zap,
  Flame,
  MapPin,
  DollarSign,
  Sparkles,
  Kanban,
  Mail,
  FileText,
  Sun,
  Moon,
  Users,
  Building2,
} from "lucide-react";

interface AdminSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
  adminDarkMode: boolean;
  toggleAdminDark: () => void;
  isMobile?: boolean;
}

export default function AdminSidebar({
  activePage,
  onNavigate,
  user,
  onLogout,
  adminDarkMode,
  toggleAdminDark,
  isMobile = false,
}: AdminSidebarProps) {
  const [showFade, setShowFade] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sidebarBg = adminDarkMode ? '#13131F' : '#ffffff';
  const borderCol = adminDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  
  // Text & Visual Colors
  const textTitle = adminDarkMode ? 'text-white' : 'text-slate-900';
  const textSubtitle = adminDarkMode ? 'text-[#4ade80]' : 'text-[#004F31]';
  const profileBorder = adminDarkMode ? 'border-white/10' : 'border-slate-100';
  const profileAvatarBg = adminDarkMode ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-100';
  const emailText = adminDarkMode ? 'text-white' : 'text-slate-800';
  const roleText = adminDarkMode ? 'text-[#4ade80]' : 'text-emerald-700';

  // Navigation Items
  const navActiveBg = adminDarkMode ? 'bg-white/15' : 'bg-[#004F31]/8';
  const navActiveText = adminDarkMode ? 'text-white font-bold' : 'text-[#004F31] font-bold';
  const navActiveBorder = adminDarkMode ? '3px solid #ffffff' : '3px solid #004F31';
  const navNormalText = adminDarkMode ? 'text-white/70 hover:bg-white/8 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-[#004F31]';
  const navActiveIcon = adminDarkMode ? 'text-[#4ade80]' : 'text-[#004F31]';
  const navNormalIcon = adminDarkMode ? 'opacity-70 group-hover/nav:opacity-100' : 'text-slate-400 group-hover/nav:text-[#004F31]';

  // Scrollbar Styles
  const scrollbarColor = adminDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
  const scrollbarHoverColor = adminDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    { id: "listings", label: "Properties", icon: <ClipboardList size={18} /> },
    { id: "user_listings", label: "User Listings Overview", icon: <Users size={18} />, isNew: true },
    { id: "agents", label: "Agent Management", icon: <Building2 size={18} />, isNew: true },
    { id: "lands_manager", label: "Lands Portfolio", icon: <MapPin size={18} />, isNew: true },
    { id: "pipeline", label: "Lead Pipeline", icon: <Kanban size={18} />, isNew: true },
    { id: "enquiries", label: "Legacy Enquiries", icon: <MessageSquare size={18} /> },
    { id: "marketing", label: "Marketing", icon: <Megaphone size={18} /> },
    { id: "blog", label: "Blog Manager", icon: <FileText size={18} />, isNew: true },
    { id: "newsletter", label: "Newsletter Manager", icon: <Mail size={18} />, isNew: true },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
    { id: "revenue", label: "Revenue Dashboard", icon: <DollarSign size={18} /> },
    { id: "automation", label: "Automation", icon: <Zap size={18} />, isNew: true },
    { id: "ai-writer", label: "AI Writer", icon: <Sparkles size={18} />, isNew: true },
    { id: "maps", label: "Google Maps data", icon: <MapPin size={18} />, isNew: true },
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const hasOverflow = target.scrollHeight > target.clientHeight;
    if (!hasOverflow) {
      setShowFade(false);
      return;
    }
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 5;
    setShowFade(!isAtBottom);
  };

  const updateFadeState = () => {
    const target = scrollContainerRef.current;
    if (target) {
      const hasOverflow = target.scrollHeight > target.clientHeight;
      const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 5;
      setShowFade(hasOverflow && !isAtBottom);
    }
  };

  useEffect(() => {
    updateFadeState();
    const timer = setTimeout(updateFadeState, 100);
    return () => clearTimeout(timer);
  }, [activePage]);

  // Scroll active menu item into view automatically
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector('.sidebar-active-item');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activePage]);

  return (
    <>
      <style>{`
        .sidebar-nav-scrollable {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s ease;
          scroll-behavior: smooth;
        }
        .sidebar-nav-scrollable:hover {
          scrollbar-color: ${scrollbarColor} transparent;
        }
        .sidebar-nav-scrollable::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav-scrollable::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav-scrollable::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }
        .sidebar-nav-scrollable:hover::-webkit-scrollbar-thumb {
          background: ${scrollbarColor};
        }
        .sidebar-nav-scrollable::-webkit-scrollbar-thumb:hover {
          background: ${scrollbarHoverColor};
        }
      `}</style>

      <aside
        className="admin-sidebar"
        style={{
          position: isMobile ? 'relative' : 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '260px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: sidebarBg,
          zIndex: isMobile ? 1 : 1000,
          borderRight: adminDarkMode ? '1px solid #1F2937' : '1px solid #E2E8F0',
        }}
      >
        {/* PART 1 — FIXED TOP: NEVER SCROLLS */}
        <div className="flex-shrink-0 p-6">
          <div className="whitespace-nowrap overflow-hidden">
            <h1 className={`text-[20px] font-black leading-none ${textTitle}`}>
              LankaProperty.lk
            </h1>
            <p className={`text-[10px] uppercase tracking-widest font-black mt-1 ${textSubtitle}`}>
              Admin Portal
            </p>
          </div>

          {/* User Profile */}
          <div className={`flex items-center gap-3 py-3 border-b mt-4 ${profileBorder}`}>
            <div className={`w-10 h-10 rounded-full border flex-shrink-0 flex items-center justify-center overflow-hidden ${profileAvatarBg}`}>
              {user?.avatar_url ? (
                <img 
                  onError={(e) => { e.currentTarget.src = '/placeholder-property.jpg' }}
                  src={user.avatar_url}
                  alt="Admin"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center font-black rounded-full text-sm ${adminDarkMode ? 'bg-[#4ade80] text-[#004F31]' : 'bg-[#004F31] text-white'}`}>
                  {user?.email?.[0].toUpperCase() || 'A'}
                </div>
              )}
            </div>
            <div className="overflow-hidden whitespace-nowrap">
              <h3 className={`text-xs font-black truncate ${emailText}`}>
                {user?.email || 'ceo.lankaland@gmail.com'}
              </h3>
              <p className={`text-[9px] font-black tracking-widest uppercase ${roleText}`}>
                ADMINISTRATOR
              </p>
            </div>
          </div>
        </div>

        {/* PART 2 — SCROLLABLE MIDDLE: ONLY THIS SCROLLS */}
        <div className="flex-1 min-h-0 relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="sidebar-nav-scrollable h-full overflow-y-auto overflow-x-hidden py-2"
          >
            {menuItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`sidebar-nav-item w-[244px] h-[44px] my-[2px] mx-2 px-4 rounded-lg flex items-center justify-between text-left transition-all duration-150 relative group/nav ${
                    isActive 
                      ? `${navActiveBg} ${navActiveText} sidebar-active-item` 
                      : `${navNormalText}`
                  }`}
                  style={{
                    borderLeft: isActive ? navActiveBorder : 'none',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span 
                      className={`flex-shrink-0 transition-all duration-150 ${
                        isActive ? navActiveIcon : navNormalIcon
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-xs tracking-wide truncate">
                      {item.label}
                    </span>
                  </div>

                  {item.isNew && (
                    <span className="flex items-center gap-0.5 bg-red-100 text-red-600 border border-red-200 text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-full shadow-sm ml-2 flex-shrink-0 whitespace-nowrap">
                      <Flame size={10} className="text-orange-500 animate-pulse" />
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Subtle bottom fade gradient */}
          <AnimatePresence>
            {showFade && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-10"
                style={{
                  background: `linear-gradient(to bottom, transparent, ${sidebarBg})`
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* PART 3 — FIXED BOTTOM: NEVER SCROLLS */}
        <div 
          className="sidebar-bottom flex-shrink-0 flex flex-col gap-[2px] p-2 bg-transparent z-10" 
          style={{ borderTop: `1px solid ${borderCol}` }}
        >
          {/* Settings Item */}
          <button
            onClick={() => onNavigate('settings')}
            className={`sidebar-nav-item w-[244px] h-[44px] my-[2px] mx-2 px-4 rounded-lg flex items-center gap-3 text-left transition-all duration-150 relative group/nav ${
              activePage === 'settings' 
                ? `${navActiveBg} ${navActiveText} sidebar-active-item` 
                : `${navNormalText}`
            }`}
            style={{
              borderLeft: activePage === 'settings' ? navActiveBorder : 'none',
            }}
          >
            <span 
              className={`flex-shrink-0 transition-all duration-150 ${
                activePage === 'settings' ? navActiveIcon : navNormalIcon
              }`}
            >
              <Settings2 size={18} />
            </span>
            <span className="text-xs tracking-wide truncate">
              Settings
            </span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleAdminDark}
            className={`sidebar-nav-item w-[244px] h-[44px] my-[2px] mx-2 px-4 rounded-lg flex items-center gap-3 text-left transition-all duration-150 group/nav ${navNormalText}`}
          >
            <span className={`flex-shrink-0 transition-opacity duration-150 ${navNormalIcon}`}>
              {adminDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </span>
            <span className="text-xs tracking-wide truncate">
              {adminDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Sign Out */}
          <button
            onClick={onLogout}
            className={`sidebar-nav-item w-[244px] h-[44px] my-[2px] mx-2 px-4 rounded-lg flex items-center gap-3 text-left transition-all duration-150 group/nav ${
              adminDarkMode 
                ? 'text-white/70 hover:bg-white/8 hover:text-red-400' 
                : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <span className={`flex-shrink-0 transition-opacity duration-150 ${
              adminDarkMode ? 'opacity-70 group-hover/nav:opacity-100 group-hover/nav:text-red-400' : 'text-slate-400 group-hover/nav:text-red-600'
            }`}>
              <LogOut size={18} />
            </span>
            <span className={`text-xs tracking-wide truncate ${
              adminDarkMode ? 'group-hover/nav:text-red-400' : 'group-hover/nav:text-red-600'
            }`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
