'use client'

import React, { useState } from 'react'
import Link from 'next/link'

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
    <footer className='bg-black text-gray-300 py-20 md:py-28'>
      <div className='container-custom'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-14 lg:gap-16 mb-20'>
          {/* Column 1: Brand & About */}
          <div className='lg:col-span-1'>
            <Link href='/' className='inline-block mb-8'>
              <h2 className='text-2xl md:text-3xl font-serif font-bold tracking-wide'>
                <span className='text-white'>SAFARI</span>
              </h2>
            </Link>
            <p className='text-gray-400 text-base leading-relaxed mb-8 max-w-xs'>
              Crafting luxury fragrances that capture the essence of elegance
              and sophistication since 2015. Every scent tells a story of
              craftsmanship and passion.
            </p>
            <Link
              href='/about'
              className='text-white text-base hover:text-gray-300 transition-colors'
            >
              Read More →
            </Link>

            <div className='mt-10 pt-10 border-t border-gray-800'>
              <h4 className='text-white font-semibold text-base tracking-wide mb-6'>
                Contact Us
              </h4>
              <ul className='space-y-5 text-base'>
                <li>
                  <a
                    href='mailto:hello@SAFARI.com'
                    className='hover:text-white transition-colors flex items-center gap-3'
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
                    hello@SAFARI.com
                  </a>
                </li>
                <li>
                  <a
                    href='tel:+15551234567'
                    className='hover:text-white transition-colors flex items-center gap-3'
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
                    +1 (555) 123-4567
                  </a>
                </li>
                <li className='leading-relaxed'>
                  123 Luxury Lane
                  <br />
                  New York, NY 10001
                </li>
              </ul>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className='text-white font-semibold text-base tracking-wide mb-8'>
              Quick Links
            </h4>
            <ul className='space-y-5'>
              {[
                { label: 'Shop All', href: '/shop' },
                { label: 'New Arrivals', href: '/shop?filter=new' },
                { label: 'Best Sellers', href: '/shop?filter=bestseller' },
                { label: 'Collections', href: '/collections' },
                { label: 'Bundles & Gift Sets', href: '/shop?filter=bundles' },
                { label: 'Gift Cards', href: '/gift-cards' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-base text-gray-400 hover:text-white transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className='text-white font-semibold text-base tracking-wide mb-8'>
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
                    className='text-base text-gray-400 hover:text-white transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div>
            <h4 className='text-white font-bold text-xl mb-6'>
              Stay Connected & Save
            </h4>
            <p className='text-gray-400 text-base mb-8'>
              Sign up for exclusive updates & offers, and get 10% off your first
              order!
            </p>
            <form onSubmit={handleSubscribe} className='mb-8'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                required
                className='w-full h-14 px-5 mb-4 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors'
                aria-label='Email address for newsletter'
              />
              <button
                type='submit'
                disabled={subscribed}
                className='w-full h-14 bg-white text-black font-semibold uppercase text-sm tracking-wider hover:bg-gray-200 transition-colors disabled:opacity-70'
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
            {subscribed && (
              <p className='text-green-500 text-sm mt-2'>Thanks for subscribing!</p>
            )}

            <div className='flex gap-4'>
              {[
                {
                  name: 'Instagram',
                  icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z',
                },
                {
                  name: 'Facebook',
                  icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                },
                {
                  name: 'Twitter',
                  icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
                },
                {
                  name: 'YouTube',
                  icon: 'M23.498 6.187a3.015 3.015 0 00-2.131-2.227C19.552 3.67 12 3.67 12 3.67s-7.552 0-9.367.29a3.015 3.015 0 00-2.131 2.227C0 8.775 0 12 0 12s0 3.225.962 5.813a3.015 3.015 0 002.131 2.227c1.815.29 9.367.29 9.367.29s7.552 0 9.367-.29a3.015 3.015 0 002.131-2.227C24 15.225 24 12 24 12s0-3.225-.962-5.813zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
                },
              ].map((social) => (
                <button
                  key={social.name}
                  onClick={() => alert('Coming soon!')}
                  className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:border-white hover:text-white transition-all cursor-not-allowed"
                  aria-label={`${social.name} - Coming soon`}
                >
                  <svg
                    className='w-5 h-5'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d={social.icon} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className='pt-14 border-t border-gray-800'>
          <div className='flex flex-col lg:flex-row items-center justify-between gap-8'>
            {/* Payment Methods */}
            <div className='flex items-center gap-6'>
              <span className='text-base text-gray-500 tracking-wide'>
                We Accept:
              </span>
              <div className='flex gap-3'>
                {['Visa', 'MC', 'Amex', 'PayPal'].map((card) => (
                  <div
                    key={card}
                    className='w-16 h-10 bg-gray-800 rounded flex items-center justify-center border border-gray-700'
                  >
                    <span className='text-xs text-gray-400 uppercase tracking-wider'>
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
                  className='text-base text-gray-500 hover:text-gray-300 transition-colors'
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className='bg-gray-950 py-8 mt-14'>
        <div className='container-custom'>
          <p className='text-center text-base text-gray-500'>
            © {new Date().getFullYear()} SAFARI Perfumes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
