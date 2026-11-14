import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import SiteShell from '@/components/SiteShell'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import { getSiteContent } from '@/lib/homepage-content-store'
import { getMetaPublicConfig } from '@/lib/meta'
import MetaPixel from '@/components/MetaPixel'
import AttributionCapture from '@/components/AttributionCapture'

// Self-hosted copies of the Google Fonts (see scripts/fetch-local-fonts.mjs).
// Loading them locally keeps `next build` working when Google Fonts serves
// extension-less `fonts.gstatic.com/l/font?kit=...` URLs, which the Google
// loader in this Next version cannot parse.
const playfair = localFont({
  src: [
    { path: '../fonts/playfair-display-latin.woff2', weight: '400 900', style: 'normal' },
    { path: '../fonts/playfair-display-latin-ext.woff2', weight: '400 900', style: 'normal' },
  ],
  variable: '--font-playfair',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: 'Times New Roman',
})

const montserrat = localFont({
  src: [
    { path: '../fonts/montserrat-latin.woff2', weight: '100 900', style: 'normal' },
    { path: '../fonts/montserrat-latin-ext.woff2', weight: '100 900', style: 'normal' },
  ],
  variable: '--font-montserrat',
  display: 'swap',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Safari Perfumes — Designer-Inspired Attars & Perfumes in Pakistan',
    template: '%s | Safari Perfumes',
  },
  description:
    'Shop 330+ designer-inspired attars & perfumes in Pakistan. Alcohol-free, long-lasting fragrances with free delivery nationwide.',
  keywords: [
    'perfume in Pakistan',
    'attar in Pakistan',
    'designer perfume impressions',
    'perfume dupes Pakistan',
    'attar online Pakistan',
    'fragrance Pakistan',
    'gift perfume Pakistan',
  ],
  openGraph: {
    title: 'Safari Perfumes — Designer-Inspired Attars & Perfumes in Pakistan',
    description:
      'Shop 330+ designer-inspired attars & perfumes in Pakistan. Alcohol-free, long-lasting fragrances with free delivery nationwide.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Safari Perfumes — Designer-Inspired Attars & Perfumes in Pakistan',
    description:
      'Shop 330+ designer-inspired attars & perfumes in Pakistan. Alcohol-free, long-lasting fragrances with free delivery nationwide.',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.webp`,
  email: 'support@safari-perfumes.com',
  telephone: '+92 3107435020',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'PK',
  },
  sameAs: [
    'https://www.tiktok.com/@safari.perfumes?_r=1&_t=ZS-995di8B29qv',
    'https://www.facebook.com/share/19G8xxiTP7/',
  ],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [siteContent, meta] = await Promise.all([getSiteContent(), getMetaPublicConfig()])

  return (
    <html lang='en' className={`${playfair.variable} ${montserrat.variable}`} data-scroll-behavior="smooth">
      <body className='min-h-full flex flex-col'>
        {meta.domainVerification && (
          <meta name="facebook-domain-verification" content={meta.domainVerification} />
        )}
        <MetaPixel pixelId={meta.pixelId} enabled={meta.pixelEnabled} />
        <AttributionCapture />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <SiteShell siteContent={siteContent}>{children}</SiteShell>
                <Toaster />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}