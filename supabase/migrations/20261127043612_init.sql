-- Cria perfil, vendas e gastos vinculados a cada conta autenticada.
-- A segurança principal é o RLS: cada operação é limitada por auth.uid().

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  retirement_goal numeric(12,2) not null default 0 check (retirement_goal >= 0),
  retirement_saved numeric(12,2) not null default 0 check (retirement_saved >= 0),
  created_at timestamptz not null default now()
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null check (category in ('ostra', 'caranguejo', 'peixe', 'marisco', 'sururu', 'outros')),
  buyer text not null default '',
  quantity numeric(12,3) not null check (quantity > 0),
  unit text not null check (unit in ('dz', 'kg')),
  value numeric(12,2) not null check (value > 0),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('pesca', 'casa')),
  category text not null,
  description text not null default '',
  value numeric(12,2) not null check (value > 0),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint expenses_category_matches_kind check (
    (kind = 'pesca' and category in ('combustivel', 'transporte', 'gelo', 'equipamentos', 'manutencao', 'iscas', 'outros'))
    or
    (kind = 'casa' and category in ('alimentacao', 'moradia', 'saude', 'educacao', 'lazer', 'outros'))
  )
);

create index sales_user_occurred_at_idx
  on public.sales (user_id, occurred_at desc);
create index expenses_user_occurred_at_idx
  on public.expenses (user_id, occurred_at desc);

alter table public.profiles enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy profiles_delete_own on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);

create policy sales_select_own on public.sales
  for select to authenticated using ((select auth.uid()) = user_id);
create policy sales_insert_own on public.sales
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy sales_update_own on public.sales
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy sales_delete_own on public.sales
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy expenses_select_own on public.expenses
  for select to authenticated using ((select auth.uid()) = user_id);
create policy expenses_insert_own on public.expenses
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy expenses_update_own on public.expenses
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy expenses_delete_own on public.expenses
  for delete to authenticated using ((select auth.uid()) = user_id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
