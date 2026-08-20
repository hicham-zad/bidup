import { createClient } from '@supabase/supabase-js'

// SERVER-ONLY — never import this in a Client Component ('use client').
// SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix so it is
// never sent to the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const getSupabaseAdmin = () => supabaseAdmin
