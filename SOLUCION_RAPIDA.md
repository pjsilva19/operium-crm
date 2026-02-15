# 🔧 Solución Rápida - Problema de Aprobación Master

## Problema
El usuario master no puede acceder porque `approved = false` en la base de datos.

## Solución Inmediata (SQL)

**Ejecuta este SQL en Supabase → SQL Editor:**

```sql
-- Aprobar todos los usuarios master
UPDATE profiles 
SET approved = true 
WHERE rol = 'master';
```

## Verificar que Funcionó

```sql
-- Ver usuarios master y su estado
SELECT id, email, nombre, rol, approved 
FROM profiles 
WHERE rol = 'master';
```

Todos deberían tener `approved = true`.

## Después del SQL

1. **Cierra sesión** en la aplicación
2. **Limpia la caché del navegador** (Ctrl+Shift+Delete)
3. **Inicia sesión de nuevo**
4. Deberías ir directamente al dashboard

## Si Aún No Funciona

### Verificar tu perfil:
```sql
SELECT * FROM profiles WHERE email = 'tu-email@ejemplo.com';
```

### Si no eres master, hazte master:
```sql
UPDATE profiles 
SET rol = 'master', approved = true 
WHERE email = 'tu-email@ejemplo.com';
```

### Verificar políticas RLS:
```sql
-- Ver todas las políticas de profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

## Nota Importante

El problema es que las políticas RLS (Row Level Security) de Supabase pueden estar bloqueando la actualización automática del campo `approved`. Por eso la solución más confiable es ejecutar el SQL directamente en Supabase.
