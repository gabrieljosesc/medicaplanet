-- Human-readable order references: MP1000, MP1001, …

create sequence if not exists public.order_reference_seq
  start with 1000
  increment by 1
  no maxvalue
  cache 1;

alter table public.orders
  add column if not exists reference_number text;

create unique index if not exists orders_reference_number_idx
  on public.orders (reference_number)
  where reference_number is not null;

create or replace function public.assign_order_reference_number()
returns trigger
language plpgsql
as $$
begin
  if new.reference_number is null or new.reference_number = '' then
    new.reference_number := 'MP' || nextval('public.order_reference_seq')::text;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_assign_reference_number on public.orders;

create trigger orders_assign_reference_number
before insert on public.orders
for each row
execute function public.assign_order_reference_number();

comment on column public.orders.reference_number is 'Customer-facing order reference (e.g. MP1000). Assigned on insert.';
