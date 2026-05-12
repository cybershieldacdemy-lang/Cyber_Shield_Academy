/**
 * 📊 System Logs API — Admin Log Viewer
 * GET: Query system logs with filtering
 * DELETE: Clear old logs
 */
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';

// GET — Query logs with filters
export async function GET(request: NextRequest) {
  return guardRoute(request, { requireAuth: true, requireAdmin: true }, async () => {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');
    const since = searchParams.get('since'); // ISO date string

    let where = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (level) {
      where += ' AND level = ?';
      params.push(level);
    }
    if (category) {
      where += ' AND category = ?';
      params.push(category);
    }
    if (since) {
      where += ' AND created_at > ?';
      params.push(since);
    }

    const countResult = db.prepare(
      `SELECT COUNT(*) as total FROM system_logs ${where}`
    ).get(...params) as any;

    const logs = db.prepare(
      `SELECT * FROM system_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);

    // Parse metadata JSON
    const parsed = (logs as any[]).map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));

    // Summary stats
    const stats = db.prepare(`
      SELECT 
        level,
        COUNT(*) as count
      FROM system_logs
      WHERE created_at > datetime('now', '-24 hours')
      GROUP BY level
    `).all();

    return NextResponse.json({
      logs: parsed,
      total: countResult?.total || 0,
      stats,
    });
  });
}

// DELETE — Clear logs older than specified days
export async function DELETE(request: NextRequest) {
  return guardRoute(request, { requireAuth: true, requireAdmin: true }, async () => {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const result = db.prepare(
      `DELETE FROM system_logs WHERE created_at < datetime('now', '-${days} days')`
    ).run();

    return NextResponse.json({
      success: true,
      deleted: result.changes,
      message: `Cleared logs older than ${days} days`,
    });
  });
}
