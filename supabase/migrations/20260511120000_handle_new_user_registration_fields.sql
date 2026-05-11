-- Persist full registration on signup via trigger (security definer), so profile
-- columns are filled even when email confirmation leaves no session and the app's
-- RLS-gated UPDATE cannot run.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fn text := new.raw_user_meta_data->>'first_name';
  ln text := new.raw_user_meta_data->>'last_name';
  mf text := new.raw_user_meta_data->>'full_name';
  combined text;
  le text := new.raw_user_meta_data->>'license_expiry';
begin
  combined := trim(concat_ws(' ', nullif(trim(fn), ''), nullif(trim(ln), '')));
  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    first_name,
    last_name,
    phone,
    delivery_address,
    country,
    city,
    state,
    postal_code,
    profession,
    license_number,
    license_expiry
  )
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(mf), ''),
      nullif(combined, ''),
      split_part(new.email, '@', 1)
    ),
    'customer',
    nullif(trim(fn), ''),
    nullif(trim(ln), ''),
    nullif(trim(new.raw_user_meta_data->>'phone'), ''),
    nullif(trim(new.raw_user_meta_data->>'delivery_address'), ''),
    nullif(trim(new.raw_user_meta_data->>'country'), ''),
    nullif(trim(new.raw_user_meta_data->>'city'), ''),
    nullif(trim(new.raw_user_meta_data->>'state'), ''),
    nullif(trim(new.raw_user_meta_data->>'postal_code'), ''),
    nullif(trim(new.raw_user_meta_data->>'profession'), ''),
    nullif(trim(new.raw_user_meta_data->>'license_number'), ''),
    case
      when le is not null and le ~ '^\d{4}-\d{2}-\d{2}$' then le::date
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
