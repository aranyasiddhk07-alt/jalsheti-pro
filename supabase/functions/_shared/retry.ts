/**
 * Retry utility — for Edge Functions calling external services.
 * Exponential backoff with jitter: 1s → 4s → 16s
 */

interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = { maxAttempts: 3, baseDelayMs: 1000 },
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt < opts.maxAttempts - 1) {
        const delay = opts.baseDelayMs * Math.pow(4, attempt);
        const jitter = Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }
  }

  throw lastError!;
}
