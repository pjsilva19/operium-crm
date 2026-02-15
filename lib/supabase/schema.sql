-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sucursales (fixed, no CRUD from UI)
CREATE TABLE IF NOT EXISTS sucursales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert fixed sucursales
INSERT INTO sucursales (codigo, nombre) VALUES
  ('OPGYE001', 'Operaciones Guayaquil'),
  ('OPUIO001', 'Operaciones Quito'),
  ('OPSIC001', 'Operaciones Sierra Centro'),
  ('OPCOS001', 'Operaciones Costa Sur')
ON CONFLICT (codigo) DO NOTHING;

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  email TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'pending' CHECK (rol IN ('master', 'admin', 'ops', 'sales', 'founder', 'pending')),
  approved BOOLEAN DEFAULT false,
  sucursal_id UUID REFERENCES sucursales(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  nombre_comercial TEXT NOT NULL,
  razon_social TEXT NOT NULL,
  ruc_ci TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  direccion TEXT,
  ciudad TEXT,
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Viajes
CREATE TABLE IF NOT EXISTS viajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  cliente TEXT NOT NULL,
  origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  fecha DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'cotizado' CHECK (estado IN ('cotizado', 'asignado', 'en_ruta', 'entregado')),
  tarifa_cliente DECIMAL(10, 2) NOT NULL,
  costo_proveedor DECIMAL(10, 2),
  margen DECIMAL(10, 2),
  notas TEXT,
  notas_internas TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Tracking Sessions
CREATE TABLE IF NOT EXISTS trip_tracking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Locations (GPS tracking)
CREATE TABLE IF NOT EXISTS trip_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  heading DECIMAL(5, 2),
  speed DECIMAL(10, 2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON profiles(approved);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_comercial ON clientes(nombre_comercial);
CREATE INDEX IF NOT EXISTS idx_clientes_razon_social ON clientes(razon_social);
CREATE INDEX IF NOT EXISTS idx_clientes_ruc_ci ON clientes(ruc_ci);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_sucursal ON clientes(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_viajes_sucursal ON viajes(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_viajes_estado ON viajes(estado);
CREATE INDEX IF NOT EXISTS idx_viajes_fecha ON viajes(fecha);
CREATE INDEX IF NOT EXISTS idx_trip_locations_trip_id ON trip_locations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_locations_recorded_at ON trip_locations(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_token ON trip_tracking_sessions(token);
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_trip_id ON trip_tracking_sessions(trip_id);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_locations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles: Master can read all profiles (using auth.jwt() to avoid recursion)
-- Note: This policy is commented out to avoid recursion. 
-- Master access is handled in application logic instead.
-- CREATE POLICY "Master can read all profiles" ON profiles
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE id = auth.uid() AND rol = 'master'
--     )
--   );

-- Profiles: Users can update their own profile (including approved for master)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND (
      -- Users can update their own profile
      -- Master users can update approved status
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND rol = 'master'
      )
      OR
      -- Regular users can update but not approved field (enforced in app logic)
      true
    )
  );

-- Clientes: Users can read clientes from their sucursal
CREATE POLICY "Users can read clientes from their sucursal" ON clientes
  FOR SELECT USING (
    sucursal_id IN (
      SELECT sucursal_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Clientes: Users can insert clientes in their sucursal
CREATE POLICY "Users can insert clientes in their sucursal" ON clientes
  FOR INSERT WITH CHECK (
    sucursal_id IN (
      SELECT sucursal_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Clientes: Users can update clientes in their sucursal
CREATE POLICY "Users can update clientes in their sucursal" ON clientes
  FOR UPDATE USING (
    sucursal_id IN (
      SELECT sucursal_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Clientes: Users can delete clientes in their sucursal
CREATE POLICY "Users can delete clientes in their sucursal" ON clientes
  FOR DELETE USING (
    sucursal_id IN (
      SELECT sucursal_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Viajes: Users can read viajes from their sucursal
CREATE POLICY "Users can read viajes from their sucursal" ON viajes
  FOR SELECT USING (
    sucursal_id IN (
      SELECT sucursal_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Viajes: Users can insert viajes in their sucursal
CREATE POLICY "Users can insert viajes in their sucursal" ON viajes
  FOR INSERT WITH CHECK (
    sucursal_id IN (
      SELECT sucursal_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Viajes: Users can update viajes in their sucursal
CREATE POLICY "Users can update viajes in their sucursal" ON viajes
  FOR UPDATE USING (
    sucursal_id IN (
      SELECT sucursal_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Trip locations: Public read for tracking (via token)
-- This will be handled in the application layer for /track/[token]
-- For dashboard, users can read locations for trips they have access to
CREATE POLICY "Users can read trip locations for accessible trips" ON trip_locations
  FOR SELECT USING (
    trip_id IN (
      SELECT id FROM viajes WHERE
        sucursal_id IN (
          SELECT sucursal_id FROM profiles WHERE id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND rol = 'master'
        )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viajes_updated_at BEFORE UPDATE ON viajes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- =====================================================
-- ACTUALIZACIÓN DE SCHEMA CLIENTES
-- Agregar campos nombre_comercial y razon_social
-- =====================================================

-- Agregar nuevas columnas
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS nombre_comercial TEXT,
ADD COLUMN IF NOT EXISTS razon_social TEXT;

-- Migrar datos existentes: si existe la columna 'nombre', copiarla a los nuevos campos
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'nombre'
  ) THEN
    UPDATE clientes 
    SET 
      nombre_comercial = COALESCE(nombre_comercial, nombre),
      razon_social = COALESCE(razon_social, nombre)
    WHERE nombre_comercial IS NULL OR razon_social IS NULL;
  END IF;
END $$;

-- Hacer los campos requeridos (después de migrar datos)
-- Primero actualizar registros que puedan tener NULL
UPDATE clientes 
SET 
  nombre_comercial = COALESCE(nombre_comercial, 'Sin nombre'),
  razon_social = COALESCE(razon_social, 'Sin razón social')
WHERE nombre_comercial IS NULL OR razon_social IS NULL;

ALTER TABLE clientes 
ALTER COLUMN nombre_comercial SET NOT NULL,
ALTER COLUMN razon_social SET NOT NULL;

-- Crear índices para búsqueda
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_comercial ON clientes(nombre_comercial);
CREATE INDEX IF NOT EXISTS idx_clientes_razon_social ON clientes(razon_social);
CREATE INDEX IF NOT EXISTS idx_clientes_ruc_ci ON clientes(ruc_ci);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_sucursal ON clientes(sucursal_id);