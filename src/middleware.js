import { NextResponse } from 'next/server'
import { getAdminCookieName, verifyAdminSessionValue } from './lib/adminSession'

function isProtectedAdminPath(pathname) {
  if (pathname === '/admin/login') return false
  if (pathname === '/api/admin/session') return false

  return (
    pathname.startsWith('/admin/') ||
    pathname === '/admin' ||
    pathname.startsWith('/api/admin/')
  )
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (!isProtectedAdminPath(pathname)) {
    return NextResponse.next()
  }

  const cookieValue = request.cookies.get(getAdminCookieName())?.value
  const isValid = await verifyAdminSessionValue(cookieValue)

  if (isValid) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const loginUrl = new URL('/admin/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
