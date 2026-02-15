export type Profile = {
  id: string
  nombre: string | null
  email: string
  rol: 'master' | 'admin' | 'ops' | 'sales' | 'founder' | 'pending'
  approved: boolean
  sucursal_id: string | null
  created_at: string
  updated_at: string
}

export type Sucursal = {
  id: string
  codigo: string
  nombre: string
  created_at: string
}

export type Cliente = {
  id: string
  sucursal_id: string
  nombre_comercial: string
  razon_social: string
  ruc_ci: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  ciudad: string | null
  notas: string | null
  activo: boolean
  aprobado: boolean
  aprobado_por: string | null
  aprobado_at: string | null
  created_at: string
  updated_at: string
}

export type Viaje = {
  id: string
  created_at: string
  updated_at: string
  cliente_id: string
  transportista_id: string | null
  sucursal_id: string | null
  origen_direccion: string
  origen_ciudad: string
  origen_lat: number | null
  origen_lng: number | null
  destino_direccion: string
  destino_ciudad: string
  destino_lat: number | null
  destino_lng: number | null
  fecha_carga: string
  fecha_entrega_estimada: string | null
  fecha_entrega_real: string | null
  tipo_carga: string | null
  peso_kg: number | null
  volumen_m3: number | null
  pallets: number | null
  valor_cliente: number
  costo_transportista: number
  margen: number
  estado: 'pendiente' | 'asignado' | 'en_ruta' | 'entregado' | 'cancelado'
  guia_numero: string | null
  factura_numero: string | null
  orden_cliente: string | null
  observaciones: string | null
  is_deleted: boolean
}

export type TripTrackingSession = {
  id: string
  trip_id: string
  token: string
  is_active: boolean
  expires_at: string
  created_at: string
}

export type TripLocation = {
  id: string
  trip_id: string
  lat: number
  lng: number
  accuracy: number | null
  heading: number | null
  speed: number | null
  recorded_at: string
}

export type Transportista = {
  id: string
  sucursal_codigo: string
  nombre: string
  cedula: string | null
  telefono: string | null
  ciudad_base: string | null
  tipo_camion: string | null
  capacidad: number | null
  placa: string | null
  estado: boolean
  aprobado: boolean
  aprobado_por: string | null
  aprobado_at: string | null
  created_at: string
  updated_at: string
}

export type DriverLocation = {
  id: string
  transportista_id: string
  lat: number
  lng: number
  accuracy: number | null
  heading: number | null
  speed: number | null
  recorded_at: string
  transportistas?: {
    id: string
    nombre: string
    placa: string | null
  }
}
