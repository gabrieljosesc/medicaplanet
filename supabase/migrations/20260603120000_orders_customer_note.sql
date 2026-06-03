-- Customer-visible note that admin can write on an order (shown to the customer on their order page)
alter table public.orders
  add column if not exists customer_visible_note text;

comment on column public.orders.customer_visible_note is
  'Admin-written note shown to the customer on their order detail page.';
