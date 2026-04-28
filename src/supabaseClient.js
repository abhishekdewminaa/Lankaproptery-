import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qsqqolvsndvkwegvcfqv.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = "sb_publishable_srMG0yYK9V0lH1ipf9C4Hw_ae0_eCe5";

// You can use these variables to initialize your Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
