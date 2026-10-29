import React__default from 'react';

interface StripeCheckoutProps {
    cartId?: string | number;
    publishableKey?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    createStripePaymentIntent?: (cartId: string | number) => Promise<any>;
    amount?: string;
    currency?: string;
}
/**
 * StripeCheckout
 *
 * Embeddable Stripe payment form supporting cards, Apple Pay, Google Pay, and localized methods.
 */
declare const StripeCheckout: React__default.FC<StripeCheckoutProps>;

export { StripeCheckout };
