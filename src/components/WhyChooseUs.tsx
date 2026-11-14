"use client"

import React from "react"
import {
  BadgeCheck,
  Banknote,
  Headphones,
  Package,
  RotateCcw,
  Shield,
  Sparkles,
  Truck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { DEFAULT_WHY_US, type WhyUsConfig } from "@/lib/homepage-content"

const ICONS: Record<string, LucideIcon> = {
  "badge-check": BadgeCheck,
  banknote: Banknote,
  truck: Truck,
  "rotate-ccw": RotateCcw,
  shield: Shield,
  sparkles: Sparkles,
  headphones: Headphones,
  package: Package,
}

interface WhyChooseUsProps {
  content?: WhyUsConfig
}

export default function WhyChooseUs({ content = DEFAULT_WHY_US }: WhyChooseUsProps) {
  const features = content.features?.length ? content.features : DEFAULT_WHY_US.features

  return (
    <section className="why-us-section px-4 md:px-12 py-8 md:py-14" aria-label="Why choose us">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-2 gap-y-8 gap-x-4 md:grid-cols-4 md:gap-6">
          {features.map((f) => {
            const Icon = ICONS[f.icon] ?? BadgeCheck
            return (
              <div
                key={f.title}
                className="flex min-h-[112px] flex-col items-center justify-center gap-2 text-center md:min-h-0"
              >
                <span className="why-us-icon">
                  <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.5} />
                </span>
                <span className="text-sm font-semibold text-white md:text-base">{f.title}</span>
                <span className="max-w-[190px] text-xs leading-snug text-white/55 md:text-[13px]">
                  {f.desc}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
