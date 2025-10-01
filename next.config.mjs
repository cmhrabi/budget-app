/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  typescript: {
    // This allows production builds to successfully complete even if there are type errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // This allows production builds to successfully complete even if there are ESLint errors
    ignoreDuringBuilds: false,
  },
}

export default nextConfig