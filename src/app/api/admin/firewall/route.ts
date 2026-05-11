import { NextResponse } from 'next/server';
import { getFirewallRules, addFirewallRule } from '@/lib/firewall-service';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

// GET /api/admin/firewall
export async function GET(req: Request) {
    const { error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const rules = getFirewallRules();
        return NextResponse.json(rules);
    } catch {
        return NextResponse.json({ message: 'Error fetching rules' }, { status: 500 });
    }
}

// POST /api/admin/firewall
export async function POST(req: Request) {
    const { user, error, body } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { ip, action, reason } = body as any;

        if (!ip || !action) {
            return NextResponse.json({ message: 'Missing IP or Action' }, { status: 400 });
        }

        // Simple IP validation regex
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(ip)) {
            return NextResponse.json({ message: 'Invalid IP format' }, { status: 400 });
        }

        addFirewallRule(ip, action, reason || 'Manual Rule', (user?.name as string) || 'Admin');

        logAudit({
            action: 'FIREWALL_UPDATE',
            userId: user?.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'firewall',
            details: `Added rule: ${action} ${ip}`,
            severity: 'high'
        });


        return NextResponse.json({ message: 'Rule added' });
    } catch (e) {
        console.error('Firewall add error:', e);
        return NextResponse.json({ message: 'Error adding rule' }, { status: 500 });
    }
}
