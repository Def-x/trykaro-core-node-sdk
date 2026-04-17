"use client";

import React, { useState, useEffect } from "react";
import { useCore } from "../../context/CoreProvider";
import { useLogout } from "../../hooks/useLogout";
import { UserInfo } from "./UserInfo";
import { OrdersList } from "./OrdersList";

/**
 * AccountPage Component
 * 
 * The main container for the user account section.
 * Features a sticky sidebar for navigation between Profile, Orders, and Logout.
 * 
 * Props:
 * - initialTab: 'profile' | 'orders' (optional)
 */
export const AccountPage = ({ initialTab = "profile" }) => {
  const { auth, actions } = useCore();
  const logout = useLogout();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      if (actions?.getUser) {
        const user = await actions.getUser();
        console.log("user", { user });
        setUserData(user);
      } else {
        // Fallback to auth user if action not provided
        setUserData(auth?.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [auth?.user]);

  const navItems = [
    { id: "profile", label: "My Profile" },
    { id: "orders", label: "My Orders" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 md:px-8 lg:px-[32px] py-[40px] md:py-[100px] flex flex-col md:flex-row items-start justify-between gap-8 w-full">

        {/* ── Sidebar ── */}
        <aside className="w-full md:w-[280px] lg:w-[320px] md:sticky top-[40px]">
          <h1 className="font-[Nunito-regular] text-[40px] md:text-[48px] leading-[1.05] text-[#00214c] mb-8 tracking-tight uppercase">
            MY ACCOUNT
          </h1>

          <nav>
            <ul className="space-y-1 font-[Nunito-medium]">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-3 text-[14px] uppercase tracking-wider transition-all duration-200 ${activeTab === item.id
                      ? "bg-[#00214c] text-white"
                      : "text-[#2d2d2d] hover:bg-[#f5f2ec]"
                      }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-[14px] uppercase tracking-wider text-[#2d2d2d] hover:bg-[#f5f2ec] transition-all duration-200 mt-4 border-t border-gray-100 pt-5"
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* ── Bottom Content (Mobile) or Right Content (Desktop) ── */}
        <main className="flex-1 min-w-0 w-full max-w-[860px]">
          {activeTab === "profile" ? (
            <UserInfo
              user={userData}
              isLoading={isLoading}
              refetch={fetchUserData}
            />
          ) : (
            <OrdersList />
          )}
        </main>
      </div>
    </div>
  );
};
