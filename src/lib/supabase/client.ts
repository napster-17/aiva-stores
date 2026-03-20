//lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { type Database } from '@/lib/supabase/types'

export function createClient() {
  return createClientComponentClient<Database>()
}

