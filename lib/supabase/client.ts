import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

export const createSupabaseClient = () => {
  return createClientComponentClient()
}

