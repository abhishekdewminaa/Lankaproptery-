import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Send, Moon, Sun, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  onAdminClick: () => void;
  onHomeClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick, onHomeClick }) => {
  return (
    <footer className="footer bg-[#0a4225] text-white">
      <div className="footer-inner">
        {/* Footer Grid */}
        <div className="footer-grid container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 relative z-10">
          
          {/* Col 1: About */}
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5 }}
             className="space-y-6"
          >
            <div className="text-2xl font-bold text-white mb-6">LankaProperty</div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Sri Lanka's premier real estate marketplace. Connecting buyers, sellers, and renters with the most trusted properties and agents across the island.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="social-icon">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Col 2: Quick Links */}
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="space-y-6"
          >
            <h4 className="footer-col-title text-sm font-black uppercase tracking-widest text-white">Quick Links</h4>
            <ul className="space-y-3 footer-col">
              {['About', 'Property Wanted', 'Contact Support', 'Terms of Service', 'Privacy Policy', 'Sitemap'].map((link) => (
                <li key={link}>
                  <a href="#" className="footer-link text-gray-400 text-sm hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 3: Popular Areas */}
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="space-y-6"
          >
            <h4 className="footer-col-title text-sm font-black uppercase tracking-widest text-white">Popular Areas</h4>
            <ul className="space-y-3 footer-col">
              {['Colombo Real Estate', 'Kandy Properties', 'Galle Villas', 'Negombo Land', 'Kurunegala Homes', 'Kalutara Estates'].map((link) => (
                <li key={link}>
                  <a href="#" className="footer-link text-gray-400 text-sm hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 4: Newsletter */}
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="space-y-6"
          >
            <h4 className="footer-col-title text-sm font-black uppercase tracking-widest text-white">Newsletter</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Subscribe to receive the latest property market insights and deals.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full bg-white border border-white/10 rounded-xl py-4 px-5 text-sm outline-none focus:border-brand-green text-[#002618] placeholder:text-gray-400 transition-all"
              />
              <button className="newsletter-btn absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center hover:bg-brand-green-medium transition-all shadow-lg active:scale-90" style={{ padding: 0 }}>
                <Send size={18} />
              </button>
            </div>
            <div className="inline-flex items-center gap-2 bg-white text-brand-green text-[10px] font-black px-3 py-1.5 rounded-full border border-brand-green/20">
              GET 10% OFF YOUR FIRST AD LISTING!
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom container mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest order-2 md:order-1">
            <span>© 2026 LANKAPROPERTY.LK. ALL RIGHTS RESERVED.</span>
            <button 
              onClick={onAdminClick}
              className="hover:text-brand-green transition-colors flex items-center gap-1.5"
              title="Admin Access"
            >
              <Home size={14} />
              <span>Admin Access</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 order-1 md:order-2">
            <button className="p-2 border border-white/10 rounded-full text-gray-500 hover:text-white hover:bg-white/5 transition-all">
              <Moon size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 order-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Platform Status: Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
