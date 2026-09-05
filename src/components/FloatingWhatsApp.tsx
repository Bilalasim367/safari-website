'use client'

import { useEffect, useState } from 'react'

const WHATSAPP_SVG = (
  <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
    <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.47 1.71 6.41L3.2 28.8l6.56-1.69a12.74 12.74 0 0 0 6.24 1.6h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05A12.72 12.72 0 0 0 16.004 3.2Zm7.43 18.13c-.31.87-1.8 1.66-2.48 1.72-.63.05-1.43.24-4.78-1-3.33-1.23-5.73-4.5-5.9-4.71-.17-.21-1.41-1.88-1.41-3.58 0-1.7.89-2.54 1.21-2.89.31-.35.68-.43.91-.43h.65c.21 0 .49-.08.77.59.31.74 1.04 2.55 1.13 2.74.09.18.15.4.03.65-.12.25-.18.4-.36.62l-.53.62c-.17.18-.35.37-.15.73.2.36.9 1.48 1.93 2.4 1.32 1.18 2.44 1.55 2.79 1.72.35.17.55.14.76-.09.21-.23.88-1.02 1.11-1.37.23-.35.47-.29.79-.18.32.12 2.05.97 2.41 1.14.35.18.59.26.68.41.09.15.09.86-.22 1.73Z" />
  </svg>
)

export default function FloatingWhatsApp() {
  const [number, setNumber] = useState('923247277489')

  useEffect(() => {
    let cancelled = false
    fetch('/api/popup-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.whatsappNumber) setNumber(data.whatsappNumber)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const href = `https://wa.me/${number}?text=${encodeURIComponent(
    'Hi! I want to order a perfume from Safari Perfumes.'
  )}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 lg:bottom-6 right-4 z-[45] flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_6px_20px_rgba(37,211,102,0.45)] hover:bg-[#1ebe5b] transition-all duration-200 hover:scale-105 animate-whatsapp-pulse"
    >
      {WHATSAPP_SVG}
    </a>
  )
}