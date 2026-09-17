-- Sitewide 5% sale — applied to the live medicaplanet DB on 2026-09-18.
-- Temporary: restore original prices (see bottom) when the client ends the sale.
-- Both base_price and every quantity tier price are reduced 5% and rounded to
-- whole numbers. Products at $0 ("Request pricing") are left untouched.
-- The pre-sale prices are preserved in table products_price_backup_20260918.

-- ── 0) Back up current (pre-sale) prices ────────────────────────────────────
drop table if exists products_price_backup_20260918;
create table products_price_backup_20260918 as
select id, title, base_price, price_tiers, now() as backed_up_at from products;

-- ── 1) Apply the sale: -5%, rounded to whole numbers ────────────────────────
begin;

update products set base_price = round(base_price * 0.95, 0) where base_price > 0;

update products p
set price_tiers = t.new_tiers
from (
  select pr.id,
         jsonb_agg(
           jsonb_set(elem, '{price}', to_jsonb(round((elem->>'price')::numeric * 0.95, 0)))
           order by ord
         ) as new_tiers
  from products pr,
       lateral jsonb_array_elements(pr.price_tiers) with ordinality as e(elem, ord)
  where jsonb_typeof(pr.price_tiers) = 'array' and jsonb_array_length(pr.price_tiers) > 0
  group by pr.id
) t
where p.id = t.id;

commit;

-- ── 2) END OF SALE — restore original prices ────────────────────────────────
-- Run ONLY this block when the client says to end the sale:
--
-- update products p
-- set base_price = b.base_price, price_tiers = b.price_tiers
-- from products_price_backup_20260918 b
-- where b.id = p.id;
