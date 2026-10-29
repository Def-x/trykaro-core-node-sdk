"use client";

import React from "react";

/**
 * EmptyState
 *
 * Generic empty state component.
 *
 * Props:
 *  - icon       ReactNode  (optional — renders above title)
 *  - title      string     (default: "Nothing here yet")
 *  - description string    (optional subtitle)
 *  - action     ReactNode  (optional CTA button / link)
 *  - className  string     additional wrapper class
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = null,
    title = "Nothing here yet",
    description = "",
    action = null,
    className = "",
}) => {
    const styles: Record<string, React.CSSProperties> = {
        wrapper: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 1.5rem",
            textAlign: "center",
            gap: "0.75rem",
        },
        icon: {
            fontSize: "2.5rem",
            lineHeight: 1,
            opacity: 0.5,
        },
        title: {
            fontSize: "1.125rem",
            fontWeight: 600,
            margin: 0,
            color: "inherit",
        },
        description: {
            fontSize: "0.875rem",
            opacity: 0.6,
            margin: 0,
            maxWidth: 320,
        },
    };

    return (
        <div style={styles.wrapper} className={className}>
            {icon && <span style={styles.icon}>{icon}</span>}
            <p style={styles.title}>{title}</p>
            {description && <p style={styles.description}>{description}</p>}
            {action}
        </div>
    );
};
