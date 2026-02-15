# Guía de Configuración Rápida - OPERIUM CRM

## Paso 1: Variables de Entorno

Crea `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Paso 2: Configurar Supabase

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Abre el **SQL Editor**
3. Copia y pega el contenido completo de `lib/supabase/schema.sql`
4. Ejecuta el script
5. Verifica que se crearon las tablas:
   - `sucursales` (con 4 registros)
   - `profiles`
   - `viajes`
   - `trip_tracking_sessions`
   - `trip_locations`

## Paso 3: Obtener Credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Paso 4: Obtener Token de Mapbox

1. Crea cuenta en [mapbox.com](https://mapbox.com)
2. Ve a **Account** → **Access tokens**
3. Copia tu **Default public token** → `NEXT_PUBLIC_MAPBOX_TOKEN`

## Paso 5: Ejecutar el Proyecto

```bash
npm install
npm run dev
```

## Paso 6: Primer Usuario (Master)

1. Ve a `http://localhost:3000/register`
2. Regístrate con tu email y contraseña
3. **¡Importante!** El primer usuario se convierte automáticamente en **master**
4. Serás redirigido al dashboard

## Paso 7: Aprobar Otros Usuarios

1. Otros usuarios se registran y quedan en `/pending`
2. Como master, ve a `/usuarios`
3. Aproba usuarios y asigna:
   - **Rol**: admin, ops, sales, founder
   - **Sucursal**: OPGYE001, OPUIO001, OPSIC001, OPCOS001

## ✅ Verificación

- [ ] Variables de entorno configuradas
- [ ] Schema SQL ejecutado en Supabase
- [ ] Primer usuario registrado (master)
- [ ] Dashboard carga correctamente
- [ ] Mapa muestra (si hay token de Mapbox)
- [ ] Puedes crear viajes
- [ ] Puedes aprobar usuarios (como master)

## 🐛 Problemas Comunes

### "Token inválido" en tracking
- Verifica que `trip_tracking_sessions` tenga datos
- El token expira en 7 días

### Mapa no carga
- Verifica `NEXT_PUBLIC_MAPBOX_TOKEN` en `.env.local`
- Reinicia el servidor después de agregar variables

### Usuario no puede ver viajes
- Verifica que tenga `sucursal_id` asignado
- Master puede ver todos los viajes

### RLS bloquea consultas
- Verifica que las políticas RLS estén creadas
- Ejecuta nuevamente el schema.sql completo
