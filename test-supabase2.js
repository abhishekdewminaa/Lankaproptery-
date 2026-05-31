import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = "https://qsqqolvsndvkwegvcfqv.supabase.co"
const SUPABASE_KEY = "sb_publishable_srMG0yYK9V0lH1ipf9C4Hw_ae0_eCe5"
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
async function run() {
  const { data, error } = await supabase.from('property_views').select('*').limit(1);
  console.log('Views:', data, error);
}
run();
