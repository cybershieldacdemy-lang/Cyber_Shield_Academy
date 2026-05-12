import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';
import { randomUUID } from 'crypto';
import { logAudit } from '@/lib/data-protection';

// GET /api/admin/changes
// List change requests
export async function GET(req: Request) {
    const { error } = await guardRoute(req, { requireAdmin: true });
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const entity = searchParams.get('entity');

    try {
        let query = `
            SELECT c.*, u.name as adminName 
            FROM change_logs c 
            JOIN users u ON c.adminId = u.id 
            WHERE 1=1
        `;
        const params: any[] = [];

        if (status) {
            query += ' AND c.status = ?';
            params.push(status);
        }
        if (entity) {
            query += ' AND c.entity = ?';
            params.push(entity);
        }

        query += ' ORDER BY c.createdAt DESC';

        const changes = db.prepare(query).all(...params);
        return NextResponse.json(changes);
    } catch {
        return NextResponse.json({ message: 'Failed to fetch changes' }, { status: 500 });
    }
}

// POST /api/admin/changes
// Create a new change request
export async function POST(req: Request) {
    const { user, error, body } = await guardRoute(req, { requireAdmin: true });
    if (error) return error;

    const { action, entity, entityId, oldValue, newValue, reason } = body as any;

    try {
        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO change_logs (id, action, entity, entityId, oldValue, newValue, adminId, status, reason, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, datetime('now'))
        `);

        stmt.run(
            id, action, entity, entityId || null,
            JSON.stringify(oldValue), JSON.stringify(newValue),
            user!.id, reason || null
        );

        logAudit({
            action: 'CHANGE_REQUESTED',
            userId: user!.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'change_request',
            details: `Requested ${action} on ${entity}`,
            severity: 'medium'
        });

        return NextResponse.json({ message: 'Change request submitted successfully', id }, { status: 201 });
    } catch (error) {
        console.error('Change Request Error:', error);
        return NextResponse.json({ message: 'Failed to create change request' }, { status: 500 });
    }
}
