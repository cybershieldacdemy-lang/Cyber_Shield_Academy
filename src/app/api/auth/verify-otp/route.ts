import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import { logAudit } from '@/lib/data-protection';
import { getRequestIP } from '@/lib/api-guard';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { target, otp } = body; // target is the phone number

        if (!target || !otp) {
            return NextResponse.json({ message: 'الرجاء إدخال الرمز' }, { status: 400 });
        }

        const ip = getRequestIP(request);

        // Find the user by phone
        const user = db.prepare('SELECT id FROM users WHERE phone = ?').get(target.trim()) as { id: string } | undefined;
        if (!user) {
            return NextResponse.json({ message: 'رمز غير صالح أو منتهي الصلاحية' }, { status: 400 });
        }

        // Find a valid OTP
        const resetRecord = db.prepare(`
            SELECT id FROM password_resets 
            WHERE user_id = ? AND token = ? AND type = 'sms' AND used = 0 AND expires_at > CURRENT_TIMESTAMP
        `).get(user.id, otp.trim()) as { id: string } | undefined;

        if (!resetRecord) {
            logAudit({
                action: 'OTP_VERIFICATION_FAILED',
                userId: user.id,
                ip,
                userAgent: request.headers.get('user-agent') || '',
                details: `محاولة فاشلة لإدخال OTP للرقم: ${target}`,
                severity: 'low'
            });
            return NextResponse.json({ message: 'رمز غير صالح أو منتهي الصلاحية' }, { status: 400 });
        }

        // Mark OTP as used
        db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(resetRecord.id);

        // Generate a standard reset token now that they passed OTP
        const resetId = crypto.randomUUID();
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        db.prepare(`
            INSERT INTO password_resets (id, user_id, token, type, expires_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(resetId, user.id, resetToken, 'email', expiresAt); // Type 'email' basically means standard hex token

        logAudit({
            action: 'OTP_VERIFICATION_SUCCESS',
            userId: user.id,
            ip,
            userAgent: request.headers.get('user-agent') || '',
            details: `نجح التحقق من OTP وتم إصدار رمز استعادة جديد`,
            severity: 'low'
        });

        return NextResponse.json({ 
            message: 'تم التحقق بنجاح', 
            token: resetToken 
        });

    } catch (error: any) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ message: 'حدث خطأ في الخادم' }, { status: 500 });
    }
}
