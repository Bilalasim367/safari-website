import nodemailer from 'nodemailer'
import prisma from '@/lib/turso'

interface ConfirmationItem {
  name: string
  price: number
  quantity: number
  size: string
}

interface ConfirmationAddress {
  firstName: string
  lastName: string
  address1: string
  city: string
  state: string
  zipCode: string
}

export async function getTransporter() {
  const settings = await prisma.settings.findFirst()

  if (!settings?.smtpHost || !settings?.smtpPort) {
    return null
  }

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465,
    auth: settings.smtpUser && settings.smtpPassword
      ? { user: settings.smtpUser, pass: settings.smtpPassword }
      : undefined,
  })
}

export async function sendOrderShippedEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  trackingNumber: string,
  trackUrl: string
) {
  try {
    const transporter = await getTransporter()
    if (!transporter) {
      console.warn('SMTP not configured — email not sent for order', orderNumber)
      return { sent: false, reason: 'SMTP not configured' }
    }

    const settings = await prisma.settings.findFirst()
    const storeName = settings?.storeName || 'Safari Perfumes'
    const storeEmail = settings?.storeEmail || 'noreply@safariperfumes.com'

    await transporter.sendMail({
      from: `"${storeName}" <${storeEmail}>`,
      to: customerEmail,
      subject: `Your ${storeName} Order #${orderNumber} Has Shipped!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0D0D0D; padding: 24px; text-align: center;">
            <h1 style="color: #C9A962; margin: 0; font-size: 24px;">${storeName}</h1>
          </div>
          <div style="padding: 32px 24px; background: #fff;">
            <h2 style="color: #0D0D0D; margin-top: 0;">Your Order Has Shipped!</h2>
            <p style="color: #555; line-height: 1.6;">Hi ${customerName},</p>
            <p style="color: #555; line-height: 1.6;">
              Great news! Your order <strong>#${orderNumber}</strong> has been shipped and is on its way.
            </p>
            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #555; font-size: 14px;">Tracking Number</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #0D0D0D; letter-spacing: 1px;">
                ${trackingNumber}
              </p>
            </div>
            <a href="${trackUrl}"
               style="display: inline-block; background: #C9A962; color: #0D0D0D; text-decoration: none;
                      padding: 14px 32px; border-radius: 6px; font-weight: bold; margin: 16px 0;">
              Track Your Order
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 24px;">
              If you have any questions, reply to this email or contact our support team.
            </p>
          </div>
          <div style="background: #0D0D0D; padding: 16px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              ${storeName} &mdash; Luxury Fragrances
            </p>
          </div>
        </div>
      `,
    })

    console.log('Shipment email sent to', customerEmail, 'for order', orderNumber)
    return { sent: true }
  } catch (e) {
    console.error('Failed to send shipment email:', e)
    return { sent: false, reason: String(e) }
  }
}

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  items: ConfirmationItem[],
  subtotal: number,
  shipping: number,
  tax: number,
  total: number,
  shippingAddress: ConfirmationAddress
) {
  try {
    const settings = await prisma.settings.findFirst()
    if (!settings?.emailNotifications || !settings?.orderEmails) {
      console.log('Email notifications disabled — skipping confirmation for order', orderNumber)
      return { sent: false, reason: 'Email notifications disabled' }
    }

    const transporter = await getTransporter()
    if (!transporter) {
      console.warn('SMTP not configured — confirmation email not sent for order', orderNumber)
      return { sent: false, reason: 'SMTP not configured' }
    }

    const storeName = settings?.storeName || 'Safari Perfumes'
    const storeEmail = settings?.storeEmail || 'noreply@safariperfumes.com'

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${item.name} (${item.size})</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')

    await transporter.sendMail({
      from: `"${storeName}" <${storeEmail}>`,
      to: customerEmail,
      subject: `Order Confirmation — ${storeName} Order #${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0D0D0D; padding: 24px; text-align: center;">
            <h1 style="color: #C9A962; margin: 0; font-size: 24px;">${storeName}</h1>
          </div>
          <div style="padding: 32px 24px; background: #fff;">
            <h2 style="color: #0D0D0D; margin-top: 0;">Thank You for Your Order!</h2>
            <p style="color: #555; line-height: 1.6;">Hi ${customerName},</p>
            <p style="color: #555; line-height: 1.6;">
              Your order <strong>#${orderNumber}</strong> has been placed successfully.
              We'll notify you when it ships.
            </p>

            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #555; font-size: 14px; font-weight: bold;">Order Summary</p>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid #ddd; color: #333; font-size: 13px;">Item</th>
                    <th style="text-align: center; padding: 8px 0; border-bottom: 2px solid #ddd; color: #333; font-size: 13px;">Qty</th>
                    <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid #ddd; color: #333; font-size: 13px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr><td colspan="3" style="padding: 4px 0;"></td></tr>
                  <tr>
                    <td colspan="2" style="padding: 4px 0; color: #555; font-size: 14px;">Subtotal</td>
                    <td style="padding: 4px 0; color: #555; font-size: 14px; text-align: right;">$${subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 4px 0; color: #555; font-size: 14px;">Shipping</td>
                    <td style="padding: 4px 0; color: #555; font-size: 14px; text-align: right;">${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 4px 0; color: #555; font-size: 14px;">Tax</td>
                    <td style="padding: 4px 0; color: #555; font-size: 14px; text-align: right;">$${tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 8px 0; border-top: 2px solid #ddd; font-weight: bold; color: #0D0D0D; font-size: 16px;">Total</td>
                    <td style="padding: 8px 0; border-top: 2px solid #ddd; font-weight: bold; color: #0D0D0D; font-size: 16px; text-align: right;">$${total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #555; font-size: 14px; font-weight: bold;">Shipping To</p>
              <p style="margin: 0; color: #333; line-height: 1.6;">
                ${shippingAddress.firstName} ${shippingAddress.lastName}<br>
                ${shippingAddress.address1}<br>
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}
              </p>
            </div>

            <p style="color: #999; font-size: 14px; margin-top: 24px;">
              If you have any questions, reply to this email or contact our support team.
            </p>
          </div>
          <div style="background: #0D0D0D; padding: 16px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              ${storeName} &mdash; Luxury Fragrances
            </p>
          </div>
        </div>
      `,
    })

    console.log('Confirmation email sent to', customerEmail, 'for order', orderNumber)
    return { sent: true }
  } catch (e) {
    console.error('Failed to send confirmation email:', e)
    return { sent: false, reason: String(e) }
  }
}
