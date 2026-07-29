-- Regulatory badges shown on product cards/detail (mirrors medicadepot).
-- Populated from a reviewed match sheet; admins can toggle per product.

alter table public.products add column if not exists fda_approved boolean not null default false;
alter table public.products add column if not exists ce_marked boolean not null default false;
