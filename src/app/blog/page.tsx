import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts } from '@/data/blog'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Fragrance Guides & Tips | Safari Perfumes Blog',
  description:
    'Practical fragrance guides for Pakistan: designer perfume impressions explained, oud vs attar, and how to make your perfume last longer.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Fragrance Guides & Tips | Safari Perfumes Blog',
    description:
      'Practical fragrance guides for Pakistan: designer perfume impressions explained, oud vs attar, and how to make your perfume last longer.',
    url: `${SITE_URL}/blog`,
    siteName: 'Safari Perfumes',
    type: 'website',
  },
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 md:px-12 pb-24">
        <div className="container-custom">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.5em] uppercase mb-4 text-muted-foreground">
              Fragrance Guides
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
              Guides &amp; Tips
            </h1>
            <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
              Honest, practical advice about attars, perfumes, and impressions — written for buyers in Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group border border-border rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:border-gold/30 flex flex-col"
              >
                <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">{post.category}</p>
                <h2 className="font-heading text-xl md:text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">{post.description}</p>
                <p className="text-xs text-muted-foreground">{post.readTime} · {post.date}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}