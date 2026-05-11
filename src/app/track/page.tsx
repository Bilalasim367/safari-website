'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TrackPage() {
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setOrder({
        id: orderId || 'SAF-2024-1847',
        status: 'Shipped',
        estimatedDelivery: 'March 18, 2024',
        trackingNumber: '1Z999AA10123456784',
        timeline: [
          { date: 'March 15, 2024', time: '2:30 PM', status: 'Order Placed', completed: true },
          { date: 'March 15, 2024', time: '4:15 PM', status: 'Payment Confirmed', completed: true },
          { date: 'March 16, 2024', time: '9:00 AM', status: 'Order Processed', completed: true },
          { date: 'March 16, 2024', time: '12:45 PM', status: 'Shipped', completed: true, current: true },
          { date: 'March 18, 2024', time: 'Est. 10:00 AM', status: 'Delivered', completed: false },
        ],
        shippingAddress: '123 Luxury Lane, New York, NY 10001',
        items: [
          { name: 'Midnight Oud', size: '100ml', price: '$195.00', quantity: 1 },
          { name: 'Rose Essence', size: '50ml', price: '$50.00', quantity: 1 },
        ],
        total: '$245.00',
      })
      setLoading(false)
    }, 1000)
  }

  return (
    <>
      <section className='relative h-[40vh] flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-b from-background via-card to-background' />
        </div>
        <div className='relative z-10 text-center'>
          <h1 className='text-4xl md:text-6xl font-semibold text-primary-foreground mb-4'>Track Your Order</h1>
          <p className='text-muted-foreground text-lg'>
            <Link href='/' className='hover:text-foreground transition-colors'>Home</Link> / Track Order
          </p>
        </div>
      </section>

      <section className='section-padding bg-background'>
        <div className='container-custom max-w-4xl'>
          <Card className='p-8 md:p-12'>
            {!order ? (
              <>
                <h2 className='text-2xl font-semibold text-foreground mb-4 text-center'>Enter Order Details</h2>
                <p className='text-muted-foreground text-center mb-8'>Find your order number in your confirmation email.</p>
                <form onSubmit={handleTrack} className='max-w-md mx-auto'>
                  <div className='mb-6 space-y-2'>
                    <label className='text-sm text-muted-foreground'>Order ID</label>
                    <Input
                      type='text'
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder='SAF-2024-XXXX'
                      required
                      className='text-center text-lg tracking-wider'
                    />
                  </div>
                  <div className='mb-6 space-y-2'>
                    <label className='text-sm text-muted-foreground'>Email</label>
                    <Input
                      type='email'
                      placeholder='your@email.com'
                      required
                    />
                  </div>
                  <Button type='submit' disabled={loading} className='w-full'>
                    {loading ? 'Tracking...' : 'Track Order'}
                  </Button>
                </form>
                <div className='mt-8 pt-8 border-t border-border text-center'>
                  <p className='text-muted-foreground text-sm'>Need help?</p>
                  <Link href='/contact' className='text-primary hover:underline'>Contact Support</Link>
                </div>
              </>
            ) : (
              <div>
                <div className='flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-border'>
                  <div>
                    <span className='text-muted-foreground text-sm'>Order ID</span>
                    <p className='text-foreground text-xl font-semibold tracking-wider'>{order.id}</p>
                  </div>
                  <div className='text-right'>
                    <span className='text-muted-foreground text-sm'>Status</span>
                    <p className='text-primary font-semibold'>{order.status}</p>
                  </div>
                </div>

                <div className='mb-12'>
                  <h3 className='text-foreground font-semibold mb-6'>Tracking Progress</h3>
                  <div className='relative'>
                    <div className='absolute left-4 top-0 bottom-0 w-0.5 bg-border' />
                    <div className='absolute left-4 top-0 w-0.5 bg-primary h-[60%]' />
                    <div className='space-y-8'>
                      {order.timeline.map((event: any, index: number) => (
                        <div key={index} className='relative flex items-start gap-6 pl-12'>
                          <div className={`absolute left-2 w-4 h-4 rounded-full ${event.completed ? 'bg-primary' : 'bg-border'} ${event.current ? 'ring-4 ring-primary/30' : ''}`} />
                          <div className='flex-1'>
                            <p className={`font-semibold ${event.completed ? 'text-foreground' : 'text-muted-foreground/40'}`}>{event.status}</p>
                            <p className='text-muted-foreground text-sm'>
                              {event.date} • {event.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div>
                    <h3 className='text-foreground font-semibold mb-4'>Shipping Address</h3>
                    <p className='text-muted-foreground'>{order.shippingAddress}</p>
                    <div className='mt-4'>
                      <span className='text-muted-foreground text-sm'>Tracking Number</span>
                      <p className='text-foreground font-mono'>{order.trackingNumber}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className='text-foreground font-semibold mb-4'>Order Summary</h3>
                    <div className='space-y-2 text-muted-foreground'>
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className='flex justify-between'>
                          <span>{item.name} ({item.size}) × {item.quantity}</span>
                          <span>{item.price}</span>
                        </div>
                      ))}
                      <div className='pt-2 mt-4 border-t border-border flex justify-between text-foreground font-semibold'>
                        <span>Total</span>
                        <span>{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mt-8 pt-8 border-t border-border flex flex-wrap gap-4'>
                  <Button variant="outline" onClick={() => setOrder(null)}>
                    Track Another Order
                  </Button>
                  <Link href='/contact'>
                    <Button>Need Help?</Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>
    </>
  )
}
