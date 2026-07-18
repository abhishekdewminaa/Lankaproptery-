import React from 'react';
import { Home, Building2, BadgeDollarSign } from 'lucide-react';
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
      icon: <Home className="w-6 h-6" strokeWidth={2.5} />,
      buttonText: 'Find a local agent',
      whatsappUrl: `https://wa.me/94332229695?text=${encodeURIComponent("Hi LankaProperty.lk! 👋 I want to buy a home in Sri Lanka. Can you connect me with a local agent?")}`
    },
    {
      id: 'rent',
      title: 'Rent a home',
      description: 'We’re creating a seamless online experience – from shopping on the largest rental network, to applying, to paying rent.',
      icon: <Building2 className="w-6 h-6" strokeWidth={2.5} />,
      buttonText: 'Find rentals',
      whatsappUrl: `https://wa.me/94332229695?text=${encodeURIComponent("Hi LankaProperty.lk! 👋 I want to rent a home. Can you help me find available rental listings?")}`
    },
    {
      id: 'sell',
      title: 'Sell a home',
      description: 'No matter what path you take to sell your home, we can help you navigate a successful sale.',
      icon: <BadgeDollarSign className="w-6 h-6" strokeWidth={2.5} />,
      buttonText: 'See your options',
      whatsappUrl: `https://wa.me/94332229695?text=${encodeURIComponent("Hi LankaProperty.lk! 👋 I am interested in selling my home. Can you help me list my property and explain the options?")}`
    }
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="buy-sell-rent">
      <div className="container">
        <div className="action-cards">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="action-card"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
            >
              <div className="action-icon">
                {service.icon}
              </div>

              <h3>
                {service.title}
              </h3>
              
              <p>
                {service.description}
              </p>

              <a
                href={service.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`action-btn action-card-btn ${service.id}`}
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
