"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

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
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
    } catch (error) {
      console.error('Error updating user:', error);
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
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-black">Customers</h1>
          <p className="text-gray-500 mt-1">{users.length} total customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H3v2a3 3 0 005.356 1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-black">{users.length}</p>
              <p className="text-gray-400 text-sm">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
              <p className="text-gray-400 text-sm">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-yellow-600">{users.filter(u => u.status === 'inactive').length}</p>
              <p className="text-gray-400 text-sm">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-black"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div 
            key={user.id} 
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedUser(user)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar && user.avatar.trim() ? (
                  <Image src={user.avatar} alt={user.name} width={48} height={48} className="object-cover" />
                ) : (
                  <span className="text-lg font-medium text-gray-500">{user.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-black truncate">{user.name}</p>
                <p className="text-gray-400 text-sm truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-lg font-serif font-bold text-black">${user.totalSpent.toFixed(2)}</p>
                <p className="text-gray-400 text-xs">{user.orders} orders</p>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full capitalize ${
                user.status === 'active' ? 'bg-green-100 text-green-700' :
                user.status === 'blocked' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {user.status}
              </span>
            </div>
          </div>
        ))}
        
        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-400">No customers found</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="border-b border-gray-100 p-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Customer Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  {selectedUser.avatar && selectedUser.avatar.trim() ? (
                    <Image src={selectedUser.avatar} alt={selectedUser.name} width={80} height={80} className="object-cover" />
                  ) : (
                    <span className="text-3xl font-medium text-gray-500">{selectedUser.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-black">{selectedUser.name}</h3>
                <p className="text-gray-500">{selectedUser.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full capitalize ${
                  selectedUser.status === 'active' ? 'bg-green-100 text-green-700' :
                  selectedUser.status === 'blocked' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedUser.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-serif font-bold text-black">{selectedUser.orders}</p>
                  <p className="text-gray-400 text-xs">Orders</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-serif font-bold text-black">${selectedUser.totalSpent.toFixed(2)}</p>
                  <p className="text-gray-400 text-xs">Total Spent</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Phone</p>
                <p className="text-black">{selectedUser.phone || 'Not provided'}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Member Since</p>
                <p className="text-black">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-gray-500 text-sm mb-3">Update Status</p>
                <div className="flex gap-2">
                  {['active', 'inactive', 'blocked'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateUserStatus(selectedUser.id, status)}
                      className={`flex-1 py-2 rounded-lg text-sm capitalize transition-colors ${
                        selectedUser.status === status 
                          ? status === 'active' ? 'bg-green-600 text-white' :
                            status === 'blocked' ? 'bg-red-600 text-white' :
                            'bg-yellow-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}