"use client";
import React from "react";
import { useCore } from "../context/CoreProvider";

export const Hello = () => {
    const { cart, isCartLoading } = useCore();

    console.log("Cart:", cart, isCartLoading);
    return (
        <div>
            {isCartLoading ? "Loading..." : "Core Working ✅"}
        </div>
    );
};