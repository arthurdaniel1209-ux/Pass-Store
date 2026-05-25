import { Request, Response, NextFunction } from "express";
import { logger } from "./serverLogger";

export interface RateLimitConfig {
  windowMs: number;     // Window size in milliseconds
  max: number;          // Max number of requests allowed in windowMs
  message: string;      // Rate limit error message
}

// Environment-friendly override configurations for easy operations tuning
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // General fallback
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_DEFAULT_MAX || "300", 10),
    message: "Too many requests. Please try again later.",
  },
  // High-protection for payment processing, auth actions, or email dispatch
  sensitive: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_SENSITIVE_MAX || "15", 10),
    message: "Security threat fallback: rate limit threshold exceeded. Action blocked.",
  },
  // Upload assets rate limits
  upload: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || "30", 10),
    message: "Too many file uploads. Please check back later.",
  },
};

interface LimitStore {
  hits: number;
  resetTime: number;
}

// Multi-dimension local in-memory store
const memoryStore = new Map<string, LimitStore>();

// Clear expired records every 5 minutes to prevent memory leaks in high-load production environments
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Express middleware builder for robust IP-based and user-based Rate Limiting.
 *
 * @param type The rate-limiting configuration tier ('default' | 'sensitive' | 'upload')
 */
export function createRateLimiter(type: keyof typeof rateLimitConfigs = "default") {
  const config = rateLimitConfigs[type] || rateLimitConfigs.default;

  return (req: Request, res: Response, next: NextFunction) => {
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    // x-forwarded-for could return a comma-separated list of proxy IPs, retrieve the first actual client IP
    const clientIp = Array.isArray(rawIp)
      ? rawIp[0].trim()
      : typeof rawIp === "string"
        ? rawIp.split(",")[0].trim()
        : "127.0.0.1";

    // Trace if user exhibits authorization or identity headers (UserId can be parsed if client relays it, e.g. x-user-id)
    const userIdHeader = req.headers["x-user-id"] || "";
    const userId = typeof userIdHeader === "string" ? userIdHeader.trim() : "";

    // Build compound cache key to limit both IP and specific logged-in user identifier
    const cacheKey = `${type}:${clientIp}:${userId}`;

    const now = Date.now();
    let record = memoryStore.get(cacheKey);

    // If record doesn't exist or is expired, initialize/reset
    if (!record || now > record.resetTime) {
      record = {
        hits: 0,
        resetTime: now + config.windowMs,
      };
    }

    record.hits += 1;
    memoryStore.set(cacheKey, record);

    // Define standard rate-limiting metadata headers for observability
    const remaining = Math.max(0, config.max - record.hits);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", config.max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetSeconds);

    if (record.hits > config.max) {
      // Integrate with the production structured logger to record suspicious / extreme traffic
      logger.warn("IP or User rate limit reached: blocked incoming request", {
        clientIp,
        userId: userId || undefined,
        method: req.method,
        path: req.path,
        tier: type,
        hits: record.hits,
        maxAllowed: config.max,
        resetInSeconds: resetSeconds,
      });

      return res.status(429).json({
        error: config.message,
        retryAfterSeconds: resetSeconds,
      });
    }

    next();
  };
}
