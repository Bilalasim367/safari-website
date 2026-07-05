"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "Safari Perfumes",
    storeEmail: "hello@safariperfumes.com",
    storePhone: "+1 (800) 555-0123",
    currency: "USD",
    shippingFee: "15",
    freeShippingThreshold: "100",
    taxRate: "8",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "general", label: "General", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    { id: "shipping", label: "Shipping", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
    { id: "email", label: "Notifications", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "payment", label: "Payment", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your store preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-muted p-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  activeTab === tab.id
                    ? ""
                    : "text-muted-foreground"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                <span className="font-medium">{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
            {activeTab === "general" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">General Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted rounded-xl p-4">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Store Name</Label>
                    <Input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="bg-transparent"
                    />
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Email</Label>
                    <Input
                      type="email"
                      value={settings.storeEmail}
                      onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                      className="bg-transparent"
                    />
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Phone</Label>
                    <Input
                      type="text"
                      value={settings.storePhone}
                      onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                      className="bg-transparent"
                    />
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => setSettings({ ...settings, currency: value || "USD" })}
                    >
                      <SelectTrigger className="bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSave}>
                  {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">Shipping Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide block mb-2">Standard Shipping</Label>
                    <p className="text-2xl font-serif font-bold">${settings.shippingFee}</p>
                    <p className="text-muted-foreground text-sm mt-1">Flat rate</p>
                  </Card>
                  <Card className="p-5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide block mb-2">Free Shipping</Label>
                    <p className="text-2xl font-serif font-bold">${settings.freeShippingThreshold}</p>
                    <p className="text-muted-foreground text-sm mt-1">Minimum order</p>
                  </Card>
                  <Card className="p-5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide block mb-2">Tax Rate</Label>
                    <p className="text-2xl font-serif font-bold">{settings.taxRate}%</p>
                    <p className="text-muted-foreground text-sm mt-1">Per order</p>
                  </Card>
                </div>

                <div className="space-y-3 pt-3">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Free Shipping</p>
                      <p className="text-muted-foreground text-sm">Orders over ${settings.freeShippingThreshold}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Express Shipping</p>
                      <p className="text-muted-foreground text-sm">1-2 business days</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Button onClick={handleSave}>
                  {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            )}

            {activeTab === "email" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">Email Notifications</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">New Order Alerts</p>
                      <p className="text-muted-foreground text-sm">Get notified when a new order is placed</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Order Confirmation</p>
                      <p className="text-muted-foreground text-sm">Email customers order confirmation</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Shipping Updates</p>
                      <p className="text-muted-foreground text-sm">Notify on status changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button onClick={handleSave}>
                  {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">Payment Methods</h2>
                
                <div className="space-y-3">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center">
                          <span className="text-black text-xs font-bold">VISA</span>
                        </div>
                        <div>
                          <p className="font-medium">Credit/Debit Cards</p>
                          <p className="text-muted-foreground text-sm">Visa, Mastercard, Amex</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center">
                          <span className="text-black text-xs font-bold">PayPal</span>
                        </div>
                        <div>
                          <p className="font-medium">PayPal</p>
                          <p className="text-muted-foreground text-sm">Pay with PayPal</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center">
                          <span className="text-black text-xs font-bold">COD</span>
                        </div>
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-muted-foreground text-sm">Pay when you receive</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </Card>
                </div>

                <Button onClick={handleSave}>
                  {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
             )}
           </CardContent>
         </Card>
         </div>
      </div>
    </div>
  );
}
