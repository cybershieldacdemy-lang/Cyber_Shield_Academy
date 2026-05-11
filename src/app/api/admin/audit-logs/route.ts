import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';

// GET /api/admin/audit-logs
// Fetch audit logs with filtering and pagination
export async function GET(req: Request) {
    const { error } = await guardRoute(req, { requireAdmin: true });
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const action = searchParams.get('action') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
        let query = `
            SELECT a.*, u.name as userName, u.email as userEmail 
            FROM audit_logs a 
            LEFT JOIN users u ON a.user_id = u.id 
            WHERE 1=1
        `;
        const params: any[] = [];

        if (userId) {
            query += ' AND a.user_id = ?';
            params.push(userId);
        }
        if (action) {
            query += ' AND a.action = ?';
            params.push(action);
        }
        if (severity) {
            query += ' AND a.severity = ?';
            params.push(severity);
        }

        // Count total for pagination
        const countQuery = query.replace('SELECT a.*, u.name as userName, u.email as userEmail', 'SELECT COUNT(*) as total');
        const total = (db.prepare(countQuery).get(...params) as any).total;

        query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const logs = db.prepare(query).all(...params);

        return NextResponse.json({
            data: logs,
            pagination: {
                total,
                limit,
                offset,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Audit Log Fetch Error:', error);
        return NextResponse.json({ message: 'Failed to fetch audit logs' }, { status: 500 });
    }
}
