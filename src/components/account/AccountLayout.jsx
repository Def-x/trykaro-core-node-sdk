"use client";

import React from "react";
import { AccountSidebar } from "./AccountSidebar";

export const AccountLayout = ({
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
        <div className={`flex min-h-[520px] overflow-hidden rounded-lg bg-white shadow-sm max-md:flex-col ${panelClassName}`}>
          <AccountSidebar {...sidebarProps} />
          <main className={`flex-1 p-8 max-md:p-5 ${mainClassName}`}>{children}</main>
        </div>
      </div>
    </div>
  );
};
