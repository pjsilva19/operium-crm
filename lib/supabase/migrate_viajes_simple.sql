-- =====================================================
-- MIGRACIÓN SIMPLE - Eliminar tabla antigua y crear nueva
-- =====================================================
-- Si NO necesitas preservar datos existentes, ejecuta esto:

DROP TABLE IF EXISTS public.viajes CASCADE;

-- Luego ejecuta el SQL de modulo_viajes.sql completo
