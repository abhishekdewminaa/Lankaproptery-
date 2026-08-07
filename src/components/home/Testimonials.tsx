import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    rating: 5,
    quote: "Finding a premium luxury apartment in Colombo 05 was incredibly straightforward. EstateFlow's verified listings and direct agent communication made the entire closing process completely transparent and seamless.",
    name: "Rohan De Silva",
    role: "Home Buyer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    rating: 5,
    quote: "I listed my ancestral land in Kandy and found a verified buyer within just two weeks. The Premium Owner exposure and customer support are far superior to traditional newspaper classifieds.",
    name: "Anjali Senanayake",
    role: "Property Owner",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    rating: 5,
    quote: "As an expat property investor, managing assets from abroad can be difficult. EstateFlow's real-time market insights and direct messaging have made expanding my portfolio in Sri Lanka a breeze.",
    name: "Dr. Suresh Wijesinghe",
    role: "Property Investor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    rating: 5,
    quote: "We struggled to find reliable tenants for our commercial property in Negombo. Within three days of posting on EstateFlow, we secured a premium corporate lease. Exceptional reach!",
    name: "Priyantha Perera",
    role: "Commercial Landlord",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials-section" className="py-12 bg-[#f8fafc] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
            Customer Testimonials & Success Stories
          </h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Discover why home buyers, landlords, and elite property investors across Sri Lanka trust EstateFlow to navigate the market with confidence.
          </p>
        </div>

        {/* 4-Card Responsive Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {REVIEWS.map((review, idx) => (
            <motion.div 
              key={idx}
              id={`testimonial-card-${idx}`}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-full group cursor-pointer"
            >
              <div>
                {/* Header Star Rating & Quote Accent */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={15} 
                        fill="#0a4225" 
                        className="text-[#0a4225]" 
                      />
                    ))}
                  </div>
                  <Quote size={20} className="text-gray-200 group-hover:text-[#0a4225]/10 transition-colors" />
                </div>

                {/* Testimonial Quote */}
                <p className="text-gray-600 text-[13px] leading-relaxed mb-6 font-medium">
                  "{review.quote}"
                </p>
              </div>

              {/* User Identity Footer */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-gray-50 mt-auto">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#0a4225]/10 shrink-0">
                  <img 
                    referrerPolicy="no-referrer" 
                    onError={(e) => { e.currentTarget.src = '/placeholder-property.jpg' }} 
                    src={review.avatar} 
                    className="w-full h-full object-cover" 
                    alt={review.name} 
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm leading-tight truncate">
                    {review.name}
                  </h4>
                  <p className="text-[#0a4225] text-[10px] font-extrabold tracking-wider uppercase mt-0.5">
                    {review.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </section>
  );
};

