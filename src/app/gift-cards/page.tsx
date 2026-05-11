'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

const denominations = [25, 50, 100, 150, 200, 500]

export default function GiftCardsPage() {
  const [selected, setSelected] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [recipient, setRecipient] = useState({ name: '', email: '', message: '' })
  const [addedToCart, setAddedToCart] = useState(false)

  const handleAddToCart = () => {
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  return (
    <>
      <section className='relative h-[40vh] flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-b from-background via-card to-background' />
        </div>
        <div className='relative z-10 text-center'>
          <h1 className='text-4xl md:text-6xl font-semibold text-primary-foreground mb-4'>Gift Cards</h1>
          <p className='text-muted-foreground text-lg'>
            <Link href='/' className='hover:text-foreground transition-colors'>Home</Link> / Gift Cards
          </p>
        </div>
      </section>

      <section className='section-padding bg-background'>
        <div className='container-custom'>
          <div className='max-w-5xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
              <div>
                <div className='bg-gradient-to-br from-primary to-amber-800 rounded-2xl p-1 aspect-[4/3] flex items-center justify-center'>
                  <div className='bg-background rounded-xl w-full h-full flex flex-col items-center justify-center p-8 text-center'>
                    <div className='text-5xl font-bold text-primary mb-4'>SAFARI</div>
                    <div className='text-3xl font-semibold text-foreground mb-2'>GIFT CARD</div>
                    <div className='text-muted-foreground mb-6'>The Perfect Scent for Any Occasion</div>
                    <div className='w-32 h-12 bg-card rounded flex items-center justify-center'>
                      <svg className='w-8 h-8 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                      </svg>
                    </div>
                  </div>
                </div>
                <Card className='mt-8 p-8'>
                  <h3 className='text-xl font-semibold text-foreground mb-4'>How It Works</h3>
                  <div className='space-y-4'>
                    {[
                      { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Purchase a digital gift card in any amount' },
                      { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', text: 'Sent instantly via email to recipient' },
                      { icon: 'M3 10h18M7 15h1m4 0h1m-7-4v8m-7 4h14', text: 'Redeemable on any product in our store' },
                    ].map((item, i) => (
                      <div key={i} className='flex items-center gap-4'>
                        <div className='w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0'>
                          <svg className='w-5 h-5 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d={item.icon} />
                          </svg>
                        </div>
                        <p className='text-muted-foreground'>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div>
                <Card className='p-8'>
                  <h2 className='text-2xl font-semibold text-foreground mb-6'>Choose Amount</h2>
                  <div className='grid grid-cols-3 gap-4 mb-6'>
                    {denominations.map((amt) => (
                      <Button
                        key={amt}
                        variant={selected === amt && !customAmount ? "default" : "outline"}
                        onClick={() => { setSelected(amt); setCustomAmount('') }}
                        className='py-4 text-lg font-semibold'
                      >
                        ${amt}
                      </Button>
                    ))}
                  </div>
                  <div className='mb-8 space-y-2'>
                    <label className='text-sm text-muted-foreground'>Or Enter Custom Amount</label>
                    <Input
                      type='number'
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelected(0) }}
                      placeholder='Enter amount'
                      min='10'
                      max='1000'
                      className='text-xl text-center'
                    />
                  </div>

                  <h3 className='text-xl font-semibold text-foreground mb-4'>Recipient Details</h3>
                  <form className='space-y-4 mb-6'>
                    <div className='space-y-2'>
                      <label className='text-sm text-muted-foreground'>Recipient Name</label>
                      <Input
                        type='text'
                        value={recipient.name}
                        onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                        placeholder='John Doe'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm text-muted-foreground'>Recipient Email</label>
                      <Input
                        type='email'
                        value={recipient.email}
                        onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                        placeholder='recipient@email.com'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm text-muted-foreground'>Personal Message (optional)</label>
                      <Textarea
                        value={recipient.message}
                        onChange={(e) => setRecipient({ ...recipient, message: e.target.value })}
                        placeholder='Add a personal note...'
                        rows={3}
                        className='resize-none'
                      />
                    </div>
                  </form>

                  <div className='pt-6 border-t border-border'>
                    <div className='flex items-center justify-between mb-6'>
                      <span className='text-foreground'>Total</span>
                      <span className='text-3xl font-bold text-primary'>
                        ${customAmount || selected}
                      </span>
                    </div>
                    <Button
                      onClick={handleAddToCart}
                      className='w-full'
                    >
                      {addedToCart ? 'Added to Cart!' : 'Add Gift Card to Cart'}
                    </Button>
                    <p className='text-muted-foreground/60 text-sm text-center mt-4'>
                      Digital gift cards are delivered via email within minutes of purchase.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
