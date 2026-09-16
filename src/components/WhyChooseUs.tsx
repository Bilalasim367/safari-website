"use client"

import React from "react"
import { BadgeCheck, Banknote, Truck, RotateCcw } from "lucide-react"

const features = [
  { icon: BadgeCheck, title: "100% Original", desc: "Authentic designer-inspired blends" },
  { icon: Banknote, title: "Cash on Delivery", desc: "Pay only when you receive" },
  { icon: Truck, title: "Free Delivery", desc: "On orders across Pakistan" },
  { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free exchange within 7 days" },
]

export default function WhyChooseUs() {
  return (
    <section className="why-us-section px-4 md:px-12 py-8 md:py-14" aria-label="Why choose us">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-2 gap-y-8 gap-x-4 md:grid-cols-4 md:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex min-h-[112px] flex-col items-center justify-center gap-2 text-center md:min-h-0"
            >
              <span className="why-us-icon">
                <f.icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.5} />
              </span>
              <span className="text-sm font-semibold text-white md:text-base">{f.title}</span>
              <span className="max-w-[190px] text-xs leading-snug text-white/55 md:text-[13px]">
                {f.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}