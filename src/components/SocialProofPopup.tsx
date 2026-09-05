'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

interface PopupSettings {
  enabled: boolean
  whatsappNumber: string
  names: string[]
  cities: string[]
}

interface PopupProduct {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
  currency?: string | null
}

interface PopupFrame {
  product: PopupProduct
  name: string
  city: string
  minutesAgo: number
}

const DEFAULT_NAMES = [
  'Ahmed', 'Bilal', 'Usman', 'Fatima', 'Ayesha', 'Zainab',
  'Hamza', 'Ali', 'Hassan', 'Umar', 'Sana', 'Maryam', 'Junaid', 'Kashif',
]
const DEFAULT_CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan',
  'Peshawar', 'Sialkot', 'Rawalpindi', 'Quetta', 'Gujranwala',
]

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export default function SocialProofPopup() {
  const [settings, setSettings] = useState<PopupSettings | null>(null)
  const [products, setProducts] = useState<PopupProduct[]>([])
  const [frame, setFrame] = useState<PopupFrame | null>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch('/api/popup-settings'),
          fetch('/api/products?limit=12&includeOutOfStock=true'),
        ])
        if (cancelled) return
        const s = sRes.ok ? await sRes.json() : null
        const p = pRes.ok ? await pRes.json() : null
        const list = Array.isArray(p) ? p : p?.products
        if (s) setSettings(s)
        if (Array.isArray(list) && list.length) {
          setProducts(
            list
              .filter((pr) => pr?.name && pr?.slug)
              .map((pr) => ({
                id: pr.id,
                name: pr.name,
                slug: pr.slug,
                price: Number(pr.price) || 0,
                image: pr.image || null,
                currency: pr.currency || 'PKR',
              }))
          )
        }
      } catch {
        /* popup is optional — fail silently */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const pickFrame = useCallback((): PopupFrame | null => {
    if (!products.length) return null
    const names = settings?.names?.length ? settings.names : DEFAULT_NAMES
    const cities = settings?.cities?.length ? settings.cities : DEFAULT_CITIES
    const product = products[rand(0, products.length - 1)]
    if (!product) return null
    return {
      product,
      name: names[rand(0, names.length - 1)],
      city: cities[rand(0, cities.length - 1)],
      minutesAgo: rand(4, 42),
    }
  }, [products, settings])

  useEffect(() => {
    if (!settings?.enabled || dismissed || !products.length) return

    let cancelled = false
    let timeout: ReturnType<typeof setTimeout>

    const scheduleCycle = (delayMs: number) => {
      timeout = setTimeout(cycle, delayMs)
    }

    // cycle picks a frame (with a random skip chance) and schedules the hide + next cycle
    function cycle() {
      if (cancelled) return
      setVisible(false)

      // ~30% of cycles are skipped entirely
      if (Math.random() < 0.3) {
        scheduleCycle(rand(20, 35) * 1000)
        return
      }

      const next = pickFrame()
      if (!next) {
        scheduleCycle(25 * 1000)
        return
      }

      setFrame(next)
      setVisible(true)
      timeout = setTimeout(() => {
        if (cancelled) return
        setVisible(false)
        scheduleCycle(rand(20, 30) * 1000)
      }, rand(5000, 6000))
    }

    // first popup after 8-10s
    timeout = setTimeout(cycle, rand(8000, 10000))

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [settings, dismissed, products, pickFrame])

  const handleDismiss = () => {
    setDismissed(true)
    setVisible(false)
  }

  if (!settings?.enabled || dismissed || !frame) return null

  const price = `${frame.product.currency || 'PKR'} ${(frame.product.price ?? 0).toLocaleString()}`

  return (
    <div
      className={`fixed bottom-20 lg:bottom-6 left-3 right-3 sm:right-auto sm:left-4 z-[45] max-w-[340px] mx-auto ${
        visible ? 'animate-popup-in' : 'animate-popup-out pointer-events-none'
      }`}
      aria-live="polite"
    >
      <Link
        href={`/shop/${frame.product.slug}`}
        className="relative flex items-start gap-3 rounded-2xl bg-white text-foreground shadow-[0_12px_32px_rgba(0,0,0,0.18)] border-l-4 border-[#c9a962] p-3"
      >
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
          {frame.product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={frame.product.image} alt={frame.product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              SP
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] leading-snug text-foreground">
            <strong className="font-semibold">{frame.name}</strong>{' '}
            <span className="text-muted-foreground">from</span>{' '}
            <strong className="font-semibold">{frame.city}</strong>{' '}
            <span className="text-muted-foreground">purchased</span>{' '}
            <strong className="font-semibold">{frame.product.name}</strong>
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm font-bold text-[#c9a962]">{price}</span>
            <span className="text-[11px] text-muted-foreground">{frame.minutesAgo} minutes ago</span>
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 border border-green-100 rounded-full px-2 py-0.5">
            ✓ Verified Order
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleDismiss()
          }}
          aria-label="Close notification"
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 text-muted-foreground transition-colors"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </Link>
    </div>
  )
}