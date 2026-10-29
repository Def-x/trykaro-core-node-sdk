// @defx/storefront-core

export interface GtmConfig {
  enabled: boolean;
  gtmContainerId?: string | null;
  ga4MeasurementId?: string | null;
}

export interface MetaPixelConfig {
  enabled: boolean;
  pixelId?: string | null;
  enabledEvents?: string[];
}

export interface GtmItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity: number;
}

export interface GtmMeta {
  country?: string;
  device?: string;
  platform?: string;
  source?: string;
  [key: string]: unknown;
}
