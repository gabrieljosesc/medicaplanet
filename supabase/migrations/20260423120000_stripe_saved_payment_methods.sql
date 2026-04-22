-- Saved cards via Stripe (store payment method id + display metadata only; no raw PAN/CVV)

alter table public.profiles
  add column if not exists stripe_customer_id text;

create table if not exists public.user_payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_payment_method_id text not null,
  brand text,
  last4 text not null,
  exp_month int,
  exp_year int,
  name_on_card text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, stripe_payment_method_id)
);

create index if not exists user_payment_methods_user_id_idx on public.user_payment_methods (user_id);

alter table public.orders
  add column if not exists payment_card_snapshot jsonb,
  add column if not exists user_payment_method_id uuid references public.user_payment_methods (id) on delete set null;

alter table public.user_payment_methods enable row level security;

drop policy if exists "user_payment_methods_select_own" on public.user_payment_methods;
create policy "user_payment_methods_select_own" on public.user_payment_methods
  for select using (user_id = auth.uid());

drop policy if exists "user_payment_methods_insert_own" on public.user_payment_methods;
create policy "user_payment_methods_insert_own" on public.user_payment_methods
  for insert with check (user_id = auth.uid());

drop policy if exists "user_payment_methods_update_own" on public.user_payment_methods;
create policy "user_payment_methods_update_own" on public.user_payment_methods
  for update using (user_id = auth.uid());

drop policy if exists "user_payment_methods_delete_own" on public.user_payment_methods;
create policy "user_payment_methods_delete_own" on public.user_payment_methods
  for delete using (user_id = auth.uid());
