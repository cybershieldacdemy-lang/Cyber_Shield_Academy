import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { guardRoute, getRequestIP } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error, body } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { id } = await params;
        const ip = getRequestIP(req);

        // Prevent self-demotion
        if (user?.id === id && body?.role && body.role !== 'admin') {
            return NextResponse.json({ message: 'لا يمكنك تغيير دورك بنفسك' }, { status: 400 });
        }

        const { role } = body || {};
        if (role && !['user', 'admin'].includes(role as string)) {
            return NextResponse.json({ message: 'دور غير صالح' }, { status: 400 });
        }

        if (role) {
            db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);

            logAudit({
                action: 'DATA_UPDATE',
                userId: user?.id,
                ip,
                resource: 'users',
                resourceId: id,
                details: `تحديث دور المستخدم إلى: ${role}`,
                severity: 'high',
            });
        }

        return NextResponse.json({ message: 'تم تحديث المستخدم' });
    } catch (error) {
        console.error('User PUT error:', error);
        return NextResponse.json({ message: 'خطأ في التحديث' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error } = await guardRoute(req, { requireAuth: true, requireAdmin: true });
    if (error) return error;

    try {
        const { id } = await params;
        const ip = getRequestIP(req);

        // Prevent self-deletion
        if (user?.id === id) {
            return NextResponse.json({ message: 'لا يمكنك حذف حسابك من هنا' }, { status: 400 });
        }

        // Get user info before deletion for audit
        const targetUser = db.prepare('SELECT name, email, role FROM users WHERE id = ?').get(id) as any;

        db.prepare('DELETE FROM users WHERE id = ?').run(id);

        logAudit({
            action: 'DATA_DELETE',
            userId: user?.id,
            ip,
            resource: 'users',
            resourceId: id,
            details: `حذف المستخدم: ${targetUser?.name} (${targetUser?.email})`,
            severity: 'critical',
        });

        return NextResponse.json({ message: 'تم حذف المستخدم' });
    } catch (error) {
        console.error('User DELETE error:', error);
        return NextResponse.json({ message: 'خطأ في الحذف' }, { status: 500 });
    }
}
