'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Viaje, Cliente, Transportista } from '@/lib/supabase/types'

export default function EditarViajePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [transportistas, setTransportistas] = useState<Transportista[]>([])
  const [viaje, setViaje] = useState<Viaje | null>(null)
  const [viajeId, setViajeId] = useState<string>('')

  const [formData, setFormData] = useState<{
    cliente_id: string
    transportista_id: string
    origen_direccion: string
    origen_ciudad: string
    origen_lat: string
    origen_lng: string
    destino_direccion: string
    destino_ciudad: string
    destino_lat: string
    destino_lng: string
    fecha_carga: string
    fecha_entrega_estimada: string
    fecha_entrega_real: string
    tipo_carga: string
    peso_kg: string
    volumen_m3: string
    pallets: string
    valor_cliente: string
    costo_transportista: string
    estado: 'pendiente' | 'asignado' | 'en_ruta' | 'entregado' | 'cancelado'
    guia_numero: string
    factura_numero: string
    orden_cliente: string
    observaciones: string
  }>({
    cliente_id: '',
    transportista_id: '',
    origen_direccion: '',
    origen_ciudad: '',
    origen_lat: '',
    origen_lng: '',
    destino_direccion: '',
    destino_ciudad: '',
    destino_lat: '',
    destino_lng: '',
    fecha_carga: '',
    fecha_entrega_estimada: '',
    fecha_entrega_real: '',
    tipo_carga: '',
    peso_kg: '',
    volumen_m3: '',
    pallets: '',
    valor_cliente: '',
    costo_transportista: '',
    estado: 'pendiente',
    guia_numero: '',
    factura_numero: '',
    orden_cliente: '',
    observaciones: '',
  })

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setViajeId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (viajeId) {
      loadData()
    }
  }, [viajeId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Cargar viaje
      const { data: viajeData, error: viajeError } = await supabase
        .from('viajes')
        .select('*')
        .eq('id', viajeId)
        .eq('is_deleted', false)
        .single()

      if (viajeError || !viajeData) {
        setError('Viaje no encontrado')
        return
      }

      const viajeLoaded = viajeData as Viaje
      setViaje(viajeLoaded)

      // Cargar formulario
      setFormData({
        cliente_id: viajeLoaded.cliente_id,
        transportista_id: viajeLoaded.transportista_id || '',
        origen_direccion: viajeLoaded.origen_direccion,
        origen_ciudad: viajeLoaded.origen_ciudad,
        origen_lat: viajeLoaded.origen_lat?.toString() || '',
        origen_lng: viajeLoaded.origen_lng?.toString() || '',
        destino_direccion: viajeLoaded.destino_direccion,
        destino_ciudad: viajeLoaded.destino_ciudad,
        destino_lat: viajeLoaded.destino_lat?.toString() || '',
        destino_lng: viajeLoaded.destino_lng?.toString() || '',
        fecha_carga: viajeLoaded.fecha_carga,
        fecha_entrega_estimada: viajeLoaded.fecha_entrega_estimada || '',
        fecha_entrega_real: viajeLoaded.fecha_entrega_real || '',
        tipo_carga: viajeLoaded.tipo_carga || '',
        peso_kg: viajeLoaded.peso_kg?.toString() || '',
        volumen_m3: viajeLoaded.volumen_m3?.toString() || '',
        pallets: viajeLoaded.pallets?.toString() || '',
        valor_cliente: viajeLoaded.valor_cliente.toString(),
        costo_transportista: viajeLoaded.costo_transportista.toString(),
        estado: viajeLoaded.estado,
        guia_numero: viajeLoaded.guia_numero || '',
        factura_numero: viajeLoaded.factura_numero || '',
        orden_cliente: viajeLoaded.orden_cliente || '',
        observaciones: viajeLoaded.observaciones || '',
      })

      // Cargar clientes
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, nombre_comercial, razon_social')
        .eq('aprobado', true)
        .eq('activo', true)
        .order('nombre_comercial')

      if (clientesData) {
        setClientes(clientesData as Cliente[])
      }

      // Cargar transportistas
      const { data: transportistasData } = await supabase
        .from('transportistas')
        .select('id, nombre, placa')
        .eq('aprobado', true)
        .eq('estado', true)
        .order('nombre')

      if (transportistasData) {
        setTransportistas(transportistasData as Transportista[])
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/viajes/${viajeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          transportista_id: formData.transportista_id || null,
          origen_lat: formData.origen_lat ? parseFloat(formData.origen_lat) : null,
          origen_lng: formData.origen_lng ? parseFloat(formData.origen_lng) : null,
          destino_lat: formData.destino_lat ? parseFloat(formData.destino_lat) : null,
          destino_lng: formData.destino_lng ? parseFloat(formData.destino_lng) : null,
          fecha_entrega_estimada: formData.fecha_entrega_estimada || null,
          fecha_entrega_real: formData.fecha_entrega_real || null,
          tipo_carga: formData.tipo_carga || null,
          peso_kg: formData.peso_kg ? parseFloat(formData.peso_kg) : null,
          volumen_m3: formData.volumen_m3 ? parseFloat(formData.volumen_m3) : null,
          pallets: formData.pallets ? parseInt(formData.pallets) : null,
          valor_cliente: parseFloat(formData.valor_cliente),
          costo_transportista: parseFloat(formData.costo_transportista),
          guia_numero: formData.guia_numero || null,
          factura_numero: formData.factura_numero || null,
          orden_cliente: formData.orden_cliente || null,
          observaciones: formData.observaciones || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar viaje')
      }

      router.push(`/viajes/${viajeId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar viaje')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Cargando...</div>
      </div>
    )
  }

  if (!viaje) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400">Viaje no encontrado</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Editar Viaje</h1>
        <p className="text-gray-400">Modificar información del viaje</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1E293B] rounded-2xl border border-gray-800 p-6 space-y-6">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cliente <span className="text-red-400">*</span>
          </label>
          <select
            required
            value={formData.cliente_id}
            onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre_comercial || cliente.razon_social}
              </option>
            ))}
          </select>
        </div>

        {/* Transportista */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Transportista
          </label>
          <select
            value={formData.transportista_id}
            onChange={(e) => setFormData({ ...formData, transportista_id: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <option value="">Sin asignar</option>
            {transportistas.map((transportista) => (
              <option key={transportista.id} value={transportista.id}>
                {transportista.nombre} {transportista.placa ? `(${transportista.placa})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Origen y Destino - mismo formato que nuevo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ciudad Origen <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.origen_ciudad}
              onChange={(e) => setFormData({ ...formData, origen_ciudad: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dirección Origen <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.origen_direccion}
              onChange={(e) => setFormData({ ...formData, origen_direccion: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ciudad Destino <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.destino_ciudad}
              onChange={(e) => setFormData({ ...formData, destino_ciudad: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dirección Destino <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.destino_direccion}
              onChange={(e) => setFormData({ ...formData, destino_direccion: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha de Carga <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.fecha_carga}
              onChange={(e) => setFormData({ ...formData, fecha_carga: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha Entrega Estimada
            </label>
            <input
              type="date"
              value={formData.fecha_entrega_estimada}
              onChange={(e) => setFormData({ ...formData, fecha_entrega_estimada: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha Entrega Real
            </label>
            <input
              type="date"
              value={formData.fecha_entrega_real}
              onChange={(e) => setFormData({ ...formData, fecha_entrega_real: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Estado <span className="text-red-400">*</span>
          </label>
          <select
            required
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'pendiente' | 'asignado' | 'en_ruta' | 'entregado' | 'cancelado' })}
            className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <option value="pendiente">Pendiente</option>
            <option value="asignado">Asignado</option>
            <option value="en_ruta">En Ruta</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Carga - mismo formato */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Carga</label>
            <select
              value={formData.tipo_carga}
              onChange={(e) => setFormData({ ...formData, tipo_carga: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="">Seleccionar</option>
              <option value="seca">Seca</option>
              <option value="refrigerada">Refrigerada</option>
              <option value="peligrosa">Peligrosa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Peso (kg)</label>
            <input
              type="number"
              step="0.01"
              value={formData.peso_kg}
              onChange={(e) => setFormData({ ...formData, peso_kg: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Volumen (m³)</label>
            <input
              type="number"
              step="0.01"
              value={formData.volumen_m3}
              onChange={(e) => setFormData({ ...formData, volumen_m3: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pallets</label>
            <input
              type="number"
              value={formData.pallets}
              onChange={(e) => setFormData({ ...formData, pallets: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Valor Cliente <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.valor_cliente}
              onChange={(e) => setFormData({ ...formData, valor_cliente: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Costo Transportista <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.costo_transportista}
              onChange={(e) => setFormData({ ...formData, costo_transportista: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>

        {/* Referencias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Guía Número</label>
            <input
              type="text"
              value={formData.guia_numero}
              onChange={(e) => setFormData({ ...formData, guia_numero: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Factura Número</label>
            <input
              type="text"
              value={formData.factura_numero}
              onChange={(e) => setFormData({ ...formData, factura_numero: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Orden Cliente</label>
            <input
              type="text"
              value={formData.orden_cliente}
              onChange={(e) => setFormData({ ...formData, orden_cliente: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Observaciones</label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#F97316] hover:bg-[#EA6A0C] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
