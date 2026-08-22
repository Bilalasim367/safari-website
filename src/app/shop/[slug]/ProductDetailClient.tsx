"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Heart, Shield, RotateCcw, Lock, Truck } from "lucide-react";
import { Rating } from "@/components/Rating";
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
  originalPrice?: number;
  image: string;
  images: string[];
  category: { name: string; slug: string } | null;
  categorySlug?: string;
  size: string;
  fragranceFamily: string;
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
  sizePrices?: { size: string; price: number; originalPrice?: number }[];
  gender?: string;
  season?: string;
  impressionOf?: string;
  tags?: string;
  sizesAvailable?: string;
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
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: RelatedProduct[];
  freeShippingThreshold: number | null;
}

function renderLongDescription(text: string): React.ReactNode[] {
  return text.split('\n\n').map((paragraph, i) => {
    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
    const elements = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return <p key={i} className="mb-3 last:mb-0">{elements}</p>;
  });
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  freeShippingThreshold,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize] = useState(() =>
    product?.type === 'Attar' ? '12ml' : product?.type === 'Perfume' ? '50ml' : ''
  );

  const isPerfume = product?.type === 'Perfume';
  const isAttar = product?.type === 'Attar';

  const router = useRouter();

  // Use base price/originalPrice directly - no size-specific pricing
  const displayPrice = product?.price ?? 0;
  const displayOriginalPrice = product?.originalPrice;
  const currencySymbol = product?.currency || 'PKR';

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        quantity,
      });
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        quantity,
      });
      router.push('/checkout');
    }
  };

  if (!product) {
    return (
      <div className="pt-32 pb-24 text-center">
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

  const mainImage = product.image?.trim() || '';
  const galleryImages = Array.isArray(product.images)
    ? product.images.filter((img: string) => img?.trim())
    : [];
  const productImages = mainImage
    ? [mainImage, ...galleryImages.filter(img => img !== mainImage)]
    : galleryImages.length > 0 ? galleryImages : [];

  const tagList = product.tags ? product.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

  const hasRealReviews = product.reviewCount > 0 && product.rating > 0;

  return (
    <>
      <div className="pt-16 md:pt-20 pb-16 lg:pb-0">
        <div className="border-b border-border">
          <div className="container-custom py-3">
            <Breadcrumb>
              <BreadcrumbList className="text-xs text-muted-foreground">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground">{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div>
          <div className="container-custom py-8 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 lg:gap-24">
              <div className="space-y-4">
                <div className="relative bg-muted overflow-hidden rounded-lg border border-border min-h-[400px] lg:min-h-[650px]">
                  {productImages[selectedImage] ? (
                    <img
                      src={productImages[selectedImage]}
                      alt={`${product.name} perfume bottle - Safari Perfumes Pakistan`}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center absolute inset-0">
                      <span className="text-muted-foreground text-lg">[Product Image]</span>
                    </div>
                  )}
                </div>
                {(() => {
                  const thumbnails = productImages.map((img: string, index: number) => (
                    <button
                      key={index}
                      className={`relative w-20 h-24 shrink-0 overflow-hidden rounded-md cursor-pointer transition-all ${
                        selectedImage === index
                          ? "ring-2 ring-primary ring-offset-1"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={img} alt={`${product.name} - View ${index + 1}`} className="w-full h-full object-cover absolute inset-0" />
                    </button>
                  ));
                  return productImages.length > 4 ? (
                    <ScrollArea className="w-full">
                      <div className="flex gap-3 pb-2">{thumbnails}</div>
                    </ScrollArea>
                  ) : (
                    <div className="flex gap-3 pb-2">{thumbnails}</div>
                  );
                })()}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  {product.category?.name && (
                    <Badge variant="secondary" className="text-xs tracking-widest uppercase">{product.category.name}</Badge>
                  )}
                  {product.gender && (
                    <Badge variant="outline" className="text-xs">{product.gender}</Badge>
                  )}
                  {product.season && (
                    <Badge variant="secondary" className="text-xs">{product.season}</Badge>
                  )}
                  {product.fragranceFamily && (
                    <Badge variant="outline" className="text-xs tracking-widest uppercase">{product.fragranceFamily}</Badge>
                  )}
                </div>

                <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">{product.name}</h1>

                {product.impressionOf && (
                  <p className="text-sm text-muted-foreground italic mb-4">
                    Impression of {product.impressionOf}
                  </p>
                )}

                {hasRealReviews && (
                  <div className="flex items-center gap-1 mb-6">
                    <Rating rating={product.rating} reviews={product.reviews} />
                  </div>
                )}

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-6">
                  <span className="text-4xl font-bold text-foreground tracking-tight">
                    {currencySymbol} {displayPrice.toLocaleString()}
                  </span>
                  {/* Static size label */}
                  <span className="text-lg text-muted-foreground">
                    {isAttar ? '12ml' : '50ml'}
                  </span>
                  {displayOriginalPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through ml-3">
                        {currencySymbol} {displayOriginalPrice.toLocaleString()}
                      </span>
                      <Badge variant="secondary">
                        Save {Math.round((1 - displayPrice / displayOriginalPrice) * 100)}%
                      </Badge>
                    </>
                  )}
                </div>

                {(product.description || product.shortDescription) && (
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {product.shortDescription ? (
                      product.shortDescription
                    ) : (
                      product.description
                    )}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-8">
                  <div className="flex items-center justify-center sm:justify-start border border-border rounded-none w-full sm:w-fit">
                    <Button variant="ghost" size="icon" className="rounded-none" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-base font-medium">{quantity}</span>
                    <Button variant="ghost" size="icon" className="rounded-none" onClick={() => setQuantity(quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={handleAddToCart} className="w-full sm:flex-1 rounded-none bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold uppercase tracking-wider py-4 px-8">
                    Add to Cart
                  </Button>
                  <Button onClick={handleBuyNow} className="w-full sm:flex-1 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold uppercase tracking-wider py-4 px-8">
                    Buy Now
                  </Button>
                  <Button variant="outline" size="icon" className="hidden sm:flex rounded-none flex-shrink-0" aria-label="Add to wishlist">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                {/* Trust Badges Row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 mb-8 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>100% Authentic</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" />
                    <span>Free Returns 30 Days</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    <span>Fast Delivery</span>
                  </div>
                </div>

                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tagList.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/shop?category=${tag}`}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}

                <Separator className="my-8" />
                <Accordion type="multiple" defaultValue={["description"]}>
                  {product.notesTop?.length > 0 || product.notesHeart?.length > 0 || product.notesBase?.length > 0 ? (
                    <AccordionItem value="notes">
                      <AccordionTrigger className="text-xs tracking-[0.2em] uppercase font-semibold py-5">Fragrance Notes</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {product.notesTop?.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Top Notes</h4>
                              <p className="text-muted-foreground">{product.notesTop.join(" • ")}</p>
                            </div>
                          )}
                          {product.notesHeart?.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Heart Notes</h4>
                              <p className="text-muted-foreground">{product.notesHeart.join(" • ")}</p>
                            </div>
                          )}
                          {product.notesBase?.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Base Notes</h4>
                              <p className="text-muted-foreground">{product.notesBase.join(" • ")}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : null}

                  <AccordionItem value="description">
                    <AccordionTrigger className="text-xs tracking-[0.2em] uppercase font-semibold py-5">Description</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {product.shortDescription && (
                        <p className="mb-4 font-medium text-foreground">{product.shortDescription}</p>
                      )}
                      {product.longDescription
                        ? renderLongDescription(product.longDescription)
                        : product.description}
                    </AccordionContent>
                  </AccordionItem>

                  {isPerfume && (product.concentration || product.bottleStyle || product.longevity || product.sillage) ? (
                    <AccordionItem value="perfume-details">
                      <AccordionTrigger className="text-xs tracking-[0.2em] uppercase font-semibold py-5">Perfume Details</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {product.concentration && (
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                              <span className="text-sm text-muted-foreground">Concentration</span>
                              <span className="text-sm font-medium text-foreground">{product.concentration}</span>
                            </div>
                          )}
                          {product.bottleStyle && (
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                              <span className="text-sm text-muted-foreground">Bottle Type</span>
                              <span className="text-sm font-medium text-foreground text-capitalize">{product.bottleStyle}</span>
                            </div>
                          )}
                          {product.longevity && (
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                              <span className="text-sm text-muted-foreground">Longevity</span>
                              <span className="text-sm font-medium text-foreground">{product.longevity}</span>
                            </div>
                          )}
                          {product.sillage && (
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                              <span className="text-sm text-muted-foreground">Sillage</span>
                              <span className="text-sm font-medium text-foreground">{product.sillage}</span>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : null}

                  {isAttar && (product.applicatorType || product.origin || product.ingredients) ? (
                    <AccordionItem value="attar-profile">
                      <AccordionTrigger className="text-xs tracking-[0.2em] uppercase font-semibold py-5">Fragrance Profile</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {product.origin && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Sourcing Origin</h4>
                              <p className="text-muted-foreground">{product.origin}</p>
                            </div>
                          )}
                          {product.applicatorType && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Applicator Type</h4>
                              <p className="text-muted-foreground text-capitalize">{product.applicatorType.replace('-', ' ')}</p>
                            </div>
                          )}
                          {product.ingredients && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Ingredients</h4>
                              <p className="text-muted-foreground">{product.ingredients}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : null}

                  <AccordionItem value="shipping">
                    <AccordionTrigger className="text-xs tracking-[0.2em] uppercase font-semibold py-5">Shipping & Returns</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {freeShippingThreshold ? `Free shipping on orders over PKR ${freeShippingThreshold.toLocaleString()}. ` : ''}Standard delivery 3-5 business days. Easy returns within 30 days of purchase.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        {hasRealReviews && (
          <section className="py-10 lg:py-16 mt-12 lg:mt-16 bg-background border-y border-border">
            <div className="container-custom">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">Customer Reviews</h2>
                  <p className="text-muted-foreground">What our customers are saying</p>
                </div>

                <div className="bg-muted/50 rounded-xl p-6 md:p-8 mb-10">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mb-8">
                    <div className="text-center">
                      <p className="text-6xl md:text-7xl font-bold text-foreground">{product.rating}</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Rating rating={product.rating} reviews={product.reviews} size="sm" />
                      </div>
                      <p className="text-muted-foreground mt-2">
                        Based on {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-10 lg:py-24 mt-12 lg:mt-24 mb-10 lg:mb-16 bg-muted">
          <div className="container-custom">
            <h2 className="font-heading text-3xl md:text-4xl text-center mb-12">You May Also Like</h2>
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
                  size={relProduct.size}
                  rating={relProduct.rating}
                  reviewCount={relProduct.reviewCount}
                  gender={relProduct.gender}
                  season={relProduct.season}
                  impressionOf={relProduct.impressionOf}
                  currency={relProduct.currency || 'PKR'}
                />
              ))}
              {Array.from({ length: Math.max(0, 4 - relatedProducts.length) }).map((_, i) => (
                <div key={`skeleton-${i}`} className="space-y-4">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile sticky Add-to-Cart bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t border-border px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-shrink-0">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-foreground">{currencySymbol} {displayPrice.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-input rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-foreground">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              onClick={handleBuyNow}
              className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold uppercase tracking-wider px-6 h-9"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}