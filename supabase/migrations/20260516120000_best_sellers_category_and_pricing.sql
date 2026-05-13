-- Best sellers category, reorder Orthopedic injections below Rheumatology, volume pricing for named SKUs.

-- New category: appears in global sort just before Dermal fillers (50); header pin order is set in app code.
insert into public.categories (slug, name, description, sort_order)
values (
  'best-sellers',
  'Best sellers',
  'Featured best-selling products.',
  48
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- Place Orthopedic injections immediately after Rheumatology (10) and before Ophthalmology (20).
update public.categories
set sort_order = 15
where slug = 'orthopedic-injections';

-- Volume tiers: base_price = entry tier (qty 1–10); price_tiers JSON uses minQ/maxQ/price.

-- Botox cosmetic 100 u
update public.products
set
  base_price = 510,
  price_tiers = '[{"minQ":1,"maxQ":10,"price":510},{"minQ":11,"maxQ":1000,"price":495}]'::jsonb,
  updated_at = now()
where is_active = true
  and lower(title) like '%botox%'
  and lower(title) like '%cosmetic%'
  and (lower(title) like '%100u%' or lower(title) like '%100 u%' or lower(title) like '%100 unit%');

-- Botox polish 100 u
update public.products
set
  base_price = 379,
  price_tiers = '[{"minQ":1,"maxQ":10,"price":379},{"minQ":11,"maxQ":1000,"price":369}]'::jsonb,
  updated_at = now()
where is_active = true
  and lower(title) like '%botox%'
  and lower(title) like '%polish%';

-- Botox non english 100 u
update public.products
set
  base_price = 379,
  price_tiers = '[{"minQ":1,"maxQ":10,"price":379},{"minQ":11,"maxQ":1000,"price":369}]'::jsonb,
  updated_at = now()
where is_active = true
  and lower(title) like '%botox%'
  and (
    lower(title) like '%non-english%'
    or lower(title) like '%non english%'
    or lower(title) like '%nonenglish%'
    or lower(title) like '%jednot%'
  )
  and lower(title) not like '%polish%';

-- Juvederm Ultra Plus XC
update public.products
set
  base_price = 479,
  price_tiers = '[{"minQ":1,"maxQ":10,"price":479},{"minQ":11,"maxQ":1000,"price":469}]'::jsonb,
  updated_at = now()
where is_active = true
  and lower(title) like '%juvederm%'
  and lower(title) like '%ultra%plus%'
  and lower(title) like '%xc%';

-- Juvederm Plus XC (exclude Ultra Plus)
update public.products
set
  base_price = 479,
  price_tiers = '[{"minQ":1,"maxQ":10,"price":479},{"minQ":11,"maxQ":1000,"price":469}]'::jsonb,
  updated_at = now()
where is_active = true
  and lower(title) like '%juvederm%'
  and lower(title) like '%plus%'
  and lower(title) like '%xc%'
  and lower(title) not like '%ultra%plus%';

-- Disport 500 up 2 vials
update public.products
set
  base_price = 999,
  price_tiers = '[{"minQ":1,"maxQ":10,"price":999},{"minQ":11,"maxQ":1000,"price":979}]'::jsonb,
  updated_at = now()
where is_active = true
  and lower(title) like '%disport%'
  and lower(title) like '%500%'
  and lower(title) like '%2%'
  and lower(title) like '%vial%';

-- Botox 100 u (default English / standard listing; excludes variants handled above and other toxins)
update public.products
set
  base_price = 399,
  price_tiers = '[{"minQ":1,"maxQ":10,"price":399},{"minQ":11,"maxQ":1000,"price":389}]'::jsonb,
  updated_at = now()
where is_active = true
  and lower(title) like '%botox%'
  and (
    lower(title) like '%100u%'
    or lower(title) like '%100 u%'
    or lower(title) like '%100 unit%'
  )
  and lower(title) not like '%cosmetic%'
  and lower(title) not like '%polish%'
  and lower(title) not like '%non-english%'
  and lower(title) not like '%non english%'
  and lower(title) not like '%nonenglish%'
  and lower(title) not like '%jednot%'
  and lower(title) not like '%xeomin%'
  and lower(title) not like '%dysport%'
  and lower(title) not like '%bocouture%'
  and lower(title) not like '%nabota%';
