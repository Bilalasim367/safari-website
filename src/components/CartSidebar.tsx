"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { products } from "@/data/products";

export default function CartSidebar() {
  const { items, addItem, removeItem, updateQuantity, subtotal, isCartOpen, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const shipping = subtotal >= 15000 ? 0 : 2000;
  const total = subtotal + shipping;

  const suggestedProducts = products
    .filter((p) => !items.some((i) => i.id === String(p.id)))
    .slice(0, 6);

  const handleAddSuggested = (e: React.MouseEvent, product: typeof products[0]) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.size || "50ml",
      quantity: 1,
    });
  };

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
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white">
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
                        <p className="font-serif text-foreground">PKR {item.price * item.quantity}</p>
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
                  <span className="text-foreground">PKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{shipping === 0 ? 'Free' : `PKR ${shipping}`}</span>
                </div>
                <div className="flex justify-between text-lg pt-3 border-t border-muted">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary font-serif">PKR {total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mb-6 pt-4 border-t border-muted">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">You Might Also Like</p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
                  {suggestedProducts.map((sp) => (
                    <Link
                      key={sp.id}
                      href={`/shop/${sp.slug}`}
                      className="flex-shrink-0 w-28 group"
                    >
                      <div className="relative w-28 h-28 bg-muted rounded-lg overflow-hidden mb-2">
                        <Image src={sp.image} alt={sp.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        <button
                          onClick={(e) => handleAddSuggested(e, sp)}
                          aria-label={`Add ${sp.name} to cart`}
                          className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-primary transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-foreground font-medium truncate">{sp.name}</p>
                      <p className="text-xs text-muted-foreground">PKR {sp.price}</p>
                    </Link>
                  ))}
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
