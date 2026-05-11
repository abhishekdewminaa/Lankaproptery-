import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Settings, Menu, X, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onPostAd: () => void;
  onNavigateHome: () => void;
  onAdminAccess: () => void;
  onNavigate?: (view: any) => void;
  currentView?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onPostAd, onNavigateHome, onAdminAccess, onNavigate, currentView }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        { name: 'All Properties', href: '/', data: { type: 'home' } },
      ]
    },
    { 
      name: 'Rent', 
      type: 'dropdown',
      items: [
        { name: 'Houses for Rent', href: '/rent/houses', data: { category: 'House', mode: 'rent' } },
        { name: 'Apartments for Rent', href: '/rent/apartments', data: { category: 'Apartment', mode: 'rent' } },
        { name: 'All Rentals', href: '/', data: { type: 'home' } },
      ]
    },
    { name: 'Sell', href: '/sell', type: 'sell' },
    { name: 'Ad Packages', href: '/packages', type: 'packages' },
    { name: 'Wanted', href: '/wanted', type: 'wanted' },
    { name: 'Projects', href: '#', type: 'home' },
    { name: 'Find Agent', href: '#', type: 'agents' },
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
    <nav className={`glass-navbar ${isScrolled ? 'scrolled shadow-lg' : 'bg-transparent'} h-20 flex items-center px-6 md:px-12 fixed top-0 w-full z-[100] transition-all duration-300`}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => {
            window.history.pushState({}, '', '/');
            onNavigateHome();
          }}
        >
          <span className="text-2xl font-black text-brand-green tracking-tighter">LankaProperty<span className="text-dark-navy">.lk</span></span>
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
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full" />
            </button>
          </div>
          
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
