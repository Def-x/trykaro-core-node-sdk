"use client";

/**
 * useCartInfo()
 *
 * Returns the baseline payload shape for creating a new cart.
 * Pure utility — zero framework or store-specific dependencies.
 *
 * Usage:
 *  const { initialCartInfo } = useCartInfo();
 *  const newCart = await actions.createCart({ ...initialCartInfo, region_id });
 */
const useCartInfo = () => {
    const initialCartInfo = {
        number: "",
        item_total: 0,
        total: 0,
        ship_total: 0,
        adjustment_total: 0,
        completed_at: "",
        included_tax_total: 0,
        additional_tax_total: 0,
        tax_total: 0,
        currency: "",
        email: "",
        promo_total: 0,
        item_count: 0,
        special_instructions: "",
        pre_tax_item_amount: 0,
        pre_tax_total: 0,
        shipment_state: "",
        payment_state: "",
        cart_sales_channels: "web",
        order_type: "delivery",
    };

    return { initialCartInfo };
};

export default useCartInfo;
