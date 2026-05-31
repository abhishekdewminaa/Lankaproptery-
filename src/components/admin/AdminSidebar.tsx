import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
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

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { id: "listings", label: "Properties", icon: <ClipboardList size={20} /> },
    { id: "enquiries", label: "Leads", icon: <MessageSquare size={20} /> },
    { id: "marketing", label: "Marketing", icon: <Megaphone size={20} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r h-screen sticky top-0 z-[50] hidden lg:flex ${adminDarkMode ? "bg-[#13131F] border-[#1F2937]" : "bg-white border-admin-border"}`}
      style={{
        width: isCollapsed ? "64px" : "240px",
        transition: "width 0.3s ease",
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-[#1B5E20] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-800 transition-colors z-10"
      >
        <ChevronLeft
          size={14}
          className="transition-transform duration-300"
          style={{ transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Top Header */}
      <div className={`p-4 ${isCollapsed ? "items-center" : "p-6 pb-4"}`}>
        {!isCollapsed ? (
          <div className="mb-6 whitespace-nowrap overflow-hidden opacity-100 transition-opacity duration-300">
            <h1 className="text-xl font-black text-[#1B5E20] leading-none">
              LankaProperty
            </h1>
            <p className="text-[9px] uppercase tracking-widest text-admin-text-gray font-bold mt-1">
              Admin Portal
            </p>
          </div>
        ) : (
          <div className="mb-4 flex justify-center opacity-100 transition-opacity duration-300">
            <div className="w-8 h-8 bg-[#1B5E20]/10 rounded flex items-center justify-center">
              <span className="text-[#1B5E20] font-black text-sm">LP</span>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div
          className={`flex flex-col items-center py-4 border-y ${adminDarkMode ? "border-[#1F2937]" : "border-admin-border/50"} transition-all`}
        >
          <div
            className={`${isCollapsed ? "w-10 h-10 p-0.5" : "w-16 h-16 p-1"} rounded-full bg-admin-bg border-2 border-[#1B5E20]/20 mb-2 flex items-center justify-center overflow-hidden transition-all duration-300`}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Admin"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-[#1B5E20] text-white flex items-center justify-center font-black rounded-full text-lg">
                {user?.email?.[0].toUpperCase()}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="text-center overflow-hidden whitespace-nowrap opacity-100 transition-opacity duration-300">
              <h3
                className={`text-sm font-black ${adminDarkMode ? "text-white" : "text-admin-text-dark"}`}
              >
                {user?.email?.split("@")[0]}
              </h3>
              <p className="text-[10px] font-bold text-admin-text-gray uppercase tracking-widest mt-0.5">
                Administrator
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-grow py-2 space-y-1 ${isCollapsed ? "px-2" : "px-4"} overflow-y-auto overflow-x-hidden`}
      >
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <div key={item.id} className="relative group/nav">
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  isCollapsed ? "justify-center px-0" : "px-4"
                } ${
                  isActive
                    ? "bg-[#1B5E20]/10 text-[#1B5E20] shadow-[inset_2px_0_10px_rgba(27,94,32,0.1)]"
                    : `text-admin-text-gray hover:bg-[#1B5E20]/5 hover:translate-x-1 hover:text-[#1B5E20]`
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#1B5E20] rounded-r-full"
                  />
                )}
                <span
                  className={`${isActive ? "text-[#1B5E20]" : "text-gray-400 group-hover/nav:text-[#1B5E20] transition-colors"}`}
                >
                  {item.icon}
                </span>

                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    isCollapsed
                      ? "w-0 opacity-0 hidden"
                      : "w-auto opacity-100 block"
                  }`}
                >
                  {item.label}
                </span>
              </button>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1B5E20] text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all whitespace-nowrap z-[60] shadow-lg">
                  {item.label}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1B5E20] rotate-45" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={`p-4 space-y-4 ${isCollapsed ? "px-2" : "p-4"}`}>
        <div className="relative group/post">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("publish")}
            className={`w-full bg-[#1B5E20] text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center shadow-lg shadow-[#1B5E20]/20 hover:bg-green-800 transition-all ${
              isCollapsed ? "py-3" : "py-3 gap-2"
            }`}
          >
            <Plus size={18} />
            {!isCollapsed && (
              <span className="whitespace-nowrap opacity-100 transition-opacity duration-300">
                Post Property
              </span>
            )}
          </motion.button>

          {isCollapsed && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1B5E20] text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover/post:opacity-100 group-hover/post:visible transition-all whitespace-nowrap z-[60] shadow-lg">
              Post Property
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1B5E20] rotate-45" />
            </div>
          )}
        </div>

        <div className="relative group/mode">
          <button
            onClick={toggleAdminDark}
            className={`w-full flex items-center py-3 rounded-xl font-bold text-sm transition-all border ${
              isCollapsed ? "justify-center px-0" : "px-4 gap-3"
            } ${
              adminDarkMode
                ? "bg-[#374151] text-[#F9FAFB] border-[#4B5563] hover:bg-[#4B5563]"
                : "bg-[#F3F4F6] text-[#374151] border-[#E5E7EB] hover:bg-gray-200"
            }`}
          >
            {adminDarkMode ? (
              <>
                <Sun size={18} className="text-yellow-400" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap">Light Mode</span>
                )}
              </>
            ) : (
              <>
                <Moon size={18} className="text-blue-500" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap">Dark Mode</span>
                )}
              </>
            )}
          </button>
          {isCollapsed && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1B5E20] text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover/mode:opacity-100 group-hover/mode:visible transition-all whitespace-nowrap z-[60] shadow-lg">
              {adminDarkMode ? "Light Mode" : "Dark Mode"}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1B5E20] rotate-45" />
            </div>
          )}
        </div>

        <div className="relative group/out">
          <button
            onClick={onLogout}
            className={`w-full flex items-center py-3 text-admin-text-gray hover:text-red-600 font-bold text-sm transition-colors ${
              isCollapsed ? "justify-center px-0" : "gap-3 px-4"
            }`}
          >
            <LogOut
              size={18}
              className="text-gray-400 group-hover/out:text-red-600 transition-colors"
            />
            {!isCollapsed && (
              <span className="whitespace-nowrap">Sign Out</span>
            )}
          </button>
          {isCollapsed && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover/out:opacity-100 group-hover/out:visible transition-all whitespace-nowrap z-[60] shadow-lg">
              Sign Out
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-600 rotate-45" />
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="pt-4 border-t border-admin-border flex justify-center opacity-100 transition-opacity duration-300">
            <img
              src="https://qsqqolvsndvkwegvcfqv.supabase.co/storage/v1/object/sign/assets/Website%20logo%20.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MWNhMTU1MC03OGYzLTQwZGMtYTYzYi02NzVmZTRiYjM2NWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvV2Vic2l0ZSBsb2dvIC5wbmciLCJpYXQiOjE3NzgzMDk4MjksImV4cCI6MTkzNTk4OTgyOX0.LqwS9LCGK4UH1oL4YQHkiJdrNNgYGh-8CZtZBgrTO-s"
              alt="Logo"
              className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
