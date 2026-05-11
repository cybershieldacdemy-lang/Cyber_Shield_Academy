import { NextResponse } from 'next/server';
import { verifyTwoFactorToken } from '@/lib/two-factor';
import { guardRoute } from '@/lib/api-guard';
import db from '@/lib/db';
import { logAudit, encryptData } from '@/lib/data-protection';

// POST /api/auth/2fa/verify
export async function POST(req: Request) {
    const { user, error, body } = await guardRoute(req, { requireAuth: true });
    if (error) return error;

    try {
        const { token, secret } = body as any;

        if (!token || !secret) {
            return NextResponse.json({ message: 'الرمز السري والمفتاح مطلوبان' }, { status: 400 });
        }

        const isValid = verifyTwoFactorToken(token, secret);

        if (!isValid) {
            // Log failed 2FA attempt
            logAudit({
                action: 'SECURITY_UPDATE',
                userId: user?.id,
                ip: req.headers.get('x-real-ip') || '127.0.0.1',
                resource: '2fa',
                details: 'فشل في التحقق من المصادقة الثنائية (رمز غير صحيح)',
                severity: 'medium'
            });
            return NextResponse.json({ message: 'الرمز غير صحيح' }, { status: 400 });
        }

        // Encrypt secret before storing
        const encryptedSecret = encryptData(secret);

        // Enable 2FA for user
        db.prepare(`
            UPDATE users 
            SET twoFactorSecret = ?, isTwoFactorEnabled = 1 
            WHERE id = ?
        `).run(encryptedSecret, user!.id);

        logAudit({
            action: 'SECURITY_UPDATE',
            userId: user?.id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            resource: 'user',
            details: 'تم تفعيل المصادقة الثنائية بنجاح',
            severity: 'high'
        });

        return NextResponse.json({ message: 'تم تفعيل المصادقة الثنائية بنجاح' });
    } catch (e: any) {
        console.error('2FA Verify Error:', e);
        return NextResponse.json({ message: 'حدث خطأ أثناء التفعيل' }, { status: 500 });
    }
}
