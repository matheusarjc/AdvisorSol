// Security utilities and configurations

import { NextRequest } from "next/server";

// Content Security Policy
export const cspHeader =
  "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https:; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;";

// Security headers
export function getSecurityHeaders() {
  return {
    "Content-Security-Policy": cspHeader,
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };
}

// Input sanitization
export class InputSanitizer {
  static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid protocol");
      }
      return parsed.toString();
    } catch {
      return "";
    }
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_{2,}/g, "_")
      .substring(0, 255);
  }
}

// Rate limiting per IP
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  private getKey(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : req.ip || "unknown";
    return ip;
  }

  isAllowed(req: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(req);
    const now = Date.now();
    const current = this.requests.get(key);

    if (!current || now > current.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      };
    }

    if (current.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    current.count++;
    this.requests.set(key, current);

    return {
      allowed: true,
      remaining: this.maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }
}

// CSRF protection
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64;
}

// SQL injection prevention (for any database queries)
export function escapeSqlString(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, "\\\\")
    .replace(/\0/g, "\\0")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\x1a/g, "\\Z");
}

// XSS prevention
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push("Senha deve ter pelo menos 8 caracteres");
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push("Adicione letras minúsculas");
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push("Adicione letras maiúsculas");
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push("Adicione números");
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push("Adicione caracteres especiais");
  } else {
    score += 1;
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}

// API key validation
export function validateApiKey(apiKey: string, expectedPrefix?: string): boolean {
  if (!apiKey || apiKey.length < 10) {
    return false;
  }

  if (expectedPrefix && !apiKey.startsWith(expectedPrefix)) {
    return false;
  }

  // Check for common patterns that might indicate a fake key
  const suspiciousPatterns = [
    /^test/i,
    /^demo/i,
    /^example/i,
    /^your_/i,
    /^replace_/i,
    /^changeme/i,
  ];

  return !suspiciousPatterns.some((pattern) => pattern.test(apiKey));
}

// Environment validation
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const required = ["NODE_ENV"];

  const optional = ["FRED_API_KEY", "ALPHA_VANTAGE_API_KEY", "NEWS_API_KEY"];

  // Check required variables
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  // Check optional variables in production
  if (process.env.NODE_ENV === "production") {
    for (const key of optional) {
      if (!process.env[key]) {
        errors.push(`Missing recommended environment variable for production: ${key}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Request validation
export function validateRequest(req: NextRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Skip validation in development for common requests
  if (process.env.NODE_ENV === "development") {
    // Only validate API routes in development
    if (!req.nextUrl.pathname.startsWith("/api/")) {
      return { isValid: true, errors: [] };
    }
  }

  // Check for suspicious headers (skip in development for common proxy headers)
  const suspiciousHeaders =
    process.env.NODE_ENV === "development"
      ? ["x-originating-ip", "x-remote-ip", "x-remote-addr"] // Allow x-forwarded-host in dev
      : ["x-forwarded-host", "x-originating-ip", "x-remote-ip", "x-remote-addr"];

  for (const header of suspiciousHeaders) {
    if (req.headers.get(header)) {
      errors.push(`Suspicious header detected: ${header}`);
    }
  }

  // Check content length
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    // 10MB
    errors.push("Request too large");
  }

  // Check user agent (more lenient)
  const userAgent = req.headers.get("user-agent");
  if (!userAgent || userAgent.length < 5) {
    errors.push("Invalid user agent");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
