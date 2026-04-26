"use client";

import React from "react";
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
  rating?: number;
  reviews?: number;
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
  size?: string;
}

export default function ProductCard({ id, name, slug, price, originalPrice, image, category, isNew, isBestseller, size }: ProductCardProps) {
  const { addItem } = useCart();
  const hasValidImage = image && image.trim() !== '';

  const handleQuickAdd = (e: React.MouseEvent) => {
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
  };

  return (
    <Link href={`/shop/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-5">
        {hasValidImage ? (
          <Image src={image} alt={name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-lg">[Image]</span>
          </div>
        )}
        
        {/* Badges */}
        {(isNew || isBestseller) && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {isNew && (
              <span className="bg-black text-white text-[10px] font-bold tracking-[0.15em] px-2.5 py-1">NEW</span>
            )}
            {isBestseller && (
              <span className="bg-white text-black text-[10px] font-bold tracking-[0.15em] px-2.5 py-1">BESTSELLER</span>
            )}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        
        {/* Quick Add Button */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleQuickAdd}
            aria-label={`Add ${name} to cart`}
            className="w-full bg-black text-white text-xs font-semibold uppercase tracking-[0.2em] py-4 hover:bg-gray-900 transition-colors"
          >
            Quick Add +
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.25em] mb-2">{category}</p>
        <h3 className="text-base font-medium text-black mb-2 group-hover:opacity-60 transition-opacity">{name}</h3>
        {size && (
          <p className="text-xs text-gray-500 mb-2">{size}</p>
        )}
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg font-semibold text-black">${price}</span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through decoration-gray-300">${originalPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
}