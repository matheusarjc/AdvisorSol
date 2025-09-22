import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSecurityHeaders, RateLimiter, validateRequest } from "@/lib/security";

const PUBLIC_PATHS = ["/login", "/_next", "/api/public", "/favicon.ico", "/assets"];

// Create rate limiters for different endpoints
const apiRateLimit = new RateLimiter(60000, 100); // 100 requests per minute
const authRateLimit = new RateLimiter(15 * 60000, 5); // 5 requests per 15 minutes

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Apply security headers
  const response = NextResponse.next();
  const securityHeaders = getSecurityHeaders();

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Validate request
  const validation = validateRequest(req);
  if (!validation.isValid) {
    console.warn("Invalid request detected:", validation.errors);
    console.warn("Request details:", {
      pathname: req.nextUrl.pathname,
      method: req.method,
      userAgent: req.headers.get("user-agent"),
      headers: Object.fromEntries(req.headers.entries()),
    });
    return new NextResponse("Bad Request", { status: 400 });
  }

  // Rate limiting
  if (pathname.startsWith("/api/")) {
    const rateLimit = apiRateLimit.isAllowed(req);
    if (!rateLimit.allowed) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
        },
      });
    }

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", "100");
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimit.resetTime.toString());
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    const rateLimit = authRateLimit.isAllowed(req);
    if (!rateLimit.allowed) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
        },
      });
    }
  }

  // Authentication check
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const session = req.cookies.get("session")?.value;

  if (!isPublic && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isPublic && session && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$).*)"],
};
