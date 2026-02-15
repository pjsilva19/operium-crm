import { createBrowserClient } from '@supabase/ssr'

// Lazy initialization to avoid build-time evaluation
let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached instance if available
  if (clientInstance) {
    return clientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time, if env vars are not available, provide a mock client
  // that will fail gracefully when used
  if (!supabaseUrl || !supabaseAnonKey) {
    // Only throw in browser - during build this should not be called
    if (typeof window !== 'undefined') {
      throw new Error(
        'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      )
    }
    // During build/SSR, return a mock client that will fail gracefully
    // This prevents build errors while still allowing the page to be marked as dynamic
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Supabase not configured') }),
          }),
        }),
      }),
    } as any
  }

  // Validate URL format before creating client
  try {
    new URL(supabaseUrl)
  } catch {
    // Invalid URL format - return mock client
    if (typeof window !== 'undefined') {
      throw new Error('Invalid Supabase URL format')
    }
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error('Invalid Supabase URL') }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Invalid Supabase URL') }),
          }),
        }),
      }),
    } as any
  }

  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return clientInstance
}
