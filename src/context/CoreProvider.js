"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const CoreContext = createContext(null);

export const CoreProvider = ({
    children,
    config = {},
    actions = {},
    toast = null,
    auth = null,
}) => {
    const [cart, setCart] = useState(null);
    const [isCartLoading, setIsCartLoading] = useState(false);
    console.log({ config, actions })
    // 🔥 Initial Cart Load
    useEffect(() => {
        const loadCart = async () => {
            try {
                if (!actions?.getCart) return;

                setIsCartLoading(true);

                const data = await actions.getCart(config?.regionId);
                const initialCart = Array.isArray(data) ? data[0] : data;
                console.log({ data, initialCart })
                setCart(initialCart || null);
            } catch (err) {
                console.error("CoreProvider cart load error:", err);
            } finally {
                setIsCartLoading(false);
            }
        };

        loadCart();
    }, [config?.regionId]);

    return (
        <CoreContext.Provider
            value={{
                // state
                cart,
                setCart,
                isCartLoading,

                // injected dependencies
                actions,
                toast,
                auth,
                config,
            }}
        >
            {children}
        </CoreContext.Provider>
    );
};

export const useCore = () => {
    const context = useContext(CoreContext);

    if (!context) {
        throw new Error("useCore must be used inside CoreProvider");
    }

    return context;
};