-- Manual saved cards (encrypted PAN in app; never store CVV).
-- Replaces Stripe-based user_payment_methods from 20260423120000.

alter table public.orders add column if not exists payment_card_snapshot jsonb;

alter table public.orders drop column if exists user_payment_method_id;

drop table if exists public.user_payment_methods cascade;

alter table public.profiles drop column if exists stripe_customer_id;

create table if not exists public.user_saved_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name_on_card text not null,
  brand text,
  last4 text not null,
  exp_month smallint not null check (exp_month between 1 and 12),
  exp_year smallint not null check (exp_year between 2020 and 2100),
  pan_encrypted text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists user_saved_cards_user_id_idx on public.user_saved_cards (user_id);

alter table public.user_saved_cards enable row level security;

drop policy if exists "user_saved_cards_select_own" on public.user_saved_cards;
create policy "user_saved_cards_select_own" on public.user_saved_cards
  for select using (user_id = auth.uid());

drop policy if exists "user_saved_cards_insert_own" on public.user_saved_cards;
create policy "user_saved_cards_insert_own" on public.user_saved_cards
  for insert with check (user_id = auth.uid());

drop policy if exists "user_saved_cards_update_own" on public.user_saved_cards;
create policy "user_saved_cards_update_own" on public.user_saved_cards
  for update using (user_id = auth.uid());

drop policy if exists "user_saved_cards_delete_own" on public.user_saved_cards;
create policy "user_saved_cards_delete_own" on public.user_saved_cards
  for delete using (user_id = auth.uid());
