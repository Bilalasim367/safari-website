"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface SettingsData {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string | null;
  currency: string;
  timezone: string;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  emailNotifications: boolean;
  orderEmails: boolean;
  marketingEmails: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPassword: string | null;
}

const DEFAULT_SETTINGS: SettingsData = {
  storeName: "Safari Perfumes",
  storeEmail: "",
  storePhone: "",
  storeAddress: null,
  currency: "PKR",
  timezone: "Asia/Karachi",
  taxRate: 0,
  shippingFee: 0,
  freeShippingThreshold: 0,
  emailNotifications: true,
  orderEmails: true,
  marketingEmails: false,
  smtpHost: null,
  smtpPort: null,
  smtpUser: null,
  smtpPassword: null,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (!cancelled && !data.error) {
          setSettings({
            storeName: data.storeName || "Safari Perfumes",
            storeEmail: data.storeEmail || "",
            storePhone: data.storePhone || "",
            storeAddress: data.storeAddress || null,
            currency: data.currency || "PKR",
            timezone: data.timezone || "Asia/Karachi",
            taxRate: data.taxRate ?? 0,
            shippingFee: data.shippingFee ?? 0,
            freeShippingThreshold: data.freeShippingThreshold ?? 0,
            emailNotifications: data.emailNotifications ?? true,
            orderEmails: data.orderEmails ?? true,
            marketingEmails: data.marketingEmails ?? false,
            smtpHost: data.smtpHost || null,
            smtpPort: data.smtpPort ?? null,
            smtpUser: data.smtpUser || null,
            smtpPassword: data.smtpPassword || null,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const update = (patch: Partial<SettingsData>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          taxRate: Number(settings.taxRate) || 0,
          shippingFee: Number(settings.shippingFee) || 0,
          freeShippingThreshold: Number(settings.freeShippingThreshold) || 0,
          smtpPort: settings.smtpPort ? Number(settings.smtpPort) : null,
        }),
      });

      const data = await res.json();

      if (res.ok && !data.error) {
        toast.success('Settings saved');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "shipping", label: "Shipping & Tax" },
    { id: "email", label: "Notifications & SMTP" },
    { id: "payment", label: "Payment Methods" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
                  activeTab === tab.id ? "" : "text-muted-foreground"
                }`}
              >
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
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Store Name</Label>
                    <Input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => update({ storeName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
                    <Input
                      type="email"
                      value={settings.storeEmail}
                      onChange={(e) => update({ storeEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Phone</Label>
                    <Input
                      type="text"
                      value={settings.storePhone}
                      onChange={(e) => update({ storePhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => update({ currency: value || "PKR" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PKR">PKR (₨)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Store Address</Label>
                    <Input
                      type="text"
                      value={settings.storeAddress || ""}
                      onChange={(e) => update({ storeAddress: e.target.value })}
                    />
                  </div>
                </div>

                <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
                  Tax rate, shipping fees and free-shipping threshold are configured under
                  {" "}<Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab("shipping")}>Shipping &amp; Tax</Button>.
                  They are applied automatically when customers place orders.
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">Shipping &amp; Tax</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Standard Shipping Fee ({settings.currency})</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.shippingFee}
                      onChange={(e) => update({ shippingFee: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Free Shipping Threshold ({settings.currency})</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => update({ freeShippingThreshold: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Orders at or above this amount ship free. 0 disables free shipping.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Tax Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.taxRate}
                      onChange={(e) => update({ taxRate: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
                  Current values:
                  <span className="font-medium text-foreground"> {settings.shippingFee} {settings.currency}</span> shipping ·{" "}
                  <span className="font-medium text-foreground"> {settings.taxRate}%</span> tax · free shipping over{" "}
                  <span className="font-medium text-foreground"> {settings.freeShippingThreshold} {settings.currency}</span>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">Email Notifications</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Email Notifications Enabled</p>
                      <p className="text-muted-foreground text-sm">Master switch for all customer emails</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => update({ emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Order Confirmation</p>
                      <p className="text-muted-foreground text-sm">Email customers when an order is placed</p>
                    </div>
                    <Switch
                      checked={settings.orderEmails}
                      onCheckedChange={(checked) => update({ orderEmails: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-muted-foreground text-sm">Promotional and newsletter emails</p>
                    </div>
                    <Switch
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => update({ marketingEmails: checked })}
                    />
                  </div>
                </div>

                <h2 className="text-lg font-semibold pt-3">SMTP Server</h2>
                <p className="text-sm text-muted-foreground">Used to send order confirmations, shipment updates and password reset codes.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">SMTP Host</Label>
                    <Input
                      type="text"
                      placeholder="smtp.example.com"
                      value={settings.smtpHost || ""}
                      onChange={(e) => update({ smtpHost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">SMTP Port</Label>
                    <Input
                      type="number"
                      placeholder="465"
                      value={settings.smtpPort || ""}
                      onChange={(e) => update({ smtpPort: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">SMTP Username</Label>
                    <Input
                      type="text"
                      value={settings.smtpUser || ""}
                      onChange={(e) => update({ smtpUser: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">SMTP Password</Label>
                    <Input
                      type="password"
                      value={settings.smtpPassword || ""}
                      onChange={(e) => update({ smtpPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">Payment Methods</h2>

                <div className="space-y-3">
                  {[
                    { name: 'Cash on Delivery', note: 'Pay when you receive your order', enabled: true },
                    { name: 'Bank Transfer', note: 'Manual transfer, confirmed by admin', enabled: true },
                    { name: 'JazzCash', note: 'JazzCash mobile wallet', enabled: true },
                    { name: 'EasyPaisa', note: 'EasyPaisa mobile wallet', enabled: true },
                    { name: 'Credit/Debit Card', note: 'Online card payments (not integrated yet)', enabled: false },
                  ].map((method) => (
                    <Card key={method.name} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-muted-foreground text-sm">{method.note}</p>
                        </div>
                        {method.enabled ? (
                          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        ) : (
                          <Badge variant="secondary">Not integrated</Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}