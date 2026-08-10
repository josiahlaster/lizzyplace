import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
export const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

// Keep public pages usable when deployment secrets have not been configured yet.
// The GitHub Actions workflow supplies these values for production builds.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null

if (!isSupabaseConfigured) {
  console.warn('Supabase is not configured. Booking availability and admin features are disabled.')
}
