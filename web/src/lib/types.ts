export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category_id: string | null;
  sku: string | null;
  variant_product_id: number | null;
  base_price: number;
  currency: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  is_featured: boolean;
};

import type { PriceTierRow } from "@/lib/price-tiers";

export type CartLine = {
  slug: string;
  title: string;
  unitPrice: number;
  quantity: number;
  selected?: boolean;
  currency?: string;
  /** When set, cart qty changes recompute unitPrice from tiers. */
  priceTiers?: PriceTierRow[];
};
