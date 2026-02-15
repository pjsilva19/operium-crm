-- =====================================================
-- ACTUALIZACIÓN DE SCHEMA CLIENTES
-- Agregar campos nombre_comercial y razon_social
-- =====================================================

-- Agregar nuevas columnas
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS nombre_comercial TEXT,
ADD COLUMN IF NOT EXISTS razon_social TEXT;

-- Migrar datos existentes: si existe la columna 'nombre', copiarla a los nuevos campos
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'nombre'
  ) THEN
    UPDATE clientes 
    SET 
      nombre_comercial = COALESCE(nombre_comercial, nombre),
      razon_social = COALESCE(razon_social, nombre)
    WHERE nombre_comercial IS NULL OR razon_social IS NULL;
  END IF;
END $$;

-- Hacer los campos requeridos (después de migrar datos)
-- Primero actualizar registros que puedan tener NULL
UPDATE clientes 
SET 
  nombre_comercial = COALESCE(nombre_comercial, 'Sin nombre'),
  razon_social = COALESCE(razon_social, 'Sin razón social')
WHERE nombre_comercial IS NULL OR razon_social IS NULL;

ALTER TABLE clientes 
ALTER COLUMN nombre_comercial SET NOT NULL,
ALTER COLUMN razon_social SET NOT NULL;

-- Eliminar la columna antigua 'nombre' (opcional, comentado por si acaso)
-- ALTER TABLE clientes DROP COLUMN IF EXISTS nombre;

-- Crear índices para búsqueda
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_comercial ON clientes(nombre_comercial);
CREATE INDEX IF NOT EXISTS idx_clientes_razon_social ON clientes(razon_social);
CREATE INDEX IF NOT EXISTS idx_clientes_ruc_ci ON clientes(ruc_ci);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_sucursal ON clientes(sucursal_id);
