import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import db from '@/lib/db';

export async function GET(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
        }

        const sessions = db.prepare(`
            SELECT l.*, s.name as student_name, s.email as student_email, s.avatar as student_avatar
            FROM live_sessions l
            LEFT JOIN users s ON l.student_id = s.id
            WHERE l.teacher_id = ?
            ORDER BY l.scheduled_at ASC
        `).all(user.id) as any[];

        const upcoming = sessions.filter(s => s.status === 'scheduled');
        const active = sessions.filter(s => s.status === 'active');
        const completed = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled');

        return NextResponse.json({
            upcoming,
            active,
            completed,
            totalSessions: sessions.length
        });
    } catch (error) {
        console.error('API /instructor/sessions Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
