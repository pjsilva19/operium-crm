-- =====================================================
-- DRIVER LOCATIONS - Tracking de transportistas
-- =====================================================

-- Crear tabla driver_locations
CREATE TABLE IF NOT EXISTS public.driver_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transportista_id UUID NOT NULL REFERENCES public.transportistas(id) ON DELETE CASCADE,
  lat NUMERIC(10, 8) NOT NULL,
  lng NUMERIC(11, 8) NOT NULL,
  accuracy NUMERIC(10, 2),
  heading NUMERIC(5, 2),
  speed NUMERIC(10, 2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_driver_locations_transportista_id ON public.driver_locations(transportista_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_recorded_at ON public.driver_locations(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_locations_transportista_recorded ON public.driver_locations(transportista_id, recorded_at DESC);

-- Habilitar RLS
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can read driver locations from their sucursal" ON public.driver_locations;
DROP POLICY IF EXISTS "Users can insert driver locations" ON public.driver_locations;
DROP POLICY IF EXISTS "Anyone can insert driver locations" ON public.driver_locations;

-- Política: Usuarios pueden leer ubicaciones de transportistas de su sucursal
CREATE POLICY "Users can read driver locations from their sucursal" ON public.driver_locations
  FOR SELECT USING (
    transportista_id IN (
      SELECT t.id FROM public.transportistas t
      WHERE t.sucursal_codigo IN (
        SELECT s.codigo FROM public.sucursales s
        WHERE s.id IN (
          SELECT sucursal_id FROM public.profiles WHERE id = auth.uid()
        )
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Política: Cualquiera puede insertar ubicaciones (para tracking desde apps móviles)
-- IMPORTANTE: Esta política permite insertar sin autenticación para facilitar el tracking desde apps
-- En producción, considera usar Service Role Key o un token personalizado para mayor seguridad
CREATE POLICY "Anyone can insert driver locations" ON public.driver_locations
  FOR INSERT WITH CHECK (true);

-- Política alternativa más segura (comentada):
-- Si quieres que solo transportistas autenticados puedan insertar sus propias ubicaciones:
-- CREATE POLICY "Drivers can insert their own locations" ON public.driver_locations
--   FOR INSERT WITH CHECK (
--     transportista_id IN (
--       SELECT id FROM public.transportistas 
--       WHERE id = auth.uid() -- Asumiendo que transportistas tienen auth.users asociados
--     )
--   );
