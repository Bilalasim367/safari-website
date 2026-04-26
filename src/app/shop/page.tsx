import React from 'react';
import Link from 'next/link';
import ShopContent from './ShopContent';

export const metadata = {
  title: 'Shop All | SAFARI Luxury Fragrances',
  description: 'Discover our complete collection of luxury fragrances. Shop perfumes for men, women, and unisex. Premium scents crafted with rare ingredients.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  
  return (
    <div className="pt-20">
      <div className="bg-white border-b border-gray-200 py-16 md:py-20">
        <div className="container-custom">
          <div className="max-w-2xl">
            <p className="text-gray-500 text-sm tracking-[0.3em] uppercase mb-4">Collection</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-black mb-6">Shop All</h1>
            <p className="text-gray-600 text-lg max-w-md">
              Discover our complete collection of luxury fragrances, crafted to elevate your senses.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-8">
            <Link href="/" className="text-gray-500 hover:text-black transition-colors text-sm">Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-black text-sm">Shop</span>
          </div>
        </div>
      </div>
      <ShopContent searchParams={params} />
    </div>
  );
}