import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import db from '@/lib/db';

export async function GET(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        // Fetch distinct students associated with this instructor's live sessions
        // Expandable later: course enrollments if there's a course_enrollments table
        const students = db.prepare(`
            SELECT DISTINCT s.id, s.name, s.email, s.experience_level, s.points, s.avatar,
                   (SELECT COUNT(*) FROM live_sessions l2 WHERE l2.student_id = s.id AND l2.teacher_id = ?) as sessions_taken,
                   (SELECT MAX(ended_at) FROM live_sessions l3 WHERE l3.student_id = s.id AND l3.teacher_id = ?) as last_session
            FROM live_sessions l
            JOIN users s ON l.student_id = s.id
            WHERE l.teacher_id = ?
        `).all(user.id, user.id, user.id) as any[];

        return NextResponse.json({
            students
        });
    } catch (error) {
        console.error('API /instructor/students Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
