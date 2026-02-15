-- ============================================
-- SOLUCIÓN SIMPLE - Ejecuta esto en Supabase
-- ============================================

-- Primero, deshabilita temporalmente el trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Aprobar todos los usuarios master
UPDATE profiles 
SET approved = true 
WHERE rol = 'master';

-- Vuelve a crear el trigger (opcional, solo si lo necesitas)
-- CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar que funcionó
SELECT id, email, rol, approved 
FROM profiles 
WHERE rol = 'master';
