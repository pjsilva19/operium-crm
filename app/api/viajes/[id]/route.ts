import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/auth'
import { updateViaje, deleteViaje } from '@/lib/viajes'
import type { Viaje } from '@/lib/supabase/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const resolvedParams = await params
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
      fecha_entrega_real,
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

    const updateData: Partial<Omit<Viaje, 'id' | 'created_at' | 'updated_at' | 'margen' | 'sucursal_id'>> = {
      cliente_id,
      transportista_id: transportista_id || null,
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
      fecha_entrega_real: fecha_entrega_real || null,
      tipo_carga: tipo_carga || null,
      peso_kg: peso_kg || null,
      volumen_m3: volumen_m3 || null,
      pallets: pallets || null,
      valor_cliente,
      costo_transportista,
      estado,
      guia_numero: guia_numero || null,
      factura_numero: factura_numero || null,
      orden_cliente: orden_cliente || null,
      observaciones: observaciones || null,
    }

    const viaje = await updateViaje(resolvedParams.id, updateData, profile)

    return NextResponse.json({ success: true, viaje })
  } catch (error: any) {
    console.error('Error updating viaje:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar viaje' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getProfile()
    if (!profile) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const resolvedParams = await params
    await deleteViaje(resolvedParams.id, profile)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting viaje:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar viaje' },
      { status: 500 }
    )
  }
}
