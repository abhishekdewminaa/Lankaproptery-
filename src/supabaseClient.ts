import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qsqqolvsndvkwegvcfqv.supabase.co"
const SUPABASE_PUBLIC_KEY = "sb_publishable_srMG0yYK9V0lH1ipf9C4Hw_ae0_eCe5"

// Explicitly use the global fetch to avoid polyfills trying to overwrite window.fetch
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
  global: {
    fetch: (...args) => globalThis.fetch(...args),
  },
});
