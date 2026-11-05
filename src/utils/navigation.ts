"use client";

import { useMemo } from "react";
import { useCore } from "../context/CoreProvider";
import type { RouterAdapter } from "../types/adapters";

export interface SdkRouter extends RouterAdapter {
  push: (url: string) => void | Promise<boolean | void>;
  replace: (url: string) => void | Promise<boolean | void>;
  prefetch: (url: string) => void;
  refresh: () => void;
  back: () => void;
  pathname: string;
  searchParams: any;
}

/**
 * useStorefrontRouter
 *
 * Provides a framework-agnostic navigation abstraction.
 * If the host application supplies an `adapter.router` to <CoreProvider>, it is used.
 * Otherwise, falls back safely to standard browser window.location and window.history APIs.
 */
export const useStorefrontRouter = (overrideRouter?: RouterAdapter): SdkRouter => {
  const core = useCore();
  const routerAdapter = overrideRouter ?? core?.adapter?.router;

  return useMemo<SdkRouter>(() => {
    if (routerAdapter) {
      return {
        push: (url: string) => {
          if (routerAdapter.push) return routerAdapter.push(url);
          if (typeof window !== "undefined") window.location.href = url;
        },
        replace: (url: string) => {
          if (routerAdapter.replace) return routerAdapter.replace(url);
          if (typeof window !== "undefined") window.location.replace(url);
        },
        prefetch: (url: string) => {
          routerAdapter.prefetch?.(url);
        },
        refresh: () => {
          if (routerAdapter.refresh) return routerAdapter.refresh();
          if (typeof window !== "undefined") window.location.reload();
        },
        back: () => {
          if (routerAdapter.back) return routerAdapter.back();
          if (typeof window !== "undefined") window.history.back();
        },
        pathname:
          routerAdapter.pathname ??
          (typeof window !== "undefined" ? window.location.pathname : "/"),
        searchParams:
          routerAdapter.searchParams ??
          (typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams()),
      };
    }

    return {
      push: (url: string) => {
        if (typeof window !== "undefined") window.location.href = url;
      },
      replace: (url: string) => {
        if (typeof window !== "undefined") window.location.replace(url);
      },
      prefetch: (_url: string) => {},
      refresh: () => {
        if (typeof window !== "undefined") window.location.reload();
      },
      back: () => {
        if (typeof window !== "undefined") window.history.back();
      },
      pathname: typeof window !== "undefined" ? window.location.pathname : "/",
      searchParams:
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams(),
    };
  }, [routerAdapter]);
};

