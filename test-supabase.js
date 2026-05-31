import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = (
  process.env.VITE_SUPABASE_URL || "https://qsqqolvsndvkwegvcfqv.supabase.co"
).replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_srMG0yYK9V0lH1ipf9C4Hw_ae0_eCe5";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('properties').select('id, listing_title, title, images').limit(50);
  if (error) {
    console.error("Error fetching properties:", error);
  } else if (data) {
    console.log(`Found ${data.length} properties:`);
    data.forEach(p => {
      console.log(`ID: ${p.id} | ListingTitle: ${p.listing_title} | Title: ${p.title} | Images count: ${p.images ? (Array.isArray(p.images) ? p.images.length : typeof p.images === 'string' ? "string" : "unknown") : 'none'}`);
    });
  }
}
checkSchema();
