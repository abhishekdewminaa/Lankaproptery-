import React from 'react';
import { Home, Key, BadgeDollarSign, MapPin, Sparkles, Building2, ShieldCheck, HeartHandshake, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeServicesProps {
  onNavigate: (view: any) => void;
}

export const HomeServices: React.FC<HomeServicesProps> = ({ onNavigate }) => {
  const services = [
    {
      id: 'buy',
      title: 'Buy a home',
      description: 'A real estate agent can provide you with a clear breakdown of costs so that you can avoid surprise expenses.',
      icon: (
        <div className="relative w-full h-full flex items-center justify-center group">
          <motion.div 
            animate={{ y: [0, -4, 0] }} 
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="relative z-10 text-brand-green group-hover:text-brand-green-medium transition-colors"
          >
            <Home className="w-12 h-12" strokeWidth={1.5} />
          </motion.div>
        </div>
      ),
      buttonText: 'Find a local agent',
      whatsappUrl: `https://wa.me/94332229695?text=${encodeURIComponent("Hi LankaProperty.lk! 👋 I want to buy a home in Sri Lanka. Can you connect me with a local agent?")}`
    },
    {
      id: 'rent',
      title: 'Rent a home',
      description: 'We’re creating a seamless online experience – from shopping on the largest rental network, to applying, to paying rent.',
      icon: (
        <div className="relative w-full h-full flex items-center justify-center group">
          <motion.div 
            animate={{ y: [0, -4, 0] }} 
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 0.2 }}
            className="relative z-10 text-brand-green group-hover:text-brand-green-medium transition-colors"
          >
            <Building2 className="w-12 h-12" strokeWidth={1.5} />
          </motion.div>
        </div>
      ),
      buttonText: 'Find rentals',
      whatsappUrl: `https://wa.me/94332229695?text=${encodeURIComponent("Hi LankaProperty.lk! 👋 I want to rent a home. Can you help me find available rental listings?")}`
    },
    {
      id: 'sell',
      title: 'Sell a home',
      description: 'No matter what path you take to sell your home, we can help you navigate a successful sale.',
      icon: (
        <div className="relative w-full h-full flex items-center justify-center group">
          <motion.div 
            animate={{ y: [0, -4, 0] }} 
            transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut", delay: 0.4 }}
            className="relative z-10 text-brand-green group-hover:text-brand-green-medium transition-colors"
          >
            <BadgeDollarSign className="w-12 h-12" strokeWidth={1.5} />
          </motion.div>
        </div>
      ),
      buttonText: 'See your options',
      whatsappUrl: `https://wa.me/94332229695?text=${encodeURIComponent("Hi LankaProperty.lk! 👋 I am interested in selling my home. Can you help me list my property and explain the options?")}`
    }
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-10 md:py-12 bg-[#004F31] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="bg-[#0d4c34] rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-[0_4px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.25)] transition-all duration-300 border border-white/5 group"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
            >
              {/* Animated Icon Container */}
              <div className="relative mb-6 mt-2">
                <motion.div 
                  className="absolute inset-0 bg-white/10 rounded-full scale-[2.5] blur-xl"
                  animate={{ rotate: 360, scale: [2.2, 2.5, 2.2] }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                />
                <motion.div 
                  className="relative flex items-center justify-center w-28 h-28 bg-white rounded-[2rem] shadow-lg border border-white/10 z-10 overflow-visible transition-transform duration-500 group-hover:-translate-y-2"
                >
                  {service.icon}
                </motion.div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-emerald-300 transition-colors duration-300">
                {service.title}
              </h3>
              
              <p className="text-white/80 mb-6 leading-relaxed flex-grow text-base">
                {service.description}
              </p>

              <a
                href={service.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center px-8 py-4 min-w-[220px] bg-white border-2 border-transparent text-[#004F31] font-black text-lg rounded-full hover:bg-emerald-50 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                {service.buttonText}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
