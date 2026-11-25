// @defx/storefront-core
// src/types/loyalty.ts

export interface LoyaltyCustomer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  available_points: number;
  monetary_value_inr: number;
  points_name: string;
  total_earned: number;
  total_redeemed: number;
  total_expired: number;
  total_reversed: number;
  referral_code: string;
  referral_link: string;
  tier?: string;
  pending_points?: number;
  [key: string]: any;
}

export interface LoyaltyProfileResponse {
  success: boolean;
  customer?: LoyaltyCustomer;
  serverError?: string;
  message?: string;
  [key: string]: any;
}

export interface LoyaltyRewardItem {
  id: string | number;
  title: string;
  description?: string;
  points_required: number;
  discount_amount?: number;
  discount_type?: "percentage" | "fixed" | string;
  is_claimed?: boolean;
  code?: string;
  expires_at?: string;
  [key: string]: any;
}

export interface LoyaltyRewardsResponse {
  success: boolean;
  available_points: number;
  rewards: LoyaltyRewardItem[];
  serverError?: string;
  message?: string;
  [key: string]: any;
}

export interface ApplyLoyaltyPointsPayload {
  cart_id: string | number;
  points_to_use: number;
  region_id?: string | null;
}

export interface ApplyLoyaltyPointsResponse {
  success?: boolean;
  cart_id?: string | number;
  points_to_use?: number;
  discount_amount?: number;
  cart?: any;
  serverError?: string;
  message?: string;
  [key: string]: any;
}

export interface LoyaltyActivityItem {
  id: string | number;
  activity_name: string;
  reference_title?: string;
  date: string;
  points_delta: number;
  status: "Available" | "Redeemed" | "Expired" | "Pending" | string;
  expiry_date?: string;
  order_id?: string | number;
  type?: "earned" | "redeemed" | "expired" | "bonus" | "signup";
}

export interface LoyaltyExpiringBatch {
  id: string | number;
  batch_number: string;
  points: number;
  expiry_date: string;
  days_left: number;
  status: "expiring_soon" | "active" | "expired";
}

export interface LoyaltyTransactionMetadata {
  details?: any;
  rule_name?: string;
  event_type?: string;
  action_type?: string;
  [key: string]: any;
}

export interface LoyaltyTransaction {
  id: string;
  transaction_type: "earned" | "redeemed" | "expired" | string;
  points: number;
  status: "completed" | "pending" | "failed" | string;
  source_type: string;
  source_id?: string;
  created_at: string;
  metadata?: LoyaltyTransactionMetadata | null;
  [key: string]: any;
}

export interface LoyaltyTransactionsResponse {
  success: boolean;
  total_count: number;
  page: number;
  per_page: number;
  transactions: LoyaltyTransaction[];
  serverError?: string;
  message?: string;
  [key: string]: any;
}

export interface GetLoyaltyTransactionsParams {
  page?: number;
  per_page?: number;
  token?: string | null;
  config?: any;
  apiBaseUrl?: string;
  orgId?: string;
  headers?: Record<string, string>;
  [key: string]: any;
}

export interface LoyaltyEarnMethod {
  id: string;
  title: string;
  badge: string;
  badgeColor?: string;
  description: string;
  footerLeft: string;
  footerRight: string;
  actionType?: "shop" | "first_order" | "referral" | "birthday" | "review" | "tier";
  actionLabel?: string;
  claimed?: boolean;
  active?: boolean;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}


