-- =====================================================
-- SOLUCIONAR COLUMNA 'nombre' EN CLIENTES
-- Hacer nullable o eliminar la columna antigua 'nombre'
-- =====================================================

-- Opción 1: Hacer la columna 'nombre' nullable (si quieres mantenerla por compatibilidad)
-- Descomenta estas líneas si prefieres mantener la columna:
-- ALTER TABLE clientes ALTER COLUMN nombre DROP NOT NULL;

-- Opción 2: Eliminar la columna 'nombre' (RECOMENDADO si ya migraste todo)
-- Primero verifica que no haya datos importantes solo en 'nombre'
-- Si todo está migrado a nombre_comercial y razon_social, elimina la columna:

ALTER TABLE clientes DROP COLUMN IF EXISTS nombre;

-- Verificar que se eliminó correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;
