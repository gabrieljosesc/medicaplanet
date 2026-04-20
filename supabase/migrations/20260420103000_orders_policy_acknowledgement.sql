alter table public.orders
  add column if not exists policy_acknowledged_at timestamptz,
  add column if not exists policy_acknowledgement jsonb;

