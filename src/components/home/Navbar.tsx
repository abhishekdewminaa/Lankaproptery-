import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Settings, Menu, X, ChevronDown, Home, Building2, ArrowRight } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  onPostAd: () => void;
  onNavigateHome: () => void;
  onAdminAccess: () => void;
  onNavigate?: (view: any) => void;
  currentView?: string;
  user?: any;
}

export const Navbar: React.FC<NavbarProps> = ({ onPostAd, onNavigateHome, onAdminAccess, onNavigate, currentView, user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [showPostModal, setShowPostModal] = useState(false);

  const isAgentLoggedIn = localStorage.getItem('agent_logged_in') === 'true';
  const isOwnerLoggedIn = localStorage.getItem('owner_logged_in') === 'true';

  const dropdownRef = useRef<HTMLDivElement>(null);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setIsLoginOpen(false);
        setIsRegisterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeDropdown) {
      const timer = setTimeout(() => {
        const dropdowns = document.querySelectorAll('.dropdown, .dropdown-menu, .mega-menu');
        dropdowns.forEach((dropdown: any) => {
          const rect = dropdown.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          
          if (rect.right > viewportWidth) {
            dropdown.style.left = 'auto';
            dropdown.style.right = '0';
          }
          if (rect.left < 0) {
            dropdown.style.left = '0';
            dropdown.style.right = 'auto';
          }
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeDropdown]);

  const getLinkStyles = (name: string, isCurrent: boolean) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('buy')) {
      return {
        textColorClass: isCurrent ? 'text-[#E8A000]' : 'text-[#374151]',
        hoverColorClass: 'hover:text-[#E8A000]',
        lineBg: 'bg-[#E8A000]',
        hoverBgClass: 'hover:bg-[#E8A000]/5 hover:text-[#E8A000]',
      };
    }
    if (lowercaseName.includes('sell')) {
      return {
        textColorClass: isCurrent ? 'text-[#CC1414]' : 'text-[#374151]',
        hoverColorClass: 'hover:text-[#CC1414]',
        lineBg: 'bg-[#CC1414]',
        hoverBgClass: 'hover:bg-[#CC1414]/5 hover:text-[#CC1414]',
      };
    }
    if (lowercaseName.includes('rent')) {
      return {
        textColorClass: isCurrent ? 'text-[#1565C0]' : 'text-[#374151]',
        hoverColorClass: 'hover:text-[#1565C0]',
        lineBg: 'bg-[#1565C0]',
        hoverBgClass: 'hover:bg-[#1565C0]/5 hover:text-[#1565C0]',
      };
    }
    return {
      textColorClass: isCurrent ? 'text-[#1A5E2A]' : 'text-[#374151]',
      hoverColorClass: 'hover:text-[#1A5E2A]',
      lineBg: 'bg-[#1A5E2A]',
      hoverBgClass: 'hover:bg-[#1A5E2A]/5 hover:text-[#1A5E2A]',
    };
  };

  const navLinks = [
    { 
      name: 'Buy', 
      type: 'dropdown',
      items: [
        { name: 'Houses for Sale', href: '/buy/houses', data: { category: 'House', mode: 'buy' } },
        { name: 'Land for Sale', href: '/buy/land', data: { category: 'Land', mode: 'buy' } },
        { name: 'Apartments', href: '/buy/apartments', data: { category: 'Apartment', mode: 'buy' } },
        { name: 'Buildings', href: '/buy/buildings', data: { category: 'Building', mode: 'buy' } },
        { name: 'Hotels', href: '/buy/hotels', data: { category: 'Hotel', mode: 'buy' } },
      ]
    },
    { name: 'Advertised Packages', href: '/packages', type: 'packages' },
    { name: 'Wanted', href: '/wanted', type: 'wanted' },
    { name: 'Projects', href: '/projects', type: 'lands' },
    { name: 'Find Agent', href: '#', type: 'agents' },
  ];

  const handleLinkClick = (e: React.MouseEvent, link: any) => {
    e.preventDefault();
    if (link.type === 'sell') {
      setShowPostModal(true);
      setActiveDropdown(null);
      setIsMobileMenuOpen(false);
      return;
    }
    if (onNavigate) {
      if (link.type === 'category') {
        window.history.pushState({}, '', link.href);
        onNavigate({ type: 'category', data: link.data });
      } else if (link.data && link.data.type === 'home') {
         window.history.pushState({}, '', '/');
         onNavigate({ type: 'home' });
      } else {
        if (link.href && link.href !== '#') {
          window.history.pushState({}, '', link.href);
        }
        onNavigate({ type: link.type });
      }
    }
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar glass-navbar bg-white border-b border-solid border-[var(--lp-border)] h-16 flex items-center px-6 md:px-12 fixed top-0 w-full z-[100] transition-all duration-300`}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => {
            window.history.pushState({}, '', '/');
            onNavigateHome();
          }}
        >
          <motion.img
            src="https://qsqqolvsndvkwegvcfqv.supabase.co/storage/v1/object/sign/Homa%20page%20images/logo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MWNhMTU1MC03OGYzLTQwZGMtYTYzYi02NzVmZTRiYjM2NWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJIb21hIHBhZ2UgaW1hZ2VzL2xvZ28uanBlZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODM0MDY0MzAsImV4cCI6MjQxNDEyNjQzMH0.nxS6KSZywhJEiVjv2igHzUwiiC9mhP4MAsBmg-AV0hY"
            alt="LankaProperty Logo"
            className="h-12 md:h-16 w-auto object-contain rounded-xl"
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Left Nav (Desktop) */}
        <div className="nav-links nav-menu hidden lg:flex items-center gap-6 ml-8" ref={dropdownRef}>
          {navLinks.map((link, idx) => {
            const styles = getLinkStyles(link.name, currentView === link.type);
            const isDividerAfter = link.name === 'Buy';
            
            return (
              <React.Fragment key={link.name}>
                <div className="relative nav-item">
                  {link.type === 'dropdown' ? (
                    <>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                        className={`flex items-center gap-1 text-sm font-bold transition-colors cursor-pointer ${styles.textColorClass} ${styles.hoverColorClass}`}
                      >
                        {link.name}
                        <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === link.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="dropdown absolute top-full left-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 overflow-hidden z-[110]"
                          >
                            {link.items?.map((item) => {
                              const itemStyles = getLinkStyles(item.name, false);
                              return (
                                <a
                                  key={item.name}
                                  href={item.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if ((item.data as any).type === 'home') {
                                      onNavigateHome();
                                    } else {
                                      window.history.pushState({}, '', item.href);
                                      if (onNavigate) onNavigate({ type: 'category', data: item.data });
                                    }
                                    setActiveDropdown(null);
                                  }}
                                  className={`block px-6 py-2.5 text-sm font-bold transition-colors ${itemStyles.hoverBgClass}`}
                                >
                                  {item.name}
                                </a>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link)}
                      className={`text-sm font-bold relative group transition-colors cursor-pointer ${styles.textColorClass} ${styles.hoverColorClass}`}
                    >
                      {link.name}
                      <span className={`absolute -bottom-1 left-0 h-0.5 transition-all ${styles.lineBg} ${
                        currentView === link.type ? 'w-full' : 'w-0 group-hover:w-full'
                      }`} />
                    </a>
                  )}
                </div>
                {isDividerAfter && (
                  <span className="text-[#D1D5DB] font-light font-sans text-sm select-none">|</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4" ref={authDropdownRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowPostModal(true);
            }}
            className="post-btn post-property-btn hidden sm:flex items-center justify-center bg-[#1A5E2A] hover:bg-[#0F3D1A] text-white px-[18px] py-[10px] rounded-[8px] text-[14px] font-semibold transition-all duration-300 shadow-md cursor-pointer border-none"
          >
            POST YOUR PROPERTY FREE
          </button>

          {/* User Auth desktop controls */}
          {isOwnerLoggedIn ? (
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/owner/dashboard');
                  if (onNavigate) onNavigate({ type: 'owner_dashboard' });
                }}
                className="text-xs font-bold text-[#374151] hover:text-[#1A5E2A] px-3 py-2 border border-gray-200 rounded-xl transition-colors"
              >
                My Account
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('owner_logged_in');
                  localStorage.removeItem('owner_id');
                  localStorage.removeItem('owner_name');
                  localStorage.removeItem('owner_email');
                  localStorage.removeItem('user_role');
                  window.history.pushState({}, '', '/');
                  if (onNavigate) onNavigate({ type: 'explore' });
                  window.location.reload();
                }}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : isAgentLoggedIn ? (
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/agent/dashboard');
                  if (onNavigate) onNavigate({ type: 'agent_dashboard' });
                }}
                className="text-xs font-bold text-[#374151] hover:text-[#1A5E2A] px-3 py-2 border border-gray-200 rounded-xl transition-colors"
              >
                Agent Portal
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('agent_logged_in');
                  localStorage.removeItem('agent_id');
                  localStorage.removeItem('agent_name');
                  localStorage.removeItem('agent_email');
                  localStorage.removeItem('user_role');
                  window.history.pushState({}, '', '/');
                  if (onNavigate) onNavigate({ type: 'explore' });
                  window.location.reload();
                }}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2 relative">
              {/* Login dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsLoginOpen(!isLoginOpen);
                    setIsRegisterOpen(false);
                  }}
                  className="login-btn flex items-center gap-1 text-xs font-bold text-[#374151] hover:text-[#1A5E2A] px-3 py-2 border border-gray-200 rounded-xl transition-all"
                >
                  Login
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isLoginOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLoginOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[120]">
                    <button
                      onClick={() => {
                        window.history.pushState({}, '', '/owner/login');
                        if (onNavigate) onNavigate({ type: 'owner_login' });
                        setIsLoginOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-[#374151] hover:bg-[#1A5E2A]/5 hover:text-[#1A5E2A] border-b border-gray-50 flex flex-col gap-0.5"
                    >
                      <span className="flex items-center gap-1.5 font-black text-[#111827] hover:text-[#1A5E2A]"><span className="text-sm">👤</span> I Want to Sell / Rent</span>
                      <span className="text-[10px] text-gray-400 font-semibold pl-5">My Property</span>
                    </button>
                    <button
                      onClick={() => {
                        window.history.pushState({}, '', '/agent/login');
                        if (onNavigate) onNavigate({ type: 'agent_login' });
                        setIsLoginOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-[#374151] hover:bg-[#1A5E2A]/5 hover:text-[#1A5E2A] flex flex-col gap-0.5"
                    >
                      <span className="flex items-center gap-1.5 font-black text-[#111827] hover:text-[#1A5E2A]"><span className="text-sm">🏢</span> I Am a Real Estate Agent</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Register dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsRegisterOpen(!isRegisterOpen);
                    setIsLoginOpen(false);
                  }}
                  className="register-btn flex items-center gap-1 text-xs font-bold text-[#374151] hover:text-[#1A5E2A] px-3 py-2 border border-gray-200 rounded-xl transition-all"
                >
                  Register
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isRegisterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isRegisterOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[120]">
                    <button
                      onClick={() => {
                        window.history.pushState({}, '', '/owner/register');
                        if (onNavigate) onNavigate({ type: 'owner_register' });
                        setIsRegisterOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-[#374151] hover:bg-[#1A5E2A]/5 hover:text-[#1A5E2A] border-b border-gray-50 flex flex-col gap-0.5"
                    >
                      <span className="flex items-center gap-1.5 font-black text-[#111827]"><span className="text-sm">🏠</span> List My Property</span>
                      <span className="text-[10px] text-gray-400 font-semibold pl-5">(Property Owner)</span>
                    </button>
                    <button
                      onClick={() => {
                        window.history.pushState({}, '', '/agent/register');
                        if (onNavigate) onNavigate({ type: 'agent_register' });
                        setIsRegisterOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-[#374151] hover:bg-[#1A5E2A]/5 hover:text-[#1A5E2A] flex flex-col gap-0.5"
                    >
                      <span className="flex items-center gap-1.5 font-black text-[#111827]"><span className="text-sm">🏢</span> Join as Agent</span>
                      <span className="text-[10px] text-gray-400 font-semibold pl-5">(Real Estate Professional)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2 mr-2">
              <NotificationBell user={user} onNavigate={onNavigate} />
              <button
                onClick={onAdminAccess}
                className="hidden lg:flex items-center justify-center bg-brand-green/10 text-brand-green px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green hover:text-white transition-colors"
              >
                Dashboard
              </button>
            </div>
          ) : null}
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-gray-600 hamburger menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay hidden md:hidden ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu hidden md:hidden ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
          <span className="text-sm font-black uppercase tracking-wider text-gray-400">Menu</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {/* Mobile Auth options */}
          <div className="border-b border-gray-100 pb-4 mb-2">
            {isOwnerLoggedIn ? (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Account</p>
                <a
                  href="/owner/dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/owner/dashboard');
                    if (onNavigate) onNavigate({ type: 'owner_dashboard' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="block px-4 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 rounded-xl"
                >
                  My Dashboard
                </a>
                <button
                  onClick={() => {
                    localStorage.removeItem('owner_logged_in');
                    localStorage.removeItem('owner_id');
                    localStorage.removeItem('owner_name');
                    localStorage.removeItem('owner_email');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                  }}
                  className="w-full text-left px-4 py-3 text-base font-bold text-red-500 hover:bg-red-50 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            ) : isAgentLoggedIn ? (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Account</p>
                <a
                  href="/agent/dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/agent/dashboard');
                    if (onNavigate) onNavigate({ type: 'agent_dashboard' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="block px-4 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 rounded-xl"
                >
                  Agent Portal
                </a>
                <button
                  onClick={() => {
                    localStorage.removeItem('agent_logged_in');
                    localStorage.removeItem('agent_id');
                    localStorage.removeItem('agent_name');
                    localStorage.removeItem('agent_email');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                  }}
                  className="w-full text-left px-4 py-3 text-base font-bold text-red-500 hover:bg-red-50 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Login</p>
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/owner/login');
                      if (onNavigate) onNavigate({ type: 'owner_login' });
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2"
                  >
                    👤 I Want to Sell / Rent My Property
                  </button>
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/agent/login');
                      if (onNavigate) onNavigate({ type: 'agent_login' });
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2"
                  >
                    🏢 I Am a Real Estate Agent
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Register</p>
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/owner/register');
                      if (onNavigate) onNavigate({ type: 'owner_register' });
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2"
                  >
                    🏠 List My Property (Property Owner)
                  </button>
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/agent/register');
                      if (onNavigate) onNavigate({ type: 'agent_register' });
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2"
                  >
                    🏢 Join as Agent (Real Estate Professional)
                  </button>
                </div>
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <div key={link.name}>
              {link.type === 'dropdown' ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mt-4">{link.name}</p>
                  {link.items?.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 rounded-xl"
                      onClick={(e) => {
                        e.preventDefault();
                        if ((item.data as any).type === 'home') {
                          onNavigateHome();
                        } else {
                          window.history.pushState({}, '', item.href);
                          if (onNavigate) onNavigate({ type: 'category', data: item.data });
                        }
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className={`block px-4 py-3 text-base font-bold rounded-xl ${
                    currentView === link.type ? 'bg-brand-green/5 text-brand-green' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={(e) => handleLinkClick(e, link)}
                >
                  {link.name}
                </a>
              )}
            </div>
          ))}

          {/* Post Property button in menu */}
          <a
            href="/sell"
            onClick={(e) => {
              e.preventDefault();
              setShowPostModal(true);
              setIsMobileMenuOpen(false);
            }}
            className="post-btn animate-pulse"
          >
            Post Property
          </a>
        </div>
      </div>

      {/* Choose Listing Path Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
            <motion.div 
              id="post-property-modal-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-neutral-100 relative text-center overflow-hidden"
            >
              {/* Close Button */}
              <button 
                id="post-property-close-btn"
                onClick={() => setShowPostModal(false)}
                className="absolute top-6 right-6 h-9 w-9 rounded-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer z-10"
              >
                <X size={16} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#004F31]/5 border border-[#004F31]/10 text-[#004F31] rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3">
                Post Property
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                List Your Property on LankaProperty.lk
              </h2>
              <p className="text-sm font-medium text-neutral-500 max-w-md mx-auto mb-8">
                Choose the listing path that matches your profile to proceed with standard owner or agent listings.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Direct Owner Box */}
                <div 
                  id="direct-owner-box-card"
                  onClick={() => {
                    setShowPostModal(false);
                    window.history.pushState({}, '', '/sell');
                    if (onNavigate) onNavigate({ type: 'sell' });
                  }}
                  className="group relative border border-neutral-200/80 hover:border-[#004F31] rounded-[24px] p-6 flex flex-col justify-between items-center text-center transition-all duration-300 bg-white hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1 cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="space-y-2 mb-4 relative z-10 flex flex-col items-center">
                    <div className="h-14 w-14 bg-emerald-50/80 text-[#004F31] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-100/50 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <Home size={24} className="stroke-[2.25]" />
                    </div>
                    
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-100/50 text-emerald-800 rounded-full text-[9px] font-extrabold uppercase tracking-wider mb-1">
                      Free Option
                    </span>
                    
                    <h3 className="text-base font-black text-slate-800 tracking-tight">I Own This Property</h3>
                    <p className="text-xs font-semibold text-neutral-400 leading-relaxed max-w-[210px]">
                      Post your private house, apartment or land draft directly for free to reach direct buyers.
                    </p>
                  </div>
                  
                  <button
                    id="direct-owner-submit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPostModal(false);
                      window.history.pushState({}, '', '/sell');
                      if (onNavigate) onNavigate({ type: 'sell' });
                    }}
                    className="w-full mt-2 py-3.5 bg-[#004F31] hover:bg-[#003420] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-emerald-950/10 hover:shadow-emerald-950/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 relative z-10"
                  >
                    <span>Sell As Owner Free</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Professional Agent Box */}
                <div 
                  id="professional-agent-box-card"
                  onClick={() => {
                    setShowPostModal(false);
                    window.history.pushState({}, '', '/agent/post-property/details');
                    if (onNavigate) onNavigate({ type: 'agent_sell' });
                  }}
                  className="group relative border border-neutral-200/80 hover:border-slate-800 rounded-[24px] p-6 flex flex-col justify-between items-center text-center transition-all duration-300 bg-white hover:shadow-xl hover:shadow-slate-950/5 hover:-translate-y-1 cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="space-y-2 mb-4 relative z-10 flex flex-col items-center">
                    <div className="h-14 w-14 bg-slate-50/80 text-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-slate-100 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <Building2 size={24} className="stroke-[2.25]" />
                    </div>

                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full text-[9px] font-extrabold uppercase tracking-wider mb-1">
                      Agent
                    </span>
                    
                    <h3 className="text-base font-black text-slate-800 tracking-tight">I Am An Agent / Broker</h3>
                    <p className="text-xs font-semibold text-neutral-400 leading-relaxed max-w-[210px]">
                      Access advanced broker CRM, team leads, pipeline boards, bio profile & syndication tools.
                    </p>
                  </div>
                  
                  <button
                    id="professional-agent-submit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPostModal(false);
                      window.history.pushState({}, '', '/agent/post-property/details');
                      if (onNavigate) onNavigate({ type: 'agent_sell' });
                    }}
                    className="w-full mt-2 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-slate-950/10 hover:shadow-slate-950/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 relative z-10"
                  >
                    <span>Post As Agent</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>

              {/* Login option at the bottom */}
              <div className="border-t border-neutral-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
                <span className="text-xs font-bold text-neutral-500">Are you a registered agent?</span>
                <button
                  id="agent-portal-signin-btn"
                  onClick={() => {
                    setShowPostModal(false);
                    window.history.pushState({}, '', '/agent/login');
                    if (onNavigate) onNavigate({ type: 'agent_login' });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100/80 text-blue-600 hover:text-blue-700 rounded-lg text-xs font-black transition-all duration-200 cursor-pointer"
                >
                  <span>Sign In to Agent Portal</span>
                  <ArrowRight size={12} className="stroke-[2.5]" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};
