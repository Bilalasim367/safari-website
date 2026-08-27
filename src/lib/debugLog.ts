/**
 * debugLog — server-side only diagnostic logger.
 *
 * Writes to BOTH:
 *   1. console.error  (visible in cPanel's built-in log viewer)
 *   2. debug-errors.log at the project root (readable via cPanel File Manager)
 *
 * The file-based log is the critical backup for Passenger/cPanel environments
 * where console output may not be accessible during a cold-start crash.
 *
 * This module is intentionally wrapped in try/catch so a logging failure
 * can never mask the original error.
 */

import fs from 'fs';
import path from 'path';

// Resolve the log file relative to cwd (project root under Passenger)
const LOG_PATH = path.join(process.cwd(), 'debug-errors.log');

export function debugLog(context: string, error: unknown): void {
  // Ignore Next.js internal control-flow exceptions (e.g. DynamicServerError)
  if (
    error &&
    typeof error === 'object' &&
    ('digest' in error && (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE' ||
     'message' in error && typeof (error as { message?: unknown }).message === 'string' && ((error as { message: string }).message.includes('Dynamic server usage') || (error as { message: string }).message.includes('NEXT_REDIRECT')))
  ) {
    return;
  }

  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? (error.stack ?? 'no stack') : 'no stack';

  // 1. Console — appears in cPanel's Node.js app log viewer
  console.error(`[${timestamp}] [${context}] ERROR: ${message}`);
  console.error(`[${timestamp}] [${context}] STACK: ${stack}`);

  // 2. File — readable via cPanel File Manager even after process crash
  try {
    const entry =
      `\n${'='.repeat(80)}\n` +
      `TIMESTAMP : ${timestamp}\n` +
      `CONTEXT   : ${context}\n` +
      `MESSAGE   : ${message}\n` +
      `STACK     :\n${stack}\n`;
    fs.appendFileSync(LOG_PATH, entry, 'utf8');
  } catch {
    // If file write fails (permissions, disk full, etc.), swallow silently —
    // we already logged to console above.
  }
}

export function debugLogMessage(context: string, msg: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${context}] ${msg}`);
  try {
    const entry = `\n[${timestamp}] [${context}] ${msg}\n`;
    fs.appendFileSync(LOG_PATH, entry, 'utf8');
  } catch {
    // swallow
  }
}
