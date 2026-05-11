-- Manual storefront pricing (May 2026). Matches products by title substring (case-insensitive).
-- Clears price_tiers so quantity tiers do not override base_price.

update public.products
set
  base_price = 90,
  price_tiers = '[]'::jsonb,
  updated_at = now()
where is_active = true
  and lower(title) like '%orthovisc%';

update public.products
set
  base_price = 340,
  price_tiers = '[]'::jsonb,
  updated_at = now()
where is_active = true
  and lower(title) like '%euflexxa%';

update public.products
set
  base_price = 280,
  price_tiers = '[]'::jsonb,
  updated_at = now()
where is_active = true
  and lower(title) like '%durolane%';

update public.products
set
  base_price = 525,
  price_tiers = '[]'::jsonb,
  updated_at = now()
where is_active = true
  and lower(title) like '%sculptra%';
