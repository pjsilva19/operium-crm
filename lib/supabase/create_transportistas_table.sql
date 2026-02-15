-- =====================================================
-- CREAR TABLA TRANSPORTISTAS
-- =====================================================

CREATE TABLE IF NOT EXISTS transportistas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  cedula TEXT,
  telefono TEXT,
  ciudad_base TEXT,
  tipo_camion TEXT,
  capacidad NUMERIC(10, 2),
  placa TEXT,
  estado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_transportistas_sucursal_codigo ON transportistas(sucursal_codigo);
CREATE INDEX IF NOT EXISTS idx_transportistas_nombre ON transportistas(nombre);
CREATE INDEX IF NOT EXISTS idx_transportistas_cedula ON transportistas(cedula);
CREATE INDEX IF NOT EXISTS idx_transportistas_placa ON transportistas(placa);
CREATE INDEX IF NOT EXISTS idx_transportistas_estado ON transportistas(estado);

-- Habilitar RLS
ALTER TABLE transportistas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can read transportistas from their sucursal" ON transportistas;
DROP POLICY IF EXISTS "Users can insert transportistas in their sucursal" ON transportistas;
DROP POLICY IF EXISTS "Users can update transportistas from their sucursal" ON transportistas;
DROP POLICY IF EXISTS "Only master can delete transportistas" ON transportistas;

-- Política: Usuarios pueden leer transportistas de su sucursal
CREATE POLICY "Users can read transportistas from their sucursal" ON transportistas
  FOR SELECT USING (
    sucursal_codigo IN (
      SELECT s.codigo 
      FROM sucursales s
      INNER JOIN profiles p ON s.id = p.sucursal_id
      WHERE p.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Política: Usuarios pueden insertar transportistas en su sucursal
CREATE POLICY "Users can insert transportistas in their sucursal" ON transportistas
  FOR INSERT WITH CHECK (
    sucursal_codigo IN (
      SELECT s.codigo 
      FROM sucursales s
      INNER JOIN profiles p ON s.id = p.sucursal_id
      WHERE p.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Política: Usuarios pueden actualizar transportistas de su sucursal
CREATE POLICY "Users can update transportistas from their sucursal" ON transportistas
  FOR UPDATE USING (
    sucursal_codigo IN (
      SELECT s.codigo 
      FROM sucursales s
      INNER JOIN profiles p ON s.id = p.sucursal_id
      WHERE p.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Política: Solo master puede eliminar transportistas
CREATE POLICY "Only master can delete transportistas" ON transportistas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_transportistas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transportistas_updated_at 
BEFORE UPDATE ON transportistas
FOR EACH ROW EXECUTE FUNCTION update_transportistas_updated_at();
