/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // <--- cPanel/Passenger deployment ke liye Ye Sab Se Important Hai
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
};

module.exports = nextConfig;