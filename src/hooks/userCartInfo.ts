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

interface CartInfo {
    number: string;
    item_total: number;
    total: number;
    ship_total: number;
    adjustment_total: number;
    completed_at: string;
    included_tax_total: number;
    additional_tax_total: number;
    tax_total: number;
    currency: string;
    email: string;
    promo_total: number;
    item_count: number;
    special_instructions: string;
    pre_tax_item_amount: number;
    pre_tax_total: number;
    shipment_state: string;
    payment_state: string;
    cart_sales_channels: string;
    order_type: string;
}

const useCartInfo = () => {
    const initialCartInfo: CartInfo = {
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
