import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Search engines must always be able to crawl the storefront.
        userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot'],
        allow: '/',
        disallow: ['/admin', '/account', '/login', '/signup', '/forgot-password', '/checkout', '/track', '/api/'],
      },
      {
        // Crawlers that ignore robots.txt are also blocked at the edge
        // (src/proxy.ts) for /shop and /api. Disallowing them here keeps the
        // rest of the site from being scanned by bandwidth-hungry bots.
        userAgent: [
          'GPTBot',
          'Bytespider',
          'CCBot',
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'PetalBot',
          'Scrapy',
          'python-requests',
        ],
        disallow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/account',
          '/login',
          '/signup',
          '/forgot-password',
          '/checkout',
          '/track',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}