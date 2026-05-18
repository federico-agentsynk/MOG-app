import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY');
}

// Service-role client — server-side only, never import in client components.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
