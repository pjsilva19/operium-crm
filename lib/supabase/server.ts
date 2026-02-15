import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  // Guard: Validate environment variables
  // Return null if missing or invalid (must start with https://)
  if (!url || !key || !/^https:\/\/.+/.test(url)) {
    console.warn('Supabase client not created: Missing or invalid environment variables')
    return null
  }

  try {
    const cookieStore = await cookies()

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
    // If client creation fails, return null for graceful handling
    console.error('Failed to create Supabase client:', error.message)
    return null
  }
}
