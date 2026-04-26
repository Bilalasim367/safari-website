"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number, size: string) => void;
  updateQuantity: (id: number, size: string, quantity: number) => void;
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const debouncedItems = useDebounce(items, 500);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem("safari-cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("safari-cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

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
      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item.id === newItem.id && item.size === newItem.size
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        newCart = [...prev, newItem];
      }
      saveCartToDB(newCart);
      return newCart;
    });
    setIsCartOpen(true);
  }, [saveCartToDB]);

  const removeItem = useCallback((id: number, size: string) => {
    setItems((prev) => {
      const newCart = prev.filter((item) => !(item.id === id && item.size === size));
      saveCartToDB(newCart);
      return newCart;
    });
  }, [saveCartToDB]);

  const updateQuantity = useCallback((id: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => {
        const newCart = prev.filter((item) => !(item.id === id && item.size === size));
        saveCartToDB(newCart);
        return newCart;
      });
      return;
    }
    setItems((prev) => {
      const newCart = prev.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      );
      saveCartToDB(newCart);
      return newCart;
    });
  }, [saveCartToDB]);

  const clearCart = useCallback(() => {
    setItems([]);
    saveCartToDB([]);
  }, [saveCartToDB]);

  useEffect(() => {
    if (user && debouncedItems.length > 0) {
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