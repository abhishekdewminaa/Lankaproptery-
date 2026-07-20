import React, { useState } from 'react';

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

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ properties = [], onNavigate }) => {
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const toggleSave = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSavedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Hardcoded premium properties matching the requested UI layout screenshot
  const fallbackFeaturedProperties: Property[] = [
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

  // Dynamic fallback logic: Use custom added/modified properties if available, limited to 8
  const displayProperties = (properties && properties.length > 0 ? properties : fallbackFeaturedProperties).slice(0, 8);

  return (
    <section className="py-12 bg-white" id="featured-properties">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Redesigned Section Header */}
        <div className="section-header-row flex justify-between items-end mb-8 px-1">
          <div>
            {/* Live pulse badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-full mb-3.5">
              <span className="w-2 h-2 bg-[#F59E0B] rounded-full inline-block"></span>
              <span className="text-[11px] font-bold text-[#92400E] uppercase tracking-wider">
                Featured Selection
              </span>
            </div>

            <h2 className="text-[28px] font-extrabold text-gray-900 m-0 mb-1.5 leading-tight">
              Featured Properties
            </h2>

            <p className="text-sm font-normal text-[#6B7280] m-0">
              Hand-picked premium listings for you.
            </p>
          </div>

          <button
            onClick={() => onNavigate({ type: 'all_properties' })}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#111827] hover:bg-black text-white rounded-xl text-[13px] font-bold no-underline whitespace-nowrap transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95"
          >
            Explore All Listings
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* 4-Card Responsive Grid */}
        {displayProperties.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400 font-semibold border border-dashed border-gray-200 rounded-2xl">
            No properties found matching this criteria.
          </div>
        ) : (
          <div className="property-cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                      alt={prop.title}
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
                        {prop.tag || 'Featured'}
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
                      {prop.title}
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
        )}
      </div>
    </section>
  );
};
