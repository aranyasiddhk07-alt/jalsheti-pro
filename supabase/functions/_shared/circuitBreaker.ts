/**
 * Circuit Breaker — for Edge Functions calling external services.
 * 
 * Usage:
 *   const breaker = new CircuitBreaker('azure-tts', { failureThreshold: 5, cooldownMs: 30000 });
 *   const result = await breaker.exec(async () => {
 *     const res = await fetch('https://azure.com/tts', { ... });
 *     if (!res.ok) throw new Error('Azure TTS failed');
 *     return res;
 *   });
 */

interface CircuitBreakerOptions {
  failureThreshold: number;
  cooldownMs: number;
}

type CircuitState = 'closed' | 'open' | 'half-open';

interface BreakerEntry {
  failures: number;
  lastFailureAt: number;
  state: CircuitState;
}

const breakers = new Map<string, BreakerEntry>();

export class CircuitBreaker {
  private name: string;
  private opts: CircuitBreakerOptions;

  constructor(name: string, opts: CircuitBreakerOptions) {
    this.name = name;
    this.opts = opts;
    if (!breakers.has(name)) {
      breakers.set(name, { failures: 0, lastFailureAt: 0, state: 'closed' });
    }
  }

  private getEntry(): BreakerEntry {
    return breakers.get(this.name)!;
  }

  async exec<T>(fn: () => Promise<T>): Promise<T> {
    const entry = this.getEntry();

    if (entry.state === 'open') {
      const elapsed = Date.now() - entry.lastFailureAt;
      if (elapsed < this.opts.cooldownMs) {
        throw new Error(`Circuit breaker [${this.name}] is OPEN — failing fast (${Math.round((this.opts.cooldownMs - elapsed) / 1000)}s remaining)`);
      }
      entry.state = 'half-open';
    }

    try {
      const result = await fn();
      if (entry.state === 'half-open') {
        entry.state = 'closed';
        entry.failures = 0;
      }
      return result;
    } catch (err) {
      entry.failures++;
      entry.lastFailureAt = Date.now();

      if (entry.failures >= this.opts.failureThreshold) {
        entry.state = 'open';
      }

      throw err;
    }
  }

  getState(): CircuitState {
    return this.getEntry().state;
  }

  reset(): void {
    breakers.set(this.name, { failures: 0, lastFailureAt: 0, state: 'closed' });
  }
}
