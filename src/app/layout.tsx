import type { Metadata } from 'next'
import { Playfair_Display, Montserrat } from 'next/font/google'
import './globals.css'
import SiteShell from '@/components/SiteShell'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SITE_URL, SITE_NAME } from '@/lib/site'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Safari Perfumes | Affordable Designer-Inspired Attars & Perfumes in Pakistan',
    template: '%s | Safari Perfumes',
  },
  description:
    'Shop designer-inspired attars and perfumes in Pakistan at affordable PKR prices. 330+ fragrances for men, women, and unisex with fast delivery across Pakistan.',
  keywords: [
    'perfume in Pakistan',
    'attar in Pakistan',
    'designer perfume impressions',
    'perfume dupes Pakistan',
    'attar online Pakistan',
    'fragrance Pakistan',
    'gift perfume Pakistan',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Safari Perfumes | Affordable Designer-Inspired Attars & Perfumes in Pakistan',
    description:
      'Shop designer-inspired attars and perfumes in Pakistan at affordable PKR prices. 330+ fragrances with fast delivery across Pakistan.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Safari Perfumes | Affordable Designer-Inspired Attars & Perfumes in Pakistan',
    description:
      'Shop designer-inspired attars and perfumes in Pakistan at affordable PKR prices.',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  // Contact details (address, phone, sameAs) intentionally omitted until
  // real business information is confirmed — never ship placeholder NAP data.
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className={`${playfair.variable} ${montserrat.variable}`} data-scroll-behavior="smooth">
      <body className='min-h-full flex flex-col'>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <SiteShell>{children}</SiteShell>
                <Toaster />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}