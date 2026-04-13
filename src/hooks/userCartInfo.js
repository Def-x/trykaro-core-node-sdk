"use client";
import { createResource } from "@/models";
import { sortBy } from "lodash";
// import { useSelector } from "react-redux";

const useCartInfo = () => {
  // const cartState = useSelector((state) => state.cart);

  // const orgDetail = useSelector((state) => state?.org?.organization);

  // const orgDataIns = createResource("oganization", orgDetail);
  // const isPickUpTrue = orgDataIns?.isPickupActive();

  // const cart = cartState?.cart?.[0];
  // const cartItem = cart?.line_items;
  // const shipping_strategy = cart?.shipping_strategy;

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
  // const shippingOption =
  //   cart?.cart_detail_json?.shipments?.shipping_options?.rates;
  // const sortedShippingOption = sortBy(shippingOption, (item) =>
  //   Number(item.retail_rate),
  // );

  return {
    initialCartInfo,
    // cart,
    // cartItem,
    // sortedShippingOption,
    // shipping_strategy,
  };
};

export default useCartInfo;
