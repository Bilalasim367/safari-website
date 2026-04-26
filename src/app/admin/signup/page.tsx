"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ADMIN_KEY = "safari-admin-setup-key-2024";

export default function AdminSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminKey: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.adminKey !== ADMIN_KEY) {
      setError("Invalid admin registration key");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          adminKey: formData.adminKey,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/");
      } else {
        setError(data.message || "Failed to create admin account");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif font-bold text-black mb-2">Create Admin Account</h1>
            <p className="text-gray-600">Register with admin key to access dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 text-sm block mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm block mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 text-sm block mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm block mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                placeholder="Min 8 characters"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm block mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                placeholder="Confirm password"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm block mb-2">Admin Registration Key</label>
              <input
                type="password"
                name="adminKey"
                value={formData.adminKey}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                placeholder="Enter admin key"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Admin Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an admin account?{" "}
              <Link href="/admin/login" className="text-black font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-black transition-colors text-sm">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}