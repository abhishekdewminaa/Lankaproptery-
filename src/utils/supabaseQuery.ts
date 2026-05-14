import { supabase } from '../supabaseClient';

/**
 * Universal safe query wrapper for Supabase to handle common errors gracefully
 */
export const safeQuery = async <T = any>(
  queryFn: () => any,
  fallback: T[] = []
): Promise<{ data: T[]; count: number }> => {
  try {
    const { data, error, count } = await queryFn();
    
    if (error) {
      // Log specific error for debugging
      console.warn('Supabase query error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // PGRST125 = invalid path/column usually
      if (error.code === 'PGRST125') {
        console.error('Invalid table or column name in Supabase request!');
      }
      
      return { data: fallback, count: 0 };
    }
    
    return { 
      data: data || fallback, 
      count: count || 0 
    };
  } catch (err) {
    console.warn('Supabase query execution failed:', err);
    return { data: fallback, count: 0 };
  }
};
