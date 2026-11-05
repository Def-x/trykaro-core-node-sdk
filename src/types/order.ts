// @defx/storefront-core

import type { LineItem } from "./cart";

/** A physical user address (shipping or billing). */
export interface Address {
  id: string | number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state_name?: string;
  state_code?: string;
  country_name?: string;
  country_iso?: string;
  zipcode?: string;
  phone?: string;
  is_default?: boolean;
  [key: string]: unknown;
}

/** Payment record associated with an order or checkout. */
export interface OrderPayment {
  id: string | number;
  amount?: number;
  state?: string;
  payment_method?: string;
  created_at?: string;
  [key: string]: unknown;
}

/** Complete Order entity returned by the Defx storefront API. */
export interface Order {
  id: string | number;
  number: string;
  state: string;
  total: number;
  display_total: string;
  item_total: number;
  ship_total: number;
  tax_total: number;
  promo_total: number;
  currency: string;
  email?: string;
  line_items: LineItem[];
  shipping_address?: Address;
  billing_address?: Address;
  payments?: OrderPayment[];
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

