import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Settings, Menu, X } from 'lucide-react';

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Buy', href: '/buy/houses', type: 'category', data: { category: 'House', mode: 'buy' } },
    { name: 'Rent', href: '/rent/houses', type: 'category', data: { category: 'House', mode: 'rent' } },
    { name: 'Sell', href: '#', type: 'publish' },
    { name: 'Ad Packages', href: '#', type: 'packages' },
    { name: 'Projects', href: '#', type: 'home' },
    { name: 'Find Agent', href: '#', type: 'agents' },
  ];

  const handleLinkClick = (e: React.MouseEvent, link: any) => {
    e.preventDefault();
    if (onNavigate) {
      if (link.type === 'category') {
        window.history.pushState({}, '', link.href);
        onNavigate({ type: 'category', data: link.data });
      } else {
        onNavigate({ type: link.type });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`glass-navbar ${isScrolled ? 'scrolled' : 'bg-transparent'} h-20 flex items-center px-6 md:px-12`}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => {
            window.history.pushState({}, '', '/');
            onNavigateHome();
          }}
        >
          <span className="text-2xl font-bold text-brand-green">LankaProperty</span>
        </div>

        {/* Left Nav (Desktop) */}
        <div className="hidden md:flex items-center gap-8 ml-12">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link)}
              className={`text-sm font-bold hover:text-brand-green relative group transition-colors ${
                (link.name === 'Buy' && currentView === 'category') ? 'text-brand-green' : 'text-gray-700'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-green transition-all ${
                (link.name === 'Buy' && currentView === 'category') ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Settings size={20} />
            </button>
          </div>
          
          <button
            onClick={onPostAd}
            className="hidden md:block px-6 py-2.5 bg-brand-green-medium hover:bg-brand-green text-white font-bold rounded-lg transition-all shadow-lg shadow-brand-green/20 scale-100 hover:scale-105 active:scale-95"
          >
            Post Free Ad
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600"
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
            className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-gray-700"
                  onClick={(e) => handleLinkClick(e, link)}
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={() => {
                  onPostAd();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-brand-green text-white font-bold rounded-lg mt-2"
              >
                Post Free Ad
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
