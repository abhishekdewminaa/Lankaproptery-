import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3,
  ClipboardList,
  MessageSquare,
  Settings,
  LayoutDashboard,
  Plus,
  LogOut,
  Megaphone,
  Sun,
  Moon,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Zap,
  Flame,
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
    { id: "enquiries", label: "Leads", icon: <MessageSquare size={16} /> },
    { id: "marketing", label: "Marketing", icon: <Megaphone size={16} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
    { id: "automation", label: "Automation", icon: <Zap size={16} />, isNew: true },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <aside
      className={`admin-sidebar relative border-r sticky top-0 z-[50] hidden lg:flex ${adminDarkMode ? "bg-[#13131F] border-[#1F2937]" : "bg-white border-admin-border"}`}
      style={{
        width: isCollapsed ? "64px" : "240px",
        transition: "width 0.3s ease",
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-[#1B5E20] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-800 transition-colors z-10"
      >
        <ChevronLeft
          size={14}
          className="transition-transform duration-300"
          style={{ transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Top Header - Zone 0 */}
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
              <img
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

      {/* Navigation - Zone 1 */}
      <nav
        className={`sidebar-nav ${isCollapsed ? "px-2" : "px-4"}`}
      >
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <div key={item.id} className="relative group/nav">
              <button
                onClick={() => onNavigate(item.id)}
                className={`sidebar-nav-item w-full transition-all duration-300 ${
                  isCollapsed ? "justify-center px-0" : "px-[10px]"
                } ${
                  isActive
                    ? "bg-[#1B5E20]/10 text-[#1B5E20] shadow-[inset_2px_0_10px_rgba(27,94,32,0.1)] font-bold"
                    : `text-admin-text-gray hover:bg-[#1B5E20]/5 hover:translate-x-1 hover:text-[#1B5E20] font-medium`
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-[2px] bottom-[2px] w-[3px] bg-[#1B5E20] rounded-r-full"
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
                      : "w-auto opacity-100 flex items-center gap-2"
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

      {/* Bottom Section - Zone 2 */}
      <div className={`sidebar-bottom flex flex-col gap-[6px] ${isCollapsed ? "px-2" : "px-3"}`}>
        <div className="relative group/post">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("publish")}
            className={`w-full bg-[#1B5E20] text-white rounded-lg font-black uppercase tracking-widest flex items-center justify-center shadow-md shadow-[#1B5E20]/20 hover:bg-green-800 transition-all ${
              isCollapsed ? "h-[36px]" : "h-[40px] text-[12px] gap-2"
            }`}
          >
            <Plus size={16} />
            {!isCollapsed && (
              <span className="whitespace-nowrap transition-opacity duration-300">
                Post Property
              </span>
            )}
          </motion.button>

          {isCollapsed && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1B5E20] text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover/post:opacity-100 group-hover/post:visible transition-all whitespace-nowrap z-[60] shadow-lg">
              Post Property
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1B5E20] rotate-45" />
            </div>
          )}
        </div>

        <div className="relative group/mode mt-[4px]">
          <button
            onClick={toggleAdminDark}
            className={`w-full h-[36px] flex items-center rounded-lg font-bold transition-all border ${
              isCollapsed ? "justify-center px-0" : "px-3 gap-2 text-[12px]"
            } ${
              adminDarkMode
                ? "bg-[#374151] text-[#F9FAFB] border-[#4B5563] hover:bg-[#4B5563]"
                : "bg-[#F3F4F6] text-[#374151] border-[#E5E7EB] hover:bg-gray-200"
            }`}
          >
            {adminDarkMode ? (
              <>
                <Sun size={14} className="text-yellow-400" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap">Light Mode</span>
                )}
              </>
            ) : (
              <>
                <Moon size={14} className="text-blue-500" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap">Dark Mode</span>
                )}
              </>
            )}
          </button>
          
          {isCollapsed && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1B5E20] text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover/mode:opacity-100 group-hover/mode:visible transition-all whitespace-nowrap z-[60] shadow-lg">
              {adminDarkMode ? "Light Mode" : "Dark Mode"}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1B5E20] rotate-45" />
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="p-2 mt-[2px] bg-gray-50 dark:bg-[#1f2937] rounded-lg border border-gray-100 dark:border-gray-800">
             <button 
                onClick={() => setWorkflowsCollapsed(!workflowsCollapsed)}
                className="w-full flex items-center justify-between outline-none"
             >
                <div className="flex items-center gap-1.5">
                   <span className="text-yellow-500 text-[10px]">⚡</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">Workflows Active</span>
                </div>
                {workflowsCollapsed ? <ChevronDown size={14} className="text-gray-400"/> : <ChevronUp size={14} className="text-gray-400"/>}
             </button>
             
             <AnimatePresence>
                {!workflowsCollapsed && (
                   <motion.div 
                      className="space-y-1 mt-2 overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                   >
                      <div className="flex items-center justify-between text-[10px] h-[16px] font-bold text-gray-500">
                         <span>Quality Check:</span>
                         <span className="text-green-600">✅ Ready</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] h-[16px] font-bold text-gray-500">
                         <span>Lead Follow-up:</span>
                         <span className="text-green-600">✅ Active</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] h-[16px] font-bold text-gray-500">
                         <span>Price Alerts:</span>
                         <span className="text-green-600">✅ Ready</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] h-[16px] font-bold text-gray-500">
                         <span>Expiry Check:</span>
                         <span className="text-blue-500">🔄 Running</span>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        )}

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
        
        {!isCollapsed && (
          <div className="pt-2 flex justify-center opacity-100 transition-opacity duration-300">
             {/* Removed logo taking up space */}
          </div>
        )}
      </div>
    </aside>
  );
}
