import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

// PUT /api/admin/incidents/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error, body } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { id } = await params;
        const { title, description, severity, status, type, actionsTaken } = body as any;

        const stmt = db.prepare(`
            UPDATE incidents 
            SET title = ?, description = ?, severity = ?, status = ?, type = ?, actionsTaken = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        const result = stmt.run(title, description, severity, status, type, actionsTaken, id);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'Incident not found' }, { status: 404 });
        }

        logAudit({
            action: 'INCIDENT_UPDATE',
            userId: user!.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'incidents',
            resourceId: id,
            details: `Updated incident: ${title}`,
            severity: 'medium'
        });

        return NextResponse.json({ message: 'Incident updated' });
    } catch (error) {
        console.error('Error updating incident:', error);
        return NextResponse.json({ message: 'Error updating incident' }, { status: 500 });
    }
}

// DELETE /api/admin/incidents/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { id } = await params;
        const stmt = db.prepare('DELETE FROM incidents WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'Incident not found' }, { status: 404 });
        }

        logAudit({
            action: 'INCIDENT_DELETE',
            userId: user!.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'incidents',
            resourceId: id,
            details: `Deleted incident ${id}`,
            severity: 'high'
        });

        return NextResponse.json({ message: 'Incident deleted' });
    } catch (error) {
        console.error('Error deleting incident:', error);
        return NextResponse.json({ message: 'Error deleting incident' }, { status: 500 });
    }
}
