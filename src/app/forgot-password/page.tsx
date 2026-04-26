"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [demoCode, setDemoCode] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(data.message);
        setDemoCode(data.resetCode || '');
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setStep(3);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="bg-white border-b border-gray-200 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-serif text-black mb-2">Reset Password</h1>
          <p className="text-gray-500">We'll help you recover your account</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <p className="text-gray-600">Enter your email address and we'll send you a reset code.</p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-gray-700 text-sm block mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>

              <p className="text-center text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="text-black font-medium hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-6">
              {demoCode && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
                  <p className="font-medium mb-1">Demo Mode - Your reset code:</p>
                  <p className="text-2xl font-bold tracking-wider">{demoCode}</p>
                </div>
              )}

              <p className="text-gray-600">Enter the reset code sent to your email.</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-gray-700 text-sm block mb-2">Reset Code</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black uppercase tracking-wider text-center text-xl"
                  placeholder="XXXXXX"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="text-gray-700 text-sm block mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                  placeholder="Min 8 characters"
                />
              </div>

              <div>
                <label className="text-gray-700 text-sm block mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black"
                  placeholder="Confirm password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-black">Password Reset Complete</h2>
              <p className="text-gray-600">Your password has been reset successfully.</p>
              <Link href="/login" className="btn-primary inline-block">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}