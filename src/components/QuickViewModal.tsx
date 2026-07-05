"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Rating } from "@/components/Rating";

interface QuickViewModalProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  size?: string;
  rating?: number;
  reviewCount?: number;
  onClose: () => void;
}

export default function QuickViewModal({
  id, name, slug, price, originalPrice, image, images: propImages, category, size, rating, reviewCount, onClose,
}: QuickViewModalProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const allImages = [image, ...(propImages || []).slice(1)].filter(Boolean);
  const wishlisted = isWishlisted(id);
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAdd = () => {
    addItem({ id, name, price, image, size: size || "50ml", quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-[3/4] bg-muted">
            <Image src={allImages[selectedImage] || image} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${i === selectedImage ? 'bg-primary' : 'bg-white/60'}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 flex flex-col">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.25em] mb-2">{category}</p>
            <h3 className="text-2xl font-heading text-foreground mb-2">{name}</h3>

            {rating !== undefined && (
              <div className="mb-4">
                <Rating rating={rating} reviews={reviewCount} />
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">PKR {price.toFixed(2)}</span>
              {originalPrice && (
                <span className="text-lg text-muted-foreground line-through">PKR {originalPrice.toFixed(2)}</span>
              )}
              {discount > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">{discount}% Off</span>
              )}
            </div>

            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAdd}
                className="flex-1 py-3 px-6 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
              >
                {added ? 'Added!' : 'Add to Cart'}
              </button>
              <button
                onClick={() => toggleWishlist(id)}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="w-12 h-12 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
              </button>
            </div>

            <Link
              href={`/shop/${slug}`}
              className="mt-4 text-sm text-center text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              onClick={onClose}
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
