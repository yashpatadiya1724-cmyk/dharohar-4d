/** @type {import('next').NextConfig} */
const rawBackend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
const backendUrl = rawBackend.startsWith('http') ? rawBackend : `http://${rawBackend}`;
const sanitizedBackend = backendUrl.replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${sanitizedBackend}/api/v1/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

export default nextConfig;
