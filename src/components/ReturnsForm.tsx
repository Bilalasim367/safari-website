'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const REASONS = [
  { value: 'wrong-item', label: 'Wrong item received' },
  { value: 'defective', label: 'Defective / Damaged product' },
  { value: 'not-as-described', label: 'Product not as described' },
  { value: 'changed-mind', label: 'Changed my mind' },
  { value: 'too-large', label: 'Too large' },
  { value: 'too-small', label: 'Too small' },
  { value: 'other', label: 'Other' },
]

interface SubmittedInfo {
  requestId: string
  type: string
  email: string
}

export default function ReturnsForm() {
  const [type, setType] = useState<'return' | 'exchange'>('return')
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [productName, setProductName] = useState('')
  const [size, setSize] = useState('')
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<SubmittedInfo | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim() || customerName.trim().length < 2) {
      toast.error('Please enter your full name.')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid email address.')
      return
    }
    if (!productName.trim() || productName.trim().length < 2) {
      toast.error('Please enter the product name.')
      return
    }
    if (!reason) {
      toast.error('Please select a reason.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          customerName,
          email,
          phone,
          orderNumber,
          productName,
          size,
          reason,
          details,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Something went wrong. Please try again.')
        return
      }
      setSubmitted({ requestId: data.request.requestId, type: data.request.type, email: data.request.email })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className='p-8 md:p-12 text-center'>
        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
          <svg className='w-8 h-8 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        </div>
        <h2 className='text-2xl font-semibold text-foreground mb-3'>Request Received!</h2>
        <p className='text-muted-foreground leading-relaxed mb-6'>
          Your {submitted.type === 'exchange' ? 'exchange' : 'return'} request has been submitted successfully.
          Our team will review it within 24&ndash;48 hours and contact you at{' '}
          <span className='font-medium text-foreground'>{submitted.email}</span>.
        </p>
        <div className='bg-muted rounded-xl py-4 px-6 mb-8 inline-block'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground mb-1'>Your Request ID</p>
          <p className='font-bold text-xl tracking-widest text-foreground'>{submitted.requestId}</p>
        </div>
        <p className='text-sm text-muted-foreground mb-6'>
          Please note this ID. Keep the packaging until your request is resolved.
        </p>
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button
            onClick={() => {
              setSubmitted(null)
              setCustomerName('')
              setEmail('')
              setPhone('')
              setOrderNumber('')
              setProductName('')
              setSize('')
              setReason('')
              setDetails('')
            }}
          >
            Submit Another Request
          </Button>
          <Button variant='outline' onClick={() => { window.location.href = '/' }}>
            Back to Home
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className='p-6 md:p-12'>
      <h2 className='text-2xl font-semibold text-foreground mb-2'>Request a {type === 'exchange' ? 'Exchange' : 'Return'}</h2>
      <p className='text-muted-foreground text-sm mb-6'>
        Fill in the form below and our team will get back to you within 24&ndash;48 hours on your email.
      </p>

      <div className='inline-flex rounded-full border border-input p-1 mb-6'>
        <button
          type='button'
          onClick={() => setType('return')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${type === 'return' ? 'bg-gold text-charcoal' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Return
        </button>
        <button
          type='button'
          onClick={() => setType('exchange')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${type === 'exchange' ? 'bg-gold text-charcoal' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Exchange
        </button>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label className='text-sm text-muted-foreground'>Full Name <span className='text-destructive'>*</span></label>
            <Input
              type='text'
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder='Your name'
              required
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm text-muted-foreground'>Email Address <span className='text-destructive'>*</span></label>
            <Input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='your@email.com'
              required
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label className='text-sm text-muted-foreground'>Phone (optional)</label>
            <Input
              type='tel'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='03XX-XXXXXXX'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm text-muted-foreground'>Order Number (optional)</label>
            <Input
              type='text'
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder='e.g. SAF-2026-XXXX'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label className='text-sm text-muted-foreground'>Product Name <span className='text-destructive'>*</span></label>
            <Input
              type='text'
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder='e.g. Rose Wood by Ajmal'
              required
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm text-muted-foreground'>Size (optional)</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className='flex h-11 w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value=''>Select a size</option>
              <option value='3ml'>3ml</option>
              <option value='6ml'>6ml</option>
              <option value='12ml'>12ml</option>
              <option value='50ml'>50ml</option>
              <option value='other'>Other</option>
            </select>
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-sm text-muted-foreground'>Reason for {type === 'exchange' ? 'Exchange' : 'Return'} <span className='text-destructive'>*</span></label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className='flex h-11 w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <option value=''>Select a reason</option>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className='space-y-2'>
          <label className='text-sm text-muted-foreground'>Additional Details</label>
          <Textarea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder='Please describe your request so we can help faster...'
            className='resize-none'
          />
        </div>

        <Button type='submit' className='w-full md:w-auto' size='lg' disabled={submitting}>
          {submitting ? 'Sending...' : `Submit ${type === 'exchange' ? 'Exchange' : 'Return'} Request`}
        </Button>
      </form>
    </Card>
  )
}