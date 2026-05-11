"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <div className="pt-32 pb-24 text-center bg-background">
        <div className="container-custom">
          <h1 className="text-4xl font-serif text-foreground mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Add some products to your cart before checking out.</p>
          <Link href="/shop" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-white">
      <div className="bg-background border-b border-border py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-serif text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link> / Checkout
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
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              {i < 2 && (
                <div className={`w-24 h-0.5 mx-3 ${step > s.num ? "bg-foreground" : "bg-muted"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6 bg-card p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Shipping Information</h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Email</label>
                    <Input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">First Name</label>
                      <Input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Last Name</label>
                      <Input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Address</label>
                    <Input
                      type="text"
                      name="address1"
                      required
                      value={formData.address1}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Apartment, suite, etc. (optional)</label>
                    <Input
                      type="text"
                      name="address2"
                      value={formData.address2}
                      onChange={handleInputChange}
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">City</label>
                      <Input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">State</label>
                      <Input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="NY"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">ZIP Code</label>
                      <Input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <Input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <Button type="submit" className="w-full font-semibold uppercase tracking-wider">
                    Continue to Payment
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 bg-card p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Payment Method</h2>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-4 p-4 border border-input cursor-pointer hover:border-foreground transition-colors">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod" 
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="w-4 h-4" 
                      />
                      <div>
                        <span className="font-medium text-foreground">Cash on Delivery</span>
                        <p className="text-muted-foreground text-sm">Pay when you receive your order</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border border-input cursor-pointer opacity-50">
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
                        <span className="font-medium text-foreground">Credit Card</span>
                        <p className="text-muted-foreground text-sm">Stripe integration coming soon</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 font-semibold uppercase tracking-wider">
                      Review Order
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 bg-card p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Review Your Order</h2>
                  
                  <Card className="p-6">
                    <h3 className="font-medium text-foreground mb-3">Shipping Address</h3>
                    <p className="text-muted-foreground">
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address1}{formData.address2 && `, ${formData.address2}`}<br />
                      {formData.city}, {formData.state} {formData.zipCode}<br />
                      {formData.phone}
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-medium text-foreground mb-3">Payment Method</h3>
                    <p className="text-muted-foreground">
                      {formData.paymentMethod === "cod" ? "Cash on Delivery" : "Credit Card"}
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-medium text-foreground mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center">
                          <div className="relative w-16 h-20 bg-muted flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-foreground font-medium">{item.name}</h4>
                            <p className="text-muted-foreground text-sm">{item.size} × {item.quantity}</p>
                          </div>
                          <p className="text-foreground font-medium">${item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1 font-semibold uppercase tracking-wider">
                      {loading ? "Placing Order..." : "Place Order"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="relative w-14 h-18 bg-muted flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background text-xs font-semibold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground text-sm font-medium truncate">{item.name}</h4>
                      <p className="text-muted-foreground text-xs">{item.size}</p>
                    </div>
                    <p className="text-foreground text-sm font-medium">${item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground font-semibold text-lg pt-3 border-t border-border">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 100 && (
                <p className="text-muted-foreground text-sm mt-4 text-center">
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
