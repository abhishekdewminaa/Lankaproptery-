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

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProperties() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        if (error.message.includes('Invalid path') || error.message.includes('not found')) {
          console.error("Supabase Error: The 'properties' table might be missing or the API URL/Key is incorrect.");
          throw new Error("Could not connect to 'properties' table. Please ensure the table exists in your Supabase database and your API Key is valid.");
        }
        throw error;
      }

      if (data) {
        const formattedData = data.map((item: any) => {
          let price_display = item.price_lkr || item.price;
          if (price_display && !isNaN(Number(price_display)) && String(price_display).length > 0 && !String(price_display).includes('Contact')) {
            price_display = `Rs. ${Number(price_display).toLocaleString()}`;
          }

          const listing_type = item.listing_type === 'Rent' || item.listing_type === 'For Rent' ? 'Rent' : 'Sale';

          return {
            ...item,
            id: item.id,
            listing_title: item.listing_title || item.title,
            agentId: item.agent_id,
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
        });
        setProperties(formattedData);
      }
    } catch (err: any) {
      console.error('Error fetching properties Full Error:', err);
      console.error('Error fetching properties Message:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  return { properties, loading, error, refresh: fetchProperties };
}
