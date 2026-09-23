import type { Metadata } from 'next'
import ComingSoonCountdown from '@/components/ComingSoonCountdown'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Coming Soon',
  robots: { index: false, follow: false },
}

const WHATSAPP_URL = 'https://wa.me/923107435020'
const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/safariperfumesofficial', icon: '/instagram.svg' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/19G8xxiTP7/', icon: '/facebook.svg' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@safari.perfumes', icon: '/tiktok.svg' },
]

export default function ComingSoonPage() {
  const launchDate = process.env.LAUNCH_DATE ?? ''

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 md:px-12 py-16 md:py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-gold/10 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />

      <div className="relative z-10 w-full max-w-3xl text-center">
        <img
          src="/logo.jpeg"
          alt="Safari Perfumes"
          className="mx-auto mb-8 w-24 md:w-28 aspect-square object-cover rounded-full ring-1 ring-gold/40"
        />

        <p className="uppercase tracking-[0.35em] text-xs md:text-sm text-gold">
          Something extraordinary is coming
        </p>

        <h1 className="mt-4 font-heading text-4xl md:text-6xl text-white leading-tight">
          Safari Perfumes
          <span className="block mt-2 text-gold">Coming Soon</span>
        </h1>

        <p className="mt-5 md:mt-6 text-sm md:text-lg text-white/65 max-w-xl mx-auto leading-relaxed">
          We are crafting a new way to find your signature scent. Fresh collections,
          exclusive releases, and something special — all arriving very soon.
        </p>

        <div className="mt-10 md:mt-14">
          <ComingSoonCountdown launchDate={launchDate} />
        </div>

        <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-gold hover:bg-gold-hover text-charcoal font-semibold px-8 py-3 text-sm transition-colors"
          >
            Order Now on WhatsApp
          </a>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/15 hover:border-gold/60 text-white/70 hover:text-gold transition-colors"
            >
              <img src={social.icon} alt="" className="w-5 h-5" />
            </a>
          ))}
        </div>

        <p className="mt-10 text-xs uppercase tracking-[0.25em] text-white/35">
          © {new Date().getFullYear()} Safari Perfumes — Pakistan
        </p>
      </div>
    </section>
  )
}