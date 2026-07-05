"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Plus, Users, Settings as SettingsIcon } from "lucide-react";

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

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const headers = { 'x-api-key': 'safari-admin-api-key-secure-2024' };
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/admin/orders', { headers }),
          fetch('/api/admin/products', { headers }),
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        setOrders(ordersData.orders?.slice(0, 5) || []);
        setProducts(productsData.products?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, subtext: "This month", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Total Orders", value: orders.length.toString(), subtext: "All time", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    { label: "Products", value: products.length.toString(), subtext: "In catalog", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { label: "Pending", value: pendingOrders.toString(), subtext: "Awaiting action", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
              <div className="h-8 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted w-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className="rounded-xl bg-primary/10 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex items-center justify-between flex-row p-6 border-b">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm font-medium hover:underline">
              View All →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-muted">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-muted-foreground text-sm">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total.toFixed(2)}</p>
                      <Badge 
                        variant={
                          order.status === 'pending' ? 'default' :
                          order.status === 'processing' ? 'secondary' :
                          order.status === 'shipped' ? 'default' :
                          order.status === 'delivered' ? 'default' : 'destructive'
                        }
                        className={
                          order.status === 'delivered' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                          order.status === 'cancelled' ? '' : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                        }
                      >
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader className="flex items-center justify-between flex-row p-6 border-b">
            <CardTitle className="text-lg">Recent Products</CardTitle>
            <Link href="/admin/products" className="text-sm font-medium hover:underline">
              Manage →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-muted">
              {products.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No products yet</div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-md bg-muted shrink-0 overflow-hidden">
                        {product.image && <img src={product.image} className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <div className="flex gap-2 mt-1">
                          {product.isNew && <Badge className="bg-blue-50 text-blue-700 text-[10px] h-4">NEW</Badge>}
                          {product.isBestseller && <Badge className="bg-amber-50 text-amber-700 text-[10px] h-4">BEST</Badge>}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold shrink-0">${product.price}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/products" className="block">
              <Card className="text-center p-6 hover:border-primary hover:shadow-sm transition-all cursor-pointer group border">
                <div className="rounded-xl bg-primary/10 w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Add Product</p>
              </Card>
            </Link>
            <Link href="/admin/orders" className="block">
              <Card className="text-center p-6 hover:border-primary hover:shadow-sm transition-all cursor-pointer group border">
                <div className="rounded-xl bg-primary/10 w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">View Orders</p>
              </Card>
            </Link>
            <Link href="/admin/users" className="block">
              <Card className="text-center p-6 hover:border-primary hover:shadow-sm transition-all cursor-pointer group border">
                <div className="rounded-xl bg-primary/10 w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Customers</p>
              </Card>
            </Link>
            <Link href="/admin/settings" className="block">
              <Card className="text-center p-6 hover:border-primary hover:shadow-sm transition-all cursor-pointer group border">
                <div className="rounded-xl bg-primary/10 w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <SettingsIcon className="w-6 h-6 text-primary" />
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
