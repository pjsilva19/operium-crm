import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedUser, getProfile } from '@/lib/auth'
import { createViaje } from '@/lib/viajes'
import type { Viaje } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      cliente_id,
      transportista_id,
      origen_direccion,
      origen_ciudad,
      origen_lat,
      origen_lng,
      destino_direccion,
      destino_ciudad,
      destino_lat,
      destino_lng,
      fecha_carga,
      fecha_entrega_estimada,
      tipo_carga,
      peso_kg,
      volumen_m3,
      pallets,
      valor_cliente,
      costo_transportista,
      estado,
      guia_numero,
      factura_numero,
      orden_cliente,
      observaciones,
    } = body

    // Validaciones
    if (!cliente_id) {
      return NextResponse.json({ error: 'El cliente es requerido' }, { status: 400 })
    }
    if (!origen_direccion || !origen_ciudad) {
      return NextResponse.json({ error: 'El origen es requerido' }, { status: 400 })
    }
    if (!destino_direccion || !destino_ciudad) {
      return NextResponse.json({ error: 'El destino es requerido' }, { status: 400 })
    }
    if (!fecha_carga) {
      return NextResponse.json({ error: 'La fecha de carga es requerida' }, { status: 400 })
    }
    if (!valor_cliente || valor_cliente <= 0) {
      return NextResponse.json({ error: 'El valor del cliente es requerido' }, { status: 400 })
    }
    if (costo_transportista === undefined || costo_transportista < 0) {
      return NextResponse.json({ error: 'El costo del transportista es requerido' }, { status: 400 })
    }

    const viajeData: Omit<Viaje, 'id' | 'created_at' | 'updated_at' | 'margen' | 'is_deleted'> = {
      cliente_id,
      transportista_id: transportista_id || null,
      sucursal_id: null, // Se asignará automáticamente en createViaje
      origen_direccion,
      origen_ciudad,
      origen_lat: origen_lat || null,
      origen_lng: origen_lng || null,
      destino_direccion,
      destino_ciudad,
      destino_lat: destino_lat || null,
      destino_lng: destino_lng || null,
      fecha_carga,
      fecha_entrega_estimada: fecha_entrega_estimada || null,
      fecha_entrega_real: null,
      tipo_carga: tipo_carga || null,
      peso_kg: peso_kg || null,
      volumen_m3: volumen_m3 || null,
      pallets: pallets || null,
      valor_cliente,
      costo_transportista,
      estado: estado || 'pendiente',
      guia_numero: guia_numero || null,
      factura_numero: factura_numero || null,
      orden_cliente: orden_cliente || null,
      observaciones: observaciones || null,
    }

    const viaje = await createViaje(viajeData, profile)

    return NextResponse.json({ success: true, viaje })
  } catch (error: any) {
    console.error('Error creating viaje:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear viaje' },
      { status: 500 }
    )
  }
}
