"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Rating } from "@/components/Rating";

interface ShopProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  images?: string[];
  size?: string;
  rating?: number;
  reviewCount?: number;
  currency?: string;
  variant?: "light" | "dark";
}

export default function ShopProductCard({
  id,
  name,
  slug,
  price,
  originalPrice,
  image,
  images,
  size,
  rating,
  reviewCount,
  currency,
  variant = "light",
}: ShopProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  const hasValidImage = image && image.trim() !== "";
  const discount = originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      name,
      price,
      image,
      size: (size && size.trim()) || '12ml',
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyButtonClasses = `w-full min-h-[48px] px-2 sm:px-4 whitespace-nowrap text-xs sm:text-sm font-semibold rounded-md transition-all duration-300 ease-in-out flex items-center justify-center gap-2 ${
    added
      ? 'bg-charcoal text-background'
      : 'bg-[#B6965D] text-black hover:bg-[#B6965D]/90'
  }`;

  const revealClasses = 'lg:opacity-0 lg:translate-y-3 lg:pointer-events-none lg:group-hover:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:pointer-events-auto';

  return (
    <Link
      href={`/shop/${slug}`}
      className={`group relative w-full overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full rounded-xl border ${
        variant === "dark"
          ? "bg-[#161616] border-[#B6965D]/20 hover:-translate-y-1 hover:shadow-xl hover:border-[#B6965D]/40"
          : "bg-card border-border hover:-translate-y-1 hover:shadow-xl hover:border-gold/40"
      }`}
    >
      <div className="relative overflow-hidden bg-muted aspect-[3/4]">
        {hasValidImage ? (
          <>
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            />
            {images && images.length > 1 && (
              <Image
                src={images[1]}
                alt={name}
                fill
                className="object-cover transition-opacity duration-300 opacity-0 lg:group-hover:opacity-100"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ opacity: 0.18 }}>
              <rect x="8" y="16" width="56" height="40" rx="4" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="26" cy="30" r="5" stroke="currentColor" strokeWidth="2.5" />
              <path d="M8 46 L22 34 L32 44 L44 30 L64 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {discount > 0 && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-br from-gold to-gold-hover text-black text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-md">
            -{discount}%
          </span>
        )}

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(id); }}
          aria-label={isWishlisted(id) ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-10 w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
            variant === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-background/80 hover:bg-background"
          }`}
        >
          <Heart className={`w-5 h-5 md:w-4 md:h-4 ${isWishlisted(id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-3 sm:px-4 pt-3 pb-3">
        <h3 className={`text-sm sm:text-base font-semibold leading-tight ${variant === "dark" ? "text-white" : "text-foreground"}`}>
          {name}
        </h3>

        {rating !== undefined && (
          <div className="mt-1.5 mb-1">
            <Rating rating={rating} reviews={reviewCount} size="sm" />
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-3">
          <span className="text-base sm:text-xl font-bold text-[#B6965D] tracking-tight">
            {(currency || "PKR") + " " + price.toLocaleString()}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs sm:text-sm text-[#9a958d] line-through">
              Was: {(currency || "PKR") + " " + originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={handleAdd}
            aria-label={`Add ${name} to cart`}
            className={`${buyButtonClasses} ${revealClasses}`}
          >
            {added ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Added
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 2h1.5l2 8h7l1.5-5H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7.5" cy="12.5" r="1" fill="currentColor" />
                  <circle cx="11.5" cy="12.5" r="1" fill="currentColor" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}