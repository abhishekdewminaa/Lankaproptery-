import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, MapPin, Star, ArrowLeft, Linkedin, Facebook, Instagram, ShieldCheck, Heart, Grid, List, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Format Price helper
const formatPriceLKR = (price: number) => {
  if (price >= 10000000) {
    return `Rs. ${(price / 10000000).toFixed(1)} Crore`;
  } else if (price >= 100000) {
    return `Rs. ${(price / 100000).toFixed(1)} Lakhs`;
  }
  return `Rs. ${price.toLocaleString()}`;
};

interface AgentPageProps {
  properties: any[];
  onPropertyClick: (property: any) => void;
  onBack: () => void;
  favorites: Set<number>;
  toggleFavorite: (id: number) => void;
  onNavigate?: (view: { type: string; data?: any }) => void;
  initialAgentName?: string | null;
}

interface AgentReview {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface Agent {
  id: string;
  name: string;
  fullName: string;
  role: string;
  experience: string;
  image: string;
  phone: string;
  email: string;
  bio: string;
  reviews: AgentReview[];
}

const AGENTS: Agent[] = [
  {
    id: 'lalith',
    name: 'Lion Lalith Ranatunga MAF',
    fullName: 'Lion Lalith Ranatunga MAF',
    role: 'EXECUTIVE DIRECTOR | REAL ESTATE AGENT | VISA CONSULTANT',
    experience: '15+ Years',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    phone: '+94 77 395 1560',
    email: 'lalith@lankaproperty.lk',
    bio: 'Lalith is a seasoned real estate professional with over 15 years of experience in the Sri Lankan market. As Executive Director of LankaProperty.lk, he leads the strategic direction of our agency while offering specialized expertise in real estate investment and visa consultancy.',
    reviews: [
      {
        id: 1,
        author: 'Rohan S.',
        rating: 5,
        text: 'Lalith provided exceptional service. Very professional and knowledgeable.',
        date: '2 months ago'
      },
      {
        id: 2,
        author: 'Anusha K.',
        rating: 5,
        text: 'Highly recommend working with Lalith. He made the buying process so easy.',
        date: '5 months ago'
      }
    ]
  },
  {
    id: 'chamath',
    name: 'Chamath Wickramasooriya',
    fullName: 'Chamath Wickramasooriya',
    role: 'SALES LEAD',
    experience: '8 Years',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '+94 77 123 4567',
    email: 'chamath@lankaproperty.lk',
    bio: 'Chamath is an enthusiastic sales leader with 8 years of solid background in high-value beachfront villas and holiday bungalows. Known for his friendly nature and exceptional negotiation skills, Chamath ensures buyers get the perfect slice of paradise.',
    reviews: [
      {
        id: 1,
        author: 'John D.',
        rating: 5,
        text: 'Chamath helped us purchase our vacation home in Galle. Very communicative and reliable.',
        date: '1 month ago'
      }
    ]
  },
  {
    id: 'barnad',
    name: 'Barnad Fernando',
    fullName: 'Barnad Fernando',
    role: 'CONSULTANT',
    experience: '12 Years',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '+94 77 987 6543',
    email: 'barnad@lankaproperty.lk',
    bio: 'Barnad specializes in commercial leases, boutique hotels, and industrial warehouses across the western province. With 12 years of hands-on advisory experience, he assists local and overseas corporate clients in securing prime investment hubs.',
    reviews: [
      {
        id: 1,
        author: 'Supun P.',
        rating: 5,
        text: 'Outstanding advisory for our warehouse purchase. Prompt and factual response.',
        date: '3 weeks ago'
      }
    ]
  },
  {
    id: 'deshani',
    name: 'Deshani Kaushalya',
    fullName: 'Deshani Kaushalya',
    role: 'AGENT',
    experience: '4 Years',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '+94 71 555 1234',
    email: 'deshani@lankaproperty.lk',
    bio: 'Deshani is an up-and-coming real estate consultant focusing on residential apartments and luxury penthouses in Colombo. Her dedication to client requirements and meticulous attention to detail makes home search a completely seamless experience.',
    reviews: [
      {
        id: 1,
        author: 'Melissa F.',
        rating: 5,
        text: 'Deshani was extremely patient showing us multiple Colombo apartments until we found the perfect fit.',
        date: '2 months ago'
      }
    ]
  }
];

export const AgentPage: React.FC<AgentPageProps> = ({
  properties,
  onPropertyClick,
  onBack,
  favorites,
  toggleFavorite,
  onNavigate,
  initialAgentName
}) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Set selected agent based on initialAgentName prop
  React.useEffect(() => {
    if (initialAgentName) {
      const nameLower = initialAgentName.toLowerCase();
      const found = AGENTS.find(a => 
        a.name.toLowerCase().includes(nameLower) || nameLower.includes(a.name.toLowerCase())
      );
      if (found) {
        setSelectedAgent(found);
      }
    } else {
      setSelectedAgent(null);
    }
  }, [initialAgentName]);

  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter listings managed by this agent
  const agentProperties = useMemo(() => {
    if (!selectedAgent) return [];
    // Match either exact name or starts with name
    const agentClean = selectedAgent.name.toLowerCase().trim();
    return properties.filter(p => {
      if (!p.agentName) return false;
      const propAgentClean = p.agentName.toLowerCase().trim();
      return propAgentClean.includes(agentClean) || agentClean.includes(propAgentClean);
    });
  }, [selectedAgent, properties]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryMessage) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success(`Inquiry sent to ${selectedAgent?.name}! They will contact you shortly.`);
      setIsSubmitting(false);
      setShowInquiryModal(false);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryMessage('');
    }, 1000);
  };

  const handleApplyAgent = () => {
    toast.success('Thank you for your interest! Our Agent Onboarding Team will reach out to you within 24 hours with the application pack.');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {!selectedAgent ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  Our Professional <span className="text-brand-green text-[#004f31]">Agents</span>
                </h1>
                <p className="text-neutral-600 text-sm sm:text-base font-medium leading-relaxed">
                  Connect with the island's most trusted real estate experts. Our agents are verified, dedicated, and committed to excellence.
                </p>
                <div className="w-20 h-1 bg-[#004f31] mx-auto rounded-full mt-2" />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {AGENTS.map((agent) => {
                  const count = properties.filter(p => {
                    if (!p.agentName) return false;
                    const pName = p.agentName.toLowerCase();
                    const aName = agent.name.toLowerCase();
                    return pName.includes(aName) || aName.includes(pName);
                  }).length;

                  return (
                    <motion.div
                      key={agent.id}
                      whileHover={{ y: -6 }}
                      onClick={() => setSelectedAgent(agent)}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-100 transition-all cursor-pointer flex flex-col h-full"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-200">
                        <img
                          src={agent.image}
                          referrerPolicy="no-referrer"
                          alt={agent.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#004f31] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                          <ShieldCheck size={12} className="text-[#004f31]" />
                          <span>VERIFIED AGENT</span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow text-center items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="font-black text-slate-800 text-lg leading-tight hover:text-[#004f31] transition-colors">
                            {agent.name}
                          </h3>
                          <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                            {agent.role.split('|')[0].trim()}
                          </p>
                        </div>

                        <div className="flex gap-4 items-center justify-center mt-6 w-full pt-4 border-t border-neutral-100">
                          <div className="text-center">
                            <p className="text-slate-800 font-extrabold text-xs">{agent.experience}</p>
                            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Experience</p>
                          </div>
                          <div className="w-[1px] h-8 bg-neutral-100" />
                          <div className="text-center">
                            <p className="text-slate-800 font-extrabold text-xs">{count} Listings</p>
                            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Active</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Call to Action Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-[#001c11] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 mt-16 border border-emerald-950/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_45%)]" />
                <div className="space-y-4 max-w-2xl text-center md:text-left relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Are you a Real Estate Professional?
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Join Sri Lanka's fastest growing premium property ecosystem. List your inventory, access fully verified leads, utilize live visitors metrics, and close deals in record time.
                  </p>
                </div>
                <button
                  onClick={handleApplyAgent}
                  className="bg-[#004f31] hover:bg-[#003822] text-white text-xs sm:text-sm font-black px-8 py-4 rounded-2xl shadow-lg hover:shadow-emerald-900/15 transition-all transform hover:-translate-y-0.5 shrink-0 z-10 w-full md:w-auto"
                >
                  Apply to Join as an Agent
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              {/* Back Button */}
              <button
                onClick={() => setSelectedAgent(null)}
                className="flex items-center gap-2 text-slate-600 hover:text-[#004f31] font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Back to Agents</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column (Profile, Stats, Reviews) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Profile Card */}
                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm space-y-6 text-center">
                    <div className="relative w-44 h-44 mx-auto rounded-3xl overflow-hidden shadow-md bg-slate-100 border border-neutral-100">
                      <img
                        src={selectedAgent.image}
                        referrerPolicy="no-referrer"
                        alt={selectedAgent.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="bg-emerald-50 text-[#004f31] inline-flex items-center gap-1 text-[9px] font-black px-3 py-1 rounded-full border border-emerald-100">
                        <ShieldCheck size={11} />
                        <span>VERIFIED REAL ESTATE AGENT</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                        {selectedAgent.name}
                      </h2>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-4 leading-relaxed">
                        {selectedAgent.role}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-50/70 p-4 rounded-2xl border border-neutral-100/50">
                        <p className="text-lg font-black text-[#004f31]">{selectedAgent.experience}</p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1">EXPERIENCE</p>
                      </div>
                      <div className="bg-slate-50/70 p-4 rounded-2xl border border-neutral-100/50">
                        <p className="text-lg font-black text-[#004f31]">{agentProperties.length}</p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1">LISTED PROPERTIES</p>
                      </div>
                    </div>

                    {/* Quick Contacts */}
                    <div className="space-y-3 pt-2">
                      <a
                        href={`tel:${selectedAgent.phone}`}
                        className="w-full bg-[#004f31] hover:bg-[#003822] text-white text-xs font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all"
                      >
                        <Phone size={14} />
                        <span>{selectedAgent.phone}</span>
                      </a>
                      <button
                        onClick={() => setShowInquiryModal(true)}
                        className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-neutral-200 text-xs font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <Mail size={14} className="text-slate-500" />
                        <span>Email Agent</span>
                      </button>
                    </div>

                    {/* Social links */}
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-neutral-100 text-slate-400">
                      <a href="#" className="hover:text-[#004f31] transition-colors"><Linkedin size={18} /></a>
                      <a href="#" className="hover:text-[#004f31] transition-colors"><Facebook size={18} /></a>
                      <a href="#" className="hover:text-[#004f31] transition-colors"><Instagram size={18} /></a>
                    </div>
                  </div>

                  {/* Reviews Block */}
                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm space-y-6">
                    <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                      AGENT REVIEWS
                    </h3>
                    
                    <div className="space-y-6 divide-y divide-neutral-100">
                      {selectedAgent.reviews.map((review, idx) => (
                        <div key={review.id} className={`space-y-2 ${idx > 0 ? 'pt-6' : ''}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-slate-800 text-sm">{review.author}</span>
                            <div className="flex gap-0.5 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill="currentColor" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed italic font-medium">
                            "{review.text}"
                          </p>
                          <span className="text-[10px] text-neutral-400 block font-bold uppercase tracking-wider">{review.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column (About, Active Listings) */}
                <div className="lg:col-span-8 space-y-8">
                  {/* About Block */}
                  <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm space-y-4">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                      About MAF
                    </h2>
                    <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed font-medium">
                      {selectedAgent.bio}
                    </p>
                  </div>

                  {/* Active Listings Header */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-800">Active Listings</h3>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">
                          PROPERTIES MANAGED BY {selectedAgent.name.split(' ')[0]}
                        </p>
                      </div>
                      <span className="bg-[#004f31]/10 text-[#004f31] text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-emerald-800/10 shadow-sm shrink-0">
                        {agentProperties.length} Properties found
                      </span>
                    </div>

                    {/* Agent Listings Grid */}
                    {agentProperties.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center text-neutral-400 space-y-2">
                        <p className="text-sm font-semibold">No active listings found for this agent.</p>
                        <p className="text-xs">This agent is currently onboarding new properties. Check back soon!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {agentProperties.map((p) => (
                          <div
                            key={p.id}
                            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-100 transition-all flex flex-col h-full group"
                          >
                            {/* Image Header */}
                            <div className="relative aspect-[16/10] w-full bg-slate-200 overflow-hidden">
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                                FOR {p.type.toUpperCase()}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(p.id);
                                }}
                                className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                                  favorites.has(p.id)
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/80 hover:bg-white text-slate-700'
                                }`}
                              >
                                <Heart size={15} fill={favorites.has(p.id) ? 'currentColor' : 'none'} />
                              </button>
                              
                              <div className="absolute bottom-4 left-4 bg-[#004f31] text-white text-[9px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                                🔥 <span>Trending</span>
                              </div>
                            </div>

                            {/* Performance statistics inside card */}
                            <div className="grid grid-cols-3 bg-slate-50/50 border-b border-neutral-100/50 text-[10px] font-bold text-neutral-500 py-3.5 px-6">
                              <div>
                                <span className="block text-slate-400 text-[8px] uppercase font-black">Views</span>
                                <span className="text-slate-800 font-extrabold text-xs">{p.views || 450}</span>
                              </div>
                              <div className="border-l border-neutral-100 px-4">
                                <span className="block text-slate-400 text-[8px] uppercase font-black">Leads</span>
                                <span className="text-slate-800 font-extrabold text-xs">0</span>
                              </div>
                              <div className="border-l border-neutral-100 px-4">
                                <span className="block text-slate-400 text-[8px] uppercase font-black">Conv</span>
                                <span className="text-slate-800 font-extrabold text-xs">0.0%</span>
                              </div>
                            </div>

                            {/* Card Details */}
                            <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-semibold">
                                  <MapPin size={11} className="text-[#004f31]" />
                                  <span className="uppercase tracking-wider">{p.district}</span>
                                </div>
                                <h4
                                  onClick={() => onPropertyClick(p)}
                                  className="font-black text-slate-800 text-base leading-snug hover:text-[#004f31] cursor-pointer transition-colors line-clamp-1"
                                >
                                  {p.title}
                                </h4>
                                <div className="space-y-0.5">
                                  <p className="text-lg font-black text-[#004f31] tracking-tight">{formatPriceLKR(p.priceLkr)}</p>
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                    Approx. ${(p.priceLkr / 300).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                                  </p>
                                </div>
                              </div>

                              {/* Amenities Row */}
                              <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-wider pt-4 border-t border-neutral-100">
                                {p.bedrooms && (
                                  <span>{p.bedrooms} Beds</span>
                                )}
                                {p.bathrooms && (
                                  <span>{p.bathrooms} Baths</span>
                                )}
                                <span>{p.size}</span>
                              </div>

                              {/* Actions */}
                              <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                  onClick={() => onPropertyClick(p)}
                                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-neutral-200/50"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAgent(selectedAgent);
                                    setShowInquiryModal(true);
                                  }}
                                  className="w-full py-3 bg-[#004f31] hover:bg-[#003822] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                                >
                                  Inquire
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {showInquiryModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInquiryModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2rem] shadow-2xl relative z-10 max-w-lg w-full p-8 overflow-hidden border border-neutral-100"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                    Inquire with {selectedAgent?.name.split(' ')[0]}
                  </h3>
                  <p className="text-neutral-500 text-xs mt-1">
                    Send a direct message to this professional agent. You will receive a response via email or telephone.
                  </p>
                </div>

                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#004f31] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#004f31] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="+94 XX XXX XXXX"
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#004f31] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Hi, I am interested in property listings managed by you..."
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#004f31] transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInquiryModal(false)}
                      className="w-1/2 py-4 border border-neutral-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider rounded-2xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-1/2 py-4 bg-[#004f31] hover:bg-[#003822] text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <Send size={13} className="text-white" />
                          <span>Send Inquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentPage;
