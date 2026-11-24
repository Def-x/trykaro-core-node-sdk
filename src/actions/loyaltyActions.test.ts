import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getLoyaltyProfileAction,
  getLoyaltyRewardsAction,
  getLoyaltyTransactionsAction,
  applyLoyaltyPointsAction,
} from "./loyaltyActions";
import { isLoyaltyMarketplaceActive } from "../hooks/useLoyalty";

describe("loyaltyActions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getLoyaltyProfileAction handles successful response", async () => {
    const mockProfile = {
      success: true,
      customer: {
        id: "c48048c5-27e6-4d35-a841-eabca8338b33",
        first_name: "Rahul",
        last_name: "mali",
        phone: "9001105203",
        available_points: 5600,
        monetary_value_inr: 4912.28,
        points_name: "Points",
        total_earned: 5600,
        total_redeemed: 0,
        total_expired: 0,
        total_reversed: 0,
        referral_code: "REF-338B33-6C9F",
        referral_link: "https://sbs.defx.store/signup?ref=REF-338B33-6C9F",
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockProfile,
    } as any);

    const result = await getLoyaltyProfileAction({
      apiBaseUrl: "https://mock.api",
      token: "mock-token",
    });

    expect(result.success).toBe(true);
    expect(result.customer?.available_points).toBe(5600);
    expect(result.customer?.referral_code).toBe("REF-338B33-6C9F");
  });

  it("getLoyaltyRewardsAction returns rewards array", async () => {
    const mockRewards = {
      success: true,
      available_points: 5600,
      rewards: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockRewards,
    } as any);

    const result = await getLoyaltyRewardsAction({
      apiBaseUrl: "https://mock.api",
      token: "mock-token",
    });

    expect(result.success).toBe(true);
    expect(result.available_points).toBe(5600);
    expect(Array.isArray(result.rewards)).toBe(true);
  });

  it("applyLoyaltyPointsAction posts points to checkout", async () => {
    const mockApplyResponse = {
      cart_id: "86e41bae-295f-4e74-acdf-4a8d69ecc012",
      points_to_use: 100,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockApplyResponse,
    } as any);

    const result = await applyLoyaltyPointsAction(
      {
        cart_id: "86e41bae-295f-4e74-acdf-4a8d69ecc012",
        points_to_use: 100,
      },
      {
        apiBaseUrl: "https://mock.api",
        token: "mock-token",
      },
    );

    expect(result.cart_id).toBe("86e41bae-295f-4e74-acdf-4a8d69ecc012");
    expect(result.points_to_use).toBe(100);
  });

  it("getLoyaltyTransactionsAction returns transactions list and pagination", async () => {
    const mockTransactionsResponse = {
      success: true,
      total_count: 8,
      page: 1,
      per_page: 20,
      transactions: [
        {
          id: "4b94b389-7691-449c-8c28-31d35a695120",
          transaction_type: "earned",
          points: 100,
          status: "completed",
          source_type: "purchase",
          source_id: "c1e97463-efd7-40ab-ba2e-7f5820c88dee",
          created_at: "2026-11-23T04:50:29.139Z",
          metadata: {
            details: null,
            rule_name: "Testing rules",
            event_type: "purchase",
            action_type: "purchase",
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockTransactionsResponse,
    } as any);

    const result = await getLoyaltyTransactionsAction(
      { page: 1, per_page: 20 },
      {
        apiBaseUrl: "https://mock.api",
        token: "mock-token",
      },
    );

    expect(result.success).toBe(true);
    expect(result.total_count).toBe(8);
    expect(result.page).toBe(1);
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0].points).toBe(100);
    expect(result.transactions[0].metadata?.rule_name).toBe("Testing rules");
  });

  it("getLoyaltyTransactionsAction returns empty list without apiBaseUrl", async () => {
    const result = await getLoyaltyTransactionsAction();
    expect(result.success).toBe(false);
    expect(result.total_count).toBe(0);
    expect(result.transactions.length).toBe(0);
  });

  describe("isLoyaltyMarketplaceActive", () => {
    it("returns false when orgData is empty, undefined or null", () => {
      expect(isLoyaltyMarketplaceActive(null)).toBe(false);
      expect(isLoyaltyMarketplaceActive(undefined)).toBe(false);
      expect(isLoyaltyMarketplaceActive({})).toBe(false);
      expect(isLoyaltyMarketplaceActive({ organization_marketplaces: [] })).toBe(false);
    });

    it("returns false when marketplaces has other apps but no loyalty app", () => {
      const orgData = {
        organization_marketplaces: [
          {
            is_installed: true,
            market_place: { name: "Razorpay" },
            market_place_json: { enabled: true, appName: "Razorpay" },
          },
          {
            is_installed: true,
            market_place: { name: "Shiprocket" },
            market_place_json: { enabled: true, appName: "Shiprocket" },
          },
        ],
      };
      expect(isLoyaltyMarketplaceActive(orgData)).toBe(false);
    });

    it("returns true when loyalty marketplace app is installed and enabled", () => {
      const orgData = {
        organization_marketplaces: [
          {
            is_installed: true,
            market_place: { name: "Customer Loyalty & Rewards" },
            market_place_json: { enabled: true, appName: "Customer Loyalty & Rewards" },
          },
        ],
      };
      expect(isLoyaltyMarketplaceActive(orgData)).toBe(true);
    });

    it("returns true when matched by slug or loyalty keyword", () => {
      const orgData = {
        organization_marketplaces: [
          {
            is_installed: true,
            slug: "loyalty-rewards",
            enabled: true,
          },
        ],
      };
      expect(isLoyaltyMarketplaceActive(orgData)).toBe(true);
    });

    it("returns false when loyalty app is installed but disabled", () => {
      const orgData = {
        organization_marketplaces: [
          {
            is_installed: true,
            market_place: { name: "Customer Loyalty & Rewards" },
            market_place_json: { enabled: false },
          },
        ],
      };
      expect(isLoyaltyMarketplaceActive(orgData)).toBe(false);
    });

    it("returns false when loyalty app is not installed", () => {
      const orgData = {
        organization_marketplaces: [
          {
            is_installed: false,
            market_place: { name: "Customer Loyalty & Rewards" },
            market_place_json: { enabled: true },
          },
        ],
      };
      expect(isLoyaltyMarketplaceActive(orgData)).toBe(false);
    });

    it("correctly parses stringified organization_marketplaces", () => {
      const orgData = {
        organization_marketplaces: JSON.stringify([
          {
            is_installed: true,
            market_place: { name: "Customer Loyalty & Rewards" },
            market_place_json: { enabled: true },
          },
        ]),
      };
      expect(isLoyaltyMarketplaceActive(orgData)).toBe(true);
    });

    it("respects explicit config overrides", () => {
      expect(isLoyaltyMarketplaceActive(null, { enableLoyalty: true })).toBe(true);
      expect(
        isLoyaltyMarketplaceActive(
          {
            organization_marketplaces: [
              {
                is_installed: true,
                market_place: { name: "Customer Loyalty & Rewards" },
                market_place_json: { enabled: true },
              },
            ],
          },
          { enableLoyalty: false },
        ),
      ).toBe(false);
    });
  });
});
