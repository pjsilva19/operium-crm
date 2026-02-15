import { createClient } from './supabase/server'
import crypto from 'crypto'

export async function generateTrackingToken(tripId: string): Promise<string> {
  const supabase = await createClient()
  
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex')
  
  // Create tracking session (expires in 7 days)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  
  const { error } = await supabase
    .from('trip_tracking_sessions')
    .insert({
      trip_id: tripId,
      token,
      is_active: true,
      expires_at: expiresAt.toISOString(),
    })
  
  if (error) {
    throw new Error('Error al generar token de tracking')
  }
  
  return token
}

export async function getTrackingUrl(tripId: string): Promise<string> {
  const token = await generateTrackingToken(tripId)
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${token}`
}
