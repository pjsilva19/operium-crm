import { createClient } from './supabase/server'
import type { Cliente, Profile } from './supabase/types'

export async function approveCliente(id: string, profile: Profile) {
  // Solo master puede aprobar
  if (profile.rol !== 'master') {
    throw new Error('Solo usuarios master pueden aprobar clientes')
  }

  const supabase = await createClient()

  if (!supabase) {
    throw new Error('Supabase no configurado')
  }

  const { data: updatedCliente, error } = await supabase
    .from('clientes')
    .update({
      aprobado: true,
      aprobado_por: profile.id,
      aprobado_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error approving cliente:', error)
    throw error
  }

  return updatedCliente as Cliente
}
