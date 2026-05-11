import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-guard';
import db from '@/lib/db';
import crypto from 'crypto';
import { createGoogleMeetEvent } from '@/lib/google-meet';
import { sendMeetingEmail } from '@/lib/mailer';

export async function POST(req: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ message: 'يجب تسجيل الدخول لحجز الجلسة' }, { status: 401 });
        }

        const body = await req.json();
        const { teacher_id, title, session_type, scheduled_at } = body;

        if (!teacher_id || !title || !session_type || !scheduled_at) {
            return NextResponse.json({ message: 'البيانات غير مكتملة' }, { status: 400 });
        }

        // Prevent double booking for the teacher at the exact same hour
        const requestedTime = new Date(scheduled_at).getTime();
        const bufferWindow = 60 * 60 * 1000; // 1 hour buffer

        const existingSessions = db.prepare('SELECT scheduled_at FROM live_sessions WHERE teacher_id = ? AND status IN ("scheduled", "active")').all(teacher_id) as any[];
        
        for (const session of existingSessions) {
            const bookedTime = new Date(session.scheduled_at).getTime();
            if (Math.abs(bookedTime - requestedTime) < bufferWindow) {
                return NextResponse.json({ message: 'عذراً، المدرّب لديه جلسة أخرى في هذا التوقيت.' }, { status: 409 });
            }
        }

        // Fetch Instructor Details to add to the Google Meet Event
        const instructor = db.prepare('SELECT name, email, google_refresh_token FROM users WHERE id = ?').get(teacher_id) as any;
        if (!instructor) {
            return NextResponse.json({ message: 'المدرّب غير موجود' }, { status: 404 });
        }

        if (!instructor.google_refresh_token) {
            return NextResponse.json({ message: 'نأسف، المدرّب لم يقم بربط حسابه في تقويم جوجل حتى الآن، لا يمكن إتمام الحجز أوتوماتيكياً.' }, { status: 400 });
        }

        // Generate Google Meet Link natively mapping securely to the Instructor's token!
        // We will pass the student and instructor emails to generate the private event bounds
        const gcEvent = await createGoogleMeetEvent(instructor.google_refresh_token, title, scheduled_at, 60, [user.email, instructor.email]);
        
        if (!gcEvent) {
             return NextResponse.json({ message: 'حدث خطأ أثناء الاتصال باجتماعات جوجل، لم يتم الحجز' }, { status: 500 });
        }

        // Create Session in internal DB capturing the extracted Google Meet link
        const sessionId = crypto.randomUUID();

        db.prepare(`
            INSERT INTO live_sessions (id, title, teacher_id, student_id, session_type, scheduled_at, status, meet_link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(sessionId, title, teacher_id, user.id, session_type, scheduled_at, 'scheduled', gcEvent.meetLink);

        // Dispatch Email notifications seamlessly using Nodemailer
        await sendMeetingEmail(user.email, 'student', {
            studentName: user.name as string, instructorName: instructor.name as string,
            sessionTitle: title, scheduledAt: scheduled_at, meetLink: gcEvent.meetLink
        });
        
        await sendMeetingEmail(instructor.email, 'instructor', {
            studentName: user.name as string, instructorName: instructor.name as string,
            sessionTitle: title, scheduledAt: scheduled_at, meetLink: gcEvent.meetLink
        });

        // Emit Platform Notification to the Teacher
        const notifId = crypto.randomUUID();
        db.prepare(`
            INSERT INTO notifications (id, user_id, type, title, message, link)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            notifId, teacher_id, 'booking', '📅 طلب جلسة توجيه جديدة', 
            `قام الطالب ${user.name} بحجز جلسة (${session_type}) معك. تم توليد رابط Google Meet وتم إرساله إلى إيميلك.`,
            `/dashboard/instructor`
        );

        return NextResponse.json({ message: 'تم حجز الجلسة بنجاح وإنشاء رابط جوجل ميت', sessionId, meetLink: gcEvent.meetLink }, { status: 201 });

    } catch (error: any) {
        console.error('Session Booking Error:', error);
        return NextResponse.json({ message: 'مشكلة في خادم قواعد البيانات' }, { status: 500 });
    }
}
