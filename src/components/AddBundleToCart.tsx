"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AddBundleToCartProps {
  bundleId: string
  name: string
  price: number
  image?: string | null
  size?: string | null
  inStock: boolean
}

export default function AddBundleToCart({ bundleId, name, price, image, size, inStock }: AddBundleToCartProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      id: bundleId,
      name,
      price,
      image: image || "",
      size: size || "Bundle",
      quantity: 1,
    })
    setAdded(true)
    toast.success(`${name} added to cart!`)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button
      size="lg"
      className="w-full bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold uppercase tracking-wider h-14"
      disabled={!inStock}
      onClick={handleAdd}
    >
      {!inStock ? (
        "Out of Stock"
      ) : added ? (
        <>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mr-2">
            <path d="M4 9L7 12L14 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Added to Cart
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mr-2">
            <path d="M3 3h2l2 8h6l1.5-4H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="14" r="1" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="13" cy="14" r="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Add to Cart
        </>
      )}
    </Button>
  )
}
