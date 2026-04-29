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
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          // Map snake_case from DB to camelCase if necessary, 
          // but if you name columns exactly as above, they match.
          // Adjusting agent_id -> agentId mapping
          const formattedData = data.map((item: any) => ({
            ...item,
            agentId: item.agent_id || item.agentId
          }));
          setProperties(formattedData);
        }
      } catch (err: any) {
        console.error('Error fetching properties:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  return { properties, loading, error };
}
