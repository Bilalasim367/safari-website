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
  const shipping = 0;
  const total = subtotal + shipping;

  const suggestedProducts = products
    .filter((p) => !items.some((i) => i.id === String(p.id)))
    .slice(0, 3);

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
          <SheetHeader className="flex items-center justify-between p-6 border-b border-muted/60">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <SheetTitle className="text-sm font-medium tracking-[0.2em] uppercase text-foreground">
                Shopping Bag ({items.length})
              </SheetTitle>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-foreground mb-1 font-serif text-xl">Your bag is empty</p>
                <p className="text-muted-foreground text-sm mb-8">Discover our collection of luxury fragrances</p>
                <Button onClick={() => setIsCartOpen(false)} className="bg-gold hover:bg-gold/90 text-white">Continue Shopping</Button>
              </div>
            ) : (
              <div className="space-y-0">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 py-5 border-b border-muted/30 last:border-b-0">
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-serif text-foreground text-base sm:text-lg leading-tight">{item.name}</h3>
                          <p className="text-muted-foreground text-xs mt-1 uppercase tracking-wider">{item.size}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="text-muted-foreground/50 hover:text-red-500 transition-colors p-1 -mr-1 -mt-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-muted rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-foreground text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-serif text-foreground font-medium">PKR {item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="mt-6 pt-4 border-t border-muted/30">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold mr-2" />
                  You Might Also Like
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
                  {suggestedProducts.map((sp) => (
                    <Link
                      key={sp.id}
                      href={`/shop/${sp.slug}`}
                      className="flex-shrink-0 w-28 group"
                    >
                      <div className="relative w-20 h-20 bg-muted rounded-xl overflow-hidden mb-2 ring-1 ring-muted/20 group-hover:ring-gold/30 transition-all duration-300">
                        <Image src={sp.image} alt={sp.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <button
                          onClick={(e) => handleAddSuggested(e, sp)}
                          aria-label={`Add ${sp.name} to cart`}
                          className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-gold text-white flex items-center justify-center hover:bg-gold/90 hover:scale-110 transition-all duration-200 shadow-md"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-foreground font-medium truncate group-hover:text-gold transition-colors">{sp.name}</p>
                      <p className="text-xs text-muted-foreground">PKR {sp.price}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-muted/60 p-4 pt-5">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center bg-muted/20 rounded-lg px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-medium text-foreground">PKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-muted/20 rounded-lg px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">Shipping</span>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-muted/50">
                  <span className="text-foreground font-medium">Total</span>
                  <span className="text-xl font-heading text-gold font-bold">PKR {total.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleCheckout} className="w-full mb-3 bg-gold hover:bg-gold/90 text-white shadow-md shadow-gold/20">Checkout</Button>
              <Button onClick={() => setIsCartOpen(false)} variant="outline" className="w-full border-muted/40 text-muted-foreground hover:text-foreground hover:border-foreground">Continue Shopping</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
