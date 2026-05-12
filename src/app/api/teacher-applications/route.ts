import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db, { statements } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET — List all teacher applications (admin only)
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        const payload = verifyToken(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ message: 'صلاحية المشرف مطلوبة' }, { status: 403 });
        }

        const applications = statements.getTeacherApplications.all();
        return NextResponse.json({ applications });
    } catch {
        return NextResponse.json({ message: 'خطأ في جلب الطلبات' }, { status: 500 });
    }
}

// POST — Submit a teacher application (public)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, specialization, experience, cv_link } = body;

        if (!name || !email || !specialization || !experience) {
            return NextResponse.json({ message: 'جميع الحقول المطلوبة يجب ملؤها' }, { status: 400 });
        }

        // Check for duplicate application
        const existing = db.prepare('SELECT id FROM teacher_applications WHERE email = ? AND status = ?').get(email, 'pending');
        if (existing) {
            return NextResponse.json({ message: 'لديك طلب قيد المراجعة بالفعل' }, { status: 409 });
        }

        statements.insertTeacherApplication.run(name, email, specialization, experience, cv_link || '');

        return NextResponse.json({ message: 'تم إرسال طلبك بنجاح! سنراجعه ونرد عليك قريباً ✅' }, { status: 201 });
    } catch {
        return NextResponse.json({ message: 'حدث خطأ أثناء إرسال الطلب' }, { status: 500 });
    }
}
