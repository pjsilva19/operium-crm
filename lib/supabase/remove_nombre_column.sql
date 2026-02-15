-- =====================================================
-- ELIMINAR COLUMNA 'nombre' DE CLIENTES
-- Verificar y eliminar de forma segura
-- =====================================================

-- Paso 1: Verificar que la columna existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'nombre'
  ) THEN
    -- Primero, hacer la columna nullable si tiene restricción NOT NULL
    -- Esto es necesario antes de eliminarla
    BEGIN
      ALTER TABLE clientes ALTER COLUMN nombre DROP NOT NULL;
    EXCEPTION
      WHEN OTHERS THEN
        -- Si falla, continuar
        NULL;
    END;
    
    -- Ahora eliminar la columna
    ALTER TABLE clientes DROP COLUMN nombre;
    
    RAISE NOTICE 'Columna nombre eliminada exitosamente';
  ELSE
    RAISE NOTICE 'La columna nombre no existe';
  END IF;
END $$;

-- Verificar el resultado
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;
