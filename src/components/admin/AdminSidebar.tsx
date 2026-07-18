import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3,
  ClipboardList,
  MessageSquare,
  Settings2,
  LayoutDashboard,
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
  Users,
  Building2,
  Link2,
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
    { id: "links", label: "Link Shortener", icon: <Link2 size={18} />, isNew: true },
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
          scrollbar-color: #e5e7eb transparent;
          scroll-behavior: smooth;
        }
        .sidebar-nav-scrollable::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav-scrollable::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav-scrollable::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .sidebar-nav-scrollable::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>

      <aside
        className="admin-sidebar"
        style={{
          position: isMobile ? 'relative' : 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '240px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#ffffff',
          zIndex: isMobile ? 1 : 1000,
          borderRight: '1px solid #e5e7eb',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}
      >
        {/* PART 1 — FIXED TOP: NEVER SCROLLS */}
        <div className="flex-shrink-0 p-5">
          <div className="whitespace-nowrap overflow-hidden">
            <h1 className="text-[18px] font-bold leading-none text-[#004F31]">
              LankaProperty.lk
            </h1>
            <p className="text-[10px] text-[#00897b] font-semibold uppercase tracking-[1.5px] mt-1.5">
              ADMIN PORTAL
            </p>
          </div>
 
          {/* User Profile */}
          <div className="flex items-center gap-3 py-3 border-b mt-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <div className="w-[36px] h-[36px] rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden bg-[#004F31] text-white font-bold">
              {user?.avatar_url ? (
                <img 
                  onError={(e) => { e.currentTarget.src = '/placeholder-property.jpg' }}
                  src={user.avatar_url}
                  alt="Admin"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>{user?.email?.[0].toUpperCase() || 'A'}</span>
              )}
            </div>
            <div className="overflow-hidden whitespace-nowrap flex flex-col">
              <h3 className="text-[13px] font-semibold text-[#111827] truncate">
                {user?.email || "abhishekdewminaa@gmail.com"}
              </h3>
              <p className="text-[11px] font-medium text-[#6b7280] uppercase tracking-[0.5px] mt-0.5">
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
                  className={`sidebar-nav-item w-[224px] py-[10px] px-4 my-[2px] mx-2 transition-all duration-150 relative flex items-center justify-between text-left group/nav outline-none select-none cursor-pointer ${
                    isActive
                      ? "bg-[#f0fdf4] text-[#004F31] font-bold border-l-[3px] border-[#004F31] rounded-r-lg rounded-l-none sidebar-active-item"
                      : "bg-transparent text-[#374151] hover:bg-[#f0fdf4] hover:text-[#004F31] rounded-lg font-medium"
                  }`}
                >
                  <div className="flex items-center gap-[10px] min-w-0">
                    <span 
                      className={`flex-shrink-0 transition-all duration-150 ${
                        isActive ? "text-[#004F31]" : "text-[#6b7280] group-hover/nav:text-[#004F31]"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className={`text-[14px] leading-tight truncate transition-all duration-150 ${
                      isActive ? "text-[#004F31] font-bold" : "text-[#374151] font-medium group-hover/nav:text-[#004F31]"
                    }`}>
                      {item.label}
                    </span>
                  </div>
 
                  {item.isNew && (
                    <span className="flex items-center gap-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-[20px] shadow-sm ml-2 flex-shrink-0 whitespace-nowrap">
                      🔥 NEW
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
                  background: `linear-gradient(to bottom, transparent, #ffffff)`
                }}
              />
            )}
          </AnimatePresence>
        </div>
 
        {/* PART 3 — FIXED BOTTOM: NEVER SCROLLS */}
        <div 
          className="sidebar-bottom flex-shrink-0 flex flex-col gap-[2px] p-2 bg-transparent z-10" 
          style={{ borderTop: "1px solid #f3f4f6" }}
        >
          {/* Settings Item */}
          <button
            onClick={() => onNavigate('settings')}
            className={`sidebar-nav-item w-[224px] py-[10px] px-4 my-[2px] mx-2 transition-all duration-150 relative flex items-center gap-[10px] text-left group/nav outline-none select-none cursor-pointer ${
              activePage === 'settings'
                ? "bg-[#f0fdf4] text-[#004F31] font-bold border-l-[3px] border-[#004F31] rounded-r-lg rounded-l-none sidebar-active-item"
                : "bg-transparent text-[#374151] hover:bg-[#f0fdf4] hover:text-[#004F31] rounded-lg font-medium"
            }`}
          >
            <span 
              className={`flex-shrink-0 transition-all duration-150 ${
                activePage === 'settings' ? "text-[#004F31]" : "text-[#6b7280] group-hover/nav:text-[#004F31]"
              }`}
            >
              <Settings2 size={18} />
            </span>
            <span className={`text-[14px] leading-tight truncate transition-all duration-150 ${
              activePage === 'settings' ? "text-[#004F31] font-bold" : "text-[#374151] font-medium group-hover/nav:text-[#004F31]"
            }`}>
              Settings
            </span>
          </button>
 
          {/* Sign Out */}
          <button
            onClick={onLogout}
            className="sidebar-nav-item w-[224px] py-[10px] px-4 my-[2px] mx-2 rounded-lg flex items-center gap-[10px] text-left transition-all duration-150 text-[#374151] hover:bg-[#fef2f2] hover:text-[#dc2626] font-medium group/nav cursor-pointer outline-none select-none"
          >
            <span className="flex-shrink-0 transition-opacity duration-150 text-[#6b7280] group-hover/nav:text-[#dc2626]">
              <LogOut size={18} />
            </span>
            <span className="text-[14px] font-medium leading-tight truncate text-[#374151] group-hover/nav:text-[#dc2626]">
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
