'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import SearchOverlay from './SearchOverlay';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
  hasDropdown?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Bestsellers', href: '/shop?isBestseller=true' },
  { label: 'New Arrival', href: '/shop?isNew=true' },
  { label: 'Our Collection', href: '/collections' },
  {
    label: 'Attar Collection',
    hasDropdown: true,
    children: [
      { label: 'Men', href: '/shop?type=attar&gender=men' },
      { label: 'Women', href: '/shop?type=attar&gender=women' },
      { label: 'Unisex', href: '/shop?type=attar&gender=unisex' },
    ],
  },
  {
    label: 'Perfumes Collection',
    hasDropdown: true,
    children: [
      { label: 'Men', href: '/shop?type=perfume&gender=men' },
      { label: 'Women', href: '/shop?type=perfume&gender=women' },
      { label: 'Unisex', href: '/shop?type=perfume&gender=unisex' },
    ],
  },
  { label: 'Bundles/Offers', href: '/bundles' },
];

const topLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/contact?faq=true', label: 'FAQs' },
];

const socialIcons = [
  { icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z', label: 'Instagram' },
  { icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', label: 'Facebook' },
  { icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z', label: 'Twitter' },
];

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [attarOpen, setAttarOpen] = useState(false);
  const [perfumeOpen, setPerfumeOpen] = useState(false);
  const [mobileAttarOpen, setMobileAttarOpen] = useState(false);
  const [mobilePerfumeOpen, setMobilePerfumeOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const attarRef = useRef<HTMLDivElement>(null);
  const perfumeRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attarRef.current && !attarRef.current.contains(event.target as Node)) {
        setAttarOpen(false);
      }
      if (perfumeRef.current && !perfumeRef.current.contains(event.target as Node)) {
        setPerfumeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q')?.toString().trim();
    if (query) {
      router.push(`/shop?q=${encodeURIComponent(query)}`);
    }
  };

  const openDropdown = useCallback((setOpen: (v: boolean) => void) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpen(true);
  }, []);

  const closeDropdown = useCallback((setOpen: (v: boolean) => void) => {
    dropdownTimeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

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
                  {i < 2 && <span className='text-primary-foreground/40'>|</span>}
                </React.Fragment>
              ))}
            </nav>

            <div className='flex items-center gap-3 md:gap-4'>
              {socialIcons.map((social) => (
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

      {/* Scrolling Announcement Bar */}
      <div className='bg-primary text-primary-foreground py-4 md:py-5 px-4 overflow-hidden'>
        <div className='relative flex whitespace-nowrap animate-marquee'>
          {[
            'FREE SHIPPING ON ORDERS OVER PKR 15,000',
            'NEW ARRIVALS — EXPLORE THE LATEST SCENTS',
            'BUY 2 GET 10% OFF — USE CODE: PAIR10',
            'FREE SHIPPING ON ORDERS OVER PKR 15,000',
            'NEW ARRIVALS — EXPLORE THE LATEST SCENTS',
            'BUY 2 GET 10% OFF — USE CODE: PAIR10',
          ].map((text, i) => (
            <React.Fragment key={i}>
              <span className='text-xs md:text-sm tracking-[0.3em] uppercase font-semibold mx-4'>
                {text}
              </span>
              <span className='text-xs md:text-sm tracking-[0.3em] uppercase font-semibold mx-4 text-primary-foreground/40'>|</span>
            </React.Fragment>
          ))}
        </div>
      </div>

{/* TIER 1: TOP HEADER - Sticky */}
      <header className={`sticky top-0 z-50 h-32 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-sm' : 'bg-black'} border-b border-white/10`}>
        <div className='container-custom grid grid-cols-[1fr_auto_1fr] items-center h-full px-4 md:px-8'>
          {/* LEFT: Search - Desktop Input / Mobile Button */}
          <div className='flex items-center justify-start'>
            {/* Desktop Search Input */}
            <form onSubmit={handleSearchSubmit} className='hidden md:flex items-center'>
              <div className='relative'>
                <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden="true">
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
                <input
                  type="search"
                  name="q"
                  placeholder="Search fragrances..."
                  className='bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-gold focus:ring-1 focus:ring-gold/20 rounded-lg pl-10 pr-4 py-2 w-64 md:w-80 transition-colors duration-200'
                  aria-label="Search fragrances"
                />
              </div>
            </form>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className='md:hidden text-white/80 hover:text-gold'
              onClick={() => setSearchOpen(true)}
              aria-label='Search'
            >
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </Button>
          </div>

          {/* CENTER: Logo - Perfectly Centered via Grid */}
          <Link href='/' className='justify-self-center flex-shrink-0' aria-label='SAFARI Perfumes Home'>
            <Image
              src='/logo.png'
              alt='SAFARI Logo'
              width={352}
              height={128}
                priority
              className='h-32 w-auto object-contain'
            />
          </Link>

          {/* RIGHT: Profile + Cart (+ Mobile Menu) */}
          <div className='flex items-center justify-end gap-4'>
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className='relative text-white/80 hover:text-gold'
              onClick={() => setIsCartOpen(true)}
              aria-label='Cart'
            >
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
              </svg>
              {isClient && totalItems > 0 && (
                <span className='absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-xs font-bold rounded-full flex items-center justify-center'>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Button>

            {/* Profile / Account */}
            <Link href={user ? '/account' : '/login'} aria-label='Account' className='text-white/80 hover:text-gold transition-colors'>
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
              </svg>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className='md:hidden text-white/80 hover:text-gold'
              onClick={() => setMenuOpen(true)}
              aria-label='Menu'
            >
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* TIER 2: NAV BAR - Fixed Height, Not Sticky */}
      <nav className='bg-black border-b border-white/10' aria-label="Main navigation">
        <div className='container-custom flex items-center justify-center gap-2 md:gap-4 px-4 md:px-8 py-2'>
          {navItems.map((item) => {
            if (item.hasDropdown && item.children) {
              const isAttar = item.label === 'Attar Collection';
              const isOpen = isAttar ? attarOpen : perfumeOpen;
              const setOpen = isAttar ? setAttarOpen : setPerfumeOpen;
              const ref = isAttar ? attarRef : perfumeRef;

              return (
                <div
                  key={item.label}
                  ref={ref}
                  className='relative flex-shrink-0'
                  onMouseEnter={() => openDropdown(setOpen)}
                  onMouseLeave={() => closeDropdown(setOpen)}
                >
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium uppercase tracking-wider text-white/80 hover:text-gold transition-colors duration-200 relative whitespace-nowrap ${isOpen ? 'text-gold' : ''}`}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-label={item.label}
                  >
                    {item.label}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      aria-hidden="true"
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {isOpen && (
                    <div className='absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-52 bg-black border border-white/10 rounded-lg shadow-xl py-1.5 z-50 animate-fade-in'>
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href!}
                          className='block px-4 py-2.5 text-sm text-white/80 hover:text-gold hover:bg-white/5 transition-colors duration-200 whitespace-nowrap'
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href!}
                className='flex-shrink-0 px-3 py-2 text-sm font-medium uppercase tracking-wider text-white/80 hover:text-gold transition-colors duration-200 relative after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-gold after:transition-all after:duration-300 hover:after:w-3/4 whitespace-nowrap'
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* MOBILE DRAWER */}
<Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className='md:hidden' aria-label='Menu'>
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </Button>
          </SheetTrigger>
        <SheetContent side="left" className="w-[350px] max-w-[90vw] p-0 bg-black">
          <div className='flex flex-col h-full'>
            {/* Drawer Header */}
            <div className='flex items-center justify-between p-6 border-b border-white/10'>
              <h2 className='text-xl font-serif font-bold tracking-[0.3em] text-white'>MENU</h2>
            </div>

            {/* Mobile Search in Drawer */}
            <form onSubmit={handleSearchSubmit} className='p-6 border-b border-white/10'>
              <div className='relative'>
                <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden="true">
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
                <input
                  type="search"
                  name="q"
                  placeholder="Search fragrances..."
                  className='bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-gold focus:ring-1 focus:ring-gold/20 rounded-lg pl-10 pr-4 py-3 w-full transition-colors duration-200'
                  aria-label="Search fragrances"
                />
              </div>
            </form>

            {/* Navigation in Drawer */}
            <nav className='flex-1 p-6 space-y-1 overflow-y-auto'>
              {navItems.map((item) => {
                if (item.hasDropdown && item.children) {
                  const isAttar = item.label === 'Attar Collection';
                  const isOpen = isAttar ? mobileAttarOpen : mobilePerfumeOpen;
                  const setOpen = isAttar ? setMobileAttarOpen : setMobilePerfumeOpen;

                  return (
                    <div key={item.label} className='border-b border-white/10'>
                      <button
                        onClick={() => setOpen(!isOpen)}
                        className='w-full flex items-center justify-between text-base text-white/80 hover:text-gold transition-colors py-4 font-medium'
                      >
                        <span>{item.label}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                        </svg>
                      </button>
                      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-60' : 'max-h-0'}`}>
                        <div className='pb-2 space-y-1 pl-4'>
                          {item.children.map((child) => (
                            <SheetClose key={child.href}>
                              <Link
                                href={child.href!}
                                className='block text-sm text-white/60 hover:text-gold transition-colors py-2'
                              >
                                {child.label}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <SheetClose key={item.href}>
                    <Link href={item.href!} className='block text-base text-white/80 hover:text-gold transition-colors py-4 border-b border-white/10 font-medium whitespace-nowrap'>
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}

              <div className='my-4' />

              {topLinks.map((item) => (
                <SheetClose key={item.href}>
                  <Link href={item.href} className='block text-base text-white/60 hover:text-gold transition-colors py-4'>
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>

            {/* Social in Drawer */}
            <div className='p-6 border-t border-white/10'>
              <div className='flex gap-4'>
                {socialIcons.map((social, i) => (
                  <Button key={i} variant="ghost" size="icon" className='w-10 h-10 rounded-full border border-white/10 text-white/60 hover:border-gold hover:text-gold transition-all'>
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                      <path d={social.icon} />
                    </svg>
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