import { NextRequest, NextResponse } from 'next/server';
import db, { statements } from '@/lib/db';

// PUT — Approve or reject a teacher application (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status: newStatus } = body;

        if (!['approved', 'rejected'].includes(newStatus)) {
            return NextResponse.json({ message: 'الحالة غير صالحة' }, { status: 400 });
        }

        const application = statements.getTeacherApplicationById.get(Number(id)) as any;
        if (!application) {
            return NextResponse.json({ message: 'الطلب غير موجود' }, { status: 404 });
        }

        statements.updateTeacherApplicationStatus.run(newStatus, 'admin', Number(id));

        // If approved, update the user's role to instructor (if user exists)
        if (newStatus === 'approved') {
            const user = db.prepare('SELECT id FROM users WHERE email = ?').get(application.email) as any;
            if (user) {
                db.prepare('UPDATE users SET role = ?, account_type = ? WHERE id = ?').run('instructor', 'instructor', user.id);
            }
        }

        return NextResponse.json({
            message: newStatus === 'approved'
                ? 'تم قبول الطلب وترقية المستخدم إلى مدرّب ✅'
                : 'تم رفض الطلب ❌'
        });
    } catch {
        return NextResponse.json({ message: 'حدث خطأ أثناء تحديث الطلب' }, { status: 500 });
    }
}
