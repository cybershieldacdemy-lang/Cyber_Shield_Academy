import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(_req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload || !payload.id || (payload.role !== 'teacher' && payload.role !== 'admin')) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const teacherId = payload.id;

        // Fetch lesson comments
        let query = `
            SELECT 
                lc.id, 
                lc.content, 
                lc.is_teacher_reply, 
                lc.created_at,
                lc.lesson_id,
                u.name as user_name, 
                u.avatar as user_avatar,
                cl.title as lesson_title,
                c.title_ar as course_title,
                c.id as course_id
            FROM lesson_comments lc
            JOIN users u ON lc.user_id = u.id
            JOIN course_lessons cl ON lc.lesson_id = cl.id
            JOIN courses c ON cl.course_id = c.id
        `;
        const params: any[] = [];

        if (payload.role === 'teacher') {
            query += ' WHERE c.instructor = ?';
            params.push(teacherId);
        }

        query += ' ORDER BY lc.created_at DESC';

        const discussions = db.prepare(query).all(...params);

        return NextResponse.json({ discussions });
    } catch (error) {
        console.error('Teacher Discussions GET error:', error);
        return NextResponse.json({ message: 'خطأ في جلب النقاشات' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload || !payload.id || (payload.role !== 'teacher' && payload.role !== 'admin')) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
        }

        const body = await req.json();
        const { lesson_id, content } = body;

        if (!lesson_id || !content) {
            return NextResponse.json({ message: 'بيانات غير مكتملة' }, { status: 400 });
        }

        // Verify teacher owns the course of this lesson
        if (payload.role === 'teacher') {
            const course = db.prepare(`
                SELECT c.instructor 
                FROM course_lessons cl 
                JOIN courses c ON cl.course_id = c.id 
                WHERE cl.id = ?
            `).get(lesson_id) as any;

            if (!course || course.instructor !== payload.id) {
                return NextResponse.json({ message: 'لا تملك صلاحية الرد على هذا الدرس' }, { status: 403 });
            }
        }

        const result = db.prepare(`
            INSERT INTO lesson_comments (lesson_id, user_id, content, is_teacher_reply)
            VALUES (?, ?, ?, 1)
        `).run(lesson_id, payload.id, content);

        return NextResponse.json({ message: 'تم إضافة الرد بنجاح', id: result.lastInsertRowid }, { status: 201 });
    } catch (error) {
        console.error('Teacher Discussions POST error:', error);
        return NextResponse.json({ message: 'خطأ في إضافة الرد' }, { status: 500 });
    }
}
