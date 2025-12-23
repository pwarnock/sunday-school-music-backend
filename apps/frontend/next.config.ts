import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Exclude packages from transpilation - they're already built separately
  transpilePackages: [],
  
  // Fix for workspace monorepo
  outputFileTracingRoot: process.cwd(),
}

export default nextConfig