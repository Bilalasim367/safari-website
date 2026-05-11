"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
  size?: string;
}

export default function ProductCard({ id, name, slug, price, originalPrice, image, category, isNew, isBestseller, size }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const hasValidImage = image && image.trim() !== '';
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const savings = originalPrice ? (originalPrice - price).toFixed(2) : "0.00";
  const badge = isBestseller ? "Bestseller" : isNew ? "New" : "";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: parseInt(id, 10),
      name,
      price,
      image,
      size: size || "Default",
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link href={`/shop/${slug}`} className="h-full">
      <div
        className="group relative w-full overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full bg-card rounded-xl border border-border"
        style={{
          transform: hovered ? "translateY(-4px)" : "translateY(0))",
          boxShadow: hovered ? "0 10px 15px -3px rgba(0,0,0,0.1)" : "none",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image Area */}
        <div
          className="relative overflow-hidden bg-muted"
          style={{ height: "260px" }}
        >
          {hasValidImage ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{
                transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1))",
                transform: hovered ? "scale(1.05)" : "scale(1))",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                width="72"
                height="72"
                viewBox="0 0 72 72"
                fill="none"
                style={{ opacity: 0.18 }}
              >
                <rect x="8" y="16" width="56" height="40" rx="4" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="26" cy="30" r="5" stroke="currentColor" strokeWidth="2.5" />
                <path d="M8 46 L22 34 L32 44 L44 30 L64 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <span className="absolute top-3 left-3 flex items-center gap-1 bg-foreground text-background text-xs font-medium px-2 py-1 rounded-full">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-primary">
                <circle cx="4" cy="4" r="3" fill="currentColor" />
              </svg>
              {discount}% Off
            </span>
          )}

          {/* Category badge */}
          {badge && (
            <span className="absolute top-3 right-3 bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
              {badge}
            </span>
          )}
        </div>

        <div className="flex-1 px-5 pb-3 pt-4">
          {/* Category */}
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-1">{category}</p>

          {/* Product Name */}
          <h3 className="text-base font-semibold text-foreground leading-tight mb-3">
            {name}
          </h3>

          {/* Pricing Row */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-foreground tracking-tight">
              ${price.toFixed(2)}
            </span>
            {originalPrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ${originalPrice.toFixed(2)}
                </span>
                <span className="ml-auto bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                  Save ${savings}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 pt-0">
          {/* Add to Cart Button with slide-up on hover */}
          <button
            onClick={handleAdd}
            aria-label={`Add ${name} to cart`}
            className="w-full py-2 px-4 border border-border rounded-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-background hover:bg-accent hover:text-accent-foreground"
            style={{
              backgroundColor: added ? "hsl(var(--primary))" : undefined,
              color: added ? "hsl(var(--primary-foreground))" : undefined,
            }}
          >
            {added ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: 'inline', marginRight: '8px' }}>
                  <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Added to Cart
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: 'inline', marginRight: '8px' }}>
                  <path d="M2 2h1.5l2 8h7l1.5-5H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7.5" cy="12.5" r="1" fill="currentColor" />
                  <circle cx="11.5" cy="12.5" r="1" fill="currentColor" />
                </svg>
                Add to Cart
              </>
            )}
          </button>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 mt-3">
            {["Free Returns", "Secure Pay", "Fast Ship"].map((txt) => (
              <span
                key={txt}
                className="text-xs text-muted-foreground font-medium tracking-wide"
              >
                {txt}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
