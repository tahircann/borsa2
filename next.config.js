/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'], // Add any domains you'll load images from
  },
  async rewrites() {
    console.log('Setting up API proxy rewrites');
    
    // For production deployment on server, use Docker network
    // For local development, use SSH tunnel
    const isProduction = process.env.NODE_ENV === 'production';
    const apiDestination = isProduction 
      ? 'http://172.18.0.2:5056/:path*'  // Docker container internal IP
      : 'http://localhost:8080/:path*';   // SSH tunnel for local dev
    
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

const isProduction = process.env.NODE_ENV === 'production';
const apiUrl = isProduction 
  ? 'http://172.18.0.2:5056' 
  : 'http://localhost:8080';

console.log(`Next.js config loaded - Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`API proxy configured for: ${apiUrl}`);
module.exports = nextConfig 