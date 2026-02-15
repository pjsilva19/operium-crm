'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TripTrackingSession, TripLocation } from '@/lib/supabase/types'
import Logo from '@/components/Logo'

export default function TrackPage() {
  const params = useParams()
  const token = params.token as string
  const supabase = createClient()
  const [session, setSession] = useState<TripTrackingSession | null>(null)
  const [trip, setTrip] = useState<any>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number
    lng: number
    accuracy: number | null
    heading: number | null
    speed: number | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    loadSession()
  }, [token])

  const loadSession = async () => {
    const { data: sessionData, error: sessionError } = await supabase
      .from('trip_tracking_sessions')
      .select('*, viajes:*')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (sessionError || !sessionData) {
      setError('Token inválido o expirado')
      return
    }

    const sessionDataTyped = sessionData as any
    const expiresAt = new Date(sessionDataTyped.expires_at)
    if (expiresAt < new Date()) {
      setError('Token expirado')
      return
    }

    setSession(sessionDataTyped)
    setTrip(sessionDataTyped.viajes)
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no disponible')
      return
    }

    setIsTracking(true)
    setError(null)

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        }

        setCurrentLocation(location)

        // Send to database every 5 seconds
        if (session && trip) {
          const { error: insertError } = await supabase
            .from('trip_locations')
            .insert({
              trip_id: trip.id,
              lat: location.lat,
              lng: location.lng,
              accuracy: location.accuracy,
              heading: location.heading,
              speed: location.speed ? (location.speed * 3.6) : null, // Convert m/s to km/h
            })

          if (insertError) {
            console.error('Error saving location:', insertError)
          }
        }
      },
      (err) => {
        setError(`Error de geolocalización: ${err.message}`)
        setIsTracking(false)
      },
      options
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
        <div className="bg-[#1E293B] rounded-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-white mb-4">Error</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!session || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1E293B] rounded-2xl border border-gray-800 p-6 mb-6">
          <div className="text-center mb-6">
            <Logo size="md" className="justify-center mb-2" />
            <p className="text-gray-400">Tracking GPS en Vivo</p>
          </div>

          <div className="bg-[#0F172A] rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Información del Viaje</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Cliente:</span>
                <p className="text-white font-medium">{trip.cliente}</p>
              </div>
              <div>
                <span className="text-gray-400">Ruta:</span>
                <p className="text-white font-medium">
                  {trip.origen} → {trip.destino}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={isTracking ? stopTracking : startTracking}
              className={`flex-1 py-4 rounded-lg font-semibold transition-colors ${
                isTracking
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#F97316] hover:bg-[#EA6A0C] text-white'
              }`}
            >
              {isTracking ? '⏹ Detener Tracking' : '▶ Iniciar Tracking'}
            </button>
          </div>

          {currentLocation && (
            <div className="bg-[#0F172A] rounded-lg p-4 space-y-2">
              <h3 className="text-lg font-semibold text-white mb-3">Ubicación Actual</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Latitud:</span>
                  <p className="text-white font-mono">{currentLocation.lat.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Longitud:</span>
                  <p className="text-white font-mono">{currentLocation.lng.toFixed(6)}</p>
                </div>
                {currentLocation.accuracy && (
                  <div>
                    <span className="text-gray-400">Precisión:</span>
                    <p className="text-white">{currentLocation.accuracy.toFixed(0)} m</p>
                  </div>
                )}
                {currentLocation.speed !== null && (
                  <div>
                    <span className="text-gray-400">Velocidad:</span>
                    <p className="text-white">
                      {(currentLocation.speed * 3.6).toFixed(1)} km/h
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isTracking && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Transmitiendo ubicación...</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
