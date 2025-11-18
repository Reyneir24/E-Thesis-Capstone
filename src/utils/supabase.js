import { createClient } from '@supabase/supabase-js'

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wjbzfwieoopcrzbydfnc.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqYnpmd2llb29wY3J6YnlkZm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTA2NjgsImV4cCI6MjA3ODY2NjY2OH0.31AUOid-QyB6aATlGXL-_3ZcynlbmvIOFob8Rq9zGdo'

export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase

