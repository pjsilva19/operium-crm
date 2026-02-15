import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from './env'

// Lazy initialization to avoid build-time evaluation
let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached instance if available
  if (clientInstance) {
    return clientInstance
  }

  // During build time (SSR), if we're not in the browser, return a mock client
  // This prevents build errors when Next.js tries to prerender pages
  if (typeof window === 'undefined') {
    // Return a mock client that will fail gracefully when used
    // This allows the build to complete, but the page should be marked as dynamic
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error('Supabase client not available during build') }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase client not available during build') }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Supabase client not available during build') }),
          }),
          order: () => ({
            limit: async () => ({ data: null, error: new Error('Supabase client not available during build') }),
          }),
        }),
        insert: async () => ({ data: null, error: new Error('Supabase client not available during build') }),
        update: () => ({
          eq: async () => ({ data: null, error: new Error('Supabase client not available during build') }),
        }),
      }),
    } as any
  }

  // In browser, validate and create real client
  try {
    const { url, key } = getSupabaseEnv()
    clientInstance = createBrowserClient(url, key)
    return clientInstance
  } catch (error: any) {
    // If validation fails, throw error (this should only happen in browser)
    throw new Error(`Failed to create Supabase client: ${error.message}`)
  }
}
