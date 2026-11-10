// A small sliding window limiter, kept in memory.
//
// On serverless platforms every warm instance has its own memory, so this is a
// best effort brake against runaway loops and casual abuse, not a hard guarantee.
// For a strict limit put a shared store (Upstash, Vercel KV) or the platform's
// firewall rate limiting in front of /api/guidance.

export interface LimitDecision {
  allowed: boolean
  retryAfterSeconds: number
}

export class SlidingWindowLimiter {
  private readonly hits = new Map<string, number[]>()
  private readonly limit: number
  private readonly windowMs: number
  private readonly maxKeys: number
  private readonly now: () => number

  constructor(limit: number, windowMs: number, maxKeys = 5000, now: () => number = Date.now) {
    this.limit = limit
    this.windowMs = windowMs
    this.maxKeys = maxKeys
    this.now = now
  }

  check(key: string): LimitDecision {
    const now = this.now()
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs)

    if (recent.length >= this.limit) {
      this.hits.set(key, recent)
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + this.windowMs - now) / 1000)) }
    }

    recent.push(now)
    this.hits.delete(key)
    this.hits.set(key, recent)
    this.prune(now)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  private prune(now: number): void {
    if (this.hits.size <= this.maxKeys) return
    for (const [key, times] of this.hits) {
      if (times.every((t) => now - t >= this.windowMs)) this.hits.delete(key)
      if (this.hits.size <= this.maxKeys) return
    }
    // Still too many active keys: drop the oldest ones.
    for (const key of this.hits.keys()) {
      this.hits.delete(key)
      if (this.hits.size <= this.maxKeys) return
    }
  }
}
