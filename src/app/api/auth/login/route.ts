import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';
import { LoginSchema } from '@/lib/schemas';

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-real-ip')
            || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || '127.0.0.1';
        const userAgent = req.headers.get('user-agent') || '';

        const { error, body } = await guardRoute(req, {
            sanitizeBody: false, // Zod handles sanitization/validation
            schema: LoginSchema
        });

        if (error) return error;

        const { email, password } = body as any;

        try {

            if (!email || !password) {
                return NextResponse.json(
                    { message: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
                    { status: 400 }
                );
            }

            const normalizedEmail = email.toLowerCase().trim();
            console.log(`[Login Attempt] Email: ${normalizedEmail}`);

            // ═══════════════════════════════════════════
            // تسجيل محاولة الدخول
            // ═══════════════════════════════════════════
            const logAttempt = db.prepare(
                'INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES (?, ?, ?, ?)'
            );

            // Check for too many failed attempts from this IP in last 15 minutes
            const recentFails = db.prepare(
                `SELECT COUNT(*) as count FROM login_attempts 
                 WHERE ip_address = ? AND success = 0 
                 AND created_at > datetime('now', '-15 minutes')`
            ).get(ip) as { count: number };

            if (recentFails.count >= 10) {
                logAudit({
                    action: 'SUSPICIOUS_ACTIVITY',
                    ip, userAgent,
                    resource: '/api/auth/login',
                    details: `حظر IP بسبب ${recentFails.count} محاولة فاشلة`,
                    severity: 'critical',
                });

                return NextResponse.json(
                    { message: 'تم تجاوز عدد المحاولات. حاول بعد 15 دقيقة.' },
                    { status: 429, headers: { 'Retry-After': '900' } }
                );
            }

            // Find user
            const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;
            console.log(`[Login Attempt] DB Search Result:`, user ? `Found (ID: ${user.id})` : 'Not Found');

            if (!user) {
                logAttempt.run(normalizedEmail, ip, userAgent, 0);
                logAudit({
                    action: 'LOGIN_FAILED',
                    ip, userAgent,
                    resource: '/api/auth/login',
                    details: `بريد غير موجود: ${normalizedEmail}`,
                    severity: 'medium',
                });

                return NextResponse.json(
                    { message: 'البريد الإلكتروني غير مسجل في النظام' },
                    { status: 401 }
                );
            }

            // Verify password securely
            let isValid = false;
            try {
                if (user && user.password) {
                    isValid = await comparePassword(password, user.password);
                }
            } catch (pwdError) {
                console.error('[Login] Password comparison error:', pwdError);
                isValid = false;
            }

            console.log(`[Login Attempt] Password Verification: ${isValid ? 'Success' : 'Failed'}`);

            if (!isValid) {
                logAttempt.run(normalizedEmail, ip, userAgent, 0);
                logAudit({
                    action: 'LOGIN_FAILED',
                    userId: user.id,
                    ip, userAgent,
                    resource: '/api/auth/login',
                    details: 'كلمة مرور خاطئة',
                    severity: 'medium',
                });

                return NextResponse.json(
                    { message: 'كلمة المرور غير صحيحة' },
                    { status: 401 }
                );
            }

            // ═══════════════════════════════════════════
            // تسجيل دخول ناجح
            // ═══════════════════════════════════════════
            logAttempt.run(normalizedEmail, ip, userAgent, 1);
            logAudit({
                action: 'LOGIN',
                userId: user.id,
                ip, userAgent,
                resource: '/api/auth/login',
                details: `تسجيل دخول ناجح — الدور: ${user.role}`,
                severity: 'low',
            });

            // Create token with role and account_type
            const token = signToken({ id: user.id, email: user.email, role: user.role, account_type: user.account_type });

            // Remove sensitive fields from response
            const { password: _pwd, security_answer: _sa, verification_code: _vc, ...userWithoutSensitive } = user;

            const response = NextResponse.json(
                { message: 'تم تسجيل الدخول بنجاح', token, user: userWithoutSensitive },
                { status: 200 }
            );

            // Set HTTP-only cookie for server-side auth
            response.cookies.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60, // 7 days
            });

            return response;
        } catch (error: any) {
            console.error('🔥 [Login Inner Error]:', error?.message || error);
            
            // Log the internal error securely without crashing
            logAudit({
                action: 'LOGIN_FAILED',
                ip, userAgent,
                resource: '/api/auth/login',
                details: `مشكلة تقنية أثناء تسجيل الدخول: ${error?.message || 'Unknown Error'}`,
                severity: 'high',
            });

            // Return 401 instead of 500 so frontend handles it gracefully as bad data
            return NextResponse.json(
                { message: 'بيانات غير صحيحة أو تعذر الاتصال' },
                { status: 401 }
            );
        }
    } catch (topLevelError: any) {
        console.error('🔥 [Login Top-Level Error]:', topLevelError);
        return NextResponse.json(
            { message: 'حدث خطأ في الخادم' },
            { status: 500 }
        );
    }
}
