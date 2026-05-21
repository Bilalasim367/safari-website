import { Card } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="pt-16 md:pt-20">
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-heading text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using our website
          </p>
        </div>
      </section>

      <section className="section-padding bg-card">
        <div className="container-custom max-w-4xl">
          <div className="space-y-10">
            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">General Terms</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>By accessing and using the SAFARI Perfumes website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should not use our website or services.</p>
                <p>We reserve the right to update or modify these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms. It is your responsibility to review this page periodically.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Products & Pricing</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>All prices are listed in US Dollars and are subject to change without notice. We strive to display accurate product descriptions and pricing, but errors may occur. We reserve the right to correct any errors and cancel orders if necessary.</p>
                <p>Product availability is not guaranteed. If an item is out of stock after your order is placed, we will notify you and issue a full refund. We reserve the right to limit quantities and refuse service.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Orders & Payment</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>When you place an order, you agree to provide accurate and complete information. We accept major credit cards, PayPal, and other payment methods as indicated at checkout. Payment is due at the time of purchase.</p>
                <p>We reserve the right to refuse or cancel any order for reasons including but not limited to product availability, pricing errors, or suspected fraud. In such cases, we will issue a full refund.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Shipping & Returns</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Shipping costs and delivery times vary based on location and shipping method selected. We are not responsible for delays caused by carriers or customs. Title and risk of loss pass to you upon delivery to the carrier.</p>
                <p>Our return policy allows returns within 30 days of delivery for unused, unopened products in their original packaging. Please see our Returns & Exchange page for full details.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Intellectual Property</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>All content on this website including text, images, logos, and product designs is the property of SAFARI Perfumes and is protected by intellectual property laws. You may not reproduce, distribute, or modify any content without our express written permission.</p>
                <p>The SAFARI name and logo are registered trademarks. Unauthorized use of our trademarks or trade dress is strictly prohibited.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Contact</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>For questions about these Terms of Service, please contact us at legal@safariperfumes.com or write to SAFARI Perfumes, 123 Luxury Lane, New York, NY 10001.</p>
                <p>These terms were last updated on January 1, 2026.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
