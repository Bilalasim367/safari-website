'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import SearchOverlay from './SearchOverlay';

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, authChecking } = useAuth();
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
      <div className='bg-black h-10 md:h-12 flex items-center'>
        <div className='w-full container-custom'>
          <div className='flex items-center justify-between text-sm'>
            <nav className='hidden md:flex items-center gap-5'>
              {topLinks.map((link, i) => (
                <React.Fragment key={link.href}>
                  <Link
                    href={link.href}
                    className='text-gray-300 hover:text-white transition-colors duration-200 font-light tracking-wide'
                  >
                    {link.label}
                  </Link>
                  {i < topLinks.length - 1 && (
                    <span className='text-gray-600'>|</span>
                  )}
                </React.Fragment>
              ))}
            </nav>

            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden text-white hover:text-gray-300"
              aria-label="Open menu"
            >
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>

            <div className='flex items-center gap-3 md:gap-4'>
              {[
                { icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z', label: 'Instagram' },
                { icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', label: 'Facebook' },
                { icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z', label: 'Twitter' },
              ].map((social) => (
                <button
                  key={social.label}
                  onClick={() => alert('Coming soon!')}
                  className='text-gray-400 hover:text-white transition-colors duration-200 cursor-not-allowed'
                  aria-label={social.label}
                >
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d={social.icon} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='bg-black py-5 md:py-6 px-4 text-center'>
        <div className='container-custom relative'>
          <p className='text-white text-sm md:text-base tracking-[0.3em] uppercase'>
            <span className='text-white font-semibold mr-3'>FREE SHIPPING</span>
            <span className='hidden md:inline'>ON ORDERS OVER $100</span>
          </p>
        </div>
      </div>

      <header className={`bg-black transition-all duration-300 py-4 md:py-5 ${scrolled ? 'shadow-lg' : 'shadow-md'}`}>
        <div className='container-custom'>
          <div className='flex items-center justify-between h-20 md:h-24'>
            <Link href='/' className='flex-shrink-0'>
              <h1 className='text-3xl md:text-4xl font-serif font-bold tracking-wide'>
                <span className='text-white'>SAFARI</span>
              </h1>
            </Link>

            <nav className='hidden lg:flex items-center gap-8 md:gap-10'>
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='text-white hover:text-gray-300 font-semibold uppercase tracking-wide text-sm transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full'
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className='flex items-center gap-5 md:gap-6'>
              <button
                onClick={() => setSearchOpen(true)}
                className='text-white hover:text-gray-300 transition-colors duration-200'
                aria-label='Search'
              >
                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </button>

              <Link href={user ? '/account' : '/login'} className='text-white hover:text-gray-300 transition-colors duration-200' aria-label='Account'>
                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
              </Link>

              {user?.role === 'admin' && (
                <Link href='/admin/dashboard' className='text-white hover:text-gray-300 transition-colors duration-200' aria-label='Admin Panel'>
                  <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                  </svg>
                </Link>
              )}

              <button onClick={() => setIsCartOpen(true)} className='relative text-white hover:text-gray-300 transition-colors duration-200' aria-label='Cart'>
                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                </svg>
                {totalItems > 0 && (
                  <span className='absolute -top-2 -right-2 w-5 h-5 bg-white text-black text-xs font-bold rounded-full flex items-center justify-center'>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)} />

      <div className={`fixed top-0 left-0 h-full w-[350px] max-w-[90vw] bg-white z-[70] transform transition-transform duration-300 lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className='flex flex-col h-full'>
          <div className='flex items-center justify-between p-8 border-b border-gray-100'>
            <h2 className='text-2xl font-serif font-bold tracking-[0.3em] text-gray-900'>MENU</h2>
            <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close menu">
              <svg className='w-8 h-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          <nav className='flex-1 p-8 space-y-0 overflow-y-auto'>
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className='block text-base text-gray-800 hover:text-black transition-colors py-6 border-b border-gray-100 font-medium'>
                {item.label}
              </Link>
            ))}
            <div className='border-b border-gray-100 my-4' />
            {topLinks.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className='block text-base text-gray-500 hover:text-black transition-colors py-6'>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className='p-8 border-t border-gray-100'>
            <div className='flex gap-5'>
              {['I', 'F', 'T'].map((letter, i) => (
                <a key={i} href='#' className='w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all'>
                  <span className='text-base font-medium'>{letter}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}