"use client";

import React, { useState } from "react";

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
        <h1 className="text-3xl font-serif font-bold text-black">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your store preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-black text-white"
                    : "text-gray-500 hover:text-black hover:bg-gray-50"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {activeTab === "general" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-black">General Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Store Name</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="w-full bg-transparent text-black font-medium outline-none"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Email</label>
                    <input
                      type="email"
                      value={settings.storeEmail}
                      onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                      className="w-full bg-transparent text-black font-medium outline-none"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Phone</label>
                    <input
                      type="text"
                      value={settings.storePhone}
                      onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                      className="w-full bg-transparent text-black font-medium outline-none"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full bg-transparent text-black font-medium outline-none"
                    >
                      <option value="USD" className="bg-white">USD ($)</option>
                      <option value="EUR" className="bg-white">EUR (€)</option>
                      <option value="GBP" className="bg-white">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleSave} className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-black">Shipping Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-5">
                    <label className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Standard Shipping</label>
                    <p className="text-2xl font-serif font-bold text-black">${settings.shippingFee}</p>
                    <p className="text-gray-400 text-sm mt-1">Flat rate</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5">
                    <label className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Free Shipping</label>
                    <p className="text-2xl font-serif font-bold text-black">${settings.freeShippingThreshold}</p>
                    <p className="text-gray-400 text-sm mt-1">Minimum order</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5">
                    <label className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Tax Rate</label>
                    <p className="text-2xl font-serif font-bold text-black">{settings.taxRate}%</p>
                    <p className="text-gray-400 text-sm mt-1">Per order</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-black">Free Shipping</p>
                      <p className="text-gray-400 text-sm">Orders over ${settings.freeShippingThreshold}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-black">Express Shipping</p>
                      <p className="text-gray-400 text-sm">1-2 business days</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                </div>

                <button onClick={handleSave} className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            )}

            {activeTab === "email" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-black">Email Notifications</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-black">New Order Alerts</p>
                      <p className="text-gray-400 text-sm">Get notified when a new order is placed</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-black">Order Confirmation</p>
                      <p className="text-gray-400 text-sm">Email customers order confirmation</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-black">Shipping Updates</p>
                      <p className="text-gray-400 text-sm">Notify on status changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                </div>

                <button onClick={handleSave} className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-black">Payment Methods</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-4 px-5 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-black text-xs font-bold">VISA</span>
                      </div>
                      <div>
                        <p className="font-medium text-black">Credit/Debit Cards</p>
                        <p className="text-gray-400 text-sm">Visa, Mastercard, Amex</p>
                      </div>
                    </div>
                    <span className="text-green-600 text-sm font-medium">Enabled</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-black text-xs font-bold">PayPal</span>
                      </div>
                      <div>
                        <p className="font-medium text-black">PayPal</p>
                        <p className="text-gray-400 text-sm">Pay with PayPal</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-black text-xs font-bold">COD</span>
                      </div>
                      <div>
                        <p className="font-medium text-black">Cash on Delivery</p>
                        <p className="text-gray-400 text-sm">Pay when you receive</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                </div>

                <button onClick={handleSave} className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}