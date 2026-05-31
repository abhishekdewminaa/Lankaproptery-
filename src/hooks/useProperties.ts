import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

import { safeQuery } from '../utils/supabaseQuery';

export interface Property {
  id: number;
  ref_no?: string;
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
  rooms?: number;
  bathrooms?: number;
  land_area?: string;
  floor_area?: string;
  floor_area_sqft?: string;
  land_area_perch?: string;
  status?: string;
  created_at?: string;
  usd_estimate?: number;
  is_featured?: boolean;
  is_trending?: boolean;
  package_tier?: string;
  agent_id?: string;
  views_count?: number;
  leads_count?: number;
  floors?: number;
  additional_info?: string;
  is_negotiable?: boolean;
  contacts?: any[];
  google_maps_link?: string;
  published_by?: string;
  // Legacy aliases
  title?: string;
  location?: string;
  price?: string;
  type?: string;
  description?: string;
  image?: string;
  propertyType?: string;
  listingType?: string;
  landArea?: string;
  floorArea?: string;
  additionalInfo?: string;
  isNegotiable?: boolean;
  locationLink?: string;
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
  }
];

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProperties() {
    setLoading(true);
    setError(null);

    const CACHE_KEY = "lk_properties_cache";
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    
    if (cachedData) {
      try {
        const { timestamp, data } = JSON.parse(cachedData);
        // Expiration check (5 minutes = 300000 ms)
        if (Date.now() - timestamp < 300000) {
          setProperties(data);
          setLoading(false);
          // We can optionally refresh in the background (stale-while-revalidate),
          // but we won't block the UI rendering. Let's do a background fetch.
        }
      } catch (e) {
        console.error("Failed to parse cache", e);
      }
    }

    try {
      const { data } = await safeQuery<Property>(() => 
        supabase
          .from('properties')
          .select(`
            id,
            ref_no,
            listing_title,
            listing_type,
            property_category,
            district,
            city,
            price_lkr,
            usd_estimate,
            rooms,
            bathrooms,
            land_area,
            floor_area,
            images,
            status,
            agent_id,
            property_description,
            views_count,
            leads_count,
            created_at,
            published_by,
            package_tier,
            is_featured,
            is_trending
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(50),
        DEMO_LISTINGS
      );

      const formattedData = data.map((item: any) => {
        const price_val = item.price_lkr;
        const price_formatted = price_val && !isNaN(Number(price_val)) 
          ? `Rs. ${Number(price_val).toLocaleString()}` 
          : 'Price on Request';

        return {
          ...item,
          agentId: item.agent_id || item.agentId,
          title: item.listing_title,
          location: `${item.city}${item.district ? ', ' + item.district : ''}`,
          price: price_formatted,
          type: item.listing_type,
          description: item.property_description || item.description,
          propertyType: item.property_category,
          listingType: item.listing_type
        };
      });

      setProperties(formattedData);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: formattedData
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();

    const channel = supabase
      .channel('properties_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties'
        },
        () => {
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { properties, loading, error, refresh: fetchProperties };
}

