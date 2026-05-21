"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    <div className="min-h-screen pt-16 md:pt-20 bg-background">
      <div className="bg-background border-b border-border py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-serif text-foreground mb-2">Reset Password</h1>
          <p className="text-muted-foreground">We&apos;ll help you recover your account</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <p className="text-muted-foreground">Enter your email address and we&apos;ll send you a reset code.</p>
              
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-semibold uppercase tracking-wider"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </Button>

              <p className="text-center text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="text-foreground font-medium hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-6">
              {demoCode && (
                <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">Demo Mode - Your reset code:</p>
                  <p className="text-2xl font-bold tracking-wider">{demoCode}</p>
                </div>
              )}

              <p className="text-muted-foreground">Enter the reset code sent to your email.</p>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Reset Code</label>
                <Input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                  required
                  className="uppercase tracking-wider text-center text-xl"
                  placeholder="XXXXXX"
                  maxLength={6}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 8 characters"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-semibold uppercase tracking-wider"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Password Reset Complete</h2>
              <p className="text-muted-foreground">Your password has been reset successfully.</p>
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
