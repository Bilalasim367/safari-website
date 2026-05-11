import { Card } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="pt-20">
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-heading text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            How we collect, use, and protect your information
          </p>
        </div>
      </section>

      <section className="section-padding bg-card">
        <div className="container-custom max-w-4xl">
          <div className="space-y-10">
            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>When you make a purchase or create an account with SAFARI Perfumes, we collect personal information including your name, email address, shipping address, and payment details. We also automatically collect certain information about your device and browsing behavior to improve your shopping experience.</p>
                <p>We use cookies and similar tracking technologies to enhance site functionality, analyze trends, and personalize content. You can control cookie preferences through your browser settings.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">How We Use Your Information</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Your information helps us process orders, provide customer support, send order updates, and improve our products and services. With your consent, we may send marketing communications about new arrivals, exclusive offers, and company updates.</p>
                <p>We do not sell your personal information to third parties. We may share data with trusted service providers who assist in operating our website and fulfilling orders, subject to strict confidentiality agreements.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Data Security</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We implement industry-standard security measures including SSL encryption, secure payment processing, and regular security audits to protect your personal information against unauthorized access, alteration, or disclosure.</p>
                <p>Your payment information is processed securely by our payment partners and is never stored on our servers.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Your Rights</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>You have the right to access, correct, or delete your personal information at any time. You can manage your account preferences or contact us to exercise these rights. We will respond to your request within 30 days.</p>
                <p>You may opt out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting our customer service team.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Contact Us</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>If you have questions about this Privacy Policy or how we handle your data, please contact us at privacy@safariperfumes.com or write to SAFARI Perfumes, 123 Luxury Lane, New York, NY 10001.</p>
                <p>This policy was last updated on January 1, 2026. We reserve the right to update this policy and will notify you of material changes.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
