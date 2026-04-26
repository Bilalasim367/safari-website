'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
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
    <div className="pt-20">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200 py-12">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-serif text-black mb-2">My Account</h1>
          <p className="text-gray-500">
            <Link href="/" className="hover:text-black">Home</Link> / Account
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-12">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-gray-50 p-6">
                <div className="text-center mb-6 pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-2xl">
                      {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-black">{user.name}</h3>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full px-4 py-3 text-left text-sm transition-all ${
                        activeTab === tab.id
                          ? 'bg-black text-white font-medium'
                          : 'text-gray-600 hover:text-black hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              {activeTab === 'profile' && (
                <div className="bg-gray-50 p-8">
                  <h2 className="text-xl font-semibold text-black mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileSave} className="space-y-6 max-w-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600 block mb-2">First Name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 bg-white text-black focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 block mb-2">Last Name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 bg-white text-black focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-100 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 border border-gray-300 bg-white text-black focus:outline-none focus:border-black"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-black text-white px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="bg-gray-50 p-8">
                  <h2 className="text-xl font-semibold text-black mb-6">My Orders</h2>
                  {loading ? (
                    <p className="text-gray-500">Loading orders...</p>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
                      <Link href="/shop" className="text-black hover:underline">
                        Browse Shop →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white p-6 border border-gray-200">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-black">{order.orderNumber}</span>
                            <span className="text-sm px-3 py-1 bg-green-100 text-green-700">
                              {order.status}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()} • ${order.total}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="bg-gray-50 p-8">
                  <h2 className="text-xl font-semibold text-black mb-6">My Wishlist</h2>
                  <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
                  <Link href="/shop" className="text-black hover:underline">
                    Browse Shop →
                  </Link>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="bg-gray-50 p-8">
                  <h2 className="text-xl font-semibold text-black mb-6">Saved Addresses</h2>
                  <p className="text-gray-500">No saved addresses.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}