'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  categorySlug: string;
}

export default function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  React.useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  React.useEffect(() => {
    clearTimeout(timeoutRef.current);

    if (!query) return;

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b border-border p-4">
          <svg className="w-6 h-6 text-muted-foreground mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 text-lg border-0 focus-visible:ring-0"
            autoFocus
          />
          <DialogClose className="inline-flex items-center justify-center rounded-lg size-8 text-muted-foreground hover:text-foreground transition-all outline-none select-none">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </DialogClose>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-muted-foreground">Searching...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No products found for &quot;{query}&quot;
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="divide-y divide-border">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  onClick={handleClose}
                  className="flex items-center gap-4 p-4 hover:bg-accent transition-colors"
                >
                  <div className="relative w-16 h-20 bg-muted flex-shrink-0">
                    {product.image ? (
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.categorySlug}</p>
                    <h3 className="text-foreground font-medium">{product.name}</h3>
                    <p className="text-muted-foreground mt-1">PKR {product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-4 bg-muted text-center">
              <Link 
                href={`/shop?q=${encodeURIComponent(query)}`} 
                onClick={onClose}
                className="text-foreground font-medium hover:underline"
              >
                View all results →
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
