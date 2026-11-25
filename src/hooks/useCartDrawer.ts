"use client";

import { useCore } from "../context/CoreProvider";

export interface UseCartDrawerReturn {
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  setIsCartDrawerOpen: (open: boolean) => void;
}

export const useCartDrawer = (): UseCartDrawerReturn => {
  const core = useCore();

  const isCartDrawerOpen = Boolean(core?.isCartDrawerOpen);
  const openCartDrawer = core?.openCartDrawer || (() => {});
  const closeCartDrawer = core?.closeCartDrawer || (() => {});
  const toggleCartDrawer = core?.toggleCartDrawer || (() => {});
  const setIsCartDrawerOpen = core?.setIsCartDrawerOpen || (() => {});

  return {
    isCartDrawerOpen,
    openCartDrawer,
    closeCartDrawer,
    toggleCartDrawer,
    setIsCartDrawerOpen,
  };
};

export default useCartDrawer;
