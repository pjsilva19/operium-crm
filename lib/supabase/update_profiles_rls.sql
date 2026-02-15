-- =====================================================
-- ACTUALIZAR POLÍTICAS RLS PARA PROFILES
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
