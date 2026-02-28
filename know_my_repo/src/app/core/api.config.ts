/**
 * Base URL for API. In dev, use '/api' so the Angular dev server proxies to
 * http://localhost:3000 (see proxy.conf.json) and avoids CORS.
 * In production, set to your backend origin or use a relative /api with a reverse proxy.
 */
export const API_BASE_URL = '/api';

/** Request timeouts in ms (upload/analyze can be slow). */
export const API_UPLOAD_TIMEOUT_MS = 300_000;  // 5 min
export const API_ANALYZE_TIMEOUT_MS = 300_000; // 5 min
export const API_EXPLAIN_TIMEOUT_MS = 120_000; // 2 min

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
