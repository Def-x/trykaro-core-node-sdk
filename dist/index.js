// src/components/hello.js
import React2 from "react";

// src/context/CoreProvider.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
var CoreContext = createContext(null);
var CoreProvider = ({
  children,
  config = {},
  actions = {},
  toast = null,
  auth = null
}) => {
  const [cart, setCart] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  console.log({ config, actions });
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (!(actions == null ? void 0 : actions.getCart)) return;
        setIsCartLoading(true);
        const data = await actions.getCart(config == null ? void 0 : config.regionId);
        const initialCart = Array.isArray(data) ? data[0] : data;
        console.log({ data, initialCart });
        setCart(initialCart || null);
      } catch (err) {
        console.error("CoreProvider cart load error:", err);
      } finally {
        setIsCartLoading(false);
      }
    };
    loadCart();
  }, [config == null ? void 0 : config.regionId]);
  return /* @__PURE__ */ jsx(
    CoreContext.Provider,
    {
      value: {
        // state
        cart,
        setCart,
        isCartLoading,
        // injected dependencies
        actions,
        toast,
        auth,
        config
      },
      children
    }
  );
};
var useCore = () => {
  const context = useContext(CoreContext);
  if (!context) {
    throw new Error("useCore must be used inside CoreProvider");
  }
  return context;
};

// src/components/hello.js
import { jsx as jsx2 } from "react/jsx-runtime";
var Hello = () => {
  const { cart, isCartLoading } = useCore();
  console.log("Cart:", cart, isCartLoading);
  return /* @__PURE__ */ jsx2("div", { children: isCartLoading ? "Loading..." : "Core Working \u2705" });
};
export {
  CoreProvider,
  Hello,
  useCore
};
