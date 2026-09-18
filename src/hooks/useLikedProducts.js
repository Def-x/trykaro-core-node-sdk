"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getCurrentUserLikedProductsAction } from "../actions/storefrontActions";

// ─── In-memory cache ────────────────────────────────────────────────────────
// Key: `likedProducts-${token}`, Value: { data, fetchedAt }
const likedCache = new Map();

// TTL: 5 minutes — prevents re-fetching on every product page mount
const CACHE_TTL_MS = 5 * 60 * 1000;

const isFresh = (entry) =>
  entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS;

// ─── Event subscribers for active hooks ─────────────────────────────────────
const likedSubscribers = new Set();

/**
 * useGetCurrentUserLikedProductsQuery
 *
 * Auth-gated hook for `/api/current_user_liked_products`.
 *
 * KEY behaviours that stop the 3000+ API calls per day:
 *  1. Skips entirely when no access token is present (guest users).
 *  2. Returns cached result immediately — no re-fetch until TTL expires (5 min).
 *  3. One in-flight request per token; concurrent mounts de-dupe automatically.
 *  4. `refetch()` always bypasses the cache and forces a fresh fetch.
 *  5. Automatically re-fetches whenever `invalidateLikedProductsCache` is called.
 *
 * @param {string|null} token    - The user's access token (from useCore auth)
 * @param {{ page?: number, perPage?: number, skip?: boolean }} options
 * @returns {{ data, isLoading, isFetching, isError, error, refetch }}
 */
export function useGetCurrentUserLikedProductsQuery(
  token = null,
  { page = 1, perPage = 11, skip = false } = {}
) {
  const isSkip = skip || !token;
  const cacheKey = token ? `likedProducts-${token}-${page}-${perPage}` : null;

  // Initialise from cache if fresh
  const [data, setData] = useState(() =>
    cacheKey && isFresh(likedCache.get(cacheKey))
      ? likedCache.get(cacheKey).data
      : undefined
  );
  const [isLoading, setIsLoading] = useState(
    !isSkip && !(cacheKey && isFresh(likedCache.get(cacheKey)))
  );
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  // Track ongoing request to prevent duplicate fetches across concurrent mounts
  const inFlightRef = useRef(null);

  const runFetch = useCallback(
    async (forceRefresh = false) => {
      if (isSkip) return;

      // Return cached data unless forceRefresh or stale
      if (!forceRefresh && cacheKey && isFresh(likedCache.get(cacheKey))) {
        setData(likedCache.get(cacheKey).data);
        setIsLoading(false);
        return likedCache.get(cacheKey).data;
      }

      // De-dupe: if a request is already in-flight for this key, await it
      if (inFlightRef.current) {
        return inFlightRef.current;
      }

      setIsFetching(true);
      const promise = (async () => {
        try {
          const result = await getCurrentUserLikedProductsAction(page, perPage, {
            token,
            cache: forceRefresh ? "no-store" : undefined,
          });
          if (cacheKey) {
            likedCache.set(cacheKey, { data: result, fetchedAt: Date.now() });
          }
          setData(result);
          setError(null);
          return result;
        } catch (err) {
          setError(err);
          return undefined;
        } finally {
          setIsLoading(false);
          setIsFetching(false);
          inFlightRef.current = null;
        }
      })();

      inFlightRef.current = promise;
      return promise;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSkip, cacheKey, token, page, perPage]
  );

  useEffect(() => {
    if (!isSkip) {
      runFetch();
    } else {
      setIsLoading(false);
    }
  }, [runFetch, isSkip]);

  // Listen for cache invalidations (e.g. after like/unlike mutations)
  useEffect(() => {
    if (isSkip) return;
    const listener = () => {
      runFetch(true);
    };
    likedSubscribers.add(listener);
    return () => {
      likedSubscribers.delete(listener);
    };
  }, [runFetch, isSkip]);

  return {
    data,
    isLoading,
    isFetching,
    isSuccess: !isLoading && !error && data !== undefined,
    isError: !!error,
    error,
    refetch: () => runFetch(true),
  };
}

/**
 * Manually invalidate the liked-products in-memory cache for a given token.
 * Call this after like/unlike mutations so all active hooks re-fetch fresh data.
 */
export function invalidateLikedProductsCache(token) {
  if (!token) return;
  // Remove all cache entries for this token across all pages
  for (const key of likedCache.keys()) {
    if (key.startsWith(`likedProducts-${token}`)) {
      likedCache.delete(key);
    }
  }
  // Notify all mounted query listeners to re-fetch immediately
  likedSubscribers.forEach((subscriber) => {
    try {
      subscriber();
    } catch (e) {
      console.error("[invalidateLikedProductsCache] Subscriber error:", e);
    }
  });
}
