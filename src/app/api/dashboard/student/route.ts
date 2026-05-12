import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const userId = payload.id;

        // Fetch user points
        const userRecord = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as any;

        // Fetch achievements (unify with badges for UI)
        const achievements = db.prepare(`
            SELECT a.id, a.title_ar, a.icon, 'achievement' as type, ua.earned_at
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
            UNION ALL
            SELECT b.id, b.name_ar as title_ar, b.icon, 'badge' as type, ub.awarded_at as earned_at
            FROM user_badges ub
            JOIN badges b ON ub.badge_id = b.id
            WHERE ub.user_id = ?
            ORDER BY earned_at DESC
        `).all(userId, userId);

        // Fetch lab completions
        const labCompletions = db.prepare(`
            SELECT lc.*, l.title_ar, l.xp
            FROM lab_completions lc
            JOIN labs l ON lc.lab_id = l.id
            WHERE lc.user_id = ?
            ORDER BY lc.completed_at DESC
        `).all(userId);

        // Fetch enrolled courses
        const enrolledCourses = db.prepare(`
            SELECT c.id, c.title_ar, c.image, c.lessons, ce.progress, ce.completed, ce.enrolled_at
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            WHERE ce.user_id = ?
            ORDER BY ce.enrolled_at DESC
        `).all(userId);

        // Fetch certificates
        const certificates = db.prepare(`
            SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC
        `).all(userId);

        // Calculate stats
        const stats = {
            enrolled: enrolledCourses.length,
            completed: enrolledCourses.filter((c: any) => c.completed === 1).length,
            certificates: certificates.length,
            labsCompleted: labCompletions.length,
            points: userRecord?.points || 0,
        };

        return NextResponse.json({
            authenticated: true,
            stats,
            badges: achievements, // Overwrite with unified list
            enrolledCourses,
            certificates,
            labCompletions
        });
    } catch (error) {
        console.error('Student Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
