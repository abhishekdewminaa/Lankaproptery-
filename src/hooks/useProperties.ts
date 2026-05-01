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
          let price = item.price;
          if (price && !isNaN(Number(price)) && !price.includes('Contact')) {
            price = `Rs. ${Number(price).toLocaleString()}`;
          }

          return {
            ...item,
            agentId: item.agent_id || item.agentId,
            location: item.location || `${item.city}${item.district ? ', ' + item.district : ''}`,
            type: item.type || (item.listing_type === 'For Sale' ? 'Sale' : 'Rent'),
            image: item.image || (item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'),
            price,
            // Ensure other fields are mapped if they have snake_case in DB
            listingType: item.listing_type,
            propertyType: item.property_type,
            landArea: item.land_area,
            floorArea: item.floor_area,
            additionalInfo: item.additional_info,
            isNegotiable: item.is_negotiable,
            locationLink: item.location_link
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
