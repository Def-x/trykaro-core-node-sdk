import React6, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { flatten, map, compact, filter, uniqBy } from 'lodash';

// src/context/CoreProvider.js
var CoreContext = createContext(null);
var CoreProvider = ({
  children,
  config = {},
  actions = {},
  toast = null,
  auth = null,
  initialCart = {
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
  }
}) => {
  const [cart, setCart] = useState();
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [region, setRegion] = useState((config == null ? void 0 : config.region) ?? null);
  useEffect(() => {
    console.log("before initialCart");
    if (initialCart || !(actions == null ? void 0 : actions.getCart)) return;
    console.log("before initialCart", { initialCart, actions });
    const loadCart = async () => {
      try {
        setIsCartLoading(true);
        console.log("loadCart", { isSignedIn });
        let resolvedCart = null;
        const isSignedIn = (auth == null ? void 0 : auth.isSignedIn) ?? false;
        if (isSignedIn) {
          const data = await actions.getCart(config == null ? void 0 : config.regionId);
          resolvedCart = Array.isArray(data) ? data[0] : data;
        } else {
          const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cartid") : null;
          console.log({ storedCartId });
          if (storedCartId && (actions == null ? void 0 : actions.getCartById)) {
            resolvedCart = await actions.getCartById(storedCartId, config == null ? void 0 : config.regionId);
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
  }, [config == null ? void 0 : config.regionId, auth == null ? void 0 : auth.isSignedIn]);
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
      config
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
  const isSignedIn = (auth == null ? void 0 : auth.isSignedIn) ?? false;
  const regionId = (config == null ? void 0 : config.regionId) ?? null;
  const getCartItem = (product) => {
    console.log("getCartItem", { product, cart });
    if (!(cart == null ? void 0 : cart.line_items)) return null;
    return cart.line_items.find(
      (item) => {
        var _a;
        return ((_a = item.line_itemable) == null ? void 0 : _a.id) === (product == null ? void 0 : product.id);
      }
    ) ?? null;
  };
  const refreshCart = async (cartId) => {
    var _a, _b;
    console.log("refersh cart", { cartId, isSignedIn });
    try {
      let updatedCart;
      if (isSignedIn) {
        const data = await ((_a = actions.getCart) == null ? void 0 : _a.call(actions, regionId));
        updatedCart = Array.isArray(data) ? data[0] : data;
      } else {
        updatedCart = await ((_b = actions.getCartById) == null ? void 0 : _b.call(actions, cartId, regionId));
      }
      console.log({ updatedCart });
      setCart(updatedCart ?? null);
    } catch (err) {
      console.error("[useAddToCart] refreshCart error:", err);
    }
  };
  const addItemToCart = async (product, resolvedCartId) => {
    var _a, _b, _c, _d, _e;
    console.log("addItemToCart", { product, resolvedCartId });
    const sellingQTY = (_c = (_b = (_a = product == null ? void 0 : product.selling_quantity) == null ? void 0 : _a.values) == null ? void 0 : _b[0]) == null ? void 0 : _c.label;
    const qty = quantity ?? 1;
    const existingLineItem = getCartItem(product);
    if (existingLineItem) {
      const newQty = existingLineItem.quantity + qty;
      await ((_d = actions.updateLineItem) == null ? void 0 : _d.call(actions, existingLineItem.id, { quantity: newQty }));
    } else {
      const body = {
        line_itemable_id: product == null ? void 0 : product.id,
        quantity: qty,
        ...resolvedCartId && !isSignedIn ? { cart_id: resolvedCartId } : {},
        ...regionId ? { region_id: regionId } : {}
      };
      console.log({ body });
      await ((_e = actions.createLineItem) == null ? void 0 : _e.call(actions, body));
    }
    setQuantity(sellingQTY ? Number(sellingQTY) : 1);
    if (resolvedCartId) {
      await refreshCart(resolvedCartId);
    }
  };
  const handleAddToCart = async (product) => {
    var _a, _b, _c;
    try {
      setIsAddToCartLoading(true);
      const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cartid") : null;
      let resolvedCartId = (cart == null ? void 0 : cart.id) ?? storedCartId;
      console.log("handleAddToCart before cart check", { cart, storedCartId, resolvedCartId, storedCartId });
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
        const createdCart = await ((_a = actions.createCart) == null ? void 0 : _a.call(actions, payload));
        console.log("handleAddToCart", { createdCart });
        if (createdCart == null ? void 0 : createdCart.id) {
          resolvedCartId = createdCart.id;
          if (!isSignedIn) {
            localStorage.setItem("cartid", createdCart.id);
          }
          setCart(createdCart);
        }
      }
      await addItemToCart(product, resolvedCartId);
      (_b = toast == null ? void 0 : toast.success) == null ? void 0 : _b.call(toast, "Item added to cart");
    } catch (err) {
      console.error("[useAddToCart] handleAddToCart error:", err);
      (_c = toast == null ? void 0 : toast.error) == null ? void 0 : _c.call(toast, "Failed to add item to cart");
    } finally {
      setIsAddToCartLoading(false);
    }
  };
  const handleDecreaseQty = async (product) => {
    var _a, _b;
    const existingLineItem = getCartItem(product);
    if (!existingLineItem) return;
    try {
      setIsAddToCartLoading(true);
      if (existingLineItem.quantity <= 1) {
        await ((_a = actions.deleteLineItem) == null ? void 0 : _a.call(actions, existingLineItem.id));
      } else {
        await ((_b = actions.updateLineItem) == null ? void 0 : _b.call(actions, existingLineItem.id, {
          quantity: existingLineItem.quantity - 1
        }));
      }
      const activeCartId = cart == null ? void 0 : cart.id;
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
    var _a, _b, _c;
    const existingLineItem = getCartItem(product);
    if (!existingLineItem) return;
    try {
      setIsAddToCartLoading(true);
      await ((_a = actions.deleteLineItem) == null ? void 0 : _a.call(actions, existingLineItem.id));
      const activeCartId = cart == null ? void 0 : cart.id;
      if (activeCartId) {
        await refreshCart(activeCartId);
      }
      (_b = toast == null ? void 0 : toast.success) == null ? void 0 : _b.call(toast, "Item removed from cart");
    } catch (err) {
      console.error("[useAddToCart] handleDeleteLineItem error:", err);
      (_c = toast == null ? void 0 : toast.error) == null ? void 0 : _c.call(toast, "Failed to remove item");
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
    isAddToCartLoading
  };
}

// src/hooks/useCurrencyFormat.js
function useCurrencyFormat() {
  const { config } = useCore();
  const currency = (config == null ? void 0 : config.currency) ?? "USD";
  const locale = (config == null ? void 0 : config.locale) ?? "en-US";
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
  const logout = (auth == null ? void 0 : auth.logout) ?? (() => {
    console.warn("[useLogout] No logout function injected into CoreProvider.");
  });
  return logout;
};
function useVariantSelection(rawProduct) {
  const [selectedOptionsType, setSelectedOptionsType] = useState([]);
  const allVariantOptions = flatten(
    map(
      rawProduct == null ? void 0 : rawProduct.variants,
      (variant) => map(variant == null ? void 0 : variant.variant_options, (variantOption) => {
        var _a, _b, _c, _d;
        return {
          types: variantOption.option_type,
          values: {
            ...variantOption.option_value,
            // Attach variant image when applicable (e.g. Color swatches)
            image: ((_b = (_a = variantOption.option_type) == null ? void 0 : _a.name) == null ? void 0 : _b.toLowerCase()) === "color" ? (_c = variant.product_images) == null ? void 0 : _c[0] : "",
            variant_id: (_d = variantOption == null ? void 0 : variantOption.variant) == null ? void 0 : _d.id,
            // All variant IDs that share this option value (useful for filtering)
            variant_ids: flatten(
              compact(
                map(rawProduct == null ? void 0 : rawProduct.variants, (v) => {
                  var _a2;
                  const matched = filter(v == null ? void 0 : v.variant_options, [
                    "option_value.id",
                    (_a2 = variantOption == null ? void 0 : variantOption.option_value) == null ? void 0 : _a2.id
                  ]);
                  return (matched == null ? void 0 : matched.length) ? v == null ? void 0 : v.id : false;
                })
              )
            )
          }
        };
      })
    )
  );
  const variantOptionTypes = uniqBy(
    map(allVariantOptions, (v) => v == null ? void 0 : v.types).filter(Boolean),
    "id"
  );
  const hasVariants = variantOptionTypes.length > 0;
  useEffect(() => {
    var _a, _b;
    if (!((_a = rawProduct == null ? void 0 : rawProduct.variants) == null ? void 0 : _a.length) || !hasVariants) return;
    const firstVariant = rawProduct.variants.find((v) => v.in_stock || v.purchasable) ?? rawProduct.variants[0];
    if (!((_b = firstVariant == null ? void 0 : firstVariant.variant_options) == null ? void 0 : _b.length)) return;
    const autoSelections = firstVariant.variant_options.map((vo) => ({
      types: vo.option_type,
      values: vo.option_value
    }));
    setSelectedOptionsType(autoSelections);
  }, [rawProduct == null ? void 0 : rawProduct.id]);
  const selectedVariant = (() => {
    var _a;
    if (!selectedOptionsType.length || !((_a = rawProduct == null ? void 0 : rawProduct.variants) == null ? void 0 : _a.length)) return null;
    return rawProduct.variants.find(
      (variant) => selectedOptionsType.every(
        (sel) => variant.variant_options.some(
          (vo) => {
            var _a2, _b, _c, _d;
            return ((_a2 = vo.option_type) == null ? void 0 : _a2.id) === ((_b = sel.types) == null ? void 0 : _b.id) && ((_c = vo.option_value) == null ? void 0 : _c.id) === ((_d = sel.values) == null ? void 0 : _d.id);
          }
        )
      )
    ) ?? null;
  })();
  const isOptionAvailable = (optionType, optionValue) => {
    var _a;
    if (!((_a = rawProduct == null ? void 0 : rawProduct.variants) == null ? void 0 : _a.length)) return false;
    return rawProduct.variants.some(
      (variant) => (variant.in_stock || variant.purchasable) && variant.variant_options.some(
        (vo) => {
          var _a2, _b;
          return ((_a2 = vo.option_type) == null ? void 0 : _a2.id) === (optionType == null ? void 0 : optionType.id) && ((_b = vo.option_value) == null ? void 0 : _b.id) === (optionValue == null ? void 0 : optionValue.id);
        }
      )
    );
  };
  const getValuesForType = (optionType) => {
    if (!(rawProduct == null ? void 0 : rawProduct.variants)) return [];
    const seen = /* @__PURE__ */ new Set();
    const vals = [];
    rawProduct.variants.forEach((v) => {
      var _a;
      (_a = v.variant_options) == null ? void 0 : _a.forEach((vo) => {
        var _a2, _b, _c;
        if (((_a2 = vo.option_type) == null ? void 0 : _a2.id) === (optionType == null ? void 0 : optionType.id) && !seen.has((_b = vo.option_value) == null ? void 0 : _b.id)) {
          seen.add((_c = vo.option_value) == null ? void 0 : _c.id);
          vals.push(vo.option_value);
        }
      });
    });
    return vals;
  };
  const selectOption = (optionValue, optionType) => {
    setSelectedOptionsType((prev) => {
      var _a, _b;
      const isAlreadySelected = prev.some(
        (s) => {
          var _a2, _b2;
          return ((_a2 = s.types) == null ? void 0 : _a2.id) === (optionType == null ? void 0 : optionType.id) && ((_b2 = s.values) == null ? void 0 : _b2.id) === (optionValue == null ? void 0 : optionValue.id);
        }
      );
      if (isAlreadySelected) {
        return prev.filter((s) => {
          var _a2;
          return ((_a2 = s.types) == null ? void 0 : _a2.id) !== (optionType == null ? void 0 : optionType.id);
        });
      }
      const withNewValue = [
        ...prev.filter((p) => {
          var _a2;
          return ((_a2 = p.types) == null ? void 0 : _a2.id) !== (optionType == null ? void 0 : optionType.id);
        }),
        { types: optionType, values: optionValue }
      ];
      const exactMatch = (_a = rawProduct == null ? void 0 : rawProduct.variants) == null ? void 0 : _a.find(
        (v) => withNewValue.every(
          (sel) => v.variant_options.some(
            (vo) => {
              var _a2, _b2, _c, _d;
              return ((_a2 = vo.option_type) == null ? void 0 : _a2.id) === ((_b2 = sel.types) == null ? void 0 : _b2.id) && ((_c = vo.option_value) == null ? void 0 : _c.id) === ((_d = sel.values) == null ? void 0 : _d.id);
            }
          )
        )
      );
      const matchingVariant = exactMatch ?? ((_b = rawProduct == null ? void 0 : rawProduct.variants) == null ? void 0 : _b.find(
        (v) => v.variant_options.some(
          (vo) => {
            var _a2, _b2;
            return ((_a2 = vo.option_type) == null ? void 0 : _a2.id) === (optionType == null ? void 0 : optionType.id) && ((_b2 = vo.option_value) == null ? void 0 : _b2.id) === (optionValue == null ? void 0 : optionValue.id);
          }
        )
      ));
      if (!matchingVariant) return withNewValue;
      const autoFilled = [{ types: optionType, values: optionValue }];
      matchingVariant.variant_options.forEach((vo) => {
        var _a2;
        if (((_a2 = vo.option_type) == null ? void 0 : _a2.id) === (optionType == null ? void 0 : optionType.id)) return;
        if (!autoFilled.some((s) => {
          var _a3, _b2;
          return ((_a3 = s.types) == null ? void 0 : _a3.id) === ((_b2 = vo.option_type) == null ? void 0 : _b2.id);
        })) {
          autoFilled.push({ types: vo.option_type, values: vo.option_value });
        }
      });
      return autoFilled;
    });
  };
  const getDisplayImages = (productImages = []) => {
    var _a;
    if (!((_a = selectedVariant == null ? void 0 : selectedVariant.product_images) == null ? void 0 : _a.length)) return productImages;
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
  var _a, _b;
  const { handleAddToCart, handleDecreaseQty, handleDeleteLineItem, isAddToCartLoading } = useAddToCart();
  const { formatCurrency } = useCurrencyFormat();
  const product = item == null ? void 0 : item.line_itemable;
  const name = (product == null ? void 0 : product.name) ?? (item == null ? void 0 : item.name) ?? "Product";
  const price = (item == null ? void 0 : item.price) ?? (product == null ? void 0 : product.price) ?? 0;
  const quantity = (item == null ? void 0 : item.quantity) ?? 0;
  const imageUrl = ((_b = (_a = product == null ? void 0 : product.product_images) == null ? void 0 : _a[0]) == null ? void 0 : _b.product_image_url) ?? (product == null ? void 0 : product.image_url) ?? null;
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
  var _a;
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
  const itemCount = (cart == null ? void 0 : cart.item_count) ?? ((_a = cart == null ? void 0 : cart.line_items) == null ? void 0 : _a.length) ?? 0;
  const itemTotal = (cart == null ? void 0 : cart.item_total) ?? 0;
  const shipTotal = (cart == null ? void 0 : cart.ship_total) ?? 0;
  const taxTotal = (cart == null ? void 0 : cart.tax_total) ?? 0;
  const grandTotal = (cart == null ? void 0 : cart.total) ?? itemTotal + shipTotal + taxTotal;
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
    renderFooter == null ? void 0 : renderFooter()
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
  const lineItems = (cart == null ? void 0 : cart.line_items) ?? [];
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

export { CartItem, CartPage, CartSummary, CoreProvider, EmptyState, Hello, Spinner, useAddToCart, useAuth, useCart, userCartInfo_default as useCartInfo, useCore, useCurrencyFormat, useLogout, useVariantSelection };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map