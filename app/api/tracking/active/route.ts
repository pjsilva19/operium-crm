import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { DriverLocation } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    // Obtener todas las ubicaciones ordenadas por fecha (más recientes primero)
    const { data: allLocations, error: fetchError } = await supabase
      .from('driver_locations')
      .select(`
        id,
        transportista_id,
        lat,
        lng,
        accuracy,
        heading,
        speed,
        recorded_at,
        transportistas (
          id,
          nombre,
          placa
        )
      `)
      .order('recorded_at', { ascending: false })
      .limit(1000) // Limitar para no traer demasiados datos

    // Si no hay datos, retornar array vacío (esto es normal, no es un error)
    if (!allLocations || allLocations.length === 0) {
      return NextResponse.json({ locations: [] })
    }

    // Si hay error con la relación, intentar sin la relación
    if (fetchError) {
      console.error('Error fetching driver locations with relation:', fetchError)
      // Intentar sin la relación
      const { data: locationsWithoutRelation, error: simpleError } = await supabase
        .from('driver_locations')
        .select('id, transportista_id, lat, lng, accuracy, heading, speed, recorded_at')
        .order('recorded_at', { ascending: false })
        .limit(1000)

      if (simpleError) {
        // Si también falla sin relación, podría ser que la tabla no existe o hay un problema de permisos
        console.error('Error fetching driver locations without relation:', simpleError)
        return NextResponse.json(
          { error: simpleError.message || 'Error al obtener ubicaciones', details: simpleError },
          { status: 500 }
        )
      }

      if (!locationsWithoutRelation || locationsWithoutRelation.length === 0) {
        return NextResponse.json({ locations: [] })
      }

      // Obtener transportistas por separado
      const transportistaIds = [...new Set(locationsWithoutRelation.map((l: any) => l.transportista_id))]
      const { data: transportistas } = await supabase
        .from('transportistas')
        .select('id, nombre, placa')
        .in('id', transportistaIds)

      const transportistasMap = new Map(
        (transportistas || []).map((t: any) => [t.id, { id: t.id, nombre: t.nombre, placa: t.placa }])
      )

      // Combinar datos
      const locationsWithTransportistas = locationsWithoutRelation.map((loc: any) => ({
        ...loc,
        transportistas: transportistasMap.get(loc.transportista_id) || null
      }))

      // Agrupar por transportista_id y obtener solo el más reciente de cada uno
      const latestByDriver = new Map<string, DriverLocation>()
      
      locationsWithTransportistas.forEach((loc: any) => {
        const driverId = loc.transportista_id
        if (!latestByDriver.has(driverId)) {
          latestByDriver.set(driverId, loc as DriverLocation)
        }
      })

      const result = Array.from(latestByDriver.values())
      return NextResponse.json({ locations: result })
    }

    // Agrupar por transportista_id y obtener solo el más reciente de cada uno
    const latestByDriver = new Map<string, DriverLocation>()
    
    allLocations.forEach((loc: any) => {
      const driverId = loc.transportista_id
      if (!latestByDriver.has(driverId)) {
        latestByDriver.set(driverId, loc as DriverLocation)
      }
    })

    const result = Array.from(latestByDriver.values())
    return NextResponse.json({ locations: result })
  } catch (error: any) {
    console.error('Error in active endpoint:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener ubicaciones activas', details: error },
      { status: 500 }
    )
  }
}
