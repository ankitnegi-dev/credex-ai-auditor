/**
 * Generates a UUID v4 using the Web Crypto API.
 * Wraps crypto.randomUUID() for testability and consistent usage.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
