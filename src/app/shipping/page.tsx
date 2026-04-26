import React from 'react'
import Link from 'next/link'

export default function ShippingPage() {
  return (
    <>
      <section className='relative h-[40vh] flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D]' />
        </div>
        <div className='relative z-10 text-center'>
          <h1 className='text-4xl md:text-6xl font-semibold text-white mb-4'>Shipping & Delivery</h1>
          <p className='text-white/60 text-lg'>
            <Link href='/' className='hover:text-white transition-colors'>Home</Link> / Shipping
          </p>
        </div>
      </section>

      <section className='section-padding bg-[#0D0D0D]'>
        <div className='container-custom'>
          <div className='max-w-4xl mx-auto'>
            <div className='bg-[#1A1A1A] rounded-2xl p-8 md:p-12 mb-12'>
              <h2 className='text-2xl font-semibold text-white mb-6'>Shipping Options</h2>
              <div className='space-y-4'>
                {[
                  { method: 'Standard Shipping', time: '5-7 business days', price: 'Free', note: 'On all orders' },
                  { method: 'Express Shipping', time: '2-3 business days', price: '$12.99', note: 'Order before 2PM EST' },
                  { method: 'Next Day Delivery', time: '1 business day', price: '$24.99', note: 'Order before 2PM EST' },
                ].map((option, i) => (
                  <div key={i} className='bg-[#0D0D0D] rounded-xl p-6 flex flex-wrap items-center justify-between gap-4 border border-[#2D2D2D]'>
                    <div>
                      <h3 className='text-white font-semibold'>{option.method}</h3>
                      <p className='text-white/60 text-sm'>{option.time}</p>
                    </div>
                    <div className='text-right'>
                      <span className='text-[#C9A962] font-semibold text-lg'>{option.price}</span>
                      <p className='text-white/40 text-sm'>{option.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-[#1A1A1A] rounded-2xl p-8 md:p-12 mb-12'>
              <h2 className='text-2xl font-semibold text-white mb-6'>Where We Ship</h2>
              <p className='text-white/70 mb-6'>We offer worldwide shipping to bring our fragrances to your door.</p>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {['United States', 'Canada', 'United Kingdom', 'European Union', 'Australia', 'Japan', 'UAE', 'Singapore'].map((country) => (
                  <div key={country} className='bg-[#0D0D0D] rounded-lg p-4 text-center border border-[#2D2D2D]'>
                    <span className='text-white/80 text-sm'>{country}</span>
                  </div>
                ))}
              </div>
              <p className='text-white/40 text-sm mt-4'>Shipping to other countries available upon request. Contact us for details.</p>
            </div>

            <div className='bg-[#1A1A1A] rounded-2xl p-8 md:p-12 mb-12'>
              <h2 className='text-2xl font-semibold text-white mb-6'>Delivery Information</h2>
              <div className='space-y-6'>
                <div className='flex gap-4'>
                  <div className='w-10 h-10 bg-[#C9A962]/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <svg className='w-5 h-5 text-[#C9A962]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944v10.03c0 6.498-5.38 11.775-12 11.775-1.478 0-2.914-.246-4.245-.693v-10.03c6.498.447 11.775 5.277 11.775 11.775 0 5.277-5.277 11.775-11.775 11.775-6.498 0-11.775-5.277-11.775-11.775v-10.03c2.914.447 5.277.693 7.863.693 6.62 0 12-5.277 12-11.775 0-6.498-5.38-11.775-12-11.775-1.478 0-2.914.246-4.245.693' />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold mb-1'>Secure Packaging</h3>
                    <p className='text-white/60 text-sm'>Every fragrance is carefully wrapped and sealed to ensure it arrives in perfect condition.</p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='w-10 h-10 bg-[#C9A962]/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <svg className='w-5 h-5 text-[#C9A962]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold mb-1'>Tracking Included</h3>
                    <p className='text-white/60 text-sm'>All orders include real-time tracking so you can follow your package every step of the way.</p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='w-10 h-10 bg-[#C9A962]/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <svg className='w-5 h-5 text-[#C9A962]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold mb-1'>Weekend Delivery</h3>
                    <p className='text-white/60 text-sm'>Express and Next Day options include Saturday delivery in select areas.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-[#1A1A1A] rounded-2xl p-8 md:p-12'>
              <h2 className='text-2xl font-semibold text-white mb-6'>Free Shipping Threshold</h2>
              <div className='bg-[#0D0D0D] rounded-xl p-8 text-center border border-[#C9A962]/30'>
                <p className='text-white/60 mb-2'>Spend over</p>
                <p className='text-5xl md:text-6xl font-bold text-[#C9A962] mb-2'>$75</p>
                <p className='text-white/60'>and get FREE Standard Shipping!</p>
              </div>
              <div className='mt-6 text-center'>
                <Link href='/shop' className='btn-primary'>
                  Start Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}