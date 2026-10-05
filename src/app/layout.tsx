import type { Metadata } from 'next'
import { Playfair_Display, Montserrat } from 'next/font/google'
import './globals.css'
// UI V2 design tokens. Every rule is scoped under [data-ui='v2']; with
// NEXT_PUBLIC_UI_V2 off the attribute is absent and none of it can apply.
import './ui2.css'
// UI V2 global layout: announcement strip, header, drawer, footer, WhatsApp.
import './ui2-shell.css'
import SiteShell from '@/components/SiteShell'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import {
  UI_V2_ENABLED,
  UI_V2_HTML_ATTRIBUTE,
  UI_V2_HTML_ATTRIBUTE_VALUE,
} from '@/lib/ui-flag'
import { ui2FontVariables } from '@/components/v2/fonts'

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
  alternates: {
    canonical: SITE_URL,
  },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className={`${playfair.variable} ${montserrat.variable}${UI_V2_ENABLED ? ` ${ui2FontVariables}` : ''}`} data-scroll-behavior="smooth"
      {...(UI_V2_ENABLED
        ? { [UI_V2_HTML_ATTRIBUTE]: UI_V2_HTML_ATTRIBUTE_VALUE }
        : {})}
    >
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