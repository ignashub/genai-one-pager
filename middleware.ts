import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Store IP addresses and their request counts
const requestMap = new Map<string, { count: number; timestamp: number }>();

// Configuration
const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 20;

export function middleware(request: NextRequest) {
  // Get IP from headers
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown';
  
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const now = Date.now();
  const windowStart = now - (WINDOW_SIZE_IN_SECONDS * 1000);

  // Get existing request data
  const requestData = requestMap.get(ip);

  // Clean up old entries
  if (requestData && requestData.timestamp < windowStart) {
    requestMap.delete(ip);
  }

  // Check if limit exceeded
  if (requestData && requestData.timestamp >= windowStart) {
    if (requestData.count >= MAX_REQUESTS_PER_WINDOW) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }
    requestData.count++;
  } else {
    // First request in this window
    requestMap.set(ip, { count: 1, timestamp: now });
  }

  // Clean up old entries periodically
  if (Math.random() < 0.1) { // 10% chance to run cleanup
    for (const [key, value] of requestMap.entries()) {
      if (value.timestamp < windowStart) {
        requestMap.delete(key);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};