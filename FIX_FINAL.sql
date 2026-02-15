-- ============================================
-- SOLUCIÓN FINAL - Ejecuta esto completo
-- ============================================

-- 1. Eliminar el trigger problemático
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- 2. Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Master can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 3. Crear política de UPDATE simple (sin recursión)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Aprobar todos los usuarios master (sin trigger)
UPDATE profiles 
SET approved = true 
WHERE rol = 'master';

-- 5. Verificar
SELECT id, email, rol, approved 
FROM profiles 
WHERE rol = 'master';

-- ============================================
-- OPCIONAL: Si quieres recrear el trigger después
-- ============================================
-- Primero verifica que la tabla tiene updated_at:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'updated_at';
--
-- Si existe, puedes recrear el trigger:
-- CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
