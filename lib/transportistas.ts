import { createClient } from './supabase/server'
import type { Transportista, Profile, Sucursal } from './supabase/types'

export async function getTransportistas(profile: Profile) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('transportistas')
      .select('*')
      .eq('aprobado', true) // Solo mostrar transportistas aprobados para todos
      .order('created_at', { ascending: false })

    // Si no es master, filtrar por sucursal
    if (profile.rol !== 'master' && profile.sucursal_id) {
      // Obtener el código de la sucursal
      const { data: sucursal, error: sucursalError } = await supabase
        .from('sucursales')
        .select('codigo')
        .eq('id', profile.sucursal_id)
        .single()

      if (sucursalError) {
        console.error('Error fetching sucursal:', sucursalError)
        return []
      }

      if (sucursal?.codigo) {
        query = query.eq('sucursal_codigo', sucursal.codigo)
      } else {
        // Si no tiene sucursal, retornar array vacío
        return []
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching transportistas:', error)
      // Si la tabla no existe, retornar array vacío en lugar de lanzar error
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn('Tabla transportistas no existe aún')
        return []
      }
      throw error
    }

    return (data as Transportista[]) || []
  } catch (error: any) {
    console.error('Error in getTransportistas:', error)
    // Retornar array vacío en caso de error para no romper la UI
    return []
  }
}

export async function getTransportistaById(id: string, profile: Profile): Promise<Transportista | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transportistas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching transportista:', error)
    return null
  }

  const transportista = data as Transportista

  // Verificar que el usuario tenga acceso
  if (profile.rol !== 'master' && profile.sucursal_id) {
    const { data: sucursal } = await supabase
      .from('sucursales')
      .select('codigo')
      .eq('id', profile.sucursal_id)
      .single()

    if (sucursal?.codigo && transportista.sucursal_codigo !== sucursal.codigo) {
      return null // No tiene acceso
    }
  }

  return transportista
}

export async function createTransportista(
  data: Omit<Transportista, 'id' | 'created_at' | 'updated_at'>,
  profile: Profile
) {
  const supabase = await createClient()

  // Obtener código de sucursal del usuario
  if (!profile.sucursal_id) {
    throw new Error('Usuario no tiene sucursal asignada')
  }

  const { data: sucursal } = await supabase
    .from('sucursales')
    .select('codigo')
    .eq('id', profile.sucursal_id)
    .single()

  if (!sucursal?.codigo) {
    throw new Error('No se pudo obtener el código de sucursal')
  }

  const { data: newTransportista, error } = await supabase
    .from('transportistas')
    .insert({
      ...data,
      sucursal_codigo: sucursal.codigo,
      estado: data.estado ?? true,
      aprobado: false, // Requiere aprobación del master
      aprobado_por: null,
      aprobado_at: null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating transportista:', error)
    throw error
  }

  return newTransportista as Transportista
}

export async function updateTransportista(
  id: string,
  data: Partial<Omit<Transportista, 'id' | 'sucursal_codigo' | 'created_at' | 'updated_at'>>,
  profile: Profile
) {
  const supabase = await createClient()

  // Verificar acceso
  const transportista = await getTransportistaById(id, profile)
  if (!transportista) {
    throw new Error('Transportista no encontrado o sin acceso')
  }

  const { data: updatedTransportista, error } = await supabase
    .from('transportistas')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating transportista:', error)
    throw error
  }

  return updatedTransportista as Transportista
}

export async function deleteTransportista(id: string, profile: Profile) {
  // Solo master puede eliminar
  if (profile.rol !== 'master') {
    throw new Error('Solo usuarios master pueden eliminar transportistas')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('transportistas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting transportista:', error)
    throw error
  }

  return true
}

export async function approveTransportista(id: string, profile: Profile) {
  // Solo master puede aprobar
  if (profile.rol !== 'master') {
    throw new Error('Solo usuarios master pueden aprobar transportistas')
  }

  const supabase = await createClient()

  const { data: updatedTransportista, error } = await supabase
    .from('transportistas')
    .update({
      aprobado: true,
      aprobado_por: profile.id,
      aprobado_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error approving transportista:', error)
    throw error
  }

  return updatedTransportista as Transportista
}
