"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: { name: string; slug: string };
  categoryId?: string;
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
}

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("50ml");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, productsRes] = await Promise.all([
          fetch(`/api/products?slug=${params.slug}`),
          fetch("/api/products"),
        ]);
        
        const productData = await productRes.json();
        const productsData = await productsRes.json();
        
        // Handle API response format - products API returns { products: [...], total: ... }
        const product = productData.products?.[0] || productData;
        const allProducts = productsData.products || [];
        
        setProduct(product);
        setAllProducts(Array.isArray(allProducts) ? allProducts : []);
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

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
      .slice(0, 4);
  }, [product, allProducts]);

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: Number(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        quantity,
      });
    }
  };

  if (loading) {
    return (
      <div className="pt-24">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="aspect-[3/4] bg-gray-200" />
              <div>
                <div className="h-4 bg-gray-200 w-20 mb-6" />
                <div className="h-12 bg-gray-200 w-3/4 mb-4" />
                <div className="h-8 bg-gray-200 w-32" />
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

  const productImages = product.images?.filter((img: string) => img && img.trim() !== '')?.length > 0 
    ? product.images.filter((img: string) => img && img.trim() !== '') 
    : (product.image && product.image.trim() !== '' ? [product.image] : []);

  return (
    <div className="pt-20">
      {/* Breadcrumb */}
      <div className="bg-black py-4">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="bg-white">
        <div className="container-custom py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                {productImages[selectedImage] ? (
                  <Image
                    src={productImages[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-lg">[Product Image]</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-24 flex-shrink-0 overflow-hidden transition-all ${
                      selectedImage === index ? "ring-2 ring-black" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} - View ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="lg:py-4">
              {/* Category Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold tracking-[0.2em] text-black uppercase">{product.category?.name}</span>
                {product.fragranceFamily && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500 tracking-wider">{product.fragranceFamily}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-serif text-black mb-6">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-black" : "text-gray-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.reviews || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl font-semibold text-black">${product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
                    <span className="bg-black text-white text-xs font-bold px-2 py-1">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-10">{product.description}</p>

              {/* Size Selection */}
              <div className="mb-8">
                <label className="text-xs font-bold uppercase tracking-wider text-black block mb-4">Select Size</label>
                <div className="flex gap-3">
                  {["30ml", "50ml", "100ml"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[80px] px-5 py-3 border text-sm transition-all ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-600 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="flex items-center border border-black w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-black hover:bg-gray-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-14 text-center text-black font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-black hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button onClick={handleAddToCart} className="flex-1 bg-black text-white text-sm font-semibold uppercase tracking-wider py-4 px-8 hover:bg-gray-800 transition-colors">
                  Add to Cart
                </button>
              </div>

              {/* Accordion Tabs */}
              <div className="border-t border-gray-200">
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab(activeTab === "description" ? "" : "description")}
                    className="w-full flex items-center justify-between py-5 text-black text-sm font-medium uppercase tracking-wider"
                  >
                    Description
                    <span className={`transition-transform ${activeTab === "description" ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  {activeTab === "description" && (
                    <div className="pb-6 text-gray-600 leading-relaxed">{product.description}</div>
                  )}
                </div>

                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab(activeTab === "notes" ? "" : "notes")}
                    className="w-full flex items-center justify-between py-5 text-black text-sm font-medium uppercase tracking-wider"
                  >
                    Fragrance Notes
                    <span className={`transition-transform ${activeTab === "notes" ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  {activeTab === "notes" && (
                    <div className="pb-6 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2">Top Notes</h4>
                        <p className="text-gray-600">{product.notesTop?.join(" • ") || "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2">Heart Notes</h4>
                        <p className="text-gray-600">{product.notesHeart?.join(" • ") || "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2">Base Notes</h4>
                        <p className="text-gray-600">{product.notesBase?.join(" • ") || "N/A"}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setActiveTab(activeTab === "shipping" ? "" : "shipping")}
                    className="w-full flex items-center justify-between py-5 text-black text-sm font-medium uppercase tracking-wider"
                  >
                    Shipping & Returns
                    <span className={`transition-transform ${activeTab === "shipping" ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  {activeTab === "shipping" && (
                    <div className="pb-6 text-gray-600 leading-relaxed">
                      Free shipping on orders over $100. Standard delivery 3-5 business days. Easy returns within 30 days of purchase.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-white py-16 lg:py-24" style={{ backgroundColor: '#F5F5F0' }}>
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-serif text-black mb-10 text-center">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  id={relProduct.id}
                  name={relProduct.name}
                  slug={relProduct.slug}
                  price={relProduct.price}
                  image={relProduct.image}
                  category={relProduct.category?.name || "Unisex"}
                  isNew={relProduct.isNew}
                  isBestseller={relProduct.isBestseller}
                  size={relProduct.size}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}