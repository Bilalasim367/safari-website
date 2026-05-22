"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  orders: number;
  totalSpent: number;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (!cancelled && data.success) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const updateUserStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === id ? { ...u, status } : u));
        if (selectedUser && selectedUser.id === id) {
          setSelectedUser({ ...selectedUser, status });
        }
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">{users.length} total customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H3v2a3 3 0 005.356 1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold">{users.length}</p>
              <p className="text-muted-foreground text-sm">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
              <p className="text-muted-foreground text-sm">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-yellow-600">{users.filter(u => u.status === 'inactive').length}</p>
              <p className="text-muted-foreground text-sm">Inactive</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value || null)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card 
            key={user.id} 
            className="p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedUser(user)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar && user.avatar.trim() ? (
                  <Image src={user.avatar} alt={user.name} width={48} height={48} className="object-cover" />
                ) : (
                  <span className="text-lg font-medium text-muted-foreground">{user.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-muted-foreground text-sm truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <div>
                <p className="text-lg font-serif font-bold">${user.totalSpent.toFixed(2)}</p>
                <p className="text-muted-foreground text-xs">{user.orders} orders</p>
              </div>
              <Badge 
                variant={
                  user.status === 'active' ? 'default' :
                  user.status === 'blocked' ? 'destructive' :
                  'secondary'
                }
                className={
                  user.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                  user.status === 'blocked' ? '' :
                  'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                }
              >
                {user.status}
              </Badge>
            </div>
          </Card>
        ))}
        
        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border">
            <p className="text-muted-foreground">No customers found</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  {selectedUser.avatar && selectedUser.avatar.trim() ? (
                    <Image src={selectedUser.avatar} alt={selectedUser.name} width={80} height={80} className="object-cover" />
                  ) : (
                    <span className="text-3xl font-medium text-muted-foreground">{selectedUser.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                <p className="text-muted-foreground">{selectedUser.email}</p>
                <Badge 
                  variant={
                    selectedUser.status === 'active' ? 'default' :
                    selectedUser.status === 'blocked' ? 'destructive' :
                    'secondary'
                  }
                  className={
                    selectedUser.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                    selectedUser.status === 'blocked' ? '' :
                    'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                  }
                >
                  {selectedUser.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <Card className="p-4 text-center">
                  <p className="text-2xl font-serif font-bold">{selectedUser.orders}</p>
                  <p className="text-muted-foreground text-xs">Orders</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-serif font-bold">${selectedUser.totalSpent.toFixed(2)}</p>
                  <p className="text-muted-foreground text-xs">Total Spent</p>
                </Card>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Phone</p>
                <p className="text-foreground">{selectedUser.phone || 'Not provided'}</p>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Member Since</p>
                <p className="text-foreground">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>

              <div className="pt-3 border-t">
                <p className="text-muted-foreground text-sm mb-3">Update Status</p>
                <div className="flex gap-2">
                  {['active', 'inactive', 'blocked'].map((status) => (
                    <Button
                      key={status}
                      onClick={() => updateUserStatus(selectedUser.id, status)}
                      variant={
                        selectedUser.status === status 
                          ? status === 'active' ? 'default' :
                            status === 'blocked' ? 'destructive' :
                            'secondary'
                          : 'outline'
                      }
                      className={`flex-1 capitalize ${
                        selectedUser.status === status && status === 'active' ? 'bg-green-600 text-white hover:bg-green-600' :
                        selectedUser.status === status && status === 'blocked' ? '' :
                        selectedUser.status === status && 'bg-yellow-500 text-white hover:bg-yellow-500'
                      }`}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
