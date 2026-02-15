-- ============================================
-- CREAR/ARREGLAR PERFIL DE USUARIO
-- Ejecuta esto en Supabase SQL Editor
-- ============================================

-- 1. Ver todos los usuarios en auth.users
SELECT id, email, created_at 
FROM auth.users;

-- 2. Ver todos los perfiles existentes
SELECT id, email, rol, approved, nombre 
FROM profiles;

-- 3. Si tu usuario no tiene perfil, créalo (reemplaza el email y ID)
-- Primero obtén tu ID de auth.users con el query anterior, luego:

-- OPCIÓN A: Si conoces tu email
INSERT INTO profiles (id, email, nombre, rol, approved)
SELECT 
  id,
  email,
  raw_user_meta_data->>'nombre' as nombre,
  'master' as rol,
  true as approved
FROM auth.users
WHERE email = 'TU-EMAIL-AQUI@ejemplo.com'
ON CONFLICT (id) DO UPDATE 
SET approved = true, rol = 'master';

-- OPCIÓN B: Si conoces tu ID de usuario
-- UPDATE profiles 
-- SET approved = true, rol = 'master'
-- WHERE id = 'TU-ID-AQUI';

-- 4. Verificar que se creó/actualizó
SELECT id, email, rol, approved 
FROM profiles 
WHERE email = 'TU-EMAIL-AQUI@ejemplo.com';
