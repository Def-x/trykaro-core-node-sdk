"use client";

import React from "react";
import { AccountSidebar, AccountSidebarProps } from "./AccountSidebar";

export interface AccountLayoutProps {
  children?: React.ReactNode;
  sidebarProps?: AccountSidebarProps;
  className?: string;
  containerClassName?: string;
  panelClassName?: string;
  mainClassName?: string;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({
  children,
  sidebarProps,
  className = "",
  containerClassName = "",
  panelClassName = "",
  mainClassName = "",
}) => {
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

