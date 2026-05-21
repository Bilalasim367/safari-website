'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sp = new URLSearchParams(searchParams.toString())
    const value = e.target.value
    if (value === 'featured') {
      sp.delete('sort')
    } else {
      sp.set('sort', value)
    }
    sp.delete('page')
    router.push(`/shop?${sp.toString()}`)
  }

  return (
    <select
      defaultValue={currentSort}
      onChange={handleChange}
      className="bg-transparent border border-input text-foreground text-sm px-4 py-2.5 outline-none focus:border-foreground transition-colors cursor-pointer"
    >
      <option value="featured">Sort: Featured</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="newest">Newest</option>
      <option value="rating">Top Rated</option>
    </select>
  )
}