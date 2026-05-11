import { NextResponse } from 'next/server';
import { getComplianceStatus, updateComplianceStatus } from '@/lib/compliance-service';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

// GET /api/admin/compliance
export async function GET(req: Request) {
    const { error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const data = getComplianceStatus();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Compliance GET error:', error);
        return NextResponse.json({ message: 'Error fetching compliance data' }, { status: 500 });
    }
}

// POST /api/admin/compliance (Assess/Update)
export async function POST(req: Request) {
    const { user, error, body } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { standardId, controlId, status, notes } = body as any;

        if (!standardId || !controlId || !status) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        updateComplianceStatus(standardId, controlId, status, notes || '');

        logAudit({
            action: 'COMPLIANCE_UPDATE',
            userId: user!.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'compliance',
            details: `Updated ${standardId}:${controlId} to ${status}`,
            severity: 'medium'
        });

        return NextResponse.json({ message: 'Status updated' });
    } catch (error) {
        console.error('Compliance POST error:', error);
        return NextResponse.json({ message: 'Error updating compliance' }, { status: 500 });
    }
}
