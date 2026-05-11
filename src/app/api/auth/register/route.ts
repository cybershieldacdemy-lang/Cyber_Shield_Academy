import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { guardRoute } from '@/lib/api-guard';
import { logAudit } from '@/lib/data-protection';
import { RegisterSchema } from '@/lib/schemas';
import { randomUUID } from 'crypto';
import { sendWelcomeEmail } from '@/lib/mailer';

export async function POST(req: Request) {
    const { error, body } = await guardRoute(req, {
        sanitizeBody: false,
        schema: RegisterSchema
    });

    if (error) return error;

    const {
        name, email, password,
        phone, country, bio, experience_level, account_type,
        security_question, security_answer
    } = body as any;

    try {
        // ═══════════════════════════════════════════
        // التحقق من عدم وجود الحساب مسبقاً
        // ═══════════════════════════════════════════
        const checkUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (checkUser) {
            return NextResponse.json(
                { message: 'البريد الإلكتروني مسجل مسبقاً' },
                { status: 409 }
            );
        }

        // ═══════════════════════════════════════════
        // إنشاء الحساب
        // ═══════════════════════════════════════════
        const hashedPassword = await hashPassword(password);
        const hashedSecurityAnswer = await hashPassword(security_answer.trim().toLowerCase());
        const id = randomUUID();
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const insertUser = db.prepare(`
            INSERT INTO users(id, name, email, password, role, phone, country, bio, experience_level, account_type, security_question, security_answer, verification_code)
            VALUES(?, ?, ?, ?, 'user', ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertUser.run(
            id, name, email, hashedPassword,
            phone || '', country || '', bio || '', experience_level || 'beginner',
            account_type || 'student',
            security_question, hashedSecurityAnswer,
            verificationCode
        );

        logAudit({
            action: 'REGISTER',
            userId: id,
            ip: req.headers.get('x-real-ip') || '127.0.0.1',
            userAgent: req.headers.get('user-agent') || '',
            resource: '/api/auth/register',
            details: `تسجيل حساب جديد — النوع: ${account_type || 'student'} `,
            severity: 'low',
        });

        // Send welcome email (async, non-blocking)
        sendWelcomeEmail(email, name).catch(err => console.error('Welcome email error:', err));

        return NextResponse.json({
            message: 'تم إنشاء الحساب بنجاح! 🎉',
            user: { id, name, email, role: 'user', experience_level: experience_level || 'beginner', account_type: account_type || 'student' },
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ داخلي في الخادم' },
            { status: 500 }
        );
    }
}
