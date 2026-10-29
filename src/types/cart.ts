// @defx/storefront-core

/** A single customization applied to a line item. */
export interface Customization {
  id: string | number;
  value: string;
  product_customization_id?: string | number;
}

/** The shape of the line_itemable object (product/variant reference). */
export interface LineItemable {
  id?: string | number;
  name?: string;
  sku?: string;
  price?: number;
  display_price?: string;
  [key: string]: unknown;
}

/** A line item inside a Cart. */
export interface LineItem {
  id: string | number;
  quantity: number;
  line_itemable: LineItemable;
  line_items_customizations?: Customization[];
  variant_id?: string | number;
  [key: string]: unknown;
}

/**
 * Payload used when creating or updating a line item.
 * Sent to POST /api/line_items or PUT /api/line_items/:id
 */
export interface LineItemPayload {
  line_itemable_id: string | number;
  quantity: number;
  line_items_customizations?: Customization[];
  cart_id?: string | number;
  region_id?: string | number;
}

/** A sales channel associated with a cart. */
export interface CartSalesChannel {
  id?: string | number;
  name?: string;
  [key: string]: unknown;
}

/** The full Cart object returned by the Defx storefront API. */
export interface Cart {
  id: string | number;
  number: string;
  total: number;
  display_total: string;
  item_total: number;
  ship_total: number;
  tax_total: number;
  promo_total: number;
  adjustment_total: number;
  item_count: number;
  currency: string;
  email?: string;
  line_items: LineItem[];
  state: string;
  payment_state?: string | null;
  shipment_state?: string | null;
  cart_sales_channels?: CartSalesChannel[];
  order_type?: string;
  region_id?: string | number;
  display_item_total?: string;
  display_ship_total?: string;
  display_tax_total?: string;
  [key: string]: any;
}
