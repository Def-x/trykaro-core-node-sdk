import { useCore } from "../context/CoreProvider";

export interface PaymentGatewayInfo {
  gateway: string;
  label: string;
  isPhonePe: boolean;
  isRazorpay: boolean;
  isStripe: boolean;
  stripePublishableKey: string;
  razorpayKeyId: string;
  paymentConfig: Record<string, any>;
  rawGateway: string;
}

/**
 * Hook to automatically detect the merchant's configured payment gateway
 * from organization settings or active region config.
 */
export function usePaymentGateway(): PaymentGatewayInfo {
  const { config, orgData } = useCore();

  const isRegionBased = Boolean(config?.isRegion);
  const activeRegion = isRegionBased
    ? (config?.activeRegion ?? config?.region ?? null)
    : null;
  const orgPaymentConfig = orgData?.organization_setting?.payment ?? {};
  const regionPaymentConfig = activeRegion?.payment_config ?? null;
  const paymentConfig =
    isRegionBased && regionPaymentConfig ? regionPaymentConfig : orgPaymentConfig;

  const rawPaymentGateway =
    (isRegionBased && activeRegion?.payment_gateway) ||
    orgPaymentConfig?.mode ||
    orgPaymentConfig?.gateway ||
    "";

  const paymentGateway = String(rawPaymentGateway || "razorpay").toLowerCase();
  const isStripeGateway = paymentGateway === "stripe";
  const isPhonePeGateway =
    paymentGateway === "phonepe" ||
    paymentGateway === "phone_pe" ||
    paymentGateway === "phonepe_pg" ||
    paymentGateway === "phone-pe";
  const isRazorpayGateway = !isStripeGateway && !isPhonePeGateway;

  const stripePublishableKey =
    (isRegionBased ? paymentConfig?.stripe_publishable_key : null) ??
    orgPaymentConfig?.stripe_publishable_key ??
    orgPaymentConfig?.publishable_key ??
    "";
  const razorpayKeyId =
    (isRegionBased ? paymentConfig?.razor_pay_key_id : null) ??
    orgPaymentConfig?.razor_pay_key_id ??
    orgPaymentConfig?.key_id ??
    "";

  const paymentGatewayLabel = isPhonePeGateway
    ? "PhonePe"
    : isStripeGateway
      ? "Stripe"
      : isRazorpayGateway
        ? "Razorpay"
        : paymentGateway
          ? paymentGateway.charAt(0).toUpperCase() +
            paymentGateway.slice(1).replace(/_/g, " ")
          : "Razorpay";

  return {
    gateway: paymentGateway,
    label: paymentGatewayLabel,
    isPhonePe: isPhonePeGateway,
    isRazorpay: isRazorpayGateway,
    isStripe: isStripeGateway,
    stripePublishableKey,
    razorpayKeyId,
    paymentConfig,
    rawGateway: rawPaymentGateway,
  };
}

