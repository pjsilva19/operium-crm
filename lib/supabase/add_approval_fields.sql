-- =====================================================
-- AGREGAR CAMPOS DE APROBACIÓN A CLIENTES Y TRANSPORTISTAS
-- =====================================================

-- Agregar campo de aprobación a clientes
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS aprobado BOOLEAN DEFAULT false;

ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES profiles(id);

ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS aprobado_at TIMESTAMPTZ;

-- Agregar campo de aprobación a transportistas
ALTER TABLE transportistas 
ADD COLUMN IF NOT EXISTS aprobado BOOLEAN DEFAULT false;

ALTER TABLE transportistas 
ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES profiles(id);

ALTER TABLE transportistas 
ADD COLUMN IF NOT EXISTS aprobado_at TIMESTAMPTZ;

-- Crear índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_clientes_aprobado ON clientes(aprobado);
CREATE INDEX IF NOT EXISTS idx_transportistas_aprobado ON transportistas(aprobado);
