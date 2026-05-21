"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  items: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/wishlist');
        const data = await res.json();
        if (!cancelled) setItems(data.wishlist || []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const isWishlisted = useCallback((productId: string) => {
    return items.includes(productId);
  }, [items]);

  const toggleWishlist = useCallback(async (productId: string) => {
    const was = items.includes(productId);

    setItems(prev =>
      was ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    try {
      if (was) {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      }
    } catch {
      setItems(prev =>
        was ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    }
  }, [items]);

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
