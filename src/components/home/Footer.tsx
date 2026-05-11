import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Send, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="bg-[#0A1628] text-white pt-20 pb-8 overflow-hidden relative">
      {/* Footer Grid */}
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 relative z-10">
        
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
              <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-green hover:border-brand-green transition-all">
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
          <h4 className="text-sm font-black uppercase tracking-widest text-brand-green">Quick Links</h4>
          <ul className="space-y-3">
            {['About', 'Property Wanted', 'Contact Support', 'Terms of Service', 'Privacy Policy', 'Sitemap'].map((link) => (
              <li key={link}>
                <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">{link}</a>
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
          <h4 className="text-sm font-black uppercase tracking-widest text-brand-green">Popular Areas</h4>
          <ul className="space-y-3">
            {['Colombo Real Estate', 'Kandy Properties', 'Galle Villas', 'Negombo Land', 'Kurunegala Homes', 'Kalutara Estates'].map((link) => (
              <li key={link}>
                <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">{link}</a>
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
          <h4 className="text-sm font-black uppercase tracking-widest text-brand-green">Newsletter</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            Subscribe to receive the latest property market insights and deals.
          </p>
          <div className="relative group">
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm outline-none focus:border-brand-green focus:bg-white/10 transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center hover:bg-brand-green-medium transition-all shadow-lg active:scale-90">
              <Send size={18} />
            </button>
          </div>
          <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green text-[10px] font-black px-3 py-1.5 rounded-full border border-brand-green/20">
            GET 10% OFF YOUR FIRST AD LISTING!
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest order-2 md:order-1">
          <span>© 2026 LANKAPROPERTY.LK. ALL RIGHTS RESERVED.</span>
          <button 
            onClick={onAdminClick}
            className="hover:text-brand-green transition-colors"
          >
            Admin Access
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
    </footer>
  );
};
