'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import SearchOverlay from './SearchOverlay';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/contact?faq=true', label: 'FAQs' },
  ];

  const mainNav = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop All' },
    { href: '/shop?filter=new', label: 'New Arrivals' },
    { href: '/collections', label: 'Collections' },
    { href: '/shop?filter=bundles', label: 'Gifts & Sets' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className='bg-primary text-primary-foreground h-10 md:h-12 flex items-center'>
        <div className='w-full container-custom'>
          <div className='flex items-center justify-between text-sm'>
            <nav className='hidden md:flex items-center gap-5'>
              {topLinks.map((link, i) => (
                <React.Fragment key={link.href}>
                  <Link
                    href={link.href}
                    className='text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 font-light tracking-wide'
                  >
                    {link.label}
                  </Link>
                  {i < topLinks.length - 1 && (
                    <span className='text-primary-foreground/40'>|</span>
                  )}
                </React.Fragment>
              ))}
            </nav>

            <div className='flex items-center gap-3 md:gap-4'>
              {[
                { icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z', label: 'Instagram' },
                { icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', label: 'Facebook' },
                { icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z', label: 'Twitter' },
              ].map((social) => (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon"
                  onClick={() => alert('Coming soon!')}
                  className='text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 cursor-not-allowed'
                  aria-label={social.label}
                >
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d={social.icon} />
                  </svg>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Announcement */}
      <div className='bg-primary text-primary-foreground py-5 md:py-6 px-4 text-center'>
        <div className='container-custom relative'>
          <p className='text-sm md:text-base tracking-[0.3em] uppercase font-semibold'>
            <span className='font-bold mr-3'>FREE SHIPPING</span>
            <span className='hidden md:inline'>ON ORDERS OVER $100</span>
          </p>
        </div>
      </div>

        {/* Main Header - black initially, 20% opacity when scrolled */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-secondary/20 border-b border-transparent' : 'bg-secondary shadow-lg border-b border-secondary'}`}>
        <div className='container-custom'>
          <div className='flex items-center justify-between h-20 md:h-24'>
            <Link href='/' className='flex-shrink-0'>
              <h1 className='text-3xl md:text-4xl font-serif font-bold tracking-wide'>
                <span className='text-secondary-foreground'>SAFARI</span>
              </h1>
            </Link>

            <nav className='hidden lg:flex items-center gap-8 md:gap-10'>
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='text-secondary-foreground hover:text-secondary-foreground/70 font-semibold uppercase tracking-wide text-sm transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-secondary-foreground after:transition-all after:duration-300 hover:after:w-full'
                >
                  {item.label}
                </Link>
              ))}
            </nav>

             <div className='flex items-center gap-5 md:gap-6'>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className='text-secondary-foreground hover:text-secondary-foreground/70'
                aria-label='Search'
              >
                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </Button>

              <Button variant="ghost" size="icon" className='text-secondary-foreground hover:text-secondary-foreground/70'>
                <Link href={user ? '/account' : '/login'} aria-label='Account'>
                  <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                  </svg>
                </Link>
              </Button>

              {user?.role === 'admin' && (
                <Button variant="ghost" size="icon" className='text-secondary-foreground hover:text-secondary-foreground/70'>
                  <Link href='/admin/dashboard' aria-label='Admin Panel'>
                    <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className='relative text-secondary-foreground hover:text-secondary-foreground/70'
                aria-label='Cart'
              >
                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                </svg>
                {totalItems > 0 && (
                  <span className='absolute -top-2 -right-2 w-5 h-5 bg-secondary-foreground text-secondary text-xs font-bold rounded-full flex items-center justify-center'>
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger className="md:hidden fixed top-4 left-4 z-50 text-foreground/80 hover:text-foreground bg-background/80 backdrop-blur-sm border border-border inline-flex shrink-0 items-center justify-center rounded-lg size-8 transition-all outline-none select-none">
          <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        </SheetTrigger>
        <SheetContent side="left" className="w-[350px] max-w-[90vw] p-0">
          <div className='flex flex-col h-full'>
            <div className='flex items-center justify-between p-8 border-b border-border'>
              <h2 className='text-2xl font-serif font-bold tracking-[0.3em] text-foreground'>MENU</h2>
            </div>

            <nav className='flex-1 p-8 space-y-0 overflow-y-auto'>
              {mainNav.map((item) => (
                <SheetClose key={item.href}>
                  <Link href={item.href} className='block text-base text-foreground/80 hover:text-foreground transition-colors py-6 border-b border-border font-medium'>
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
              <div className='border-b border-border my-4' />
              {topLinks.map((item) => (
                <SheetClose key={item.href}>
                  <Link href={item.href} className='block text-base text-muted-foreground hover:text-foreground transition-colors py-6'>
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>

            <div className='p-8 border-t border-border'>
              <div className='flex gap-5'>
                {['I', 'F', 'T'].map((letter, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    className='w-12 h-12 rounded-full border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-all'
                  >
                    <span className='text-base font-medium'>{letter}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
