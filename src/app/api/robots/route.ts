import { NextResponse } from 'next/server';

export async function GET() {
  const robots = `User-agent: *
Allow: /

# Disallow admin routes
Disallow: /admin/
Disallow: /api/admin/

# Disallow auth routes
Disallow: /login/
Disallow: /signup/
Disallow: /forgot-password/

# Disallow checkout
Disallow: /checkout/

# Disallow account pages
Disallow: /account/

# Allow search engines to crawl sitemap
Sitemap: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://safariperfumes.com'}/api/sitemap

# Crawl delay (optional, uncomment if needed)
# Crawl-delay: 1
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}