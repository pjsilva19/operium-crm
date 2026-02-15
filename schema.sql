-- =====================================================
-- OPERIUM CRM - Schema inicial
-- =====================================================

-- Extensión para UUID
create extension if not exists "uuid-ossp";

-- =====================================================
-- SUCURSALES (catálogo fijo)
-- =====================================================
create table if not exists public.sucursales (
  id uuid primary key default uuid_generate_v4(),
  codigo text unique not null,
  nombre text not null,
  created_at timestamp with time zone default now()
);

insert into public.sucursales (codigo, nombre) values
('OPGYE001','Operaciones Guayaquil'),
('OPUIO001','Operaciones Quito'),
('OPSIC001','Operaciones Sierra Centro'),
('OPCOS001','Operaciones Costa Sur')
on conflict (codigo) do nothing;


-- =====================================================
-- PROFILES (extiende auth.users)
-- =====================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  email text,
  rol text default 'pending', -- master | admin | ops | sales | pending
  approved boolean default false,
  sucursal_id uuid references public.sucursales(id),
  created_at timestamp with time zone default now()
);

-- Auto-crear profile al registrarse en Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, nombre, email)
  values (new.id, new.raw_user_meta_data->>'nombre', new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


-- =====================================================
-- PRIMER USUARIO = MASTER AUTOMÁTICO
-- =====================================================
create or replace function public.set_first_user_master()
returns trigger
language plpgsql
as $$
begin
  if not exists (select 1 from public.profiles where rol='master') then
    new.rol := 'master';
    new.approved := true;
  end if;
  return new;
end;
$$;

drop trigger if exists first_user_master_trigger on public.profiles;

create trigger first_user_master_trigger
before insert on public.profiles
for each row execute function public.set_first_user_master();


-- =====================================================
-- VIAJES
-- =====================================================
create table if not exists public.viajes (
  id uuid primary key default uuid_generate_v4(),
  sucursal_id uuid references public.sucursales(id),
  cliente text,
  origen text,
  destino text,
  fecha date,
  estado text, -- cotizado | asignado | en_ruta | entregado
  tarifa_cliente numeric,
  costo_proveedor numeric,
  margen numeric,
  notas text,
  notas_internas text,
  delivered_at timestamp,
  created_at timestamp with time zone default now()
);


-- =====================================================
-- TRACKING GPS
-- =====================================================
create table if not exists public.trip_locations (
  id bigserial primary key,
  trip_id uuid references public.viajes(id) on delete cascade,
  lat numeric,
  lng numeric,
  speed numeric,
  accuracy numeric,
  recorded_at timestamp with time zone default now()
);


-- =====================================================
-- RLS (seguridad básica)
-- =====================================================
alter table public.profiles enable row level security;
alter table public.viajes enable row level security;
alter table public.trip_locations enable row level security;

-- profiles: cada usuario solo ve su propio profile
create policy "profile self access"
on public.profiles
for select using (auth.uid() = id);

-- viajes: usuarios autenticados pueden ver (luego filtramos por sucursal desde app)
create policy "authenticated viajes select"
on public.viajes
for select using (auth.role() = 'authenticated');

-- tracking: usuarios autenticados pueden ver
create policy "authenticated tracking select"
on public.trip_locations
for select using (auth.role() = 'authenticated');
