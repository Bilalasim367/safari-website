"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ChevronLeft, Minus, Plus, Heart, Truck, Shield } from "lucide-react";
import { Rating } from "@/components/Rating";
import ScarcityLine from "@/components/ScarcityLine";
import { toast } from "sonner";

export interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  isNew: boolean;
  isBestseller: boolean;
  size: string;
  rating: number;
  reviewCount: number;
  gender: string | null;
  season: string | null;
  impressionOf: string | null;
  currency: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  images: string[];
  category: { name: string; slug: string } | null;
  categorySlug?: string;
  fragranceFamily?: string | null;
  rating: number;
  reviews: number;
  description: string;
  shortDescription?: string;
  isBestseller: boolean;
  isNew: boolean;
  inStock: boolean;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
  notes?: string;
  gender?: string;
  season?: string;
  impressionOf?: string;
  tags?: string;
  currency?: string;
  longDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  type?: string;
  concentration?: string;
  bottleStyle?: string;
  longevity?: string;
  sillage?: string;
  applicatorType?: string;
  origin?: string;
  ingredients?: string;
  size?: string;
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: RelatedProduct[];
  freeShippingThreshold: number | null;
  whatsappNumber: string;
}

const DEFAULT_NOTES = ["Woody", "Musk", "Oud", "Amber"];

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.47 1.71 6.41L3.2 28.8l6.56-1.69a12.74 12.74 0 0 0 6.24 1.6h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05A12.72 12.72 0 0 0 16.004 3.2Zm7.43 18.13c-.31.87-1.8 1.66-2.48 1.72-.63.05-1.43.24-4.78-1-3.33-1.23-5.73-4.5-5.9-4.71-.17-.21-1.41-1.88-1.41-3.58 0-1.7.89-2.54 1.21-2.89.31-.35.68-.43.91-.43h.65c.21 0 .49-.08.77.59.31.74 1.04 2.55 1.13 2.74.09.18.15.4.03.65-.12.25-.18.4-.36.62l-.53.62c-.17.18-.35.37-.15.73.2.36.9 1.48 1.93 2.4 1.32 1.18 2.44 1.55 2.79 1.72.35.17.55.14.76-.09.21-.23.88-1.02 1.11-1.37.23-.35.47-.29.79-.18.32.12 2.05.97 2.41 1.14.35.18.59.26.68.41.09.15.09.86-.22 1.73Z" />
    </svg>
  )
}

function cleanNotes(raw: string | undefined): string[] {
  if (!raw) {
    return DEFAULT_NOTES;
  }
  const notes = raw
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
  return notes.length ? notes : DEFAULT_NOTES;
}

function formatDescription(product: Product): string {
  const source =
    product.shortDescription ||
    product.description ||
    (product.longDescription ?? "").split("\n\n")[0].replace(/\*\*/g, "");
  return source?.trim() || "";
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  freeShippingThreshold,
  whatsappNumber,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "notes">("description");
  const [expanded, setExpanded] = useState(false);

  const router = useRouter();

  if (!product) {
    return (
      <div className="py-24 text-center">
        <div className="container-custom">
          <h1 className="text-4xl font-serif text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/shop" className="btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const isAttar = product?.type === "Attar";
  const currencySymbol = product?.currency || "PKR";
  const displayPrice = product?.price ?? 0;
  const displayOriginalPrice = product?.originalPrice;

  const genderDisplay = product.gender?.trim() || "Unisex";
  const familyDisplay = product.fragranceFamily?.trim() || "—";
  const sizeDisplay = (product.size?.trim() || "12 ML").toUpperCase();
  const notes = cleanNotes(product.notes);
  const mainDescription = formatDescription(product);
  const hasRealReviews = product.reviews > 0 && product.rating > 0;

  const mainImage = product.image?.trim() || "";
  const galleryImages = Array.isArray(product.images)
    ? product.images.filter((img: string) => img?.trim())
    : [];
  const productImages = mainImage
    ? [mainImage, ...galleryImages.filter((img) => img !== mainImage)]
    : galleryImages.length > 0
      ? galleryImages
      : [];

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: product.size?.trim() || "12ml",
        quantity,
      });
      toast.success(`${product.name} added to cart!`);
    }
  };

  // Deterministic link (no window.location) so server & client href always match (hydration-safe)
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi Safari Perfumes! 👋\nI want to order:\n\n*${product.name}*\nSize: ${sizeDisplay}\nPrice: ${currencySymbol} ${displayPrice.toLocaleString()}\n\nPlease confirm my order. Thank you!`
  )}`;

  const infoCards = [
    { icon: "👫", key: "GENDER", value: genderDisplay },
    { icon: "📦", key: "SIZE", value: sizeDisplay },
    { icon: "🌿", key: "FRAGRANCE", value: familyDisplay },
    { icon: "💰", key: "AMOUNT", value: `${currencySymbol} ${displayPrice.toLocaleString()}` },
  ];

  const wishlisted = isWishlisted(product.id);

  const mobileBottomPadding = "pb-24 lg:pb-0";

  return (
    <>
      <div className={mobileBottomPadding}>
        <div className="container-custom py-6 lg:py-12">
          {/* Mobile back row (main site header handles nav on desktop) */}
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="lg:hidden inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-[#c9a962] transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {/* Desktop-only breadcrumb */}
          <nav className="hidden lg:block text-xs text-muted-foreground mb-8">
            <Link href="/" className="hover:text-[#c9a962] transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-[#c9a962] transition-colors">
              Shop
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
            {/* ── LEFT: image gallery (sticky on desktop) ── */}
            <div className="lg:sticky lg:top-[320px] lg:self-start">
              <div className="relative bg-muted overflow-hidden rounded-2xl border border-border aspect-[3/4] lg:aspect-square">
                {productImages[selectedImage] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={productImages[selectedImage]}
                    alt={`${product.name} perfume bottle - Safari Perfumes Pakistan`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground text-lg">[Product Image]</span>
                  </div>
                )}
                {product.isNew && (
                  <span className="absolute top-3 left-3 bg-[#c9a962] text-black text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    New
                  </span>
                )}
                {product.isBestseller && (
                  <span className="absolute top-3 right-3 bg-black/80 text-[#c9a962] text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#c9a962]/40">
                    Bestseller
                  </span>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex gap-2.5 mt-3 overflow-x-auto scrollbar-hide">
                  {productImages.map((img: string, index: number) => (
                    <button
                      key={index}
                      className={`relative w-16 h-20 shrink-0 overflow-hidden rounded-lg cursor-pointer transition-all ${
                        selectedImage === index
                          ? "ring-2 ring-[#c9a962] ring-offset-2 ring-offset-background"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View image ${index + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`${product.name} - View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: product info ── */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3 lg:mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {product.category?.name && (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c9a962] border border-[#c9a962]/40 rounded-full px-3 py-1">
                        {product.category.name}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] bg-black text-[#c9a962] rounded-full px-3 py-1 border border-white/10">
                      {isAttar ? "Attar" : "Perfume"}
                    </span>
                  </div>
                  <h1 className="font-heading text-2xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-foreground leading-tight lg:leading-[1.15]">
                    {product.name}
                  </h1>
                  {product.impressionOf && (
                    <p className="text-sm text-muted-foreground italic mt-1.5">
                      Impression of {product.impressionOf}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                  className={`hidden lg:flex items-center justify-center w-11 h-11 rounded-full border transition-colors shrink-0 ${
                    wishlisted
                      ? "border-[#c9a962] bg-[#c9a962]/15 text-[#c9a962]"
                      : "border-border bg-white text-muted-foreground hover:text-[#c9a962] hover:border-[#c9a962]/50"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Rating row (or scarcity fallback) */}
              {hasRealReviews ? (
                <div className="flex items-center gap-1 mb-4">
                  <Rating rating={product.rating} reviews={product.reviews} />
                </div>
              ) : (
                <div className="mb-4">
                  <ScarcityLine />
                </div>
              )}

              {/* Mobile: size badge next to title area (already in header row above) */}
              <div className="mb-4 -mt-1 flex items-center gap-2 lg:hidden">
                <span className="inline-flex items-center gap-1 bg-[#c9a962]/15 text-[#c9a962] text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#c9a962]/30">
                  {sizeDisplay}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                  ✅ In Stock
                </span>
              </div>

              {/* Price pill */}
              <div className="mb-6 inline-flex items-baseline gap-x-3 gap-y-1 flex-wrap bg-[#faf3e3] border border-[#c9a962]/40 rounded-2xl px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-0.5">
                    Price
                  </p>
                  <span className="text-3xl lg:text-4xl font-bold text-[#c9a962] tracking-tight">
                    {currencySymbol} {displayPrice.toLocaleString()}
                  </span>
                </div>
                {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                  <div className="flex flex-col justify-end">
                    <span className="text-sm lg:text-base text-muted-foreground line-through">
                      {currencySymbol} {displayOriginalPrice.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">
                      Save {Math.round((1 - displayPrice / displayOriginalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("description")}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    activeTab === "description"
                      ? "bg-[#c9a962] text-black"
                      : "border border-[#c9a962]/50 text-[#c9a962] hover:bg-[#c9a962]/10"
                  }`}
                >
                  Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    activeTab === "notes"
                      ? "bg-[#c9a962] text-black"
                      : "border border-[#c9a962]/50 text-[#c9a962] hover:bg-[#c9a962]/10"
                  }`}
                >
                  Attar Notes
                </button>
              </div>

              {/* Tab content */}
              {activeTab === "description" ? (
                <div className="bg-white border border-border rounded-2xl p-5 mb-6">
                  <p className={`text-sm lg:text-[15px] text-muted-foreground leading-relaxed ${!expanded ? "line-clamp-3" : ""}`}>
                    {mainDescription}
                  </p>
                  {mainDescription.length > 140 && (
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="mt-2 text-sm font-semibold text-[#c9a962] hover:underline inline-flex items-center gap-1"
                    >
                      {expanded ? "Show less" : "... Show more"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-border rounded-2xl p-5 mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
                    Attar Notes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {notes.map((note) => (
                      <span
                        key={note}
                        className="rounded-full bg-[#c9a962]/15 border border-[#c9a962]/30 text-[#c9a962] text-xs font-semibold px-3.5 py-1.5"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Info cards 2x2 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {infoCards.map((card) => (
                  <div key={card.key} className="bg-[#f6efdf] rounded-2xl p-3.5 border border-[#c9a962]/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-lg leading-none">{card.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {card.key}
                      </span>
                    </div>
                    <p className="text-sm lg:text-[15px] font-bold text-foreground">{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Action area — stacked full-width CTAs */}
              <div className="flex flex-col gap-3 mb-5">
                {/* Qty stepper */}
                <div className="flex items-center justify-between border border-border rounded-full bg-white px-2 min-h-[52px] w-[140px]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-[#c9a962] transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-bold text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-[#c9a962] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full min-h-[56px] rounded-full bg-[#c9a962] hover:bg-[#b8923d] text-black text-base font-bold uppercase tracking-wider px-8 transition-colors"
                >
                  Add to Cart
                </button>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[52px] rounded-full border-2 border-[#25D366] bg-white text-[#128C4A] hover:bg-[#25D366]/10 text-sm font-bold uppercase tracking-wider px-8 transition-colors"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  WhatsApp pe Order Karein
                </a>
              </div>

              {/* Trust strip (desktop) */}
              <div className="hidden lg:flex items-center justify-center gap-6 flex-wrap text-xs text-muted-foreground mb-6 bg-white border border-border rounded-2xl p-3.5">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#c9a962]" /> 100% Original
                </span>
                <span className="flex items-center gap-1.5">💵 Cash on Delivery</span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#c9a962]" /> Free Shipping {freeShippingThreshold ? `999+` : "Nationwide"}
                </span>
              </div>

              {/* Scarcity (only when reviews shown above OR on desktop) */}
              {hasRealReviews && (
                <div className="mb-6">
                  <ScarcityLine />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        {hasRealReviews && (
          <section className="py-8 lg:py-14 bg-background border-y border-border">
            <div className="container-custom">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="font-heading text-2xl lg:text-3xl text-foreground mb-4">
                  Customer Reviews
                </h2>
                <p className="text-6xl lg:text-7xl font-bold text-foreground">{product.rating}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Rating rating={product.rating} reviews={product.reviews} size="sm" />
                </div>
                <p className="text-muted-foreground mt-2">
                  Based on {product.reviews} {product.reviews === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Related products */}
        <section className="py-10 lg:py-16 bg-muted">
          <div className="container-custom">
            <h2 className="font-heading text-2xl lg:text-3xl text-center mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  id={String(relProduct.id)}
                  name={relProduct.name}
                  slug={relProduct.slug}
                  price={relProduct.price}
                  image={relProduct.image}
                  images={relProduct.images}
                  category={relProduct.category || "Unisex"}
                  isNew={relProduct.isNew}
                  isBestseller={relProduct.isBestseller}
                  rating={relProduct.rating}
                  reviewCount={relProduct.reviewCount}
                  gender={relProduct.gender || undefined}
                  season={relProduct.season || undefined}
                  impressionOf={relProduct.impressionOf || undefined}
                  currency={relProduct.currency || "PKR"}
                />
              ))}
              {Array.from({ length: Math.max(0, 4 - relatedProducts.length) }).map((_, i) => (
                <div key={`skeleton-${i}`} className="space-y-4">
                  <div className="aspect-[3/4] w-full rounded-lg bg-gray-200 animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                  <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-black border-t border-white/10 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9a962]">
              Total
            </p>
            <p className="text-lg font-bold text-white leading-tight">
              {currencySymbol} {displayPrice.toLocaleString()}
            </p>
            {displayOriginalPrice && displayOriginalPrice > displayPrice && (
              <p className="text-[11px] text-white/40 line-through">
                {currencySymbol} {displayOriginalPrice.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-white/20 rounded-full h-10 px-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-[#c9a962] transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-7 text-center text-sm font-semibold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-[#c9a962] transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="rounded-full bg-[#c9a962] hover:bg-[#b8923d] text-black text-sm font-bold uppercase tracking-wider px-6 h-10 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}