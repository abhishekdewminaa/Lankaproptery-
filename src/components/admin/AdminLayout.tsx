import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
  adminDarkMode: boolean;
  toggleAdminDark: () => void;
}

export default function AdminLayout({ 
  children, 
  activePage, 
  onNavigate, 
  user, 
  onLogout,
  adminDarkMode,
  toggleAdminDark
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`transition-colors duration-300 ${adminDarkMode ? 'admin-dark' : 'admin-light'}`}>
      <div className="flex min-h-screen bg-admin-bg font-sans selection:bg-admin-primary/10">
        {/* Sidebar - Desktop */}
        <div className="hidden md:block">
          <AdminSidebar 
            activePage={activePage} 
            onNavigate={(page) => {
              onNavigate(page);
            }} 
            user={user} 
            onLogout={onLogout} 
            adminDarkMode={adminDarkMode}
            toggleAdminDark={toggleAdminDark}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] md:hidden"
              />
              <motion.div 
                initial={{ x: '-240px' }}
                animate={{ x: 0 }}
                exit={{ x: '-240px' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                className="fixed inset-y-0 left-0 w-[240px] z-[1000] md:hidden shadow-2xl overflow-hidden"
              >
                <div className="absolute top-6 right-6 z-50">
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg bg-black/10 hover:bg-black/20 text-white">
                    <X size={18} />
                  </button>
                </div>
                <AdminSidebar 
                  activePage={activePage} 
                  onNavigate={(page) => {
                    onNavigate(page);
                    setIsSidebarOpen(false);
                  }} 
                  user={user} 
                  onLogout={onLogout} 
                  adminDarkMode={adminDarkMode}
                  toggleAdminDark={toggleAdminDark}
                  isMobile={true}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-grow flex flex-col min-w-0 md:ml-[240px] h-screen overflow-y-auto">
          <AdminNavbar 
            user={user} 
            onPostAd={() => onNavigate('publish')} 
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
          
          <main className="flex-grow p-4 md:p-8 lg:p-10">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-[1400px] mx-auto"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
