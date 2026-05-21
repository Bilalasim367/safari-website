"use client";

import React from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, subtotal, isCartOpen, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const shipping = subtotal >= 100 ? 0 : 15;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (user) {
      router.push('/checkout');
    } else {
      router.push('/login?redirect=/checkout');
    }
  };

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col bg-white">
          <SheetHeader className="flex items-center justify-between p-6 border-b border-muted">
            <SheetTitle className="text-sm font-medium tracking-[0.2em] uppercase">Shopping Bag ({items.length})</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="w-24 h-24 text-muted mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-muted-foreground mb-2 font-serif text-lg">Your bag is empty</p>
                <p className="text-muted-foreground text-sm mb-8">Add some luxurious fragrances</p>
                <Button onClick={() => setIsCartOpen(false)} variant="outline">Continue Shopping</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-muted flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-serif text-foreground text-lg">{item.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{item.size}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-input">
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">−</button>
                          <span className="w-9 sm:w-8 text-center text-foreground">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">+</button>
                        </div>
                        <p className="font-serif text-foreground">${item.price * item.quantity}</p>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id, item.size)} className="text-muted-foreground hover:text-foreground self-start mt-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-muted">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                <div className="flex justify-between text-lg pt-3 border-t border-muted">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary font-serif">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button onClick={handleCheckout} className="w-full mb-3">Checkout</Button>
              <Button onClick={() => setIsCartOpen(false)} variant="outline" className="w-full">Continue Shopping</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
