-- Coupon / promo codes
-- discount_type: 'percent' (0–100) or 'fixed' (USD amount)

create table if not exists public.coupons (
  id            uuid primary key default gen_random_uuid(),
  code          text not null,
  description   text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  min_order_amount numeric(10,2) default 0,
  max_uses      int,            -- null = unlimited
  used_count    int not null default 0,
  expires_at    timestamptz,    -- null = never expires
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create unique index if not exists coupons_code_upper_idx
  on public.coupons (upper(code));

-- Store applied coupon info on orders
alter table public.orders
  add column if not exists coupon_code     text,
  add column if not exists discount_amount numeric(10,2) default 0;

comment on table public.coupons is 'Admin-managed promo / coupon codes.';
comment on column public.coupons.discount_type is 'percent = percentage off subtotal; fixed = fixed USD amount off.';
comment on column public.orders.coupon_code is 'Coupon code applied at checkout, if any.';
comment on column public.orders.discount_amount is 'Dollar amount discounted by the coupon.';
