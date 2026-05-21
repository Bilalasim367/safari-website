'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

export default function MobileFilterDrawer({
  children,
  filterCount,
}: {
  children: React.ReactNode;
  filterCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {filterCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-foreground text-background">
            {filterCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] p-0 rounded-t-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground uppercase tracking-wider">Filters</h2>
          <div className="flex items-center gap-3">
            {filterCount > 0 && (
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Clear All
              </Link>
            )}
            <SheetClose className="inline-flex items-center justify-center rounded-full w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </SheetClose>
          </div>
        </div>
        <div className="overflow-y-auto p-6">
          {children}
        </div>
        <div className="p-6 border-t border-border">
          <SheetClose className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Apply Filters
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
