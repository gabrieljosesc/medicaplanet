-- Admin can request updated payment details for an order (e.g. card declined).
-- Set when admin clicks "Request updated payment"; cleared when the customer
-- submits a new card for the order.

alter table public.orders add column if not exists payment_update_requested_at timestamptz;
