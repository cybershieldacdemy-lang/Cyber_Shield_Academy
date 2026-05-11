import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(_req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        
        const payload = verifyToken(token);
        if (!payload || !payload.id) return NextResponse.json({ message: 'جلسة غير صالحة' }, { status: 401 });
        
        const user = db.prepare('SELECT role FROM users WHERE id = ?').get(payload.id) as { role: string };
        if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
            return NextResponse.json({ message: 'غير مصرح لك بالدخول' }, { status: 403 });
        }

        // For now, assume this teacher sees all courses if they are admin, or only theirs if teacher.
        // Actually, our current schema doesn't link `courses.instructor_id` to `users.id` directly (instructor is just a text field).
        // Let's assume for this MVP that teachers can manage all courses or we can just show global stats.
        // To be safe, let's just show global stats and list of courses.
        
        const coursesCount = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number };
        const studentsCount = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM course_enrollments').get() as { count: number };
        const commentsCount = db.prepare('SELECT COUNT(*) as count FROM lesson_comments').get() as { count: number };

        return NextResponse.json({
            coursesCount: coursesCount.count,
            studentsCount: studentsCount.count,
            commentsCount: commentsCount.count
        });

    } catch (error) {
        console.error('Teacher stats GET error:', error);
        return NextResponse.json({ message: 'خطأ' }, { status: 500 });
    }
}
