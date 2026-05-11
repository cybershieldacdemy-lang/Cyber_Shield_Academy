import { NextResponse } from 'next/server';
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

        let query = `
            SELECT 
                ce.id, 
                ce.progress, 
                ce.completed, 
                ce.enrolled_at,
                u.name as student_name, 
                u.email as student_email, 
                u.avatar as student_avatar,
                c.title_ar as course_title,
                c.id as course_id
            FROM course_enrollments ce
            JOIN users u ON ce.user_id = u.id
            JOIN courses c ON ce.course_id = c.id
        `;
        const params: any[] = [];

        if (payload.role === 'teacher') {
            query += ' WHERE c.instructor = ?';
            params.push(teacherId);
        }

        query += ' ORDER BY ce.enrolled_at DESC';

        const students = db.prepare(query).all(...params);

        return NextResponse.json({ students });
    } catch (error) {
        console.error('Teacher Students GET error:', error);
        return NextResponse.json({ message: 'خطأ في جلب بيانات الطلاب' }, { status: 500 });
    }
}
