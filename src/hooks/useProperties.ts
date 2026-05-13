import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface Property {
  id: number;
  listing_title: string;
  city: string;
  price_lkr: string | number;
  listing_type: string;
  images: string[];
  lat: number;
  lng: number;
  agentId: string;
  property_description: string;
  property_category?: string;
  district?: string;
  bedrooms?: number;
  bathrooms?: number;
  rooms?: number;
  land_area?: string;
  floor_area?: string;
  floors?: number;
  additional_info?: string;
  amenities?: string[];
  is_negotiable?: boolean;
  location_link?: string;
  contacts?: { type: 'Mobile' | 'Landline', number: string }[];
  status?: 'active' | 'paused' | string;
  views_count?: number;
  leads_count?: number;
  created_at?: string;
  updated_at?: string;
  published_by?: 'admin' | 'agent' | 'user' | string;
  package_tier?: 'Starter Free' | 'Premium Pro' | 'Elite Pro' | string;
  // Legacy aliases for compatibility during transition
  title?: string;
  location?: string;
  price?: string;
  type?: string;
  image?: string;
  description?: string;
  propertyType?: string;
  listingType?: string;
  landArea?: string;
  floorArea?: string;
  additionalInfo?: string;
  isNegotiable?: boolean;
  locationLink?: string;
  google_maps_link?: string;
}

const DEMO_LISTINGS: Property[] = [
  {
    id: 1,
    listing_title: 'Luxury Villa Colombo',
    property_category: 'House',
    listing_type: 'For Sale',
    district: 'Colombo',
    city: 'Nugegoda',
    price_lkr: 45000000,
    rooms: 3,
    bathrooms: 2,
    status: 'active',
    agentId: 'admin@lankaproperty.lk',
    property_description: 'Luxury modern villa in a prime location.',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'],
    lat: 6.8724,
    lng: 79.8884
  },
  {
    id: 2,
    listing_title: 'Prime Residential Land',
    property_category: 'Land',
    listing_type: 'For Sale',
    district: 'Gampaha',
    city: 'Negombo',
    price_lkr: 850000,
    status: 'active',
    agentId: 'admin@lankaproperty.lk',
    property_description: 'Valuable land in Negombo heart.',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'],
    lat: 7.2089,
    lng: 79.8355
  }
];

const fetchWithRetry = async (queryFn: () => any, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await queryFn();
      if (error) throw error;
      return data;
    } catch (err) {
      if (i === retries - 1) {
        console.warn('Fetch failed after retries, using fallback data');
        return null;
      }
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};

const propertyCache = new Map<string, { data: Property[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProperties() {
    const cacheKey = 'all_properties';
    const cached = propertyCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProperties(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchWithRetry(() => 
        supabase
          .from('properties')
          .select(`
            id,
            listing_title,
            listing_type,
            property_category,
            district,
            city,
            price_lkr,
            rooms,
            bathrooms,
            land_area,
            floor_area,
            images,
            status,
            created_at,
            agent_id,
            views_count,
            leads_count,
            package_tier
          `)
          .order('created_at', { ascending: false })
      );

      const rawData = data && data.length > 0 ? data : DEMO_LISTINGS;
      
      const formattedData = rawData.map((item: any) => {
        let price_display = item.price_lkr || item.price;
        if (price_display && !isNaN(Number(price_display)) && String(price_display).length > 0 && !String(price_display).includes('Contact')) {
          price_display = `Rs. ${Number(price_display).toLocaleString()}`;
        }

        const listing_type = item.listing_type === 'Rent' || item.listing_type === 'For Rent' ? 'Rent' : 'Sale';

        const formatted = {
          ...item,
          id: item.id,
          listing_title: item.listing_title || item.title,
          agentId: item.agent_id || item.agentId,
          city: item.city || item.city_suburb,
          listing_type: listing_type,
          images: item.images || [],
          price_lkr: item.price_lkr || item.price,
          property_description: item.property_description || item.description,
          property_category: item.property_category || item.property_type,
          land_area: item.land_area,
          floor_area: item.floor_area,
          location_link: item.google_maps_link || item.location_link,
          is_negotiable: item.is_negotiable,
          additional_info: item.additional_info || item.additional_information || '',
          amenities: item.amenities || item.building_amenities || [],
          
          // Legacy for compatibility
          title: item.listing_title || item.title,
          location: item.location || `${item.city || item.city_suburb}${item.district ? ', ' + item.district : ''}`,
          type: listing_type,
          image: (item.images && item.images.length > 0) ? item.images[0] : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
          price: price_display || 'Price on Request',
          description: item.property_description || item.description,
          propertyType: item.property_category || item.property_type,
          listingType: item.listing_type,
          landArea: item.land_area,
          floorArea: item.floor_area,
          additionalInfo: item.additional_info || item.additional_information || '',
          isNegotiable: item.is_negotiable,
          locationLink: item.google_maps_link || item.location_link
        };
        return formatted;
      });
      
      propertyCache.set(cacheKey, { data: formattedData, timestamp: Date.now() });
      setProperties(formattedData);
    } catch (err: any) {
      console.warn('Using demo data due to fetch error:', err);
      // Ensure we have some data even on catch
      const formattedFallback = DEMO_LISTINGS.map(item => ({
        ...item,
        title: item.listing_title,
        location: `${item.city}, ${item.district}`,
        type: item.listing_type === 'For Sale' ? 'Sale' : 'Rent',
        image: item.images[0],
        price: `Rs. ${item.price_lkr.toLocaleString()}`,
        description: item.property_description
      })) as Property[];
      setProperties(formattedFallback);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  return { properties, loading, error, refresh: fetchProperties };
}
