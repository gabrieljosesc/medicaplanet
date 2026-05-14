-- Enable Realtime push for cart_items so a cart change on one device
-- updates other devices for the same logged-in user within ~1s.
-- `REPLICA IDENTITY FULL` so delete events include the old row.

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end
$$;

alter publication supabase_realtime add table public.cart_items;
alter table public.cart_items replica identity full;
