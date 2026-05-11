import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    rating: 5,
    quote: "Found my dream villa in Galle through LankaProperty. The search filters were incredibly precise, making the whole process stress-free.",
    name: "Amara Perera",
    role: "HOME BUYER",
    avatar: "https://i.pravatar.cc/150?u=amara",
  },
  {
    rating: 5,
    quote: "The AI price estimator was spot on! It helped me list my apartment at the perfect market rate, leading to a quick sale within weeks.",
    name: "Sahan Gunasekera",
    role: "PROPERTY INVESTOR",
    avatar: "https://i.pravatar.cc/150?u=sahan",
  },
  {
    rating: 5,
    quote: "As a first-time renter in Colombo, I was nervous. This platform provided all the verified details I needed to feel confident in my choice.",
    name: "Dilini Silva",
    role: "RENTER",
    avatar: "https://i.pravatar.cc/150?u=dilini",
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-[#F8FAF8]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What <span className="text-brand-green">Our</span> Clients Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50 flex flex-col h-full"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.12 + i * 0.05, type: 'spring' }}
                  >
                    <Star size={18} fill="#F5A623" className="text-yellow-500" />
                  </motion.div>
                ))}
              </div>

              <p className="text-gray-500 italic mb-8 flex-grow leading-relaxed">
                "{review.quote}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-green/20">
                  <img src={review.avatar} className="w-full h-full object-cover" alt={review.name} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-none mb-1">{review.name}</h4>
                  <p className="text-[10px] font-black tracking-widest text-brand-green">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
