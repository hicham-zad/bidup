import { createClient } from '@supabase/supabase-js'

// Browser-safe anon client — singleton reused across the app.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Backwards-compatible helper
export const getSupabaseClient = () => supabase
