import React from 'react';
import { ArrowRight, MapPin, Bed, Bath, Maximize2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface Property {
  id: number;
  title: string;
  location: string;
  priceLkr: number;
  type: string;
  category: string;
  image: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  size: string;
  isFeatured?: boolean;
  tag?: string;
  description?: string;
}

interface FeaturedPropertiesProps {
  properties?: any[];
  onNavigate: (view: any) => void;
}

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

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ onNavigate }) => {
  // Hardcoded premium properties matching the requested UI layout screenshot
  const featuredProperties: Property[] = [
    {
      id: 101,
      title: "Premium Tropical Architecture Villa",
      location: "Cinnamon Gardens, Colombo 07",
      priceLkr: 45000000,
      type: "Sale",
      category: "House",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800"
      ],
      bedrooms: 4,
      bathrooms: 3,
      size: "2800 sqft",
      tag: "PREMIUM",
      description: "An architecturally designed, luxurious family residence situated in Colombo's most prestigious neighborhood. Features spacious living areas, open-plan gourmet kitchen, landscaped courtyard, and 24-hour smart security."
    },
    {
      id: 102,
      title: "Havelock City Skyline Apartment",
      location: "Havelock City, Colombo 05",
      priceLkr: 82500000,
      type: "Sale",
      category: "Apartment",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800"
      ],
      bedrooms: 3,
      bathrooms: 2,
      size: "1650 sqft",
      description: "Experience premium high-rise living with sweeping views of the city skyline. Fully furnished, modern living spaces, premium European fittings, with full access to clubhouse facilities, pools, and garden pavilions."
    },
    {
      id: 103,
      title: "Oceanfront Luxury Infinity Villa",
      location: "Unawatuna, Galle",
      priceLkr: 125000000,
      type: "Sale",
      category: "Villa",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&q=80&w=800"
      ],
      bedrooms: 5,
      bathrooms: 5,
      size: "4500 sqft",
      tag: "NEW",
      description: "Stunning beachfront retreat with a state-of-the-art private pool, direct white-sand beach access, and magnificent sunset views. Built to international luxury standards with solar integration."
    },
    {
      id: 104,
      title: "Prime Gated Development Plot",
      location: "Malabe, Thalahena",
      priceLkr: 18000000,
      type: "Sale",
      category: "Land",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"
      ],
      size: "15.5 Perches",
      tag: "GATED",
      description: "Excellent residential land plot in a highly secure, gated community in Thalahena. Within minutes of prime colleges and IT parks. Ready for immediate construction."
    }
  ];

  return (
    <section className="py-12 bg-white" id="featured-properties">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Featured Properties</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Hand-picked premium listings for you.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate({ type: 'all_properties' })}
            className="flex items-center gap-1 text-[#0a4225] hover:text-[#072d19] font-bold text-sm transition-colors group cursor-pointer"
          >
            View All <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        {/* 4-Card Horizontal Grid with Staggered entrance */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredProperties.map((prop) => (
            <motion.div 
              key={prop.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate({ type: 'detail', data: prop })}
              className="bg-white rounded-md overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col group"
            >
              {/* Image Section */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                <img 
                  src={prop.image} 
                  alt={prop.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Custom Badges matching the exact screenshot */}
                {prop.tag === 'PREMIUM' && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#0a4225] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-sm">
                      PREMIUM
                    </span>
                  </div>
                )}
                {prop.tag === 'NEW' && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-sky-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-sm">
                      NEW
                    </span>
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="p-4 flex flex-col flex-1">
                <div className="text-2xl font-black text-gray-900 leading-tight mb-1">
                  Rs. {prop.priceLkr.toLocaleString()}
                </div>
                
                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold mb-4">
                  <MapPin size={13} className="text-gray-400 shrink-0" />
                  <span className="truncate">{prop.location}</span>
                </div>

                {/* Spec Indicators with borders and gray background */}
                <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-gray-50">
                  {prop.bedrooms && (
                    <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-md">
                      <Bed size={13} /> {prop.bedrooms}
                    </span>
                  )}
                  {prop.bathrooms && (
                    <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-md">
                      <Bath size={13} /> {prop.bathrooms}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-md">
                    <Maximize2 size={13} /> {prop.size}
                  </span>
                  {prop.tag === 'GATED' && (
                    <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-[#0a4225] text-xs font-bold px-3 py-1.5 rounded-md">
                      <ShieldCheck size={13} /> Gated
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};


