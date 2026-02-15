# Configuración para Crear Usuarios

## Requisitos

Para que el usuario master pueda crear usuarios sin confirmación de email, necesitas configurar el **Service Role Key** de Supabase.

## Pasos de Configuración

### 1. Obtener el Service Role Key

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **API**
3. Busca la sección **Project API keys**
4. Copia el **`service_role` key** (⚠️ **NUNCA** lo expongas en el frontend)

### 2. Configurar la Variable de Entorno

Agrega la variable de entorno en tu archivo `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

**⚠️ IMPORTANTE:**
- Este archivo `.env.local` NO debe subirse a Git
- Asegúrate de que esté en tu `.gitignore`

### 3. Ejecutar SQL en Supabase

Ejecuta el SQL en el SQL Editor de Supabase para permitir que el master pueda insertar y actualizar profiles:

```sql
-- Ver archivo: lib/supabase/update_profiles_rls.sql
```

## Funcionalidades

### ✅ Usuario Master puede crear usuarios
- Sin confirmación de email
- Con rol asignado
- Con sucursal asignada
- Aprobado automáticamente (opcional)

### ✅ Registro público desde `/register`
- El primer usuario se convierte en master automáticamente
- Los siguientes usuarios quedan como `pending` hasta ser aprobados
- El trigger automáticamente crea el profile

## Flujo de Usuarios

1. **Registro Público** (`/register`):
   - Usuario se registra → `rol='pending'`, `approved=false`
   - Si es el primer usuario → `rol='master'`, `approved=true`
   - Redirige a `/pending` o `/dashboard` según aprobación

2. **Creación por Master** (`/usuarios`):
   - Master crea usuario → Sin confirmación de email
   - Usuario puede iniciar sesión inmediatamente
   - Rol y sucursal asignados desde el inicio
