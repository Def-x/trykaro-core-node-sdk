// @defx/storefront-core

export interface Region {
  id?: string | number;
  name?: string;
  currency?: string;
  locale?: string;
  currency_symbol?: string;
  invoice_setting?: { currency_symbol?: string };
  payment_gateway?: string;
  payment_config?: Record<string, any>;
  [key: string]: any;
}

export interface StorefrontConfig {
  storeId?: string;
  orgId?: string;
  apiBaseUrl?: string;
  regionId?: string | null;
  currency?: string;
  locale?: string;
  authType?: 'clerk' | 'own';
  countryCode?: string;
  otpLength?: number;
  termsUrl?: string;
  privacyUrl?: string;
  refundUrl?: string;
  returnUrl?: string;
  isRegion?: boolean;
  activeRegion?: Region | null;
  region?: Region | null;
  primaryColor?: string;
  secondaryColor?: string;
  posthogDeveloperToken?: string;
  posthogDeveloperHost?: string;
  enablePosthogInDev?: boolean;
  [key: string]: any;
}
