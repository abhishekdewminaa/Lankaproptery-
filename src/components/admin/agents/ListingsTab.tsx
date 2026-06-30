import React, { useState } from 'react';
import { Agent, AgentProperty, AgentLead } from './types';
import { Eye, ChevronDown, ChevronUp, Check, X, Star, Calendar, MessageSquare, Download, MapPin, Trash2, Edit, ExternalLink, Share2, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ListingsTabProps {
  agent: Agent;
  properties: AgentProperty[];
  leads: AgentLead[];
  onUpdateProperty: (updated: AgentProperty) => void;
  onDeleteProperty: (propertyId: string) => void;
  adminDarkMode: boolean;
}

export default function ListingsTab({
  agent,
  properties,
  leads,
  onUpdateProperty,
  onDeleteProperty,
  adminDarkMode
}: ListingsTabProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | 'active' | 'pending' | 'expired' | 'rejected'>('All');
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});
  
  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const agentProps = properties.filter((p) => p.agent_id === agent.id);
  const filteredProps = filterStatus === 'All'
    ? agentProps
    : agentProps.filter((p) => p.status === filterStatus);

  const toggleDesc = (id: string) => {
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApprove = (prop: AgentProperty) => {
    onUpdateProperty({ ...prop, status: 'active' });
    toast.success('Property approved and set live!');
  };

  const handleReject = (prop: AgentProperty) => {
    onUpdateProperty({ ...prop, status: 'rejected' });
    toast.error('Property status set to rejected.');
  };

  const handleToggleFeatured = (prop: AgentProperty) => {
    const nextFeatured = prop.package_tier === 'Elite Pro' ? 'Starter' : 'Elite Pro';
    onUpdateProperty({ ...prop, package_tier: nextFeatured });
    toast.success(nextFeatured === 'Elite Pro' ? 'Property featured!' : 'Property removed from features.');
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const downloadImage = (url: string) => {
    toast.success('Downloading high-res photo...');
    // Create high-res download simulation
    const a = document.createElement('a');
    a.href = url;
    a.download = `property_${agent.id}_photo.jpg`;
    document.body.appendChild(a);
    // Silent block simulation
  };

  const bgCard = adminDarkMode ? 'bg-[#1e1e2d] border-slate-800' : 'bg-white border-slate-100';
  const textPrimary = adminDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = adminDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className={`text-base font-bold ${textPrimary}`}>
            All properties listed by {agent.name}
          </h4>
          <p className="text-xs text-slate-400">
            {agentProps.length} total listings under management
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          {(['All', 'active', 'pending', 'expired', 'rejected'] as const).map((status) => {
            const count = status === 'All' ? agentProps.length : agentProps.filter((p) => p.status === status).length;
            const label = status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : status === 'expired' ? 'Expired' : status === 'rejected' ? 'Rejected' : 'All';
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`py-1.5 px-3 rounded-md transition-all ${
                  isActive
                    ? 'bg-[#004F31] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#004F31]'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredProps.length === 0 ? (
        <div className={`border rounded-xl p-12 text-center ${bgCard}`}>
          <div className="text-4xl mb-3 select-none">🏠</div>
          <p className={`text-sm font-semibold ${textPrimary}`}>This agent has not listed any properties yet.</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">You can manually link properties or add on behalf of them.</p>
          <button
            onClick={() => toast.success('Add property modal simulation')}
            className="py-2 px-4 bg-[#004F31] hover:bg-[#003B24] text-white font-bold rounded-lg text-xs transition-colors shadow-md"
          >
            + Add a Property for This Agent
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProps.map((prop) => {
            const propLeads = leads.filter((l) => l.property_id === prop.id);
            const isDescExpanded = expandedDesc[prop.id] || false;
            return (
              <div key={prop.id} className={`border rounded-xl p-6 ${bgCard} shadow-sm space-y-6`}>
                <div className="flex flex-col xl:flex-row gap-6">
                  {/* Left Column - Cover Image & Thumbnails */}
                  <div className="xl:w-1/3 space-y-3">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700/20 group cursor-pointer" onClick={() => openLightbox(prop.images.length > 0 ? prop.images : [prop.cover_image], 0)}>
                      <img
                        src={prop.cover_image}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className={`absolute top-2 left-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow ${
                        prop.status === 'active' ? 'bg-green-600 text-white' : prop.status === 'pending' ? 'bg-orange-500 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {prop.status}
                      </span>
                      {prop.package_tier === 'Elite Pro' && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold tracking-widest px-2 py-0.5 rounded shadow flex items-center gap-0.5 animate-pulse">
                          ⭐ FEATURED
                        </span>
                      )}
                    </div>

                    {/* Responsive Thumbnails */}
                    {prop.images && prop.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {prop.images.slice(0, 4).map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => openLightbox(prop.images, idx)}
                            className="aspect-[4/3] rounded-md overflow-hidden border border-slate-700/10 hover:border-[#004F31] cursor-pointer relative"
                          >
                            <img src={img} alt="Property thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            {idx === 3 && prop.images.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                                +{prop.images.length - 4}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column - Listing Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className={`text-lg font-bold leading-snug ${textPrimary}`}>{prop.title}</h3>
                        <p className={`text-xs font-semibold flex items-center gap-1 ${textSecondary}`}>
                          <MapPin size={12} className="text-[#004F31]" />
                          {prop.address || `${prop.city}, ${prop.district}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-[#004F31] dark:text-[#4ade80]">
                          {prop.price === 0 ? 'Contact for Price' : `Rs. ${prop.price.toLocaleString('en-LK')}`}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">
                          {prop.category} • FOR {prop.listing_type.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Property Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg text-xs">
                      <div>
                        <span className={textSecondary}>Bedrooms:</span>
                        <p className={`font-bold ${textPrimary} mt-0.5`}>{prop.bedrooms > 0 ? `${prop.bedrooms} Beds` : '—'}</p>
                      </div>
                      <div>
                        <span className={textSecondary}>Bathrooms:</span>
                        <p className={`font-bold ${textPrimary} mt-0.5`}>{prop.bathrooms > 0 ? `${prop.bathrooms} Baths` : '—'}</p>
                      </div>
                      <div>
                        <span className={textSecondary}>Land Size:</span>
                        <p className={`font-bold ${textPrimary} mt-0.5`}>{prop.land_area || '—'}</p>
                      </div>
                      <div>
                        <span className={textSecondary}>Floor Area:</span>
                        <p className={`font-bold ${textPrimary} mt-0.5`}>{prop.floor_area || '—'}</p>
                      </div>
                    </div>

                    {/* Client details */}
                    {(prop.client_name || prop.client_phone) && (
                      <div className="text-xs border-t border-slate-700/10 pt-3 flex flex-wrap gap-4">
                        {prop.client_name && (
                          <p>
                            <span className={textSecondary}>Owner / Client: </span>
                            <span className={`font-bold ${textPrimary}`}>{prop.client_name}</span>
                          </p>
                        )}
                        {prop.client_phone && (
                          <p>
                            <span className={textSecondary}>Phone: </span>
                            <span className={`font-bold text-[#004F31] dark:text-[#4ade80]`}>{prop.client_phone}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Performance Metrics */}
                    <div className="border-t border-slate-700/10 pt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                        <span className="text-base">👁️</span> {prop.views} Views
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                        <span className="text-base">📩</span> {prop.leads} Leads
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                        <span className="text-base">❤️</span> {prop.saved} Saved
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                        <span className="text-base">📤</span> {prop.shares} Shares
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description Collapse */}
                <div className="text-xs pt-3 border-t border-slate-700/10 space-y-2">
                  <h4 className={`font-bold uppercase tracking-wider ${textSecondary}`}>Description</h4>
                  <p className={`leading-relaxed ${textPrimary}`}>
                    {isDescExpanded
                      ? prop.description
                      : prop.description.length > 300
                      ? `${prop.description.slice(0, 300)}...`
                      : prop.description}
                  </p>
                  {prop.description.length > 300 && (
                    <button
                      onClick={() => toggleDesc(prop.id)}
                      className="text-emerald-600 font-bold flex items-center gap-0.5 mt-1 hover:underline focus:outline-none"
                    >
                      {isDescExpanded ? 'Show Less' : 'Show More'}
                      {isDescExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>

                {/* Amenities */}
                {prop.amenities && prop.amenities.length > 0 && (
                  <div className="text-xs pt-3 border-t border-slate-700/10 space-y-2">
                    <h4 className={`font-bold uppercase tracking-wider ${textSecondary}`}>Amenities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {prop.amenities.map((am) => (
                        <span
                          key={am}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-700/10"
                        >
                          ✓ {am}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map Layout */}
                <div className="text-xs pt-3 border-t border-slate-700/10 space-y-2">
                  <h4 className={`font-bold uppercase tracking-wider ${textSecondary}`}>Location Map</h4>
                  <div className="h-44 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-700/10 overflow-hidden relative flex flex-col items-center justify-center p-4">
                    <div className="absolute top-2 left-2 bg-black/60 text-white font-semibold text-[10px] py-0.5 px-2 rounded">
                      Google Maps API Grounded
                    </div>
                    <div className="text-emerald-600 text-3xl animate-bounce mb-1">📍</div>
                    <p className={`font-semibold text-center max-w-md ${textPrimary}`}>{prop.address || `${prop.city}, ${prop.district}`}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Latitude: {prop.lat} • Longitude: {prop.lng}</p>
                  </div>
                </div>

                {/* Leads for this Property */}
                <div className="text-xs pt-4 border-t border-slate-700/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-bold uppercase tracking-wider ${textPrimary}`}>
                      Leads for this Property ({propLeads.length})
                    </h4>
                    {propLeads.length > 0 && (
                      <button
                        onClick={() => toast.success('Lead overview modal')}
                        className="text-emerald-600 hover:underline font-bold"
                      >
                        View All Leads for this Property →
                      </button>
                    )}
                  </div>

                  {propLeads.length === 0 ? (
                    <p className="text-slate-500 italic">No buyer leads received yet for this listing.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {propLeads.map((ld) => (
                        <div key={ld.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/35 border border-slate-700/5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-bold ${textPrimary}`}>{ld.name} ({ld.phone})</span>
                            <span className="text-slate-400">{new Date(ld.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 leading-normal italic">
                            "{ld.message}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="border-t border-slate-700/10 pt-4 flex flex-wrap gap-2 justify-end">
                  {prop.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(prop)}
                      className="py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-xs transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {prop.status !== 'rejected' && (
                    <button
                      onClick={() => handleReject(prop)}
                      className="py-1.5 px-3 bg-red-600/15 border border-red-600/20 text-red-600 hover:bg-red-600/20 font-bold rounded text-xs transition-colors flex items-center gap-1"
                    >
                      <X size={14} /> Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleFeatured(prop)}
                    className="py-1.5 px-3 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-500 font-bold rounded text-xs transition-colors flex items-center gap-1"
                  >
                    <Star size={14} /> {prop.package_tier === 'Elite Pro' ? 'Remove Feature' : 'Feature Listing'}
                  </button>
                  <button
                    onClick={() => toast.success('Property edit form opened')}
                    className="py-1.5 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded text-xs transition-colors flex items-center gap-1"
                  >
                    <Edit size={14} /> Edit Listing
                  </button>
                  <button
                    onClick={() => toast.success('Opening on Live Site...')}
                    className="py-1.5 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded text-xs transition-colors flex items-center gap-1"
                  >
                    <ExternalLink size={14} /> View on Site
                  </button>
                  <button
                    onClick={() => toast.success('Copied shareable link to clipboard!')}
                    className="py-1.5 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded text-xs transition-colors flex items-center gap-1"
                  >
                    <Share2 size={14} /> Share
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this property listing?')) {
                        onDeleteProperty(prop.id);
                      }
                    }}
                    className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Backdrop */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[99999] flex flex-col justify-between p-6">
          <div className="flex justify-between items-center text-white">
            <span className="text-xs font-bold font-mono">
              PHOTO {lightboxIndex + 1} OF {lightboxImages.length}
            </span>
            <div className="flex gap-4">
              <button
                onClick={() => downloadImage(lightboxImages[lightboxIndex])}
                className="hover:text-[#4ade80] transition-colors flex items-center gap-1 text-xs font-bold uppercase"
              >
                <Download size={16} /> Download
              </button>
              <button
                onClick={() => setLightboxOpen(false)}
                className="text-white hover:text-red-400 font-bold transition-colors text-sm"
              >
                ✕ CLOSE
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between flex-1">
            <button
              onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1))}
              className="text-white bg-white/10 p-4 rounded-full hover:bg-white/20 text-xl font-bold transition-all focus:outline-none"
            >
              ◀
            </button>

            <img
              src={lightboxImages[lightboxIndex]}
              alt="Lightbox display"
              className="max-h-[75vh] max-w-[80vw] object-contain rounded-lg border border-white/10 shadow-2xl"
              referrerPolicy="no-referrer"
            />

            <button
              onClick={() => setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0))}
              className="text-white bg-white/10 p-4 rounded-full hover:bg-white/20 text-xl font-bold transition-all focus:outline-none"
            >
              ▶
            </button>
          </div>

          <div className="text-center text-slate-400 text-xs">
            Use Left/Right buttons or keyboard shortcuts to navigate.
          </div>
        </div>
      )}
    </div>
  );
}
