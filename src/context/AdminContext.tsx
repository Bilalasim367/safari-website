"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Category, Order, User, Notification, dashboardStats, recentActivity, categories as initialCategories, orders as initialOrders, users as initialUsers, notifications as initialNotifications } from "@/data/admin/data";

interface AdminContextType {
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: number, category: Partial<Category>) => void;
  deleteCategory: (id: number) => void;
  
  orders: Order[];
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  
  users: User[];
  updateUserStatus: (id: number, status: User["status"]) => void;
  
  notifications: Notification[];
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Notification) => void;
  
  stats: typeof dashboardStats;
  activity: typeof recentActivity;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const updateCategory = (id: number, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      )
    );
  };

  const updateUserStatus = (id: number, status: User["status"]) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  };

  const markNotificationRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  return (
    <AdminContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        orders,
        updateOrderStatus,
        users,
        updateUserStatus,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        stats: dashboardStats,
        activity: recentActivity,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
