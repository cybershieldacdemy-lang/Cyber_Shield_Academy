import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherOnly = searchParams.get('teacher') === 'true';

        let query = `
            SELECT l.*, u.name as teacher_name 
            FROM live_sessions l 
            JOIN users u ON l.teacher_id = u.id 
            ORDER BY l.scheduled_at ASC
        `;
        let params: any[] = [];

        if (teacherOnly) {
            const cookieStore = await cookies();
            const token = cookieStore.get('token')?.value;
            if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
            const payload = verifyToken(token);
            if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
            
            query = `
                SELECT l.*, u.name as teacher_name 
                FROM live_sessions l 
                JOIN users u ON l.teacher_id = u.id 
                WHERE l.teacher_id = ?
                ORDER BY l.scheduled_at ASC
            `;
            params = [payload.id];
        }

        const sessions = db.prepare(query).all(...params);
        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('Live GET error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'teacher') {
            return NextResponse.json({ message: 'مسموح فقط للمدرسين' }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, scheduled_at } = body;

        if (!title || !scheduled_at) {
            return NextResponse.json({ message: 'عنوان وتاريخ الجلسة مطلوبان' }, { status: 400 });
        }

        const sessionId = crypto.randomUUID();

        db.prepare(`
            INSERT INTO live_sessions (id, teacher_id, title, description, scheduled_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(sessionId, payload.id, title, description || '', scheduled_at);

        return NextResponse.json({ message: 'تم جدولة الجلسة الحية بنجاح', id: sessionId }, { status: 201 });
    } catch (error) {
        console.error('Live POST error:', error);
        return NextResponse.json({ message: 'حدث خطأ أثناء الجدولة' }, { status: 500 });
    }
}
