import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseEnv } from './env'

export async function createClient() {
  try {
    const cookieStore = await cookies()

    // Validate environment variables
    const { url, key } = getSupabaseEnv()

    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })
  } catch (error: any) {
    // If env vars are missing or invalid, throw a more descriptive error
    throw new Error(`Failed to create Supabase client: ${error.message}`)
  }
}
