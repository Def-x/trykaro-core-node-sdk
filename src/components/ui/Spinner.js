"use client";

import React from "react";

/**
 * Spinner
 *
 * Pure CSS loading spinner — zero dependencies.
 *
 * Props:
 *  - size     "sm" | "md" | "lg"   (default: "md")
 *  - color    CSS color string      (default: "currentColor")
 *  - className  additional classes
 */
export const Spinner = ({ size = "md", color = "currentColor", className = "" }) => {
    const sizeMap = {
        sm: { width: 16, border: 2 },
        md: { width: 24, border: 3 },
        lg: { width: 40, border: 4 },
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
        flexShrink: 0,
    };

    return (
        <>
            <style>{`
                @keyframes defx-spin {
                    0%   { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <span
                role="status"
                aria-label="Loading"
                style={style}
                className={className}
            />
        </>
    );
};
