import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        // Fetch sessions joining the teacher and student details natively!
        const rows = db.prepare(`
            SELECT 
                ls.id, ls.title, ls.session_type, ls.status, ls.scheduled_at, ls.meet_link, ls.started_at, ls.ended_at,
                t.name as instructor_name, t.email as instructor_email,
                s.name as student_name, s.email as student_email
            FROM live_sessions ls
            LEFT JOIN users t ON ls.teacher_id = t.id
            LEFT JOIN users s ON ls.student_id = s.id
            ORDER BY ls.scheduled_at DESC
            LIMIT 500
        `).all();

        return NextResponse.json({ sessions: rows });
    } catch (error: any) {
        return NextResponse.json({ message: "Server error", detail: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { action, session_id } = body;

        if (!action || !session_id) {
            return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
        }

        if (action === 'cancel') {
            db.prepare('UPDATE live_sessions SET status = "cancelled" WHERE id = ?').run(session_id);
            return NextResponse.json({ message: 'Session Cancelled' });
        }

        return NextResponse.json({ message: 'Action not mapped' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ message: "Server error", detail: error.message }, { status: 500 });
    }
}
