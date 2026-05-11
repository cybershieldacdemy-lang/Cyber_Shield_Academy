import { NextResponse } from 'next/server';
import { guardRoute } from '@/lib/api-guard';
import db from '@/lib/db';
import { logAudit } from '@/lib/data-protection';

// POST /api/auth/2fa/disable
export async function POST(req: Request) {
    const { user, error } = await guardRoute(req, { requireAuth: true });
    if (error) return error;

    try {
        // Disable 2FA for user
        db.prepare(`
            UPDATE users 
            SET twoFactorSecret = NULL, isTwoFactorEnabled = 0 
            WHERE id = ?
        `).run(user!.id);

        logAudit({
            action: 'SECURITY_UPDATE',
            userId: user?.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'user',
            details: 'تم تعطيل المصادقة الثنائية',
            severity: 'high'
        });

        return NextResponse.json({ message: 'تم تعطيل المصادقة الثنائية بنجاح' });
    } catch (e: any) {
        console.error('2FA Disable Error:', e);
        return NextResponse.json({ message: 'حدث خطأ أثناء تعطيل 2FA' }, { status: 500 });
    }
}
