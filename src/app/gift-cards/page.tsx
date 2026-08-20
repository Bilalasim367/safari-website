import type { Metadata } from 'next'
import GiftCardsPageClient from './GiftCardsPageClient'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Gift Cards | Safari Perfumes Pakistan',
  description:
    'Give the gift of fragrance. Safari Perfumes gift cards — redeemable on attars, perfumes, and bundles, delivered instantly in Pakistan.',
  alternates: { canonical: `${SITE_URL}/gift-cards` },
}

export default function GiftCardsPage() {
  return <GiftCardsPageClient />
}