'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DEFAULT_FOOTER, type FooterContent } from '@/lib/homepage-content'

interface FooterProps {
  content?: FooterContent
}

export default function Footer({ content = DEFAULT_FOOTER }: FooterProps) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      })
      if (res.ok) {
        setSubscribed(true)
        setEmail('')
      } else {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }
  return (
    <footer className='bg-[#050505] text-[#9a958d] pb-0'>
      <div className='gold-divider' aria-hidden='true' />
      <div className='container-custom py-16 md:py-24'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-14 lg:gap-16 mb-20'>
          {/* Column 1: Brand & About */}
          <div className='lg:col-span-1'>
            <Link href='/' className='inline-block mb-8'>
              <h2 className='text-2xl md:text-3xl font-serif font-bold tracking-wide text-[#B6965D]'>
                {content.brandName}
              </h2>
            </Link>
            <p className='text-[#9a958d] text-base leading-relaxed mb-8 max-w-xs'>
              {content.about}
            </p>
            <Button variant="link" className="p-0 h-auto text-[#9a958d] hover:text-[#B6965D] gap-2 group">
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

            <div className='mt-10 pt-10 border-t border-[#B6965D]/20'>
              <h4 className='text-[#B6965D] font-semibold text-base tracking-wide mb-6'>
                Contact Us
              </h4>
              <ul className='space-y-5 text-base'>
                <li>
                  <a
                    href={`mailto:${content.contactEmail}`}
                    className='hover:text-[#B6965D] transition-colors flex items-center gap-3 min-h-[44px]'
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
                    {content.contactEmail}
                  </a>
                </li>
                {content.phones.map((phone) => (
                  <li key={phone.tel}>
                    <a
                      href={`tel:${phone.tel}`}
                      className='hover:text-[#B6965D] transition-colors flex items-center gap-3 min-h-[44px]'
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
                      {phone.display}
                    </a>
                  </li>
                ))}
                <li className='leading-relaxed'>
                  {content.addressLines.map((line, index) => (
                    <React.Fragment key={line}>
                      {index > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </li>
              </ul>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className='text-[#B6965D] font-semibold text-sm uppercase tracking-[0.2em] mb-8'>
              Quick Links
            </h4>
            <ul className='space-y-5'>
              {[
                { label: 'Shop All', href: '/shop' },
{ label: 'New Arrivals', href: '/shop?isNew=true' },
{ label: 'Best Sellers', href: '/shop?isBestseller=true' },
                { label: 'Collections', href: '/collections' },
                { label: 'Bundles & Gift Sets', href: '/bundles' },
                { label: 'Fragrance Guides', href: '/blog' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='inline-flex items-center min-h-[44px] text-base text-[#9a958d] hover:text-[#B6965D] transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className='text-[#B6965D] font-semibold text-sm uppercase tracking-[0.2em] mb-8'>
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
                    className='inline-flex items-center min-h-[44px] text-base text-[#9a958d] hover:text-[#B6965D] transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div>
            <h4 className='text-[#B6965D] font-bold text-xl mb-6'>
              {content.newsletterHeading}
            </h4>
            <p className='text-[#9a958d] text-base mb-8'>
              {content.newsletterText}
            </p>
            <form onSubmit={handleSubscribe} className='mb-8 space-y-4'>
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                required
                className='h-14 bg-[#0e0e0e] text-white placeholder:text-[#6a675f] border-[#2a2a2a]'
                aria-label='Email address for newsletter'
              />
              <Button
                type='submit'
                disabled={subscribed}
                className='w-full h-14 font-semibold uppercase tracking-wider'
                variant='default'
              >
                {subscribed ? 'Subscribed!' : content.newsletterButton}
              </Button>
            </form>
            {subscribed && (
              <p className='text-green-500 text-sm mt-2'>Thanks for subscribing!</p>
            )}
            {error && <p className='text-red-400 text-sm mt-2'>{error}</p>}

<div className='flex gap-4'>
              {content.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-[#B6965D]/25 flex items-center justify-center hover:border-[#B6965D] hover:bg-white/5 transition-all group"
                  aria-label={social.label}
                >
                  <img
                    src={social.icon}
                    alt={social.label}
                    width={20}
                    height={20}
                    className="w-5 h-5 invert opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className='pt-14 border-t border-[#B6965D]/20'>
          <div className='flex flex-col lg:flex-row items-center justify-between gap-8'>
            {/* Payment Methods */}
            <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-6'>
              <span className='text-base text-[#9a958d] tracking-wide'>
                We Accept:
              </span>
              <div className='flex gap-2 sm:gap-3'>
                {['Visa', 'MC', 'Amex', 'PayPal'].map((card) => (
                  <div
                    key={card}
                    className='w-14 h-9 sm:w-16 sm:h-10 bg-white/5 rounded flex items-center justify-center border border-[#2a2a2a]'
                  >
                    <span className='text-[11px] sm:text-xs text-[#9a958d] uppercase tracking-wider'>
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
                  className='inline-flex items-center min-h-[44px] text-base text-[#9a958d] hover:text-[#B6965D] transition-colors'
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className='bg-[#020202] py-8 border-t border-[#B6965D]/10'>
        <div className='container-custom'>
          <p className='text-center text-base text-[#6a675f]'>
            © {new Date().getFullYear()} {content.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}