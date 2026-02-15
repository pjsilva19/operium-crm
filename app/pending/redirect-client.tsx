'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectClient() {
  const router = useRouter()

  useEffect(() => {
    // Force redirect to dashboard
    window.location.href = '/dashboard'
  }, [])

  return null
}
