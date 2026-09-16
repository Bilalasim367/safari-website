import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import ReturnsForm from '@/components/ReturnsForm'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Returns & Exchange | Safari Perfumes Pakistan',
  description: 'Easy returns, exchanges and cancellations. Raise a request within 3 days of delivery. Call +92 334 6322462 for urgent help.',
  alternates: { canonical: `${SITE_URL}/returns` },
}

export default function ReturnsPage() {
  return (
    <>
      <section className='relative h-[40vh] flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-b from-background via-card to-background' />
        </div>
        <div className='relative z-10 text-center px-4'>
          <h1 className='text-3xl md:text-6xl font-semibold text-primary-foreground mb-4'>Returns &amp; Exchange</h1>
          <p className='text-muted-foreground text-lg'>
            <Link href='/' className='hover:text-foreground transition-colors'>Home</Link> / Returns
          </p>
        </div>
      </section>

      <section className='section-padding bg-background'>
        <div className='container-custom'>
          <div className='max-w-4xl mx-auto'>
            <Card className='p-8 md:p-12 mb-12'>
              <h2 className='text-2xl font-semibold text-foreground mb-6'>Our Return Policy</h2>
              <p className='text-muted-foreground leading-relaxed mb-6'>
                We want you to be completely satisfied with your purchase. If for any reason you&apos;re not happy
                with your fragrance, you can request a return, exchange or cancellation using the form below.
              </p>

              <div className='bg-muted/60 rounded-xl p-4 mb-8 border border-border text-sm leading-relaxed text-muted-foreground'>
                <p className='font-medium text-foreground mb-2'>Please note before you raise a request:</p>
                <ul className='list-disc list-inside space-y-1.5'>
                  <li>Return / exchange requests must be raised <strong className='text-foreground'>within 3 days of delivery</strong>.</li>
                  <li>The item must be <strong className='text-foreground'>unused and in its original packaging</strong>.</li>
                  <li><strong className='text-foreground'>Shipping</strong> takes up to <strong className='text-foreground'>5 working days</strong> within Pakistan and up to <strong className='text-foreground'>20 working days</strong> internationally.</li>
                  <li>Orders can be <strong className='text-foreground'>cancelled within 24 hours</strong> of placing them.</li>
                </ul>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                <Card className='p-6'>
                  <div className='w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4'>
                    <svg className='w-6 h-6 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                    </svg>
                  </div>
                  <h3 className='text-foreground font-semibold mb-2'>3-Day Returns</h3>
                  <p className='text-muted-foreground text-sm'>
                    Request a return within 3 days of delivery for a refund. Item must be unused and in original
                    packaging. Approval is subject to quality check.
                  </p>
                </Card>
                <Card className='p-6'>
                  <div className='w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4'>
                    <svg className='w-6 h-6 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4' />
                    </svg>
                  </div>
                  <h3 className='text-foreground font-semibold mb-2'>Exchanges &amp; Cancellations</h3>
                  <p className='text-muted-foreground text-sm'>
                    Exchange for a different size or scent, or cancel your order within 24 hours of placing it.
                    Mention it in the form or call our support line.
                  </p>
                </Card>
              </div>

              <div className='mt-8 rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3'>
                <div className='w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0'>
                  <svg className='w-6 h-6 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                  </svg>
                </div>
                <div>
                  <p className='font-semibold text-foreground'>Need urgent help?</p>
                  <p className='text-sm text-muted-foreground'>
                    For complaints or urgent requests, call us at{' '}
                    <a href='tel:+923346322462' className='text-gold font-semibold hover:underline'>+92 334 6322462</a>.
                  </p>
                </div>
              </div>
            </Card>

            <Card className='p-8 md:p-12 mb-12'>
              <h2 className='text-2xl font-semibold text-foreground mb-6'>How It Works</h2>
              <div className='space-y-6'>
                {[
                  { step: '01', title: 'Raise a Request', desc: 'Submit the form below with your order details. Our team reviews every request within 24–48 hours.' },
                  { step: '02', title: 'Get Approval', desc: 'Once approved, we\'ll email you the return instructions and, for a return, the refund process.' },
                  { step: '03', title: 'Send / Send Back Item', desc: 'For exchanges, we dispatch the replacement once we receive the original. Shipping takes up to 5 working days (20 days international).' },
                  { step: '04', title: 'Refund Processed', desc: 'Refunds are processed to your original payment method once the returned item passes quality check.' },
                ].map((item) => (
                  <div key={item.step} className='flex gap-4 md:gap-6'>
                    <div className='w-12 h-12 md:w-14 md:h-14 bg-primary rounded-full flex items-center justify-center flex-shrink-0'>
                      <span className='text-primary-foreground font-bold text-base md:text-lg'>{item.step}</span>
                    </div>
                    <div>
                      <h3 className='text-foreground font-semibold mb-1'>{item.title}</h3>
                      <p className='text-muted-foreground text-sm md:text-base'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <ReturnsForm />
          </div>
        </div>
      </section>
    </>
  )
}