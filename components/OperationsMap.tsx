'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import type { DriverLocation } from '@/lib/supabase/types'

export default function OperationsMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    if (!mapboxToken) {
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-[#1E293B] rounded-2xl border border-gray-800 text-gray-400">
            <div class="text-center p-8">
              <p class="mb-2">⚠️ Mapbox Token no configurado</p>
              <p class="text-sm">Configura NEXT_PUBLIC_MAPBOX_TOKEN en .env.local</p>
            </div>
          </div>
        `
      }
      return
    }

    mapboxgl.accessToken = mapboxToken

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-day-v1',
      center: [-78.4678, -0.1807], // Ecuador center
      zoom: 6,
    })

    map.current = mapInstance

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update markers with driver locations
  const updateMarkers = (locations: DriverLocation[]) => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    // Add markers for each driver location
    locations.forEach((location) => {
      const transportista = location.transportistas
      const transportistaName = transportista?.nombre || 'Transportista'
      const placa = transportista?.placa || 'N/A'
      const recordedAt = new Date(location.recorded_at)
      const timeStr = recordedAt.toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.width = '32px'
      el.style.height = '32px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = '#10B981'
      el.style.border = '3px solid white'
      el.style.cursor = 'pointer'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
      el.style.position = 'relative'
      el.style.zIndex = '1000'

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([Number(location.lng), Number(location.lat)])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="text-white" style="min-width: 200px;">
              <p class="font-semibold text-sm mb-1">${transportistaName}</p>
              <p class="text-xs text-gray-300 mb-1">Placa: ${placa}</p>
              <p class="text-xs text-gray-400">Último ping: ${timeStr}</p>
              <p class="text-xs text-gray-500 mt-1">ID: ${location.transportista_id.substring(0, 8)}...</p>
            </div>
          `)
        )
        .addTo(map.current!)

      markersRef.current.set(location.transportista_id, marker)
    })
  }

  // Fetch active driver locations every 5 seconds
  useEffect(() => {
    if (!map.current) return

    const fetchActiveLocations = async () => {
      try {
        const response = await fetch('/api/tracking/active')
        if (!response.ok) {
          // Solo mostrar error si no es un error de autenticación (401)
          // Si es 500, podría ser un problema real, pero si es 401, es normal si no estás autenticado
          if (response.status !== 401) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Error fetching active locations:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData.error || 'Unknown error',
              details: errorData.details
            })
          }
          return
        }

        const data = await response.json()
        if (data.locations && Array.isArray(data.locations)) {
          // Actualizar markers incluso si el array está vacío (limpia markers anteriores)
          updateMarkers(data.locations)
          // Solo actualizar timestamp si hay al menos una ubicación
          if (data.locations.length > 0) {
            setLastUpdate(new Date())
          }
        }
      } catch (error) {
        // Solo mostrar errores de red, no errores de parsing
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.error('Error de red al obtener ubicaciones:', error)
        }
      }
    }

    // Initial load
    fetchActiveLocations()

    // Set up interval to fetch every 5 seconds
    const interval = setInterval(fetchActiveLocations, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Mapa de Operaciones</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-400">En Ruta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-400">Asignado</span>
          </div>
        </div>
      </div>
      <div className="relative h-[587px] overflow-hidden rounded-b-2xl">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        {lastUpdate && (
          <div className="absolute top-3 right-3 bg-[#0F172A] border border-gray-800 rounded-lg p-2.5 text-white text-sm z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-xs">Tracking activo</span>
            </div>
            <p className="text-xs text-gray-400">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
