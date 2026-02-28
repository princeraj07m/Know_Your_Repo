/**
 * Turns backend/HTTP errors into a short, safe, user-facing message.
 * Never returns HTML or raw server responses.
 */
export function normalizeErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return sanitizeMessage(err.message, fallback);
  if (typeof err === 'object' && err !== null && 'name' in err && (err as { name: string }).name === 'TimeoutError') {
    return 'The request took too long. Please try again.';
  }
  if (typeof err === 'object' && err !== null && 'error' in err) {
    const e = (err as { error?: unknown }).error;
    if (typeof e === 'string') return sanitizeMessage(e, fallback);
    if (e && typeof e === 'object') {
      if ('error' in e && typeof (e as { error?: unknown }).error === 'string') {
        return sanitizeMessage((e as { error: string }).error, fallback);
      }
      if ('message' in e) {
        return sanitizeMessage(String((e as { message: unknown }).message), fallback);
      }
    }
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return sanitizeMessage(String((err as { message: unknown }).message), fallback);
  }
  return fallback;
}

/** Strip HTML and long technical text; return a short safe message. */
function sanitizeMessage(raw: string, fallback: string): string {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  // If it looks like HTML, extract text from <pre> or use fallback
  if (isHtml(trimmed)) {
    const pre = extractPreText(trimmed);
    if (pre) return friendlyApiMessage(pre);
    return fallback;
  }

  // Plain text but might be long or technical
  return friendlyApiMessage(trimmed);
}

function isHtml(s: string): boolean {
  return /^\s*</.test(s) || /<html/i.test(s) || /<!DOCTYPE/i.test(s);
}

function extractPreText(html: string): string | null {
  const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  return match ? match[1].trim() : null;
}

/** Map common API/server phrases to user-friendly text. */
function friendlyApiMessage(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('cannot post') || t.includes('404') || t.includes('not found')) {
    return 'Service unavailable. Please check that the server is running and try again.';
  }
  if (t.includes('500') || t.includes('internal server error')) {
    return 'Something went wrong on the server. Please try again later.';
  }
  if (t.includes('network') || t.includes('failed to fetch') || t.includes('connection')) {
    return 'Connection failed. Check your network and try again.';
  }
  if (t.includes('timeout') || t.includes('timed out')) {
    return 'The request took too long. Please try again.';
  }
  // Keep short messages; truncate long technical ones
  if (text.length <= 120) return text;
  return text.slice(0, 117) + '…';
}
