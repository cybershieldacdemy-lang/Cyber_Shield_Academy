import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

// POST /api/admin/changes/[id]/decision
// Approve or Reject a change request
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error, body } = await guardRoute(req, { requireAdmin: true });
    if (error) return error;

    const { decision, reason } = body as any; // 'APPROVED' or 'REJECTED'
    const { id } = await params;

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
        return NextResponse.json({ message: 'Invalid decision' }, { status: 400 });
    }

    try {
        const stmt = db.prepare(`
            UPDATE change_logs 
            SET status = ?, reason = ? 
            WHERE id = ?
        `);

        const result = stmt.run(decision, reason || null, id);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'Change request not found' }, { status: 404 });
        }

        // NOTE: This is an audit-only change management workflow.
        // Approved changes are logged for compliance tracking.
        // Actual system changes (e.g., applying JSON deltas) should be
        // implemented per-resource when the admin panel supports direct editing.

        logAudit({
            action: `CHANGE_${decision}`,
            userId: user!.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'change_request',
            resourceId: id,
            details: `Change request ${decision} by admin`,
            severity: 'high'
        });

        return NextResponse.json({ message: `Change request ${decision} successfully` });
    } catch (error) {
        console.error('Change Decision Error:', error);
        return NextResponse.json({ message: 'Failed to process decision' }, { status: 500 });
    }
}
