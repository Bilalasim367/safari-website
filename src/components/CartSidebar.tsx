"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
      <div className={`fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsCartOpen(false)} />

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[90] flex flex-col transform transition-transform duration-500 ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-6 border-b border-[#f0f0f0]">
          <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-[#1a0f0a]">Shopping Bag ({items.length})</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-[#999] hover:text-[#1a0f0a] transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-24 h-24 text-[#e8e4de] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-[#999] mb-2 font-serif text-lg">Your bag is empty</p>
              <p className="text-[#bbb] text-sm mb-8">Add some luxurious fragrances</p>
              <button onClick={() => setIsCartOpen(false)} className="btn-secondary">Continue Shopping</button>
            </div>
          ) : (
            <div className="space-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4">
                  <div className="relative w-24 h-28 bg-[#f5f2ed] flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-serif text-[#1a0f0a] text-lg">{item.name}</h3>
                      <p className="text-[#999] text-sm mt-1">{item.size}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-[#e8e4de]">
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-[#999] hover:text-[#1a0f0a] transition-colors">−</button>
                        <span className="w-8 text-center text-[#1a0f0a]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-[#999] hover:text-[#1a0f0a] transition-colors">+</button>
                      </div>
                      <p className="font-serif text-[#1a0f0a]">${item.price * item.quantity}</p>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id, item.size)} className="text-[#ccc] hover:text-[#1a0f0a] self-start mt-1">
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
          <div className="p-6 border-t border-[#f0f0f0]">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#999]">Subtotal</span>
                <span className="text-[#1a0f0a]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#999]">Shipping</span>
                <span className="text-[#1a0f0a]">{shipping === 0 ? 'Free' : `$${shipping}`}</span>
              </div>
              <div className="flex justify-between text-lg pt-3 border-t border-[#f0f0f0]">
                <span className="text-[#1a0f0a]">Total</span>
                <span className="text-[#c9a962] font-serif">${total.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full mb-3">Checkout</button>
            <button onClick={() => setIsCartOpen(false)} className="btn-secondary w-full">Continue Shopping</button>
          </div>
        )}
      </div>
    </>
  );
}