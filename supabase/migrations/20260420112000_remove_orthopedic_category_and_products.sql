do $$
declare
  orth_ids uuid[];
begin
  select coalesce(array_agg(id), '{}')::uuid[]
  into orth_ids
  from public.categories
  where slug in ('orthopedic-injections', 'orthopaedics');

  if array_length(orth_ids, 1) is not null then
    delete from public.products
    where category_id = any(orth_ids);

    delete from public.categories
    where id = any(orth_ids);
  end if;
end $$;

