'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  trackingNumber?: string | null;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AccountPage() {
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'profile', label: 'My Profile' },
    { id: 'orders', label: 'My Orders' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'addresses', label: 'Addresses' },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || ['', ''];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: '',
      });
    }
  }, [user]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    if (user && activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        refreshUser();
      }
    } catch {}
    setSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero */}
      <div className="bg-background border-b border-border py-12">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-2">My Account</h1>
          <p className="text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link> / Account
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-12">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <Card className="p-6">
                <div className="text-center mb-6 pb-6 border-b border-border">
                  <Avatar className="w-20 h-20 mx-auto mb-3">
                    <AvatarFallback className="bg-foreground text-background text-2xl font-bold">
                      {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-foreground">{user.name}</h3>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      onClick={() => setActiveTab(tab.id)}
                      className="w-full justify-start"
                    >
                      {tab.label}
                    </Button>
                  ))}
                  {user?.role === 'admin' && (
                    <Button
                      variant="ghost"
                      onClick={() => router.push('/admin/dashboard')}
                      className="w-full justify-start text-gold hover:text-gold-light hover:bg-gold/5"
                    >
                      Admin Panel
                    </Button>
                  )}
                </nav>
                <div className="mt-6 pt-6 border-t border-border">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Sign Out
                  </Button>
                </div>
              </Card>
            </div>

            {/* Content */}
            <div className="flex-1">
              {activeTab === 'profile' && (
                <Card className="p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileSave} className="space-y-6 max-w-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">First Name</label>
                        <Input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Last Name</label>
                        <Input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Email</label>
                      <Input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="bg-muted text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <Input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </Card>
              )}

              {activeTab === 'orders' && (
                <Card className="p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-6">My Orders</h2>
                  {loading ? (
                    <p className="text-muted-foreground">Loading orders...</p>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">You haven&apos;t placed any orders yet.</p>
                      <Link href="/shop" className="text-foreground hover:underline">
                        Browse Shop →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const stepIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status)
                        const currentStep = stepIndex >= 0 ? stepIndex : 0
                        return (
                          <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <span className="font-semibold text-foreground">{order.orderNumber}</span>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString()} &bull; ${order.total.toFixed(2)}
                                </p>
                              </div>
                              <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || 'bg-muted text-muted-foreground'}`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 mb-4">
                              {['Ordered', 'Processing', 'Shipped', 'Delivered'].map((label, i) => (
                                <React.Fragment key={label}>
                                  <div className={`flex items-center gap-1.5 ${i <= currentStep ? 'text-primary' : 'text-muted-foreground/40'}`}>
                                    <div className={`w-2 h-2 rounded-full ${i <= currentStep ? 'bg-primary' : 'bg-border'}`} />
                                    <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
                                  </div>
                                  {i < 3 && (
                                    <div className={`flex-1 h-px ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>

                            {order.trackingNumber && (
                              <Link
                                href={`/track?order=${order.orderNumber}`}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                Track: {order.trackingNumber}
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M3 6h6M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </Link>
                            )}

                            {!order.trackingNumber && order.status === 'shipped' && (
                              <p className="text-xs text-muted-foreground italic">Tracking number pending</p>
                            )}

                            <div className="mt-3">
                              <Link
                                href={`/track?order=${order.orderNumber}`}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                View Details &rarr;
                              </Link>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )}

              {activeTab === 'wishlist' && (
                <Card className="p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-6">My Wishlist</h2>
                  <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
                  <Link href="/shop" className="text-foreground hover:underline">
                    Browse Shop →
                  </Link>
                </Card>
              )}

              {activeTab === 'addresses' && (
                <Card className="p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Saved Addresses</h2>
                  <p className="text-muted-foreground">No saved addresses.</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
