"use client";

import React, { useState, useEffect } from "react";
import { AccountSidebar, AccountSidebarProps } from "./AccountSidebar";
import { useStorefrontRouter } from "../../utils/navigation";

export interface AccountLayoutProps {
  children?: React.ReactNode;
  sidebarProps?: AccountSidebarProps;
  className?: string;
  containerClassName?: string;
  panelClassName?: string;
  mainClassName?: string;
  fullWidth?: boolean;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({
  children,
  sidebarProps,
  className = "",
  containerClassName = "",
  panelClassName = "",
  mainClassName = "",
  fullWidth,
}) => {
  const router = useStorefrontRouter(sidebarProps?.router);
  const [clientPath, setClientPath] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientPath(window.location.pathname);
    }
  }, []);

  const activePath =
    sidebarProps?.pathname ||
    router?.pathname ||
    clientPath ||
    (typeof window !== "undefined" ? window.location.pathname : "");

  const isRewardsPage =
    fullWidth ||
    Boolean(
      activePath &&
        (activePath.includes("/rewards") || activePath.includes("/loyalty")),
    );

  if (isRewardsPage) {
    return (
      <div className={`min-h-screen bg-[#F8F9FA] ${className}`}>
        <div
          className={`mx-auto max-w-[1240px] px-4 py-8 max-md:px-3 max-md:py-4 ${containerClassName}`}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F0F0F0] ${className}`}>
      <div className={`mx-auto max-w-[900px] px-4 py-8 ${containerClassName}`}>
        <div
          className={`flex min-h-[520px] overflow-hidden rounded-lg bg-white shadow-sm max-md:flex-col ${panelClassName}`}
        >
          <AccountSidebar {...sidebarProps} />
          <main className={`flex-1 p-8 max-md:p-5 ${mainClassName}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;

