"use client";

import Link from "next/link";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-serif text-8xl font-bold text-charcoal mb-4">500</h1>
        <div className="w-24 h-1 bg-red-600 mx-auto mb-8"></div>
        <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
          Something Went Wrong
        </h2>
        <p className="text-charcoal/70 text-lg mb-8 max-w-md mx-auto">
          We encountered an unexpected error. Our team has been notified.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-primary"
          >
            Try Again
          </button>
          <Link href="/" className="btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}