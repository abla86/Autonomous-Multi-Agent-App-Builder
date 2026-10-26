import crypto from 'node:crypto';

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);

/**
 * Treat wildcard bind addresses such as 0.0.0.0 and :: as remotely exposed.
 * A bind address is not a reliable substitute for a network firewall, but it
 * determines whether this application should require its production API key.
 */
export function isRemoteExposure(host: string): boolean {
  const normalized = host.trim().toLowerCase();
  return !LOOPBACK_HOSTS.has(normalized);
}

/** Compare API keys without leaking content-dependent timing information. */
export function timingSafeApiKeyMatch(supplied: string, expected: string): boolean {
  if (!supplied || !expected) return false;
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  return suppliedBytes.length === expectedBytes.length && crypto.timingSafeEqual(suppliedBytes, expectedBytes);
}
