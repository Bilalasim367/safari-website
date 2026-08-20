import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact Us | Safari Perfumes Pakistan',
  description:
    'Get in touch with Safari Perfumes — questions about orders, fragrances, or wholesale. We are happy to help with fast replies across Pakistan.',
  alternates: { canonical: `${SITE_URL}/contact` },
}

export default function ContactPage() {
  return <ContactPageClient />
}