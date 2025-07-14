/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'], // Add any domains you'll load images from
  },
  async rewrites() {
    console.log('Setting up API proxy rewrites');
    
    // Both development and production use localhost:8080
    // Development: SSH tunnel, Production: Docker external port mapping
    const apiDestination = 'http://localhost:8080/:path*';
    
    console.log('API destination:', apiDestination);
    
    return [
      {
        source: '/ibapi/:path*',
        destination: apiDestination,
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

console.log(`Next.js config loaded - Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`API proxy configured for: http://localhost:8080`);
module.exports = nextConfig 