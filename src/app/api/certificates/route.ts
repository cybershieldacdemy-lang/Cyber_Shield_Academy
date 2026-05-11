import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

function generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CS-';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const user_id = searchParams.get('user_id');
        const code = searchParams.get('code');

        // Public: Verify certificate by code (anyone can verify)
        if (code) {
            const cert = db.prepare('SELECT * FROM certificates WHERE certificate_code = ?').get(code);
            if (!cert) return NextResponse.json({ message: 'الشهادة غير موجودة' }, { status: 404 });
            return NextResponse.json({ certificate: cert, valid: true });
        }

        // Protected: List user's certificates (requires auth)
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        // Only allow users to see their own certificates (or admin sees any)
        const targetUserId = user_id || payload.id;
        if (targetUserId !== payload.id && payload.role !== 'admin') {
            return NextResponse.json({ message: 'غير مصرح بالوصول' }, { status: 403 });
        }

        const certs = db.prepare('SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC').all(targetUserId);
        return NextResponse.json({ certificates: certs });
    } catch (error) {
        console.error('Certificates GET error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Require authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        const { course_id, course_title } = await req.json();

        if (!course_id || !course_title) {
            return NextResponse.json({ message: 'بيانات الدورة مطلوبة' }, { status: 400 });
        }

        // Get user name from DB (don't trust client)
        const user = db.prepare('SELECT name FROM users WHERE id = ?').get(payload.id) as any;
        if (!user) return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });

        // Check if certificate already exists
        const existing = db.prepare('SELECT * FROM certificates WHERE user_id = ? AND course_id = ?').get(payload.id, course_id);
        if (existing) {
            return NextResponse.json({ message: 'الشهادة موجودة بالفعل', certificate: existing });
        }

        const code = generateCode();
        db.prepare(
            'INSERT INTO certificates (user_id, user_name, course_id, course_title, certificate_code) VALUES (?, ?, ?, ?, ?)'
        ).run(payload.id, user.name, course_id, course_title, code);

        const cert = db.prepare('SELECT * FROM certificates WHERE certificate_code = ?').get(code);

        return NextResponse.json({ message: 'تم إصدار الشهادة', certificate: cert }, { status: 201 });
    } catch (error) {
        console.error('Certificate POST error:', error);
        return NextResponse.json({ message: 'خطأ في إصدار الشهادة' }, { status: 500 });
    }
}
