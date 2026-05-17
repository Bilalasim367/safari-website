"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Heart } from "lucide-react";
import { Rating } from "@/components/Rating";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: { name: string; slug: string };
  categorySlug?: string;
  size: string;
  fragranceFamily: string;
  rating: number;
  reviews: number;
  description: string;
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
  price3mlPhysical?: number;
  price6mlPhysical?: number;
  price12mlPhysical?: number;
  price50mlPhysical?: number;
  price3mlOnline?: number;
  price6mlOnline?: number;
  price12mlOnline?: number;
  price50mlOnline?: number;
  currency?: string;
  longDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  stockStatus?: string;
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

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("50ml");
  const [channel, setChannel] = useState<"physical" | "online">("physical");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, productsRes] = await Promise.all([
          fetch(`/api/products?slug=${params.slug}`),
          fetch("/api/products"),
        ]);

        const productData = await productRes.json();
        const productsData = await productsRes.json();

        const product = productData.products?.[0] || productData;
        const allProducts = productsData.products || [];

        setProduct(product);
        setAllProducts(Array.isArray(allProducts) ? allProducts : []);

        if (product?.sizesAvailable) {
          const sizes = product.sizesAvailable.split(',').map((s: string) => s.trim());
          if (sizes.length > 0) setSelectedSize(sizes[0]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    if (params.slug) {
      fetchData();
    }
  }, [params.slug]);

  useEffect(() => {
    if (product?.metaTitle) {
      document.title = product.metaTitle;
    } else if (product?.name) {
      document.title = `${product.name} | SAFARI Luxury Fragrances`;
    }
    if (product?.metaDescription) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', product.metaDescription);
    }
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
      .slice(0, 4);
  }, [product, allProducts]);

  const csvSizes = useMemo(() => {
    if (!product?.sizesAvailable) return [];
    return product.sizesAvailable.split(',').map((s: string) => s.trim()).filter(Boolean);
  }, [product?.sizesAvailable]);

  const priceData = useMemo(() => {
    if (!product?.sizePrices) return null;
    return product.sizePrices.find((s) => s.size === selectedSize) || null;
  }, [selectedSize, product?.sizePrices]);

  const csvPriceData = useMemo(() => {
    if (!product) return null;
    const sizeNum = selectedSize.replace('ml', '');
    const physicalKey = `price${sizeNum}mlPhysical` as keyof Product;
    const onlineKey = `price${sizeNum}mlOnline` as keyof Product;
    const physicalPrice = product[physicalKey] as number | undefined;
    const onlinePrice = product[onlineKey] as number | undefined;
    return {
      physical: physicalPrice ?? null,
      online: onlinePrice ?? null,
    };
  }, [product, selectedSize]);

  const displayCsvPrice = channel === 'physical' ? csvPriceData?.physical : csvPriceData?.online;
  const displayPrice = displayCsvPrice ?? priceData?.price ?? product?.price ?? 0;
  const displayOriginalPrice = priceData?.originalPrice ?? product?.originalPrice;
  const currencySymbol = product?.currency || 'PKR';

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: displayCsvPrice ?? product.price,
        image: product.image,
        size: selectedSize,
        quantity,
      });
      toast.success(`${product.name} added to cart!`);
    }
  };

  if (loading) {
    return (
      <div className="pt-24">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="aspect-[3/4] bg-muted" />
              <div>
                <div className="h-4 bg-muted w-20 mb-6" />
                <div className="h-12 bg-muted w-3/4 mb-4" />
                <div className="h-8 bg-muted w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-24 text-center">
        <div className="container-custom">
          <h1 className="text-4xl font-serif text-black mb-4">Product Not Found</h1>
          <p className="text-gray-500 mb-8">The product you're looking for doesn't exist.</p>
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

  return (
    <>
      <div className="pt-20">
        <div className="border-b border-border">
          <div className="max-w-[1280px] mx-auto px-6 py-3">
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
          <div className="max-w-[1280px] mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              <div className="space-y-4">
                <div className="relative bg-muted overflow-hidden rounded-lg border border-border" style={{ minHeight: '400px' }}>
                  {productImages[selectedImage] ? (
                    <img
                      src={productImages[selectedImage]}
                      alt={product.name}
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
                  <Badge variant="secondary" className="text-xs tracking-widest uppercase">{product.category?.name}</Badge>
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

                <div className="flex items-center gap-1 mb-6">
                  <Rating rating={product.rating} reviews={product.reviews} />
                </div>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-foreground tracking-tight">
                    {currencySymbol} {displayPrice.toLocaleString()}
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

                {(csvSizes.length > 0 || product.description) && (
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {csvSizes.length > 0 && displayCsvPrice === null ? (
                      <span>From {currencySymbol} {Math.min(
                        ...([product.price3mlPhysical, product.price6mlPhysical, product.price12mlPhysical, product.price50mlPhysical]
                          .filter((p): p is number => p !== null))
                      ).toLocaleString()}</span>
                    ) : (
                      product.description
                    )}
                  </p>
                )}

                <div className="mb-6">
                  <label className="text-xs tracking-[0.2em] uppercase font-semibold text-foreground mb-3 block">Select Size</label>
                  <div className="flex gap-2 flex-wrap">
                    {(csvSizes.length > 0 ? csvSizes : ["30ml", "50ml", "100ml"]).map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        className="rounded-none min-w-[70px]"
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {csvPriceData && (csvPriceData.physical !== null || csvPriceData.online !== null) && (
                  <div className="mb-6">
                    <label className="text-xs tracking-[0.2em] uppercase font-semibold text-foreground mb-3 block">Channel</label>
                    <div className="flex gap-2">
                      {csvPriceData.physical !== null && (
                        <Button
                          variant={channel === "physical" ? "default" : "outline"}
                          size="sm"
                          className="rounded-none"
                          onClick={() => setChannel("physical")}
                        >
                          Physical Store — {currencySymbol} {csvPriceData.physical.toLocaleString()}
                        </Button>
                      )}
                      {csvPriceData.online !== null && (
                        <Button
                          variant={channel === "online" ? "default" : "outline"}
                          size="sm"
                          className="rounded-none"
                          onClick={() => setChannel("online")}
                        >
                          Online — {currencySymbol} {csvPriceData.online.toLocaleString()}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 items-center mb-8">
                  <div className="flex items-center border border-border rounded-none w-fit">
                    <Button variant="ghost" size="icon" className="rounded-none" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-base font-medium">{quantity}</span>
                    <Button variant="ghost" size="icon" className="rounded-none" onClick={() => setQuantity(quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={handleAddToCart} className="flex-1 rounded-none bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold uppercase tracking-wider py-4 px-8">
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-none flex-shrink-0" aria-label="Add to wishlist">
                    <Heart className="h-4 w-4" />
                  </Button>
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
                  <AccordionItem value="description">
                    <AccordionTrigger className="text-xs tracking-[0.2em] uppercase font-semibold py-5">Description</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {product.longDescription
                        ? renderLongDescription(product.longDescription)
                        : product.description}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="notes">
                    <AccordionTrigger className="text-xs tracking-[0.2em] uppercase font-semibold py-5">Fragrance Notes</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Top Notes</h4>
                          <p className="text-muted-foreground">{product.notesTop?.join(" • ") || "N/A"}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Heart Notes</h4>
                          <p className="text-muted-foreground">{product.notesHeart?.join(" • ") || "N/A"}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Base Notes</h4>
                          <p className="text-muted-foreground">{product.notesBase?.join(" • ") || "N/A"}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="shipping">
                    <AccordionTrigger className="text-xs tracking-[0.2em] uppercase font-semibold py-5">Shipping & Returns</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      Free shipping on orders over $100. Standard delivery 3-5 business days. Easy returns within 30 days of purchase.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        <section className="py-16 lg:py-24 mt-24 mb-16 bg-muted">
          <div className="max-w-[1280px] mx-auto px-6">
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
                  category={relProduct.category?.name || "Unisex"}
                  isNew={relProduct.isNew}
                  isBestseller={relProduct.isBestseller}
                  size={relProduct.size}
                  rating={relProduct.rating}
                  reviewCount={relProduct.reviews}
                  gender={relProduct.gender}
                  season={relProduct.season}
                  impressionOf={relProduct.impressionOf}
                  currency={relProduct.currency}
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
    </>
  );
}
