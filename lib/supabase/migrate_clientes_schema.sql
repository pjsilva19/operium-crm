-- =====================================================
-- MIGRACIÓN COMPLETA DE SCHEMA CLIENTES
-- Este script migra de 'nombre' a 'nombre_comercial' y 'razon_social'
-- =====================================================

-- Paso 1: Verificar y agregar las nuevas columnas si no existen
DO $$
BEGIN
  -- Agregar nombre_comercial si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'nombre_comercial'
  ) THEN
    ALTER TABLE clientes ADD COLUMN nombre_comercial TEXT;
  END IF;

  -- Agregar razon_social si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'razon_social'
  ) THEN
    ALTER TABLE clientes ADD COLUMN razon_social TEXT;
  END IF;
END $$;

-- Paso 2: Migrar datos existentes desde 'nombre' si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'nombre'
  ) THEN
    -- Migrar datos: copiar 'nombre' a ambos campos nuevos
    UPDATE clientes 
    SET 
      nombre_comercial = COALESCE(nombre_comercial, nombre),
      razon_social = COALESCE(razon_social, nombre)
    WHERE nombre IS NOT NULL 
      AND (nombre_comercial IS NULL OR razon_social IS NULL);
  END IF;
END $$;

-- Paso 3: Asegurar que no haya valores NULL antes de hacer NOT NULL
UPDATE clientes 
SET 
  nombre_comercial = COALESCE(nombre_comercial, 'Sin nombre comercial'),
  razon_social = COALESCE(razon_social, 'Sin razón social')
WHERE nombre_comercial IS NULL OR razon_social IS NULL;

-- Paso 4: Hacer las columnas NOT NULL (solo si no tienen restricción ya)
DO $$
BEGIN
  -- Hacer nombre_comercial NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' 
    AND column_name = 'nombre_comercial' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE clientes ALTER COLUMN nombre_comercial SET NOT NULL;
  END IF;

  -- Hacer razon_social NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' 
    AND column_name = 'razon_social' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE clientes ALTER COLUMN razon_social SET NOT NULL;
  END IF;
END $$;

-- Paso 5: Hacer ruc_ci y telefono NOT NULL si no lo son
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' 
    AND column_name = 'ruc_ci' 
    AND is_nullable = 'YES'
  ) THEN
    -- Primero actualizar NULLs
    UPDATE clientes SET ruc_ci = 'Sin RUC/CI' WHERE ruc_ci IS NULL;
    ALTER TABLE clientes ALTER COLUMN ruc_ci SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' 
    AND column_name = 'telefono' 
    AND is_nullable = 'YES'
  ) THEN
    -- Primero actualizar NULLs
    UPDATE clientes SET telefono = 'Sin teléfono' WHERE telefono IS NULL;
    ALTER TABLE clientes ALTER COLUMN telefono SET NOT NULL;
  END IF;
END $$;

-- Paso 6: Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_comercial ON clientes(nombre_comercial);
CREATE INDEX IF NOT EXISTS idx_clientes_razon_social ON clientes(razon_social);
CREATE INDEX IF NOT EXISTS idx_clientes_ruc_ci ON clientes(ruc_ci);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_sucursal ON clientes(sucursal_id);

-- Paso 7: (Opcional) Eliminar la columna antigua 'nombre' si existe y ya no se usa
-- Descomenta la siguiente línea solo si estás seguro de que no necesitas 'nombre'
-- ALTER TABLE clientes DROP COLUMN IF EXISTS nombre;

-- Verificar el resultado
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;
