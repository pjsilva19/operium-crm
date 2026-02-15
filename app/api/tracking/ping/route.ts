import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transportista_id, lat, lng, accuracy, heading, speed } = body

    // Validaciones
    if (!transportista_id || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'transportista_id, lat y lng son requeridos' },
        { status: 400 }
      )
    }

    // Validar rango de coordenadas
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Coordenadas inválidas' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insertar ubicación
    const { data, error } = await supabase
      .from('driver_locations')
      .insert({
        transportista_id,
        lat,
        lng,
        accuracy: accuracy || null,
        heading: heading || null,
        speed: speed || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting driver location:', error)
      return NextResponse.json(
        { error: error.message || 'Error al guardar ubicación' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, location: data })
  } catch (error: any) {
    console.error('Error in ping endpoint:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar ping' },
      { status: 500 }
    )
  }
}
