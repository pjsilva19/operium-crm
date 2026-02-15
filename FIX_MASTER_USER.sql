-- ============================================
-- SCRIPT PARA APROBAR USUARIOS MASTER
-- Ejecuta esto en Supabase SQL Editor
-- ============================================

-- 1. Ver todos los usuarios master
SELECT id, email, nombre, rol, approved, created_at 
FROM profiles 
WHERE rol = 'master';

-- 2. Aprobar todos los usuarios master
UPDATE profiles 
SET approved = true 
WHERE rol = 'master';

-- 3. Verificar que se aprobaron
SELECT id, email, nombre, rol, approved 
FROM profiles 
WHERE rol = 'master';

-- ============================================
-- Si solo quieres aprobar un usuario específico:
-- ============================================
-- UPDATE profiles 
-- SET approved = true 
-- WHERE email = 'tu-email@ejemplo.com' AND rol = 'master';

-- ============================================
-- Si necesitas hacer a alguien master:
-- ============================================
-- UPDATE profiles 
-- SET rol = 'master', approved = true 
-- WHERE email = 'tu-email@ejemplo.com';
