import { safeLocalStorage } from '../../utils/safeUtils';
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

  const isAgentLoggedIn = safeLocalStorage.getItem('agent_logged_in') === 'true';
  const isOwnerLoggedIn = safeLocalStorage.getItem('owner_logged_in') === 'true';

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPostModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleInterceptSell = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        const hasClass = link.classList.contains('sell-nav-link');
        if (href.includes('sell-my-property') || href.includes('sell_my_property') || hasClass) {
          e.preventDefault();
          setShowPostModal(true);
        }
      }
    };
    document.addEventListener('click', handleInterceptSell);
    return () => document.removeEventListener('click', handleInterceptSell);
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
    { 
      name: 'Rent', 
      type: 'dropdown',
      items: [
        { name: 'Houses for Rent', href: '/rent/houses', data: { category: 'House', mode: 'rent' } },
        { name: 'Land for Rent', href: '/rent/land', data: { category: 'Land', mode: 'rent' } },
        { name: 'Apartments for Rent', href: '/rent/apartments', data: { category: 'Apartment', mode: 'rent' } },
        { name: 'Buildings for Rent', href: '/rent/buildings', data: { category: 'Building', mode: 'rent' } },
        { name: 'Hotels for Rent', href: '/rent/hotels', data: { category: 'Hotel', mode: 'rent' } },
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
            src="https://qsqqolvsndvkwegvcfqv.supabase.co/storage/v1/object/sign/Homa%20page%20images/Homa%20page.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MWNhMTU1MC03OGYzLTQwZGMtYTYzYi02NzVmZTRiYjM2NWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJIb21hIHBhZ2UgaW1hZ2VzL0hvbWEgcGFnZS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgyMjcyNDczLCJleHAiOjI3MjgzNTI0NzN9.anq2vvFCtVaS-LDJkzccWqjo4kqH7wMmOIGw6oM7XKA"
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
            const isDividerAfter = link.name === 'Buy' || link.name === 'Rent';
            
            return (
              <React.Fragment key={link.name}>
                <div className="relative nav-item">
                  {link.type === 'dropdown' ? (
                    <>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                        className={`nav-link flex items-center gap-1 text-sm font-bold transition-colors cursor-pointer ${link.name.toLowerCase() === 'buy' ? 'nav-buy' : link.name.toLowerCase() === 'rent' ? 'nav-rent' : ''} ${styles.textColorClass} ${styles.hoverColorClass}`}
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
                            className="dropdown dropdown-menu absolute top-full left-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 overflow-hidden z-[110]"
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
                                  className={`dropdown-item block px-6 py-2.5 text-sm font-bold transition-colors ${itemStyles.hoverBgClass}`}
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
                      className={`nav-link text-sm font-bold relative group transition-colors cursor-pointer ${link.name.toLowerCase() === 'buy' ? 'nav-buy' : link.name.toLowerCase() === 'sell' ? 'nav-sell' : link.name.toLowerCase() === 'rent' ? 'nav-rent' : ''} ${styles.textColorClass} ${styles.hoverColorClass}`}
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
                {link.name === 'Rent' && (
                  <>
                    <button 
                      id="sell-nav-btn"
                      onClick={() => setShowPostModal(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 18px',
                        background: '#CC1414',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        font: '700 14px Plus Jakarta Sans',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none',
                      }}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLElement).style.background = '#A00E0E';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLElement).style.background = '#CC1414';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      }}
                    >
                      <Home size={16} className="shrink-0" /> Sell
                    </button>
                    <span className="text-[#D1D5DB] font-light font-sans text-sm select-none">|</span>
                  </>
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
                  safeLocalStorage.removeItem('owner_logged_in');
                  safeLocalStorage.removeItem('owner_id');
                  safeLocalStorage.removeItem('owner_name');
                  safeLocalStorage.removeItem('owner_email');
                  safeLocalStorage.removeItem('user_role');
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
                  safeLocalStorage.removeItem('agent_logged_in');
                  safeLocalStorage.removeItem('agent_id');
                  safeLocalStorage.removeItem('agent_name');
                  safeLocalStorage.removeItem('agent_email');
                  safeLocalStorage.removeItem('user_role');
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
                      <span className="flex items-center gap-1.5 font-black text-[#111827]"><Home size={15} className="text-[#1A5E2A]" /> List My Property</span>
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
                      <span className="flex items-center gap-1.5 font-black text-[#111827]"><Building2 size={15} className="text-blue-600" /> Join as Agent</span>
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
                    safeLocalStorage.removeItem('owner_logged_in');
                    safeLocalStorage.removeItem('owner_id');
                    safeLocalStorage.removeItem('owner_name');
                    safeLocalStorage.removeItem('owner_email');
                    safeLocalStorage.removeItem('user_role');
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
                    safeLocalStorage.removeItem('agent_logged_in');
                    safeLocalStorage.removeItem('agent_id');
                    safeLocalStorage.removeItem('agent_name');
                    safeLocalStorage.removeItem('agent_email');
                    safeLocalStorage.removeItem('user_role');
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
                    <Home size={16} className="text-[#1A5E2A]" /> List My Property (Property Owner)
                  </button>
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/agent/register');
                      if (onNavigate) onNavigate({ type: 'agent_register' });
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2"
                  >
                    <Building2 size={16} className="text-blue-600" /> Join as Agent (Real Estate Professional)
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
          <div 
            id="sell-modal-overlay" 
            onClick={(e) => { if(e.target === e.currentTarget) setShowPostModal(false); }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              backdropFilter: 'blur(3px)',
              animation: 'fadeOverlay 0.2s ease',
            }}
          >
            {/* Modal Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '40px 36px',
                maxWidth: '680px',
                width: '100%',
                position: 'relative',
                animation: 'slideUp 0.25s ease',
                boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
              }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowPostModal(false)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  width: '36px',
                  height: '36px',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '50%',
                  fontSize: '18px',
                  color: '#374151',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  transition: 'background 0.15s',
                }}
                onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = '#E5E7EB'; }}
                onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
              >
                &times;
              </button>

              {/* POST PROPERTY Badge */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 18px',
                  border: '1.5px solid #1A5E2A',
                  borderRadius: '25px',
                  font: '700 12px Plus Jakarta Sans',
                  color: '#1A5E2A',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>POST PROPERTY</span>
              </div>

              {/* Heading */}
              <h2 style={{
                font: '800 28px/1.25 Plus Jakarta Sans',
                color: '#111827',
                textAlign: 'center',
                margin: '0 0 12px',
              }}>List Your Property on LankaProperty.lk</h2>

              {/* Subtitle */}
              <p style={{
                font: '400 15px/1.6 Plus Jakarta Sans',
                color: '#6B7280',
                textAlign: 'center',
                margin: '0 0 32px',
                maxWidth: '480px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>Choose the listing path that matches your profile to proceed with standard owner or agent listings.</p>

              {/* TWO OPTION CARDS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '28px',
              }}>
                {/* Card 1: Owner */}
                <div 
                  style={{
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '18px',
                    padding: '28px 24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  className="hover:border-[#1A5E2A] hover:shadow-lg hover:-translate-y-0.5"
                  onMouseOver={(e) => {
                    const card = e.currentTarget as HTMLElement;
                    card.style.borderColor = '#1A5E2A';
                    card.style.boxShadow = '0 4px 20px rgba(26,94,42,0.1)';
                    card.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    const card = e.currentTarget as HTMLElement;
                    card.style.borderColor = '#E5E7EB';
                    card.style.boxShadow = 'none';
                    card.style.transform = 'translateY(0)';
                  }}
                  onClick={() => {
                    setShowPostModal(false);
                    window.history.pushState({}, '', '/sell');
                    if (onNavigate) onNavigate({ type: 'sell' });
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: '#E8F5E9',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1A5E2A',
                  }}><Home size={28} /></div>

                  <span style={{
                    background: '#E8F5E9',
                    color: '#1A5E2A',
                    border: '1px solid #A5D6A7',
                    borderRadius: '20px',
                    padding: '3px 12px',
                    font: '700 11px Plus Jakarta Sans',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>FREE OPTION</span>

                  <h3 style={{
                    font: '800 20px Plus Jakarta Sans',
                    color: '#111827',
                    margin: 0,
                  }}>I Own This Property</h3>

                  <p style={{
                    font: '400 13px/1.65 Plus Jakarta Sans',
                    color: '#6B7280',
                    margin: 0,
                  }}>Post your private house, apartment or land draft directly for free to reach direct buyers.</p>

                  <a 
                    href="/sell"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPostModal(false);
                      window.history.pushState({}, '', '/sell');
                      if (onNavigate) onNavigate({ type: 'sell' });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '14px',
                      background: '#1A5E2A',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      font: '700 13px Plus Jakarta Sans',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                      marginTop: '4px',
                    }}
                    onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = '#0F3D1A'; }}
                    onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = '#1A5E2A'; }}
                  >SELL AS OWNER FREE &rarr;</a>
                </div>

                {/* Card 2: Agent */}
                <div 
                  style={{
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '18px',
                    padding: '28px 24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  className="hover:border-[#111827] hover:shadow-lg hover:-translate-y-0.5"
                  onMouseOver={(e) => {
                    const card = e.currentTarget as HTMLElement;
                    card.style.borderColor = '#111827';
                    card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                    card.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    const card = e.currentTarget as HTMLElement;
                    card.style.borderColor = '#E5E7EB';
                    card.style.boxShadow = 'none';
                    card.style.transform = 'translateY(0)';
                  }}
                  onClick={() => {
                    setShowPostModal(false);
                    window.history.pushState({}, '', '/agent/post-property/details');
                    if (onNavigate) onNavigate({ type: 'agent_sell' });
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: '#F3F4F6',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                  }}>🏢</div>

                  <span style={{
                    background: '#F3F4F6',
                    color: '#374151',
                    border: '1px solid #E5E7EB',
                    borderRadius: '20px',
                    padding: '3px 12px',
                    font: '700 11px Plus Jakarta Sans',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>AGENT</span>

                  <h3 style={{
                    font: '800 20px Plus Jakarta Sans',
                    color: '#111827',
                    margin: 0,
                  }}>I Am An Agent / Broker</h3>

                  <p style={{
                    font: '400 13px/1.65 Plus Jakarta Sans',
                    color: '#6B7280',
                    margin: 0,
                  }}>Access advanced broker CRM, team leads, pipeline boards, bio profile &amp; syndication tools.</p>

                  <a 
                    href="/agent/post-property/details"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPostModal(false);
                      window.history.pushState({}, '', '/agent/post-property/details');
                      if (onNavigate) onNavigate({ type: 'agent_sell' });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '14px',
                      background: '#111827',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      font: '700 13px Plus Jakarta Sans',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                      marginTop: '4px',
                    }}
                    onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = '#000000'; }}
                    onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = '#111827'; }}
                  >POST AS AGENT &rarr;</a>
                </div>
              </div>

              {/* Bottom: Already an agent? */}
              <div style={{
                textAlign: 'center',
                font: '500 14px Plus Jakarta Sans',
                color: '#6B7280',
              }}>
                Are you a registered agent?&nbsp;
                <a 
                  href="/agent/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPostModal(false);
                    window.history.pushState({}, '', '/agent/login');
                    if (onNavigate) onNavigate({ type: 'agent_login' });
                  }}
                  style={{
                    color: '#1565C0',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                  className="hover:underline"
                >Sign In to Agent Portal &rarr;</a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};
