import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Next.js 16 proxy function (replaces deprecated middleware.ts).
 * Exported as `proxy` per the Next.js 16 file convention.
 */
export function proxy(request: NextRequest) {
  // Pass all requests through without modification.
  // Add custom logic here (e.g., auth checks, redirects) as needed.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
