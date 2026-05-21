import { Card } from "@/components/ui/card"

export default function CookiesPage() {
  return (
    <div className="pt-16 md:pt-20">
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-heading text-foreground mb-4">Cookies Policy</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            How we use cookies and similar tracking technologies
          </p>
        </div>
      </section>

      <section className="section-padding bg-card">
        <div className="container-custom max-w-4xl">
          <div className="space-y-10">
            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">What Are Cookies</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, understand how you use the site, and improve your browsing experience. Cookies may be set by us (first-party cookies) or by third-party services we use (third-party cookies).</p>
                <p>We also use similar technologies such as web beacons, pixel tags, and local storage for the same purposes.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">How We Use Cookies</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We use cookies for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for the website to function properly, including shopping cart and account login.</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings for a personalized experience.</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site so we can improve it.</li>
                  <li><strong>Marketing Cookies:</strong> Track your browsing habits to deliver relevant advertisements and measure campaign effectiveness.</li>
                </ul>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Managing Cookies</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>You can control and manage cookies in several ways:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Browser settings allow you to block or delete cookies. Consult your browser&apos;s help documentation for instructions.</li>
                  <li>You can opt out of analytics cookies by adjusting your preferences or using browser add-ons.</li>
                  <li>Third-party opt-out tools are available for managing marketing cookies across multiple websites.</li>
                </ul>
                <p>Please note that blocking some types of cookies may impact your experience of our website.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Third-Party Cookies</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We work with trusted partners who may set cookies on our website:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google Analytics:</strong> Helps us analyze website traffic and usage patterns.</li>
                  <li><strong>Payment Processors:</strong> Essential cookies for secure payment processing.</li>
                  <li><strong>Social Media Platforms:</strong> Enable content sharing and track conversions.</li>
                </ul>
                <p>These third parties have their own privacy policies governing the use of your data.</p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-heading text-foreground mb-4">Updates & Contact</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We may update this Cookies Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.</p>
                <p>If you have any questions about our use of cookies, please contact us at privacy@safariperfumes.com.</p>
                <p>This policy was last updated on January 1, 2026.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
