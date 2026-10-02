"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { findSizeOption, resolveSizeOptions } from "@/lib/size-pricing";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  /**
   * The product still exists but cannot currently be bought (deactivated or
   * out of stock). The line is kept so the customer can see what happened and
   * remove it deliberately, but checkout is blocked while it is present.
   */
  unavailable?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  loading: boolean;
  /** True when at least one line cannot currently be purchased. */
  hasUnavailableItems: boolean;
  /** Set when a sync removed a line whose product no longer exists. */
  removedNotice: string | null;
  dismissRemovedNotice: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem("safari-cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

type FreshProduct = {
  id: string;
  name?: string;
  price?: number;
  image?: string;
  size?: string | null;
  type?: string | null;
  isActive?: boolean;
  inStock?: boolean;
  sizePrices?: string | null;
  sizesAvailable?: string | null;
  price3mlOnline?: number | null;
  price6mlOnline?: number | null;
  price12mlOnline?: number | null;
  price50mlOnline?: number | null;
};

/**
 * Outcome of validating one cart line against the catalogue.
 *
 * The distinction between `missing` and `error` is the whole point: only a
 * product the server positively reports as absent may be dropped from a
 * customer's bag. A timeout, an offline device, a 5xx or an expired session
 * all resolve to `error`, which leaves the line untouched. Treating an
 * unreachable server as "product deleted" would empty real carts.
 */
type LineCheck =
  | { status: 'ok'; product: FreshProduct }
  | { status: 'missing' }
  | { status: 'error' };

// Effective price for a cart line = the CURRENT retail price of the size the
// customer actually selected, resolved from price{3,6,12,50}mlOnline via the
// shared size-pricing helper. The base `price` column is a stale bulk-import
// artifact and is never used as a line price. Returning null means "no price
// for this size" and the line is left untouched rather than being rewritten
// with a bogus figure.
function effectivePrice(product: FreshProduct, size: string | null | undefined): number | null {
  const option = findSizeOption(resolveSizeOptions(product), size);
  return option ? option.price : null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removedNotice, setRemovedNotice] = useState<string | null>(null);
  const { user } = useAuth();
  const debouncedItems = useDebounce(items, 500);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const hasUnavailableItems = useMemo(() => items.some((item) => item.unavailable), [items]);

  // Keys only on the set of product ids (not price/name/image), so a price sync
  // never retriggers itself.
  const cartIdsKey = useMemo(
    () => [...new Set(items.map((i) => i.id).filter(Boolean))].sort().join('|'),
    [items]
  );

  // Refresh cart line price/name/image from the CURRENT DB state.
  // The cart used to persist a full snapshot (price/name/image) in localStorage +
  // the CartItem table, so a product price change in the admin panel left old
  // carts showing the OLD price. This sync overrides stale snapshots with fresh
  // DB values on cart load / tab refocus / cart contents change.
  const refreshPrices = useCallback(async () => {
    const ids = cartIdsKey === '' ? [] : cartIdsKey.split('|');
    if (ids.length === 0) return;

    let checks: LineCheck[];
    try {
      checks = await Promise.all(
        ids.map(async (id): Promise<LineCheck> => {
          try {
            const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
              cache: 'no-store',
            });
            // Only an explicit 404 means "this product does not exist".
            if (res.status === 404) return { status: 'missing' };
            // 401/403 (expired session), 429, 5xx and anything else are
            // inconclusive: keep the line exactly as it is.
            if (!res.ok) return { status: 'error' };
            return { status: 'ok', product: (await res.json()) as FreshProduct };
          } catch {
            // Offline, DNS failure, abort, CORS: never treat as deletion.
            return { status: 'error' };
          }
        })
      );
    } catch {
      return;
    }

    const byId = new Map<string, LineCheck>();
    ids.forEach((id, i) => byId.set(id, checks[i]));

    // Counted outside the state updater: React may invoke the updater more than
    // once (StrictMode / concurrent re-render), which would double-count.
    const missingCount = checks.filter((c) => c.status === 'missing').length;

    setItems((prev) =>
      prev.flatMap((item) => {
        const check = byId.get(item.id);
        // Unknown id (added between renders) or inconclusive result: keep.
        if (!check || check.status === 'error') return [item];

        if (check.status === 'missing') return [];

        const p = check.product;
        const price = effectivePrice(p, item.size);
        // Exists but not currently sellable. Keep the line so the customer
        // sees it and can remove it, and flag it so checkout can be blocked.
        const unavailable = p.isActive === false || p.inStock === false;
        return [
          {
            ...item,
            name: p.name ? p.name : item.name,
            ...(price !== null ? { price } : {}),
            image: p.image ? p.image : item.image,
            unavailable,
          },
        ];
      })
    );

    if (missingCount > 0) {
      setRemovedNotice('An item in your cart is no longer available');
    }
  }, [cartIdsKey]);

  // Initial sync on mount (and whenever cart contents change).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshPrices();
  }, [refreshPrices]);

  // Hydrate the persisted cart from localStorage AFTER mount so the server
  // HTML and the first client render always match (avoids hydration mismatch
  // where SSR shows an empty cart but the client reads localStorage).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(loadCartFromStorage());
  }, []);

  // Resync when the tab regains focus — catches admin-side price changes
  // that happened while the user was browsing elsewhere.
  useEffect(() => {
    const onFocus = () => void refreshPrices();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshPrices]);

  useEffect(() => {
    localStorage.setItem("safari-cart", JSON.stringify(items));
  }, [items]);

  const saveCartToDB = useCallback(async (cart: CartItem[]) => {
    if (!user || cart.length === 0) return;
    setLoading(true);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });
    } catch (e) {
      console.error("Failed to save cart to DB", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id && item.size === newItem.size);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id && item.size === newItem.size
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((id: string, size: string) => {
    setItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  }, []);

  const updateQuantity = useCallback((id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      saveCartToDB(debouncedItems);
    }
  }, [user, debouncedItems, saveCartToDB]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        loading,
        hasUnavailableItems,
        removedNotice,
        dismissRemovedNotice: () => setRemovedNotice(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
