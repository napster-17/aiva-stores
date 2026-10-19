//src/lib/supabase/supabaseClient.ts
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
//import { Database } from './types' // adjust if your types file is named differently

export const createClient = () => createPagesBrowserClient()