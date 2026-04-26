'use client'

import React, { useState } from 'react'
import Link from 'next/link'

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
          <div className='absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D]' />
        </div>
        <div className='relative z-10 text-center'>
          <h1 className='text-4xl md:text-6xl font-semibold text-white mb-4'>Track Your Order</h1>
          <p className='text-white/60 text-lg'>
            <Link href='/' className='hover:text-white transition-colors'>Home</Link> / Track Order
          </p>
        </div>
      </section>

      <section className='section-padding bg-[#0D0D0D]'>
        <div className='container-custom max-w-4xl'>
          <div className='bg-[#1A1A1A] rounded-2xl p-8 md:p-12'>
            {!order ? (
              <>
                <h2 className='text-2xl font-semibold text-white mb-4 text-center'>Enter Order Details</h2>
                <p className='text-white/60 text-center mb-8'>Find your order number in your confirmation email.</p>
                <form onSubmit={handleTrack} className='max-w-md mx-auto'>
                  <div className='mb-6'>
                    <label className='text-white/60 text-sm block mb-2'>Order ID</label>
                    <input
                      type='text'
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder='SAF-2024-XXXX'
                      required
                      className='w-full px-4 py-4 bg-[#0D0D0D] border border-[#2D2D2D] text-white rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors text-center text-lg tracking-wider'
                    />
                  </div>
                  <div className='mb-6'>
                    <label className='text-white/60 text-sm block mb-2'>Email</label>
                    <input
                      type='email'
                      placeholder='your@email.com'
                      required
                      className='w-full px-4 py-4 bg-[#0D0D0D] border border-[#2D2D2D] text-white rounded-xl focus:outline-none focus:border-[#C9A962] transition-colors'
                    />
                  </div>
                  <button type='submit' disabled={loading} className='btn-primary w-full'>
                    {loading ? 'Tracking...' : 'Track Order'}
                  </button>
                </form>
                <div className='mt-8 pt-8 border-t border-[#2D2D2D] text-center'>
                  <p className='text-white/60 text-sm'>Need help?</p>
                  <Link href='/contact' className='text-[#C9A962] hover:underline'>Contact Support</Link>
                </div>
              </>
            ) : (
              <div>
                <div className='flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-[#2D2D2D]'>
                  <div>
                    <span className='text-white/60 text-sm'>Order ID</span>
                    <p className='text-white text-xl font-semibold tracking-wider'>{order.id}</p>
                  </div>
                  <div className='text-right'>
                    <span className='text-white/60 text-sm'>Status</span>
                    <p className='text-[#C9A962] font-semibold'>{order.status}</p>
                  </div>
                </div>

                <div className='mb-12'>
                  <h3 className='text-white font-semibold mb-6'>Tracking Progress</h3>
                  <div className='relative'>
                    <div className='absolute left-4 top-0 bottom-0 w-0.5 bg-[#2D2D2D]' />
                    <div className='absolute left-4 top-0 w-0.5 bg-[#C9A962] h-[60%]' />
                    <div className='space-y-8'>
                      {order.timeline.map((event: any, index: number) => (
                        <div key={index} className='relative flex items-start gap-6 pl-12'>
                          <div className={`absolute left-2 w-4 h-4 rounded-full ${event.completed ? 'bg-[#C9A962]' : 'bg-[#2D2D2D]'} ${event.current ? 'ring-4 ring-[#C9A962]/30' : ''}`} />
                          <div className='flex-1'>
                            <p className={`font-semibold ${event.completed ? 'text-white' : 'text-white/40'}`}>{event.status}</p>
                            <p className='text-white/60 text-sm'>
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
                    <h3 className='text-white font-semibold mb-4'>Shipping Address</h3>
                    <p className='text-white/60'>{order.shippingAddress}</p>
                    <div className='mt-4'>
                      <span className='text-white/60 text-sm'>Tracking Number</span>
                      <p className='text-white font-mono'>{order.trackingNumber}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold mb-4'>Order Summary</h3>
                    <div className='space-y-2 text-white/60'>
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className='flex justify-between'>
                          <span>{item.name} ({item.size}) × {item.quantity}</span>
                          <span>{item.price}</span>
                        </div>
                      ))}
                      <div className='pt-2 mt-4 border-t border-[#2D2D2D] flex justify-between text-white font-semibold'>
                        <span>Total</span>
                        <span>{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mt-8 pt-8 border-t border-[#2D2D2D] flex flex-wrap gap-4'>
                  <button onClick={() => setOrder(null)} className='btn-outline'>
                    Track Another Order
                  </button>
                  <Link href='/contact' className='btn-primary'>
                    Need Help?
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}