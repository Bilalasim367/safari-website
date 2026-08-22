'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }
  return (
    <footer className='bg-primary text-primary-foreground/90 py-20 md:py-28'>
      <div className='container-custom'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-14 lg:gap-16 mb-20'>
          {/* Column 1: Brand & About */}
          <div className='lg:col-span-1'>
            <Link href='/' className='inline-block mb-8'>
              <h2 className='text-2xl md:text-3xl font-serif font-bold tracking-wide text-primary-foreground'>
                SAFARI
              </h2>
            </Link>
            <p className='text-primary-foreground/70 text-base leading-relaxed mb-8 max-w-xs'>
              Crafting luxury fragrances that capture the essence of elegance
              and sophistication since 2015. Every scent tells a story of
              craftsmanship and passion.
            </p>
            <Button variant="link" className="p-0 h-auto text-primary-foreground hover:text-primary-foreground/80 gap-2 group">
              <Link href='/about'>
                Read More
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none"
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path d="M4 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </Button>

            <div className='mt-10 pt-10 border-t border-primary-foreground/20'>
              <h4 className='text-primary-foreground font-semibold text-base tracking-wide mb-6'>
                Contact Us
              </h4>
              <ul className='space-y-5 text-base'>
                <li>
                  <a
                    href='mailto:support@safari-perfumes.com'
                    className='hover:text-primary-foreground transition-colors flex items-center gap-3'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                    support@safari-perfumes.com
                  </a>
                </li>
                <li>
                  <a
                    href='tel:+923247277489'
                    className='hover:text-primary-foreground transition-colors flex items-center gap-3'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                      />
                    </svg>
                    +92 324 7277489
                  </a>
                </li>
                <li className='leading-relaxed'>
                  Online store — nationwide delivery across Pakistan
                  <br />
                  No physical storefront
                </li>
              </ul>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className='text-primary-foreground font-semibold text-sm uppercase tracking-[0.2em] mb-8'>
              Quick Links
            </h4>
            <ul className='space-y-5'>
              {[
                { label: 'Shop All', href: '/shop' },
{ label: 'New Arrivals', href: '/shop?isNew=true' },
{ label: 'Best Sellers', href: '/shop?isBestseller=true' },
                { label: 'Collections', href: '/collections' },
                { label: 'Bundles & Gift Sets', href: '/bundles' },
                { label: 'Gift Cards', href: '/gift-cards' },
                { label: 'Fragrance Guides', href: '/blog' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-base text-primary-foreground/70 hover:text-primary-foreground transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className='text-primary-foreground font-semibold text-sm uppercase tracking-[0.2em] mb-8'>
              Customer Service
            </h4>
            <ul className='space-y-5'>
              {[
                { label: 'My Account', href: '/account' },
                { label: 'Order Tracking', href: '/track' },
                { label: 'Returns & Exchange', href: '/returns' },
                { label: 'Shipping & Delivery', href: '/shipping' },
                { label: 'FAQs', href: '/contact?faq=true' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-base text-primary-foreground/70 hover:text-primary-foreground transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div>
            <h4 className='text-primary-foreground font-bold text-xl mb-6'>
              Stay Connected & Save
            </h4>
            <p className='text-primary-foreground/60 text-base mb-8'>
              Sign up for exclusive updates & offers, and get 10% off your first
              order!
            </p>
            <form onSubmit={handleSubscribe} className='mb-8 space-y-4'>
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                required
                className='h-14 bg-background text-foreground placeholder:text-muted-foreground border-border'
                aria-label='Email address for newsletter'
              />
              <Button
                type='submit'
                disabled={subscribed}
                className='w-full h-14 font-semibold uppercase tracking-wider'
                variant='default'
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </Button>
            </form>
            {subscribed && (
              <p className='text-green-500 text-sm mt-2'>Thanks for subscribing!</p>
            )}

<div className='flex gap-4'>
              <a
                href="https://www.tiktok.com/@safari.perfumes?_r=1&_t=ZS-995di8B29qv"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:border-primary-foreground hover:text-primary-foreground transition-all"
                aria-label="TikTok"
              >
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d="M12.548.497c-4.833 0-8.731 3.898-8.731 8.731 0 3.426 2.18 6.337 5.168 7.913v-6.291h-2.148v-3.038h2.148V9.35c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c0 4.827-3.898 8.732-8.732 8.732-4.832 0-8.731-3.898-8.731-8.732zm4.865 3.23c0-1.141-.418-2.084-1.254-2.717 0 0-1.031-.388-2.485-.388-2.493 0-3.168 1.552-3.168 3.777 0 1.294.66 2.42 1.565 2.836-.038.057-.048.117-.048.178 0 .549.076 1.089.438 1.44l.795.795c.594.594 1.49.82 2.32.82.74 0 1.51-.19 2.12-.572l.52-.52c.02-.02.04-.03.06-.05.71-.59 1.25-1.42 1.25-2.43v-.08c0-.01.001-.02.001-.03zm-4.865-3.23h-4.865v4.865h4.865v-4.865z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/19G8xxiTP7/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:border-primary-foreground hover:text-primary-foreground transition-all"
                aria-label="Facebook"
              >
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className='pt-14 border-t border-primary-foreground/20'>
          <div className='flex flex-col lg:flex-row items-center justify-between gap-8'>
            {/* Payment Methods */}
            <div className='flex items-center gap-6'>
              <span className='text-base text-primary-foreground/60 tracking-wide'>
                We Accept:
              </span>
              <div className='flex gap-3'>
                {['Visa', 'MC', 'Amex', 'PayPal'].map((card) => (
                  <div
                    key={card}
                    className='w-16 h-10 bg-primary-foreground/10 rounded flex items-center justify-center border border-primary-foreground/20'
                  >
                    <span className='text-xs text-primary-foreground/60 uppercase tracking-wider'>
                      {card}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Links */}
            <div className='flex items-center gap-8'>
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookies Policy', href: '/cookies' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className='text-base text-primary-foreground/60 hover:text-primary-foreground/80 transition-colors'
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className='bg-secondary py-8 mt-14'>
        <div className='container-custom'>
          <p className='text-center text-base text-secondary-foreground/60'>
            © {new Date().getFullYear()} SAFARI Perfumes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
