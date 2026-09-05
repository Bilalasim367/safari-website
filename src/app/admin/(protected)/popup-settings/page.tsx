"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface PopupSettingsData {
  enabled: boolean;
  whatsappNumber: string;
  names: string[];
  cities: string[];
}

const DEFAULT_SETTINGS: PopupSettingsData = {
  enabled: true,
  whatsappNumber: "923247277489",
  names: [
    "Ahmed", "Bilal", "Usman", "Fatima", "Ayesha", "Zainab",
    "Hamza", "Ali", "Hassan", "Umar", "Sana", "Maryam", "Junaid", "Kashif",
  ],
  cities: [
    "Lahore", "Karachi", "Islamabad", "Faisalabad", "Multan",
    "Peshawar", "Sialkot", "Rawalpindi", "Quetta", "Gujranwala",
  ],
};

export default function PopupSettingsPage() {
  const [settings, setSettings] = useState<PopupSettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/popup-settings');
        const data = await res.json();
        if (!cancelled && data && !data.error) {
          setSettings({
            enabled: data.enabled !== false,
            whatsappNumber: data.whatsappNumber || "923247277489",
            names: Array.isArray(data.names) && data.names.length ? data.names : DEFAULT_SETTINGS.names,
            cities: Array.isArray(data.cities) && data.cities.length ? data.cities : DEFAULT_SETTINGS.cities,
          });
        }
      } catch {
        toast.error("Failed to load popup settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        enabled: settings.enabled,
        whatsappNumber: settings.whatsappNumber,
        names: settings.names.map((n) => n.trim()).filter(Boolean),
        cities: settings.cities.map((c) => c.trim()).filter(Boolean),
      };

      const res = await fetch('/api/popup-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data && !data.error) {
        toast.success("Popup settings saved");
      } else {
        toast.error(data.error || "Failed to save popup settings");
      }
    } catch {
      toast.error("Failed to save popup settings");
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-3xl font-serif font-bold">Popup Settings</h1>
        <p className="text-muted-foreground mt-1">
          Social proof purchase popups &amp; WhatsApp ordering
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between py-2 border-b border-border mb-6">
              <div>
                <p className="font-medium">Enable Purchase Popups</p>
                <p className="text-sm text-muted-foreground">
                  Show &quot;someone purchased this product&quot; notifications across the store.
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings((p) => ({ ...p, enabled: checked }))}
              />
            </div>

            <div className="space-y-2 mb-6">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                WhatsApp Number (international format)
              </Label>
              <Input
                type="text"
                placeholder="923247277489"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings((p) => ({ ...p, whatsappNumber: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Used for the WhatsApp order buttons. Country code without &apos;+&apos; or spaces.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Customer Names (one per line)
                </Label>
                <Textarea
                  rows={8}
                  value={settings.names.join("\n")}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      names: e.target.value.split("\n").filter((n) => n.trim() !== ""),
                    }))
                  }
                  placeholder={"Ahmed\nBilal\nUsman"}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Cities (one per line)
                </Label>
                <Textarea
                  rows={8}
                  value={settings.cities.join("\n")}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      cities: e.target.value.split("\n").filter((c) => c.trim() !== ""),
                    }))
                  }
                  placeholder={"Lahore\nKarachi\nIslamabad"}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}