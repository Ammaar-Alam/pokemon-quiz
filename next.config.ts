import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname:
          '/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/**',
        search: '',
      },
    ],
  },
}

export default nextConfig
