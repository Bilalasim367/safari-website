import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className='min-h-full flex flex-col'>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className='flex-1'>{children}</main>
            <Footer />
            <CartSidebar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
