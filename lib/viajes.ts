import { createClient } from './supabase/server'
import type { Viaje, Profile, Cliente, Transportista } from './supabase/types'

export async function getViajes(profile: Profile) {
  const supabase = await createClient()

  // If Supabase is not configured, return empty array
  if (!supabase) {
    return []
  }

  try {
    let query = supabase
      .from('viajes')
      .select(`
        *,
        clientes:cliente_id (
          id,
          nombre_comercial,
          razon_social
        ),
        transportistas:transportista_id (
          id,
          nombre,
          placa
        )
      `)
      .eq('is_deleted', false)
      .order('fecha_carga', { ascending: false })
      .order('created_at', { ascending: false })

    // Si no es master, filtrar por sucursal
    if (profile.rol !== 'master' && profile.sucursal_id) {
      query = query.eq('sucursal_id', profile.sucursal_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching viajes:', error)
      throw error
    }

    return (data as any[]) || []
  } catch (error: any) {
    console.error('Error in getViajes:', error)
    return []
  }
}

export async function getViajeById(id: string, profile: Profile): Promise<Viaje | null> {
  const supabase = await createClient()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('viajes')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error) {
    console.error('Error fetching viaje:', error)
    return null
  }

  const viaje = data as Viaje

  // Verificar acceso
  if (profile.rol !== 'master' && profile.sucursal_id) {
    if (viaje.sucursal_id !== profile.sucursal_id) {
      return null
    }
  }

  return viaje
}

export async function createViaje(
  data: Omit<Viaje, 'id' | 'created_at' | 'updated_at' | 'margen' | 'is_deleted'>,
  profile: Profile
) {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error('Supabase no configurado')
  }

  // Asignar sucursal_id automáticamente si no es master
  let sucursalId = data.sucursal_id
  if (!sucursalId && profile.rol !== 'master' && profile.sucursal_id) {
    sucursalId = profile.sucursal_id
  }

  const { data: newViaje, error } = await supabase
    .from('viajes')
    .insert({
      ...data,
      sucursal_id: sucursalId,
      is_deleted: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating viaje:', error)
    throw error
  }

  return newViaje as Viaje
}

export async function updateViaje(
  id: string,
  data: Partial<Omit<Viaje, 'id' | 'created_at' | 'updated_at' | 'margen' | 'sucursal_id'>>,
  profile: Profile
) {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error('Supabase no configurado')
  }

  // Verificar acceso
  const viaje = await getViajeById(id, profile)
  if (!viaje) {
    throw new Error('Viaje no encontrado o sin acceso')
  }

  const { data: updatedViaje, error } = await supabase
    .from('viajes')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating viaje:', error)
    throw error
  }

  return updatedViaje as Viaje
}

export async function deleteViaje(id: string, profile: Profile) {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error('Supabase no configurado')
  }

  // Verificar acceso
  const viaje = await getViajeById(id, profile)
  if (!viaje) {
    throw new Error('Viaje no encontrado o sin acceso')
  }

  // Soft delete para usuarios no master
  if (profile.rol !== 'master') {
    const { error } = await supabase
      .from('viajes')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) {
      console.error('Error soft deleting viaje:', error)
      throw error
    }

    return true
  }

  // Hard delete solo para master
  const { error } = await supabase
    .from('viajes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting viaje:', error)
    throw error
  }

  return true
}

export async function getClientesForSelect(profile: Profile): Promise<Cliente[]> {
  const supabase = await createClient()

  if (!supabase) {
    return []
  }

  let query = supabase
    .from('clientes')
    .select('id, nombre_comercial, razon_social')
    .eq('aprobado', true)
    .eq('activo', true)
    .order('nombre_comercial')

  if (profile.rol !== 'master' && profile.sucursal_id) {
    query = query.eq('sucursal_id', profile.sucursal_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching clientes:', error)
    return []
  }

  return (data as Cliente[]) || []
}

export async function getTransportistasForSelect(profile: Profile): Promise<Transportista[]> {
  const supabase = await createClient()

  if (!supabase) {
    return []
  }

  let query = supabase
    .from('transportistas')
    .select('id, nombre, placa')
    .eq('aprobado', true)
    .eq('estado', true)
    .order('nombre')

  if (profile.rol !== 'master' && profile.sucursal_id) {
    const { data: sucursal } = await supabase
      .from('sucursales')
      .select('codigo')
      .eq('id', profile.sucursal_id)
      .single()

    if (sucursal?.codigo) {
      query = query.eq('sucursal_codigo', sucursal.codigo)
    } else {
      return []
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching transportistas:', error)
    return []
  }

  return (data as Transportista[]) || []
}
