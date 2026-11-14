-- Execute no SQL Editor do seu projeto Supabase.
create extension if not exists pgcrypto;

create table if not exists public.houses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  instagram text not null unique,
  city text not null check (char_length(city) between 1 and 60),
  state char(2) not null,
  points integer not null default 10 check (points >= 0),
  level integer not null default 1 check (level between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.houses enable row level security;

-- Qualquer visitante pode ver as casas públicas.
create policy "Public can read houses"
on public.houses for select
to anon, authenticated
using (true);

-- Cadastro público: permite inserir somente uma casa inicial.
create policy "Public can register a house"
on public.houses for insert
to anon, authenticated
with check (points = 10 and level = 1);

-- Não habilite UPDATE público em produção sem autenticação/controle de propriedade.
-- A evolução de casas deverá ser feita por função segura (RPC) após adicionar login.
