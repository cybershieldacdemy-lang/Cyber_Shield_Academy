/**
 * 📊 Structured Logging System
 * 
 * Production-grade logging with levels, categories, and DB persistence.
 * Replaces scattered console.log calls with a unified logging interface.
 */
import db from '@/lib/db';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type LogCategory = 'system' | 'auth' | 'api' | 'security' | 'database' | 'performance' | 'user_action';

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  ipAddress?: string;
  requestPath?: string;
  responseStatus?: number;
  responseTimeMs?: number;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

// Minimum level to persist to DB (info+ in prod, debug in dev)
const MIN_DB_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
// Minimum level to console output
const MIN_CONSOLE_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

let insertStmt: ReturnType<typeof db.prepare> | null = null;

function getInsertStmt() {
  if (!insertStmt) {
    try {
      insertStmt = db.prepare(`
        INSERT INTO system_logs (level, category, message, metadata, user_id, ip_address, request_path, response_status, response_time_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
    } catch {
      // Table might not exist yet
    }
  }
  return insertStmt;
}

function log(entry: LogEntry) {
  const levelNum = LOG_LEVELS[entry.level];

  // Console output
  if (levelNum >= LOG_LEVELS[MIN_CONSOLE_LEVEL]) {
    const prefix = `[${entry.level.toUpperCase()}][${entry.category}]`;
    const msg = `${prefix} ${entry.message}`;
    if (entry.level === 'error' || entry.level === 'critical') {
      console.error(msg, entry.metadata || '');
    } else if (entry.level === 'warn') {
      console.warn(msg, entry.metadata || '');
    } else {
      console.log(msg, entry.metadata || '');
    }
  }

  // DB persistence
  if (levelNum >= LOG_LEVELS[MIN_DB_LEVEL]) {
    try {
      const stmt = getInsertStmt();
      stmt?.run(
        entry.level,
        entry.category,
        entry.message,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        entry.userId || null,
        entry.ipAddress || null,
        entry.requestPath || null,
        entry.responseStatus || null,
        entry.responseTimeMs || null,
      );
    } catch {
      // Silently skip if DB write fails
    }
  }
}

// ─── Convenience Methods ───
export const logger = {
  debug: (category: LogCategory, message: string, meta?: Record<string, unknown>) =>
    log({ level: 'debug', category, message, metadata: meta }),

  info: (category: LogCategory, message: string, meta?: Record<string, unknown>) =>
    log({ level: 'info', category, message, metadata: meta }),

  warn: (category: LogCategory, message: string, meta?: Record<string, unknown>) =>
    log({ level: 'warn', category, message, metadata: meta }),

  error: (category: LogCategory, message: string, meta?: Record<string, unknown>) =>
    log({ level: 'error', category, message, metadata: meta }),

  critical: (category: LogCategory, message: string, meta?: Record<string, unknown>) =>
    log({ level: 'critical', category, message, metadata: meta }),

  // ─── Specialized Loggers ───
  auth: (message: string, meta?: Record<string, unknown>) =>
    log({ level: 'info', category: 'auth', message, metadata: meta }),

  authFail: (message: string, meta?: Record<string, unknown>) =>
    log({ level: 'warn', category: 'auth', message, metadata: meta }),

  security: (message: string, meta?: Record<string, unknown>) =>
    log({ level: 'warn', category: 'security', message, metadata: meta }),

  api: (path: string, status: number, timeMs: number, meta?: Record<string, unknown>) =>
    log({
      level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
      category: 'api',
      message: `${status} ${path} (${timeMs}ms)`,
      requestPath: path,
      responseStatus: status,
      responseTimeMs: timeMs,
      metadata: meta,
    }),

  perf: (message: string, durationMs: number, meta?: Record<string, unknown>) =>
    log({
      level: durationMs > 5000 ? 'warn' : 'info',
      category: 'performance',
      message: `${message} (${durationMs}ms)`,
      responseTimeMs: durationMs,
      metadata: meta,
    }),
};

export default logger;
