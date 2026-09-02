/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', port: '', pathname: '/**' },
    ],
  },
  async redirects() {
    return [
      { source: '/shop/tobacco-oud-by-tom-ford-2', destination: '/shop/tobacco-oud-by-tom-ford', permanent: true },
      { source: '/shop/office-for-men-by-jeremy-fragrance-2', destination: '/shop/office-for-men-by-jeremy-fragrance', permanent: true },
      { source: '/shop/chanel-no-5-red-by-chanel-2', destination: '/shop/chanel-no-5-red-by-chanel', permanent: true },
      { source: '/shop/k-by-dolce-gabbana-dg-2', destination: '/shop/k-by-dolce-gabbana-dg', permanent: true },
      { source: '/shop/212-sexy-men-by-carolina-herrera-2', destination: '/shop/212-sexy-men-by-carolina-herrera', permanent: true },
      { source: '/shop/herrera-for-men-by-carolina-herrera-2', destination: '/shop/herrera-for-men-by-carolina-herrera', permanent: true },
      { source: '/shop/hugo-energise-men-by-hugo-boss-2', destination: '/shop/hugo-energise-men-by-hugo-boss', permanent: true },
      { source: '/shop/legend-by-montblanc-2', destination: '/shop/legend-by-montblanc', permanent: true },
      { source: '/shop/jaguar-classic-gold-by-jaguar-2', destination: '/shop/jaguar-classic-gold-by-jaguar', permanent: true },
      { source: '/shop/light-blue-by-dolce-gabbana-dg-2', destination: '/shop/light-blue-by-dolce-gabbana-dg', permanent: true },
    ]
  },
};

module.exports = nextConfig;