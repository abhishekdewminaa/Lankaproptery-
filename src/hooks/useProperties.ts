import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  type: string;
  image: string;
  lat: number;
  lng: number;
  agentId: string;
  description: string;
  listingType?: string;
  propertyType?: string;
  city?: string;
  district?: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  rooms?: number;
  landArea?: string;
  floorArea?: string;
  floors?: number;
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
        // If "Invalid path" occurs, it's often a missing table or invalid API key
        if (error.message.includes('Invalid path') || error.message.includes('not found')) {
          console.error("Supabase Error: The 'properties' table might be missing or the API URL/Key is incorrect.");
          throw new Error("Could not connect to 'properties' table. Please ensure the table exists in your Supabase database and your API Key is valid.");
        }
        throw error;
      }

      if (data) {
        console.log("Supabase Connection Success! Fetched rows:", data.length);
        console.table(data.slice(0, 5)); // Show first 5 rows in a table format for clarity
        const formattedData = data.map((item: any) => {
          let price = item.price_lkr || item.price;
          if (price && !isNaN(Number(price)) && String(price).length > 0 && !String(price).includes('Contact')) {
            price = `Rs. ${Number(price).toLocaleString()}`;
          }

          return {
            ...item,
            id: item.id,
            title: item.listing_title || item.title,
            agentId: item.agent_id,
            location: item.location || `${item.city || item.city_suburb}${item.district ? ', ' + item.district : ''}`,
            type: item.listing_type === 'Rent' || item.listing_type === 'For Rent' ? 'Rent' : 'Sale',
            image: (item.images && item.images.length > 0) ? item.images[0] : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
            price: price || 'Price on Request',
            description: item.property_description || item.description,
            listingType: item.listing_type,
            propertyType: item.property_category || item.property_type,
            landArea: item.land_area,
            floorArea: item.floor_area,
            floors: item.floors,
            rooms: item.rooms,
            bathrooms: item.bathrooms,
            city: item.city || item.city_suburb,
            district: item.district,
            images: item.images || [],
            additionalInfo: item.additional_info || item.additional_information || '',
            isNegotiable: item.is_negotiable,
            locationLink: item.google_maps_link || item.location_link,
            contacts: [
              ...(item.mobile ? [{ type: 'Mobile', number: item.mobile }] : []),
              ...(item.landline ? [{ type: 'Landline', number: item.landline }] : [])
            ]
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
