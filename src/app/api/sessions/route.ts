import { NextRequest, NextResponse } from 'next/server';
import db, { statements } from '@/lib/db';
import crypto from 'crypto';
import { verifyToken } from '@/lib/auth';

// GET — List sessions for current user
export async function GET(_request: NextRequest) {
    try {
        const sessions = db.prepare(`
            SELECT ls.*, 
                   t.name as teacher_name,
                   s.name as student_name
            FROM live_sessions ls
            LEFT JOIN users t ON ls.teacher_id = t.id
            LEFT JOIN users s ON ls.student_id = s.id
            ORDER BY ls.scheduled_at DESC
        `).all();
        return NextResponse.json({ sessions });
    } catch {
        return NextResponse.json({ message: 'خطأ في جلب الجلسات' }, { status: 500 });
    }
}

// POST — Create/schedule a new session (requires teacher/admin)
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });
        }
        const payload = verifyToken(token);
        if (!payload || !payload.id || (payload.role !== 'teacher' && payload.role !== 'admin')) {
            return NextResponse.json({ message: 'غير مصرح. يجب أن تكون مدرّباً أو مشرفاً.' }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, student_id, session_type, scheduled_at } = body;

        if (!title || !scheduled_at) {
            return NextResponse.json({ message: 'العنوان وموعد الجلسة مطلوبة' }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const room_id = crypto.randomUUID();

        statements.insertLiveSession.run(
            id, title, description || '', payload.id,
            student_id || null, session_type || 'video',
            scheduled_at, room_id
        );

        return NextResponse.json({
            message: 'تم جدولة الجلسة بنجاح ✅',
            session: { id, room_id }
        }, { status: 201 });
    } catch {
        return NextResponse.json({ message: 'حدث خطأ أثناء إنشاء الجلسة' }, { status: 500 });
    }
}
