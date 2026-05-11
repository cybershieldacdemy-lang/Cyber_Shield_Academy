import { NextResponse } from 'next/server';
import { deleteFirewallRule } from '@/lib/firewall-service';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { id } = await params;
        deleteFirewallRule(id);

        logAudit({
            action: 'FIREWALL_UPDATE',
            userId: user?.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'firewall',
            resourceId: id,
            details: 'Deleted firewall rule',
            severity: 'medium'
        });


        return NextResponse.json({ message: 'Rule deleted' });
    } catch {
        return NextResponse.json({ message: 'Error deleting rule' }, { status: 500 });
    }
}
