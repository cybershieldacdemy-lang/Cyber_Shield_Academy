import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logAudit } from '@/lib/data-protection';
import { getRequestIP } from '@/lib/api-guard';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, newPassword } = body;

        if (!token || !newPassword) {
            return NextResponse.json({ message: 'بيانات غير مكتملة' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ message: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' }, { status: 400 });
        }

        const ip = getRequestIP(request);

        // Find the valid token
        const resetRecord = db.prepare(`
            SELECT id, user_id FROM password_resets 
            WHERE token = ? AND used = 0 AND expires_at > CURRENT_TIMESTAMP
        `).get(token) as { id: string, user_id: string } | undefined;

        if (!resetRecord) {
            logAudit({
                action: 'PASSWORD_RESET_FAILED',
                ip,
                userAgent: request.headers.get('user-agent') || '',
                details: `محاولة استخدام رابط/رمز غير صالح أو منتهي الصلاحية`,
                severity: 'medium'
            });
            return NextResponse.json({ message: 'رابط الاستعادة غير صالح أو منتهي الصلاحية' }, { status: 400 });
        }

        const user = db.prepare('SELECT email FROM users WHERE id = ?').get(resetRecord.user_id) as { email: string } | undefined;
        if (!user) {
            return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Run updates in a transaction
        const transaction = db.transaction(() => {
            // Update password
            db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, resetRecord.user_id);
            // Mark token as used
            db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(resetRecord.id);
            // Invalidate all other pending tokens for this user
            db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0').run(resetRecord.user_id);
        });

        transaction();

        logAudit({
            action: 'PASSWORD_RESET_SUCCESS',
            userId: resetRecord.user_id,
            ip,
            userAgent: request.headers.get('user-agent') || '',
            details: `تم تغيير كلمة المرور بنجاح للمستخدم: ${user.email}`,
            severity: 'high'
        });

        return NextResponse.json({ message: 'تم إعادة ضبط كلمة المرور بنجاح' });

    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json({ message: 'حدث خطأ في الخادم' }, { status: 500 });
    }
}
