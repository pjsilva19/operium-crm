import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  try {
    const session = await getSession()

    if (session) {
      redirect('/dashboard')
    } else {
      redirect('/login')
    }
  } catch (error) {
    // If there's an error (e.g., Supabase not configured), redirect to login
    // This prevents the entire site from breaking
    redirect('/login')
  }
}
