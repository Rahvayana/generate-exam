import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        if (path.startsWith('/admin') && token?.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url))
        }

        // Only approved users can access protected pages. For this app, '/' is fully protected.
        if (path === '/' && token?.status !== 'approved') {
            // If we are pending or rejected, we shouldn't be 'logged in' technically,
            // but if the token somehow persists and the status changes:
            // We will redirect them to login or a not-authorized page. 
            // NextAuth's authorize catches this on login, but if the DB status changes during a session, 
            // the token status might be stale unless updated. Let's just enforce the check.
            return NextResponse.redirect(new URL('/login', req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: ['/admin/:path*', '/', '/profile'],
}
