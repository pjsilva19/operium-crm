import { createClient } from './supabase/server'
import { getProfile } from './auth'
import { isToday, getEcuadorDate } from './utils'
import type { Viaje } from './supabase/types'

export async function getKpis(sucursalId?: string | null) {
  const supabase = await createClient()
  const profile = await getProfile()

  // If Supabase is not configured, return empty KPIs
  if (!supabase) {
    return {
      viajesActivos: 0,
      viajesHoy: 0,
      enRuta: 0,
      entregadosHoy: 0,
    }
  }

  // Build query based on user role
  let query = supabase.from('viajes').select('*').eq('is_deleted', false)

  if (profile?.rol !== 'master') {
    // Non-master users see only their sucursal
    if (profile?.sucursal_id) {
      query = query.eq('sucursal_id', profile.sucursal_id)
    } else {
      // No sucursal assigned, return empty KPIs
      return {
        viajesActivos: 0,
        viajesHoy: 0,
        enRuta: 0,
        entregadosHoy: 0,
      }
    }
  } else if (sucursalId) {
    // Master filtering by specific sucursal
    query = query.eq('sucursal_id', sucursalId)
  }
  // Master without filter sees all

  const { data: viajes } = await query

  if (!viajes) {
    return {
      viajesActivos: 0,
      viajesHoy: 0,
      enRuta: 0,
      entregadosHoy: 0,
    }
  }

  const today = getEcuadorDate()
  const todayStr = today.toISOString().split('T')[0]

  const viajesActivos = viajes.filter(
    (v: Viaje) => !v.is_deleted && (v.estado === 'asignado' || v.estado === 'en_ruta')
  ).length

  const viajesHoy = viajes.filter((v: Viaje) => {
    if (v.is_deleted) return false
    const fechaStr = typeof v.fecha_carga === 'string' ? v.fecha_carga.split('T')[0] : v.fecha_carga
    return fechaStr === todayStr
  }).length

  const enRuta = viajes.filter((v: Viaje) => !v.is_deleted && v.estado === 'en_ruta').length

  const entregadosHoy = viajes.filter((v: Viaje) => {
    if (v.is_deleted || v.estado !== 'entregado') return false
    const deliveredAt = v.fecha_entrega_real || v.updated_at
    return deliveredAt && isToday(deliveredAt)
  }).length

  return {
    viajesActivos,
    viajesHoy,
    enRuta,
    entregadosHoy,
  }
}
