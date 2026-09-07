/**
 * Security utilities for link generation, sanitization, and clipboard operations.
 */

// Allow only alphanumeric characters, underscores, and hyphens for mystery identifiers
const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Validates and sanitizes a mystery ID to ensure safe embedding in URLs and state.
 */
export function sanitizeMysteryId(id: string | null | undefined): string {
  if (!id || typeof id !== 'string') return 'voynich';
  const trimmed = id.trim();
  if (SAFE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }
  // Remove any character that is not alphanumeric, hyphen, or underscore
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  return sanitized || 'voynich';
}

/**
 * Generates a clean, validated canonical URL for sharing a mystery.
 * Enforces http/https protocol and protects against protocol injection.
 */
export function generateSecureMysteryShareUrl(mysteryId: string): string {
  const safeId = sanitizeMysteryId(mysteryId);

  try {
    const currentOrigin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://sjeldenkunnskap.no';

    const currentPath =
      typeof window !== 'undefined' && window.location.pathname
        ? window.location.pathname
        : '/';

    const url = new URL(currentPath, currentOrigin);

    // Strict protocol check (only allow http or https)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      url.protocol = 'https:';
    }

    url.searchParams.set('mystery', safeId);
    return url.toString();
  } catch {
    // Fallback safe relative URL string
    return `/?mystery=${encodeURIComponent(safeId)}`;
  }
}

/**
 * Robust, cross-browser clipboard copy function.
 * Designed to work reliably in iframe environments, sandboxed windows,
 * and restricted permissions contexts with fallback.
 */
export async function copyTextSafelyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try standard Navigator Clipboard API if available in a secure context
  if (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or blocked by iframe permissions policy, fallback below
    }
  }

  // 2. Fallback: Hidden, read-only textarea with document.execCommand('copy')
  if (typeof document !== 'undefined') {
    let textarea: HTMLTextAreaElement | null = null;
    try {
      textarea = document.createElement('textarea');
      textarea.value = text;
      // Prevent zooming/scrolling on mobile
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      textarea.style.opacity = '0';
      textarea.style.zIndex = '-9999';

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      const successful = document.execCommand('copy');
      return successful;
    } catch {
      return false;
    } finally {
      if (textarea && textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
    }
  }

  return false;
}

/**
 * Sanitizes plain text for mailto or query param payloads,
 * stripping CRLF (carriage return and line feed) characters to prevent header injection.
 */
export function sanitizePlainText(input: string): string {
  if (!input) return '';
  return input.replace(/[\r\n]+/g, ' ').trim();
}
