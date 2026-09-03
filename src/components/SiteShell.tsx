'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add('h-screen', 'overflow-hidden')
      document.body.classList.remove('min-h-full', 'flex', 'flex-col')
    } else {
      document.body.classList.remove('h-screen', 'overflow-hidden')
      document.body.classList.add('min-h-full', 'flex', 'flex-col')
    }
  }, [isAdmin])

  return (
    <>
      {!isAdmin && <Header />}
      {isAdmin ? children : <main className="flex-1 pt-20 md:pt-28">{children}</main>}
      {!isAdmin && <Footer />}
      {!isAdmin && <CartSidebar />}
    </>
  )
}