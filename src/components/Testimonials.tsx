"use client";

import React from "react";
import { testimonials } from "@/data/products";

export default function Testimonials() {
  return (
    <section className="section-spacing bg-[#fafafa]">
      <div className="container-custom">
        <div className="text-center mb-16">
          <p className="text-[#d4c4a8] uppercase tracking-widest text-xs mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-light text-[#1a1a1a]">What Our Clients Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-white p-10 shadow-sm fade-in opacity-0"
              style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'forwards' }}
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#d4c4a8]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[#666] mb-8 leading-relaxed font-light">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full overflow-hidden bg-[#f5f5f5] flex items-center justify-center">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium text-gray-400">{testimonial.name.charAt(0)}</span>
                    )}
                  </div>
                <div>
                  <h4 className="text-[#1a1a1a] font-light">{testimonial.name}</h4>
                  <p className="text-[#999] text-sm">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}