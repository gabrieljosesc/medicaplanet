-- Shipping line on orders: first order $0, returning customers flat Priority Shipping (see app).

alter table public.orders
  add column if not exists shipping_amount numeric(12, 2) not null default 0;

alter table public.orders
  add column if not exists shipping_label text;

comment on column public.orders.shipping_amount is 'USD shipping charged for this order (0 for first-order promo).';
comment on column public.orders.shipping_label is 'Display label, e.g. Priority Shipping or complimentary first order.';
