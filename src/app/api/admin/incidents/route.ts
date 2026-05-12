import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

// GET /api/admin/incidents
export async function GET(req: Request) {
    const { error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const incidents = db.prepare('SELECT * FROM incidents ORDER BY createdAt DESC').all();
        return NextResponse.json(incidents);
    } catch (error) {
        console.error('Error fetching incidents:', error);
        return NextResponse.json({ message: 'Error fetching incidents' }, { status: 500 });
    }
}

// POST /api/admin/incidents
export async function POST(req: Request) {
    const { user, error, body } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { title, description, severity, status, type, actionsTaken, reportedBy } = body as any;

        if (!title || !severity || !type) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const stmt = db.prepare(`
            INSERT INTO incidents (id, title, description, severity, status, type, actionsTaken, reportedBy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, title, description || '', severity, status || 'OPEN', type, actionsTaken || '', reportedBy || user!.name);

        logAudit({
            action: 'INCIDENT_CREATE',
            userId: user!.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'incidents',
            resourceId: id,
            details: `New Incident: ${title} (${severity})`,
            severity: 'critical'
        });

        return NextResponse.json({ message: 'Incident reported', id }, { status: 201 });
    } catch (error) {
        console.error('Error creating incident:', error);
        return NextResponse.json({ message: 'Error creating incident' }, { status: 500 });
    }
}
