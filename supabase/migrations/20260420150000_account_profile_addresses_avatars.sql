-- Account area: profile extras, saved addresses, public avatar storage

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists gender text,
  add column if not exists date_of_birth date,
  add column if not exists notification_preferences jsonb not null default '{}'::jsonb,
  add column if not exists privacy_preferences jsonb not null default '{}'::jsonb;

create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text,
  line1 text not null,
  line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_addresses_user_id_idx on public.user_addresses (user_id);

alter table public.user_addresses enable row level security;

drop policy if exists "user_addresses_select_own" on public.user_addresses;
create policy "user_addresses_select_own" on public.user_addresses
  for select using (user_id = auth.uid());

drop policy if exists "user_addresses_insert_own" on public.user_addresses;
create policy "user_addresses_insert_own" on public.user_addresses
  for insert with check (user_id = auth.uid());

drop policy if exists "user_addresses_update_own" on public.user_addresses;
create policy "user_addresses_update_own" on public.user_addresses
  for update using (user_id = auth.uid());

drop policy if exists "user_addresses_delete_own" on public.user_addresses;
create policy "user_addresses_delete_own" on public.user_addresses
  for delete using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_user_insert" on storage.objects;
create policy "avatars_user_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "avatars_user_update" on storage.objects;
create policy "avatars_user_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "avatars_user_delete" on storage.objects;
create policy "avatars_user_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );
