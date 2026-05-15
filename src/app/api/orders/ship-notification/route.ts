import { NextResponse } from 'next/server'
import prisma from '@/lib/turso'
import { sendOrderShippedEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    if (!order.trackingNumber) {
      return NextResponse.json({ success: false, message: 'No tracking number set' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const trackUrl = `${origin}/track?order=${order.orderNumber}`

    const result = await sendOrderShippedEmail(
      order.customerEmail,
      order.customerName,
      order.orderNumber,
      order.trackingNumber,
      trackUrl
    )

    return NextResponse.json({ success: true, emailSent: result.sent, reason: result.reason })
  } catch (error) {
    console.error('Error sending shipment notification:', error)
    return NextResponse.json({ success: false, message: 'Failed to send notification' }, { status: 500 })
  }
}
