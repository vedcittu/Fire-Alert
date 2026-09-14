-- FireAlert database schema
-- Run this in the Supabase SQL editor for the target project.

create extension if not exists "pgcrypto";

create table if not exists public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'stable',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null check (role in ('student', 'faculty', 'admin', 'rescue')),
  building text,
  department text,
  created_at timestamptz not null default now()
);

create table if not exists public.sensor_nodes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  location text not null,
  building_id uuid references public.buildings(id) on delete set null,
  status text not null default 'online' check (status in ('online', 'offline')),
  temperature_c double precision not null default 0,
  humidity_pct double precision not null default 0,
  smoke_level text not null default 'normal',
  flame_detected boolean not null default false,
  ir_detected boolean not null default false,
  load_pct double precision,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  building_id uuid references public.buildings(id) on delete set null,
  node_id uuid references public.sensor_nodes(id) on delete set null,
  severity text not null check (severity in ('safe', 'warning', 'emergency', 'critical')),
  status text not null check (status in ('open', 'acknowledged', 'responding', 'on_site', 'resolved')) default 'open',
  created_at timestamptz not null default now()
);

create index if not exists idx_sensor_nodes_building_id
  on public.sensor_nodes(building_id);

create index if not exists idx_sensor_nodes_updated_at
  on public.sensor_nodes(updated_at desc);

create index if not exists idx_alerts_status_created_at
  on public.alerts(status, created_at desc);

create index if not exists idx_alerts_building_id
  on public.alerts(building_id);

create index if not exists idx_alerts_node_id
  on public.alerts(node_id);

create index if not exists idx_buildings_status
  on public.buildings(status);
