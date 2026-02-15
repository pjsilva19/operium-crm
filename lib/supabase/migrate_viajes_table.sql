-- =====================================================
-- MIGRACIÓN DE TABLA VIAJES - Estructura Antigua a Nueva
-- =====================================================

-- Paso 1: Verificar si la tabla existe con estructura antigua
-- Si tiene columnas como 'fecha', 'cliente', 'origen', 'destino', etc.
-- entonces necesitamos migrar

-- Paso 2: Crear tabla temporal con nueva estructura
CREATE TABLE IF NOT EXISTS public.viajes_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  transportista_id UUID NULL REFERENCES public.transportistas(id) ON DELETE SET NULL,
  sucursal_id UUID NULL REFERENCES public.sucursales(id) ON DELETE SET NULL,

  origen_direccion TEXT NOT NULL,
  origen_ciudad TEXT NOT NULL,
  origen_lat DOUBLE PRECISION NULL,
  origen_lng DOUBLE PRECISION NULL,

  destino_direccion TEXT NOT NULL,
  destino_ciudad TEXT NOT NULL,
  destino_lat DOUBLE PRECISION NULL,
  destino_lng DOUBLE PRECISION NULL,

  fecha_carga DATE NOT NULL,
  fecha_entrega_estimada DATE NULL,
  fecha_entrega_real DATE NULL,

  tipo_carga TEXT NULL,
  peso_kg NUMERIC NULL,
  volumen_m3 NUMERIC NULL,
  pallets INT NULL,

  valor_cliente NUMERIC NOT NULL DEFAULT 0,
  costo_transportista NUMERIC NOT NULL DEFAULT 0,
  margen NUMERIC GENERATED ALWAYS AS (valor_cliente - costo_transportista) STORED,

  estado TEXT NOT NULL DEFAULT 'pendiente' 
    CHECK (estado IN ('pendiente', 'asignado', 'en_ruta', 'entregado', 'cancelado')),

  guia_numero TEXT NULL,
  factura_numero TEXT NULL,
  orden_cliente TEXT NULL,
  observaciones TEXT NULL,

  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Paso 3: Migrar datos de la tabla antigua a la nueva (si existen datos)
-- NOTA: Esto es solo si quieres preservar datos existentes
-- Si no tienes datos importantes, puedes saltar este paso y hacer DROP directamente

-- Migrar datos (ajusta según tu estructura antigua)
-- INSERT INTO public.viajes_new (
--   id, created_at, updated_at, sucursal_id,
--   origen_direccion, origen_ciudad,
--   destino_direccion, destino_ciudad,
--   fecha_carga, estado,
--   valor_cliente, costo_transportista,
--   observaciones, is_deleted
-- )
-- SELECT 
--   id, created_at, updated_at, sucursal_id,
--   origen, origen,  -- Ajusta según tu estructura
--   destino, destino,  -- Ajusta según tu estructura
--   fecha, estado,
--   tarifa_cliente, costo_proveedor,
--   notas, false
-- FROM public.viajes
-- WHERE is_deleted IS NULL OR is_deleted = false;

-- Paso 4: Eliminar tabla antigua y renombrar nueva
DROP TABLE IF EXISTS public.viajes CASCADE;
ALTER TABLE public.viajes_new RENAME TO viajes;

-- Paso 5: Crear índices
CREATE INDEX IF NOT EXISTS idx_viajes_estado ON public.viajes(estado);
CREATE INDEX IF NOT EXISTS idx_viajes_fecha_carga ON public.viajes(fecha_carga);
CREATE INDEX IF NOT EXISTS idx_viajes_cliente_id ON public.viajes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_viajes_transportista_id ON public.viajes(transportista_id);
CREATE INDEX IF NOT EXISTS idx_viajes_sucursal_id ON public.viajes(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_viajes_is_deleted ON public.viajes(is_deleted);
CREATE INDEX IF NOT EXISTS idx_viajes_created_at ON public.viajes(created_at DESC);

-- Paso 6: Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_viajes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_viajes_updated_at ON public.viajes;
CREATE TRIGGER update_viajes_updated_at 
BEFORE UPDATE ON public.viajes
FOR EACH ROW EXECUTE FUNCTION update_viajes_updated_at();

-- Paso 7: Habilitar RLS
ALTER TABLE public.viajes ENABLE ROW LEVEL SECURITY;

-- Paso 8: Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Master can manage all viajes" ON public.viajes;
DROP POLICY IF EXISTS "Users can view viajes from their sucursal" ON public.viajes;
DROP POLICY IF EXISTS "Users can create viajes in their sucursal" ON public.viajes;
DROP POLICY IF EXISTS "Users can update viajes from their sucursal" ON public.viajes;
DROP POLICY IF EXISTS "Users can soft delete viajes from their sucursal" ON public.viajes;

-- Paso 9: Crear políticas RLS
-- Política: Master puede hacer todo
CREATE POLICY "Master can manage all viajes" ON public.viajes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Política: Usuarios pueden ver viajes de su sucursal (no eliminados)
CREATE POLICY "Users can view viajes from their sucursal" ON public.viajes
  FOR SELECT USING (
    (is_deleted = false) AND (
      sucursal_id IN (
        SELECT sucursal_id FROM public.profiles WHERE id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND rol = 'master'
      )
    )
  );

-- Política: Usuarios pueden crear viajes en su sucursal
CREATE POLICY "Users can create viajes in their sucursal" ON public.viajes
  FOR INSERT WITH CHECK (
    sucursal_id IN (
      SELECT sucursal_id FROM public.profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Política: Usuarios pueden actualizar viajes de su sucursal
CREATE POLICY "Users can update viajes from their sucursal" ON public.viajes
  FOR UPDATE USING (
    (is_deleted = false) AND (
      sucursal_id IN (
        SELECT sucursal_id FROM public.profiles WHERE id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND rol = 'master'
      )
    )
  );

-- Política: Usuarios pueden hacer soft delete de viajes de su sucursal
CREATE POLICY "Users can soft delete viajes from their sucursal" ON public.viajes
  FOR UPDATE USING (
    sucursal_id IN (
      SELECT sucursal_id FROM public.profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  )
  WITH CHECK (
    (is_deleted = true OR OLD.is_deleted = true)
  );
