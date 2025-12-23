import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Workspaces ship source/ESM; Next needs to transpile them.
  transpilePackages: ['@sunday-school/lib', '@sunday-school/ui'],

  // Ensure serverless tracing can include workspace files.
  outputFileTracingRoot: path.join(process.cwd(), '..', '..'),
}

export default nextConfig
