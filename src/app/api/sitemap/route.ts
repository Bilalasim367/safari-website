import { NextResponse } from 'next/server';
import { products } from '@/data/products';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://safariperfumes.com';

interface SitemapRoute {
  loc: string;
  changefreq: string;
  priority: string;
  lastmod?: string;
}

export async function GET() {
  const staticRoutes: SitemapRoute[] = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/shop', changefreq: 'weekly', priority: '0.9' },
    { loc: '/about', changefreq: 'monthly', priority: '0.6' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
    { loc: '/collections', changefreq: 'weekly', priority: '0.8' },
    { loc: '/account', changefreq: 'weekly', priority: '0.7' },
    { loc: '/checkout', changefreq: 'weekly', priority: '0.7' },
    { loc: '/login', changefreq: 'yearly', priority: '0.3' },
    { loc: '/signup', changefreq: 'yearly', priority: '0.3' },
  ];

  const productRoutes: SitemapRoute[] = products.map((p) => ({
    loc: `/shop/${p.slug}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0],
  }));

  const allRoutes = [...staticRoutes, ...productRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (r) => `  <url>
    <loc>${BASE_URL}${r.loc}</loc>${r.lastmod ? `\n    <lastmod>${r.lastmod}</lastmod>` : ''}
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}