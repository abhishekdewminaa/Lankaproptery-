import React, { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronDown,
  ChevronUp,
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
} from "lucide-react";

interface AdminSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
  adminDarkMode: boolean;
  toggleAdminDark: () => void;
}

export default function AdminSidebar({
  activePage,
  onNavigate,
  user,
  onLogout,
  adminDarkMode,
  toggleAdminDark,
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin-sidebar-collapsed") === "true";
  });
  
  const [workflowsCollapsed, setWorkflowsCollapsed] = useState(() => {
    return localStorage.getItem("workflows_widget") === "collapsed";
  });

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem("workflows_widget", workflowsCollapsed ? "collapsed" : "expanded");
  }, [workflowsCollapsed]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={16} />,
    },
    { id: "listings", label: "Properties", icon: <ClipboardList size={16} /> },
    { id: "lands_manager", label: "Lands Portfolio", icon: <MapPin size={16} />, isNew: true },
    { id: "pipeline", label: "Lead Pipeline", icon: <Kanban size={16} />, isNew: true },
    { id: "enquiries", label: "Legacy Enquiries", icon: <MessageSquare size={16} /> },
    { id: "marketing", label: "Marketing", icon: <Megaphone size={16} /> },
    { id: "blog", label: "Blog Manager", icon: <FileText size={16} />, isNew: true },
    { id: "newsletter", label: "Newsletter Manager", icon: <Mail size={16} />, isNew: true },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
    { id: "revenue", label: "Revenue Dashboard", icon: <DollarSign size={16} /> },
    { id: "automation", label: "Automation", icon: <Zap size={16} />, isNew: true },
    { id: "ai-writer", label: "AI Writer", icon: <Sparkles size={16} />, isNew: true },
    { id: "maps", label: "Google Maps data", icon: <MapPin size={16} />, isNew: true },
  ];

  return (
    <>
      <style>{`
        .sidebar-nav::-webkit-scrollbar {
          width: 3px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(0, 79, 49, 0.2);
          border-radius: 999px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 79, 49, 0.4);
        }
        .sidebar-nav-wrapper {
          position: relative;
        }
        .sidebar-nav-wrapper::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 32px;
          background: linear-gradient(
            to bottom, 
            transparent, 
            rgba(248, 250, 248, 0.9)
          );
          pointer-events: none;
        }
      `}</style>
      <aside
        className={`admin-sidebar relative border-r sticky top-0 z-[50] hidden lg:flex ${adminDarkMode ? "bg-[#13131F] border-[#1F2937]" : "bg-white border-admin-border"}`}
        style={{
          width: isCollapsed ? "64px" : "240px",
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          transition: "width 0.3s ease",
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-[#1B5E20] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-800 transition-colors z-[100]"
        >
          <ChevronLeft
            size={14}
            className="transition-transform duration-300"
            style={{ transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        {/* SECTION 1 — TOP: NEVER SCROLLS */}
        <div className={`flex-shrink-0 ${isCollapsed ? "items-center pt-2" : "pt-2 px-4 pb-2"}`}>
          {!isCollapsed ? (
            <div className="mb-2 whitespace-nowrap overflow-hidden transition-opacity duration-300">
              <h1 className="text-[16px] font-black text-[#1B5E20] leading-none">
                LankaProperty
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-admin-text-gray font-bold mt-1">
                Admin Portal
              </p>
            </div>
          ) : (
            <div className="mb-2 flex justify-center opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 bg-[#1B5E20]/10 rounded flex items-center justify-center">
                <span className="text-[#1B5E20] font-black text-sm">LP</span>
              </div>
            </div>
          )}

          {/* User Profile */}
          <div
            className={`flex items-center gap-3 py-2 transition-all`}
          >
            <div
              className={`${isCollapsed ? "w-8 h-8 mx-auto" : "sidebar-avatar aspect-square"} rounded-full bg-admin-bg border border-[#1B5E20]/20 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300`}
            >
              {user?.avatar_url ? (
                <img onError={(e) => { e.currentTarget.src = '/placeholder-property.jpg' }}
                  src={user.avatar_url}
                  alt="Admin"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-[#1B5E20] text-white flex items-center justify-center font-black rounded-full text-[12px]">
                  {user?.email?.[0].toUpperCase()}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap transition-opacity duration-300">
                <h3
                  className={`sidebar-username ${adminDarkMode ? "text-white" : "text-admin-text-dark"}`}
                >
                  {user?.email?.split("@")[0]}
                </h3>
                <p className="sidebar-role text-admin-text-gray font-bold">
                  ADMINISTRATOR
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2 — MIDDLE: SCROLLS INDEPENDENTLY */}
        <div className="sidebar-nav-wrapper flex-1 overflow-hidden relative min-h-0">
          <nav
            className={`sidebar-nav h-full overflow-y-auto overflow-x-hidden pb-[40px] pt-2 ${isCollapsed ? "px-2" : "px-4"}`}
          >
            {menuItems.map((item) => {
              if (item.id === "divider") {
                return (
                  <hr key={`divider`} style={{ border: 'none', borderTop: '1px solid rgba(0,79,49,0.1)', margin: '8px 12px' }} />
                );
              }

              const isActive = activePage === item.id;
              return (
                <div key={item.id} className="relative group/nav mb-1">
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`sidebar-nav-item w-full flex items-center h-[36px] rounded-lg transition-all duration-300 ${
                      isCollapsed ? "justify-center px-0" : "px-[10px]"
                    } ${
                      isActive
                        ? "bg-[#1B5E20]/10 text-[#1B5E20] font-bold"
                        : `text-admin-text-gray hover:bg-[#1B5E20]/5 hover:translate-x-1 hover:text-[#1B5E20] font-medium`
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#1B5E20] rounded-r-full"
                      />
                    )}
                    <span
                      className={`${isActive ? "text-[#1B5E20]" : "text-gray-400 group-hover/nav:text-[#1B5E20] transition-colors"}`}
                    >
                      {item.icon}
                    </span>

                    <span
                      className={`transition-all duration-300 ${
                        isCollapsed
                          ? "w-0 opacity-0 hidden"
                          : "ml-3 opacity-100 flex items-center gap-2 whitespace-nowrap text-[13px]"
                      }`}
                    >
                      {item.label}
                      {item.isNew && (
                        <span className="flex items-center gap-0.5 bg-red-100 text-red-600 border border-red-200 text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-full shadow-sm ml-1">
                          <Flame size={10} className="text-orange-500 animate-pulse" />
                          NEW
                        </span>
                      )}
                    </span>
                  </button>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1B5E20] text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all whitespace-nowrap z-[60] shadow-lg">
                      {item.label}
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1B5E20] rotate-45" />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* SECTION 3 — BOTTOM: NEVER SCROLLS */}
        <div className={`sidebar-bottom flex-shrink-0 flex flex-col gap-[6px] py-4 bg-transparent z-10 ${isCollapsed ? "px-2" : "px-3"}`} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="relative group/nav mb-1">
            <button
              onClick={() => onNavigate('settings')}
              className={`sidebar-nav-item w-full flex items-center h-[36px] rounded-lg transition-all duration-300 ${
                isCollapsed ? "justify-center px-0" : "px-[10px]"
              } ${
                activePage === 'settings'
                  ? "bg-[#1B5E20]/10 text-[#1B5E20] font-bold"
                  : "text-admin-text-gray hover:bg-[#1B5E20]/5 hover:translate-x-1 hover:text-[#1B5E20] font-medium"
              }`}
            >
              {activePage === 'settings' && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#1B5E20] rounded-r-full"
                />
              )}
              <span className={`${activePage === 'settings' ? "text-[#1B5E20]" : "text-gray-400 group-hover/nav:text-[#1B5E20] transition-colors"}`}>
                  <Settings2 size={16} />
              </span>
              <span className={`transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "ml-3 opacity-100 flex items-center gap-2 whitespace-nowrap text-[13px]"}`}>
                Settings
              </span>
            </button>
            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1B5E20] text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all whitespace-nowrap z-[60] shadow-lg">
                Settings
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1B5E20] rotate-45" />
              </div>
            )}
          </div>

          <div className="relative group/nav mb-1">
            <button
              onClick={toggleAdminDark}
              className={`sidebar-nav-item w-full flex items-center h-[36px] rounded-lg transition-all duration-300 ${
                isCollapsed ? "justify-center px-0" : "px-[10px]"
              } text-admin-text-gray hover:bg-[#1B5E20]/5 hover:translate-x-1 hover:text-[#1B5E20] font-medium`}
            >
              <span className={`text-gray-400 group-hover/nav:text-[#1B5E20] transition-colors`}>
                  {adminDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </span>
              <span className={`transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "ml-3 opacity-100 flex items-center gap-2 whitespace-nowrap text-[13px]"}`}>
                {adminDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1B5E20] text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all whitespace-nowrap z-[60] shadow-lg">
                Toggle Theme
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1B5E20] rotate-45" />
              </div>
            )}
          </div>

          <div className="relative group/out mt-[2px]">
            <button
              onClick={onLogout}
              className={`w-full h-[32px] flex items-center text-admin-text-gray hover:text-red-600 font-bold transition-colors ${
                isCollapsed ? "justify-center px-0" : "gap-2 px-3 text-[12px]"
              }`}
            >
              <LogOut
                size={16}
                className="text-gray-400 group-hover/out:text-red-600 transition-colors"
              />
              {!isCollapsed && (
                <span className="whitespace-nowrap">Sign Out</span>
              )}
            </button>
            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover/out:opacity-100 group-hover/out:visible transition-all whitespace-nowrap z-[60] shadow-lg">
                Sign Out
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-600 rotate-45" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
