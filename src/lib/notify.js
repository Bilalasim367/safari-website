const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function sendOrderEmail(order) {
  const items = (order.items || [])
    .map((i) => `${i.quantity}x ${i.name} (${i.size || 'standard'}) — Rs. ${i.price * i.quantity}`)
    .join('\n')

  const body = `
New Order Received! 🛒

Order #:     ${order.orderNumber}
Customer:    ${order.customerName}
Email:       ${order.customerEmail}
Phone:       ${order.customerPhone || 'N/A'}
Address:     ${order.shippingAddress || 'N/A'}
Payment:     ${order.paymentMethod} (${order.paymentStatus})

Items:
${items}

Subtotal:    Rs. ${order.subtotal}
Shipping:    Rs. ${order.shipping}
Total:       Rs. ${order.total}
`

  await transporter.sendMail({
    from: `"Safari Perfumes Orders" <${process.env.SMTP_USER}>`,
    to: process.env.ORDER_EMAIL,
    subject: `🛒 New Order #${order.orderNumber} — Rs. ${order.total}`,
    text: body,
  })
}

module.exports = { sendOrderEmail }
