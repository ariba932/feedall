/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@radix-ui/react-slot', 'lucide-react'],
  },
};

module.exports = nextConfig;
