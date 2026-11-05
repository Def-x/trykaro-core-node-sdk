"use client";

import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  strokeWidth?: number;
  fill?: string;
  filled?: boolean;
}

const IconBase: React.FC<IconProps> = ({
  children,
  className = "h-5 w-5",
  strokeWidth = 1.75,
  fill = "none",
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

export const AccountMapPinIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </IconBase>
);

export const AccountShoppingBagIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M6 8h12l-1 13H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </IconBase>
);

export const AccountHeartIcon: React.FC<IconProps> = ({ filled = false, ...props }) => (
  <IconBase {...props} fill={filled ? "currentColor" : "none"}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
  </IconBase>
);

export const AccountLogOutIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </IconBase>
);

export const AccountPlusIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </IconBase>
);

export const AccountPencilIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
  </IconBase>
);

export const AccountTrashIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </IconBase>
);

export const AccountPackageIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </IconBase>
);

export const AccountCalendarIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </IconBase>
);

export const AccountTagIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </IconBase>
);

export const AccountArrowLeftIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </IconBase>
);

export const AccountCopyIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <rect x="2" y="2" width="13" height="13" rx="2" />
  </IconBase>
);

export const AccountCheckIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M20 6 9 17l-5-5" />
  </IconBase>
);

