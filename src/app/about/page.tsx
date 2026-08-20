import type { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About Us | Safari Perfumes Pakistan',
  description:
    'Safari Perfumes — crafting designer-inspired attars and perfumes in Pakistan. Discover our story, our passion for fragrance, and why thousands of customers trust us.',
  alternates: { canonical: `${SITE_URL}/about` },
}

export default function AboutPage() {
  return <AboutPageClient />
}