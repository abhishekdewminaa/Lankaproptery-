import React, { useState } from 'react';
import { Bed, Bath, ArrowRight } from 'lucide-react';

const getPropertyImage = (prop: any) => {
  if (prop.image) return prop.image;
  if (prop.images) {
    if (Array.isArray(prop.images)) return prop.images[0] || '/placeholder-property.jpg';
    if (typeof prop.images === 'string') {
      try {
        const parsed = JSON.parse(prop.images);
        if (Array.isArray(parsed)) return parsed[0] || '/placeholder-property.jpg';
        return prop.images;
      } catch {
        return prop.images;
      }
    }
  }
  return '/placeholder-property.jpg';
};

const formatPrice = (prop: any) => {
  const p = prop.priceLkr || prop.price_lkr || prop.price;
  if (!p) return 'Price on Request';
  if (typeof p === 'number') {
    return p.toLocaleString();
  }
  let str = String(p).replace(/Rs\.\s*/i, '').trim();
  return str;
};

interface ListingProps {
  id: number;
  listing_title: string;
  price_lkr: string;
  city: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  size: string;
  listing_type: 'sale' | 'rent';
}

const LISTINGS: ListingProps[] = [
  {
    id: 101,
    listing_title: 'Modern Family House in Malabe',
    price_lkr: 'Rs. 42,000,000',
    city: 'Malabe',
    images: ['https://images.unsplash.com/photo-1580587771525-78b9bed1b427?auto=format&fit=crop&q=80&w=800'],
    bedrooms: 4,
    bathrooms: 3,
    size: '2,400 sqft',
    listing_type: 'sale'
  },
  {
    id: 102,
    listing_title: 'Luxury Apartment, Havelock City',
    price_lkr: 'Rs. 150,000 / mo',
    city: 'Colombo 05',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800'],
    bedrooms: 3,
    bathrooms: 2,
    size: '1,200 sqft',
    listing_type: 'rent'
  }
];

interface RecentListingsProps {
  onNavigate: (view: any) => void;
  properties?: any[];
}

export const RecentListings: React.FC<RecentListingsProps> = ({ onNavigate, properties = [] }) => {
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const toggleSave = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSavedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Sort properties by creation date (newest first)
  const sortedProperties = [...properties].sort((a, b) => {
    const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
    const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  
  const displayProperties = sortedProperties.length > 0 ? sortedProperties.slice(0, 4) : LISTINGS;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Recent Listings Column */}
          <div className="flex-grow lg:w-2/3">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 uppercase pl-4 border-l-4 border-[var(--lp-green)]">
                Recent Listings
              </h2>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); onNavigate({ type: 'all_properties' }); }} 
                className="flex items-center gap-2 text-brand-green font-bold text-sm hover:underline uppercase tracking-widest"
              >
                View All <ArrowRight size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayProperties.map((prop, idx) => {
                const priceFormatted = formatPrice(prop);
                const imageSrc = getPropertyImage(prop);
                const offerType = prop.type === 'Rent' || prop.listing_type === 'For Rent' || prop.listing_type === 'rent' ? 'RENT' : 'SELL';
                const locationCity = prop.city || prop.location || 'Sri Lanka';
                const locationDistrict = prop.district || prop.location || '';
                const displayLocation = locationDistrict ? `${locationCity}, ${locationDistrict}` : locationCity;

                return (
                  <div
                    key={prop.id || idx}
                    onClick={() => onNavigate({ type: 'detail', data: prop })}
                    className="property-card-modern block bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden no-underline transition-all duration-300 relative cursor-pointer"
                    style={{
                      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  >
                    {/* ═══ IMAGE SECTION ═══ */}
                    <div style={{
                      position: 'relative',
                      height: '220px',
                      overflow: 'hidden',
                      background: '#F3F4F6'
                    }}>
                      <img
                        src={imageSrc}
                        alt={prop.title || prop.listing_title}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                        }}
                        referrerPolicy="no-referrer"
                      />

                      {/* Dark gradient overlay at bottom */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        height: '80px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
                        pointerEvents: 'none'
                      }}></div>

                      {/* TOP LEFT: Status badges row */}
                      <div style={{
                        position: 'absolute',
                        top: '12px', left: '12px',
                        display: 'flex',
                        gap: '6px',
                        zIndex: 2
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          background: 'rgba(255,255,255,0.92)',
                          backdropFilter: 'blur(6px)',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#374151',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          <span style={{
                            width: '6px', height: '6px',
                            background: '#22C55E',
                            borderRadius: '50%'
                          }}></span>
                          Just Updated
                        </span>
                      </div>

                      {/* TOP RIGHT: Sale/Rent badge */}
                      <div style={{
                        position: 'absolute',
                        top: '12px', right: '12px',
                        zIndex: 2
                      }}>
                        <span style={{
                          padding: '5px 12px',
                          background: offerType === 'RENT' ? '#1565C0' : '#C62828',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px'
                        }}>
                          {offerType}
                        </span>
                      </div>

                      {/* BOTTOM LEFT: Price overlay on image */}
                      <div style={{
                        position: 'absolute',
                        bottom: '12px', left: '12px',
                        zIndex: 2
                      }}>
                        <span style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          color: '#ffffff',
                          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                          lineHeight: 1
                        }}>
                          Rs. {priceFormatted}
                        </span>
                      </div>

                      {/* BOTTOM RIGHT: Heart/Save icon */}
                      <button 
                        onClick={(e) => toggleSave(prop.id || idx, e)}
                        className={savedIds[prop.id || idx] ? 'saved' : ''}
                        style={{
                          position: 'absolute',
                          bottom: '12px', right: '12px',
                          zIndex: 2,
                          width: '34px', height: '34px',
                          background: savedIds[prop.id || idx] ? '#C62828' : 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(4px)',
                          border: 'none',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '16px',
                          color: savedIds[prop.id || idx] ? 'white' : 'inherit'
                        }}
                      >
                        {savedIds[prop.id || idx] ? '♥' : '♡'}
                      </button>
                    </div>

                    {/* ═══ CONTENT SECTION ═══ */}
                    <div style={{ padding: '16px 16px 14px' }}>
                      {/* Title (2 line max) */}
                      <h3 style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#111827',
                        margin: '0 0 8px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {prop.title || prop.listing_title}
                      </h3>

                      {/* Location */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginBottom: '14px'
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6B7280'
                        }}>
                          {displayLocation}
                        </span>
                      </div>

                      {/* Divider */}
                      <div style={{
                        height: '1px',
                        background: '#F3F4F6',
                        marginBottom: '12px'
                      }}></div>

                      {/* Specs row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        {/* Bedrooms */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                            <path d="M3 7v11m0-4h18m0 4V11a2 2 0 00-2-2H5a2 2 0 00-2 2m2-4V5a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                            {prop.bedrooms || 0}
                          </span>
                        </div>

                        {/* Bathrooms */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                            <path d="M4 12h16M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6M6 12V6a2 2 0 012-2h1"/>
                          </svg>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                            {prop.bathrooms || 0}
                          </span>
                        </div>

                        {/* Size / Area */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                          </svg>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                            {prop.size || prop.land_area || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* View Details link */}
                      <div style={{
                        marginTop: '14px',
                        paddingTop: '12px',
                        borderTop: '1px solid #F3F4F6'
                      }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1B5E20',
                          transition: 'gap 0.2s'
                        }}>
                          View Details
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mortgage Calculator Column */}
          <div className="lg:w-1/3">
            <div className="mortgage-calculator bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Mortgage Calculator</h2>
              
              <div className="space-y-6 flex-grow">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Property Price (Rs.)</label>
                  <input type="text" defaultValue="15000000" className="w-full bg-white border border-gray-200 focus:border-[var(--lp-green)] rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Down Payment (%)</label>
                  <input type="text" defaultValue="20" className="w-full bg-white border border-gray-200 focus:border-[var(--lp-green)] rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Interest Rate (%)</label>
                  <input type="text" defaultValue="14.5" className="w-full bg-white border border-gray-200 focus:border-[var(--lp-green)] rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none transition-colors" />
                </div>

                <div className="pt-6 border-t border-gray-50 mt-4">
                  <div className="text-xs font-bold text-gray-400 mb-1">Estimated Monthly Payment:</div>
                  <div className="mortgage-result-value text-3xl font-black text-[var(--lp-green)]">
                    Rs. 142,450
                  </div>
                </div>
              </div>

              <button className="get-bank-btn w-full py-4 bg-[var(--lp-green)] hover:bg-[var(--lp-green-dark)] text-white font-bold rounded-xl mt-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Get Bank Offers
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
