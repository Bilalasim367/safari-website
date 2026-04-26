"use client";

import React from "react";
import { useAdmin } from "@/context/AdminContext";

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAdmin();

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2";
      case "user":
        return "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z";
      case "review":
        return "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z";
      case "system":
        return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
      default:
        return "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "order": return "text-blue-400 bg-blue-400/10";
      case "user": return "text-green-400 bg-green-400/10";
      case "review": return "text-[#C9A962] bg-[#C9A962]/10";
      case "system": return "text-red-400 bg-red-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Notifications</h1>
          <p className="text-white/60">Stay updated with store activities</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead} className="btn-secondary">
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-white/60">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2D2D2D]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markNotificationRead(notification.id)}
                className={`flex items-start gap-4 p-6 cursor-pointer transition-colors ${
                  !notification.read ? "bg-[#0D0D0D]/50" : "hover:bg-[#0D0D0D]/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getIcon(notification.type)} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-sm ${notification.read ? "text-white/60" : "text-white font-medium"}`}>
                        {notification.title}
                      </p>
                      <p className="text-white/40 text-sm mt-1">{notification.message}</p>
                    </div>
                    <span className="text-white/40 text-sm whitespace-nowrap">{formatTime(notification.createdAt)}</span>
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-[#C9A962] flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">Order notifications</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#C9A962]" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">New customer registrations</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#C9A962]" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">Product reviews</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#C9A962]" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80">Low stock alerts</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#C9A962]" />
          </label>
        </div>
      </div>
    </div>
  );
}