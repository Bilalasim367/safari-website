import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Playfair_Display, Montserrat } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

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
  title: 'SAFARI | Luxury Fragrances',
  description:
    'Discover exceptional fragrances crafted with passion. SAFARI - Luxury perfumes for men, women, and unisex. Shop signature scents, best sellers, and exclusive bundles.',
  keywords:
    'luxury perfume, fragrance, mens perfume, womens perfume, unisex fragrance, attar, signature scent, best sellers, new arrivals',
  openGraph: {
    title: 'SAFARI | Luxury Fragrances',
    description:
      'Discover exceptional fragrances crafted with passion. Shop our exclusive collection of luxury perfumes.',
    siteName: 'SAFARI',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isAdmin = pathname.startsWith('/admin')

  return (
    <html lang='en' className={`${playfair.variable} ${montserrat.variable}`}>
      <body className={isAdmin ? 'h-screen overflow-hidden' : 'min-h-full flex flex-col'}>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              {!isAdmin && <Header />}
              {isAdmin ? children : <main className="flex-1">{children}</main>}
              {!isAdmin && <Footer />}
              {!isAdmin && <CartSidebar />}
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
