-- Tiered wholesale prices from price list (JSON); base_price remains entry-tier unit for listings.
alter table public.products
  add column if not exists price_tiers jsonb not null default '[]'::jsonb;

update public.products
set price_tiers = '[]'::jsonb
where price_tiers is null;
