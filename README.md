# OPERIUM CRM - Sistema de Logística y Transporte

CRM profesional de logística y seguimiento de flotas en tiempo real.

## 🚀 Características

- ✅ Autenticación completa con Supabase Auth
- ✅ Sistema de aprobación de usuarios (primer usuario = master)
- ✅ Gestión multisucursal (4 sucursales fijas)
- ✅ Dashboard con KPIs dinámicos
- ✅ Módulo completo de viajes (CRUD)
- ✅ Mapa interactivo con Mapbox GL
- ✅ Tracking GPS en tiempo real
- ✅ UI corporativa moderna tipo "control tower"

## 📋 Requisitos Previos

- Node.js 18+ 
- Cuenta de Supabase
- Cuenta de Mapbox (para el mapa)

## 🛠️ Instalación

1. **Clonar e instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Crea un archivo `.env.local` con:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
NEXT_PUBLIC_MAPBOX_TOKEN=tu_token_de_mapbox
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Configurar base de datos en Supabase:**
   - Ve a tu proyecto de Supabase
   - Abre el SQL Editor
   - Ejecuta el contenido de `lib/supabase/schema.sql`
   - Esto creará todas las tablas, políticas RLS y datos iniciales

4. **Ejecutar el proyecto:**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
operium_crm/
├── app/                    # Next.js App Router
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── pending/           # Página de espera de aprobación
│   ├── dashboard/         # Dashboard principal
│   ├── viajes/            # Módulo de viajes
│   ├── usuarios/          # Gestión de usuarios (solo master)
│   ├── track/             # Tracking GPS público
│   └── ...
├── components/            # Componentes React
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── KpiCard.tsx
│   ├── OperationsMap.tsx
│   └── ...
├── lib/                   # Utilidades y helpers
│   ├── supabase/         # Clientes de Supabase
│   ├── auth.ts           # Helpers de autenticación
│   ├── kpis.ts           # Cálculo de KPIs
│   └── utils.ts          # Utilidades generales
└── middleware.ts         # Middleware de protección de rutas
```

## 🔐 Sistema de Autenticación

### Registro
- Los usuarios se registran con nombre, email y contraseña
- El **primer usuario** se convierte automáticamente en **master** y queda aprobado
- Los siguientes usuarios quedan como **pending** hasta ser aprobados

### Roles
- **master**: Acceso total, puede aprobar usuarios
- **admin**: Administrador
- **ops**: Operaciones
- **sales**: Ventas
- **founder**: Founder
- **pending**: Pendiente de aprobación

### Flujo
1. Usuario se registra → `approved=false`, `rol='pending'`
2. Redirige a `/pending`
3. Master aprueba en `/usuarios`
4. Usuario puede acceder al dashboard

## 🏢 Sucursales

Las 4 sucursales están predefinidas (no editables desde UI):
- **OPGYE001** - Operaciones Guayaquil
- **OPUIO001** - Operaciones Quito
- **OPSIC001** - Operaciones Sierra Centro
- **OPCOS001** - Operaciones Costa Sur

## 🚛 Módulo de Viajes

- **Estados**: cotizado, asignado, en_ruta, entregado
- **Campos visibles para todos**: cliente, origen, destino, fecha, estado, tarifa_cliente, notas
- **Campos solo master**: costo_proveedor, margen, notas_internas

## 📊 KPIs Dinámicos

Los KPIs se calculan dinámicamente desde la base de datos:
- **Viajes Activos**: estado in ('asignado', 'en_ruta')
- **Viajes para Hoy**: fecha = hoy (timezone America/Guayaquil)
- **En Ruta**: estado = 'en_ruta'
- **Entregados Hoy**: estado = 'entregado' y delivered_at = hoy

## 🗺️ Mapa Mapbox

- Centrado en Ecuador
- Markers por viaje activo
- Actualización en tiempo real vía Supabase Realtime
- Requiere `NEXT_PUBLIC_MAPBOX_TOKEN`

## 📍 Tracking GPS

### Generar token de tracking:
```typescript
import { generateTrackingToken } from '@/lib/tracking'
const token = await generateTrackingToken(tripId)
const url = `/track/${token}`
```

### Página pública `/track/[token]`:
- No requiere autenticación
- Valida token activo y no expirado
- Usa `navigator.geolocation.watchPosition`
- Envía ubicación cada 5 segundos a `trip_locations`

### Dashboard:
- Suscripción Supabase Realtime a `trip_locations`
- Mueve markers en tiempo real
- Muestra última señal, precisión, velocidad

## 🔒 Seguridad

- **Middleware**: Protege todas las rutas excepto `/login`, `/register`, `/track/[token]`
- **RLS**: Row Level Security en Supabase
- **Aprobación**: Usuarios no aprobados solo pueden ver `/pending`
- **Master only**: `/usuarios` solo accesible para master

## 🎨 Diseño

- **Sidebar**: Azul oscuro (#0B1B2B)
- **Fondo**: Oscuro elegante (#0F172A)
- **Acento**: Naranja (#F97316)
- **Cards**: Rounded-2xl
- **Transiciones**: Suaves y profesionales

## 📝 Notas Importantes

1. **Primer usuario = Master**: El primer usuario registrado se convierte automáticamente en master
2. **Sucursales fijas**: No se pueden crear/editar desde UI
3. **KPIs dinámicos**: No hay valores hardcodeados, todo se calcula desde DB
4. **Tracking tokens**: Expiran en 7 días
5. **Timezone**: Los cálculos de "hoy" usan America/Guayaquil

## 🚧 Próximas Mejoras

- [ ] Módulo de clientes completo
- [ ] Módulo de transportistas completo
- [ ] Geocodificación de direcciones
- [ ] Notificaciones push
- [ ] Reportes y exportación
- [ ] Integración con APIs de transporte

## 📄 Licencia

Privado - OPERIUM
