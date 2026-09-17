"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ShopProductCard from "@/app/shop/ShopProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { defaultSizeForType } from "@/lib/normalize";
import { SITE_URL } from "@/lib/site";
import { ChevronLeft, Minus, Plus, Heart, Truck, Shield, Sparkles, Gem, Flame } from "lucide-react";
import { Rating } from "@/components/Rating";
import ScarcityLine from "@/components/ScarcityLine";
import { toast } from "sonner";

export interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
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

export interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  text: string;
  date: string;
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
  bestTime?: string;
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
  reviewsList: ReviewItem[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.47 1.71 6.41L3.2 28.8l6.56-1.69a12.74 12.74 0 0 0 6.24 1.6h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05A12.72 12.72 0 0 0 16.004 3.2Zm7.43 18.13c-.31.87-1.8 1.66-2.48 1.72-.63.05-1.43.24-4.78-1-3.33-1.23-5.73-4.5-5.9-4.71-.17-.21-1.41-1.88-1.41-3.58 0-1.7.89-2.54 1.21-2.89.31-.35.68-.43.91-.43h.65c.21 0 .49-.08.77.59.31.74 1.04 2.55 1.13 2.74.09.18.15.4.03.65-.12.25-.18.4-.36.62l-.53.62c-.17.18-.35.37-.15.73.2.36.9 1.48 1.93 2.4 1.32 1.18 2.44 1.55 2.79 1.72.35.17.55.14.76-.09.21-.23.88-1.02 1.11-1.37.23-.35.47-.29.79-.18.32.12 2.05.97 2.41 1.14.35.18.59.26.68.41.09.15.09.86-.22 1.73Z" />
    </svg>
  )
}

function formatDescription(product: Product): string {
  const source =
    product.shortDescription ||
    product.description ||
    (product.longDescription ?? "").split("\n\n")[0].replace(/\*\*/g, "");
  return source?.trim() || "";
}

function formatPrice(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("en-PK");
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value || !value.trim()) return null;
  return (
    <div className="bg-[#0f0f0f] rounded-xl p-3 border border-[#B6965D]/15">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a867f] mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  freeShippingThreshold,
  whatsappNumber,
  reviewsList,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "notes" | "details">("description");
  const [expanded, setExpanded] = useState(false);

  const router = useRouter();

  if (!product) {
    return (
      <div className="bg-[#0a0a0a] py-24 text-center">
        <div className="container-custom">
          <h1 className="text-4xl font-serif text-white mb-4">Product Not Found</h1>
          <p className="text-[#8a867f] mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/shop" className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#B6965D] hover:bg-[#c9a873] px-8 py-3 text-sm font-bold uppercase tracking-wider text-black transition-colors">
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

  const sizeLabel = isAttar ? "SIZE" : "VOLUME";

  const genderDisplay = product.gender?.trim() || "Unisex";
  const sizeDisplay = (product.size?.trim() || defaultSizeForType(product.type)).toUpperCase();
  const categoryDisplay = product.category?.name?.trim() || "";
  const mainDescription = formatDescription(product);
  const hasRealReviews = product.reviews > 0 && product.rating > 0;
  const noteSections = [
    { title: "Top Notes", items: product.notesTop || [], icon: Sparkles },
    { title: "Heart Notes", items: product.notesHeart || [], icon: Gem },
    { title: "Base Notes", items: product.notesBase || [], icon: Flame },
  ];
  const hasNotes = noteSections.some((s) => s.items.filter((n) => n?.trim()).length > 0);

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
        size: product.size?.trim() || defaultSizeForType(product.type),
        quantity,
      });
      toast.success(`${product.name} added to cart!`);
    }
  };

  const productUrl = `${SITE_URL}/shop/${product.slug}`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Assalam o Alaikum! I would like to place an order:\n\nProduct: ${product.name}\nPrice: ${currencySymbol} ${formatPrice(displayPrice)}\nQuantity: ${quantity}\nLink: ${productUrl}`
  )}`;

  const infoChips = [
    { icon: "👫", key: "GENDER", value: genderDisplay },
    { icon: "📦", key: sizeLabel, value: sizeDisplay },
  ].filter((chip) => chip.value && String(chip.value).trim() !== "");

  const wishlisted = isWishlisted(product.id);

  const scrollToReviews = () => {
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const mobileBottomPadding = "pb-24 lg:pb-0";

  return (
    <>
      <div className={`-mt-20 md:-mt-28 bg-[#0a0a0a] text-[#b8b3ab] ${mobileBottomPadding}`}>
        <div className="container-custom py-6 lg:py-12">
          {/* Mobile back row */}
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="lg:hidden inline-flex items-center gap-1 text-sm font-semibold text-[#8a867f] hover:text-[#c9a873] transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {/* Desktop-only breadcrumb */}
          <nav className="hidden lg:block text-xs text-[#8a867f] mb-8">
            <Link href="/" className="hover:text-[#c9a873] transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-[#c9a873] transition-colors">
              Shop
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
            {/* ── LEFT: image gallery (sticky on desktop) ── */}
            <div className="lg:sticky lg:top-[320px] lg:self-start">
              <div className="relative bg-[#161616] overflow-hidden rounded-2xl border border-[#B6965D]/20 aspect-[3/4] lg:aspect-square">
                {productImages[selectedImage] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={selectedImage}
                    src={productImages[selectedImage]}
                    alt={`${product.name} perfume bottle - Safari Perfumes Pakistan`}
                    className="pdp-fade w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#8a867f] text-lg">[Product Image]</span>
                  </div>
                )}
                {product.isNew && (
                  <span className="absolute top-3 left-3 bg-[#B6965D] text-black text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    New
                  </span>
                )}
                {product.isBestseller && (
                  <span className="absolute top-3 right-3 bg-black/80 text-[#c9a873] text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#B6965D]/40">
                    Bestseller
                  </span>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex gap-2.5 mt-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
                  {productImages.map((img: string, index: number) => (
                    <button
                      key={index}
                      className={`relative w-16 h-20 shrink-0 overflow-hidden rounded-lg cursor-pointer transition-all snap-start ${
                        selectedImage === index
                          ? "border-2 border-[#B6965D]"
                          : "border border-[#B6965D]/25 opacity-60 hover:opacity-100"
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
                    {categoryDisplay && (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c9a873] border border-[#B6965D]/40 rounded-full px-3 py-1">
                        {categoryDisplay}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] bg-[#B6965D]/15 text-[#c9a873] rounded-full px-3 py-1 border border-[#B6965D]/40">
                      {isAttar ? "Attar" : "Perfume"}
                    </span>
                  </div>
                  <h1 className="font-heading text-2xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-[#f5f1e8] leading-tight lg:leading-[1.15]">
                    {product.name}
                  </h1>
                  {product.impressionOf && (
                    <p className="text-sm text-[#8a867f] italic mt-1.5">
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
                      ? "border-[#B6965D] bg-[#B6965D]/15 text-[#c9a873]"
                      : "border-[#B6965D]/25 bg-white/5 text-[#8a867f] hover:text-[#c9a873] hover:border-[#B6965D]/50"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Rating row (or scarcity fallback) */}
              {hasRealReviews ? (
                <div className="flex items-center gap-2.5 mb-4">
                  <Rating rating={product.rating} />
                  {reviewsList.length > 0 && (
                    <button
                      type="button"
                      onClick={scrollToReviews}
                      className="text-sm font-semibold text-[#c9a873] underline-offset-2 hover:underline whitespace-nowrap"
                    >
                      ({product.reviews} reviews)
                    </button>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  <ScarcityLine />
                </div>
              )}

              {/* Mobile: size badge + stock */}
              <div className="mb-4 -mt-1 flex items-center gap-2 lg:hidden">
                <span className="inline-flex items-center gap-1 bg-[#B6965D]/15 text-[#c9a873] text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#B6965D]/30">
                  {sizeDisplay}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  ✅ In Stock
                </span>
              </div>

              {/* Price box */}
              <div className="mb-6 inline-flex items-baseline gap-x-3 gap-y-1 flex-wrap bg-[#161616] border border-[#B6965D]/20 rounded-2xl px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a867f] mb-0.5">
                    Price
                  </p>
                  <span className="text-3xl lg:text-4xl font-bold text-[#B6965D] tracking-tight">
                    {currencySymbol} {formatPrice(displayPrice)}
                  </span>
                </div>
                {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                  <div className="flex flex-col justify-end">
                    <span className="text-sm lg:text-base text-[#8a867f] line-through">
                      {currencySymbol} {formatPrice(displayOriginalPrice)}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      Save {Math.round((1 - displayPrice / displayOriginalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Gender + Size chips only (price chip removed — duplicated in price box) */}
              {infoChips.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {infoChips.map((chip) => (
                    <div
                      key={chip.key}
                      className="flex items-center gap-2.5 rounded-full bg-[#161616] border border-[#B6965D]/25 px-4 py-2"
                    >
                      <span className="text-lg leading-none">{chip.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a867f]">
                        {chip.key}
                      </span>
                      <span className="text-sm font-bold text-white">{chip.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("description")}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    activeTab === "description"
                      ? "bg-[#B6965D] text-black"
                      : "border border-[#B6965D]/50 text-[#c9a873] hover:bg-[#B6965D]/10"
                  }`}
                >
                  Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    activeTab === "notes"
                      ? "bg-[#B6965D] text-black"
                      : "border border-[#B6965D]/50 text-[#c9a873] hover:bg-[#B6965D]/10"
                  }`}
                >
                  Notes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    activeTab === "details"
                      ? "bg-[#B6965D] text-black"
                      : "border border-[#B6965D]/50 text-[#c9a873] hover:bg-[#B6965D]/10"
                  }`}
                >
                  Details
                </button>
              </div>

              {/* Tab content */}
              {activeTab === "description" && (
                <div className="bg-[#161616] border border-[#B6965D]/20 rounded-2xl p-5 mb-6">
                  <p className={`text-[15px] text-[#b8b3ab] leading-[1.7] ${!expanded ? "line-clamp-3" : ""}`}>
                    {mainDescription}
                  </p>
                  {mainDescription.length > 140 && (
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="mt-2 text-sm font-semibold text-[#c9a873] hover:underline inline-flex items-center gap-1"
                    >
                      {expanded ? "Show less" : "... Show more"}
                    </button>
                  )}
                </div>
              )}

              {activeTab === "notes" && (
                <div className="bg-[#161616] border border-[#B6965D]/20 rounded-2xl p-5 mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a867f] mb-4">
                    {isAttar ? "Attar Notes" : "Fragrance Notes"}
                  </p>
                  {hasNotes ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {noteSections.map(
                        (section) =>
                          section.items.filter((n) => n?.trim()).length > 0 && (
                            <div
                              key={section.title}
                              className="bg-[#0f0f0f] rounded-2xl p-4 border border-[#B6965D]/15"
                            >
                              <div className="flex items-center gap-2 mb-2.5">
                                <section.icon className="h-4 w-4 text-[#B6965D]" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9a873]">
                                  {section.title}
                                </h3>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {section.items
                                  .filter((n) => n?.trim())
                                  .map((note) => (
                                    <span
                                      key={note}
                                      className="rounded-full bg-[#B6965D]/10 border border-[#B6965D]/25 text-[#c9a873] text-xs font-semibold px-3 py-1"
                                    >
                                      {note}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-[#8a867f] italic">
                      Notes information coming soon
                    </p>
                  )}
                </div>
              )}

              {activeTab === "details" && (
                <div className="bg-[#161616] border border-[#B6965D]/20 rounded-2xl p-5 mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a867f] mb-4">
                    Product Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {product.fragranceFamily && (
                      <DetailRow label="Fragrance Family" value={product.fragranceFamily} />
                    )}
                    {product.gender && (
                      <DetailRow label="Gender" value={product.gender} />
                    )}
                    {product.season && (
                      <DetailRow label="Season" value={product.season} />
                    )}
                    {product.bestTime && (
                      <DetailRow label="Best Time" value={product.bestTime} />
                    )}
                    {isAttar ? (
                      <>
                        {product.origin && (
                          <DetailRow label="Sourcing Origin" value={product.origin} />
                        )}
                        {product.applicatorType && (
                          <DetailRow label="Applicator Type" value={product.applicatorType} />
                        )}
                        {product.ingredients && (
                          <div className="col-span-2">
                            <DetailRow label="Ingredients" value={product.ingredients} />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {product.concentration && (
                          <DetailRow label="Concentration" value={product.concentration} />
                        )}
                        {product.bottleStyle && (
                          <DetailRow label="Bottle Type" value={product.bottleStyle} />
                        )}
                        {product.longevity && (
                          <DetailRow label="Longevity" value={product.longevity} />
                        )}
                        {product.sillage && (
                          <DetailRow label="Sillage" value={product.sillage} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Qty stepper + CTAs */}
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9a873]">
                    Qty
                  </span>
                  <div className="flex items-center border border-[#B6965D]/40 rounded-full bg-[#161616] p-1 pr-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Decrease quantity"
                      className="flex items-center justify-center w-11 h-11 rounded-full text-[#c9a873] hover:bg-[#B6965D]/15 hover:text-white transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-white">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex items-center justify-center w-11 h-11 rounded-full text-[#c9a873] hover:bg-[#B6965D]/15 hover:text-white transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full min-h-[56px] rounded-full bg-[#B6965D] hover:bg-[#c9a873] text-black text-base font-bold uppercase tracking-wider px-8 transition-all duration-300 shadow-[0_0_20px_rgba(182,150,93,0.3)] hover:shadow-[0_0_32px_rgba(182,150,93,0.55)]"
                >
                  Add to Cart
                </button>

<a
  href={whatsappLink}
  target="_blank"
  rel="noopener noreferrer"
  className="w-full inline-flex items-center justify-center gap-2 min-h-[52px] rounded-full border-2 border-[#25D366] bg-[#0a0a0a] text-white hover:bg-[#25D366]/10 text-sm font-bold uppercase tracking-wider px-8 transition-colors"
>
  <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
  Order on WhatsApp
</a>
              </div>

              {/* Trust strip (desktop) */}
              <div className="hidden lg:flex items-center justify-center gap-6 flex-wrap text-xs text-[#8a867f] mb-6 bg-[#161616] border border-[#B6965D]/20 rounded-2xl p-3.5">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#B6965D]" /> 100% Original
                </span>
                <span className="flex items-center gap-1.5">💵 Cash on Delivery</span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#B6965D]" /> Free Shipping{" "}
                  {freeShippingThreshold ? `over ${currencySymbol} ${formatPrice(freeShippingThreshold)}` : "Nationwide"}
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
          <section id="reviews" className="scroll-mt-56 py-10 lg:py-16 bg-[#0a0a0a] border-t border-[#B6965D]/15">
            <div className="container-custom">
              <div className="max-w-3xl mx-auto text-center mb-8 lg:mb-12">
                <h2 className="font-heading text-2xl lg:text-3xl text-[#f5f1e8] mb-4">
                  Customer Reviews
                </h2>
                <p className="text-6xl lg:text-7xl font-bold text-[#B6965D]">{product.rating}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Rating rating={product.rating} reviews={product.reviews} size="sm" color="gold" />
                </div>
                <p className="text-[#8a867f] mt-2 text-sm">
                  Based on {product.reviews} {product.reviews === 1 ? "review" : "reviews"}
                </p>
              </div>
              {reviewsList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {reviewsList.map((review) => (
                    <div
                      key={review.id}
                      className="bg-[#161616] border border-[#B6965D]/20 rounded-2xl p-5 lg:p-6"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[#B6965D]/15 text-[#c9a873] flex items-center justify-center font-heading font-bold shrink-0">
                            {(review.customerName || "S").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{review.customerName}</p>
                            <p className="text-[#8a867f] text-xs">{formatDate(review.date)}</p>
                          </div>
                        </div>
                        <Rating rating={review.rating} size="sm" color="gold" />
                      </div>
                      <p className="text-[#b8b3ab] text-sm leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#8a867f] text-sm">No written reviews yet.</p>
              )}
            </div>
          </section>
        )}

        {/* Related products */}
        <section className="py-10 lg:py-16 bg-[#0e0e0e] border-t border-[#B6965D]/15 scroll-mt-56">
          <div className="container-custom">
            <h2 className="font-heading text-2xl lg:text-3xl text-[#f5f1e8] text-center mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((relProduct) => (
                <ShopProductCard
                  key={relProduct.id}
                  id={String(relProduct.id)}
                  name={relProduct.name}
                  slug={relProduct.slug}
                  price={relProduct.price}
                  originalPrice={relProduct.originalPrice}
                  image={relProduct.image}
                  images={relProduct.images}
                  size={relProduct.size}
                  rating={relProduct.rating}
                  reviewCount={relProduct.reviewCount}
                  currency={relProduct.currency || "PKR"}
                  variant="dark"
                />
              ))}
              {Array.from({ length: Math.max(0, 4 - relatedProducts.length) }).map((_, i) => (
                <div key={`skeleton-${i}`} className="space-y-3 rounded-xl border border-[#B6965D]/15 bg-[#161616] p-2">
                  <div className="aspect-[3/4] w-full rounded-lg bg-white/5 animate-pulse" />
                  <div className="h-4 w-24 bg-white/5 animate-pulse rounded" />
                  <div className="h-6 w-32 bg-white/5 animate-pulse rounded" />
                  <div className="h-5 w-20 bg-white/5 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-black border-t border-[#B6965D]/20 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9a873]">
              Total
            </p>
            <p className="text-lg font-bold text-white leading-tight">
              {currencySymbol} {formatPrice(displayPrice)}
            </p>
            {displayOriginalPrice && displayOriginalPrice > displayPrice && (
              <p className="text-[11px] text-white/40 line-through">
                {currencySymbol} {formatPrice(displayOriginalPrice)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-[#B6965D]/40 rounded-full h-12 px-1 bg-[#0f0f0f]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="flex items-center justify-center rounded-full text-white/70 hover:text-[#c9a873] transition-colors w-11 h-11"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-7 text-center text-sm font-semibold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
                className="flex items-center justify-center rounded-full text-white/70 hover:text-[#c9a873] transition-colors w-11 h-11"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="rounded-full bg-[#B6965D] hover:bg-[#c9a873] text-black text-sm font-bold uppercase tracking-wider px-5 h-12 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}