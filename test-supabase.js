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
  const { data, error } = await supabase.from('properties').select('*').limit(1);
  if (error) {
    console.error("Error fetching properties:", error);
  } else if (data && data[0]) {
    const row = data[0];
    const simplified = {
      id: row.id,
      listing_title: row.listing_title,
      mobile: row.mobile,
      landline: row.landline,
      google_maps_link: row.google_maps_link,
      package_tier: row.package_tier,
      admin_notes: row.admin_notes
    };
    console.log("Property row simplified:", simplified);
  } else {
    console.log("No data");
  }
}
checkSchema();
