import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mailer';
import { logAudit } from '@/lib/data-protection';
import { getRequestIP } from '@/lib/api-guard';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { target, method } = body; // target is email or phone, method is 'email' or 'sms'

        if (!target || !method) {
            return NextResponse.json({ message: 'بيانات غير مكتملة' }, { status: 400 });
        }

        const ip = getRequestIP(request);

        // ═══════ Rate Limiting: max 3 requests per IP per 15 min ═══════
        const recentAttempts = db.prepare(`
            SELECT COUNT(*) as count FROM audit_logs 
            WHERE ip_address = ? AND action = 'FORGOT_PASSWORD_REQUESTED' 
            AND created_at > datetime('now', '-15 minutes')
        `).get(ip) as { count: number };

        if (recentAttempts && recentAttempts.count >= 3) {
            logAudit({
                action: 'RATE_LIMIT_EXCEEDED',
                ip,
                userAgent: request.headers.get('user-agent') || '',
                details: `تم تجاوز الحد الأقصى لطلبات استعادة كلمة المرور (${recentAttempts.count} طلب)`,
                severity: 'medium'
            });
            return NextResponse.json({ 
                message: 'تم تجاوز عدد المحاولات المسموحة. يرجى المحاولة بعد 15 دقيقة.' 
            }, { status: 429 });
        }

        // ALWAYS return this success message immediately after doing the background work (or pretend to)
        // This prevents User Enumeration.
        const successMessage = method === 'email' 
            ? 'إذا كان الحساب موجوداً، سيتم إرسال رابط استعادة إلى بريدك الإلكتروني.'
            : 'إذا كان الحساب موجوداً، سيتم إرسال كود OTP إلى رقم هاتفك.';

        // Look up the user
        let user: { id: string; email?: string; phone?: string } | undefined;
        if (method === 'email') {
            user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(target.toLowerCase().trim()) as { id: string, email: string } | undefined;
        } else {
            // For SMS, assuming target is a phone number
            user = db.prepare('SELECT id, phone FROM users WHERE phone = ?').get(target.trim()) as { id: string, phone: string } | undefined;
        }

        if (!user) {
            // Log failed attempt but return success to user
            logAudit({
                action: 'FORGOT_PASSWORD_FAILED',
                ip,
                userAgent: request.headers.get('user-agent') || '',
                details: `طلب استعادة لحساب غير موجود: ${target} عبر ${method}`,
                severity: 'low'
            });
            return NextResponse.json({ message: successMessage });
        }

        // Generate token
        const resetId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes TTL

        let token;
        if (method === 'email') {
            // Secure 64-char hex token for email links
            token = crypto.randomBytes(32).toString('hex');
            
            // Generate link (assuming absolute URL isn't strictly needed here if we construct it carefully, 
            // but usually we pass the origin from the request headers)
            const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const resetLink = `${origin}/reset-password?token=${token}`;
            
            // Save to DB
            db.prepare(`
                INSERT INTO password_resets (id, user_id, token, type, expires_at)
                VALUES (?, ?, ?, ?, ?)
            `).run(resetId, user.id, token, 'email', expiresAt);

            // Send email
            await sendPasswordResetEmail(user.email!, resetLink);

        } else {
            // 6-digit OTP for SMS
            token = Math.floor(100000 + Math.random() * 900000).toString();

            // Save to DB
            db.prepare(`
                INSERT INTO password_resets (id, user_id, token, type, expires_at)
                VALUES (?, ?, ?, ?, ?)
            `).run(resetId, user.id, token, 'sms', expiresAt);

            // Mock SMS sending (Log it)
            console.log(`\n[SMS MOCK] Sending OTP ${token} to phone ${user.phone!}\n`);
        }

        logAudit({
            action: 'FORGOT_PASSWORD_REQUESTED',
            userId: user.id,
            ip,
            userAgent: request.headers.get('user-agent') || '',
            details: `تم إنشاء رابط/كود استعادة عبر ${method} بنجاح`,
            severity: 'medium'
        });

        return NextResponse.json({ message: successMessage });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ message: 'حدث خطأ في الخادم' }, { status: 500 });
    }
}
