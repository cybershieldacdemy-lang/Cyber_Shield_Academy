import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { guardRoute } from '@/lib/api-guard';
import { getAuditLogs, logAudit } from '@/lib/data-protection';

/** GET /api/audit-logs — Admin-only audit log viewer */
export async function GET(req: Request) {
    const { user, error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
        const action = searchParams.get('action') || undefined;
        const severity = searchParams.get('severity') || undefined;
        const userId = searchParams.get('userId') || undefined;

        const logs = getAuditLogs({ userId, action: action as any, severity, limit, offset });

        const { total } = db.prepare(
            'SELECT COUNT(*) as total FROM audit_logs'
        ).get() as any;

        logAudit({
            action: 'DATA_ACCESS',
            userId: user?.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'audit_logs',
            details: 'عرض سجل العمليات',
            severity: 'low',
        });

        return NextResponse.json({ logs, total });
    } catch (err) {
        console.error('Audit logs error:', err);
        return NextResponse.json({ message: 'خطأ في جلب السجلات' }, { status: 500 });
    }
}

/** DELETE /api/audit-logs — Clear old audit logs (admin only, keep last 30 days) */
export async function DELETE(req: Request) {
    const { user, error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const result = db.prepare(
            "DELETE FROM audit_logs WHERE created_at < datetime('now', '-30 days')"
        ).run();

        logAudit({
            action: 'ADMIN_ACTION',
            userId: user?.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'audit_logs',
            details: `حذف ${result.changes} سجل قديم (أقدم من 30 يوم)`,
            severity: 'high',
        });

        return NextResponse.json({ message: `تم حذف ${result.changes} سجل قديم`, deleted: result.changes });
    } catch (err) {
        console.error('Audit delete error:', err);
        return NextResponse.json({ message: 'خطأ في حذف السجلات' }, { status: 500 });
    }
}
