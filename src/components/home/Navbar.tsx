import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Settings, Menu, X, ChevronDown } from 'lucide-react';
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
        { name: 'Commercial', href: '/buy/commercial', data: { category: 'Commercial', mode: 'buy' } },
        { name: 'All Properties', href: '/', data: { type: 'home' } },
      ]
    },
    { 
      name: 'Rent', 
      type: 'dropdown',
      items: [
        { name: 'Houses for Rent', href: '/rent/houses', data: { category: 'House', mode: 'rent' } },
        { name: 'Apartments for Rent', href: '/rent/apartments', data: { category: 'Apartment', mode: 'rent' } },
        { name: 'Commercial for Rent', href: '/rent/commercial', data: { category: 'Commercial', mode: 'rent' } },
        { name: 'Buildings for Rent', href: '/rent/buildings', data: { category: 'Building', mode: 'rent' } },
        { name: 'All Rentals', href: '/', data: { type: 'home' } },
      ]
    },
    { name: 'Sell', href: '/sell', type: 'sell' },
    { name: 'Advertised Packages', href: '/packages', type: 'packages' },
    { name: 'Wanted', href: '/wanted', type: 'wanted' },
    { name: 'Projects', href: '/projects', type: 'lands' },
    { name: 'Find Agent', href: '#', type: 'agents' },
    { name: 'Agent Portal', href: '/agent/dashboard', type: 'agent_dashboard' },
    { name: 'Sell My Property', href: '/owner/dashboard', type: 'owner_dashboard' },
    { name: 'Feedback', href: '/feedback', type: 'feedback' },
  ];

  const handleLinkClick = (e: React.MouseEvent, link: any) => {
    e.preventDefault();
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
    <nav className={`glass-navbar bg-white ${isScrolled ? 'shadow-lg' : 'border-b border-gray-100/60'} h-20 flex items-center px-6 md:px-12 fixed top-0 w-full z-[100] transition-all duration-300`}>
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
        <div className="hidden lg:flex items-center gap-6 ml-8" ref={dropdownRef}>
          {navLinks.map((link) => (
            <div key={link.name} className="relative">
              {link.type === 'dropdown' ? (
                <>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                    className={`flex items-center gap-1 text-sm font-bold hover:text-brand-green transition-colors ${
                      activeDropdown === link.name ? 'text-brand-green' : 'text-gray-700'
                    }`}
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
                        className="absolute top-full left-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 overflow-hidden z-[110]"
                      >
                        {link.items?.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              if (item.data.type === 'home') {
                                onNavigateHome();
                              } else {
                                window.history.pushState({}, '', item.href);
                                if (onNavigate) onNavigate({ type: 'category', data: item.data });
                              }
                              setActiveDropdown(null);
                            }}
                            className="block px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-brand-green/5 hover:text-brand-green transition-colors"
                          >
                            {item.name}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link)}
                  className={`text-sm font-bold hover:text-brand-green relative group transition-colors ${
                    currentView === link.type ? 'text-brand-green' : 'text-gray-700'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-green transition-all ${
                    currentView === link.type ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4" ref={authDropdownRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/sell');
              if (onNavigate) onNavigate({ type: 'sell' });
            }}
            className="hidden sm:flex items-center justify-center bg-[#004F31] hover:bg-[#003420] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md cursor-pointer"
          >
            Post Your Property Free
          </button>

          {/* User Auth desktop controls */}
          {isOwnerLoggedIn ? (
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/owner/dashboard');
                  if (onNavigate) onNavigate({ type: 'owner_dashboard' });
                }}
                className="text-xs font-bold text-gray-700 hover:text-brand-green px-3 py-2 border border-gray-200 rounded-xl transition-colors"
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
                className="text-xs font-bold text-gray-700 hover:text-brand-green px-3 py-2 border border-gray-200 rounded-xl transition-colors"
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
                  className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-brand-green px-3 py-2 border border-gray-200 rounded-xl transition-all"
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
                      className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 hover:bg-brand-green/5 hover:text-brand-green border-b border-gray-50 flex flex-col gap-0.5"
                    >
                      <span className="flex items-center gap-1.5 font-black text-gray-800"><span className="text-sm">👤</span> I Want to Sell / Rent</span>
                      <span className="text-[10px] text-gray-400 font-semibold pl-5">My Property</span>
                    </button>
                    <button
                      onClick={() => {
                        window.history.pushState({}, '', '/agent/login');
                        if (onNavigate) onNavigate({ type: 'agent_login' });
                        setIsLoginOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 hover:bg-brand-green/5 hover:text-brand-green flex flex-col gap-0.5"
                    >
                      <span className="flex items-center gap-1.5 font-black text-gray-800"><span className="text-sm">🏢</span> I Am a Real Estate Agent</span>
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
                  className="flex items-center gap-1 text-xs font-black uppercase tracking-wider bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white px-3 py-2 rounded-xl transition-all"
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
                      className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 hover:bg-brand-green/5 hover:text-brand-green border-b border-gray-50 flex flex-col gap-0.5"
                    >
                      <span className="flex items-center gap-1.5 font-black text-gray-800"><span className="text-sm">🏠</span> List My Property</span>
                      <span className="text-[10px] text-gray-400 font-semibold pl-5">(Property Owner)</span>
                    </button>
                    <button
                      onClick={() => {
                        window.history.pushState({}, '', '/agent/register');
                        if (onNavigate) onNavigate({ type: 'agent_register' });
                        setIsRegisterOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 hover:bg-brand-green/5 hover:text-brand-green flex flex-col gap-0.5"
                    >
                      <span className="flex items-center gap-1.5 font-black text-gray-800"><span className="text-sm">🏢</span> Join as Agent</span>
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
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 lg:hidden overflow-hidden shadow-2xl z-[90]"
          >
            <div className="flex flex-col p-6 gap-2">
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
                            if (item.data.type === 'home') {
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
