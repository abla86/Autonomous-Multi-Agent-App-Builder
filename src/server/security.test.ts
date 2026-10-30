import { describe, expect, it } from 'vitest';
import { isRemoteExposure, timingSafeApiKeyMatch } from './security';

describe('production API exposure guard', () => {
  it.each(['localhost', '127.0.0.1', '::1', '[::1]'])('treats loopback host %s as local', (host) => {
    expect(isRemoteExposure(host)).toBe(false);
  });

  it.each(['0.0.0.0', '::', '192.0.2.10', 'api.example.com'])('treats host %s as remotely exposed', (host) => {
    expect(isRemoteExposure(host)).toBe(true);
  });

  it('normalizes host casing and whitespace', () => {
    expect(isRemoteExposure(' LOCALHOST ')).toBe(false);
  });
});

describe('API key comparison', () => {
  it('accepts identical non-empty keys', () => {
    expect(timingSafeApiKeyMatch('a'.repeat(32), 'a'.repeat(32))).toBe(true);
  });

  it('rejects different keys and empty values', () => {
    expect(timingSafeApiKeyMatch('a'.repeat(32), 'b'.repeat(32))).toBe(false);
    expect(timingSafeApiKeyMatch('', 'a'.repeat(32))).toBe(false);
    expect(timingSafeApiKeyMatch('a'.repeat(32), '')).toBe(false);
  });

  it('rejects keys of different byte lengths', () => {
    expect(timingSafeApiKeyMatch('short', 'a'.repeat(32))).toBe(false);
  });
});
