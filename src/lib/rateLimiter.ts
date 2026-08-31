/**
 * In-Memory Sliding Window Rate Limiter
 * Protects AI endpoints from abuse, credential exhaustion, DoS, and runaway costs.
 */

interface RateLimitRecord {
  timestamps: number[];
}

interface RateLimitConfig {
  maxRequests: number; // Maximum allowed requests in the time window
  windowMs: number;    // Time window in milliseconds
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodically clean up stale entries every 5 minutes to prevent memory leaks
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Checks if a request from the given identifier (IP or userId) is allowed.
   */
  public check(
    identifier: string,
    config: RateLimitConfig
  ): {
    allowed: boolean;
    remaining: number;
    resetMs: number;
    totalLimit: number;
  } {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let record = this.records.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.records.set(identifier, record);
    }

    // Filter out timestamps outside the active sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= config.maxRequests) {
      const oldestTimestamp = record.timestamps[0] || now;
      const resetMs = Math.max(0, oldestTimestamp + config.windowMs - now);

      return {
        allowed: false,
        remaining: 0,
        resetMs,
        totalLimit: config.maxRequests,
      };
    }

    // Record the current request timestamp
    record.timestamps.push(now);

    const remaining = Math.max(0, config.maxRequests - record.timestamps.length);
    const resetMs = config.windowMs;

    return {
      allowed: true,
      remaining,
      resetMs,
      totalLimit: config.maxRequests,
    };
  }

  /**
   * Removes stale entries older than 30 minutes.
   */
  private cleanup() {
    const now = Date.now();
    const cutoff = now - 30 * 60 * 1000;

    for (const [key, record] of this.records.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
      if (record.timestamps.length === 0) {
        this.records.delete(key);
      }
    }
  }
}

// Global singleton rate limiter instance
export const globalRateLimiter = new RateLimiter();

/**
 * Standard Rate Limit Configurations for Different Operations
 */
export const RATE_LIMITS = {
  // Heavy PDF Ingestion / Flashcard Generation: max 6 requests per minute, 25 per 10 mins
  FLASHCARD_GENERATION: {
    maxRequests: 6,
    windowMs: 60 * 1000, // 1 minute
  },
  FLASHCARD_BURST: {
    maxRequests: 25,
    windowMs: 10 * 60 * 1000, // 10 minutes
  },
  // Socratic Teach-back Chat: max 25 messages per minute
  TEACH_BACK_CHAT: {
    maxRequests: 25,
    windowMs: 60 * 1000,
  },
  // Assessment & Evaluation: max 12 requests per minute
  EVALUATION: {
    maxRequests: 12,
    windowMs: 60 * 1000,
  },
};

/**
 * Extracts a reliable client identifier from Next.js request headers.
 */
export function getClientIdentifier(request: Request, customUserId?: string): string {
  if (customUserId && customUserId.trim().length > 0) {
    return `user:${customUserId.trim()}`;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const clientIp = forwardedFor.split(",")[0].trim();
    if (clientIp) return `ip:${clientIp}`;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return `ip:${realIp.trim()}`;

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return `ip:${cfConnectingIp.trim()}`;

  return "ip:127.0.0.1";
}
