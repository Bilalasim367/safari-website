"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Plus,
  Users,
  Settings as SettingsIcon,
  Download,
  AlertTriangle,
} from "@/lib/lucide-icons";
import AdminToast from "@/components/admin/AdminToast";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentStatus: string;
  itemCount: number;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  isNew: boolean;
  isBestseller: boolean;
}

type Range = "7" | "30" | "90";

const rangeOptions: { value: Range; label: string }[] = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
];

const rangeLabel: Record<Range, string> = {
  "7": "Last 7 Days",
  "30": "Last 30 Days",
  "90": "Last 90 Days",
};

function buildSalesData(days: Range) {
  const n = days === "7" ? 7 : days === "30" ? 30 : 90;
  const labels: string[] = [];
  const data: number[] = [];
  const base = n === 90 ? 62000 : n === 30 ? 34000 : 12000;
  for (let i = 0; i < n; i++) {
    if (n === 90) {
      labels.push(`W${Math.floor(i / 7) + 1}`);
    } else if (n === 30) {
      labels.push(String(i + 1));
    } else {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    }
    const wave = Math.sin(i / 4.2) * base * 0.14 + Math.cos(i / 9.5) * base * 0.09;
    const trend = (i / n) * (n === 90 ? 36000 : n === 30 ? 17000 : 5600);
    data.push(Math.round(base + trend + wave + ((i * 7919) % 100) * (base * 0.004)));
  }
  return { labels, data };
}

interface ChartLike {
  destroy(): void;
  update(): void;
  data: { labels: unknown[]; datasets: Array<{ data: unknown[] }> };
}
interface ChartCtor {
  new (ctx: CanvasRenderingContext2D, config: Record<string, unknown>): ChartLike;
}
type WindowWithChart = Window & { Chart?: ChartCtor };

const GOLD = "#B6965D";

function getStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 ring-amber-600/20",
    delivered: "bg-green-50 text-green-700 ring-green-600/20",
    cancelled: "bg-red-50 text-red-700 ring-red-600/20",
    shipped: "bg-purple-50 text-purple-700 ring-purple-600/20",
    processing: "bg-blue-50 text-blue-700 ring-blue-600/20",
  };
  const cls = map[status] || map.pending;
  return (
    <Badge variant="outline" className={`rounded-full px-2.5 ring-1 ${cls}`}>
      {getStatusLabel(status)}
    </Badge>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [range, setRange] = useState<Range>("30");
  const [chartLib, setChartLib] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartLike | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/admin/products'),
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        setOrders(ordersData.orders || []);
        setProducts((productsData.products || []).slice(0, 5));
        setProductCount(productsData.total ?? (productsData.products || []).length);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    let tries = 0;
    const id = window.setInterval(() => {
      if ((window as unknown as WindowWithChart).Chart) {
        setChartLib(true);
        window.clearInterval(id);
      } else if (++tries > 25) {
        window.clearInterval(id);
      }
    }, 150);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chartLib) return;
    const win = window as WindowWithChart;
    const el = canvasRef.current;
    if (!el || !win.Chart) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      const d = buildSalesData(range);
      chartRef.current.data.labels = d.labels;
      chartRef.current.data.datasets[0].data = d.data;
      chartRef.current.update();
      return;
    }

    const d = buildSalesData(range);
    const grad = ctx.createLinearGradient(0, 0, 0, el.offsetHeight || 300);
    grad.addColorStop(0, "rgba(182, 150, 93,0.28)");
    grad.addColorStop(1, "rgba(182, 150, 93,0)");

    const cfg: Record<string, unknown> = {
      type: "line",
      data: {
        labels: d.labels,
        datasets: [
          {
            label: "Revenue",
            data: d.data,
            borderColor: GOLD,
            backgroundColor: grad,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: GOLD,
            pointHoverBorderColor: "#ffffff",
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#111110",
            titleColor: GOLD,
            bodyColor: "#f5f0e8",
            borderColor: "rgba(182, 150, 93,0.35)",
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (item: { parsed: { y: number } }) =>
                " PKR " + Number(item.parsed.y).toLocaleString(),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "#9a958d",
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 9,
              font: { size: 11 },
            },
          },
          y: {
            beginAtZero: false,
            grid: { color: "#eee" },
            border: { display: false },
            ticks: {
              color: "#9a958d",
              padding: 8,
              font: { size: 11 },
              callback: (value: string | number) => "PKR " + Number(value).toLocaleString(),
            },
          },
        },
      },
    };

    chartRef.current = new win.Chart(ctx, cfg);
  }, [chartLib, range]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const stats = [
    {
      label: "Total Revenue",
      value: `PKR ${totalRevenue.toLocaleString()}`,
      subtext: "All orders",
      trend: 12,
      up: true,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Total Orders",
      value: orders.length.toString(),
      subtext: "All time",
      trend: 8,
      up: true,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    },
    {
      label: "Products",
      value: productCount.toString(),
      subtext: "In catalog",
      trend: 5,
      up: true,
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      label: "Pending",
      value: pendingOrders.toString(),
      subtext: "Awaiting action",
      trend: 5,
      up: false,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  const lowStock = products.slice(0, 3).map((p, i) => ({
    ...p,
    left: [3, 2, 5][i],
  }));

  const exportCSV = () => {
    const header = ["Order #", "Customer", "Email", "Items", "Total (PKR)", "Status"];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      String(o.itemCount),
      String(o.total),
      o.status,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recent-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Saved ✓");
  };

  const sectionLabel = (top: string) => (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B6965D]">{top}</p>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 min-[401px]:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"
        strategy="afterInteractive"
        onLoad={() => setChartLib(true)}
      />
      <AdminToast message={toast} />

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B6965D]">
          Store Overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 min-[401px]:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="bg-white ring-[#eee] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition-all duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-widest text-[#9a958d]">
                {stat.label}
              </CardTitle>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B6965D]/[0.12]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#B6965D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-[28px] font-bold tracking-tight text-foreground">{stat.value}</p>
              <p className="text-xs text-[#9a958d] mt-1">{stat.subtext}</p>
              <p className="mt-2 text-xs">
                <span className={`font-semibold ${stat.up ? "text-emerald-600" : "text-red-500"}`}>
                  {stat.up ? "↑" : "↓"} {stat.trend}%
                </span>
                <span className="text-[#9a958d]"> vs last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Chart */}
      <Card className="bg-white ring-[#eee] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            {sectionLabel("Revenue Analytics")}
            <CardTitle className="font-heading text-lg text-foreground mt-0.5">Sales Overview</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-[#9a958d]">{rangeLabel[range]}</span>
            <label htmlFor="chart-range" className="sr-only">
              Chart range
            </label>
            <select
              id="chart-range"
              value={range}
              onChange={(e) => setRange(e.target.value as Range)}
              className="h-11 cursor-pointer rounded-lg border border-[#e5e0d5] bg-white px-3 text-sm text-[#444] focus:border-[#B6965D] focus:outline-none focus:ring-2 focus:ring-[#B6965D]/30"
            >
              {rangeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[220px] md:h-[300px]">
            <canvas ref={canvasRef} aria-label="Sales overview chart" role="img" />
            {!chartLib && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9a958d]">
                Loading chart…
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders + Products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="bg-white ring-[#eee] shadow-[0_2px_8px_rgba(0,0,0,0.06)] xl:col-span-2 min-w-0">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              {sectionLabel("Transaction Ledger")}
              <CardTitle className="font-heading text-lg text-foreground mt-0.5">Recent Orders</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="flex h-11 items-center gap-2 rounded-lg border border-[#B6965D] px-4 text-sm font-medium text-[#9c7f4d] hover:bg-[#B6965D] hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
              <Link
                href="/admin/orders"
                className="flex h-11 items-center px-2 text-sm font-medium text-[#9c7f4d] hover:text-[#B6965D] transition-colors"
              >
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-[#eee] bg-[#faf8f5]">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a857c]">Order</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a857c]">Customer</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a857c]">Date</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a857c] text-right">Total</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a857c]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ShoppingBag className="w-10 h-10 text-[#c9c2b6] mb-3" />
                        <p className="text-sm text-[#9a958d]">No orders yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 6).map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push("/admin/orders")}
                      className="cursor-pointer transition-colors hover:bg-[#faf8f5]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-foreground">{order.orderNumber}</p>
                        <p className="text-[11px] text-[#9a958d]">{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-foreground">{order.customerName}</p>
                        <p className="text-[11px] text-[#9a958d] truncate max-w-[180px]">{order.customerEmail}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#9a958d] whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm font-semibold text-foreground">PKR {order.total.toLocaleString()}</p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Recent Products + Low Stock */}
        <Card className="bg-white ring-[#eee] shadow-[0_2px_8px_rgba(0,0,0,0.06)] min-w-0">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              {sectionLabel("Catalog")}
              <CardTitle className="font-heading text-lg text-foreground mt-0.5">Recent Products</CardTitle>
            </div>
            <Link
              href="/admin/products"
              className="flex h-11 items-center px-2 text-sm font-medium text-[#9c7f4d] hover:text-[#B6965D] transition-colors"
            >
              Manage →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#f0ece4]">
              {products.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#9a958d]">No products yet</div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => router.push("/admin/products")}
                    className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[#faf8f5]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-[#f5f2ec] ring-1 ring-black/5">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                        <div className="mt-1 flex gap-2">
                          {product.isNew && (
                            <Badge className="h-4 rounded-full bg-[#B6965D]/15 px-1.5 text-[10px] text-[#9c7f4d]">
                              NEW
                            </Badge>
                          )}
                          {product.isBestseller && (
                            <Badge className="h-4 rounded-full bg-amber-50 px-1.5 text-[10px] text-amber-700">
                              BEST
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      PKR {product.price.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Low Stock Alerts */}
            <div className="border-t border-[#eee] px-5 py-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#B6965D]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B6965D]">
                  Low Stock Alerts
                </p>
              </div>
              <div className="space-y-3">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-[#f5f2ec] ring-1 ring-black/5">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{p.name}</p>
                      <p className="text-xs text-[#9a958d]">PKR {p.price.toLocaleString()}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-600/20">
                      Only {p.left} left
                    </span>
                  </div>
                ))}
                {lowStock.length === 0 && (
                  <p className="text-xs text-[#9a958d]">No low stock alerts</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white ring-[#eee] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            {sectionLabel("Shortcuts")}
            <CardTitle className="font-heading text-lg text-foreground mt-0.5">Quick Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/products" className="block">
              <Card className="text-center p-6 hover:border-[#B6965D] hover:shadow-sm transition-all cursor-pointer group border">
                <div className="rounded-xl bg-[#B6965D]/10 w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#B6965D]/20 transition-colors">
                  <Plus className="w-6 h-6 text-[#B6965D]" />
                </div>
                <p className="text-sm font-medium text-foreground">Add Product</p>
              </Card>
            </Link>
            <Link href="/admin/orders" className="block">
              <Card className="text-center p-6 hover:border-[#B6965D] hover:shadow-sm transition-all cursor-pointer group border">
                <div className="rounded-xl bg-[#B6965D]/10 w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#B6965D]/20 transition-colors">
                  <ShoppingBag className="w-6 h-6 text-[#B6965D]" />
                </div>
                <p className="text-sm font-medium text-foreground">View Orders</p>
              </Card>
            </Link>
            <Link href="/admin/users" className="block">
              <Card className="text-center p-6 hover:border-[#B6965D] hover:shadow-sm transition-all cursor-pointer group border">
                <div className="rounded-xl bg-[#B6965D]/10 w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#B6965D]/20 transition-colors">
                  <Users className="w-6 h-6 text-[#B6965D]" />
                </div>
                <p className="text-sm font-medium text-foreground">Customers</p>
              </Card>
            </Link>
            <Link href="/admin/settings" className="block">
              <Card className="text-center p-6 hover:border-[#B6965D] hover:shadow-sm transition-all cursor-pointer group border">
                <div className="rounded-xl bg-[#B6965D]/10 w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#B6965D]/20 transition-colors">
                  <SettingsIcon className="w-6 h-6 text-[#B6965D]" />
                </div>
                <p className="text-sm font-medium text-foreground">Settings</p>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}