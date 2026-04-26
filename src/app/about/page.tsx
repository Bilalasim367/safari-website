"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="pt-20">
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1920&h=800&fit=crop"
            alt="About Safari"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-semibold text-white mb-4">Our Story</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto px-4">
            Crafting luxury fragrances since 2015
          </p>
        </div>
      </section>

      <section className="section-spacing bg-[#0D0D0D]">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#C9A962] uppercase tracking-wider text-sm mb-4">The Beginning</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
                A Journey of Scent & Sophistication
              </h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>
                  Safari was born from a simple belief: that everyone deserves to experience the transformative power of exceptional fragrance. Founded in 2015 by a team of passionate perfumers and luxury enthusiasts, we set out to create scents that transcend the ordinary.
                </p>
                <p>
                  Our name reflects our spirit of adventure and discovery. Much like the African savanna evokes images of exploration and wonder, our fragrances invite you on a sensory journey across distant lands and exotic locales.
                </p>
                <p>
                  Each Safari fragrance is a passport to new experiences, crafted with rare ingredients sourced from the most prestigious suppliers around the world.
                </p>
              </div>
            </div>
            <div className="relative aspect-square">
              <Image
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=800&fit=crop"
                alt="Safari craftsmanship"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-[#1A1A1A]">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Our Values</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C9A962]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#C9A962]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Excellence</h3>
              <p className="text-white/60 leading-relaxed">
                We never compromise on quality. Every ingredient is carefully selected, every note meticulously balanced to create fragrances that exceed expectations.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C9A962]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#C9A962]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Sustainability</h3>
              <p className="text-white/60 leading-relaxed">
                We are committed to ethical sourcing and sustainable practices. Our packaging is eco-friendly, and we work with suppliers who share our commitment to the planet.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C9A962]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#C9A962]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Passion</h3>
              <p className="text-white/60 leading-relaxed">
                Every fragrance we create is a labor of love. Our team of master perfumers brings decades of experience and an unwavering dedication to the art of perfumery.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-[#0D0D0D]">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video lg:order-2">
              <Image
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop"
                alt="Our perfumery"
                fill
                className="object-cover"
              />
            </div>
            <div className="lg:order-1">
              <p className="text-[#C9A962] uppercase tracking-wider text-sm mb-4">Our Process</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
                The Art of Creation
              </h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>
                  Creating a Safari fragrance is a meticulous process that can take years. From initial concept to final formulation, each step is guided by our commitment to excellence.
                </p>
                <p>
                  Our perfumers travel the world to source rare and precious ingredients—Bulgarian roses, Indian sandalwood, Middle Eastern oud—each bringing its own unique character to our compositions.
                </p>
                <p>
                  Through careful blending and aging, these ingredients transform into scents that tell stories, evoke emotions, and create lasting memories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#1A1A1A]">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">Experience Safari</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-8">
            Visit our flagship stores or explore our collection online to discover your perfect fragrance.
          </p>
          <Link href="/shop" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}