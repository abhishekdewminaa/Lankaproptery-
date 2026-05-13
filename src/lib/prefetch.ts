import { supabase } from '../supabaseClient';

const prefetchCache = new Map<string | number, any>();

export const prefetchProperty = async (id: string | number) => {
  if (!id || prefetchCache.has(id)) return;
  
  try {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
      
    if (data) {
      prefetchCache.set(id, data);
    }
  } catch (err) {
    console.error('Prefetch error:', err);
  }
};

export const getPrefetchedProperty = (id: string | number) => {
  return prefetchCache.get(id);
};
