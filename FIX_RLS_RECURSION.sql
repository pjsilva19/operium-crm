-- ============================================
-- FIX: Eliminar recursión infinita en RLS
-- Ejecuta esto en Supabase SQL Editor
-- ============================================

-- 1. Eliminar la política problemática que causa recursión
DROP POLICY IF EXISTS "Master can read all profiles" ON profiles;

-- 2. Simplificar la política de UPDATE para evitar recursión
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 3. Crear política de UPDATE simplificada (sin recursión)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Ahora aprobar el usuario master
UPDATE profiles 
SET approved = true 
WHERE rol = 'master';

-- 5. Verificar
SELECT id, email, rol, approved 
FROM profiles 
WHERE rol = 'master';
