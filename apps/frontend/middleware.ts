import { NextRequest } from 'next/server'
import { updateSession } from '@sunday-school/lib'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
