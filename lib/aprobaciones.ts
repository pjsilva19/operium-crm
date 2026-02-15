import { createClient } from './supabase/server'

export async function getPendientesCount() {
  const supabase = await createClient()

  try {
    // Contar clientes pendientes
    const { count: clientesCount } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('aprobado', false)

    // Contar transportistas pendientes
    const { count: transportistasCount } = await supabase
      .from('transportistas')
      .select('*', { count: 'exact', head: true })
      .eq('aprobado', false)

    const total = (clientesCount || 0) + (transportistasCount || 0)
    return total
  } catch (error) {
    console.error('Error getting pendientes count:', error)
    return 0
  }
}
