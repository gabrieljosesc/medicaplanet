-- Align categories with Product Master File V07 (sheet Category column) + peptides hub + fallback.

insert into public.categories (slug, name, description, sort_order) values
  ('rheumatology', 'Rheumatology', 'Inflammatory and rheumatic disease therapies for specialist use.', 10),
  ('ophthalmology', 'Ophthalmology', 'Ophthalmic preparations and related professional-use products.', 20),
  ('skincare', 'Skincare', 'Topical and professional skincare.', 30),
  ('peels-and-masks', 'Peels and Masks', 'Professional peels, masks, and resurfacing protocols.', 40),
  ('dermal-fillers', 'Dermal fillers', 'Hyaluronic acid and related injectable fillers.', 50),
  ('botulinum-toxins', 'Botulinum toxins', 'Neuromodulators for licensed aesthetic and therapeutic use.', 60),
  ('gynecology', 'Gynecology', 'Gynecological and related professional products.', 70),
  ('body-sculpting', 'Body sculpting', 'Body contouring and sculpting solutions for licensed practice.', 80),
  ('osteoporosis', 'Osteoporosis', 'Osteoporosis-related injectable and adjunct therapies.', 90),
  ('fat-removal', 'Fat removal', 'Lipolytic and fat-reduction technologies where licensed and indicated.', 100),
  ('mesotherapy', 'Mesotherapy', 'Mesotherapy and skin-quality solutions.', 110),
  ('orthopedic-injections', 'Orthopedic injections', 'Viscosupplementation and joint-care injectables.', 120),
  ('dermal-filler-removal', 'Dermal filler removal', 'Hyaluronidase and related agents for filler reversal.', 130),
  ('anaesthetics', 'Anaesthetics', 'Local and topical anaesthetics for professional use.', 140),
  ('weight-loss', 'Weight loss', 'Anti-obesity and weight-management pharmaceuticals.', 150),
  ('cannulas-and-needles', 'Cannulas and needles', 'Cannulas, needles, and injection accessories.', 160),
  ('asthma', 'Asthma', 'Respiratory therapies supplied through professional channels.', 170),
  ('threads', 'Threads', 'PDO and lifting threads for licensed practitioners.', 180),
  ('eyelash-enhancers', 'Eyelash enhancers', 'Eyelash growth and enhancement formulations.', 190),
  ('prp-kits', 'PRP kits', 'Platelet-rich plasma preparation kits and accessories.', 200),
  ('peptides', 'Peptides', 'Research-use peptide compounds — descriptions for professional reference; verify local regulations.', 205),
  ('other', 'Other', 'Additional professional products not mapped to a specific therapeutic area.', 999)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- Legacy seeds used slug "botulinum" / "orthopaedics"; move products then drop old rows.
do $$
declare
  old_bot uuid;
  new_bot uuid;
  old_orth uuid;
  new_orth uuid;
begin
  select id into old_bot from public.categories where slug = 'botulinum' limit 1;
  select id into new_bot from public.categories where slug = 'botulinum-toxins' limit 1;
  if old_bot is not null and new_bot is not null and old_bot <> new_bot then
    update public.products set category_id = new_bot where category_id = old_bot;
  end if;

  select id into old_orth from public.categories where slug = 'orthopaedics' limit 1;
  select id into new_orth from public.categories where slug = 'orthopedic-injections' limit 1;
  if old_orth is not null and new_orth is not null and old_orth <> new_orth then
    update public.products set category_id = new_orth where category_id = old_orth;
  end if;

  delete from public.categories where slug in ('botulinum', 'orthopaedics');
end $$;
