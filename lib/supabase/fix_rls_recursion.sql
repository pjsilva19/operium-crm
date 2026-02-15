-- =====================================================
-- CORREGIR RECURSIÓN INFINITA EN POLÍTICAS RLS
-- =====================================================

-- Eliminar políticas problemáticas que causan recursión
DROP POLICY IF EXISTS "Master can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Master can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Master can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "profile self access" ON profiles;

-- Crear función helper que bypass RLS para verificar rol
-- Esta función usa SECURITY DEFINER para bypass RLS y evitar recursión
CREATE OR REPLACE FUNCTION public.is_master_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Consultar profiles directamente sin RLS (gracias a SECURITY DEFINER)
  SELECT rol INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, '') = 'master';
END;
$$;

-- Política: Usuarios pueden leer su propio profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política: Master puede leer todos los profiles (usando función helper)
CREATE POLICY "Master can read all profiles" ON profiles
  FOR SELECT USING (
    public.is_master_user() OR auth.uid() = id
  );

-- Política: Master puede insertar profiles
CREATE POLICY "Master can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    public.is_master_user()
  );

-- Política: Master puede actualizar cualquier profile
CREATE POLICY "Master can update all profiles" ON profiles
  FOR UPDATE USING (
    public.is_master_user() OR auth.uid() = id
  );
