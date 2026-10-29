// @defx/storefront-core

/** Basic taxonomy / category representation. */
export interface Taxon {
  id: string | number;
  name: string;
  permalink?: string;
  pretty_name?: string;
  taxonomy_id?: string | number;
  description?: string | null;
  position?: number;
  icon?: string | null;
  [key: string]: unknown;
}

/** Product variant option value (e.g. Size: "M", Color: "Red"). */
export interface OptionValue {
  id: string | number;
  name?: string;
  presentation?: string;
  [key: string]: unknown;
}

/** Product variant option type (e.g. "Size", "Color"). */
export interface OptionType {
  id: string | number;
  name: string;
  presentation?: string;
  position?: number;
  [key: string]: unknown;
}

/** Variant option dimension binding. */
export interface VariantOption {
  option_type: OptionType;
  option_value: OptionValue;
  variant?: { id: string | number };
  [key: string]: unknown;
}

/** An image attached to a product or variant. */
export interface ProductImage {
  id: string | number;
  product_image_url?: string;
  product_video_url?: string;
  position?: number;
  alt?: string | null;
  [key: string]: unknown;
}

/** Selling quantity rules (e.g. increments of 0.5m for fabric). */
export interface SellingQuantity {
  id?: string | number;
  name?: string;
  values?: Array<{ label?: string; value?: string | number }>;
  [key: string]: unknown;
}

/** A single variant of a product. */
export interface ProductVariant {
  id: string | number;
  sku?: string;
  price?: number;
  display_price?: string;
  in_stock?: boolean;
  purchasable?: boolean;
  is_master?: boolean;
  product_images?: ProductImage[];
  variant_options?: VariantOption[];
  selling_quantity?: SellingQuantity;
  [key: string]: unknown;
}

/** Complete Product entity returned by the Defx storefront API. */
export interface Product {
  id: string | number;
  name: string;
  description?: string;
  slug?: string;
  price?: number;
  display_price?: string;
  sku?: string;
  taxons?: Taxon[];
  variants?: ProductVariant[];
  master_variant?: ProductVariant;
  product_images?: ProductImage[];
  selling_quantity?: SellingQuantity;
  in_stock?: boolean;
  purchasable?: boolean;
  meta_title?: string;
  meta_description?: string;
  [key: string]: unknown;
}

