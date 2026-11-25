"use client";

import React from "react";
import { useCore } from "../../context/CoreProvider";
import { useLogout } from "../../hooks/useLogout";
import { useStorefrontRouter } from "../../utils/navigation";
import {
  AccountGiftIcon,
  AccountHeartIcon,
  AccountLogOutIcon,
  AccountMapPinIcon,
  AccountShoppingBagIcon,
} from "./AccountIcons";

export interface AccountNavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
}

export const DEFAULT_NAV_ITEMS: AccountNavItem[] = [
  { label: "My Addresses", href: "/account/addresses", icon: AccountMapPinIcon },
  { label: "My Orders", href: "/account/orders", icon: AccountShoppingBagIcon },
  { label: "My Wishlist", href: "/account/wishlist", icon: AccountHeartIcon },
  { label: "Loyalty & Rewards", href: "/account/rewards", icon: AccountGiftIcon },
];

const getContactInfo = (user: any) =>
  user?.phone ||
  user?.mobile ||
  user?.email ||
  user?.email_address ||
  user?.primaryPhoneNumber?.phoneNumber ||
  user?.primaryEmailAddress?.emailAddress ||
  "Guest User";

export interface AccountSidebarProps {
  navItems?: AccountNavItem[];
  user?: any;
  contactInfo?: string;
  onNavigate?: (href: string) => void;
  onLogout?: () => void;
  className?: string;
  showLogout?: boolean;
  logoutLabel?: string;
  pathname?: string;
  router?: any;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  navItems = DEFAULT_NAV_ITEMS,
  user,
  contactInfo,
  onNavigate,
  onLogout,
  className = "",
  showLogout = true,
  logoutLabel = "Logout",
  pathname: overridePathname,
  router: overrideRouter,
}) => {
  const router = useStorefrontRouter(overrideRouter);
  const pathname = overridePathname ?? router.pathname;
  const coreLogout = useLogout();
  const { auth } = useCore();
  const resolvedContactInfo = contactInfo ?? getContactInfo(user ?? auth?.user);

  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
      return;
    }
    router.push(href);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    coreLogout();
  };

  return (
    <aside
      className={`w-[220px] flex-shrink-0 border-r border-gray-100 bg-white max-md:w-full max-md:border-b max-md:border-r-0 ${className}`}
    >
      <div className="border-b border-gray-100 px-5 py-5 text-center">
        <p className="truncate px-2 text-[13px] font-[var(--font-medium)] tracking-wide text-[#555555]">
          {resolvedContactInfo}
        </p>
      </div>

      <nav className="flex flex-col py-2 max-md:flex-row max-md:overflow-x-auto max-md:py-0">
        {navItems.map(({ label, href, icon: Icon = AccountMapPinIcon }) => {
          const isActive =
            href === "/account" ? pathname === href : pathname.startsWith(href);

          return (
            <button
              key={href}
              type="button"
              onClick={() => handleNavigate(href)}
              className={`flex items-center gap-3 border-l-[3px] px-5 py-[13px] text-left transition-colors max-md:min-w-max max-md:border-b-[3px] max-md:border-l-0 ${
                isActive
                  ? "border-l-[var(--core-primary)] bg-[#EBF0FC] text-[#1C1C1C] max-md:border-b-[var(--core-primary)]"
                  : "border-l-transparent text-[#555555] hover:bg-[#FAFAFA] max-md:border-b-transparent"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] flex-shrink-0 ${
                  isActive ? "text-[var(--core-primary)]" : "text-[#888888]"
                }`}
              />
              <span
                className={`text-[14px] ${
                  isActive
                    ? "font-[var(--font-semibold)] text-[#1C1C1C]"
                    : "font-[var(--font-medium)] text-[#555555]"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}

        {showLogout && (
          <>
            <div className="mx-5 my-2 border-t border-gray-100 max-md:hidden" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 border-l-[3px] border-l-transparent px-5 py-[13px] text-left text-[#555555] transition-colors hover:bg-[#FAFAFA] max-md:ml-auto max-md:min-w-max max-md:border-l-0"
            >
              <AccountLogOutIcon className="h-[18px] w-[18px] flex-shrink-0 text-[#888888]" />
              <span className="text-[14px] font-[var(--font-medium)]">
                {logoutLabel}
              </span>
            </button>
          </>
        )}
      </nav>
    </aside>
  );
};

export { DEFAULT_NAV_ITEMS as DEFAULT_ACCOUNT_NAV_ITEMS };
export default AccountSidebar;

