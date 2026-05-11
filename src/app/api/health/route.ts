/**
 * 🏥 Health Check API — System Status Endpoint
 * 
 * Used by Docker, load balancers, and monitoring systems.
 * Returns overall system health + component statuses.
 */
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // ─── Database Check ───
  try {
    const dbStart = Date.now();
    const result = db.prepare('SELECT 1 as ok').get() as any;
    checks.database = {
      status: result?.ok === 1 ? 'healthy' : 'degraded',
      latencyMs: Date.now() - dbStart,
    };
  } catch (e: any) {
    checks.database = { status: 'unhealthy', error: e.message };
  }

  // ─── Table Integrity Check ───
  try {
    const tables = db.prepare(
      `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'`
    ).get() as any;
    checks.schema = {
      status: tables.count >= 30 ? 'healthy' : 'degraded',
      latencyMs: 0,
    };
  } catch (e: any) {
    checks.schema = { status: 'unhealthy', error: e.message };
  }

  // ─── Memory Check ───
  const mem = process.memoryUsage();
  const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
  const isDev = process.env.NODE_ENV !== 'production';
  // Dev mode uses ~2-3GB heap (normal for Next.js 16 HMR), production uses ~200-400MB
  const warnThreshold = isDev ? 4096 : 512;
  const critThreshold = isDev ? 6144 : 1024;
  checks.memory = {
    status: heapUsedMB < warnThreshold ? 'healthy' : heapUsedMB < critThreshold ? 'degraded' : 'unhealthy',
    latencyMs: 0,
  };

  // ─── Overall Status ───
  const statuses = Object.values(checks).map(c => c.status);
  const overall = statuses.every(s => s === 'healthy')
    ? 'healthy'
    : statuses.some(s => s === 'unhealthy')
      ? 'unhealthy'
      : 'degraded';

  const httpStatus = overall === 'healthy' ? 200 : overall === 'degraded' ? 200 : 503;

  return NextResponse.json({
    status: overall,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    responseTimeMs: Date.now() - startTime,
    checks,
    memory: {
      heapUsedMB,
      heapTotalMB,
      rssMB: Math.round(mem.rss / 1024 / 1024),
    },
  }, {
    status: httpStatus,
    headers: { 'Cache-Control': 'no-store' },
  });
}
