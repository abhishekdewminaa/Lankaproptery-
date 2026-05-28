import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface LatestAdvertisementsProps {
  category?: string | null;
  limit?: number;
  onPropertyClick?: (property: any) => void;
  onNavigate?: (view: any) => void;
}

const LatestAdvertisements: React.FC<LatestAdvertisementsProps> = ({ 
  category = null,
  limit = 10,
  onPropertyClick,
  onNavigate
}) => {
  const [period, setPeriod] = useState('today');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '3days', label: 'Last 3 Days' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '14days', label: 'Last 14 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: 'thisyear', label: 'This Year' },
    { value: 'alltime', label: 'All Time' },
  ];

  const getPeriodDate = (periodStr: string) => {
    const now = new Date();
    switch(periodStr) {
      case 'today': {
        const today = new Date();
        today.setHours(0,0,0,0);
        return today.toISOString();
      }
      case 'yesterday': {
        const yest = new Date();
        yest.setDate(yest.getDate() - 1);
        yest.setHours(0,0,0,0);
        return yest.toISOString();
      }
      case '3days':
        return new Date(now.getTime() - 3*24*60*60*1000).toISOString();
      case '7days':
        return new Date(now.getTime() - 7*24*60*60*1000).toISOString();
      case '14days':
        return new Date(now.getTime() - 14*24*60*60*1000).toISOString();
      case '30days':
        return new Date(now.getTime() - 30*24*60*60*1000).toISOString();
      case '3months':
        return new Date(now.getTime() - 90*24*60*60*1000).toISOString();
      case '6months':
        return new Date(now.getTime() - 180*24*60*60*1000).toISOString();
      case 'thisyear':
        return new Date(now.getFullYear(), 0, 1).toISOString();
      case 'alltime':
        return new Date('2020-01-01').toISOString();
      default:
        return new Date(now.getTime() - 7*24*60*60*1000).toISOString();
    }
  };

  const fetchLatest = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('properties')
        .select(`
          id,
          listing_title,
          listing_type,
          property_category,
          district,
          city,
          price_lkr,
          usd_estimate,
          images,
          rooms,
          bathrooms,
          land_area,
          is_negotiable,
          created_at
        `)
        .eq('status', 'active')
        .gte('created_at', getPeriodDate(period))
        .order('created_at', { 
          ascending: false 
        })
        .limit(limit);

      // Filter by category if on category page
      if (category) {
        query = query.eq('property_category', category);
      }

      const { data, error } = await query;
      if (!error) {
        setProperties(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, [period, category]);

  const selectedLabel = periodOptions.find(
    o => o.value === period
  )?.label || 'Select Period';

  const navigateToProperty = (property: any) => {
    if (onPropertyClick) {
      onPropertyClick(property);
    } else if (onNavigate) {
      window.history.pushState({}, '', `/property/${property.id}`);
      onNavigate({ type: 'detail', data: { id: property.id } });
    } else {
      window.history.pushState({}, '', `/property/${property.id}`);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleViewAll = () => {
    if (onNavigate) {
      window.history.pushState({}, '', '/');
      onNavigate({ type: 'home' });
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '700',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            width: '4px',
            height: '20px',
            background: '#004F31',
            borderRadius: '4px',
            display: 'inline-block'
          }} />
          Latest Advertisements
        </h3>

        {/* Period Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            📅 {selectedLabel}
            <span style={{
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: '0.2s',
              display: 'inline-block',
              marginLeft: '4px'
            }}>▼</span>
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 98
                }}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                zIndex: 99,
                overflow: 'hidden',
                minWidth: '180px'
              }}>
                {periodOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setPeriod(option.value);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      background: period === option.value ? '#E8F5E9' : 'white',
                      color: period === option.value ? '#004F31' : '#374151',
                      fontWeight: period === option.value ? '600' : '400',
                      transition: 'background 0.15s'
                    }}
                  >
                    {period === option.value && '✓ '}
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results count */}
      <p style={{
        color: '#6B7280',
        fontSize: '13px',
        margin: '0 0 16px 0'
      }}>
        {loading ? 'Loading...' : `${properties.length} properties found`}
      </p>

      {/* Property List */}
      {loading ? (
        // Skeleton loading with animate-pulse class
        <div>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse" style={{
              display: 'flex',
              gap: '12px',
              padding: '12px 0',
              borderBottom: '1px solid #F3F4F6'
            }}>
              <div style={{
                width: '80px',
                height: '60px',
                background: '#F3F4F6',
                borderRadius: '8px',
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  height: '14px',
                  background: '#F3F4F6',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  width: '80%'
                }} />
                <div style={{
                  height: '12px',
                  background: '#F3F4F6',
                  borderRadius: '4px',
                  width: '50%'
                }} />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        // Empty state
        <div style={{
          textAlign: 'center',
          padding: '32px 16px',
          color: '#9CA3AF'
        }}>
          <div style={{ 
            fontSize: '40px',
            marginBottom: '8px'
          }}>🏠</div>
          <p style={{ margin: 0 }}>
            No properties found for this period
          </p>
          <button
            onClick={() => setPeriod('alltime')}
            style={{
              marginTop: '12px',
              color: '#004F31',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            View all properties →
          </button>
        </div>
      ) : (
        // Property list
        properties.map((property, index) => {
          let image = '/placeholder-property.jpg';
          if (property.images) {
            if (Array.isArray(property.images)) {
              image = property.images[0] || '/placeholder-property.jpg';
            } else if (typeof property.images === 'string') {
              try {
                const parsed = JSON.parse(property.images);
                image = (Array.isArray(parsed) ? parsed[0] : parsed) || '/placeholder-property.jpg';
              } catch {
                image = property.images;
              }
            }
          }

          const timeAgo = (dateStr: string) => {
            const diff = Date.now() - new Date(dateStr).getTime();
            const mins = Math.floor(diff/60000);
            const hours = Math.floor(diff/3600000);
            const days = Math.floor(diff/86400000);
            if (mins < 60) return `${Math.max(1, mins)}m ago`;
            if (hours < 24) return `${hours}h ago`;
            return `${days}d ago`;
          };

          return (
            <div
              key={property.id}
              onClick={() => navigateToProperty(property)}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px 0',
                borderBottom: index < properties.length - 1 ? '1px solid #F3F4F6' : 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.75';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: '80px',
                height: '60px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#F3F4F6'
              }}>
                <img
                  src={image}
                  alt={property.listing_title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-property.jpg';
                  }}
                />
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#111827',
                  lineHeight: '1.3',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {property.listing_title}
                </p>

                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '12px',
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  📍 {property.city}, {property.district}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <span style={{
                    color: '#004F31',
                    fontWeight: '700',
                    fontSize: '13px',
                    whiteSpace: 'nowrap'
                  }}>
                    {property.price_lkr
                      ? `Rs. ${Number(property.price_lkr).toLocaleString()}`
                      : 'Price on Request'
                    }
                  </span>
                  <span style={{
                    color: '#9CA3AF',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    {timeAgo(property.created_at)}
                  </span>
                </div>

                {/* FOR SALE / FOR RENT badge */}
                <span style={{
                  background: property.listing_type === 'For Sale' ? '#FEE2E2' : '#DBEAFE',
                  color: property.listing_type === 'For Sale' ? '#CC2222' : '#1D4ED8',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  fontSize: '10px',
                  fontWeight: '700',
                  marginTop: '4px',
                  display: 'inline-block'
                }}>
                  {property.listing_type}
                </span>
              </div>
            </div>
          );
        })
      )}

      {/* View All button */}
      {!loading && properties.length > 0 && (
        <button
          onClick={handleViewAll}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '10px',
            background: '#F0FDF4',
            color: '#004F31',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            transition: 'all 0.2s'
          }}
        >
          View All Properties →
        </button>
      )}
    </div>
  );
};

export default LatestAdvertisements;
