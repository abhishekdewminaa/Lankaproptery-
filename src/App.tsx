import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  LandPlot,
  Home as HomeIcon,
  Building2,
  Building,
  Hotel,
  Briefcase,
  User,
  ArrowRight,
  ArrowUp,
  Bed,
  Bath,
  DollarSign
} from "lucide-react";

// --- Types & Data ---
const PROPERTY_CATEGORIES = [
  { name: "Land", icon: <LandPlot className="w-6 h-6" />, count: "1,382" },
  { name: "House", icon: <HomeIcon className="w-6 h-6" />, count: "1,524" },
  { name: "Apartment", icon: <Building2 className="w-6 h-6" />, count: "108" },
  { name: "Building", icon: <Building className="w-6 h-6" />, count: "350" },
  { name: "Hotel", icon: <Hotel className="w-6 h-6" />, count: "184" },
  { name: "Business", icon: <Briefcase className="w-6 h-6" />, count: "52" },
];

const FEATURED_PROPERTIES = [
  {
    id: 1,
    title: "Recently Built Down Stair Fully Completed House",
    location: "Ratmalana",
    price: "Contact for Price",
    type: "Sale",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Residential Land for Sale at Malwatta",
    location: "Nittambuwa",
    price: "Rs. 850,000 / Perch",
    type: "Sale",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Valuable 40 Perches Land (SINNAKKARA) with House",
    location: "Talawakele",
    price: "Rs. 25,000,000",
    type: "Sale",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Modern 3 Bedroom Apartment for Rent",
    location: "Colombo 03",
    price: "Rs. 150,000 / Month",
    type: "Rent",
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 5,
    title: "Luxury Beachfront Guest House for Lease",
    location: "Negombo",
    price: "Rs. 450,000 / Month",
    type: "Rent",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 6,
    title: "Spacious Warehouse for Rent in Wattala",
    location: "Wattala",
    price: "Rs. 250,000 / Month",
    type: "Rent",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
  },
];

const AGENTS = [
  { name: "Mr. Lalith Ratnatunga", role: "Manager", img: "https://i.pravatar.cc/150?u=1" },
  { name: "Chamath Wickramasooriya", role: "Sales Lead", img: "https://i.pravatar.cc/150?u=2" },
  { name: "Barnad Fernando", role: "Consultant", img: "https://i.pravatar.cc/150?u=3" },
  { name: "Deshani Kaushalya", role: "Agent", img: "https://i.pravatar.cc/150?u=4" },
];

// --- Components ---

const Navbar = () => (
  <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
    <div className="bg-dark-navy h-8 flex items-center">
      <div className="container mx-auto px-6 flex justify-between items-center text-[10px] text-gray-300">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 opacity-80 underline-offset-2">Hotline: +94 33 222 96 95</span>
          <span className="flex items-center gap-1.5 opacity-80">Email: info@lankaproperty.lk</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-white compact-transition">Login</a>
          <span className="text-gray-700 text-[8px]">|</span>
          <a href="#" className="font-semibold text-brand-green hover:text-brand-green-dark compact-transition">Post a Free Ad</a>
        </div>
      </div>
    </div>
    <nav className="container mx-auto px-6 h-16 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold tracking-tight text-dark-navy leading-none">LankaProperty<span className="text-brand-green">.lk</span></h1>
        </div>
      </div>
      <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
        {["Home", "Real Estate", "Directory", "Agents", "Advertising", "Contact"].map((item) => (
          <li key={item}>
            <a href="#" className={`${item === 'Home' ? 'text-brand-green border-b-2 border-brand-green pb-1' : 'hover:text-brand-green'} compact-transition`}>
              {item}
            </a>
          </li>
        ))}
      </ul>
      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 compact-transition">
        Menu
      </button>
    </nav>
  </header>
);

const WORDS = ["Home", "Villa", "Land", "Apartment", "Office"];

const Hero = () => {
  const [activeStatus, setActiveStatus] = useState<"Sale" | "Rent">("Sale");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[650px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover"
          alt="Modern Home"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
        <div className="max-w-md text-white">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold leading-tight drop-shadow-md"
          >
            Find Your Dream <br/>
            <div className="inline-block relative h-[1.15em] w-full align-top overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORDS[index]}
                  initial={{ y: 30, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -30, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="text-brand-green block"
                >
                  {WORDS[index]}
                </motion.span>
              </AnimatePresence>
            </div>
            in Sri Lanka.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-white/90 text-sm font-medium"
          >
            Over 15,000+ properties available for sale and rent across the island. 
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 rounded-2xl w-full max-w-sm"
        >
          <h3 className="text-xs font-bold mb-4 uppercase tracking-wider text-gray-500">Search Properties</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setActiveStatus("Sale")}
                className={`py-2.5 rounded-lg text-xs font-bold compact-transition ${activeStatus === 'Sale' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                For Sale
              </button>
              <button 
                onClick={() => setActiveStatus("Rent")}
                className={`py-2.5 rounded-lg text-xs font-bold compact-transition ${activeStatus === 'Rent' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                For Rent
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                  <option>All Types</option>
                  <option>Houses</option>
                  <option>Lands</option>
                  <option>Apartments</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                  <option>City</option>
                  <option>Colombo</option>
                  <option>Kandy</option>
                  <option>Galle</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                  <option>Beds</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                </select>
                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                  <option>Baths</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                </select>
                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs font-bold">LKR</span>
              </div>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-12 pr-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                <option>Price Range</option>
                <option>Below 10M</option>
                <option>10M - 50M</option>
                <option>50M - 100M</option>
                <option>Above 100M</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            <button className="w-full py-3 bg-brand-red text-white text-sm font-bold rounded-lg shadow-lg shadow-red-200 hover:bg-brand-red-dark compact-transition uppercase tracking-wide mt-2">
              Search Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const CategoryStrip = () => (
  <div className="bg-gray-50 border-b border-gray-100 py-6">
    <div className="container mx-auto px-6 flex justify-between items-center">
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {PROPERTY_CATEGORIES.slice(0, 4).map((cat, idx) => (
          <motion.div
            key={cat.name}
            className="flex flex-col items-center gap-1.5 min-w-[80px]"
          >
            <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 hover:border-brand-green cursor-pointer group compact-transition">
              <div className="text-gray-400 group-hover:text-brand-green group-hover:scale-110 compact-transition">
                {cat.icon}
              </div>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">{cat.name}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-gray-200">
        <button className="px-4 py-1.5 bg-brand-green text-white text-[10px] font-bold rounded-md compact-transition">Buy</button>
        <button className="px-4 py-1.5 text-gray-400 text-[10px] font-bold hover:text-gray-600 compact-transition">Rent</button>
      </div>
    </div>
  </div>
);

const PropertyCard = ({ property, onClick }: { property: any, onClick?: () => void }) => (
  <motion.div 
    onClick={onClick}
    className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden flex flex-col compact-transition cursor-pointer"
  >
    <div className="relative h-36 bg-gray-200 overflow-hidden">
      <img src={property.image} alt={property.title} className="w-full h-full object-cover compact-transition group-hover:scale-105" />
      <span className="absolute top-2 left-2 bg-brand-red text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">For {property.type}</span>
      <span className="absolute top-2 right-2 bg-white/90 text-gray-900 text-[9px] font-bold px-2 py-0.5 rounded-full">{property.location}</span>
    </div>
    <div className="p-3 flex flex-col gap-1">
      <div className="text-brand-green font-bold text-sm leading-none">{property.price === 'Contact for Price' ? 'LKR Contact' : property.price}</div>
      <div className="text-xs font-semibold text-gray-800 line-clamp-1 leading-tight">{property.title}</div>
      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
        <span className="flex items-center gap-1 font-medium"><Building2 size={10} /> 3 Beds</span>
        <span className="flex items-center gap-1 font-medium"><LandPlot size={10} /> 15 Perch</span>
      </div>
    </div>
  </motion.div>
);

const PropertyDetail = ({ property, onBack }: { property: any, onBack: () => void }) => {
  const images = Array(12).fill(property.image).map((img, i) => 
    i === 0 ? img : `https://images.unsplash.com/photo-${1512917774080 + i}-9991f1c4c750?auto=format&fit=crop&q=60&w=600`
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-6 py-8"
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
        <button onClick={onBack} className="hover:text-brand-green">Home</button>
        <ChevronDown size={12} className="-rotate-90" />
        <span className="text-gray-900">Property Details</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-dark-navy mb-2">{property.title}</h1>
            <p className="text-gray-500 flex items-center gap-1 text-sm font-medium">
              <MapPin size={14} className="text-brand-green" /> {property.location}, Sri Lanka
            </p>
          </div>

          {/* 12 Image Gallery Grid */}
          <div className="grid grid-cols-4 grid-rows-3 gap-2 h-[500px]">
            <div className="col-span-2 row-span-2 rounded-xl overflow-hidden shadow-sm">
              <img src={images[0]} className="w-full h-full object-cover hover:scale-105 compact-transition" />
            </div>
            {images.slice(1, 9).map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-sm">
                <img src={img} className="w-full h-full object-cover hover:scale-110 compact-transition" />
              </div>
            ))}
            <div className="col-span-2 rounded-xl overflow-hidden shadow-sm bg-gray-100 flex items-center justify-center relative">
              <img src={images[9]} className="w-full h-full object-cover opacity-50" />
              <button className="absolute inset-0 flex items-center justify-center text-dark-navy font-bold text-sm bg-white/20 backdrop-blur-sm hover:bg-white/40 compact-transition">
                + {images.length - 9} More Photos
              </button>
            </div>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-center">
              <Bed className="mx-auto text-brand-green mb-2" size={20} />
              <div className="text-sm font-bold text-dark-navy">3</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Bedrooms</div>
            </div>
            <div className="text-center">
              <Bath className="mx-auto text-brand-green mb-2" size={20} />
              <div className="text-sm font-bold text-dark-navy">2</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Bathrooms</div>
            </div>
            <div className="text-center">
              <LandPlot className="mx-auto text-brand-green mb-2" size={20} />
              <div className="text-sm font-bold text-dark-navy">15.5</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Perches</div>
            </div>
            <div className="text-center">
              <Building2 className="mx-auto text-brand-green mb-2" size={20} />
              <div className="text-sm font-bold text-dark-navy">2,400</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Sq Ft</div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-dark-navy mb-4">Description</h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-4">
              <p>Experience luxurious living in this architecturally designed home. Located in a prime residential area, this property offers a perfect blend of comfort and style. The open-plan living space is flooded with natural light, complementing the high-end finishes throughout.</p>
              <p>Key Features include modern pantry kitchen, fully tiled floors, landscaped garden, and high-security boundary walls. Only 5 minutes away from the main highway and close to supermarkets, schools, and hospitals.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Contact & Action */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl">
            <div className="text-2xl font-bold text-brand-green mb-1">{property.price}</div>
            <div className="text-xs text-gray-400 font-bold uppercase mb-6">Market Value</div>

            <div className="flex items-center gap-4 mb-6 pt-6 border-t border-gray-50">
              <img src="https://i.pravatar.cc/150?u=manager" className="w-14 h-14 rounded-full border-2 border-brand-green/20" />
              <div>
                <div className="text-sm font-bold text-dark-navy">Lalith Ratnatunga</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">Property Manager</div>
              </div>
            </div>

            <div className="space-y-3">
              <a 
                href="tel:+94771234567" 
                className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-bold py-3 rounded-xl hover:bg-brand-green-dark compact-transition text-sm"
              >
                <Phone size={16} /> Call Manager
              </a>
              <button 
                className="w-full flex items-center justify-center gap-2 bg-dark-navy text-white font-bold py-3 rounded-xl hover:opacity-90 compact-transition text-sm"
              >
                <Mail size={16} /> Send Inquiry
              </button>
              <button 
                className="w-full flex items-center justify-center gap-2 border-2 border-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:border-brand-green hover:text-brand-green compact-transition text-sm"
              >
                Book a Viewing
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-[10px] text-gray-500 text-center">
              Mention "LankaProperty Ref: LP-9402" when calling for faster assistance.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Sidebar = () => (
  <aside className="space-y-6">
    <div>
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Directory</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-center shadow-sm cursor-pointer hover:border-brand-green compact-transition">
          <div className="text-sm font-bold text-dark-navy">2.4k</div>
          <div className="text-[8px] text-gray-500 uppercase font-bold">Agents</div>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-center shadow-sm cursor-pointer hover:border-brand-green compact-transition">
          <div className="text-sm font-bold text-dark-navy">850</div>
          <div className="text-[8px] text-gray-500 uppercase font-bold">Developers</div>
        </div>
      </div>
    </div>
    
    <div>
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Popular Cities</h3>
      <div className="flex flex-wrap gap-1.5">
        {["Colombo", "Kandy", "Galle", "Wattala", "Negombo"].map(city => (
          <span key={city} className="px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-600 rounded-full hover:bg-brand-green hover:text-white cursor-pointer compact-transition">
            {city}
          </span>
        ))}
      </div>
    </div>

    <div className="bg-dark-navy p-4 rounded-xl text-white relative overflow-hidden group">
      <div className="relative z-10">
        <h4 className="text-sm font-bold">Sell your home?</h4>
        <p className="text-[10px] text-gray-400 mt-1 mb-4 leading-tight">List for free and reach 500k monthly buyers across the island.</p>
        <button className="w-full py-2 bg-brand-green text-white text-[10px] font-bold rounded-lg hover:bg-brand-green-dark compact-transition">
          List Now
        </button>
      </div>
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-brand-green/20 rounded-full group-hover:scale-150 compact-transition"></div>
    </div>
  </aside>
);

const Footer = () => (
  <footer className="bg-dark-navy py-6 border-t border-gray-800">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-[10px] text-gray-500">
        &copy; 2026 LankaProperty.lk - Sri Lanka's #1 Real Estate Marketplace.
      </div>

      <div className="flex gap-3">
        {[
          { Icon: Facebook, link: "https://facebook.com" },
          { Icon: Twitter, link: "https://twitter.com" },
          { Icon: Instagram, link: "https://instagram.com" },
          { Icon: Linkedin, link: "https://linkedin.com" }
        ].map(({ Icon, link }, i) => (
          <a 
            key={i} 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:border-brand-green hover:text-brand-green bg-dark-navy hover:bg-gray-800 compact-transition"
          >
            <Icon size={14} />
          </a>
        ))}
      </div>

      <div className="flex gap-6 text-[10px] text-gray-400 font-medium">
        {["Terms", "Privacy", "Sitemap"].map(item => (
          <a key={item} href="#" className="hover:text-white compact-transition">{item}</a>
        ))}
        <a href="#" className="font-semibold text-brand-green hover:text-brand-green-dark compact-transition underline underline-offset-4">Agent Login</a>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [recentFilter, setRecentFilter] = useState<"Sale" | "Rent">("Sale");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentView, setCurrentView] = useState<{ type: 'home' | 'category' | 'detail', data?: any }>({ type: 'home' });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredRecent = FEATURED_PROPERTIES.filter(p => p.type === recentFilter);
  const categoryProperties = currentView.type === 'category' 
    ? FEATURED_PROPERTIES // Simplified: showing all for demo
    : [];

  const handleCategoryClick = (category: string) => {
    setCurrentView({ type: 'category', data: category });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleDetailClick = (property: any) => {
    setCurrentView({ type: 'detail', data: property });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setCurrentView({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="bg-dark-navy h-8 flex items-center">
          <div className="container mx-auto px-6 flex justify-between items-center text-[10px] text-gray-300">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 opacity-80">Hotline: +94 33 222 96 95</span>
              <span className="flex items-center gap-1.5 opacity-80">Email: info@lankaproperty.lk</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-white compact-transition">Login</a>
              <span className="text-gray-700 text-[8px]">|</span>
              <a href="#" className="font-semibold text-brand-green hover:text-brand-green-dark compact-transition">Post a Free Ad</a>
            </div>
          </div>
        </div>
        <nav className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateHome()}>
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-dark-navy leading-none">LankaProperty<span className="text-brand-green">.lk</span></h1>
            </div>
          </div>
          <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            {["Home", "Real Estate", "Directory", "Agents", "Advertising", "Contact"].map((item) => (
              <li key={item}>
                <a 
                  href="#" 
                  onClick={(e) => item === 'Home' ? navigateHome(e) : null}
                  className={`${(item === 'Home' && currentView.type === 'home') ? 'text-brand-green border-b-2 border-brand-green pb-1' : 'hover:text-brand-green'} compact-transition`}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 compact-transition">
            Menu
          </button>
        </nav>
      </header>
      
      <AnimatePresence mode="wait">
        {currentView.type === 'home' && (
          <motion.main 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow space-y-12 pb-16"
          >
            <Hero />
            <div className="bg-gray-50 border-b border-gray-100 py-6">
              <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {PROPERTY_CATEGORIES.map((cat, idx) => (
                    <motion.div
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat.name)}
                      className="flex flex-col items-center gap-1.5 min-w-[80px] cursor-pointer group"
                    >
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 group-hover:border-brand-green compact-transition">
                        <div className="text-gray-400 group-hover:text-brand-green group-hover:scale-110 compact-transition">
                          {cat.icon}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight group-hover:text-brand-green">{cat.name}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-gray-200">
                  <button className="px-4 py-1.5 bg-brand-green text-white text-[10px] font-bold rounded-md compact-transition">Buy</button>
                  <button className="px-4 py-1.5 text-gray-400 text-[10px] font-bold hover:text-gray-600 compact-transition">Rent</button>
                </div>
              </div>
            </div>

            <section className="container mx-auto px-6">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-10">
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="text-lg font-bold text-dark-navy">Featured Properties</h2>
                      <a href="#" className="text-xs text-brand-green font-bold hover:underline">View All &rarr;</a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {FEATURED_PROPERTIES.slice(0,3).map(p => <PropertyCard key={p.id} property={p} onClick={() => handleDetailClick(p)} />)}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                      <h2 className="text-lg font-bold text-dark-navy">Recent Listings</h2>
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setRecentFilter("Sale")} className={`px-6 py-1.5 rounded-md text-[10px] font-bold compact-transition ${recentFilter === 'Sale' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Buy</button>
                        <button onClick={() => setRecentFilter("Rent")} className={`px-6 py-1.5 rounded-md text-[10px] font-bold compact-transition ${recentFilter === 'Rent' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Rent</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRecent.map(p => (
                        <motion.div key={`${recentFilter}-${p.id}`} layout transition={{ duration: 0.2 }}>
                          <PropertyCard property={p} onClick={() => handleDetailClick(p)} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-64 shrink-0"><Sidebar /></div>
              </div>
            </section>
          </motion.main>
        )}

        {currentView.type === 'category' && (
          <motion.main 
            key="category"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-grow pb-16"
          >
            <div className="bg-white border-b border-gray-100 py-8">
              <div className="container mx-auto px-6">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 font-medium">
                  <a href="#" onClick={navigateHome} className="hover:text-brand-green">Home</a>
                  <ChevronDown size={12} className="-rotate-90" />
                  <span className="text-gray-900">{currentView.data}s in Sri Lanka</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h1 className="text-3xl font-bold text-dark-navy">{currentView.data}s For Sale & Rent</h1>
                    <p className="text-gray-500 mt-2 text-sm">Showing verified {currentView.data?.toLowerCase()} listings</p>
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setRecentFilter("Sale")} className={`px-6 py-2 rounded-md text-xs font-bold compact-transition ${recentFilter === 'Sale' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>For Buy</button>
                    <button onClick={() => setRecentFilter("Rent")} className={`px-6 py-2 rounded-md text-xs font-bold compact-transition ${recentFilter === 'Rent' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>For Rent</button>
                  </div>
                </div>
              </div>
            </div>

            <section className="container mx-auto px-6 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoryProperties.map(p => <PropertyCard key={p.id} property={p} onClick={() => handleDetailClick(p)} />)}
              </div>
            </section>
          </motion.main>
        )}

        {currentView.type === 'detail' && (
          <PropertyDetail property={currentView.data} onBack={navigateHome} />
        )}
      </AnimatePresence>

      <Footer />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-brand-green text-white rounded-full flex items-center justify-center shadow-xl hover:bg-brand-green-dark compact-transition z-[100]"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

