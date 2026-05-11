import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/api-guard';
import { createGoogleMeetEvent } from '@/lib/google-meet';

export async function POST(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { session_id } = body;

        if (!session_id) {
            return NextResponse.json({ message: 'Missing session_id' }, { status: 400 });
        }

        const session = db.prepare('SELECT title, scheduled_at, teacher_id, student_id FROM live_sessions WHERE id = ?').get(session_id) as any;
        if (!session) {
            return NextResponse.json({ message: 'Session not found' }, { status: 404 });
        }

        const instructor = db.prepare('SELECT email, google_refresh_token FROM users WHERE id = ?').get(session.teacher_id) as any;
        const student = db.prepare('SELECT email FROM users WHERE id = ?').get(session.student_id) as any;

        if (!instructor?.google_refresh_token) {
            return NextResponse.json({ message: 'Instructor has not linked Google Calendar!' }, { status: 400 });
        }

        const emails = [instructor.email];
        if (student?.email) emails.push(student.email);

        const newEvent = await createGoogleMeetEvent(
            instructor.google_refresh_token, 
            session.title + ' [REGENERATED]', 
            session.scheduled_at, 
            60, 
            emails
        );

        if (!newEvent || !newEvent.meetLink) {
            return NextResponse.json({ message: 'Failed to regenerate Google Meet link via APIs. Check Server Logs.' }, { status: 500 });
        }

        // Apply new link safely into the database
        db.prepare('UPDATE live_sessions SET meet_link = ? WHERE id = ?').run(newEvent.meetLink, session_id);

        return NextResponse.json({ message: 'Link Regenerated Successfully', meet_link: newEvent.meetLink });
    } catch (error: any) {
        return NextResponse.json({ message: "Server error", detail: error.message }, { status: 500 });
    }
}
