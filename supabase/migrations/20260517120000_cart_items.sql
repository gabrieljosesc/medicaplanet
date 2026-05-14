-- Persistent shopping cart shared across devices for the same logged-in user.
-- Owned exclusively by the user row (RLS enforced). Guests still use localStorage.

create table if not exists public.cart_items (
  user_id      uuid        not null references auth.users(id) on delete cascade,
  slug         text        not null,
  title        text        not null,
  unit_price   numeric(12,2) not null default 0,
  currency     text        not null default 'USD',
  quantity     integer     not null check (quantity > 0),
  selected     boolean     not null default true,
  image_src    text,
  price_tiers  jsonb       not null default '[]'::jsonb,
  updated_at   timestamptz not null default now(),
  primary key (user_id, slug)
);

create index if not exists cart_items_user_updated_idx
  on public.cart_items (user_id, updated_at desc);

alter table public.cart_items enable row level security;

-- Each authenticated user can read / write only their own cart rows.
drop policy if exists "cart_items_self_select" on public.cart_items;
create policy "cart_items_self_select"
  on public.cart_items for select
  using (auth.uid() = user_id);

drop policy if exists "cart_items_self_insert" on public.cart_items;
create policy "cart_items_self_insert"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "cart_items_self_update" on public.cart_items;
create policy "cart_items_self_update"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cart_items_self_delete" on public.cart_items;
create policy "cart_items_self_delete"
  on public.cart_items for delete
  using (auth.uid() = user_id);
