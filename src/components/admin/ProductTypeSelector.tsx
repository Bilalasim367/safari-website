'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FlaskRound, Droplets } from 'lucide-react'

export type ProductType = 'attar' | 'perfume'

interface ProductTypeSelectorProps {
  selected: ProductType | null
  onSelect: (type: ProductType) => void
  onContinue: () => void
}

const OPTIONS: { type: ProductType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    type: 'perfume',
    label: 'Perfume',
    description: 'Spray fragrances — 30ml, 50ml, 100ml variants with EDP, Parfum, or EDT concentrations.',
    icon: <FlaskRound className="h-10 w-10" />,
  },
  {
    type: 'attar',
    label: 'Attar',
    description: 'Concentrated oil-based fragrances — 3ml, 4ml, 6ml variants with roll-on, stick, or premium packaging.',
    icon: <Droplets className="h-10 w-10" />,
  },
]

export default function ProductTypeSelector({ selected, onSelect, onContinue }: ProductTypeSelectorProps) {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-bold">Select Product Category to Upload</h1>
        <p className="text-muted-foreground mt-2">Choose the type of product you want to add. Each type has its own form with relevant fields.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.type
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelect(opt.type)}
              className="text-left focus:outline-none"
            >
              <Card
                className={`h-full cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2 shadow-lg'
                    : 'hover:ring-2 hover:ring-foreground/20 hover:shadow-md'
                }`}
              >
                <CardContent className="flex flex-col items-center text-center p-8">
                  <div className={`mb-5 w-16 h-16 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {opt.icon}
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-2">{opt.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{opt.description}</p>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>

      <div className="text-center">
        <Button
          size="lg"
          disabled={!selected}
          onClick={onContinue}
          className="min-w-[200px]"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
