-- Extra registration fields for licensed professional buyers

alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists delivery_address text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists postal_code text;
alter table public.profiles add column if not exists profession text;
alter table public.profiles add column if not exists license_number text;
alter table public.profiles add column if not exists license_expiry date;

-- Build display name from signup metadata when present
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fn text := new.raw_user_meta_data->>'first_name';
  ln text := new.raw_user_meta_data->>'last_name';
  combined text;
begin
  combined := trim(concat_ws(' ', nullif(trim(fn), ''), nullif(trim(ln), '')));
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(combined, ''), new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
