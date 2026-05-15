'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface OrderItem {
  name: string
  price: number
  quantity: number
  size: string
  image?: string
}

interface ShippingAddress {
  firstName?: string
  lastName?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

interface OrderData {
  id: string
  orderNumber: string
  customerName: string
  status: string
  trackingNumber?: string | null
  shippedAt?: string | null
  estimatedDelivery?: string | null
  shippingAddress: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  createdAt: string
}

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered']

function getTimeline(status: string) {
  return STATUS_ORDER.map((s, i) => {
    const currentIndex = STATUS_ORDER.indexOf(status)
    return {
      status: s,
      completed: i < currentIndex || status === 'delivered',
      current: s === status,
    }
  })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TrackPage() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrder = async (orderNumber: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/by-number/${orderNumber}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        setError('Order not found. Please check your order number.')
        setOrder(null)
      }
    } catch {
      setError('Failed to load order. Please try again.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const orderParam = searchParams.get('order')
    if (orderParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderId(orderParam)
      fetchOrder(orderParam)
    }
  }, [searchParams])

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderId.trim()) {
      fetchOrder(orderId.trim())
    }
  }

  const timeline = order ? getTimeline(order.status) : []

  const statusLabel = order?.status
    ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
    : ''

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
            {!order && !loading ? (
              <>
                <h2 className='text-2xl font-semibold text-foreground mb-4 text-center'>Enter Order Details</h2>
                <p className='text-muted-foreground text-center mb-8'>
                  Enter your order number to track your shipment.
                </p>
                <form onSubmit={handleTrack} className='max-w-md mx-auto'>
                  <div className='mb-6 space-y-2'>
                    <label className='text-sm text-muted-foreground'>Order Number</label>
                    <Input
                      type='text'
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder='SAF-XXXX-XXXX'
                      required
                      className='text-center text-lg tracking-wider'
                    />
                  </div>
                  {error && (
                    <p className='text-destructive text-sm text-center mb-4'>{error}</p>
                  )}
                  <Button type='submit' disabled={loading} className='w-full'>
                    {loading ? 'Tracking...' : 'Track Order'}
                  </Button>
                </form>
                <div className='mt-8 pt-8 border-t border-border text-center'>
                  <p className='text-muted-foreground text-sm'>Need help?</p>
                  <Link href='/contact' className='text-primary hover:underline'>Contact Support</Link>
                </div>
              </>
            ) : loading ? (
              <div className='text-center py-12'>
                <p className='text-muted-foreground'>Loading order...</p>
              </div>
            ) : order ? (
              <div>
                <div className='flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-border'>
                  <div>
                    <span className='text-muted-foreground text-sm'>Order Number</span>
                    <p className='text-foreground text-xl font-semibold tracking-wider'>{order.orderNumber}</p>
                  </div>
                  <div className='text-right'>
                    <span className='text-muted-foreground text-sm'>Status</span>
                    <p className={`font-semibold ${
                      order.status === 'delivered' ? 'text-green-600' :
                      order.status === 'shipped' ? 'text-primary' :
                      order.status === 'cancelled' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}>{statusLabel}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className='mb-12'>
                  <h3 className='text-foreground font-semibold mb-6'>Tracking Progress</h3>
                  <div className='relative'>
                    <div className='absolute left-4 top-0 bottom-0 w-0.5 bg-border' />
                    <div
                      className='absolute left-4 top-0 w-0.5 bg-primary transition-all duration-500'
                      style={{ height: `${(timeline.filter(t => t.completed || t.current).length / timeline.length) * 100}%` }}
                    />
                    <div className='space-y-8'>
                      {timeline.map((event, index) => (
                        <div key={index} className='relative flex items-start gap-6 pl-12'>
                          <div
                            className={`absolute left-2 w-4 h-4 rounded-full transition-all duration-300 ${
                              event.completed || event.current
                                ? 'bg-primary'
                                : 'bg-border'
                            } ${event.current ? 'ring-4 ring-primary/30' : ''}`}
                          />
                          <div className='flex-1'>
                            <p className={`font-semibold ${
                              event.completed || event.current ? 'text-foreground' : 'text-muted-foreground/40'
                            }`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='space-y-4'>
                    <div>
                      <h3 className='text-foreground font-semibold mb-4'>Shipping Address</h3>
                      <p className='text-muted-foreground'>
                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                      </p>
                      <p className='text-muted-foreground'>{order.shippingAddress?.address1}</p>
                      {order.shippingAddress?.address2 && (
                        <p className='text-muted-foreground'>{order.shippingAddress?.address2}</p>
                      )}
                      <p className='text-muted-foreground'>
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                      </p>
                    </div>
                    {order.trackingNumber && (
                      <div>
                        <span className='text-muted-foreground text-sm'>Tracking Number</span>
                        <p className='text-foreground font-mono text-lg'>{order.trackingNumber}</p>
                      </div>
                    )}
                    {order.estimatedDelivery && (
                      <div>
                        <span className='text-muted-foreground text-sm'>Estimated Delivery</span>
                        <p className='text-foreground font-medium'>{formatDate(order.estimatedDelivery)}</p>
                      </div>
                    )}
                    <div>
                      <span className='text-muted-foreground text-sm'>Order Placed</span>
                      <p className='text-foreground'>{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-foreground font-semibold mb-4'>Order Summary</h3>
                    <div className='space-y-2 text-muted-foreground'>
                      {order.items.map((item, i) => (
                        <div key={i} className='flex justify-between text-sm'>
                          <span>{item.name} ({item.size}) &times; {item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className='pt-2 border-t border-border' />
                      <div className='flex justify-between text-sm'>
                        <span>Subtotal</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span>Shipping</span>
                        <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span>Tax</span>
                        <span>${order.tax.toFixed(2)}</span>
                      </div>
                      <div className='flex justify-between font-medium text-lg text-foreground pt-2 border-t border-border'>
                        <span>Total</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mt-8 pt-8 border-t border-border flex flex-wrap gap-4'>
                  <Button variant="outline" onClick={() => { setOrder(null); setError(''); }}>
                    Track Another Order
                  </Button>
                  <Link href='/contact'>
                    <Button>Need Help?</Button>
                  </Link>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </section>
    </>
  )
}
