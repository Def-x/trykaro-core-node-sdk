import React6, { createContext, useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { flatten, map, compact, filter, uniqBy } from 'lodash';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRazorpay } from 'react-razorpay';
import { createPortal } from 'react-dom';

// src/context/CoreProvider.js
var CoreContext = createContext(null);
var CoreProvider = ({
  children,
  config = {},
  actions = {},
  toast = null,
  auth = null,
  orgData
}) => {
  const [cart, setCart] = useState();
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [region, setRegion] = useState(config?.region ?? null);
  useEffect(() => {
    console.log("before initialCart");
    if (!actions?.getCart) return;
    console.log("before loadCart", { actions });
    const loadCart = async () => {
      try {
        setIsCartLoading(true);
        let resolvedCart = null;
        const isSignedIn = auth?.isSignedIn ?? false;
        if (isSignedIn) {
          const data = await actions.getCart(config?.regionId);
          resolvedCart = Array.isArray(data) ? data[0] : data;
        } else {
          const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cartid") : null;
          console.log({ storedCartId });
          if (storedCartId && actions?.getCartById) {
            resolvedCart = await actions.getCartById(
              storedCartId,
              config?.regionId
            );
          }
        }
        console.log({ resolvedCart });
        setCart(resolvedCart ?? null);
      } catch (err) {
        console.error("[CoreProvider] cart load error:", err);
      } finally {
        setIsCartLoading(false);
      }
    };
    loadCart();
    console.log("load script");
  }, [config?.regionId, auth?.isSignedIn]);
  const value = useMemo(
    () => ({
      // Cart state
      cart,
      setCart,
      isCartLoading,
      // Region state
      region,
      setRegion,
      // Injected dependencies
      actions,
      toast,
      auth,
      config,
      //organization data
      orgData
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, isCartLoading, region, actions, toast, auth, config]
  );
  return /* @__PURE__ */ jsx(CoreContext.Provider, { value, children });
};
var useCore = () => {
  const context = useContext(CoreContext);
  if (!context) {
    throw new Error(
      "[useCore] must be used inside <CoreProvider>. Wrap your app (or the relevant subtree) with <CoreProvider>."
    );
  }
  return context;
};

// src/hooks/useCart.js
var useCart = () => {
  const { cart, setCart, isCartLoading, config } = useCore();
  return { cart, setCart, isCartLoading, config };
};
function useAddToCart() {
  const { cart, setCart, actions, toast, auth, config } = useCore();
  const [quantity, setQuantity] = useState(1);
  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
  const isSignedIn = auth?.isSignedIn ?? false;
  const regionId = config?.regionId ?? null;
  const cartItems = cart?.line_items ?? [];
  const getCartItem = (product) => {
    console.log("getCartItem", { product, cart });
    if (!cart?.line_items) return null;
    return cart.line_items.find(
      (item) => item.line_itemable?.id === product?.id
    ) ?? null;
  };
  const refreshCart = async (cartId) => {
    console.log("refersh cart", { cartId, isSignedIn });
    try {
      let updatedCart;
      if (isSignedIn) {
        const data = await actions.getCart?.(regionId);
        updatedCart = Array.isArray(data) ? data[0] : data;
      } else {
        updatedCart = await actions.getCartById?.(cartId, regionId);
      }
      console.log({ updatedCart });
      setCart(updatedCart ?? null);
    } catch (err) {
      console.error("[useAddToCart] refreshCart error:", err);
    }
  };
  const addItemToCart = async (product, resolvedCartId) => {
    console.log("addItemToCart", { product, resolvedCartId });
    const sellingQTY = product?.selling_quantity?.values?.[0]?.label;
    const qty = quantity ?? 1;
    const existingLineItem = getCartItem(product);
    if (existingLineItem) {
      const newQty = existingLineItem.quantity + qty;
      await actions.updateLineItem?.(existingLineItem.id, { quantity: newQty });
    } else {
      const body = {
        line_itemable_id: product?.id,
        quantity: qty,
        ...resolvedCartId && !isSignedIn ? { cart_id: resolvedCartId } : {},
        ...regionId ? { region_id: regionId } : {}
      };
      console.log({ body });
      await actions.createLineItem?.(body);
    }
    setQuantity(sellingQTY ? Number(sellingQTY) : 1);
    if (resolvedCartId) {
      await refreshCart(resolvedCartId);
    }
  };
  const handleAddToCart = async (product) => {
    try {
      const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cartid") : null;
      let resolvedCartId = cart?.id ?? storedCartId;
      console.log("handleAddToCart before cart check", { cart, storedCartId, resolvedCartId });
      if (!cart) {
        const payload = {
          number: "",
          item_total: 0,
          total: 0,
          currency: "",
          cart_sales_channels: "web",
          order_type: "delivery",
          ...regionId ? { region_id: regionId } : {}
        };
        const createdCart = await actions.createCart?.(payload);
        console.log("handleAddToCart", { createdCart });
        if (createdCart?.id) {
          resolvedCartId = createdCart.id;
          if (!isSignedIn) {
            localStorage.setItem("cartid", createdCart.id);
          }
          setCart(createdCart);
        }
      }
      await addItemToCart(product, resolvedCartId);
      toast?.success?.("Item added to cart");
    } catch (err) {
      console.error("[useAddToCart] handleAddToCart error:", err);
      toast?.error?.("Failed to add item to cart");
    } finally {
      setIsAddToCartLoading(false);
    }
  };
  const handleDecreaseQty = async (product) => {
    const existingLineItem = getCartItem(product);
    if (!existingLineItem) return;
    try {
      setIsAddToCartLoading(true);
      if (existingLineItem.quantity <= 1) {
        await actions.deleteLineItem?.(existingLineItem.id);
      } else {
        await actions.updateLineItem?.(existingLineItem.id, {
          quantity: existingLineItem.quantity - 1
        });
      }
      const activeCartId = cart?.id;
      if (activeCartId) {
        await refreshCart(activeCartId);
      }
    } catch (err) {
      console.error("[useAddToCart] handleDecreaseQty error:", err);
    } finally {
      setIsAddToCartLoading(false);
    }
  };
  const handleDeleteLineItem = async (product) => {
    try {
      console.log({ product }, product?.id);
      await actions.deleteLineItem?.(product?.id);
      const activeCartId = cart?.id;
      if (activeCartId) {
        await refreshCart(activeCartId);
      }
      toast?.success?.("Item removed from cart");
    } catch (err) {
      console.error("[useAddToCart] handleDeleteLineItem error:", err);
      toast?.error?.("Failed to remove item");
    } finally {
      setIsAddToCartLoading(false);
    }
  };
  return {
    handleAddToCart,
    handleDecreaseQty,
    handleDeleteLineItem,
    getCartItem,
    quantity,
    setQuantity,
    isAddToCartLoading,
    cartItems,
    cart
  };
}

// src/hooks/useCurrencyFormat.js
function useCurrencyFormat() {
  const { orgData } = useCore();
  const currency = orgData?.organization_setting?.currency ?? "\u20B9";
  const locale = orgData?.organization_setting?.locale ?? "en-IN";
  const formatCurrency = (amount) => {
    if (amount == null) return "";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency
    }).format(amount);
  };
  return { formatCurrency };
}

// src/hooks/useAuth.js
var useAuth = () => {
  const { auth } = useCore();
  return auth ?? {};
};

// src/hooks/useLogout.js
var useLogout = () => {
  const { auth } = useCore();
  const logout = auth?.logout ?? (() => {
    console.warn("[useLogout] No logout function injected into CoreProvider.");
  });
  return logout;
};
function useVariantSelection(rawProduct) {
  const [selectedOptionsType, setSelectedOptionsType] = useState([]);
  const allVariantOptions = flatten(
    map(
      rawProduct?.variants,
      (variant) => map(variant?.variant_options, (variantOption) => ({
        types: variantOption.option_type,
        values: {
          ...variantOption.option_value,
          // Attach variant image when applicable (e.g. Color swatches)
          image: variantOption.option_type?.name?.toLowerCase() === "color" ? variant.product_images?.[0] : "",
          variant_id: variantOption?.variant?.id,
          // All variant IDs that share this option value (useful for filtering)
          variant_ids: flatten(
            compact(
              map(rawProduct?.variants, (v) => {
                const matched = filter(v?.variant_options, [
                  "option_value.id",
                  variantOption?.option_value?.id
                ]);
                return matched?.length ? v?.id : false;
              })
            )
          )
        }
      }))
    )
  );
  const variantOptionTypes = uniqBy(
    map(allVariantOptions, (v) => v?.types).filter(Boolean),
    "id"
  );
  const hasVariants = variantOptionTypes.length > 0;
  useEffect(() => {
    if (!rawProduct?.variants?.length || !hasVariants) return;
    const firstVariant = rawProduct.variants.find((v) => v.in_stock || v.purchasable) ?? rawProduct.variants[0];
    if (!firstVariant?.variant_options?.length) return;
    const autoSelections = firstVariant.variant_options.map((vo) => ({
      types: vo.option_type,
      values: vo.option_value
    }));
    setSelectedOptionsType(autoSelections);
  }, [rawProduct?.id]);
  const selectedVariant = (() => {
    if (!selectedOptionsType.length || !rawProduct?.variants?.length) return null;
    return rawProduct.variants.find(
      (variant) => selectedOptionsType.every(
        (sel) => variant.variant_options.some(
          (vo) => vo.option_type?.id === sel.types?.id && vo.option_value?.id === sel.values?.id
        )
      )
    ) ?? null;
  })();
  const isOptionAvailable = (optionType, optionValue) => {
    if (!rawProduct?.variants?.length) return false;
    return rawProduct.variants.some(
      (variant) => (variant.in_stock || variant.purchasable) && variant.variant_options.some(
        (vo) => vo.option_type?.id === optionType?.id && vo.option_value?.id === optionValue?.id
      )
    );
  };
  const getValuesForType = (optionType) => {
    if (!rawProduct?.variants) return [];
    const seen = /* @__PURE__ */ new Set();
    const vals = [];
    rawProduct.variants.forEach((v) => {
      v.variant_options?.forEach((vo) => {
        if (vo.option_type?.id === optionType?.id && !seen.has(vo.option_value?.id)) {
          seen.add(vo.option_value?.id);
          vals.push(vo.option_value);
        }
      });
    });
    return vals;
  };
  const selectOption = (optionValue, optionType) => {
    setSelectedOptionsType((prev) => {
      const isAlreadySelected = prev.some(
        (s) => s.types?.id === optionType?.id && s.values?.id === optionValue?.id
      );
      if (isAlreadySelected) {
        return prev.filter((s) => s.types?.id !== optionType?.id);
      }
      const withNewValue = [
        ...prev.filter((p) => p.types?.id !== optionType?.id),
        { types: optionType, values: optionValue }
      ];
      const exactMatch = rawProduct?.variants?.find(
        (v) => withNewValue.every(
          (sel) => v.variant_options.some(
            (vo) => vo.option_type?.id === sel.types?.id && vo.option_value?.id === sel.values?.id
          )
        )
      );
      const matchingVariant = exactMatch ?? rawProduct?.variants?.find(
        (v) => v.variant_options.some(
          (vo) => vo.option_type?.id === optionType?.id && vo.option_value?.id === optionValue?.id
        )
      );
      if (!matchingVariant) return withNewValue;
      const autoFilled = [{ types: optionType, values: optionValue }];
      matchingVariant.variant_options.forEach((vo) => {
        if (vo.option_type?.id === optionType?.id) return;
        if (!autoFilled.some((s) => s.types?.id === vo.option_type?.id)) {
          autoFilled.push({ types: vo.option_type, values: vo.option_value });
        }
      });
      return autoFilled;
    });
  };
  const getDisplayImages = (productImages = []) => {
    if (!selectedVariant?.product_images?.length) return productImages;
    return selectedVariant.product_images.map((img) => ({
      id: img.id,
      position: img.position ?? 0,
      url: img.product_image_url ?? null,
      videoUrl: img.product_video_url ?? null
    }));
  };
  return {
    /** Array of { types, values } for whatever the user has selected */
    selectedOptionsType,
    /** The matched product variant (null if no full match yet) */
    selectedVariant,
    /** Unique option types array, e.g. [Size, Color] */
    variantOptionTypes,
    /** True when the product has at least one selectable option type */
    hasVariants,
    /** fn(optionType, optionValue) → boolean – drives the disabled state of chips */
    isOptionAvailable,
    /** fn(optionType) → option value array – used to render chips per type */
    getValuesForType,
    /** Call when user taps an option chip */
    selectOption,
    /**
     * fn(fallbackImages) → image array
     * Pass your product's default images; the hook swaps them for variant
     * images when a variant with images is selected.
     */
    getDisplayImages
  };
}

// src/hooks/userCartInfo.js
var useCartInfo = () => {
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
    order_type: "delivery"
  };
  return { initialCartInfo };
};
var userCartInfo_default = useCartInfo;
var Spinner = ({ size = "md", color = "currentColor", className = "" }) => {
  const sizeMap = {
    sm: { width: 16, border: 2 },
    md: { width: 24, border: 3 },
    lg: { width: 40, border: 4 }
  };
  const { width, border } = sizeMap[size] ?? sizeMap.md;
  const style = {
    width,
    height: width,
    borderWidth: border,
    borderStyle: "solid",
    borderColor: `${color} transparent transparent transparent`,
    borderRadius: "50%",
    display: "inline-block",
    animation: "defx-spin 0.75s linear infinite",
    flexShrink: 0
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: `
                @keyframes defx-spin {
                    0%   { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            ` }),
    /* @__PURE__ */ jsx(
      "span",
      {
        role: "status",
        "aria-label": "Loading",
        style,
        className
      }
    )
  ] });
};
var CartItem = ({
  item,
  renderImage = null,
  renderActions = null,
  className = ""
}) => {
  const { handleAddToCart, handleDecreaseQty, handleDeleteLineItem, isAddToCartLoading } = useAddToCart();
  const { formatCurrency } = useCurrencyFormat();
  const product = item?.line_itemable;
  const name = product?.name ?? item?.name ?? "Product";
  const price = item?.price ?? product?.price ?? 0;
  const quantity = item?.quantity ?? 0;
  const imageUrl = product?.product_images?.[0]?.product_image_url ?? product?.image_url ?? null;
  const s = {
    row: {
      display: "flex",
      alignItems: "flex-start",
      gap: "1rem",
      padding: "1rem 0",
      borderBottom: "1px solid rgba(0,0,0,0.08)"
    },
    image: {
      width: 72,
      height: 72,
      objectFit: "cover",
      borderRadius: 8,
      flexShrink: 0,
      background: "#f3f4f6"
    },
    imagePlaceholder: {
      width: 72,
      height: 72,
      borderRadius: 8,
      background: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      flexShrink: 0
    },
    info: { flex: 1, minWidth: 0 },
    name: {
      fontSize: "0.9rem",
      fontWeight: 600,
      margin: "0 0 0.25rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    },
    price: { fontSize: "0.85rem", opacity: 0.7, margin: 0 },
    controls: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginTop: "0.5rem"
    },
    qtyBtn: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      border: "1px solid rgba(0,0,0,0.15)",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1rem",
      fontWeight: 700,
      lineHeight: 1
    },
    qty: { fontSize: "0.9rem", fontWeight: 600, minWidth: 20, textAlign: "center" },
    deleteBtn: {
      marginLeft: "auto",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      opacity: 0.5,
      fontSize: "1.1rem",
      padding: "0.25rem",
      borderRadius: 4,
      transition: "opacity 0.15s"
    }
  };
  return /* @__PURE__ */ jsxs("div", { style: s.row, className, children: [
    renderImage ? renderImage(item) : imageUrl ? /* @__PURE__ */ jsx("img", { src: imageUrl, alt: name, style: s.image }) : /* @__PURE__ */ jsx("div", { style: s.imagePlaceholder, children: "\u{1F6CD}\uFE0F" }),
    /* @__PURE__ */ jsxs("div", { style: s.info, children: [
      /* @__PURE__ */ jsx("p", { style: s.name, title: name, children: name }),
      /* @__PURE__ */ jsxs("p", { style: s.price, children: [
        formatCurrency(price),
        " \xD7 ",
        quantity
      ] }),
      renderActions ? renderActions(item) : /* @__PURE__ */ jsxs("div", { style: s.controls, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            style: s.qtyBtn,
            onClick: () => handleDecreaseQty(product),
            disabled: isAddToCartLoading,
            "aria-label": "Decrease quantity",
            children: "\u2212"
          }
        ),
        /* @__PURE__ */ jsx("span", { style: s.qty, children: isAddToCartLoading ? /* @__PURE__ */ jsx(Spinner, { size: "sm" }) : quantity }),
        /* @__PURE__ */ jsx(
          "button",
          {
            style: s.qtyBtn,
            onClick: () => handleAddToCart(product),
            disabled: isAddToCartLoading,
            "aria-label": "Increase quantity",
            children: "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        style: s.deleteBtn,
        onClick: () => handleDeleteLineItem(product),
        disabled: isAddToCartLoading,
        "aria-label": "Remove item",
        title: "Remove",
        children: "\u2715"
      }
    )
  ] });
};
var CartSummary = ({
  className = "",
  renderFooter = null,
  labels = {}
}) => {
  const { cart } = useCart();
  const { formatCurrency } = useCurrencyFormat();
  const l = {
    subtotal: "Subtotal",
    shipping: "Shipping",
    tax: "Tax",
    total: "Total",
    itemCount: "items",
    estimatedShipping: "Calculated at checkout",
    ...labels
  };
  const itemCount = cart?.item_count ?? cart?.line_items?.length ?? 0;
  const itemTotal = cart?.item_total ?? 0;
  const shipTotal = cart?.ship_total ?? 0;
  const taxTotal = cart?.tax_total ?? 0;
  const grandTotal = cart?.total ?? itemTotal + shipTotal + taxTotal;
  const s = {
    wrapper: {
      background: "rgba(0,0,0,0.03)",
      borderRadius: 12,
      padding: "1.25rem"
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.4rem 0",
      fontSize: "0.875rem"
    },
    label: { opacity: 0.7 },
    divider: {
      height: 1,
      background: "rgba(0,0,0,0.1)",
      margin: "0.5rem 0"
    },
    totalRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.5rem 0",
      fontWeight: 700,
      fontSize: "1rem"
    }
  };
  return /* @__PURE__ */ jsxs("div", { style: s.wrapper, className, children: [
    /* @__PURE__ */ jsxs("div", { style: s.row, children: [
      /* @__PURE__ */ jsxs("span", { style: s.label, children: [
        l.subtotal,
        " (",
        itemCount,
        " ",
        l.itemCount,
        ")"
      ] }),
      /* @__PURE__ */ jsx("span", { children: formatCurrency(itemTotal) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: s.row, children: [
      /* @__PURE__ */ jsx("span", { style: s.label, children: l.shipping }),
      /* @__PURE__ */ jsx("span", { children: shipTotal > 0 ? formatCurrency(shipTotal) : l.estimatedShipping })
    ] }),
    taxTotal > 0 && /* @__PURE__ */ jsxs("div", { style: s.row, children: [
      /* @__PURE__ */ jsx("span", { style: s.label, children: l.tax }),
      /* @__PURE__ */ jsx("span", { children: formatCurrency(taxTotal) })
    ] }),
    /* @__PURE__ */ jsx("div", { style: s.divider }),
    /* @__PURE__ */ jsxs("div", { style: s.totalRow, children: [
      /* @__PURE__ */ jsx("span", { children: l.total }),
      /* @__PURE__ */ jsx("span", { children: formatCurrency(grandTotal) })
    ] }),
    renderFooter?.()
  ] });
};
var EmptyState = ({
  icon = null,
  title = "Nothing here yet",
  description = "",
  action = null,
  className = ""
}) => {
  const styles = {
    wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem 1.5rem",
      textAlign: "center",
      gap: "0.75rem"
    },
    icon: {
      fontSize: "2.5rem",
      lineHeight: 1,
      opacity: 0.5
    },
    title: {
      fontSize: "1.125rem",
      fontWeight: 600,
      margin: 0,
      color: "inherit"
    },
    description: {
      fontSize: "0.875rem",
      opacity: 0.6,
      margin: 0,
      maxWidth: 320
    }
  };
  return /* @__PURE__ */ jsxs("div", { style: styles.wrapper, className, children: [
    icon && /* @__PURE__ */ jsx("span", { style: styles.icon, children: icon }),
    /* @__PURE__ */ jsx("p", { style: styles.title, children: title }),
    description && /* @__PURE__ */ jsx("p", { style: styles.description, children: description }),
    action
  ] });
};
var CartPage = ({
  className = "",
  header = null,
  emptyState = null,
  renderItem = null,
  renderSummary = null,
  renderCheckoutBtn = null,
  summaryLabels = {}
}) => {
  const { cart, isCartLoading } = useCart();
  const lineItems = cart?.line_items ?? [];
  const isEmpty = !isCartLoading && lineItems.length === 0;
  const s = {
    page: {
      maxWidth: 900,
      margin: "0 auto",
      padding: "2rem 1rem",
      fontFamily: "inherit"
    },
    heading: {
      fontSize: "1.5rem",
      fontWeight: 700,
      marginBottom: "1.5rem"
    },
    layout: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "2rem"
    },
    layoutDesktop: {
      display: "grid",
      gridTemplateColumns: "1fr 320px",
      gap: "2rem"
    },
    loadingWrapper: {
      display: "flex",
      justifyContent: "center",
      padding: "4rem 0"
    },
    items: {}
  };
  const [isWide, setIsWide] = React6.useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  React6.useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  if (isCartLoading) {
    return /* @__PURE__ */ jsxs("div", { style: s.page, className, children: [
      header ?? /* @__PURE__ */ jsx("h1", { style: s.heading, children: "Your Cart" }),
      /* @__PURE__ */ jsx("div", { style: s.loadingWrapper, children: /* @__PURE__ */ jsx(Spinner, { size: "lg" }) })
    ] });
  }
  if (isEmpty) {
    return /* @__PURE__ */ jsxs("div", { style: s.page, className, children: [
      header ?? /* @__PURE__ */ jsx("h1", { style: s.heading, children: "Your Cart" }),
      emptyState ?? /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: "\u{1F6D2}",
          title: "Your cart is empty",
          description: "Add items from the store to get started."
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { style: s.page, className, children: [
    header ?? /* @__PURE__ */ jsx("h1", { style: s.heading, children: "Your Cart" }),
    /* @__PURE__ */ jsxs("div", { style: isWide ? s.layoutDesktop : s.layout, children: [
      /* @__PURE__ */ jsx("div", { style: s.items, children: lineItems.map(
        (item) => renderItem ? /* @__PURE__ */ jsx(React6.Fragment, { children: renderItem(item) }, item.id) : /* @__PURE__ */ jsx(CartItem, { item }, item.id)
      ) }),
      renderSummary ? renderSummary() : /* @__PURE__ */ jsx(
        CartSummary,
        {
          labels: summaryLabels,
          renderFooter: renderCheckoutBtn
        }
      )
    ] })
  ] });
};
var Hello = () => {
  const { cart, isCartLoading } = useCore();
  console.log("Cart:", cart, isCartLoading);
  return /* @__PURE__ */ jsx("div", { children: isCartLoading ? "Loading..." : "Core Working \u2705" });
};
var DeleteIcon = ({
  onClick,
  className = "",
  title = "",
  disabled = false
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    onClick,
    disabled,
    className,
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    title,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        d: "M2.5 5h15M8.5 8.5v5M11.5 8.5v5M3 5.5v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-11M7 5V3.5c0-.3.2-.5.5-.5h5c.3 0 .5.2.5.5V5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    )
  }
);
var CustomizationModal = ({
  isOpen,
  onClose,
  product,
  customizationsList,
  onConfirm,
  initialValues = {},
  initialQuantity = 1,
  isEditMode = false,
  isAddToCartLoading = false
}) => {
  const [customizations, setCustomizations] = useState({});
  const [quantity, setQuantity] = useState(initialQuantity);
  useEffect(() => {
    if (isOpen) {
      setCustomizations(initialValues);
      setQuantity(initialQuantity);
    }
  }, [isOpen, initialValues, initialQuantity]);
  const handleCustomizationChange = (customizationId, value) => {
    setCustomizations((prev) => ({
      ...prev,
      [customizationId]: value
    }));
  };
  const handleConfirm = () => {
    onConfirm(customizations, quantity);
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-xl font-[Nunito-bold] text-[var(--main)] mb-4", children: [
      isEditMode ? "Edit" : "Customize",
      " ",
      product?.name
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4 mb-6 max-h-[400px] overflow-y-auto", children: customizationsList.map((customization) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-[Nunito-medium] text-[var(--main)] mb-2", children: customization.name }),
      customization.customization_type === "select" ? /* @__PURE__ */ jsxs(
        "select",
        {
          value: customizations[customization.id]?.value || "",
          onChange: (e) => handleCustomizationChange(customization.id, e.target.value),
          className: "w-full border border-[#e8e5df] rounded-md p-2 text-sm",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select an option" }),
            customization.customization_values?.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.id))
          ]
        }
      ) : /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: customizations[customization.id]?.value || "",
          onChange: (e) => handleCustomizationChange(customization.id, e.target.value),
          placeholder: `Enter ${customization.name}`,
          className: "w-full border border-[#e8e5df] rounded-md p-2 text-sm"
        }
      )
    ] }, customization.id)) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-[Nunito-medium] text-[var(--main)] mb-2", children: "Quantity" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-[#e8e5df] rounded-md w-fit", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setQuantity(Math.max(1, quantity - 1)),
            disabled: isAddToCartLoading,
            className: "w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#00214c] disabled:opacity-50",
            children: "-"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "w-10 text-center font-semibold text-[#00214c]", children: quantity }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setQuantity(quantity + 1),
            disabled: isAddToCartLoading,
            className: "w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#00214c] disabled:opacity-50",
            children: "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          disabled: isAddToCartLoading,
          className: "flex-1 px-4 py-2 border border-[#e8e5df] rounded-md text-sm font-[Nunito-medium] hover:bg-gray-50 disabled:opacity-50",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleConfirm,
          disabled: isAddToCartLoading,
          className: "flex-1 px-4 py-2 bg-[#00214c] text-white rounded-md text-sm font-[Nunito-medium] hover:bg-[#0d346b] disabled:opacity-50",
          children: isAddToCartLoading ? "Loading..." : isEditMode ? "Update" : "Add to Cart"
        }
      )
    ] })
  ] }) });
};
var CustomizationModal_default = CustomizationModal;
var ViewCustomizationModal = ({
  isOpen,
  onClose,
  customizations = [],
  productName = ""
}) => {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-xl font-[Nunito-bold] text-[var(--main)] mb-4", children: [
      "Customizations for ",
      productName
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3 mb-6 max-h-[400px] overflow-y-auto", children: customizations.length > 0 ? customizations.map((customization, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "border border-[#e8e5df] rounded-md p-3",
        children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-[Nunito-medium] text-[var(--main)]", children: customization.name || `Custom ${index + 1}` }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mt-1", children: customization.value })
        ]
      },
      `${customization.product_customization_id}-${index}`
    )) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "No customizations added" }) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "w-full px-4 py-2 bg-[#00214c] text-white rounded-md text-sm font-[Nunito-medium] hover:bg-[#0d346b]",
        children: "Close"
      }
    )
  ] }) });
};
var ViewCustomizationModal_default = ViewCustomizationModal;
var ProductlistCard = ({ product, component, orderType }) => {
  const { name, price, shipping_charge } = product?.line_itemable ?? {};
  const productImage = product?.image;
  const quantity = product?.quantity;
  const displayPrice = (price ?? 0) / 100;
  const { formatCurrency } = useCurrencyFormat();
  const {
    handleDeleteLineItem,
    handleDecreaseQty,
    handleAddToCart,
    isAddToCartLoading
  } = useAddToCart();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const handleDeleteItem = async () => {
    console.log("called handleDeleteItem", { product });
    await handleDeleteLineItem(product);
  };
  const handleEditConfirm = async (newCustomizations, newQty) => {
    try {
      await handleDeleteLineItem(product);
      await handleAddToCart(product?.line_itemable, newCustomizations, newQty);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
  const initialCustomizationObj = (product?.line_items_customizations || []).reduce((acc, c) => {
    acc[c.product_customization_id] = c;
    return acc;
  }, {});
  const customizationsList = product?.line_itemable?.product_customizations || [];
  const hasCustomizations = product?.line_items_customizations?.length > 0 || customizationsList.length > 0;
  const isDeleted = !product?.line_itemable || product?.line_itemable_deleted;
  if (isDeleted) {
    return /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-[10px] flex-1 min-w-0 opacity-50", children: [
        /* @__PURE__ */ jsxs("div", { className: "w-[112px] h-[124px] flex-shrink-0 overflow-hidden relative", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: productImage || "/noProduct.svg",
              alt: name || "Product",
              className: "w-[112px] h-[124px] object-cover rounded-lg"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-white text-xs font-[Nunito-bold] text-center", children: "UNAVAILABLE" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between h-[124px] flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-base text-[var(--main)] line-clamp-1", children: name }),
            /* @__PURE__ */ jsx("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-[Nunito-medium] flex-shrink-0", children: "Deleted" })
          ] }) }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { className: "font-[Nunito-medium] text-base text-[var(--main)]", children: [
            quantity,
            " x ",
            formatCurrency(displayPrice)
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between items-end h-[124px] flex-shrink-0", children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-col items-end text-right opacity-50", children: /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-base text-[var(--main)] line-clamp-2", children: formatCurrency(displayPrice * quantity) }) }),
        component !== "order" && /* @__PURE__ */ jsx(
          DeleteIcon,
          {
            onClick: handleDeleteItem,
            className: "cursor-pointer opacity-100 hover:opacity-80 transition-opacity",
            title: "Delete item"
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-[10px] flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "w-[112px] h-[124px] flex-shrink-0 overflow-hidden", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: productImage || "/noImage.webp",
          alt: name || "Product",
          className: "w-[112px] h-[124px] object-cover rounded-lg"
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between h-[124px] flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-base text-[var(--main)] line-clamp-1", children: name }),
          product?.line_items_customizations?.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1 flex flex-col gap-0.5", children: product.line_items_customizations.length > 3 ? /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setIsViewModalOpen(true),
              className: "text-xs text-[#00214c] underline hover:text-[#0d346b] transition-colors text-left font-medium",
              children: "customizations: view"
            }
          ) : product.line_items_customizations.map((c) => /* @__PURE__ */ jsxs(
            "p",
            {
              className: "text-xs text-gray-500 line-clamp-1",
              children: [
                /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                  c.name || "Custom",
                  ":"
                ] }),
                " ",
                c.value
              ]
            },
            c.product_customization_id
          )) })
        ] }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { className: "font-[Nunito-medium] text-base text-[var(--main)]", children: [
          quantity,
          " x ",
          formatCurrency(displayPrice)
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between items-end h-[124px] flex-shrink-0", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col items-end text-right", children: component !== "order" ? /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-base text-[var(--main)] line-clamp-1", children: formatCurrency(displayPrice * quantity) }) : /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-base text-[var(--main)] line-clamp-2", children: formatCurrency(displayPrice * quantity) }) }),
      component !== "order" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-[#e8e5df] rounded-md h-[28px] bg-[#f9f9f9]", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDecreaseQty(
                product?.line_itemable,
                product?.line_items_customizations
              ),
              disabled: isAddToCartLoading,
              className: "w-7 h-full flex items-center justify-center text-lg text-gray-500 hover:text-[#00214c] transition-colors disabled:opacity-50 pb-0.5",
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "w-6 text-center text-sm font-semibold text-[#00214c] bg-white h-full flex items-center justify-center border-x border-[#e8e5df]", children: quantity }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleAddToCart(
                product?.line_itemable,
                product?.line_items_customizations,
                1
              ),
              disabled: isAddToCartLoading,
              className: "w-7 h-full flex items-center justify-center text-base text-gray-500 hover:text-[#00214c] transition-colors disabled:opacity-50 pb-0.5",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          DeleteIcon,
          {
            onClick: handleDeleteItem,
            disabled: isAddToCartLoading,
            className: "cursor-pointer opacity-100 hover:opacity-80 transition-opacity disabled:opacity-50",
            title: "Delete item"
          }
        )
      ] })
    ] }),
    hasCustomizations && /* @__PURE__ */ jsx(
      CustomizationModal_default,
      {
        isOpen: isEditModalOpen,
        onClose: () => setIsEditModalOpen(false),
        product: product?.line_itemable,
        customizationsList,
        onConfirm: handleEditConfirm,
        initialValues: initialCustomizationObj,
        initialQuantity: quantity,
        isEditMode: true,
        isAddToCartLoading
      }
    ),
    /* @__PURE__ */ jsx(
      ViewCustomizationModal_default,
      {
        isOpen: isViewModalOpen,
        onClose: () => setIsViewModalOpen(false),
        customizations: product?.line_items_customizations || [],
        productName: name
      }
    )
  ] });
};
var ProductlistCard_default = ProductlistCard;
var AddressFormInline = ({ refetch }) => {
  const [isOpen, setIsOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "font-[Nunito-regular] text-[14px] text-[var(--secondary)] mb-3", children: "No addresses saved yet." }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "font-[Nunito-medium] text-[var(--main)] underline text-sm",
        children: "+ Add your first address"
      }
    ),
    /* @__PURE__ */ jsx(
      AddAddressForm,
      {
        isOpen,
        onClose: () => setIsOpen(false),
        refetch
      }
    )
  ] });
};
var AddAddressForm = ({ isOpen, onClose, refetch }) => {
  const { actions, toast } = useCore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    address_type: "shipping",
    address1: "",
    address2: "",
    city: "",
    zipcode: "",
    phone: "",
    firstname: "",
    lastname: "",
    state_name: "",
    country_name: "India",
    country_iso3: "IND",
    country_iso: "IN",
    state_code: "",
    label: "Home"
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (actions?.createAddress) {
        await actions.createAddress(formData);
        toast?.success?.("Address added successfully!");
        refetch?.();
        onClose();
      } else {
        console.error("actions.createAddress is not defined");
        toast?.error?.("Failed to add address: Action not found");
      }
    } catch (err) {
      console.error("Failed to add address:", err);
      toast?.error?.("Failed to add address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  if (!isOpen || !mounted) return null;
  const modalContent = /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60 flex items-center justify-center z-[999999] p-4 backdrop-blur-[2px]", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-2xl w-full max-w-[600px] overflow-hidden max-h-[90vh] overflow-y-auto relative border border-gray-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-[20px] font-[Nunito-bold] text-[#00214c]", children: "Add New Address" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100",
          children: /* @__PURE__ */ jsx(
            "svg",
            {
              className: "w-6 h-6",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M6 18L18 6M6 6l12 12"
                }
              )
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-[Nunito-bold] text-[#00214c]", children: "First Name *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "firstname",
              value: formData.firstname,
              onChange: handleChange,
              placeholder: "First name",
              required: true,
              className: "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-[Nunito-bold] text-[#00214c]", children: "Last Name *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "lastname",
              value: formData.lastname,
              onChange: handleChange,
              placeholder: "Last name",
              required: true,
              className: "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-[Nunito-bold] text-[#00214c]", children: "Phone *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "phone",
            value: formData.phone,
            onChange: handleChange,
            placeholder: "Phone number",
            required: true,
            className: "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-[Nunito-bold] text-[#00214c]", children: "Address Line 1 *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "address1",
            value: formData.address1,
            onChange: handleChange,
            placeholder: "Street address",
            required: true,
            className: "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-[Nunito-bold] text-[#00214c]", children: "Address Line 2" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "address2",
            value: formData.address2,
            onChange: handleChange,
            placeholder: "Apartment, suite, etc.",
            className: "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-[Nunito-bold] text-[#00214c]", children: "City *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "city",
              value: formData.city,
              onChange: handleChange,
              placeholder: "City",
              required: true,
              className: "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-[Nunito-bold] text-[#00214c]", children: "State/Province *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "state_name",
              value: formData.state_name,
              onChange: handleChange,
              placeholder: "State",
              required: true,
              className: "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-[Nunito-bold] text-[#00214c]", children: "Country *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "country_name",
              value: formData.country_name,
              onChange: handleChange,
              placeholder: "Country",
              required: true,
              className: "w-full border border-gray-300 rounded-md p-3 text-sm bg-gray-50 focus:outline-none font-[Nunito-regular]"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-[Nunito-bold] text-[#00214c]", children: "Postal Code *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "zipcode",
              value: formData.zipcode,
              onChange: handleChange,
              placeholder: "Postal code",
              required: true,
              className: "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-[Nunito-bold] text-[#00214c]", children: "Label (e.g., Home, Office)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "label",
            value: formData.label,
            onChange: handleChange,
            placeholder: "Label",
            className: "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4 pt-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "flex-1 py-3 border border-gray-300 rounded-md text-[#00214c] font-[Nunito-bold] hover:bg-gray-50 transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: `flex-1 py-3 bg-black text-white rounded-md font-[Nunito-bold] transition-colors flex items-center justify-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-black/90"}`,
            children: [
              isSubmitting && /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }),
              isSubmitting ? "Adding..." : "Add Address"
            ]
          }
        )
      ] })
    ] })
  ] }) });
  return createPortal(modalContent, document.body);
};
var AddressSelection = ({
  cart,
  setCart,
  address,
  sameAsShipping,
  clerkUser,
  setSameAsShipping,
  shippingAddressId,
  billingAddressId,
  setSelectedAddress,
  isCartHaveBillingAddress,
  isCarthaveShippingAddress,
  refetch
}) => {
  const { actions } = useCore();
  const [isOpenAddAddress, setIsOpenAddAddress] = useState(false);
  console.log({ actions });
  const updateCart = useCallback(
    async (apiData) => {
      console.log({ apiData });
      try {
        if (actions?.updateCart) {
          const res = await actions.updateCart(apiData?.id, apiData);
          console.log({ res });
          setCart((prev) => res);
        }
      } catch (err) {
        console.error("Failed to update cart address:", err);
      }
    },
    [actions, setCart]
  );
  const onSwitchChange = () => {
    const next = !sameAsShipping;
    setSameAsShipping(next);
    if (next) {
      updateCart({
        id: cart?.id,
        billing_address_id: shippingAddressId,
        shipping_address_id: shippingAddressId
      });
    } else {
      const billingAddr = address.find((a) => a?.id !== shippingAddressId);
      updateCart({
        id: cart?.id,
        billing_address_id: billingAddr?.id,
        shipping_address_id: shippingAddressId
      });
    }
  };
  const onSelectedAddress = (addressId, type) => {
    const apiData = { id: cart?.id };
    if (type === "billing") {
      setSelectedAddress((prev) => ({ ...prev, billingAddressId: addressId }));
      apiData.billing_address_id = addressId;
    } else {
      setSelectedAddress((prev) => ({ ...prev, shippingAddressId: addressId }));
      apiData.shipping_address_id = addressId;
    }
    updateCart(apiData);
  };
  useEffect(() => {
    if (!clerkUser) return;
    const apiData = { id: cart?.id };
    if (!isCartHaveBillingAddress && billingAddressId)
      apiData.billing_address_id = billingAddressId;
    if (!isCarthaveShippingAddress && shippingAddressId)
      apiData.shipping_address_id = sameAsShipping ? billingAddressId : shippingAddressId;
    if (apiData.billing_address_id || apiData.shipping_address_id) {
      updateCart(apiData);
    }
  }, [address, shippingAddressId, billingAddressId]);
  return /* @__PURE__ */ jsxs("div", { className: "w-full flex justify-center", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-[Nunito-medium] text-[20px] text-[var(--main)] tracking-wide", children: "SHIPPING ADDRESS" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "text-base font-[Nunito-medium] text-[var(--main)] hover:underline",
              onClick: () => setIsOpenAddAddress(true),
              children: "Add new address"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full flex flex-col gap-y-[8px]", children: address.map((data) => /* @__PURE__ */ jsx(
          AddressSelectionCard,
          {
            data,
            isSelected: data?.id === shippingAddressId,
            onClick: () => onSelectedAddress(data?.id, "shipping")
          },
          data?.id
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-[Nunito-medium] text-[20px] text-[var(--main)] tracking-wide", children: "BILLING ADDRESS" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "text-base font-[Nunito-medium] text-[var(--main)] hover:underline",
              onClick: () => setIsOpenAddAddress(true),
              children: "Add new address"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex items-center justify-between mb-6 p-4 rounded-lg border cursor-pointer ${sameAsShipping ? "border-[var(--main)]" : "border-[var(--borders)]"}`,
            onClick: onSwitchChange,
            children: [
              /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-base text-[var(--main)]", children: "Same as Shipping address" }),
              /* @__PURE__ */ jsxs("div", { className: "relative w-12 h-6 flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `w-full h-full rounded-full transition-colors duration-300 ${sameAsShipping ? "bg-[#00214c]" : "bg-gray-300"}`
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `absolute left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${sameAsShipping ? "translate-x-6" : "translate-x-0"}`
                  }
                )
              ] })
            ]
          }
        ),
        !sameAsShipping && /* @__PURE__ */ jsx("div", { className: "w-full flex flex-col gap-y-[8px]", children: address.map((data) => {
          const isShipping = data?.id === shippingAddressId;
          if (isShipping) return null;
          return /* @__PURE__ */ jsx(
            AddressSelectionCard,
            {
              data,
              isSelected: data?.id === billingAddressId,
              onClick: () => onSelectedAddress(data?.id, "billing")
            },
            data?.id
          );
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      AddAddressForm,
      {
        isOpen: isOpenAddAddress,
        onClose: () => setIsOpenAddAddress(false),
        refetch
      }
    )
  ] });
};
var AddressSelectionCard = ({
  data,
  isSelected,
  onClick,
  isShippingAddress
}) => {
  const {
    label,
    firstname,
    lastname,
    phone,
    address1,
    address2,
    city,
    country_name,
    state_name
  } = data || {};
  const fullName = `${firstname ?? ""} ${lastname ?? ""}`.trim();
  const fullAddress = [address1, address2, city, state_name, country_name].filter(Boolean).join(", ");
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onClick,
      className: `w-full flex flex-col border-2 cursor-pointer transition-all duration-200 rounded-lg p-[16px] gap-y-[8px] ${isSelected ? "border-[#1e1e1e] bg-gray-50 shadow-sm" : "border-gray-200 hover:border-gray-300"}`,
      children: [
        /* @__PURE__ */ jsxs("p", { className: "font-[Nunito-medium] text-[var(--main)] text-base truncate", children: [
          label,
          isShippingAddress && /* @__PURE__ */ jsx("span", { className: "font-[Nunito-regular] text-[14px] text-[var(--secondary)] ml-1", children: "(Current shipping address)" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-[var(--borders)]" }),
        /* @__PURE__ */ jsxs("p", { className: "font-[Nunito-regular] text-[14px] text-[var(--main)] break-words", children: [
          fullName,
          " | ",
          phone
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-[var(--borders)]" }),
        /* @__PURE__ */ jsx(
          "p",
          {
            className: "font-[Nunito-regular] text-[14px] text-[var(--main)] w-full break-words overflow-hidden text-ellipsis",
            style: {
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical"
            },
            children: fullAddress
          }
        )
      ]
    }
  );
};
var AddressCard = ({
  addressType,
  address,
  type,
  isSelected,
  onClick
}) => {
  const isPayment = type === "stripe";
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `w-full border p-[16px] transition-all duration-150 rounded-lg ${isPayment || isSelected ? "border-[var(--main)]" : "border-[var(--borders)]"} ${!isPayment ? "cursor-pointer" : ""}`,
      onClick,
      children: isPayment ? /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between", children: [
          /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-base text-[var(--main)]", children: addressType }),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "font-[Nunito-regular] text-[var(--main)] text-[14px] mt-[8px] break-words",
              style: {
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              },
              children: address
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "ml-4 flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-[60px] h-[30px] bg-[var(--secondaryBg)] border border-[var(--borders)] rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-[Nunito-bold] text-[var(--main)]", children: "Razorpay" }) }) })
      ] }) : /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-row justify-between items-center", children: /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-base text-[var(--main)]", children: addressType }) }),
        /* @__PURE__ */ jsx(
          "p",
          {
            className: "font-[Nunito-regular] text-[var(--main)] text-[14px] mt-[8px] break-words",
            style: {
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            },
            children: address
          }
        )
      ] })
    }
  );
};
var Checkout = ({ hasDeletedItems }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null;
  return !isSignedIn ? /* @__PURE__ */ jsx(LoginPage, {}) : /* @__PURE__ */ jsx(OrderInfo, { clerkUser: user, hasDeletedItems });
};
var LoginPage = () => {
  const { openSignIn, openSignUp } = useClerk();
  return /* @__PURE__ */ jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center gap-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-[#00214c]/5 rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(
        "svg",
        {
          className: "w-8 h-8 text-[#00214c]",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-[20px] text-[var(--main)]", children: "Sign in to continue" }),
        /* @__PURE__ */ jsx("p", { className: "font-[Nunito-regular] text-[14px] text-[var(--secondary)] mt-1", children: "Please sign in or create an account to checkout." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "w-full font-[Nunito-medium] bg-[var(--main)] text-[var(--secondaryBg)] py-[10px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity",
          onClick: () => openSignIn(),
          children: "Sign in"
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "w-full font-[Nunito-regular] border border-[var(--main)] py-[10px] text-[var(--main)] rounded-lg cursor-pointer hover:bg-[var(--secondaryBg)] transition-colors",
          onClick: () => openSignUp(),
          children: [
            "New here?",
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-[Nunito-medium]", children: "Register your account" })
          ]
        }
      )
    ] })
  ] });
};
var OrderInfo = ({ clerkUser, hasDeletedItems }) => {
  const router = useRouter();
  const { Razorpay } = useRazorpay();
  const { cart, setCart, actions, config, auth } = useCore();
  const [addresses, setAddresses] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const isCartHaveBillingAddress = !!cart?.billing_address;
  const isCarthaveShippingAddress = !!cart?.shipping_address;
  const [orderType, setOrderType] = useState(cart?.order_type ?? "delivery");
  const [sameAsShipping, setSameAsShipping] = useState(
    cart?.billing_address?.id === cart?.shipping_address?.id
  );
  const [selectedAddress, setSelectedAddress] = useState({
    shippingAddressId: cart?.shipping_address?.id ?? null,
    billingAddressId: cart?.billing_address?.id ?? null
  });
  const { shippingAddressId, billingAddressId } = selectedAddress;
  const fetchAddresses = useCallback(async () => {
    try {
      setIsAddressLoading(true);
      if (actions?.getUserAddress && auth?.isSignedIn) {
        const data = await actions.getUserAddress();
        setAddresses(Array.isArray(data) ? data : [data]);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      setAddresses([]);
    } finally {
      setIsAddressLoading(false);
    }
  }, [actions, auth?.isSignedIn]);
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);
  useEffect(() => {
    setOrderType(cart?.order_type ?? "delivery");
    const shippingId = cart?.shipping_address?.id ?? addresses?.[0]?.id;
    const billingId = cart?.billing_address?.id ?? addresses?.[0]?.id;
    setSelectedAddress({
      shippingAddressId: shippingId,
      billingAddressId: billingId
    });
    setSameAsShipping(billingId === shippingId);
  }, [cart, addresses]);
  const onUpdateOrderType = async (type) => {
    try {
      setOrderType(type);
      if (actions?.updateCart && cart?.id) {
        await actions.updateCart({
          id: cart.id,
          order_type: type
        });
        setCart((prev) => ({ ...prev, order_type: type }));
      }
    } catch (err) {
      console.error("Failed to update order type:", err);
    }
  };
  const onRazorPayHandler = (res) => {
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
    console.log({ razorpayKey });
    const options = {
      key: razorpayKey,
      amount: res?.cart?.total / 100,
      currency: "INR",
      name: "Store",
      description: "Order Payment",
      order_id: res?.razor_order_id,
      handler: async (response) => {
        try {
          setIsProcessingPayment(true);
          if (actions?.updateRazorPayment) {
            await actions.updateRazorPayment(
              res?.id,
              response.razorpay_payment_id
            );
          }
          if (res?.id) {
            router.push(`/order/${res.id}?show=true`);
          }
        } catch (err) {
          console.error("Payment update failed:", err);
          setIsProcessingPayment(false);
        }
      },
      prefill: {
        name: clerkUser ? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() : "",
        email: clerkUser?.primaryEmailAddress?.emailAddress ?? "",
        contact: clerkUser?.primaryPhoneNumber ? `${clerkUser.primaryPhoneNumber.phoneNumber}` : ""
      },
      theme: { color: "#1e1e1e" }
    };
    const razorpay = new Razorpay(options);
    razorpay.on("payment.failed", (response) => {
      console.error("Razorpay payment failed:", response);
    });
    razorpay.open();
  };
  const onPlaceOrder = async () => {
    if (hasDeletedItems || !cart?.id) return;
    try {
      setIsPlacingOrder(true);
      if (actions?.createRazorOrder) {
        const orderResponse = await actions.createRazorOrder(cart.id);
        onRazorPayHandler(orderResponse);
      }
    } catch (err) {
      console.error("Failed to create order:", err);
    } finally {
      setIsPlacingOrder(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "font-[Nunito-medium] text-[20px] text-[var(--main)] leading-[24px]", children: "ORDER TYPE" }),
    /* @__PURE__ */ jsx("div", { className: "mt-[16px] flex flex-col gap-y-[16px]", children: /* @__PURE__ */ jsx(
      AddressCard,
      {
        onClick: () => onUpdateOrderType("delivery"),
        isSelected: orderType === "delivery",
        addressType: "Delivery",
        address: "Get your order delivered to your address at ease",
        type: "delivery"
      }
    ) }),
    orderType !== "pickup" && /* @__PURE__ */ jsx("div", { className: "mt-[32px]", children: isAddressLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[var(--secondary)] text-sm font-[Nunito-regular]", children: [
      /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-[var(--main)] border-t-transparent rounded-full animate-spin" }),
      "Loading addresses\u2026"
    ] }) : addresses.length > 0 ? /* @__PURE__ */ jsx(
      AddressSelection,
      {
        address: addresses,
        cart,
        setCart,
        clerkUser,
        refetch: fetchAddresses,
        sameAsShipping,
        setSameAsShipping,
        shippingAddressId,
        billingAddressId,
        setSelectedAddress,
        isCartHaveBillingAddress,
        isCarthaveShippingAddress
      }
    ) : /* @__PURE__ */ jsx(AddressFormInline, { refetch: fetchAddresses }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-[32px]", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-[Nunito-medium] text-[20px] text-[var(--main)]", children: "PAYMENT" }),
      /* @__PURE__ */ jsx("p", { className: "font-[Nunito-regular] text-[14px] text-[var(--secondary)]", children: "All transactions are secure and encrypted." }),
      /* @__PURE__ */ jsx("div", { className: "mt-[16px]", children: /* @__PURE__ */ jsx(
        AddressCard,
        {
          addressType: "Pay with Razorpay",
          address: "Once you click Checkout, you'll be redirected to a secure Razorpay payment window to complete your payment.",
          type: "stripe"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-[32px]", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onPlaceOrder,
          disabled: hasDeletedItems || isPlacingOrder || isAddressLoading,
          className: `px-5 py-3 w-full rounded-lg cursor-pointer font-[Nunito-medium] text-[15px] transition-all duration-300 ${hasDeletedItems || isPlacingOrder || isAddressLoading ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" : "bg-[#00214c] text-white hover:bg-[#000] hover:shadow-lg transform active:scale-[0.98]"}`,
          children: isPlacingOrder ? "Processing\u2026" : hasDeletedItems ? "Remove Deleted Items to Checkout" : "Checkout"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 text-center", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-[#8c92a4] font-[Nunito-regular] leading-relaxed", children: [
          "By placing your order, you agree to our",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/terms-and-conditions",
              className: "text-[#00214c] underline hover:text-[#c8a95a] transition-colors",
              children: "Terms & Conditions"
            }
          ),
          " ",
          "and",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/privacy-policy",
              className: "text-[#00214c] underline hover:text-[#c8a95a] transition-colors",
              children: "Privacy Policy"
            }
          ),
          "."
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 flex justify-center gap-3", children: /* @__PURE__ */ jsx(
          Link,
          {
            href: "/refund-policy",
            className: "text-[10px] text-[#8c92a4] hover:text-[#00214c] transition-colors underline uppercase tracking-wider",
            children: "Refund Policy"
          }
        ) })
      ] }),
      hasDeletedItems && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 mt-2 font-[Nunito-regular]", children: "Please remove unavailable items before proceeding to checkout." })
    ] }),
    isProcessingPayment && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-fadeIn", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-8 max-w-md w-full px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "w-24 h-24 border-[3px] border-[#00214c]/5 rounded-full" }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-24 h-24 border-[3px] border-[#c8a95a] border-t-transparent rounded-full animate-spin" }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", children: /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-[#00214c] rounded-full animate-pulse shadow-[0_0_15px_rgba(0,33,76,0.3)]" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-serif italic text-3xl text-[#00214c] tracking-tight", children: "Processing your payment" }),
          /* @__PURE__ */ jsx("div", { className: "w-12 h-[1px] bg-[#c8a95a] mx-auto opacity-50" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-[#2d2d2d] text-base", children: "We're finalizing your order with Razorpay." }),
          /* @__PURE__ */ jsxs("p", { className: "font-[Nunito-regular] text-[#8c92a4] text-sm leading-relaxed", children: [
            "Please do not refresh the page or close this window. ",
            /* @__PURE__ */ jsx("br", {}),
            "This will only take a moment."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 mt-2", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-1.5 h-1.5 bg-[#c8a95a] rounded-full opacity-20 animate-pulse",
          style: { animationDelay: `${i * 0.2}s` }
        },
        i
      )) })
    ] }) })
  ] });
};
var Checkout_default = Checkout;
var ViewCart = () => {
  const { cart, cartItems } = useAddToCart();
  const { isLoaded } = useUser();
  const { formatCurrency } = useCurrencyFormat();
  const {
    line_items: cartItem = cartItems,
    display_total,
    display_item_total,
    display_ship_total,
    display_tax_total,
    order_type
  } = cart || {};
  console.log({ cart, cartItems });
  const items = cartItems ?? [];
  const isLoading = !isLoaded;
  const deletedItems = items.filter(
    (item) => !item?.line_itemable || item?.line_itemable_deleted
  );
  const hasDeletedItems = deletedItems.length > 0;
  return /* @__PURE__ */ jsx("div", { className: "mx-4 md:mx-[24px] my-[100px] flex justify-center", children: isLoading ? (
    // <ScreenLoading />
    /* @__PURE__ */ jsx(Fragment, { children: "Loading" })
  ) : items.length === 0 ? (
    // <EmptyScreen
    //     icon={<ShoppingBagIcon />}
    //     title={"Your Cart Feels a Little Empty"}
    //     description="Add a touch of charm to your space and style. Browse our handcrafted collections and find something you love."
    // />
    /* @__PURE__ */ jsx(Fragment, { children: "Your Cart Feels a Little Empty" })
  ) : /* @__PURE__ */ jsxs("div", { className: "flex flex-row flex-wrap gap-[16px] max-w-[1248px] w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1 mt-8 md:mt-0", children: /* @__PURE__ */ jsx(Checkout_default, { hasDeletedItems }) }),
    /* @__PURE__ */ jsx("div", { className: "border border-[var(--borders)] sticky hidden md:block" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 md:sticky top-4 self-start mt-[18px] md:mt-0 order-first md:order-last", children: [
      hasDeletedItems && /* @__PURE__ */ jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-800 font-[Nunito-medium]", children: "\u26A0\uFE0F Some items in your cart are no longer available. Please remove them before checkout." }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "font-[Nunito-medium] text-[20px] text-[var(--main)]", children: [
          "ORDER ITEMS (",
          items.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-[500px] overflow-auto mt-3", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-y-[16px]", children: items.map((item) => /* @__PURE__ */ jsx(
          ProductlistCard_default,
          {
            product: item,
            orderType: order_type
          },
          item?.id
        )) }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
          /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-[20px] text-[var(--main)]", children: "Bill summary" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-[24px] space-y-[8px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "font-[Nunito-regular] text-[14px] text-[var(--main)]", children: "Item total" }),
              /* @__PURE__ */ jsx("p", { className: "font-[Nunito-regular] text-[14px] text-[var(--main)]", children: display_item_total ? formatCurrency(display_item_total) : "\u2014" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "font-[Nunito-regular] text-[14px] text-[var(--main)]", children: "Tax" }),
              /* @__PURE__ */ jsx("p", { className: "font-[Nunito-regular] text-[14px] text-[var(--main)]", children: display_tax_total ? formatCurrency(display_tax_total) : "\u2014" })
            ] }),
            order_type !== "pickup" && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "font-[Nunito-regular] text-[14px] text-[var(--main)]", children: "Shipping" }),
              /* @__PURE__ */ jsx("p", { className: "font-[Nunito-regular] text-[14px] text-[var(--main)]", children: display_ship_total === "0.00" || display_ship_total === 0 ? "Free" : display_ship_total ? formatCurrency(display_ship_total) : "\u2014" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "pt-[16px] border-t border-[var(--borders)]", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "font-[Nunito-medium] text-[16px] text-[var(--main)]", children: "Total payment" }),
              /* @__PURE__ */ jsx("p", { className: "font-[Nunito-bold] text-[16px] text-[var(--main)]", children: display_total ? formatCurrency(display_total) : "\u2014" })
            ] }) })
          ] })
        ] })
      ] })
    ] })
  ] }) });
};

export { CartItem, CartPage, CartSummary, CoreProvider, EmptyState, Hello, Spinner, ViewCart, useAddToCart, useAuth, useCart, userCartInfo_default as useCartInfo, useCore, useCurrencyFormat, useLogout, useVariantSelection };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map