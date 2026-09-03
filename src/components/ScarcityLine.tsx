'use client'

import { useMemo } from 'react'

interface ScarcityLineProps {
  style?: 'alert' | 'pill'
  className?: string
}

function seededValue(seedBase: string, min: number, max: number): number {
  let hash = 0
  for (let i = 0; i < seedBase.length; i++) {
    hash = (hash << 5) - hash + seedBase.charCodeAt(i)
    hash |= 0
  }
  const abs = Math.abs(hash)
  return min + (abs % (max - min + 1))
}

export default function ScarcityLine({ style = 'alert', className = '' }: ScarcityLineProps) {
  const { stock, buyers } = useMemo(() => {
    const s = seededValue('stock', 5, 15)
    const b = seededValue('buyers', 4, 13)
    return { stock: s, buyers: b }
  }, [])

  const message = useMemo(() => {
    const useStock = stock <= 9
    return useStock
      ? `🔥 Only ${stock} left in stock — selling fast!`
      : `⚡ ${buyers} people bought this in the last 24 hours`
  }, [stock, buyers])

  if (style === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 bg-gold/10 text-charcoal text-xs font-medium px-3 py-1.5 rounded-full border border-gold/30 ${className}`}
      >
        {message}
      </span>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-lg px-4 py-2.5 text-sm text-charcoal ${className}`}
    >
      {message}
    </div>
  )
}
