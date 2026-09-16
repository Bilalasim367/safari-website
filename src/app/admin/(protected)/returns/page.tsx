"use client";

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ReturnRequestItem {
  id: string;
  requestId: string;
  type: string;
  orderNumber: string | null;
  customerName: string;
  email: string;
  phone: string | null;
  productName: string;
  sku: string | null;
  size: string | null;
  reason: string;
  details: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Counts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  cancelled: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const REASON_LABELS: Record<string, string> = {
  "wrong-item": "Wrong item received",
  defective: "Defective / Damaged product",
  "not-as-described": "Product not as described",
  "changed-mind": "Changed my mind",
  "too-large": "Too large",
  "too-small": "Too small",
  other: "Other",
};

const STATUS_OPTIONS = ["pending", "approved", "rejected", "completed", "cancelled"];

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });
};

export default function ReturnsPage() {
  const [requests, setRequests] = useState<ReturnRequestItem[]>([]);
  const [counts, setCounts] = useState<Counts>({ all: 0, pending: 0, approved: 0, rejected: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ReturnRequestItem | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/returns?status=${statusFilter}`);
        const data = await res.json();
        if (!cancelled && data.requests) {
          setRequests(data.requests);
          setCounts(data.counts);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load return requests");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, reloadKey]);

  const openRequest = (r: ReturnRequestItem) => {
    setNoteInput(r.adminNote || "");
    setSelected(r);
  };

  const updateRequest = async (body: Record<string, unknown>, successMsg: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, ...body }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = data.request as ReturnRequestItem;
        const merged = requests.map((r) => (r.id === updated.id ? { ...r, ...updated } : r));
        setRequests(merged);
        setSelected({ ...selected, ...updated });
        toast.success(successMsg);
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const filtered = requests.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      r.requestId.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.orderNumber || "").toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q)
    );
  });

  const statCards: { key: keyof Counts; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "completed", label: "Completed" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Return Requests</h1>
          <p className="text-muted-foreground mt-1">{counts.all} total request{counts.all !== 1 ? "s" : ""}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReloadKey((k) => k + 1)}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`text-left transition-colors ${statusFilter === key ? "ring-2 ring-gold/60" : ""}`}
          >
            <Card className="p-4 hover:shadow-sm">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">{key} ({label})</p>
              <p className="text-2xl font-serif font-bold mt-1">{counts[key]}</p>
            </Card>
          </button>
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            type="text"
            placeholder="Search by request id, order #, name, email or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
            <SelectTrigger className="md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openRequest(r)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-black">{r.requestId}</p>
                    <p className="text-gray-400 text-sm">
                      {r.type === "exchange" ? "Exchange" : "Return"} · {r.productName}
                      {r.orderNumber ? ` · #${r.orderNumber}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-black">{r.customerName}</p>
                    <p className="text-gray-400 text-sm">{fmtDate(r.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full capitalize ${STATUS_STYLES[r.status] || "bg-yellow-100 text-yellow-700"}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-muted-foreground">No return requests found</p>
            </div>
          )}
        </div>
      )}

      {selected && (
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selected.requestId}</DialogTitle>
              <p className="text-muted-foreground text-sm">
                Submitted {fmtDate(selected.createdAt)} · Updated {fmtDate(selected.updatedAt)}
              </p>
            </DialogHeader>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted-foreground">Status</label>
                  <Select
                    value={selected.status}
                    onValueChange={(value) =>
                      updateRequest({ status: value }, `Marked as ${value}`)
                    }
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Badge className={STATUS_STYLES[selected.status] || "bg-yellow-100 text-yellow-700"}>
                  {selected.status}
                </Badge>
              </div>

              <div className="bg-muted rounded-xl p-4 space-y-2">
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Customer</p>
                <p className="font-medium">{selected.customerName}</p>
                <p className="text-muted-foreground text-sm">{selected.email}</p>
                {selected.phone && <p className="text-muted-foreground text-sm">{selected.phone}</p>}
              </div>

              <div className="bg-muted rounded-xl p-4 space-y-2">
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Request Details</p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span className="font-medium capitalize">{selected.type}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Product:</span>{" "}
                  <span className="font-medium">{selected.productName}</span>
                  {selected.size ? ` (${selected.size})` : ""}
                  {selected.sku ? ` · ${selected.sku}` : ""}
                </p>
                {selected.orderNumber && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Order:</span>{" "}
                    <span className="font-medium">#{selected.orderNumber}</span>
                  </p>
                )}
                <p className="text-sm">
                  <span className="text-muted-foreground">Reason:</span>{" "}
                  <span className="font-medium">{REASON_LABELS[selected.reason] || selected.reason}</span>
                </p>
                {selected.details && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.details}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Admin Note (visible to staff)</label>
                <Textarea
                  rows={3}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add an internal note..."
                  className="resize-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateRequest({ adminNote: noteInput }, "Note saved")}
                  disabled={saving || noteInput === (selected.adminNote || "")}
                >
                  {saving ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}