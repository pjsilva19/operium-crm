-- =====================================================
-- SETUP COMPLETO PARA SUPABASE
-- Ejecuta este SQL en el SQL Editor de Supabase
-- =====================================================

-- =====================================================
-- 1. AGREGAR CAMPOS DE APROBACIÓN A CLIENTES Y TRANSPORTISTAS
-- =====================================================

-- Agregar campo de aprobación a clientes
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS aprobado BOOLEAN DEFAULT false;

ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES profiles(id);

ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS aprobado_at TIMESTAMPTZ;

-- Agregar campo de aprobación a transportistas
ALTER TABLE transportistas 
ADD COLUMN IF NOT EXISTS aprobado BOOLEAN DEFAULT false;

ALTER TABLE transportistas 
ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES profiles(id);

ALTER TABLE transportistas 
ADD COLUMN IF NOT EXISTS aprobado_at TIMESTAMPTZ;

-- Crear índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_clientes_aprobado ON clientes(aprobado);
CREATE INDEX IF NOT EXISTS idx_transportistas_aprobado ON transportistas(aprobado);

-- =====================================================
-- 2. ACTUALIZAR POLÍTICAS RLS PARA PROFILES
-- Permitir que master pueda insertar y actualizar profiles
-- =====================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Master can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Master can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Master can read all profiles" ON profiles;

-- Política: Master puede leer todos los profiles
CREATE POLICY "Master can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Política: Master puede insertar profiles (para crear usuarios)
CREATE POLICY "Master can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- Política: Master puede actualizar cualquier profile
CREATE POLICY "Master can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'master'
    )
  );

-- =====================================================
-- 3. VERIFICAR QUE EL USUARIO MASTER EXISTA
-- Asegúrate de que presleysb@operium-logistica.com tenga rol 'master'
-- =====================================================

-- Si necesitas actualizar manualmente el usuario master:
-- UPDATE profiles 
-- SET rol = 'master', approved = true 
-- WHERE email = 'presleysb@operium-logistica.com';

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Si la tabla transportistas no existe, ejecuta primero:
--    lib/supabase/create_transportistas_table.sql
--
-- 2. Si los campos de aprobación ya existen, el SQL usará
--    "IF NOT EXISTS" para evitar errores
--
-- 3. Las políticas RLS se eliminan y recrean para asegurar
--    que estén actualizadas
