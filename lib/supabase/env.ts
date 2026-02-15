/**
 * Validación centralizada de variables de entorno de Supabase
 * Evita errores durante el build y proporciona mensajes claros
 */

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  // Validar que existan
  if (!url) {
    throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!key) {
    throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  // Validar formato de URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Mostrar solo los primeros caracteres para debugging sin exponer la URL completa
    const masked = url.length > 20 ? `${url.substring(0, 10)}...${url.substring(url.length - 5)}` : url
    throw new Error(`Invalid Supabase URL format. Must start with http:// or https://. Received: ${masked}`)
  }

  // Validar que sea una URL válida
  try {
    new URL(url)
  } catch {
    const masked = url.length > 20 ? `${url.substring(0, 10)}...${url.substring(url.length - 5)}` : url
    throw new Error(`Invalid Supabase URL format. Received: ${masked}`)
  }

  return { url, key }
}
