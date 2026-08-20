import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts, getBlogPost, type BlogBlock } from '@/data/blog'
import { SITE_URL } from '@/lib/site'

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) {
    return { title: 'Article Not Found | Safari Perfumes' }
  }
  const url = `${SITE_URL}/blog/${post.slug}`
  return {
    title: `${post.title} | Safari Perfumes`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'Safari Perfumes',
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
    },
  }
}

// Renders [text](url) tokens as links. No HTML is injected — safe by construction.
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (match) {
      return (
        <Link
          key={`${keyPrefix}-${i}`}
          href={match[2]}
          className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors"
        >
          {match[1]}
        </Link>
      )
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>
  })
}

function renderBlock(block: BlogBlock, index: number) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 key={index} className="font-heading text-2xl md:text-3xl text-foreground mb-4 mt-10">
          {block.text}
        </h2>
      )
    case 'ul':
      return (
        <ul key={index} className="space-y-3 mb-6">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-muted-foreground leading-relaxed">
              <span className="text-gold shrink-0 mt-1">•</span>
              <span>{renderInline(item, `li-${index}-${i}`)}</span>
            </li>
          ))}
        </ul>
      )
    default:
      return (
        <p key={index} className="text-muted-foreground leading-relaxed mb-5">
          {renderInline(block.text, `p-${index}`)}
        </p>
      )
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Safari Perfumes' },
    publisher: { '@type': 'Organization', name: 'Safari Perfumes' },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-10">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground">{post.title}</span>
        </nav>

        <p className="text-gold text-xs tracking-[0.25em] uppercase mb-4">{post.category}</p>
        <h1 className="font-heading text-3xl md:text-5xl text-foreground mb-6">{post.title}</h1>
        <p className="text-sm text-muted-foreground mb-10">{post.readTime} · Published {post.date}</p>

        <article>{post.content.map(renderBlock)}</article>

        <div className="border-t border-border mt-12 pt-8">
          <Link href="/blog" className="text-gold hover:text-gold-light text-sm font-medium uppercase tracking-wider transition-colors">
            ← All Guides
          </Link>
        </div>
      </div>
    </div>
  )
}