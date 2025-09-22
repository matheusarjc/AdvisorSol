import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSecurityHeaders, RateLimiter, validateRequest } from "@/lib/security";

const PUBLIC_PATHS = ["/login", "/_next", "/api/public", "/favicon.ico", "/assets"];

// Create rate limiters for different endpoints
// More lenient limits in development
const isDevelopment = process.env.NODE_ENV === "development";
const apiRateLimit = new RateLimiter(
  60000,
  isDevelopment ? 1000 : 100 // 1000 requests per minute in dev, 100 in production
);
const authRateLimit = new RateLimiter(
  15 * 60000,
  isDevelopment ? 50 : 5 // 50 requests per 15 minutes in dev, 5 in production
);

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

  // Rate limiting - skip in development for better DX
  if (pathname.startsWith("/api/") && !isDevelopment) {
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
    response.headers.set("X-RateLimit-Limit", isDevelopment ? "1000" : "100");
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimit.resetTime.toString());
  }

  // Auth rate limiting - still apply in development but more lenient
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
