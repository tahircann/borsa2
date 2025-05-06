/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'], // Add any domains you'll load images from
  },
  async rewrites() {
    console.log('Setting up API proxy rewrites');
    return [
      {
        source: '/ibapi/:path*',
        destination: 'https://localhost:5056/v1/api/:path*',
        basePath: false
      },
    ]
  },
  // Geliştirme ortamındaki HTTP istek zaman aşımını artırın
  httpAgentOptions: {
    keepAlive: true,
    timeout: 60000, // 60 saniye
  },
}

console.log('Next.js config loaded with API proxy to: https://localhost:5056/v1/api');
module.exports = nextConfig 