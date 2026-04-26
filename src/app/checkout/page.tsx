"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [authLoading, user, router]);
  
  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
    paymentMethod: "cod",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const shipping = subtotal >= 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress,
          paymentMethod: formData.paymentMethod,
        }),
      });

      const data = await res.json();

      if (data.success) {
        clearCart();
        router.push(`/track?order=${data.order.orderNumber}`);
      } else {
        setError(data.message || "Failed to place order");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-24 text-center bg-white">
        <div className="container-custom">
          <h1 className="text-4xl font-serif text-black mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to your cart before checking out.</p>
          <Link href="/shop" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-white">
      <div className="bg-white border-b border-gray-200 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-serif text-black mb-2">Checkout</h1>
          <p className="text-gray-500">
            <Link href="/" className="hover:text-black">Home</Link> / Checkout
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Steps */}
        <div className="flex items-center justify-center mb-12">
          {[
            { num: 1, label: "Shipping" },
            { num: 2, label: "Payment" },
            { num: 3, label: "Review" },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= s.num
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              {i < 2 && (
                <div className={`w-24 h-0.5 mx-3 ${step > s.num ? "bg-black" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 text-sm">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6 bg-gray-50 p-8">
                  <h2 className="text-xl font-semibold text-black mb-6">Shipping Information</h2>
                  
                  <div>
                    <label className="text-gray-700 text-sm block mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 text-sm block mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm block mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-700 text-sm block mb-2">Address</label>
                    <input
                      type="text"
                      name="address1"
                      required
                      value={formData.address1}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 text-sm block mb-2">Apartment, suite, etc. (optional)</label>
                    <input
                      type="text"
                      name="address2"
                      value={formData.address2}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-700 text-sm block mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm block mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm block mb-2">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-700 text-sm block mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <button type="submit" className="w-full bg-black text-white py-4 font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                    Continue to Payment
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 bg-gray-50 p-8">
                  <h2 className="text-xl font-semibold text-black mb-6">Payment Method</h2>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-4 p-4 border border-gray-300 cursor-pointer hover:border-black transition-colors">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod" 
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="w-4 h-4" 
                      />
                      <div>
                        <span className="font-medium text-black">Cash on Delivery</span>
                        <p className="text-gray-500 text-sm">Pay when you receive your order</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border border-gray-300 cursor-pointer opacity-50">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={handleInputChange}
                        className="w-4 h-4" 
                        disabled
                      />
                      <div>
                        <span className="font-medium text-black">Credit Card</span>
                        <p className="text-gray-500 text-sm">Stripe integration coming soon</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 border border-black py-4 font-medium text-black hover:bg-gray-100 transition-colors">
                      Back
                    </button>
                    <button type="submit" className="flex-1 bg-black text-white py-4 font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 bg-gray-50 p-8">
                  <h2 className="text-xl font-semibold text-black mb-6">Review Your Order</h2>
                  
                  <div className="bg-white p-6 border border-gray-200">
                    <h3 className="font-medium text-black mb-3">Shipping Address</h3>
                    <p className="text-gray-600">
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address1}{formData.address2 && `, ${formData.address2}`}<br />
                      {formData.city}, {formData.state} {formData.zipCode}<br />
                      {formData.phone}
                    </p>
                  </div>

                  <div className="bg-white p-6 border border-gray-200">
                    <h3 className="font-medium text-black mb-3">Payment Method</h3>
                    <p className="text-gray-600">
                      {formData.paymentMethod === "cod" ? "Cash on Delivery" : "Credit Card"}
                    </p>
                  </div>

                  <div className="bg-white p-6 border border-gray-200">
                    <h3 className="font-medium text-black mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center">
                          <div className="relative w-16 h-20 bg-gray-100 flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-black font-medium">{item.name}</h4>
                            <p className="text-gray-500 text-sm">{item.size} × {item.quantity}</p>
                          </div>
                          <p className="text-black font-medium">${item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(2)} className="flex-1 border border-black py-4 font-medium text-black hover:bg-gray-100 transition-colors">
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 bg-black text-white py-4 font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50">
                      {loading ? "Placing Order..." : "Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-black mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="relative w-14 h-18 bg-gray-200 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs font-semibold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-black text-sm font-medium truncate">{item.name}</h4>
                      <p className="text-gray-500 text-xs">{item.size}</p>
                    </div>
                    <p className="text-black text-sm font-medium">${item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-black font-semibold text-lg pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 100 && (
                <p className="text-gray-500 text-sm mt-4 text-center">
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}