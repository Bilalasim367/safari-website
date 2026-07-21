"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Rating } from "@/components/Rating";
import QuickViewModal from "@/components/QuickViewModal";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  images?: string[];
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
  size?: string;
  rating?: number;
  reviewCount?: number;
  gender?: string;
  season?: string | null;
  impressionOf?: string | null;
  lowestPrice?: number | null;
  currency?: string;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  originalPrice,
  image,
  images,
  category,
  isNew,
  isBestseller,
  size,
  rating,
  reviewCount,
  gender,
  season,
  impressionOf,
  lowestPrice,
  currency,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const hasValidImage = image && image.trim() !== "";
  const discount = originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const badge = isBestseller ? "Bestseller" : isNew ? "New" : "";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
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
    <Link
      href={`/shop/${slug}`}
      className="group relative w-full overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full bg-card rounded-xl border border-border hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex flex-col h-full">
        <div className="relative overflow-hidden bg-muted aspect-[3/4]">
          {hasValidImage ? (
            <>
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {images && images.length > 1 && (
                <Image
                  src={images[1]}
                  alt={name}
                  fill
                  className="object-cover transition-opacity duration-300 opacity-0 lg:group-hover:opacity-100"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ opacity: 0.18 }}>
                <rect x="8" y="16" width="56" height="40" rx="4" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="26" cy="30" r="5" stroke="currentColor" strokeWidth="2.5" />
                <path d="M8 46 L22 34 L32 44 L44 30 L64 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {discount > 0 && (
            <span className="absolute top-3 left-3 flex items-center gap-1 bg-foreground text-background text-xs font-medium px-2 py-1 rounded-full z-10">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-primary">
                <circle cx="4" cy="4" r="3" fill="currentColor" />
              </svg>
              {discount}% Off
            </span>
          )}

          {badge && (
            <span className="absolute bottom-3 left-3 bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm z-10">
              {badge}
            </span>
          )}

          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); setShowQuickView(true); }}
              aria-label="Quick view"
              className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <Eye className="w-5 h-5 md:w-4 md:h-4 text-muted-foreground" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleWishlist(id); }}
              aria-label={isWishlisted(id) ? "Remove from wishlist" : "Add to wishlist"}
              className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <Heart className={`w-5 h-5 md:w-4 md:h-4 ${isWishlisted(id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            </button>
          </div>
        </div>

        <div className="flex-1 px-5 pb-3 pt-4">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em]">{category}</p>
            {gender && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-muted-foreground/20 text-muted-foreground uppercase tracking-wider">
                {gender}
              </span>
            )}
            {season && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {season}
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold text-foreground leading-tight mb-1">
            {name}
          </h3>

          {impressionOf && (
            <p className="text-[11px] text-muted-foreground italic mb-1">
              Impression of {impressionOf}
            </p>
          )}

          {rating !== undefined && (
            <div className="mb-2">
              <Rating rating={rating} reviews={reviewCount} size="sm" />
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            {lowestPrice != null ? (
              <span className="text-2xl font-bold text-foreground tracking-tight">
                {currency || "PKR"} {lowestPrice.toLocaleString()}
              </span>
            ) : (
              <span className="text-2xl font-bold text-foreground tracking-tight">
                {currency || "PKR"} {price.toFixed(2)}
              </span>
            )}
            {originalPrice && !lowestPrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {currency || "PKR"} {originalPrice.toFixed(2)}
                </span>
                <span className="ml-auto bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                  Save {(currency || "PKR") + " " + (originalPrice - price).toFixed(2)}
                </span>
              </>
            )}
            {lowestPrice != null && lowestPrice !== price && (
              <span className="text-sm text-muted-foreground">From</span>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 pt-0">
          <button
            onClick={handleAdd}
            aria-label={`Add ${name} to cart`}
            className="w-full py-2 px-4 border border-border rounded-lg transition-all duration-300 bg-background hover:bg-accent hover:text-accent-foreground sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0"
            style={{
              backgroundColor: added ? "hsl(var(--primary))" : undefined,
              color: added ? "hsl(var(--primary-foreground))" : undefined,
            }}
          >
            {added ? (
              <span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: "inline", marginRight: "8px" }}>
                  <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Added
              </span>
            ) : (
              <span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: "inline", marginRight: "8px" }}>
                  <path d="M2 2h1.5l2 8h7l1.5-5H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7.5" cy="12.5" r="1" fill="currentColor" />
                  <circle cx="11.5" cy="12.5" r="1" fill="currentColor" />
                </svg>
                Add to Cart
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center justify-center gap-4 mt-3">
            {["Free Returns", "Secure Pay", "Fast Ship"].map((txt) => (
              <span key={txt} className="text-xs text-muted-foreground font-medium tracking-wide">
                {txt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {showQuickView && (
        <QuickViewModal
          id={id}
          name={name}
          slug={slug}
          price={price}
          originalPrice={originalPrice ?? undefined}
          image={image}
          images={images}
          category={category}
          size={size}
          rating={rating}
          reviewCount={reviewCount}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </Link>
  );
}
