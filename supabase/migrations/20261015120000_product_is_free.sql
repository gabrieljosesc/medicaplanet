-- Complimentary items (e.g. freebies with peptide orders) show "FREE" instead of
-- "Request pricing" and stay addable to cart. base_price = 0 alone means "request pricing".

alter table public.products add column if not exists is_free boolean not null default false;
