import { motion } from "motion/react";
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
  ArrowRight
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

const Hero = () => (
  <section className="relative h-[480px] flex items-center overflow-hidden">
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
          Find Your Dream <br/>Home in Sri Lanka.
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
        <h3 className="text-xs font-bold mb-4 uppercase tracking-wider text-gray-500">Quick Property Search</h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2.5 rounded-lg bg-brand-green text-white text-xs font-bold compact-transition">Buy</button>
            <button className="py-2.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 compact-transition">Rent</button>
          </div>

          <div className="space-y-2.5">
            <div className="relative">
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                <option>All Categories</option>
                <option>Houses</option>
                <option>Lands</option>
                <option>Apartments</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            <div className="relative">
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 appearance-none text-xs text-gray-700 font-medium focus:ring-1 focus:ring-brand-green outline-none compact-transition">
                <option>Select City</option>
                <option>Colombo</option>
                <option>Kandy</option>
                <option>Galle</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>

          <button className="w-full py-3 bg-brand-red text-white text-sm font-bold rounded-lg shadow-lg shadow-red-200 hover:bg-brand-red-dark compact-transition uppercase tracking-wide mt-2">
            Search Now
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

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

const PropertyCard = ({ property }) => (
  <motion.div 
    className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden flex flex-col compact-transition"
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
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow space-y-12 pb-16">
        <Hero />
        <CategoryStrip />

        {/* Listings Section */}
        <section className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Content (Main) */}
            <div className="flex-1 space-y-10">
              
              {/* Featured */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-lg font-bold text-dark-navy">Featured Properties</h2>
                  <a href="#" className="text-xs text-brand-green font-bold hover:underline">
                    View All &rarr;
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {FEATURED_PROPERTIES.map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </div>

              {/* Recent */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-lg font-bold text-dark-navy">Recent Listings</h2>
                  <a href="#" className="text-xs text-brand-green font-bold hover:underline">
                    Explore More &rarr;
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...FEATURED_PROPERTIES].reverse().map(p => (
                    <PropertyCard key={`rec-${p.id}`} property={p} />
                  ))}
                  {[...FEATURED_PROPERTIES].map(p => (
                    <PropertyCard key={`rec2-${p.id}`} property={p} />
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 compact-transition shadow-sm">
                    Load More Properties
                  </button>
                </div>
              </div>

            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-64 shrink-0">
              <Sidebar />
            </div>

          </div>
        </section>

        {/* Agents Area */}
        <section className="bg-gray-50 py-16 border-y border-gray-100">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl font-bold text-dark-navy">Real Estate Professionals</h2>
              <p className="text-gray-500 mt-2 text-xs font-medium">Connect with verified agents for expert property guidance</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {AGENTS.map((agent, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -3 }}
                  className="bg-white p-4 rounded-xl text-center shadow-sm border border-gray-100 group"
                >
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <img src={agent.img} alt={agent.name} className="w-full h-full rounded-full ring-2 ring-gray-50 group-hover:ring-brand-green compact-transition" />
                  </div>
                  <h4 className="font-bold text-dark-navy text-xs leading-tight">{agent.name}</h4>
                  <p className="text-[9px] text-gray-400 font-bold my-1 uppercase tracking-wider">{agent.role}</p>
                  <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button className="p-1.5 text-gray-400 hover:text-brand-green compact-transition"><Mail size={12} /></button>
                    <button className="p-1.5 text-gray-400 hover:text-brand-green compact-transition"><Phone size={12} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
