import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ReturnsPage() {
  return (
    <>
      <section className='relative h-[40vh] flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-b from-background via-card to-background' />
        </div>
        <div className='relative z-10 text-center'>
          <h1 className='text-4xl md:text-6xl font-semibold text-primary-foreground mb-4'>Returns & Exchange</h1>
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
                We want you to be completely satisfied with your purchase. If for any reason you're not happy with your fragrance, 
                we offer a hassle-free return and exchange policy.
              </p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <Card className='p-6'>
                  <div className='w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4'>
                    <svg className='w-6 h-6 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                    </svg>
                  </div>
                  <h3 className='text-foreground font-semibold mb-2'>30-Day Returns</h3>
                  <p className='text-muted-foreground text-sm'>Return within 30 days of purchase for a full refund. Item must be unused and in original packaging.</p>
                </Card>
                <Card className='p-6'>
                  <div className='w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4'>
                    <svg className='w-6 h-6 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4' />
                    </svg>
                  </div>
                  <h3 className='text-foreground font-semibold mb-2'>Free Exchanges</h3>
                  <p className='text-muted-foreground text-sm'>Exchange for a different size or scent at no additional cost. One exchange per order.</p>
                </Card>
              </div>
            </Card>

            <Card className='p-8 md:p-12 mb-12'>
              <h2 className='text-2xl font-semibold text-foreground mb-6'>How to Return</h2>
              <div className='space-y-6'>
                {[
                  { step: '01', title: 'Request a Return', desc: 'Contact our support team via email or the returns form below to initiate your return request.' },
                  { step: '02', title: 'Receive Return Label', desc: 'We\'ll email you a prepaid shipping label and return instructions within 24 hours.' },
                  { step: '03', title: 'Ship Your Item', desc: 'Pack the item securely in its original packaging and drop it off at any authorized shipping location.' },
                  { step: '04', title: 'Get Your Refund', desc: 'Once received, your refund will be processed within 5-7 business days to your original payment method.' },
                ].map((item) => (
                  <div key={item.step} className='flex gap-6'>
                    <div className='w-14 h-14 bg-primary rounded-full flex items-center justify-center flex-shrink-0'>
                      <span className='text-primary-foreground font-bold text-lg'>{item.step}</span>
                    </div>
                    <div>
                      <h3 className='text-foreground font-semibold mb-1'>{item.title}</h3>
                      <p className='text-muted-foreground'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className='p-8 md:p-12'>
              <h2 className='text-2xl font-semibold text-foreground mb-6'>Request a Return</h2>
              <form className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <label className='text-sm text-muted-foreground'>Order ID</label>
                    <Input
                      type='text'
                      placeholder='SAF-2024-XXXX'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm text-muted-foreground'>Email</label>
                    <Input
                      type='email'
                      placeholder='your@email.com'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm text-muted-foreground'>Reason for Return</label>
                  <select className='flex h-11 w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
                    <option value=''>Select a reason</option>
                    <option value='wrong-item'>Wrong item received</option>
                    <option value='defective'>Defective/Damaged product</option>
                    <option value='not-match'>Product not as described</option>
                    <option value='changed-mind'>Changed my mind</option>
                    <option value='other'>Other</option>
                  </select>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm text-muted-foreground'>Additional Details</label>
                  <Textarea
                    rows={4}
                    placeholder='Please describe your return request...'
                    className='resize-none'
                  />
                </div>
                <Button type='button'>
                  Submit Return Request
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
