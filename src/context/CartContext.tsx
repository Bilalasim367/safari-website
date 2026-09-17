"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
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
  sizePrices?: string | null;
};

// Effective price for a cart line = the CURRENT DB base price, which is the ONLY
// price the storefront ever shows (PDP, product cards — there is no size selector
// and no UI uses sizePrices). This keeps PDP price === cart price === checkout
// price === order price. Never trust the snapshot price stored at add-time.
function effectivePrice(product: FreshProduct): number | null {
  return typeof product.price === 'number' && Number.isFinite(product.price)
    ? product.price
    : null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const debouncedItems = useDebounce(items, 500);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

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

    let products: (FreshProduct | null)[];
    try {
      products = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
              cache: 'no-store',
            });
            if (!res.ok) return null;
            return (await res.json()) as FreshProduct;
          } catch {
            return null;
          }
        })
      );
    } catch {
      return;
    }

    const map = new Map<string, FreshProduct>();
    for (const p of products) {
      if (p && p.id) map.set(p.id, p);
    }

    setItems((prev) =>
      prev.map((item) => {
        const p = map.get(item.id);
        if (!p) return item;
        const price = effectivePrice(p);
        const freshSize = p.size && p.size.trim() ? p.size.trim() : null;
        return {
          ...item,
          name: p.name ? p.name : item.name,
          ...(price !== null ? { price } : {}),
          image: p.image ? p.image : item.image,
          // Sync the size label from the current DB product too — an attar once
          // stored as "50ml" would otherwise keep showing 50ml in the cart even
          // after the data is corrected (same stale-snapshot problem as price).
          size: freshSize || item.size,
        };
      })
    );
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
